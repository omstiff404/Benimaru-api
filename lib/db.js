/**
 * Aiven PostgreSQL helper
 * Config: config.js → DATABASE_URL
 */
import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  const url =
    config.DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    '';
  if (!url || url.includes('PASSWORD@HOST')) {
    throw new Error(
      'DATABASE_URL belum diisi di config.js (Aiven connection string)'
    );
  }
  pool = new Pool({
    connectionString: url,
    ssl:
      url.includes('sslmode=require') || url.includes('aiven')
        ? { rejectUnauthorized: false }
        : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

export async function getSetting(key, fallback = '') {
  try {
    const r = await query('SELECT value FROM site_settings WHERE key = $1', [
      key,
    ]);
    return r.rows[0]?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key, value) {
  await query(
    `INSERT INTO site_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, String(value ?? '')]
  );
}

export async function getAllSettings() {
  try {
    const r = await query('SELECT key, value FROM site_settings');
    const out = {};
    for (const row of r.rows) out[row.key] = row.value;
    return out;
  } catch {
    return {};
  }
}

export async function listMusic() {
  try {
    const r = await query(
      'SELECT id, title, artist, url, sort_order FROM music_tracks ORDER BY sort_order ASC, id ASC'
    );
    return r.rows;
  } catch {
    return [];
  }
}

export async function addMusic({ title, artist, url, sort_order }) {
  const r = await query(
    `INSERT INTO music_tracks (title, artist, url, sort_order)
     VALUES ($1, $2, $3, COALESCE($4, 0))
     RETURNING id, title, artist, url, sort_order`,
    [title || 'Untitled', artist || '', url, sort_order ?? 0]
  );
  return r.rows[0];
}

export async function deleteMusic(id) {
  await query('DELETE FROM music_tracks WHERE id = $1', [id]);
}

export async function updateMusic(id, fields) {
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(fields)) {
    if (!['title', 'artist', 'url', 'sort_order'].includes(k)) continue;
    sets.push(`${k} = $${i++}`);
    vals.push(v);
  }
  if (!sets.length) return null;
  vals.push(id);
  const r = await query(
    `UPDATE music_tracks SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    vals
  );
  return r.rows[0] || null;
}

/** Simpan file binary ke media_files, return public path /api/file/:id */
export async function saveMediaFile(kind, filename, mime, buffer) {
  const r = await query(
    `INSERT INTO media_files (kind, filename, mime, data)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [kind, filename || null, mime, buffer]
  );
  return r.rows[0].id;
}

export async function getMediaFile(id) {
  const r = await query(
    'SELECT id, kind, filename, mime, data FROM media_files WHERE id = $1',
    [id]
  );
  return r.rows[0] || null;
}

export async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS music_tracks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled',
      artist TEXT DEFAULT '',
      url TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS media_files (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      filename TEXT,
      mime TEXT NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query(`
    INSERT INTO site_settings (key, value) VALUES
      ('avatar_url', '/avatar.jpg'),
      ('video_url', ''),
      ('site_name', 'Benimaru'),
      ('site_sub', 'API')
    ON CONFLICT (key) DO NOTHING
  `);
}
