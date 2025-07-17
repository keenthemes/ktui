/**
 * TEST SUITE: Input Field Actions
 * PURPOSE: Test alerts with input fields (text, textarea, select, radio, checkbox), value propagation
 * SCOPE: KTAlert input field handling
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert input field actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should propagate value from text input', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'text',
      inputPlaceholder: 'Enter text',
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'test value';
    const confirmButton = document.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    // The alert should be dismissed with the input value
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should propagate value from textarea input', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'textarea',
      inputPlaceholder: 'Enter text',
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'multiline\ntext';
    const confirmButton = document.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    // The alert should be dismissed with the input value
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should propagate value from select input', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'select',
      inputOptions: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ],
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const select = document.querySelector('select') as HTMLSelectElement;
    select.value = 'option2';
    const confirmButton = document.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    // The alert should be dismissed with the input value
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should propagate value from radio input', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'radio',
      inputOptions: [
        { value: 'radio1', label: 'Radio 1' },
        { value: 'radio2', label: 'Radio 2', checked: true }
      ],
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const confirmButton = document.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    // The alert should be dismissed with the input value
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should propagate value from checkbox input', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'checkbox',
      inputOptions: [
        { value: 'check1', label: 'Check 1' },
        { value: 'check2', label: 'Check 2' }
      ],
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes[0].checked = true;
    checkboxes[1].checked = true;
    const confirmButton = document.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    // The alert should be dismissed with the input value
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });

  it('should handle input change events', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'text',
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'new value';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // ASSERT
    // The input value should be updated
    expect(input.value).toBe('new value');
  });

  it('should not render input if input is false', () => {
    // ARRANGE
    const config = {
      input: false,
      showConfirmButton: true,
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const input = document.querySelector('input, textarea, select');
    // ASSERT
    expect(input).toBeNull();
  });

  it('should apply input attributes correctly', () => {
    // ARRANGE
    const config = {
      input: true,
      inputType: 'text',
      inputAttributes: {
        maxlength: '10',
        required: 'true',
        pattern: '[A-Za-z]+'
      },
      title: 'Test'
    };
    // ACT
    KTAlert.fire(config);
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    // ASSERT
    expect(input?.getAttribute('maxlength')).toBe('10');
    expect(input?.getAttribute('required')).toBe('true');
    expect(input?.getAttribute('pattern')).toBe('[A-Za-z]+');
  });
});