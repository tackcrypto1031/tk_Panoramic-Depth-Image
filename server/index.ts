import express from 'express';
import { config } from './config.js';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: config.version, uptime: process.uptime() });
});

const server = app.listen(config.port, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[tk_depthimg] server listening on http://127.0.0.1:${config.port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
