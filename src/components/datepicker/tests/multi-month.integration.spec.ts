/**
 * TEST SUITE: KTDatepicker Integration (Multi-Month)
 * PURPOSE: Validate multi-month display and navigation in the multi-month example.
 * SCOPE: Open, check two months, navigate months.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/multi-month.html';

test.describe('KTDatepicker Integration (Multi-Month)', () => {
  test('should display two months side by side', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    const calendars = await page.locator('[data-kt-datepicker-multimonth-container]');
    await expect(calendars).toBeVisible();
    await expect(await calendars.locator('[data-kt-datepicker-header]').count()).toBe(2);
    await expect(await calendars.locator('[data-kt-datepicker-calendar-table]').count()).toBe(2);
  });
  // Additional navigation and edge case tests to be implemented
});