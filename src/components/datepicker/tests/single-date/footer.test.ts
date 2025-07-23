/*
 * footer.test.ts - Unit tests for footer renderer (KTDatepicker)
 * Uses Vitest for type-safe testing of footer rendering logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderFooter } from '../../ui/renderers/footer';

describe('renderFooter', () => {
  it('renders footer with correct buttons', () => {
    const el = renderFooter(
      () => '<div><button data-kt-datepicker-today></button><button data-kt-datepicker-clear></button><button data-kt-datepicker-apply></button></div>',
      {},
      () => {},
      () => {},
      () => {}
    );
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('[data-kt-datepicker-today]')).toBeTruthy();
    expect(el.querySelector('[data-kt-datepicker-clear]')).toBeTruthy();
    expect(el.querySelector('[data-kt-datepicker-apply]')).toBeTruthy();
  });
  it('calls button callbacks', () => {
    const onToday = vi.fn();
    const onClear = vi.fn();
    const onApply = vi.fn();
    const el = renderFooter(
      () => '<div><button data-kt-datepicker-today></button><button data-kt-datepicker-clear></button><button data-kt-datepicker-apply></button></div>',
      {},
      onToday,
      onClear,
      onApply
    );
    el.querySelector('[data-kt-datepicker-today]')?.dispatchEvent(new Event('click'));
    el.querySelector('[data-kt-datepicker-clear]')?.dispatchEvent(new Event('click'));
    el.querySelector('[data-kt-datepicker-apply]')?.dispatchEvent(new Event('click'));
    expect(onToday).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
    expect(onApply).toHaveBeenCalled();
  });
});