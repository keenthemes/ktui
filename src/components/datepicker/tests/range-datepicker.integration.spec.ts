/**
 * TEST SUITE: KTDatepicker Integration (Range Datepicker)
 * PURPOSE: Validate date range selection in the range-datepicker example.
 * SCOPE: Open, select start/end, check input value.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/range-datepicker.html';

test.describe('KTDatepicker Integration (Range Datepicker)', () => {
  test('should allow selecting a date range', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Select start and end dates (example: 10 and 20)
    await page.getByRole('button', { name: /^10$/ }).click();
    await page.getByRole('button', { name: /^20$/ }).click();
    const input = await page.getByRole('textbox');
    // Input should reflect the selected range
    await expect(input).toHaveValue(/10.*20/);
  });
  // Additional range edge case tests to be implemented
});