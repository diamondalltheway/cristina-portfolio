import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      testIgnore: '**/hero-mobile.test.ts',
      use: { channel: 'chrome' },
    },
    {
      name: 'mobile-safari',
      testMatch: '**/hero-mobile.test.ts',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
        deviceScaleFactor: 1,
        javaScriptEnabled: false,
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    env: { SLACK_WEBHOOK_URL: '' },
  },
});
