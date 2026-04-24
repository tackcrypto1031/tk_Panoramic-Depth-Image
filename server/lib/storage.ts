import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import type { Item, ItemId } from '../../shared/types.js';

export interface Storage {
  uploadDir(id: ItemId): string;
  thumbPath(id: ItemId): string;
  tmpDir(): string;
  ensureDirs(): Promise<void>;
  moveToTrash(id: ItemId, item: Item): Promise<void>;
  scanOrphans(knownIds: Set<ItemId>): Promise<string[]>;
  purgeOldTrash(ttlDays: number): Promise<string[]>;
  cleanupTmp(): Promise<void>;
}

export function createStorage(dataDir: string): Storage {
  const uploads = path.join(dataDir, 'uploads');
  const thumbs = path.join(dataDir, 'thumbs');
  const trash = path.join(dataDir, '.trash');
  const tmp = path.join(dataDir, '.tmp');

  async function rmrf(p: string): Promise<void> {
    await fs.rm(p, { recursive: true, force: true });
  }

  return {
    uploadDir(id) {
      return path.join(uploads, id);
    },
    thumbPath(id) {
      return path.join(thumbs, `${id}.webp`);
    },
    tmpDir() {
      return tmp;
    },

    async ensureDirs() {
      for (const d of [uploads, thumbs, trash, tmp]) {
        await fs.mkdir(d, { recursive: true });
      }
    },

    async moveToTrash(id, item) {
      const dst = path.join(trash, id);
      await rmrf(dst);
      await fs.mkdir(dst, { recursive: true });

      const upSrc = path.join(uploads, id);
      if (fsSync.existsSync(upSrc)) {
        await fs.rename(upSrc, path.join(dst, 'uploads'));
      }
      const thumbSrc = path.join(thumbs, `${id}.webp`);
      if (fsSync.existsSync(thumbSrc)) {
        await fs.rename(thumbSrc, path.join(dst, 'thumb.webp'));
      }
      await fs.writeFile(
        path.join(dst, 'meta.json'),
        JSON.stringify({ item, deletedAt: new Date().toISOString() }, null, 2)
      );
    },

    async scanOrphans(knownIds) {
      if (!fsSync.existsSync(uploads)) return [];
      const entries = await fs.readdir(uploads);
      const moved: string[] = [];
      for (const id of entries) {
        if (knownIds.has(id)) continue;
        const src = path.join(uploads, id);
        const stat = await fs.stat(src);
        if (!stat.isDirectory()) continue;
        const dst = path.join(trash, `orphan-${Date.now()}-${id}`);
        await fs.rename(src, dst);
        moved.push(id);
      }
      return moved;
    },

    async purgeOldTrash(ttlDays) {
      if (!fsSync.existsSync(trash)) return [];
      const entries = await fs.readdir(trash);
      const cutoff = Date.now() - ttlDays * 24 * 3600 * 1000;
      const deleted: string[] = [];
      for (const name of entries) {
        const p = path.join(trash, name);
        const stat = await fs.stat(p);
        if (stat.mtimeMs < cutoff) {
          await rmrf(p);
          deleted.push(name);
        }
      }
      return deleted;
    },

    async cleanupTmp() {
      if (!fsSync.existsSync(tmp)) return;
      const entries = await fs.readdir(tmp);
      for (const name of entries) {
        await rmrf(path.join(tmp, name));
      }
    },
  };
}
