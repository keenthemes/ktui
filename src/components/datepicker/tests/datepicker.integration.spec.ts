/**
 * TEST SUITE: KTDatepicker Integration (Basic Usage)
 * PURPOSE: Validate core datepicker UI flows on the basic usage example page.
 * SCOPE: Open/close, select date, today, clear, apply actions.
 * DEPENDENCIES: None (static HTML, no backend)
 * LAST UPDATED: 2025-07-16
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:50505/examples/datepicker/basic-usage';

test.describe('KTDatepicker Integration (Basic Usage)', () => {
  test('should open the datepicker when the button is clicked', async ({ page }) => {
    // ARRANGE
    await page.goto(BASE_URL);
    // ACT
    await page.getByRole('button', { name: /open calendar/i }).click();
    // ASSERT
    const calendar = await page.getByText(/july 2025/i);
    // If this fails: Calendar did not appear after clicking Open calendar button.
    await expect(calendar).toBeVisible();
  });

  test('should select a date and update the input', async ({ page }) => {
    // ARRANGE
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // ACT
    await page.getByRole('button', { name: /^15$/ }).click();
    // ASSERT
    const input = await page.getByRole('textbox');
    // If this fails: Input did not update with selected date (15).
    await expect(input).toHaveValue(/15/);
  });

  test('should select today and update the input', async ({ page }) => {
    // ARRANGE
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // ACT
    await page.getByRole('button', { name: /today/i }).click();
    // ASSERT
    const input = await page.getByRole('textbox');
    const today = new Date();
    const day = today.getDate().toString();
    // If this fails: Input did not update with today\'s date.
    await expect(input).toHaveValue(new RegExp(day));
  });

  test('should clear the input when Clear is clicked', async ({ page }) => {
    // ARRANGE
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    await page.getByRole('button', { name: /^15$/ }).click();
    await page.getByRole('button', { name: /open calendar/i }).click();
    // ACT
    await page.getByRole('button', { name: /clear/i }).click();
    // ASSERT
    const input = await page.getByRole('textbox');
    // If this fails: Input was not cleared after clicking Clear.
    await expect(input).toHaveValue('');
  });

  test('should close the datepicker when Apply is clicked', async ({ page }) => {
    // ARRANGE
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /open calendar/i }).click();
    // ACT
    await page.getByRole('button', { name: /apply/i }).click();
    // ASSERT
    const calendar = page.getByText(/july 2025/i);
    // If this fails: Calendar did not close after clicking Apply.
    await expect(calendar).not.toBeVisible();
  });
});