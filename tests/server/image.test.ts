import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { processPanorama, processDepth, validatePanoramaRatio } from '@server/lib/image.js';

const fixDir = path.join(__dirname, '..', 'fixtures');

describe('image', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(fixDir, 'panorama-2to1.jpg'))) {
      throw new Error('Run `node tests/fixtures/generate-fixtures.cjs` first');
    }
  });

  describe('validatePanoramaRatio', () => {
    it('accepts 2:1', () => {
      expect(validatePanoramaRatio(4096, 2048)).toBe(true);
      expect(validatePanoramaRatio(2000, 1000)).toBe(true);
    });
    it('accepts near-2:1 within tolerance', () => {
      expect(validatePanoramaRatio(1900, 1000)).toBe(true); // 1.9
      expect(validatePanoramaRatio(2100, 1000)).toBe(true); // 2.1
    });
    it('rejects 16:9', () => {
      expect(validatePanoramaRatio(1920, 1080)).toBe(false);
    });
  });

  describe('processPanorama', () => {
    it('passes through normal-sized panorama unchanged in pixels', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'img-'));
      const out = path.join(tmp, 'out.jpg');
      const res = await processPanorama(path.join(fixDir, 'panorama-2to1.jpg'), out);
      expect(res.width).toBe(4096);
      expect(res.height).toBe(2048);
      expect(res.originalWidth).toBeUndefined();
      expect(fs.existsSync(out)).toBe(true);
    });

    it('resizes huge panorama to 8192x4096 max', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'img-'));
      const out = path.join(tmp, 'out.jpg');
      const res = await processPanorama(path.join(fixDir, 'panorama-huge.jpg'), out);
      expect(res.width).toBe(8192);
      expect(res.height).toBe(4096);
      expect(res.originalWidth).toBe(10000);
      expect(res.originalHeight).toBe(5000);
    });
  });

  describe('processDepth', () => {
    it('converts colored PNG to greyscale and resizes to target', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'img-'));
      const out = path.join(tmp, 'depth.png');
      const res = await processDepth(path.join(fixDir, 'depth-colored.png'), out, {
        targetWidth: 2048,
        targetHeight: 1024,
      });
      expect(res.width).toBe(2048);
      expect(res.height).toBe(1024);
      const meta = await sharp(out).metadata();
      expect(meta.channels).toBe(1);
    });

    it('resizes smaller depth up to match target', async () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'img-'));
      const out = path.join(tmp, 'depth.png');
      const res = await processDepth(path.join(fixDir, 'depth-small.png'), out, {
        targetWidth: 2048,
        targetHeight: 1024,
      });
      expect(res.width).toBe(2048);
      expect(res.height).toBe(1024);
    });
  });
});
