import { handlePublicMedia } from '../lib/mediaApi.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  // Adapt Vercel res to Node-style used by mediaApi
  const nodeRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    end: (d) => {
      if (!res.headersSent) res.status(nodeRes.statusCode).send(d);
    },
  };
  await handlePublicMedia(req, nodeRes);
}
