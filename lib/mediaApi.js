/**
 * Shared media/admin handlers — dipakai server.js (local) & Vercel api/*
 */
import {
  ensureSchema,
  getAllSettings,
  setSetting,
  listMusic,
  addMusic,
  deleteMusic,
  updateMusic,
  saveMediaFile,
  getMediaFile,
} from './db.js';
import { checkPassword, createToken, requireAdmin } from './auth.js';

const MAX_AVATAR = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO = 50 * 1024 * 1024;   // 50 MB (Aiven plan dependent)
const MAX_AUDIO = 15 * 1024 * 1024;   // 15 MB

function json(res, code, data) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const limit = 55 * 1024 * 1024;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('Body terlalu besar'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      const ct = (req.headers['content-type'] || '').toLowerCase();
      if (ct.includes('application/json')) {
        try {
          resolve(buf.length ? JSON.parse(buf.toString('utf8')) : {});
        } catch {
          reject(new Error('JSON tidak valid'));
        }
      } else {
        resolve({ _raw: buf, _ct: ct });
      }
    });
    req.on('error', reject);
  });
}

/** Public: avatar, video, playlist */
export async function handlePublicMedia(req, res) {
  try {
    await ensureSchema();
    const settings = await getAllSettings();
    const music = await listMusic();
    json(res, 200, {
      status: true,
      avatar_url: settings.avatar_url || '/avatar.jpg',
      video_url: settings.video_url || '',
      site_name: settings.site_name || 'Benimaru',
      site_sub: settings.site_sub || 'API',
      music: music.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        url: t.url,
      })),
    });
  } catch (e) {
    json(res, 200, {
      status: true,
      avatar_url: '/avatar.jpg',
      video_url: '',
      site_name: 'Benimaru',
      site_sub: 'API',
      music: [],
      _note: 'DB offline — fallback lokal',
      error: e.message,
    });
  }
}

/** Serve binary from media_files */
export async function handleFile(req, res, id) {
  try {
    const row = await getMediaFile(Number(id));
    if (!row) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', row.mime || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (row.filename) {
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${String(row.filename).replace(/"/g, '')}"`
      );
    }
    res.end(row.data);
  } catch (e) {
    res.statusCode = 500;
    res.end(e.message);
  }
}

export async function handleAdminLogin(req, res) {
  if (req.method === 'OPTIONS') {
    return json(res, 204, {});
  }
  try {
    const body = await parseBody(req);
    if (!checkPassword(body.password)) {
      return json(res, 401, { status: false, error: 'Password salah' });
    }
    const token = createToken();
    json(res, 200, { status: true, token, expires_in: 7 * 24 * 3600 });
  } catch (e) {
    json(res, 400, { status: false, error: e.message });
  }
}

export async function handleAdminSettings(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!requireAdmin(req)) return json(res, 401, { status: false, error: 'Unauthorized' });
  try {
    await ensureSchema();
    if (req.method === 'GET') {
      const settings = await getAllSettings();
      const music = await listMusic();
      return json(res, 200, { status: true, settings, music });
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await parseBody(req);
      const allowed = ['avatar_url', 'video_url', 'site_name', 'site_sub'];
      for (const k of allowed) {
        if (body[k] !== undefined) await setSetting(k, body[k]);
      }
      return json(res, 200, { status: true, message: 'Settings disimpan' });
    }
    json(res, 405, { status: false, error: 'Method not allowed' });
  } catch (e) {
    json(res, 500, { status: false, error: e.message });
  }
}

export async function handleAdminMusic(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!requireAdmin(req)) return json(res, 401, { status: false, error: 'Unauthorized' });
  try {
    await ensureSchema();
    if (req.method === 'GET') {
      return json(res, 200, { status: true, music: await listMusic() });
    }
    if (req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.url) return json(res, 400, { status: false, error: 'url wajib' });
      const row = await addMusic(body);
      return json(res, 200, { status: true, track: row });
    }
    if (req.method === 'PUT') {
      const body = await parseBody(req);
      if (!body.id) return json(res, 400, { status: false, error: 'id wajib' });
      const row = await updateMusic(body.id, body);
      return json(res, 200, { status: true, track: row });
    }
    if (req.method === 'DELETE') {
      const body = await parseBody(req);
      if (!body.id) return json(res, 400, { status: false, error: 'id wajib' });
      await deleteMusic(body.id);
      return json(res, 200, { status: true, message: 'Dihapus' });
    }
    json(res, 405, { status: false, error: 'Method not allowed' });
  } catch (e) {
    json(res, 500, { status: false, error: e.message });
  }
}

/**
 * Upload: JSON { kind: 'avatar'|'video'|'music', filename, mime, data: base64 }
 * atau multipart sederhana via base64 (paling stabil di serverless)
 */
export async function handleAdminUpload(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!requireAdmin(req)) return json(res, 401, { status: false, error: 'Unauthorized' });
  try {
    await ensureSchema();
    const body = await parseBody(req);
    const kind = String(body.kind || '').toLowerCase();
    if (!['avatar', 'video', 'music'].includes(kind)) {
      return json(res, 400, { status: false, error: 'kind harus avatar|video|music' });
    }
    if (!body.data) {
      return json(res, 400, { status: false, error: 'data (base64) wajib' });
    }
    let b64 = String(body.data);
    if (b64.includes(',')) b64 = b64.split(',')[1];
    const buffer = Buffer.from(b64, 'base64');
    const limits = { avatar: MAX_AVATAR, video: MAX_VIDEO, music: MAX_AUDIO };
    if (buffer.length > limits[kind]) {
      return json(res, 400, {
        status: false,
        error: `File terlalu besar (max ${Math.round(limits[kind] / 1024 / 1024)}MB untuk ${kind})`,
      });
    }
    const mime =
      body.mime ||
      (kind === 'avatar'
        ? 'image/jpeg'
        : kind === 'video'
          ? 'video/mp4'
          : 'audio/mpeg');
    const id = await saveMediaFile(kind, body.filename || null, mime, buffer);
    const publicUrl = `/api/file/${id}`;

    if (kind === 'avatar') await setSetting('avatar_url', publicUrl);
    if (kind === 'video') await setSetting('video_url', publicUrl);

    let track = null;
    if (kind === 'music') {
      track = await addMusic({
        title: body.title || body.filename || 'Track',
        artist: body.artist || '',
        url: publicUrl,
        sort_order: body.sort_order ?? 0,
      });
    }

    json(res, 200, {
      status: true,
      url: publicUrl,
      id,
      track,
      size: buffer.length,
    });
  } catch (e) {
    json(res, 500, { status: false, error: e.message });
  }
}
