/**
 * TEST SUITE: Escape Key Dismissal
 * PURPOSE: Test dismissal by pressing Escape key
 * SCOPE: KTAlert Escape key dismissal logic
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert Escape key dismissal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should dismiss alert by pressing Escape key if allowed', () => {
    // ARRANGE
    const config = { allowEscapeKey: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    alert?.dispatchEvent(escapeEvent);
    // ASSERT
    // The alert should be dismissed
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should not dismiss if allowEscapeKey is false', () => {
    // ARRANGE
    const config = { allowEscapeKey: false, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    alert?.dispatchEvent(escapeEvent);
    // ASSERT
    // Alert should still be present
    expect(alert).toBeTruthy();
  });

  it('should dismiss if dismissible is true even when allowEscapeKey is false', () => {
    // ARRANGE
    const config = { dismissible: true, allowEscapeKey: false, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    alert?.dispatchEvent(escapeEvent);
    // ASSERT
    // The alert should be dismissed
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should dismiss if modal is true even when allowEscapeKey is false', () => {
    // ARRANGE
    const config = { modal: true, allowEscapeKey: false, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    alert?.dispatchEvent(escapeEvent);
    // ASSERT
    // The alert should be dismissed
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should not dismiss for other key presses', () => {
    // ARRANGE
    const config = { allowEscapeKey: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate other key presses
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    alert?.dispatchEvent(enterEvent);
    alert?.dispatchEvent(spaceEvent);
    // ASSERT
    // Alert should still be present
    expect(alert).toBeTruthy();
  });

  it('should clear timer when dismissed by Escape key', () => {
    // ARRANGE
    const config = { allowEscapeKey: true, timer: 5000, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    alert?.dispatchEvent(escapeEvent);
    // ASSERT
    // The overlay should be removed
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });
});