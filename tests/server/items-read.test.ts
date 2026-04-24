import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { createApp } from '@server/app.js';

function makeItem(id: string) {
  const now = new Date().toISOString();
  return {
    id,
    title: id,
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
  };
}

describe('GET /api/items', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-api-'));
    for (const d of ['uploads', 'thumbs', '.trash', '.tmp', 'logs']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
    }
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [] }));
  });

  it('returns empty array when no items', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns items sorted DESC by createdAt', async () => {
    const a = makeItem('a');
    a.createdAt = '2026-01-01T00:00:00Z';
    const b = makeItem('b');
    b.createdAt = '2026-02-01T00:00:00Z';
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [a, b] }));

    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.map((i: any) => i.id)).toEqual(['b', 'a']);
  });

  it('GET /api/items/:id returns item', async () => {
    const a = makeItem('a');
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [a] }));
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).get('/api/items/a');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('a');
  });

  it('GET /api/items/:id returns 404 for missing', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).get('/api/items/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
