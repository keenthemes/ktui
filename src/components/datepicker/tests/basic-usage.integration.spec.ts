// basic-usage.integration.spec.ts
// Playwright integration test for the KTDatepicker component using the basic-usage.html example.
// This test loads the example page, interacts with the datepicker, and checks for expected DOM changes.

import { test, expect } from '@playwright/test';

test.describe('KTDatepicker Integration: basic-usage.html', () => {
  test('should open the datepicker and select a date', async ({ page }) => {
    await page.goto('/basic-usage.html');

    // Find the input and click to open the datepicker
    const input = await page.locator('input[type="text"]');
    await input.click();

    // Wait for the calendar popup to appear
    const calendar = page.locator('.kt-datepicker-calendar');
    await expect(calendar).toBeVisible();

    // Click the first available day button
    const dayButton = calendar.locator('button[data-day]:not([disabled])').first();
    const selectedDay = await dayButton.textContent();
    await dayButton.click();

    // Assert that the input value is updated to the selected day
    await expect(input).toHaveValue(selectedDay || '');
  });
});