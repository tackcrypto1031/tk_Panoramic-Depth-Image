import pino from 'pino';
import path from 'node:path';
import fs from 'node:fs';
import { config } from '../config.js';

const logsDir = path.join(config.dataDir, 'logs');
fs.mkdirSync(logsDir, { recursive: true });

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss' },
      }
    : {
        targets: [
          {
            target: 'pino/file',
            options: { destination: path.join(logsDir, 'server.log') },
            level: 'info',
          },
          { target: 'pino-pretty', options: { colorize: false }, level: 'info' },
        ],
      },
});
