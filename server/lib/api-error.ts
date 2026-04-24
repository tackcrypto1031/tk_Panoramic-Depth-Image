import type { ApiErrorCode } from '../../shared/types.js';

export class ApiException extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
  }
}

export const ApiErrors = {
  invalidRatio: (w: number, h: number) =>
    new ApiException('INVALID_RATIO', `全景圖長寬比需為 2:1（目前 ${(w / h).toFixed(2)}:1）`, 400, {
      width: w,
      height: h,
      ratio: w / h,
    }),
  fileTooLarge: (size: number, max: number) =>
    new ApiException('FILE_TOO_LARGE', `檔案超過大小上限（${size} > ${max}）`, 413, { size, max }),
  unsupportedMime: (mime: string) =>
    new ApiException('UNSUPPORTED_MIME', `不支援的檔案格式：${mime}`, 400, { mime }),
  notFound: (what: string) => new ApiException('NOT_FOUND', `找不到${what}`, 404),
  validation: (message: string, details?: unknown) =>
    new ApiException('VALIDATION', message, 400, details),
};
