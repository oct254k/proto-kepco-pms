import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'playwright-verify.spec.ts',
  use: {
    baseURL: 'http://localhost:3100',
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    locale: 'ko-KR',
  },
  outputDir: 'playwright-results/',
  reporter: [['list'], ['json', { outputFile: 'playwright-results/report.json' }]],
});
