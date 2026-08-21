import { handleFile } from '../../lib/mediaApi.js';

export default async function handler(req, res) {
  const id = req.query.id;
  const nodeRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    end: (d) => {
      if (!res.headersSent) {
        res.status(nodeRes.statusCode);
        if (Buffer.isBuffer(d)) res.send(d);
        else res.send(d);
      }
    },
  };
  // proxy headers from req
  await handleFile(req, nodeRes, id);
}

export const config = {
  api: { responseLimit: '50mb' },
};
