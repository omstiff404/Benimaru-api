import { spawn } from 'child_process';
import fs from 'fs';

function findYtDlp() {
  for (const c of ['/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp', 'yt-dlp']) {
    if (c === 'yt-dlp') return c;
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return 'yt-dlp';
}
const YTDLP = findYtDlp();

function runYtDlp(args, timeoutMs = 50000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args, {
      env: { ...process.env, PYTHONUNBUFFERED: '1', PATH: '/usr/local/bin:/usr/bin:/bin:' + (process.env.PATH || '') },
    });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => (stdout += d));
    proc.stderr.on('data', (d) => (stderr += d));
    const t = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('yt-dlp timeout')); }, timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(t);
      if (code === 0 || stdout.trim()) resolve({ stdout: stdout.trim(), stderr, code });
      else reject(new Error(stderr.slice(0, 250) || 'yt-dlp exit ' + code));
    });
    proc.on('error', (e) => { clearTimeout(t); reject(e); });
  });
}

export async function getMediaInfo(mediaUrl, preferAudio = false) {
  const args = ['--dump-json', '--no-playlist', '--no-warnings', '--socket-timeout', '25', mediaUrl];
  if (preferAudio) args.push('-f', 'bestaudio/best');
  const { stdout } = await runYtDlp(args);
  const info = JSON.parse(stdout);
  const formats = info.formats || [];
  const result = {
    status: true,
    platform: (info.extractor_key || info.extractor || 'unknown').toLowerCase(),
    title: info.title || info.fulltitle || 'Unknown',
    author: info.uploader || info.channel || info.creator || null,
    thumbnail: info.thumbnail || info.thumbnails?.slice(-1)[0]?.url || null,
    duration: info.duration || null,
    url: mediaUrl,
    download: {},
  };
  const videos = formats.filter((f) => f.vcodec && f.vcodec !== 'none' && f.url).sort((a, b) => (b.height || 0) - (a.height || 0));
  if (videos.length) {
    result.download.video = videos[0].url;
    if (videos[0].height) result.download['video_' + videos[0].height + 'p'] = videos[0].url;
    const f720 = videos.find((f) => f.height >= 480 && f.height <= 720);
    const f360 = videos.find((f) => f.height && f.height <= 400);
    if (f720) result.download['720p'] = f720.url;
    if (f360) result.download['360p'] = f360.url;
  }
  const audios = formats.filter((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && f.url).sort((a, b) => (b.abr || 0) - (a.abr || 0));
  if (audios.length) result.download.audio = audios[0].url;
  if (info.url && !result.download.video && !result.download.audio) result.download.media = info.url;
  if (/tiktok/i.test(info.extractor || '') && result.download.video) result.download.no_watermark = result.download.video;
  return result;
}
