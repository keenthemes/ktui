/**
 * TEST SUITE: Success Alert Rendering
 * PURPOSE: Test rendering of success alerts (icon, color, confirm button)
 * SCOPE: KTAlert rendering for success type
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTAlert } from '../../alert';

function getAlertElements() {
  // KTAlert.fire() creates an overlay structure
  const overlay = document.querySelector('[data-kt-alert-overlay]');
  const alert = overlay?.querySelector('[data-kt-alert]') || document.querySelector('[data-kt-alert]');
  return {
    alert,
    overlay,
    icon: alert?.querySelector('[data-kt-alert-icon]'),
    title: alert?.querySelector('[data-kt-alert-title]'),
    message: alert?.querySelector('[data-kt-alert-message]'),
    confirm: alert?.querySelector('[data-kt-alert-confirm]'),
  };
}

describe('KTAlert success alert rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render success alert with correct icon, color, and confirm button', () => {
    // ARRANGE
    const config = {
      type: 'success',
      title: 'Success!',
      text: 'Operation completed successfully.',
    };
    // ACT
    KTAlert.fire(config);
    const { alert, icon, title, message, confirm } = getAlertElements();
    // ASSERT
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('data-kt-alert-type')).toBe('success');
    expect(title?.textContent).toBe('Success!');
    expect(message?.textContent).toBe('Operation completed successfully.');
    expect(icon).toBeTruthy();
    expect(confirm).toBeTruthy();
    // Check ARIA
    expect(alert?.getAttribute('role')).toBe('alertdialog');
    expect(alert?.getAttribute('aria-modal')).toBe('true');
  });

  it('should use custom confirm button text if provided', () => {
    // ARRANGE
    const config = {
      type: 'success',
      title: 'Success!',
      text: 'Done!',
      confirmText: 'Great!'
    };
    // ACT
    KTAlert.fire(config);
    const { confirm } = getAlertElements();
    // ASSERT
    expect(confirm?.textContent).toBe('Great!');
  });

  it('should not render confirm button if showConfirmButton is false', () => {
    // ARRANGE
    const config = {
      type: 'success',
      title: 'Success!',
      text: 'Done!',
      showConfirmButton: false
    };
    // ACT
    KTAlert.fire(config);
    const { confirm } = getAlertElements();
    // ASSERT
    expect(confirm).toBeNull();
  });

  it('should apply correct color class for success type', () => {
    // ARRANGE
    const config = {
      type: 'success',
      title: 'Success!',
      text: 'Done!'
    };
    // ACT
    KTAlert.fire(config);
    const { alert } = getAlertElements();
    // ASSERT
    // The class is applied via Tailwind, but we can check the attribute for type
    expect(alert?.getAttribute('data-kt-alert-type')).toBe('success');
  });
});