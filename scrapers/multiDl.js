/**
 * Stable multi-downloader (tikwm, public APIs) — no axios needed
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function abs(url, base = 'https://www.tikwm.com') {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return base + url;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

function normalize(raw, platform) {
  if (!raw) return null;
  if (raw.result) return normalize(raw.result, platform);
  if (raw.data && (raw.data.play || raw.data.media || raw.data.hdplay || raw.data.video)) return normalize(raw.data, platform);

  const media = [];
  const push = (u, type = 'video') => {
    const url = abs(u);
    if (url) media.push({ type, url });
  };

  if (Array.isArray(raw.media)) raw.media.forEach((m) => push(m.url || m, m.type || 'video'));
  if (Array.isArray(raw.downloads)) raw.downloads.forEach((m) => push(m.url || m.link, /audio|mp3/i.test(m.type) ? 'audio' : 'video'));
  if (Array.isArray(raw.images)) raw.images.forEach((u) => push(typeof u === 'string' ? u : u.url, 'image'));
  if (typeof raw.video === 'string') push(raw.video, 'video');
  if (raw.video?.url) push(raw.video.url, 'video');
  if (raw.play) push(raw.play, 'video');
  if (raw.hdplay) push(raw.hdplay, 'video');
  if (raw.wmplay) push(raw.wmplay, 'video');
  if (typeof raw.audio === 'string') push(raw.audio, 'audio');
  if (typeof raw.music === 'string') push(raw.music, 'audio');
  if (typeof raw.url === 'string') push(raw.url, 'video');
  if (typeof raw.download === 'string') push(raw.download);

  if (!media.length) return null;
  const seen = new Set();
  const unique = media.filter((m) => (seen.has(m.url) ? false : (seen.add(m.url), true)));

  let thumb = raw.cover || raw.thumbnail || raw.thumb || raw.origin_cover || null;
  if (thumb && thumb.startsWith('/')) thumb = 'https://www.tikwm.com' + thumb;

  return {
    platform,
    title: raw.title || raw.desc || raw.description || '',
    author:
      raw.author?.nickname || raw.author?.username || raw.author?.unique_id ||
      (typeof raw.author === 'string' ? raw.author : '') || raw.nickname || '',
    thumbnail: thumb,
    media: unique,
  };
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(28000),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function postForm(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...headers,
    },
    body: new URLSearchParams(body).toString(),
    signal: AbortSignal.timeout(28000),
  });
  return res.json();
}

export async function multiTiktok(url) {
  const errors = [];
  try {
    const data = await postForm(
      'https://www.tikwm.com/api/',
      { url, hd: '1', web: '1', count: '12' },
      { Origin: 'https://www.tikwm.com', Referer: 'https://www.tikwm.com/' }
    );
    const n = normalize(data?.data || data, 'tiktok');
    if (n) return n;
    errors.push(data?.msg || 'tikwm empty');
  } catch (e) {
    errors.push('tikwm: ' + e.message);
  }
  for (const ep of [
    'https://api.siputzx.my.id/api/d/tiktok?url=' + encodeURIComponent(url),
  ]) {
    try {
      const n = normalize(await getJson(ep), 'tiktok');
      if (n) return n;
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error('TikTok gagal — ' + errors.slice(0, 2).join(' | '));
}

export async function multiInstagram(url) {
  const errors = [];
  for (const ep of [
    'https://api.siputzx.my.id/api/d/igdl?url=' + encodeURIComponent(url),
    'https://api.vreden.my.id/api/igdownload?url=' + encodeURIComponent(url),
  ]) {
    try {
      const n = normalize(await getJson(ep), 'instagram');
      if (n) return n;
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error('Instagram gagal — ' + errors.slice(0, 2).join(' | '));
}

export async function multiTwitter(url) {
  const m = String(url).match(/status\/(\d+)/);
  if (!m) throw new Error('URL harus berisi /status/ID');
  const id = m[1];
  for (const base of [`https://api.fxtwitter.com/status/${id}`, `https://api.vxtwitter.com/status/${id}`]) {
    try {
      const data = await getJson(base);
      const tweet = data?.tweet || data;
      if (!tweet || data?.code === 404) continue;
      const media = [];
      (tweet.media?.all || tweet.media?.videos || []).forEach((v) => v?.url && media.push({ type: 'video', url: v.url }));
      (tweet.media?.photos || []).forEach((p) => {
        const u = p.url || p;
        if (u) media.push({ type: 'image', url: u });
      });
      if (tweet.video?.url) media.push({ type: 'video', url: tweet.video.url });
      if (media.length) {
        return {
          platform: 'twitter',
          title: tweet.text || '',
          author: tweet.author?.screen_name || '',
          media,
          thumbnail: media[0]?.url,
        };
      }
    } catch {
      continue;
    }
  }
  throw new Error('Twitter/X gagal');
}

export async function multiFacebook(url) {
  for (const ep of [
    'https://api.siputzx.my.id/api/d/facebook?url=' + encodeURIComponent(url),
  ]) {
    try {
      const n = normalize(await getJson(ep), 'facebook');
      if (n) return n;
    } catch {}
  }
  throw new Error('Facebook gagal');
}

export function toApiResponse(n) {
  if (!n) return { status: false, error: 'Empty' };
  const download = {};
  const videos = (n.media || []).filter((m) => m.type === 'video' || m.type === 'mp4');
  const audios = (n.media || []).filter((m) => m.type === 'audio' || m.type === 'mp3');
  const images = (n.media || []).filter((m) => m.type === 'image' || m.type === 'photo');
  if (videos.length) {
    const hd = videos.find((v) => /hdplay|1080|720/i.test(v.url)) || videos[0];
    download.video = hd.url;
    download.no_watermark = hd.url;
    videos.forEach((v, i) => {
      if (v.url !== hd.url) download['video_' + (i + 1)] = v.url;
    });
  }
  if (audios.length) download.audio = audios[0].url;
  images.forEach((im, i) => {
    download[i === 0 ? 'image' : 'image_' + (i + 1)] = im.url;
  });
  if (!Object.keys(download).length && n.media?.[0]) download.media = n.media[0].url;
  return {
    status: true,
    platform: n.platform,
    title: n.title,
    author: n.author,
    thumbnail: n.thumbnail,
    download,
    media: n.media,
  };
}
