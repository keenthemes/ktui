// playwright-test.integration.spec.ts
// Comprehensive Playwright integration test for datepicker dropdown positioning and styling

import { test, expect } from '@playwright/test';

test.describe('Datepicker Dropdown Positioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/datepicker/dropdown-positioning-test.html');
  });

  test('should open dropdown below calendar icon with proper spacing', async ({ page }) => {
    // Click on the calendar button
    const calendarButton = page.locator('#basic-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    // Wait for dropdown to be visible
    const dropdown = page.locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check dropdown positioning
    const buttonRect = await calendarButton.boundingBox();
    const dropdownRect = await dropdown.boundingBox();

    expect(buttonRect).toBeTruthy();
    expect(dropdownRect).toBeTruthy();

    // Dropdown should be below the button
    expect(dropdownRect!.y).toBeGreaterThan(buttonRect!.y);

    // Dropdown should be aligned with the button (left edge)
    expect(dropdownRect!.x).toBeCloseTo(buttonRect!.x, 0);

    // Check for proper spacing (approximately 5px)
    const spacing = dropdownRect!.y - (buttonRect!.y + buttonRect!.height);
    expect(spacing).toBeGreaterThanOrEqual(4); // Allow for some tolerance
    expect(spacing).toBeLessThanOrEqual(8); // Allow for some tolerance
  });

  test('should have proper styling with shadows and borders', async ({ page }) => {
    // Open dropdown
    const calendarButton = page.locator('#basic-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    const dropdown = page.locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check for proper styling classes
    await expect(dropdown).toHaveClass(/kt-datepicker-dropdown/);
    await expect(dropdown).toHaveClass(/open/);

    // Check for rounded corners and shadow
    const dropdownStyle = await dropdown.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        border: computed.border,
        backgroundColor: computed.backgroundColor
      };
    });

    // Should have rounded corners
    expect(dropdownStyle.borderRadius).not.toBe('0px');

    // Should have shadow
    expect(dropdownStyle.boxShadow).not.toBe('none');

    // Should have border
    expect(dropdownStyle.border).not.toBe('none');
  });

  test('should close dropdown on outside click', async ({ page }) => {
    // Open dropdown
    const calendarButton = page.locator('#basic-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    const dropdown = page.locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Click outside the dropdown
    await page.click('body', { position: { x: 10, y: 10 } });

    // Dropdown should be hidden
    await expect(dropdown).not.toBeVisible();
  });

  test('should handle different placement configurations', async ({ page }) => {
    // Test bottom-start placement (default)
    const bottomStartButton = page.locator('text=Top Left').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await bottomStartButton.click();

    const bottomStartDropdown = page.locator('text=Top Left').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(bottomStartDropdown).toBeVisible();
    await bottomStartDropdown.click(); // Close it

    // Test bottom-end placement
    const bottomEndButton = page.locator('text=Top Right').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await bottomEndButton.click();

    const bottomEndDropdown = page.locator('text=Top Right').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(bottomEndDropdown).toBeVisible();
    await bottomEndDropdown.click(); // Close it

    // Test top-start placement
    const topStartButton = page.locator('text=Bottom Left').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await topStartButton.click();

    const topStartDropdown = page.locator('text=Bottom Left').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(topStartDropdown).toBeVisible();
    await topStartDropdown.click(); // Close it

    // Test top-end placement
    const topEndButton = page.locator('text=Bottom Right').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await topEndButton.click();

    const topEndDropdown = page.locator('text=Bottom Right').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(topEndDropdown).toBeVisible();
  });

  test('should work with time picker functionality', async ({ page }) => {
    // Open time picker dropdown
    const timeButton = page.locator('#time-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await timeButton.click();

    const timeDropdown = page.locator('#time-test').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(timeDropdown).toBeVisible();

    // Check for time picker container
    const timeContainer = timeDropdown.locator('[data-kt-datepicker-time-container]');
    await expect(timeContainer).toBeVisible();

    // Check for time controls
    const timeControls = timeContainer.locator('[data-kt-datepicker-time-controls]');
    await expect(timeControls).toBeVisible();
  });

  test('should work with multi-month configuration', async ({ page }) => {
    // Open multi-month dropdown
    const multiMonthButton = page.locator('#multi-month-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await multiMonthButton.click();

    const multiMonthDropdown = page.locator('#multi-month-test').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(multiMonthDropdown).toBeVisible();

    // Check for multi-month container
    const multiMonthContainer = multiMonthDropdown.locator('[data-kt-datepicker-multimonth-container]');
    await expect(multiMonthContainer).toBeVisible();

    // Should have multiple calendar panels
    const calendarPanels = multiMonthContainer.locator('.bg-white, .dark\\:bg-gray-900');
    await expect(calendarPanels).toHaveCount(2);
  });

  test('should work with range selection', async ({ page }) => {
    // Open range dropdown
    const rangeButton = page.locator('#range-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await rangeButton.click();

    const rangeDropdown = page.locator('#range-test').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(rangeDropdown).toBeVisible();

    // Check for footer with range buttons
    const footer = rangeDropdown.locator('.kt-datepicker-footer');
    await expect(footer).toBeVisible();

    // Check for apply button
    const applyButton = footer.locator('[data-kt-datepicker-apply]');
    await expect(applyButton).toBeVisible();
  });

  test('should handle edge cases near viewport boundaries', async ({ page }) => {
    // Test near right edge
    const rightEdgeButton = page.locator('text=Near Right Edge').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await rightEdgeButton.click();

    const rightEdgeDropdown = page.locator('text=Near Right Edge').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(rightEdgeDropdown).toBeVisible();

    // Check that dropdown doesn't overflow viewport
    const dropdownRect = await rightEdgeDropdown.boundingBox();
    const viewportWidth = page.viewportSize()!.width;

    expect(dropdownRect!.x + dropdownRect!.width).toBeLessThanOrEqual(viewportWidth);

    await rightEdgeDropdown.click(); // Close it

    // Test near bottom edge
    const bottomEdgeButton = page.locator('text=Near Bottom Edge').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await bottomEdgeButton.click();

    const bottomEdgeDropdown = page.locator('text=Near Bottom Edge').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(bottomEdgeDropdown).toBeVisible();

    // Check that dropdown doesn't overflow viewport
    const bottomDropdownRect = await bottomEdgeDropdown.boundingBox();
    const viewportHeight = page.viewportSize()!.height;

    expect(bottomDropdownRect!.y + bottomDropdownRect!.height).toBeLessThanOrEqual(viewportHeight);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Open dropdown
    const calendarButton = page.locator('#accessibility-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    const dropdown = page.locator('#accessibility-test').locator('..').locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check for proper ARIA attributes
    await expect(dropdown).toHaveAttribute('role', 'dialog');
    await expect(dropdown).toHaveAttribute('aria-modal', 'true');
    await expect(dropdown).toHaveAttribute('aria-label', 'Date picker');

    // Check calendar button ARIA attributes
    await expect(calendarButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(calendarButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('should have smooth transitions', async ({ page }) => {
    // Open dropdown and check for transition
    const calendarButton = page.locator('#basic-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    const dropdown = page.locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check for transition classes
    const dropdownStyle = await dropdown.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        transition: computed.transition,
        opacity: computed.opacity
      };
    });

    // Should have transition property
    expect(dropdownStyle.transition).toContain('opacity');

    // Should be fully visible
    expect(dropdownStyle.opacity).toBe('1');
  });

  test('should maintain proper z-index layering', async ({ page }) => {
    // Open dropdown
    const calendarButton = page.locator('#basic-test').locator('..').locator('button[data-kt-datepicker-calendar-btn]');
    await calendarButton.click();

    const dropdown = page.locator('[data-kt-datepicker-dropdown]');
    await expect(dropdown).toBeVisible();

    // Check z-index
    const zIndex = await dropdown.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });

    // Should have a high z-index to appear above other elements
    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });
});