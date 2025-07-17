/**
 * TEST SUITE: Auto Dismissal
 * PURPOSE: Test timer-based auto-dismissal
 * SCOPE: KTAlert auto-dismissal logic
 * DEPENDENCIES: vitest, jsdom
 * LAST UPDATED: 2024-06-08
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTAlert } from '../../alert';

describe('KTAlert auto dismissal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('should auto-dismiss alert after timer expires', async () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: 1000 });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    vi.advanceTimersByTime(1000);
    await vi.runAllTicks();
    // ASSERT
    expect(fireEventSpy).toHaveBeenCalledWith('dismiss', { reason: 'timer' });
    expect((alert as any)._state.isDismissed).toBe(true);
    expect(element.innerHTML).toBe('');
  });

  it('should not auto-dismiss if timer is not set', async () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: undefined });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    vi.advanceTimersByTime(5000);
    await vi.runAllTicks();
    // ASSERT
    expect(fireEventSpy).not.toHaveBeenCalledWith('dismiss', { reason: 'timer' });
    expect((alert as any)._state.isDismissed).toBe(false);
  });

  it('should not auto-dismiss if timer is 0 or negative', async () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: 0 });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    vi.advanceTimersByTime(1000);
    await vi.runAllTicks();
    // ASSERT
    expect(fireEventSpy).not.toHaveBeenCalledWith('dismiss', { reason: 'timer' });
    expect((alert as any)._state.isDismissed).toBe(false);
  });

  it('should not auto-dismiss if manually dismissed first', async () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: 1000, showCloseButton: true });
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // ACT
    // Manually dismiss first
    const closeButton = element.querySelector('[data-kt-alert-close]') as HTMLElement;
    closeButton?.click();
    // Then advance timer
    vi.advanceTimersByTime(1000);
    await vi.runAllTicks();
    // ASSERT
    // Should only have manual dismiss, not timer dismiss
    expect(fireEventSpy).toHaveBeenCalledWith('dismiss', {});
    expect(fireEventSpy).not.toHaveBeenCalledWith('dismiss', { reason: 'timer' });
  });

  it('should clear timer when manually dismissed', async () => {
    // ARRANGE
    const element = document.createElement('div');
    document.body.appendChild(element);
    const alert = new KTAlert(element, { timer: 1000, showCloseButton: true });
    const clearTimerSpy = vi.spyOn(alert as any, '_clearTimer');
    // ACT
    const closeButton = element.querySelector('[data-kt-alert-close]') as HTMLElement;
    closeButton?.click();
    // ASSERT
    expect(clearTimerSpy).toHaveBeenCalled();
  });
});