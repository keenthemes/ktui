/*
 * calendar.test.ts - Unit tests for calendar renderer (KTDatepicker)
 * Uses Vitest for type-safe testing of calendar rendering logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderCalendar } from '../renderers/calendar';

describe('renderCalendar', () => {
  it('renders calendar with correct number of days', () => {
    const days = Array.from({ length: 14 }, (_, i) => new Date(2024, 4, i + 1));
    const el = renderCalendar(
      (data) => `<td data-kt-datepicker-day>${data.day}</td>`,
      days,
      new Date(2024, 4, 1),
      null,
      () => {}
    );
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelectorAll('td[data-kt-datepicker-day]').length).toBe(14);
  });
  it('calls day click callback', () => {
    const days = [new Date(2024, 4, 1)];
    const onDayClick = vi.fn();
    const el = renderCalendar(
      (data) => `<td data-kt-datepicker-day>${data.day}</td>`,
      days,
      new Date(2024, 4, 1),
      null,
      onDayClick
    );
    el.querySelector('td[data-kt-datepicker-day]')?.dispatchEvent(new Event('click'));
    expect(onDayClick).toHaveBeenCalledWith(days[0]);
  });
});