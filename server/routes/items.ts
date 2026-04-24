import { Router, type Request } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { fileTypeFromFile } from 'file-type';
import type { Db } from '../lib/db.js';
import type { Storage } from '../lib/storage.js';
import { ApiErrors } from '../lib/api-error.js';
import { createUploader } from './upload.js';
import {
  processPanorama,
  processDepth,
  validatePanoramaRatio,
  toMeta,
  probeImageSize,
} from '../lib/image.js';
import { validateTitle, validateTagsJson, validateViewerSettingsPatch } from '../lib/validate.js';
import { DEFAULT_VIEWER_SETTINGS, type Item } from '../../shared/types.js';

interface Deps {
  db: Db;
  storage: Storage;
  dataDir: string;
}

function fieldFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return files?.[field]?.[0];
}

async function verifyMagicBytes(file: Express.Multer.File, allowed: Set<string>): Promise<void> {
  const ft = await fileTypeFromFile(file.path);
  if (!ft || !allowed.has(ft.mime)) {
    throw ApiErrors.unsupportedMime(ft?.mime ?? 'unknown');
  }
}

export function createItemsRouter(deps: Deps): Router {
  const router = Router();
  const upload = createUploader(deps.storage.tmpDir());

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await deps.db.list());
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

  router.post('/', upload, async (req, res, next) => {
    const sessionDir: string | undefined = (req as unknown as { __uploadSessionDir?: string })
      .__uploadSessionDir;
    try {
      const title = validateTitle(req.body.title);
      const tags = validateTagsJson(req.body.tags);

      const panoramaFile = fieldFile(req, 'panorama');
      const thumbnailFile = fieldFile(req, 'thumbnail');
      const depthFile = fieldFile(req, 'depth');

      if (!panoramaFile) throw ApiErrors.validation('需要 panorama 檔');
      if (!thumbnailFile) throw ApiErrors.validation('需要 thumbnail 檔');

      await verifyMagicBytes(panoramaFile, new Set(['image/jpeg', 'image/png', 'image/webp']));
      await verifyMagicBytes(thumbnailFile, new Set(['image/webp', 'image/png', 'image/jpeg']));
      if (depthFile)
        await verifyMagicBytes(depthFile, new Set(['image/png', 'image/jpeg', 'image/webp']));

      const panoProbe = await probeImageSize(panoramaFile.path);
      if (!validatePanoramaRatio(panoProbe.width, panoProbe.height)) {
        throw ApiErrors.invalidRatio(panoProbe.width, panoProbe.height);
      }

      const id = nanoid(12);
      const uploadDir = deps.storage.uploadDir(id);
      await fs.mkdir(uploadDir, { recursive: true });

      const panoramaExt = path.extname(panoramaFile.originalname || '.jpg') || '.jpg';
      const panoramaFinal = path.join(uploadDir, `panorama${panoramaExt}`);
      const panoResult = await processPanorama(panoramaFile.path, panoramaFinal);

      let depthMeta: Item['depth'] = null;
      if (depthFile) {
        const depthExt = '.png';
        const depthFinal = path.join(uploadDir, `depth${depthExt}`);
        const dRes = await processDepth(depthFile.path, depthFinal, {
          targetWidth: panoResult.width,
          targetHeight: panoResult.height,
        });
        depthMeta = toMeta(`depth${depthExt}`, dRes, 'image/png');
      }

      const thumbFinal = deps.storage.thumbPath(id);
      await fs.mkdir(path.dirname(thumbFinal), { recursive: true });
      await fs.rename(thumbnailFile.path, thumbFinal);

      const now = new Date().toISOString();
      const item: Item = {
        id,
        title,
        tags,
        createdAt: now,
        updatedAt: now,
        panorama: toMeta(`panorama${panoramaExt}`, panoResult, panoramaFile.mimetype),
        depth: depthMeta,
        thumbnail: { filename: `${id}.webp`, width: 480, height: 240 },
        viewerSettings: { ...DEFAULT_VIEWER_SETTINGS },
      };

      await deps.db.insert(item);
      res.status(201).json(item);
    } catch (e) {
      // rollback: multer temp files
      next(e);
    } finally {
      if (sessionDir) {
        fs.rm(sessionDir, { recursive: true, force: true }).catch(() => undefined);
      }
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const id = req.params.id!;
      const patch: Partial<Pick<Item, 'title' | 'tags' | 'viewerSettings'>> = {};
      if (req.body.title !== undefined) patch.title = validateTitle(req.body.title);
      if (req.body.tags !== undefined) {
        const tags = Array.isArray(req.body.tags) ? JSON.stringify(req.body.tags) : req.body.tags;
        patch.tags = validateTagsJson(tags);
      }
      if (req.body.viewerSettings !== undefined) {
        patch.viewerSettings = validateViewerSettingsPatch(
          req.body.viewerSettings
        ) as Item['viewerSettings'];
      }
      if (Object.keys(patch).length === 0) {
        throw ApiErrors.validation('至少需提供一個要更新的欄位');
      }
      const updated = await deps.db.patch(id, patch);
      if (!updated) throw ApiErrors.notFound('item');
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = req.params.id!;
      const item = await deps.db.get(id);
      if (!item) throw ApiErrors.notFound('item');
      await deps.storage.moveToTrash(id, item);
      await deps.db.remove(id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
}
