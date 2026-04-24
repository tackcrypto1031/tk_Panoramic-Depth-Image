import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import { createApp } from '@server/app.js';

const fixDir = path.join(__dirname, '..', 'fixtures');

describe('POST /api/items', () => {
  let root: string;

  beforeAll(() => {
    if (!fs.existsSync(path.join(fixDir, 'panorama-2to1.jpg'))) {
      throw new Error('Run `node tests/fixtures/generate-fixtures.js` first');
    }
  });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-post-'));
    for (const d of ['uploads', 'thumbs', '.trash', '.tmp', 'logs']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
    }
    fs.writeFileSync(path.join(root, 'items.json'), JSON.stringify({ version: 1, items: [] }));
  });

  it('creates an item with panorama only', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app)
      .post('/api/items')
      .field('title', '測試場景')
      .field('tags', JSON.stringify(['室內', '辦公室']))
      .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png')); // 借用作 thumb

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('測試場景');
    expect(res.body.tags).toEqual(['室內', '辦公室']);
    expect(res.body.depth).toBeNull();
    expect(res.body.panorama.width).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(root, 'uploads', res.body.id, res.body.panorama.filename))).toBe(
      true
    );
    expect(fs.existsSync(path.join(root, 'thumbs', `${res.body.id}.webp`))).toBe(true);
  });

  it('creates an item with depth', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app)
      .post('/api/items')
      .field('title', 'with depth')
      .field('tags', '[]')
      .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
      .attach('depth', path.join(fixDir, 'depth-small.png'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png'));

    expect(res.status).toBe(201);
    expect(res.body.depth).not.toBeNull();
    expect(res.body.depth.width).toBe(res.body.panorama.width);
  });

  it('rejects non-2:1 panorama', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app)
      .post('/api/items')
      .field('title', 'wrong ratio')
      .field('tags', '[]')
      .attach('panorama', path.join(fixDir, 'panorama-16to9.jpg'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png'));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RATIO');
  });

  it('rejects missing title', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app)
      .post('/api/items')
      .field('tags', '[]')
      .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png'));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('rejects invalid tags JSON', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const res = await request(app)
      .post('/api/items')
      .field('title', 't')
      .field('tags', 'not-json')
      .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png'));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('caps tags to 10 items of 30 chars each', async () => {
    const app = createApp({ dataDir: root, distDir: '', version: 'test' });
    const tooMany = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const res = await request(app)
      .post('/api/items')
      .field('title', 't')
      .field('tags', JSON.stringify(tooMany))
      .attach('panorama', path.join(fixDir, 'panorama-2to1.jpg'))
      .attach('thumbnail', path.join(fixDir, 'depth-small.png'));
    expect(res.status).toBe(400);
  });
});
