import fs from 'node:fs';
import path from 'node:path';

interface Config {
  port: number;
  dataDir: string;
  distDir: string;
  version: string;
}

function loadConfig(): Config {
  const projectRoot = path.resolve(import.meta.dirname, '..', '..');
  // dev mode: import.meta.dirname = .../server; prod mode: .../dist/server
  const isDev = !import.meta.dirname.includes(path.sep + 'dist' + path.sep);
  const root = isDev ? path.resolve(import.meta.dirname, '..') : projectRoot;

  let port = 3001;
  const configPath = path.join(root, 'data', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (typeof cfg.port === 'number') port = cfg.port;
    } catch {
      // ignore malformed config
    }
  }
  if (process.env.PORT) port = Number(process.env.PORT);

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

  if (process.env.E2E_DATA_DIR) {
    return {
      port,
      dataDir: path.resolve(process.env.E2E_DATA_DIR),
      distDir: path.join(root, 'dist', 'client'),
      version: pkg.version,
    };
  }

  return {
    port,
    dataDir: path.join(root, 'data'),
    distDir: path.join(root, 'dist', 'client'),
    version: pkg.version,
  };
}

export const config = loadConfig();
