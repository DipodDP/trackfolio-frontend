import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Note: Server must be started manually before running E2E tests
  // Terminal 1: pnpm run build && pnpm run start
  // Terminal 2: pnpm test:e2e
  // See tests/e2e/README.md for detailed instructions
  // webServer: {
  //   command: 'pnpm run build && pnpm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 180 * 1000,
  // },
});
