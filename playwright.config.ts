// playwright.config.ts
// Playwright configuration for integration testing ktui components using example HTML files as test harnesses.
// This config sets up a static server for the examples/datepicker directory and runs tests from the datepicker/tests directory.

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/components/datepicker/tests',
  testMatch: /.*\.integration\.spec\.ts$/,
  webServer: {
    command: 'npx serve ./examples -l 50505',
    port: 50505,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:50505',
    browserName: 'chromium', // You can add more browsers if needed
    headless: true,
  },
});