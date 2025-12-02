/**
 * TEST SUITE: Custom Content Alert Rendering
 * PURPOSE: Test rendering of alerts with custom HTML/content
 * SCOPE: KTAlert rendering with customContent config
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
    custom: alert?.querySelector('[data-kt-alert-custom-content]'),
    icon: alert?.querySelector('[data-kt-alert-icon]'),
    title: alert?.querySelector('[data-kt-alert-title]'),
    message: alert?.querySelector('[data-kt-alert-message]'),
  };
}

describe('KTAlert custom content rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render alert with custom HTML content', () => {
    // ARRANGE
    const config = {
      type: 'info',
      title: 'Custom',
      customContent: '<div id="my-custom">Hello <b>World</b></div>'
    };
    // ACT
    KTAlert.fire(config);
    const { alert, custom } = getAlertElements();
    // ASSERT
    expect(alert).toBeTruthy();
    expect(custom?.innerHTML).toContain('Hello <b>World</b>');
    expect(custom?.querySelector('#my-custom')).toBeTruthy();
  });

  it('should render custom content alongside title and message', () => {
    // ARRANGE
    const config = {
      type: 'info',
      title: 'Custom',
      text: 'This is a message',
      customContent: '<span id="extra">Extra</span>'
    };
    // ACT
    KTAlert.fire(config);
    const { title, message, custom } = getAlertElements();
    // ASSERT
    expect(title?.textContent).toBe('Custom');
    expect(message?.textContent).toBe('This is a message');
    expect(custom?.innerHTML).toContain('Extra');
    expect(custom?.querySelector('#extra')).toBeTruthy();
  });

  it('should not render custom content if not provided', () => {
    // ARRANGE
    const config = {
      type: 'info',
      title: 'No Custom'
    };
    // ACT
    KTAlert.fire(config);
    const { custom } = getAlertElements();
    // ASSERT
    // custom-content fragment may be present but empty
    expect(custom?.innerHTML === '' || custom == null).toBeTruthy();
  });
});