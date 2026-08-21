import { handleAdminSettings } from '../../lib/mediaApi.js';

export default async function handler(req, res) {
  const nodeRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    end: (d) => {
      if (!res.headersSent) res.status(nodeRes.statusCode).send(d);
    },
  };
  await handleAdminSettings(req, nodeRes);
}
