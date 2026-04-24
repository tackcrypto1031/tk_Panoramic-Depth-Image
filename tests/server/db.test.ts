import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createDb } from '@server/lib/db.js';
import type { Item } from '@shared/types';

function makeItem(id: string, overrides: Partial<Item> = {}): Item {
  const now = new Date().toISOString();
  return {
    id,
    title: `Item ${id}`,
    tags: [],
    createdAt: now,
    updatedAt: now,
    panorama: { filename: 'panorama.jpg', width: 4096, height: 2048, mimeType: 'image/jpeg' },
    depth: null,
    thumbnail: { filename: `${id}.webp`, width: 480, height: 240 },
    viewerSettings: {
      depthScale: 0.05,
      parallaxAmount: 0.3,
      fov: 75,
      autoRotate: false,
      autoRotateSpeed: 0.5,
      invertDepth: false,
    },
    ...overrides,
  };
}

describe('db', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-depthimg-'));
  });

  it('initializes items.json when absent', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    const items = await db.list();
    expect(items).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, 'items.json'))).toBe(true);
  });

  it('insert + list + get', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    const item = makeItem('abc123');
    await db.insert(item);
    expect(await db.list()).toHaveLength(1);
    expect(await db.get('abc123')).toEqual(item);
  });

  it('returns undefined for missing id', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    expect(await db.get('nope')).toBeUndefined();
  });

  it('patch merges partial fields', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    await db.insert(makeItem('abc'));
    const updated = await db.patch('abc', { title: 'new' });
    expect(updated?.title).toBe('new');
    expect(updated?.updatedAt).not.toEqual(updated?.createdAt);
  });

  it('patch returns undefined for missing id', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    expect(await db.patch('nope', { title: 'x' })).toBeUndefined();
  });

  it('remove returns true when found, false otherwise', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    await db.insert(makeItem('abc'));
    expect(await db.remove('abc')).toBe(true);
    expect(await db.remove('abc')).toBe(false);
    expect(await db.list()).toHaveLength(0);
  });

  it('concurrent inserts are serialized (no lost writes)', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    const ids = Array.from({ length: 20 }, (_, i) => `id${i}`);
    await Promise.all(ids.map((id) => db.insert(makeItem(id))));
    const items = await db.list();
    expect(items).toHaveLength(20);
    expect(new Set(items.map((i) => i.id))).toEqual(new Set(ids));
  });

  it('list returns items sorted by createdAt DESC', async () => {
    const db = createDb(path.join(tmpDir, 'items.json'));
    await db.insert(makeItem('a', { createdAt: '2026-01-01T00:00:00Z' }));
    await db.insert(makeItem('b', { createdAt: '2026-02-01T00:00:00Z' }));
    await db.insert(makeItem('c', { createdAt: '2026-01-15T00:00:00Z' }));
    const items = await db.list();
    expect(items.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('corrupt file is backed up and replaced with empty', async () => {
    const p = path.join(tmpDir, 'items.json');
    fs.writeFileSync(p, '{ not json');
    const db = createDb(p);
    expect(await db.list()).toEqual([]);
    const backups = fs.readdirSync(tmpDir).filter((f) => f.startsWith('items.json.corrupt-'));
    expect(backups.length).toBe(1);
  });
});
