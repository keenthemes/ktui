/**
 * TEST SUITE: KTDatepicker Integration (Disabled)
 * PURPOSE: Validate disabled state in the disable-datepicker example.
 * SCOPE: Open, try to interact, assert input/button disabled.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/disable-datepicker.html';

test.describe('KTDatepicker Integration (Disabled)', () => {
  test('should have disabled input and calendar button', async ({ page }) => {
    await page.goto(BASE_URL);
    const input = await page.getByRole('textbox');
    await expect(input).toBeDisabled();
    const calendarBtn = await page.getByRole('button', { name: /open calendar/i });
    await expect(calendarBtn).toBeDisabled();
  });
  // Additional disabled state edge case tests to be implemented
});