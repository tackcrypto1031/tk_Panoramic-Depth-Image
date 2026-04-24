import sharp from 'sharp';
import type { ImageMeta } from '../../shared/types.js';
import { LIMITS } from '../../shared/types.js';

export function validatePanoramaRatio(w: number, h: number): boolean {
  const r = w / h;
  return r >= LIMITS.ratioMin && r <= LIMITS.ratioMax;
}

export interface ProcessResult {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
}

export async function processPanorama(
  inputPath: string,
  outputPath: string
): Promise<ProcessResult> {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w === 0 || h === 0) throw new Error('invalid panorama dimensions');

  const needsResize = w > LIMITS.imageMaxW || h > LIMITS.imageMaxH;
  if (needsResize) {
    await img
      .resize({ width: LIMITS.imageMaxW, height: LIMITS.imageMaxH, fit: 'inside' })
      .toFile(outputPath);
    const out = await sharp(outputPath).metadata();
    return {
      width: out.width ?? LIMITS.imageMaxW,
      height: out.height ?? LIMITS.imageMaxH,
      originalWidth: w,
      originalHeight: h,
    };
  }
  await img.toFile(outputPath);
  return { width: w, height: h };
}

export interface DepthOptions {
  targetWidth: number;
  targetHeight: number;
}

export async function processDepth(
  inputPath: string,
  outputPath: string,
  opts: DepthOptions
): Promise<ProcessResult> {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const ow = meta.width ?? 0;
  const oh = meta.height ?? 0;

  await img
    .resize({ width: opts.targetWidth, height: opts.targetHeight, fit: 'fill' })
    .greyscale()
    .toColourspace('b-w')
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return {
    width: opts.targetWidth,
    height: opts.targetHeight,
    originalWidth: ow !== opts.targetWidth ? ow : undefined,
    originalHeight: oh !== opts.targetHeight ? oh : undefined,
  };
}

export async function probeImageSize(
  inputPath: string
): Promise<{ width: number; height: number; mimeType: string }> {
  const meta = await sharp(inputPath).metadata();
  const mime = meta.format
    ? `image/${meta.format === 'jpg' ? 'jpeg' : meta.format}`
    : 'application/octet-stream';
  return { width: meta.width ?? 0, height: meta.height ?? 0, mimeType: mime };
}

export function toMeta(filename: string, result: ProcessResult, mimeType: string): ImageMeta {
  const meta: ImageMeta = { filename, width: result.width, height: result.height, mimeType };
  if (result.originalWidth !== undefined) meta.originalWidth = result.originalWidth;
  if (result.originalHeight !== undefined) meta.originalHeight = result.originalHeight;
  return meta;
}
