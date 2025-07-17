/**
 * TEST SUITE: Attribute Config
 * PURPOSE: Test config via data attributes only
 * SCOPE: KTAlert config from data attributes
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert attribute config', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should read config from data attributes', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-type', 'error');
    element.setAttribute('data-kt-alert-title', 'Error Title');
    element.setAttribute('data-kt-alert-message', 'Error Message');
    element.setAttribute('data-kt-alert-icon', 'error');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.type).toBe('error');
    expect((alert as any)._config.title).toBe('Error Title');
    expect((alert as any)._config.message).toBe('Error Message');
    expect((alert as any)._config.icon).toBe('error');
  });

  it('should convert kebab-case attributes to camelCase', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-show-confirm-button', 'true');
    element.setAttribute('data-kt-alert-show-cancel-button', 'false');
    element.setAttribute('data-kt-alert-allow-outside-click', 'true');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.showConfirmButton).toBe(true);
    expect((alert as any)._config.showCancelButton).toBe(false);
    expect((alert as any)._config.allowOutsideClick).toBe(true);
  });

  it('should handle string values for non-boolean/non-numeric attributes', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-confirm-text', 'Yes, do it!');
    element.setAttribute('data-kt-alert-cancel-text', 'No, cancel');
    element.setAttribute('data-kt-alert-position', 'top');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.confirmText).toBe('Yes, do it!');
    expect((alert as any)._config.cancelText).toBe('No, cancel');
    expect((alert as any)._config.position).toBe('top');
  });

  it('should ignore non-data-kt-alert attributes', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-type', 'info');
    element.setAttribute('data-other-attr', 'should-be-ignored');
    element.setAttribute('class', 'some-class');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.type).toBe('info');
    expect((alert as any)._config).not.toHaveProperty('data-other-attr');
    expect((alert as any)._config).not.toHaveProperty('class');
  });

  it('should handle empty attribute values', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-title', '');
    element.setAttribute('data-kt-alert-message', '');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.title).toBe('');
    expect((alert as any)._config.message).toBe('');
  });
});