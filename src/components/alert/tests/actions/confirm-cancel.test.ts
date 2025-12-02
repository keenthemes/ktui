/**
 * TEST SUITE: Confirm/Cancel Actions
 * PURPOSE: Test confirm and cancel button flows, event firing, and result values
 * SCOPE: KTAlert confirm/cancel actions
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert confirm/cancel actions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should fire confirm event and resolve with correct value', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showConfirmButton: true });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    const confirmButton = element.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    expect(fireEventSpy).toHaveBeenCalledWith('confirm', { inputValue: undefined });
    expect((alert as any)._state.isDismissed).toBe(true);
    expect(element.innerHTML).toBe('');
  });

  it('should fire cancel event and resolve with correct value', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showCancelButton: true });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    const cancelButton = element.querySelector('[data-kt-alert-cancel]') as HTMLElement;
    cancelButton?.click();
    // ASSERT
    expect(fireEventSpy).toHaveBeenCalledWith('cancel', {});
    expect((alert as any)._state.isDismissed).toBe(true);
    expect(element.innerHTML).toBe('');
  });

  it('should use custom button text if provided', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, {
      showConfirmButton: true,
      showCancelButton: true,
      confirmText: 'Yes, do it!',
      cancelText: 'No, cancel'
    });
    // ACT
    const confirmButton = element.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    const cancelButton = element.querySelector('[data-kt-alert-cancel]') as HTMLElement;
    // ASSERT
    expect(confirmButton?.textContent).toBe('Yes, do it!');
    expect(cancelButton?.textContent).toBe('No, cancel');
  });

  it('should not render buttons if showConfirmButton and showCancelButton are false', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, {
      showConfirmButton: false,
      showCancelButton: false
    });
    // ACT
    const confirmButton = element.querySelector('[data-kt-alert-confirm]');
    const cancelButton = element.querySelector('[data-kt-alert-cancel]');
    // ASSERT
    expect(confirmButton).toBeNull();
    expect(cancelButton).toBeNull();
  });

  it('should clear timer when confirm button is clicked', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showConfirmButton: true, timer: 5000 });
    const clearTimerSpy = vi.spyOn(alert as any, '_clearTimer');
    // ACT
    const confirmButton = element.querySelector('[data-kt-alert-confirm]') as HTMLElement;
    confirmButton?.click();
    // ASSERT
    expect(clearTimerSpy).toHaveBeenCalled();
  });

  it('should clear timer when cancel button is clicked', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showCancelButton: true, timer: 5000 });
    const clearTimerSpy = vi.spyOn(alert as any, '_clearTimer');
    // ACT
    const cancelButton = element.querySelector('[data-kt-alert-cancel]') as HTMLElement;
    cancelButton?.click();
    // ASSERT
    expect(clearTimerSpy).toHaveBeenCalled();
  });

  it('should handle Enter key to trigger confirm button', () => {
    // ARRANGE
    const config = { showConfirmButton: true, title: 'Test' };
    // ACT
    KTAlert.fire(config);
    const alert = document.querySelector('[data-kt-alert]');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    alert?.dispatchEvent(enterEvent);
    // ASSERT
    // The alert should be dismissed (confirm button clicked)
    expect(document.querySelector('[data-kt-alert-overlay]')).toBeNull();
  });
});