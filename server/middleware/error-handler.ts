import type { Request, Response, NextFunction } from 'express';
import { ApiException } from '../lib/api-error.js';
import { logger } from '../lib/logger.js';
import type { ApiError } from '../../shared/types.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiException) {
    const body: ApiError = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.status).json(body);
    return;
  }
  logger.error({ err }, 'unhandled error');
  const body: ApiError = { error: { code: 'INTERNAL', message: '伺服器內部錯誤' } };
  res.status(500).json(body);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = { error: { code: 'NOT_FOUND', message: '路徑不存在' } };
  res.status(404).json(body);
}
