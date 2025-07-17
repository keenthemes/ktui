// playwright-test.integration.spec.ts
// Minimal Playwright integration test for static HTML input

import { test, expect } from '@playwright/test';

test('Playwright example: should type into the input and assert value', async ({ page }) => {
  await page.goto('/datepicker/playwright-test.html');
  const input = page.locator('#test-input');
  await expect(input).toBeVisible();
  await input.fill('Hello Playwright!');
  await expect(input).toHaveValue('Hello Playwright!');
});