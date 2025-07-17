/**
 * TEST SUITE: Info Alert Rendering
 * PURPOSE: Test rendering of info alerts (icon, title, message, ARIA, default config)
 * SCOPE: KTAlert rendering for info type
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
  };
}

describe('KTAlert info alert rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render info alert with correct icon, title, and message', () => {
    // ARRANGE
    const config = {
      type: 'info',
      title: 'Information',
      text: 'This is an info alert.',
    };
    // ACT
    KTAlert.fire(config);
    const { alert, icon, title, message } = getAlertElements();
    // ASSERT
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('data-kt-alert-type')).toBe('info');
    expect(title?.textContent).toBe('Information');
    expect(message?.textContent).toBe('This is an info alert.');
    expect(icon).toBeTruthy();
    // Check ARIA
    expect(alert?.getAttribute('role')).toBe('alertdialog');
    expect(alert?.getAttribute('aria-modal')).toBe('true');
  });

  it('should fallback to default title/message if not provided', () => {
    // ARRANGE
    const config = { type: 'info' };
    // ACT
    KTAlert.fire(config);
    const { title, message } = getAlertElements();
    // ASSERT
    expect(title?.textContent).toBeDefined();
    expect(message?.textContent).toBeDefined();
  });

  it('should render with custom id if provided', () => {
    // ARRANGE
    const config = { type: 'info', title: 'Info', text: 'Msg', id: 'custom-id' };
    // ACT
    KTAlert.fire(config);
    const { alert } = getAlertElements();
    // ASSERT
    expect(alert?.id).toBe('custom-id');
  });

  it('should not render icon if icon: false is set', () => {
    // ARRANGE
    const config = { type: 'info', title: 'Info', text: 'Msg', icon: false };
    // ACT
    KTAlert.fire(config);
    const { icon } = getAlertElements();
    // ASSERT
    expect(icon).toBeNull();
  });
});