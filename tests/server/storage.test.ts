import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createStorage } from '@server/lib/storage.js';

function touchFile(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, 'x');
}

describe('storage', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-storage-'));
    for (const d of ['uploads', 'thumbs', '.trash', '.tmp']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
    }
  });

  it('uploadDir / thumbPath return expected paths', () => {
    const s = createStorage(root);
    expect(s.uploadDir('abc')).toBe(path.join(root, 'uploads', 'abc'));
    expect(s.thumbPath('abc')).toBe(path.join(root, 'thumbs', 'abc.webp'));
  });

  it('moveToTrash moves uploads + thumb + writes meta.json', async () => {
    const s = createStorage(root);
    touchFile(path.join(root, 'uploads', 'abc', 'panorama.jpg'));
    touchFile(path.join(root, 'thumbs', 'abc.webp'));
    const item = { id: 'abc', title: 'x' } as any;
    await s.moveToTrash('abc', item);
    expect(fs.existsSync(path.join(root, 'uploads', 'abc'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'thumbs', 'abc.webp'))).toBe(false);
    expect(fs.existsSync(path.join(root, '.trash', 'abc', 'uploads', 'panorama.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.trash', 'abc', 'thumb.webp'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.trash', 'abc', 'meta.json'))).toBe(true);
  });

  it('scanOrphans moves upload folders without matching item to trash', async () => {
    const s = createStorage(root);
    touchFile(path.join(root, 'uploads', 'keep', 'panorama.jpg'));
    touchFile(path.join(root, 'uploads', 'orphan1', 'panorama.jpg'));
    const moved = await s.scanOrphans(new Set(['keep']));
    expect(moved).toContain('orphan1');
    expect(fs.existsSync(path.join(root, 'uploads', 'orphan1'))).toBe(false);
  });

  it('purgeOldTrash deletes trash entries older than N days', async () => {
    const s = createStorage(root);
    const old = path.join(root, '.trash', 'oldone');
    const recent = path.join(root, '.trash', 'recent');
    fs.mkdirSync(old, { recursive: true });
    fs.mkdirSync(recent, { recursive: true });
    const eightDaysAgo = Date.now() - 8 * 24 * 3600 * 1000;
    fs.utimesSync(old, eightDaysAgo / 1000, eightDaysAgo / 1000);
    const deleted = await s.purgeOldTrash(7);
    expect(deleted).toContain('oldone');
    expect(deleted).not.toContain('recent');
    expect(fs.existsSync(old)).toBe(false);
    expect(fs.existsSync(recent)).toBe(true);
  });

  it('cleanupTmp removes stale .tmp subfolders', async () => {
    const s = createStorage(root);
    fs.mkdirSync(path.join(root, '.tmp', 'stale'));
    await s.cleanupTmp();
    expect(fs.existsSync(path.join(root, '.tmp', 'stale'))).toBe(false);
    expect(fs.existsSync(path.join(root, '.tmp'))).toBe(true);
  });
});
