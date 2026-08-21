import { handleAdminLogin } from '../../lib/mediaApi.js';

function adapt(req, res) {
  const nodeRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    end: (d) => {
      if (!res.headersSent) res.status(nodeRes.statusCode).send(d);
    },
  };
  return handleAdminLogin(req, nodeRes);
}

export default async function handler(req, res) {
  await adapt(req, res);
}
