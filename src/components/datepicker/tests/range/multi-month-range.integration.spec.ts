/**
 * TEST SUITE: KTDatepicker Integration (Multi-Month Range)
 * PURPOSE: Validate multi-month range selection functionality in the examples page.
 * SCOPE: Open, select start/end dates across months, check input values, observer reinitialization.
 * DEPENDENCIES: None (static HTML)
 * LAST UPDATED: 2025-07-24
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/examples/datepicker/examples.html';

test.describe('KTDatepicker Integration (Multi-Month Range)', () => {
  test('should display multi-month range datepicker correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find the Multi-Month Range section
    const multiMonthSection = page.locator('h3:has-text("Multi-Month Range")').locator('..');
    await expect(multiMonthSection).toBeVisible();

    // Check that the input exists
    const input = multiMonthSection.locator('#datepicker-multi-month');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Select a date range');
  });

  test('should open multi-month calendar with two months', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click the calendar button for Multi-Month Range
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Check that the dropdown is visible
    const dropdown = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check that multi-month container exists
    const multiMonthContainer = dropdown.locator('[data-kt-datepicker-multimonth-container]');
    await expect(multiMonthContainer).toBeVisible();

    // Check that there are exactly 2 month panels
    const monthPanels = multiMonthContainer.locator('.bg-white, .dark\\:bg-gray-900');
    await expect(monthPanels).toHaveCount(2);
  });

  test('should display correct month headers', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Check that the first month shows current month
    const firstMonthHeader = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('text=July 2025, August 2025');
    await expect(firstMonthHeader).toBeVisible();
  });

  test('should select start date in first month', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Click on day 15 in the first month (July)
    const day15Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('button:has-text("15")');
    await day15Button.click();

    // Check that the start date input field is updated
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    await expect(startContainer).toBeVisible();

    const startDay = startContainer.locator('[data-segment="day"]');
    await expect(startDay).toHaveText('15');
  });

  test('should select end date in second month', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Select start date first
    const day15Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('button:has-text("15")');
    await day15Button.click();

    // Click on day 20 in the second month (August)
    const day20Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').last().locator('button:has-text("20")');
    await day20Button.click();

    // Check that both start and end date input fields are updated
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    const endContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-end');

    await expect(startContainer).toBeVisible();
    await expect(endContainer).toBeVisible();

    const startDay = startContainer.locator('[data-segment="day"]');
    const startMonth = startContainer.locator('[data-segment="month"]');
    const endDay = endContainer.locator('[data-segment="day"]');
    const endMonth = endContainer.locator('[data-segment="month"]');

    await expect(startDay).toHaveText('15');
    await expect(startMonth).toHaveText('07'); // July
    await expect(endDay).toHaveText('20');
    await expect(endMonth).toHaveText('08'); // August
  });

  test('should show Apply button in range mode', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Check that the Apply button is visible (range mode shows footer)
    const applyButton = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-dropdown]').locator('button:has-text("Apply")');
    await expect(applyButton).toBeVisible();
  });

  test('should handle range selection across multiple months correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Select start date in July
    const day15Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('button:has-text("15")');
    await day15Button.click();

    // Select end date in August
    const day20Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').last().locator('button:has-text("20")');
    await day20Button.click();

    // Verify the complete range is displayed correctly
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    const endContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-end');

    // Check start date (July 15)
    await expect(startContainer.locator('[data-segment="day"]')).toHaveText('15');
    await expect(startContainer.locator('[data-segment="month"]')).toHaveText('07');
    await expect(startContainer.locator('[data-segment="year"]')).toHaveText('2025');

    // Check end date (August 20)
    await expect(endContainer.locator('[data-segment="day"]')).toHaveText('20');
    await expect(endContainer.locator('[data-segment="month"]')).toHaveText('08');
    await expect(endContainer.locator('[data-segment="year"]')).toHaveText('2025');
  });

  test('should maintain range selection when calendar is reopened', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar and select a range
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Select start date
    const day15Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('button:has-text("15")');
    await day15Button.click();

    // Select end date
    const day20Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').last().locator('button:has-text("20")');
    await day20Button.click();

    // Close the calendar by clicking outside
    await page.click('body');

    // Reopen the calendar
    await calendarButton.click();

    // Verify the range is still selected
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    const endContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-end');

    await expect(startContainer.locator('[data-segment="day"]')).toHaveText('15');
    await expect(endContainer.locator('[data-segment="day"]')).toHaveText('20');
  });

  test('should handle observer reinitialization correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Wait for the observer reinitialization to complete
    await page.waitForTimeout(200);

    // Check that the range containers are properly initialized
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    const endContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-end');

    await expect(startContainer).toBeVisible();
    await expect(endContainer).toBeVisible();

    // Verify the containers have the correct structure
    await expect(startContainer.locator('[data-segment="day"]')).toBeVisible();
    await expect(startContainer.locator('[data-segment="month"]')).toBeVisible();
    await expect(startContainer.locator('[data-segment="year"]')).toBeVisible();
    await expect(endContainer.locator('[data-segment="day"]')).toBeVisible();
    await expect(endContainer.locator('[data-segment="month"]')).toBeVisible();
    await expect(endContainer.locator('[data-segment="year"]')).toBeVisible();
  });

  test('should handle invalid range selection (end before start)', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open the calendar
    const calendarButton = page.locator('#datepicker-multi-month').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Select a later date first (August 20)
    const day20Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').last().locator('button:has-text("20")');
    await day20Button.click();

    // Then select an earlier date (July 15)
    const day15Button = page.locator('#datepicker-multi-month').locator('..').locator('[data-kt-datepicker-multimonth-container]').locator('.bg-white, .dark\\:bg-gray-900').first().locator('button:has-text("15")');
    await day15Button.click();

    // Check that the range is cleared and only the end date remains
    const startContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-start');
    const endContainer = page.locator('#datepicker-multi-month').locator('..').locator('.ktui-segmented-input-end');

    // The start container should be empty or show default values
    const startDay = startContainer.locator('[data-segment="day"]');
    const endDay = endContainer.locator('[data-segment="day"]');

    await expect(endDay).toHaveText('15'); // The new selection becomes the end date
  });
});