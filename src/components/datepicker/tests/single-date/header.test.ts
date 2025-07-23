/*
 * header.test.ts - Unit tests for header renderer (KTDatepicker)
 * Uses Vitest for type-safe testing of header rendering logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHeader } from '../../ui/renderers/header';

describe('renderHeader', () => {
  it('renders header with correct month and year', () => {
    const el = renderHeader(
      (data) => `<div>${data.month} ${data.year}</div>`,
      { month: 'May', year: 2024, prevButton: '', nextButton: '' },
      () => {},
      () => {}
    );
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.textContent).toContain('May 2024');
  });
  it('calls navigation callbacks', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const el = renderHeader(
      () => '<div><button data-kt-datepicker-prev></button><button data-kt-datepicker-next></button></div>',
      {},
      onPrev,
      onNext
    );
    el.querySelector('[data-kt-datepicker-prev]')?.dispatchEvent(new Event('click'));
    el.querySelector('[data-kt-datepicker-next]')?.dispatchEvent(new Event('click'));
    expect(onPrev).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });
});