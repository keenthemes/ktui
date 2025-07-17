/**
 * TEST SUITE: KTDatepicker Integration (Format)
 * PURPOSE: Validate custom date format in the format-datepicker example.
 * SCOPE: Open, select date, check formatted input value.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/format-datepicker.html';

test.describe('KTDatepicker Integration (Format)', () => {
  test('should display selected date in custom format', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Select a date (example: 12)
    await page.getByRole('button', { name: /^12$/ }).click();
    const input = await page.getByRole('textbox');
    // Input should match custom format (e.g., dd.mm.yyyy)
    await expect(input).toHaveValue(/\d{2}\.\d{2}\.\d{4}/);
  });
  // Additional format edge case tests to be implemented
});