/**
 * TEST SUITE: KTDatepicker Integration (Range)
 * PURPOSE: Validate date range selection in the range example.
 * SCOPE: Open, select start/end, check input value.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/range.html';

test.describe('KTDatepicker Integration (Range)', () => {
  test('should allow selecting a date range', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Select start and end dates (example: 5 and 15)
    await page.getByRole('button', { name: /^5$/ }).click();
    await page.getByRole('button', { name: /^15$/ }).click();
    const input = await page.getByRole('textbox');
    // Input should reflect the selected range
    await expect(input).toHaveValue(/5.*15/);
  });
  // Additional range edge case tests to be implemented
});