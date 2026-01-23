import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  webServer: {
    command: 'npx http-server ./src/web -p 8080 -c-1',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
    timeout: 120000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8080',
  },
  projects: [
    {
      name: 'Local - Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Staging - Chromium',
      testMatch: '**/staging-*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
