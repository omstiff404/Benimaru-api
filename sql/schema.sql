-- Benimaru API — Aiven PostgreSQL schema
-- Jalankan sekali di Aiven console / psql

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_tracks (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT 'Untitled',
  artist      TEXT DEFAULT '',
  url         TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_files (
  id          SERIAL PRIMARY KEY,
  kind        TEXT NOT NULL,          -- avatar | video | music
  filename    TEXT,
  mime        TEXT NOT NULL,
  data        BYTEA NOT NULL,         -- binary file
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- default settings
INSERT INTO site_settings (key, value) VALUES
  ('avatar_url', '/avatar.jpg'),
  ('video_url', ''),
  ('site_name', 'Benimaru'),
  ('site_sub', 'API')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_music_sort ON music_tracks (sort_order, id);
CREATE INDEX IF NOT EXISTS idx_media_kind ON media_files (kind);
