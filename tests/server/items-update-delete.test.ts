import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { createApp } from '@server/app.js';

const fixDir = path.join(__dirname, '..', 'fixtures');

async function createItem(app: ReturnType<typeof createApp>) {
  const res = await request(app)
    .post('/api/items')
    .field('title', 'orig')
    .field('tags', '[]')
    .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
    .attach('thumbnail', path.join(fixDir, 'depth-small.png'));
  return res.body;
}

describe('PATCH /api/items/:id', () => {
  let root: string;

  beforeAll(() => {
    if (!fs.existsSync(path.join(fixDir, 'panorama-2to1.jpg'))) {
      throw new Error('Run fixtures first');
    }
  });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-patch-'));
    for (const d of ['uploads', 'thumbs', '.trash', '.tmp', 'logs']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
    }
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [] }));
  });

  it('updates title', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const item = await createItem(app);
    const res = await request(app).patch(`/api/items/${item.id}`).send({ title: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('new');
  });

  it('updates viewerSettings (partial)', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const item = await createItem(app);
    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ viewerSettings: { depthScale: 0.25 } });
    expect(res.status).toBe(200);
    expect(res.body.viewerSettings.depthScale).toBe(0.25);
    expect(res.body.viewerSettings.fov).toBe(75); // unchanged
  });

  it('clamps fov to range', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const item = await createItem(app);
    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .send({ viewerSettings: { fov: 999 } });
    expect(res.status).toBe(200);
    expect(res.body.viewerSettings.fov).toBe(110);
  });

  it('404 for missing id', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).patch('/api/items/nope').send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  it('400 for empty patch', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const item = await createItem(app);
    const res = await request(app).patch(`/api/items/${item.id}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/items/:id', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-del-'));
    for (const d of ['uploads', 'thumbs', '.trash', '.tmp', 'logs']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
    }
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [] }));
  });

  it('moves files to trash and removes item', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const item = await createItem(app);
    const res = await request(app).delete(`/api/items/${item.id}`);
    expect(res.status).toBe(204);
    expect(fs.existsSync(path.join(root, 'uploads', item.id))).toBe(false);
    expect(fs.existsSync(path.join(root, '.trash', item.id, 'meta.json'))).toBe(true);
    const list = await request(app).get('/api/items');
    expect(list.body).toHaveLength(0);
  });

  it('404 for missing', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app).delete('/api/items/nope');
    expect(res.status).toBe(404);
  });
});
