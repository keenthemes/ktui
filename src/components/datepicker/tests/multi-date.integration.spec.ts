/**
 * TEST SUITE: KTDatepicker Integration (Multi-Date)
 * PURPOSE: Validate multi-date selection in the multi-date example.
 * SCOPE: Open, select multiple dates, check input value.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/multi-date.html';

test.describe('KTDatepicker Integration (Multi-Date)', () => {
  test('should allow selecting multiple dates', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Select multiple dates (example: 2 and 8)
    await page.getByRole('button', { name: /^2$/ }).click();
    await page.getByRole('button', { name: /^8$/ }).click();
    const input = await page.getByRole('textbox');
    // Input should reflect the selected dates
    await expect(input).toHaveValue(/2.*8/);
  });
  // Additional multi-date edge case tests to be implemented
});