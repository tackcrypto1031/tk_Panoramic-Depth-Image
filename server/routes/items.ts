import { Router } from 'express';
import type { Db } from '../lib/db.js';
import type { Storage } from '../lib/storage.js';
import { ApiErrors } from '../lib/api-error.js';

interface Deps {
  db: Db;
  storage: Storage;
  dataDir: string;
}

export function createItemsRouter(deps: Deps): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const items = await deps.db.list();
      res.json(items);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const item = await deps.db.get(req.params.id!);
      if (!item) throw ApiErrors.notFound('item');
      res.json(item);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
