/**
 * TEST SUITE: KTDatepicker Integration (Close On Select False)
 * PURPOSE: Validate that the calendar remains open after selection when closeOnSelect is false.
 * SCOPE: Open, select date, assert calendar remains open.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/close-on-select-false.html';

test.describe('KTDatepicker Integration (Close On Select False)', () => {
  test('should keep calendar open after date selection', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    await page.getByRole('button', { name: /^9$/ }).click();
    // Calendar should still be visible
    await expect(page.locator('[data-kt-datepicker-dropdown]')).toBeVisible();
  });
  // Additional closeOnSelect edge case tests to be implemented
});