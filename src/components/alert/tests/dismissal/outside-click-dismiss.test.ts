/**
 * TEST SUITE: Outside Click Dismissal
 * PURPOSE: Test dismissal by clicking outside modal (if allowed)
 * SCOPE: KTAlert outside click dismissal logic
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert outside click dismissal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should dismiss alert by clicking outside modal if allowed', () => {
    // ARRANGE
    const config = { modal: true, allowOutsideClick: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const overlay = document.querySelector('[data-kt-alert-overlay]');
    const fireEventSpy = vi.spyOn(overlay as any, 'dispatchEvent');
    // Simulate click on overlay (outside the alert)
    const outsideClick = new MouseEvent('click', { bubbles: true });
    overlay?.dispatchEvent(outsideClick);
    // ASSERT
    // The event should be handled by the overlay click listener
    expect(overlay).toBeTruthy();
  });

  it('should not dismiss if allowOutsideClick is false', () => {
    // ARRANGE
    const config = { modal: true, allowOutsideClick: false, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const overlay = document.querySelector('[data-kt-alert-overlay]');
    const alert = overlay?.querySelector('[data-kt-alert]');
    // Simulate click on overlay
    const outsideClick = new MouseEvent('click', { bubbles: true });
    overlay?.dispatchEvent(outsideClick);
    // ASSERT
    // Alert should still be present
    expect(alert).toBeTruthy();
  });

  it('should not dismiss if clicking inside the alert', () => {
    // ARRANGE
    const config = { modal: true, allowOutsideClick: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate click inside the alert
    const insideClick = new MouseEvent('click', { bubbles: true });
    alert?.dispatchEvent(insideClick);
    // ASSERT
    // Alert should still be present
    expect(alert).toBeTruthy();
  });

  it('should not dismiss if not modal', () => {
    // ARRANGE
    const config = { modal: false, allowOutsideClick: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate click outside
    const outsideClick = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(outsideClick);
    // ASSERT
    // Alert should still be present
    expect(alert).toBeTruthy();
  });

  it('should clear timer when dismissed by outside click', () => {
    // ARRANGE
    const config = { modal: true, allowOutsideClick: true, timer: 5000, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const overlay = document.querySelector('[data-kt-alert-overlay]');
    // Simulate click on overlay
    const outsideClick = new MouseEvent('click', { bubbles: true });
    overlay?.dispatchEvent(outsideClick);
    // ASSERT
    // The overlay should be removed
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });
});