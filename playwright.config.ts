import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/browser',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: 'https://docverse.uz',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
