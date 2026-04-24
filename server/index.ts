import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';
import { createApp } from './app.js';
import { createDb } from './lib/db.js';
import { createStorage } from './lib/storage.js';
import { logger } from './lib/logger.js';
import { LIMITS } from '../shared/types.js';

async function bootstrap() {
  // Ensure data dirs exist
  const subs = ['uploads', 'thumbs', '.trash', '.tmp', 'logs'];
  for (const d of subs) fs.mkdirSync(path.join(config.dataDir, d), { recursive: true });

  const storage = createStorage(config.dataDir);
  const db = createDb(path.join(config.dataDir, 'items.json'));

  await storage.cleanupTmp();
  const items = await db.list();
  const known = new Set(items.map((i) => i.id));
  const orphans = await storage.scanOrphans(known);
  if (orphans.length > 0) logger.warn({ orphans }, 'moved orphan upload folders to trash');
  const purged = await storage.purgeOldTrash(LIMITS.trashTtlDays);
  if (purged.length > 0) logger.info({ purged }, 'purged old trash entries');

  const app = createApp({
    dataDir: config.dataDir,
    distDir: config.distDir,
    version: config.version,
  });

  const server = app.listen(config.port, '127.0.0.1', () => {
    logger.info(`tk_depthimg server listening on http://127.0.0.1:${config.port}`);
  });

  const shutdown = () => {
    logger.info('shutting down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.error({ err }, 'bootstrap failed');
  process.exit(1);
});
