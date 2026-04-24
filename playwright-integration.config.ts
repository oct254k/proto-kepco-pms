import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '**/verify-srm-integration.spec.ts',
  use: {
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
    locale: 'ko-KR',
  },
  reporter: [['list']],
});
