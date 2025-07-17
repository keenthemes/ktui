/**
 * TEST SUITE: KTDatepicker Integration (MultiDate Apply)
 * PURPOSE: Validate multi-date selection and apply behavior in the multidate-apply example.
 * SCOPE: Open, select multiple dates, apply, check input value.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/multidate-apply.html';

test.describe('KTDatepicker Integration (MultiDate Apply)', () => {
  test('should allow selecting multiple dates and applying', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Select multiple dates (example: 3 and 7)
    await page.getByRole('button', { name: /^3$/ }).click();
    await page.getByRole('button', { name: /^7$/ }).click();
    // Click Apply
    await page.getByRole('button', { name: /apply/i }).click();
    const input = await page.getByRole('textbox');
    // Input should reflect the selected dates
    await expect(input).toHaveValue(/3.*7/);
  });
  // Additional multi-date edge case tests to be implemented
});