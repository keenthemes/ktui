/**
 * TEST SUITE: KTDatepicker Integration (Min/Max)
 * PURPOSE: Validate min/max date constraints in the minmax-datepicker example.
 * SCOPE: Open, try to select out-of-range date, assert disabled, select valid date.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/minmax-datepicker.html';

test.describe('KTDatepicker Integration (Min/Max)', () => {
  test('should disable out-of-range dates', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // Example: try to click a disabled date (e.g., 1st if min is 5)
    const disabledBtn = await page.getByRole('button', { name: /^1$/ });
    await expect(disabledBtn).toBeDisabled();
    // Select a valid date (e.g., 10)
    const validBtn = await page.getByRole('button', { name: /^10$/ });
    await validBtn.click();
    const input = await page.getByRole('textbox');
    await expect(input).toHaveValue(/10/);
  });
});