import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { LIMITS } from '../../shared/types.js';
import { ApiErrors } from '../lib/api-error.js';

const ALLOWED_PANORAMA = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_DEPTH = new Set(['image/png', 'image/jpeg', 'image/webp']);
const ALLOWED_THUMB = new Set(['image/webp', 'image/png', 'image/jpeg']);

export function createUploader(tmpRoot: string) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        const sessionDir = path.join(tmpRoot, randomUUID());
        fs.mkdirSync(sessionDir, { recursive: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_req as any).__uploadSessionDir = sessionDir;
        cb(null, sessionDir);
      },
      filename: (_req, file, cb) =>
        cb(null, file.fieldname + path.extname(file.originalname || '')),
    }),
    limits: { fileSize: LIMITS.fileMaxBytes },
    fileFilter: (_req, file, cb) => {
      const set =
        file.fieldname === 'panorama'
          ? ALLOWED_PANORAMA
          : file.fieldname === 'depth'
            ? ALLOWED_DEPTH
            : file.fieldname === 'thumbnail'
              ? ALLOWED_THUMB
              : new Set<string>();
      if (!set.has(file.mimetype)) {
        cb(ApiErrors.unsupportedMime(file.mimetype));
        return;
      }
      cb(null, true);
    },
  }).fields([
    { name: 'panorama', maxCount: 1 },
    { name: 'depth', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]);
}
