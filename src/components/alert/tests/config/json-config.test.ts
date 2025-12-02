/**
 * TEST SUITE: JSON Config
 * PURPOSE: Test config via JSON in data attribute
 * SCOPE: KTAlert config from data-kt-alert-config JSON
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert JSON config', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should read config from data-kt-alert-config JSON', () => {
    // ARRANGE
    const element = document.createElement('div');
    const jsonConfig = {
      type: 'warning',
      title: 'Warning from JSON',
      message: 'This is a warning',
      dismissible: true,
      timer: 3000
    };
    element.setAttribute('data-kt-alert-config', JSON.stringify(jsonConfig));
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.type).toBe('warning');
    expect((alert as any)._config.title).toBe('Warning from JSON');
    expect((alert as any)._config.message).toBe('This is a warning');
    expect((alert as any)._config.dismissible).toBe(true);
    expect((alert as any)._config.timer).toBe(3000);
  });

  it('should handle complex nested objects in JSON config', () => {
    // ARRANGE
    const element = document.createElement('div');
    const jsonConfig = {
      inputAttributes: {
        maxlength: '50',
        required: 'true',
        pattern: '[A-Za-z]+'
      },
      inputOptions: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', checked: true }
      ]
    };
    element.setAttribute('data-kt-alert-config', JSON.stringify(jsonConfig));
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config.inputAttributes).toEqual({
      maxlength: '50',
      required: 'true',
      pattern: '[A-Za-z]+'
    });
    expect((alert as any)._config.inputOptions).toEqual([
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', checked: true }
    ]);
  });

  it('should handle invalid JSON gracefully', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-config', '{"invalid": json}');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    // Should not throw error and should use defaults
    expect((alert as any)._config).toBeDefined();
    expect((alert as any)._config.type).toBe('info'); // default
  });

  it('should handle empty JSON config', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-config', '{}');
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    expect((alert as any)._config).toBeDefined();
    expect((alert as any)._config.type).toBe('info'); // default
  });

  it('should merge JSON config with data attributes correctly', () => {
    // ARRANGE
    const element = document.createElement('div');
    element.setAttribute('data-kt-alert-type', 'error');
    element.setAttribute('data-kt-alert-title', 'From Attribute');
    const jsonConfig = {
      title: 'From JSON',
      message: 'JSON message',
      dismissible: true
    };
    element.setAttribute('data-kt-alert-config', JSON.stringify(jsonConfig));
    document.body.appendChild(element);
    // ACT
    const alert = new KTAlert(element);
    // ASSERT
    // JSON should override data attributes
    expect((alert as any)._config.title).toBe('From JSON');
    expect((alert as any)._config.message).toBe('JSON message');
    expect((alert as any)._config.dismissible).toBe(true);
    // Data attribute should still be applied
    expect((alert as any)._config.type).toBe('error');
  });
});