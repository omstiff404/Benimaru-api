/**
 * Simple admin auth — JWT-like HMAC token (no external deps)
 * Config: config.js → ADMIN_PASSWORD, JWT_SECRET
 */
import crypto from 'crypto';
import config from '../config.js';

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

function secret() {
  return (
    config.JWT_SECRET ||
    process.env.JWT_SECRET ||
    config.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    'benimaru-dev-secret'
  );
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromB64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

export function createToken(payload = {}) {
  const body = {
    role: 'admin',
    exp: Date.now() + TTL_MS,
    ...payload,
  };
  const data = b64url(JSON.stringify(body));
  const sig = b64url(
    crypto.createHmac('sha256', secret()).update(data).digest()
  );
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expect = b64url(
    crypto.createHmac('sha256', secret()).update(data).digest()
  );
  if (sig !== expect) return null;
  try {
    const body = JSON.parse(fromB64url(data).toString('utf8'));
    if (!body.exp || body.exp < Date.now()) return null;
    if (body.role !== 'admin') return null;
    return body;
  } catch {
    return null;
  }
}

export function checkPassword(password) {
  const expected =
    config.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';
  if (!password || password.length < 1) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(Buffer.alloc(b.length), b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function getBearer(req) {
  const h = req.headers?.authorization || req.headers?.Authorization || '';
  if (typeof h === 'string' && h.toLowerCase().startsWith('bearer ')) {
    return h.slice(7).trim();
  }
  const cookie = req.headers?.cookie || '';
  const m = /(?:^|;\s*)admin_token=([^;]+)/.exec(cookie);
  return m ? decodeURIComponent(m[1]) : null;
}

export function requireAdmin(req) {
  const token = getBearer(req);
  return verifyToken(token);
}
