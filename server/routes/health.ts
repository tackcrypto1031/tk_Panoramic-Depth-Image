import { Router } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ ok: true, version: config.version, uptime: process.uptime() });
});
