/**
 * Benimaru API v2.4 — stable scrapers only + new reliable tools
 */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import {
  multiTiktok, multiInstagram, multiTwitter, multiFacebook, toApiResponse,
} from './scrapers/multiDl.js';
import { getMediaInfo } from './scrapers/ytdlp.js';
import * as tools from './scrapers/tools.js';
import {
  handlePublicMedia,
  handleFile,
  handleAdminLogin,
  handleAdminSettings,
  handleAdminMusic,
  handleAdminUpload,
} from './lib/mediaApi.js';
import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = config.PORT || process.env.PORT || 3000;
const STATIC = path.join(__dirname, 'public');

/** AM Account (Prem / Verif) — upstream: api.nexadev.my.id */
const AM_API_KEY = config.AM_API_KEY || process.env.AM_API_KEY || 'RS-9J^q$1gF';

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function amSendUrl(email) {
  return (
    'https://api.nexadev.my.id/am/send/?key=' +
    encodeURIComponent(AM_API_KEY) +
    '&email=' +
    encodeURIComponent(email)
  );
}

function amVerifUrl(email, link) {
  return (
    'https://api.nexadev.my.id/am/verif/?key=' +
    encodeURIComponent(AM_API_KEY) +
    '&email=' +
    encodeURIComponent(email) +
    '&link=' +
    encodeURIComponent(link)
  );
}

async function fetchAmApi(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: false, error: 'Invalid JSON from upstream', raw: text.slice(0, 300) };
    }
  } finally {
    clearTimeout(timer);
  }
}

function formatAmResult(data, email) {
  if (!data || typeof data !== 'object') {
    return {
      status: false,
      message: 'Respons API tidak valid',
      raw: String(data).slice(0, 200),
      email: email || undefined,
    };
  }
  const ok = data.status === true || data.status === 'true';
  return {
    status: ok,
    message: data.message || data.error || data.msg || (ok ? 'Berhasil' : 'Gagal'),
    email: email || undefined,
    limit_remaining: data.limit_remaining != null ? data.limit_remaining : undefined,
    response_time: data.response_time || undefined,
    ...(ok ? {} : { error: data.error || data.message || data.msg }),
  };
}

async function handleAmPrem(query) {
  const email = String(query.email || query.q || '').trim().toLowerCase();
  if (!email || !isEmail(email)) {
    return {
      status: false,
      error: 'Parameter email wajib dan harus valid',
      example: '/api/amprem?email=user@gmail.com',
    };
  }
  try {
    const data = await fetchAmApi(amSendUrl(email));
    return formatAmResult(data, email);
  } catch (e) {
    return {
      status: false,
      error: e.name === 'AbortError' ? 'Timeout upstream (90s)' : e.message || String(e),
      email,
    };
  }
}

async function handleAmVerif(query) {
  const email = String(query.email || '').trim().toLowerCase();
  const link = String(query.link || query.url || query.q || '').trim();
  if (!email || !isEmail(email)) {
    return {
      status: false,
      error: 'Parameter email wajib dan harus valid',
      example: '/api/amverif?email=user@gmail.com&link=https://...',
    };
  }
  if (!link) {
    return {
      status: false,
      error: 'Parameter link (link verifikasi) wajib',
      example: '/api/amverif?email=user@gmail.com&link=https://...',
    };
  }
  try {
    const data = await fetchAmApi(amVerifUrl(email, link));
    return formatAmResult(data, email);
  } catch (e) {
    return {
      status: false,
      error: e.name === 'AbortError' ? 'Timeout upstream (90s)' : e.message || String(e),
      email,
    };
  }
}

function sendJSON(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, null, 2));
}

function parse(urlStr) {
  try {
    const u = new URL(urlStr, 'http://localhost');
    const q = {};
    u.searchParams.forEach((v, k) => (q[k] = v));
    return { pathname: u.pathname, query: q };
  } catch {
    return { pathname: '/', query: {} };
  }
}

async function withYtdlp(fn, url, platform, preferAudio = false) {
  try {
    const r = await fn();
    if (r?.status !== false) return r;
    throw new Error(r?.error || 'empty');
  } catch (e1) {
    try {
      const data = await getMediaInfo(url, preferAudio);
      if (platform) data.platform = platform;
      return data;
    } catch (e2) {
      return { status: false, platform, error: e1.message + ' | ' + String(e2.message).slice(0, 80) };
    }
  }
}

async function handle(platform, query) {
  const url = (query.url || query.q || query.text || '').trim();
  const type = (query.type || '').toLowerCase();
  const p = (platform || 'aio').toLowerCase();

  try {
    let result;
    switch (p) {
      case 'tiktok':
      case 'snaptik':
        result = await withYtdlp(async () => toApiResponse(await multiTiktok(url)), url, 'tiktok');
        break;
      case 'instagram':
        result = await withYtdlp(async () => toApiResponse(await multiInstagram(url)), url, 'instagram');
        break;
      case 'twitter':
      case 'x':
        result = await withYtdlp(async () => toApiResponse(await multiTwitter(url)), url, 'twitter');
        break;
      case 'facebook':
        result = await withYtdlp(async () => toApiResponse(await multiFacebook(url)), url, 'facebook');
        break;
      case 'youtube':
      case 'reddit':
      case 'soundcloud':
      case 'pinterest':
      case 'capcut':
      case 'dailymotion':
        if (!url) result = { status: false, error: 'url required' };
        else result = await getMediaInfo(url, type === 'audio');
        break;
      case 'aio':
      case 'auto': {
        if (!url) { result = { status: false, error: 'url required' }; break; }
        const l = url.toLowerCase();
        if (/tiktok|vt\.tiktok/.test(l)) { result = await handle('tiktok', query); break; }
        if (/instagram/.test(l)) { result = await handle('instagram', query); break; }
        if (/twitter|x\.com/.test(l)) { result = await handle('twitter', query); break; }
        if (/facebook|fb\.watch/.test(l)) { result = await handle('facebook', query); break; }
        result = await getMediaInfo(url, type === 'audio');
        break;
      }
      case 'quote':
      case 'quotes': result = await tools.toolQuote(); break;
      case 'joke': result = await tools.toolJoke(); break;
      case 'fact': result = await tools.toolFact(); break;
      case 'activity': result = await tools.toolActivity(); break;
      case 'pokemon': result = await tools.toolPokemon(url); break;
      case 'github': result = await tools.toolGithub(url); break;
      case 'crypto': result = await tools.toolCrypto(url); break;
      case 'dog': result = await tools.toolDog(); break;
      case 'cat': result = await tools.toolCat(); break;
      case 'waifu': result = await tools.toolWaifu(); break;
      case 'ip': result = await tools.toolIp(url); break;
      case 'screenshot':
      case 'ssweb': result = await tools.toolScreenshot(url); break;
      case 'base64': result = await tools.toolBase64(url, type || 'encode'); break;
      case 'randomuser': result = await tools.toolRandomUser(); break;
      case 'advice': result = await tools.toolAdvice(); break;
      case 'numberfact': result = await tools.toolNumberFact(url); break;
      case 'country': result = await tools.toolCountry(url); break;
      case 'universities': result = await tools.toolUniversities(url); break;
      case 'agify': result = await tools.toolAgify(url); break;
      case 'genderize': result = await tools.toolGenderize(url); break;
      case 'nationalize': result = await tools.toolNationalize(url); break;
      case 'dictionary':
      case 'dict': result = await tools.toolDictionary(url); break;
      case 'qr': result = await tools.toolQr(url); break;
      case 'uuid': result = await tools.toolUuid(); break;
      case 'password': result = await tools.toolPassword(url); break;
      case 'hash': result = await tools.toolHash(url); break;
      case 'lorem': result = await tools.toolLorem(url); break;
      case 'animequote': result = await tools.toolAnimeQuote(); break;
      case 'yesno': result = await tools.toolYesNo(); break;
      case 'fox': result = await tools.toolFox(); break;
      case 'duck': result = await tools.toolDuck(); break;
      case 'coffee': result = await tools.toolCoffee(); break;
      case 'chuck': result = await tools.toolChuck(); break;
      case 'dadjoke': result = await tools.toolDadJoke(); break;
      case 'insult': result = await tools.toolInsult(); break;
      case 'affirmation': result = await tools.toolAffirmation(); break;
      case 'weather':
      case 'cuaca': result = await tools.toolWeather(url); break;
      case 'npm': result = await tools.toolNpm(url); break;
      case 'shorten':
      case 'shortlink': result = await tools.toolShorten(url); break;
      case 'whois': result = await tools.toolWhois(url); break;
      case 'color': result = await tools.toolColor(url); break;
      case 'timestamp': result = await tools.toolTimestamp(); break;
      case 'morse': result = await tools.toolMorse(url, type || 'encode'); break;
      case 'mock': result = await tools.toolMock(url); break;
      case 'reverse': result = await tools.toolReverse(url); break;
      case 'count': result = await tools.toolCount(url); break;
      case 'amprem':
      case 'am/send':
        result = await handleAmPrem({ ...query, email: query.email || query.url || query.q });
        break;
      case 'amverif':
      case 'amverify':
      case 'am/verif':
        result = await handleAmVerif({
          ...query,
          email: query.email || query.q,
          link: query.link || query.url,
        });
        break;
      default:
        if (!url) result = { status: false, error: 'Unknown endpoint or missing url' };
        else result = await getMediaInfo(url, type === 'audio');
    }
    if (!result || typeof result !== 'object') result = { status: false, error: 'Empty result' };
    if (result.status === undefined) result.status = true;
    return result;
  } catch (e) {
    return { status: false, platform: p, error: e.message || String(e) };
  }
}


const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function staticFile(res, pathname) {
  let fp = path.join(STATIC, pathname === '/' ? 'index.html' : pathname);
  if (!fp.startsWith(STATIC)) return sendJSON(res, 403, { error: 'Forbidden' });
  fs.readFile(fp, (err, data) => {
    if (err) {
      if (pathname !== '/') return staticFile(res, '/');
      return sendJSON(res, 404, { error: 'Not found' });
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  const { pathname, query } = parse(req.url);

  if (pathname === '/api/health') {
    return sendJSON(res, 200, { status: true, version: '2.4.0', mode: 'stable-only' });
  }

  // —— Media profile (avatar / video / musik) ——
  if (pathname === '/api/media') {
    return handlePublicMedia(req, res);
  }
  if (pathname.startsWith('/api/file/')) {
    const id = pathname.replace('/api/file/', '').split('/')[0];
    return handleFile(req, res, id);
  }
  if (pathname === '/api/admin/login') {
    return handleAdminLogin(req, res);
  }
  if (pathname === '/api/admin/settings') {
    return handleAdminSettings(req, res);
  }
  if (pathname === '/api/admin/music') {
    return handleAdminMusic(req, res);
  }
  if (pathname === '/api/admin/upload') {
    return handleAdminUpload(req, res);
  }
  if (pathname === '/api/endpoints') {
    return sendJSON(res, 200, {
      version: '2.4.0',
      categories: {
        downloader: ['aio','tiktok','instagram','youtube','facebook','twitter','pinterest','reddit','soundcloud','capcut','dailymotion'],
        fun: ['quote','joke','fact','activity','advice','numberfact','pokemon','dog','cat','waifu','fox','duck','coffee','randomuser','agify','genderize','nationalize','animequote','yesno','chuck','dadjoke','insult','affirmation','mock'],
        info: ['github','crypto','country','universities','dictionary','weather','npm','whois'],
        tools: ['ip','screenshot','base64','qr','uuid','password','hash','lorem','shorten','color','timestamp','morse','reverse','count','amprem','amverif'],
        am: ['amprem', 'amverif', 'am/send', 'am/verif'],
      },
    });
  }

  // AM Prem: kirim request premium ke email
  // GET /api/amprem?email=user@gmail.com
  // GET /api/am/send?email=user@gmail.com
  if (
    pathname === '/api/amprem' ||
    pathname === '/api/am/send' ||
    pathname === '/v1/amprem' ||
    pathname === '/v1/am/send'
  ) {
    try {
      const result = await handleAmPrem(query);
      return sendJSON(res, result.status ? 200 : 400, result);
    } catch (e) {
      return sendJSON(res, 500, { status: false, error: e.message || 'Internal error' });
    }
  }

  // AM Verif: verifikasi dengan email + link
  // GET /api/amverif?email=user@gmail.com&link=https://...
  // GET /api/am/verif?email=user@gmail.com&link=https://...
  if (
    pathname === '/api/amverif' ||
    pathname === '/api/amverify' ||
    pathname === '/api/am/verif' ||
    pathname === '/v1/amverif' ||
    pathname === '/v1/amverify' ||
    pathname === '/v1/am/verif'
  ) {
    try {
      const result = await handleAmVerif(query);
      return sendJSON(res, result.status ? 200 : 400, result);
    } catch (e) {
      return sendJSON(res, 500, { status: false, error: e.message || 'Internal error' });
    }
  }

  if (pathname === '/api/proxy-download' || pathname === '/api/dl') {
    const target = query.url;
    if (!target) return sendJSON(res, 400, { status: false, error: 'url required' });
    try {
      const lib = target.startsWith('https') ? https : http;
      lib.get(target, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.tiktok.com/' },
      }, (up) => {
        if ([301, 302, 303, 307, 308].includes(up.statusCode) && up.headers.location) {
          res.writeHead(302, { Location: '/api/proxy-download?url=' + encodeURIComponent(up.headers.location) });
          return res.end();
        }
        const ctype = up.headers['content-type'] || 'application/octet-stream';
        let filename = 'download.bin';
        try {
          const base = new URL(target).pathname.split('/').pop() || 'file';
          filename = base.includes('.') ? base : base + (ctype.includes('video') ? '.mp4' : ctype.includes('audio') ? '.mp3' : '');
        } catch {}
        res.writeHead(200, {
          'Content-Type': ctype,
          'Content-Disposition': 'attachment; filename="' + filename.replace(/"/g, '') + '"',
          'Access-Control-Allow-Origin': '*',
        });
        up.pipe(res);
      }).on('error', (e) => sendJSON(res, 502, { status: false, error: e.message }));
    } catch (e) {
      return sendJSON(res, 500, { status: false, error: e.message });
    }
    return;
  }

  if (pathname.startsWith('/api/') || pathname.startsWith('/v1/')) {
    const parts = pathname.replace(/^\/(api|v1)/, '').split('/').filter(Boolean);
    let platform = 'aio';
    if (parts[0] === 'download' && parts[1]) platform = parts[1];
    else if (parts[0] === 'download' || parts[0] === 'aio') platform = 'aio';
    else if (parts[0]) platform = parts[0];
    try {
      const result = await handle(platform, query);
      return sendJSON(res, result && result.status ? 200 : 400, result || { status: false, error: 'empty' });
    } catch (e) {
      return sendJSON(res, 500, { status: false, error: e.message || 'Internal error' });
    }
  }

  staticFile(res, pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Benimaru API v2.4 (stable + expanded tools) → http://localhost:' + PORT + '\n');
});
