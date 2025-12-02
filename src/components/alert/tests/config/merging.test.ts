/**
 * TEST SUITE: Config Merging
 * PURPOSE: Test config merging order (default, global, data attributes, JSON, user config)
 * SCOPE: KTAlert config merging logic
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert config merging', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should merge configs in correct order of precedence', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-type', 'warning');
    element.setAttribute('data-kt-alert-title', 'From Data Attr');
    element.setAttribute('data-kt-alert-config', JSON.stringify({ title: 'From JSON', dismissible: true }));
    document.body.appendChild(element);
    const userConfig = { title: 'From User', customContent: 'User Content' };
    // ACT
    const alert = new KTAlert(element, userConfig);
    // ASSERT
    // Check that user config overrides all others
    expect((alert as any)._config.title).toBe('From User');
    expect((alert as any)._config.customContent).toBe('User Content');
    // Check that JSON config is applied
    expect((alert as any)._config.dismissible).toBe(true);
    // Check that data attribute is applied
    expect((alert as any)._config.type).toBe('warning');
  });

  it('should handle boolean values correctly from data attributes', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-dismissible', 'true');
    element.setAttribute('data-kt-alert-modal', 'false');
    element.setAttribute('data-kt-alert-show-confirm-button', 'true');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.dismissible).toBe(true);
    expect((alert as any)._config.modal).toBe(false);
    expect((alert as any)._config.showConfirmButton).toBe(true);
  });

  it('should handle numeric values correctly from data attributes', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-timer', '5000');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.timer).toBe(5000);
  });

  it('should handle JSON parsing errors gracefully', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-config', 'invalid json');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    // Should not throw error and should use defaults
    expect((alert as any)._config).toBeDefined();
    expect((alert as any)._config.type).toBe('info'); // default
  });

  it('should handle inputAttributes JSON parsing', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-input-attributes', JSON.stringify({ maxlength: '10', required: 'true' }));
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.inputAttributes).toEqual({ maxlength: '10', required: 'true' });
  });
});