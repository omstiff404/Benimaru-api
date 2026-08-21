import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MUSIC_DIR = path.join(__dirname, '..', 'public', 'music');
const AUDIO_EXT = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.aac', '.flac', '.opus', '.webm']);

function listMusicFiles() {
  try {
    if (!fs.existsSync(MUSIC_DIR)) return [];
    return fs
      .readdirSync(MUSIC_DIR)
      .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map((f) => {
        const base = path.basename(f, path.extname(f));
        return {
          title: base.replace(/[_-]+/g, ' ').trim() || f,
          artist: '',
          url: '/music/' + encodeURIComponent(f),
          file: 'music/' + f,
        };
      });
  } catch {
    return [];
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(listMusicFiles());
}
