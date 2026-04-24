import express, { type Express } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { healthRouter } from './routes/health.js';
import { createItemsRouter } from './routes/items.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createDb } from './lib/db.js';
import { createStorage } from './lib/storage.js';

export interface AppOptions {
  dataDir: string;
  distDir: string;
  version: string;
}

export function createApp(opts: AppOptions): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));

  const db = createDb(path.join(opts.dataDir, 'items.json'));
  const storage = createStorage(opts.dataDir);

  app.use('/api/health', healthRouter);
  app.use('/api/items', createItemsRouter({ db, storage, dataDir: opts.dataDir }));

  app.use('/uploads', express.static(path.join(opts.dataDir, 'uploads'), { fallthrough: false }));
  app.use('/thumbs', express.static(path.join(opts.dataDir, 'thumbs'), { fallthrough: false }));

  if (opts.distDir) {
    app.use(express.static(opts.distDir));
    app.get(/^(?!\/api|\/uploads|\/thumbs).*/, (_req, res) => {
      res.sendFile(path.join(opts.distDir, 'index.html'));
    });
  }

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
