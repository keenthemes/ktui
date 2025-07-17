/**
 * TEST SUITE: Manual Dismissal
 * PURPOSE: Test dismissing via close button and confirm/cancel
 * SCOPE: KTAlert manual dismissal logic
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert manual dismissal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should dismiss alert via close button', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showCloseButton: true });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    const closeButton = element.querySelector('[data-kt-alert-close]') as HTMLElement;
    closeButton?.click();
    // ASSERT
    expect(fireEventSpy).toHaveBeenCalledWith('dismiss', {});
    expect((alert as any)._state.isDismissed).toBe(true);
    expect(element.innerHTML).toBe('');
  });

  it('should dismiss alert via confirm button', () => {
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

  it('should dismiss alert via cancel button', () => {
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

  it('should not dismiss if close button is disabled', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { showCloseButton: false });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    const closeButton = element.querySelector('[data-kt-alert-close]');
    // ASSERT
    expect(closeButton).toBeNull();
    expect(fireEventSpy).not.toHaveBeenCalled();
  });

  it('should clear timer when manually dismissed', () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: 5000, showCloseButton: true });
    const clearTimerSpy = vi.spyOn(alert as any, '_clearTimer');
    // ACT
    const closeButton = element.querySelector('[data-kt-alert-close]') as HTMLElement;
    closeButton?.click();
    // ASSERT
    expect(clearTimerSpy).toHaveBeenCalled();
  });
});