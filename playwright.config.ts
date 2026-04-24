import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && cross-env PORT=3100 node dist/server/index.js',
    url: 'http://127.0.0.1:3100/api/health',
    timeout: 120_000,
    reuseExistingServer: false,
    env: { E2E_DATA_DIR: '.e2e-data' },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
