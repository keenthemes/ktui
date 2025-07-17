/*
 * calendar.test.ts - Unit tests for calendar renderer (KTDatepicker)
 * Uses Vitest for type-safe testing of calendar rendering logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderCalendar } from '../../renderers/calendar';

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
      (data) => `<td data-kt-datepicker-day><button type="button" data-day="${data.day}">${data.day}</button></td>`,
      days,
      new Date(2024, 4, 1),
      null,
      onDayClick
    );
    el.querySelector('button[data-day]')?.dispatchEvent(new Event('click', { bubbles: true }));
    expect(onDayClick).toHaveBeenCalledWith(days[0]);
  });
  it('highlights range across two months', () => {
    // May 30 - June 2, 2024
    const days = [];
    for (let d = new Date(2024, 4, 26); d <= new Date(2024, 5, 2); d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const selectedRange = { start: new Date(2024, 4, 30), end: new Date(2024, 5, 2) };
    const el = renderCalendar(
      (data) => `<td data-kt-datepicker-day${data.inRange ? ' data-in-range="true"' : ''}>${data.day}</td>`,
      days,
      new Date(2024, 4, 1), // May
      null,
      () => {},
      selectedRange
    );
    // Should highlight May 30, 31, June 1, 2
    const inRangeCells = Array.from(el.querySelectorAll('td[data-in-range="true"]'));
    expect(inRangeCells.length).toBe(4);
    expect(inRangeCells.map(td => td.textContent)).toEqual(['30', '31', '1', '2']);
  });
});