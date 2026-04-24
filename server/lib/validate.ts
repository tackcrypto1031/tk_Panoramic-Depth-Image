import { LIMITS } from '../../shared/types.js';
import { ApiErrors } from './api-error.js';

export function validateTitle(raw: unknown): string {
  if (typeof raw !== 'string') throw ApiErrors.validation('title 必須為字串');
  const t = raw.trim();
  if (t.length === 0 || t.length > LIMITS.titleMaxLen) {
    throw ApiErrors.validation(`title 長度需在 1-${LIMITS.titleMaxLen} 字元之間`);
  }
  return t;
}

export function validateTagsJson(raw: unknown): string[] {
  if (typeof raw !== 'string') throw ApiErrors.validation('tags 需為 JSON 字串');
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw ApiErrors.validation('tags 不是合法 JSON');
  }
  if (!Array.isArray(arr)) throw ApiErrors.validation('tags 必須是陣列');
  const cleaned = Array.from(
    new Set(
      arr
        .filter((x): x is string => typeof x === 'string')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  );
  if (cleaned.length > LIMITS.tagsMaxCount) {
    throw ApiErrors.validation(`tags 最多 ${LIMITS.tagsMaxCount} 個`);
  }
  for (const t of cleaned) {
    if (t.length > LIMITS.tagMaxLen) {
      throw ApiErrors.validation(`tag 長度需 ≤ ${LIMITS.tagMaxLen} 字元：${t}`);
    }
  }
  return cleaned;
}

export function validateViewerSettingsPatch(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw !== 'object') throw ApiErrors.validation('viewerSettings 必須為物件');
  const s = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  if (s.depthScale !== undefined) {
    if (typeof s.depthScale !== 'number') throw ApiErrors.validation('depthScale 必須為數字');
    out.depthScale = clamp(s.depthScale, 0, 1);
  }
  if (s.parallaxAmount !== undefined) {
    if (typeof s.parallaxAmount !== 'number')
      throw ApiErrors.validation('parallaxAmount 必須為數字');
    out.parallaxAmount = clamp(s.parallaxAmount, 0, 1);
  }
  if (s.fov !== undefined) {
    if (typeof s.fov !== 'number') throw ApiErrors.validation('fov 必須為數字');
    out.fov = clamp(s.fov, LIMITS.fovMin, LIMITS.fovMax);
  }
  if (s.autoRotate !== undefined) {
    if (typeof s.autoRotate !== 'boolean') throw ApiErrors.validation('autoRotate 必須為布林');
    out.autoRotate = s.autoRotate;
  }
  if (s.autoRotateSpeed !== undefined) {
    if (typeof s.autoRotateSpeed !== 'number')
      throw ApiErrors.validation('autoRotateSpeed 必須為數字');
    out.autoRotateSpeed = clamp(
      s.autoRotateSpeed,
      LIMITS.autoRotateSpeedMin,
      LIMITS.autoRotateSpeedMax
    );
  }
  if (s.invertDepth !== undefined) {
    if (typeof s.invertDepth !== 'boolean') throw ApiErrors.validation('invertDepth 必須為布林');
    out.invertDepth = s.invertDepth;
  }
  return out;
}
