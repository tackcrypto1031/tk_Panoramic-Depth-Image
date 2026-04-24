import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import PQueue from 'p-queue';
import type { Item, ItemId, ItemsFile } from '../../shared/types.js';

const EMPTY: ItemsFile = { version: 1, items: [] };

export interface Db {
  list(): Promise<Item[]>;
  get(id: ItemId): Promise<Item | undefined>;
  insert(item: Item): Promise<Item>;
  patch(
    id: ItemId,
    patch: Partial<Pick<Item, 'title' | 'tags' | 'viewerSettings'>>
  ): Promise<Item | undefined>;
  remove(id: ItemId): Promise<boolean>;
  all(): Promise<Item[]>;
}

async function readFileSafe(filePath: string): Promise<ItemsFile> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      return parsed as ItemsFile;
    }
    throw new Error('invalid shape');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await writeAtomic(filePath, EMPTY);
      return { ...EMPTY, items: [] };
    }
    // corrupt: backup + replace
    const bak = `${filePath}.corrupt-${Date.now()}`;
    if (fsSync.existsSync(filePath)) {
      await fs.rename(filePath, bak);
    }
    await writeAtomic(filePath, EMPTY);
    return { ...EMPTY, items: [] };
  }
}

async function writeAtomic(filePath: string, data: ItemsFile): Promise<void> {
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath);
}

export function createDb(filePath: string): Db {
  const queue = new PQueue({ concurrency: 1 });

  async function read(): Promise<ItemsFile> {
    return await readFileSafe(filePath);
  }

  return {
    async list() {
      return queue.add(async () => {
        const f = await read();
        return [...f.items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      }) as Promise<Item[]>;
    },
    async get(id) {
      return queue.add(async () => {
        const f = await read();
        return f.items.find((i) => i.id === id);
      }) as Promise<Item | undefined>;
    },
    async insert(item) {
      return queue.add(async () => {
        const f = await read();
        f.items.push(item);
        await writeAtomic(filePath, f);
        return item;
      }) as Promise<Item>;
    },
    async patch(id, patch) {
      return queue.add(async () => {
        const f = await read();
        const idx = f.items.findIndex((i) => i.id === id);
        if (idx < 0) return undefined;
        const existing = f.items[idx]!;
        const updated: Item = {
          ...existing,
          ...patch,
          viewerSettings: patch.viewerSettings
            ? { ...existing.viewerSettings, ...patch.viewerSettings }
            : existing.viewerSettings,
          updatedAt: new Date().toISOString(),
        };
        f.items[idx] = updated;
        await writeAtomic(filePath, f);
        return updated;
      }) as Promise<Item | undefined>;
    },
    async remove(id) {
      return queue.add(async () => {
        const f = await read();
        const before = f.items.length;
        f.items = f.items.filter((i) => i.id !== id);
        if (f.items.length === before) return false;
        await writeAtomic(filePath, f);
        return true;
      }) as Promise<boolean>;
    },
    async all() {
      return this.list();
    },
  };
}
