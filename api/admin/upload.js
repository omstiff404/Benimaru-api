import { handleAdminUpload } from '../../lib/mediaApi.js';

export default async function handler(req, res) {
  const nodeRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    end: (d) => {
      if (!res.headersSent) res.status(nodeRes.statusCode).send(d);
    },
  };
  await handleAdminUpload(req, nodeRes);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '55mb',
    },
  },
};
