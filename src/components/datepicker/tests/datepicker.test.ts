// @vitest-environment jsdom
/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { getTemplateStrings, defaultTemplates } from '../templates';
import { parseDateFromFormat } from '../date-utils';

describe('KTDatepicker', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
  });

  it('should instantiate and attach instance to element', () => {
    const dp = new KTDatepicker(container);
    expect((container as any).instance).toBeInstanceOf(KTDatepicker);
  });

  it('should merge templates from config', () => {
    const custom = { header: '<div>Custom Header</div>' };
    const dp = new KTDatepicker(container, { templates: custom });
    const merged = getTemplateStrings(dp['_config']);
    expect(merged.header).toBe(custom.header);
    expect(merged.container).toBe(defaultTemplates.container);
  });

  it('should open and close via API', () => {
    const dp = new KTDatepicker(container);
    dp.open();
    expect(dp['_isOpen']).toBe(true);
    dp.close();
    expect(dp['_isOpen']).toBe(false);
  });

  it('should render container via _renderContainer', () => {
    const dp = new KTDatepicker(container);
    const el = (dp as any)._renderContainer();
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.hasAttribute('data-kt-datepicker-container')).toBe(true);
  });

  it('should render input wrapper via _renderInputWrapper', () => {
    const dp = new KTDatepicker(container);
    const html = '<button type="button" data-kt-datepicker-calendar-btn></button>';
    const el = (dp as any)._renderInputWrapper(html);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.hasAttribute('data-kt-datepicker-input-wrapper')).toBe(true);
  });

  it('should render dropdown via _renderDropdown', () => {
    const dp = new KTDatepicker(container);
    const el = (dp as any)._renderDropdown();
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.hasAttribute('data-kt-datepicker-dropdown')).toBe(true);
  });

  it('should update placeholder via _updatePlaceholder', () => {
    const dp = new KTDatepicker(container, { placeholder: 'Pick a date' });
    (dp as any)._state.selectedDate = null;
    (dp as any)._updatePlaceholder();
    expect((dp as any)._input.getAttribute('placeholder')).toBe('Pick a date');
  });

  it('should update disabled state via _updateDisabledState', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._updateDisabledState();
    expect((dp as any)._input.hasAttribute('disabled')).toBe(true);
  });

  it('should enforce min/max dates via _enforceMinMaxDates', () => {
    const dp = new KTDatepicker(container, { minDate: '2100-01-01', maxDate: '2100-12-31' });
    // Simulate a day button in the DOM
    const btn = document.createElement('button');
    btn.setAttribute('data-day', '1');
    const td = document.createElement('td');
    td.setAttribute('data-kt-datepicker-day', '');
    td.appendChild(btn);
    container.appendChild(td);
    (dp as any)._state.currentDate = new Date('2099-01-01');
    (dp as any)._enforceMinMaxDates();
    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(td.getAttribute('data-out-of-range')).toBe('true');
  });

  it('should initialize with a date range when range and valueRange are set', () => {
    const container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
    const dp = new KTDatepicker(container, {
      range: true,
      valueRange: { start: '2024-01-01', end: '2024-01-10' },
      format: 'yyyy-MM-dd', // Use MM for month
    });
    const state = (dp as any)._state;
    expect(state.selectedRange.start).toEqual(new Date('2024-01-01'));
    expect(state.selectedRange.end).toEqual(new Date('2024-01-10'));
    expect((dp as any)._input.value).toBe('2024-01-01 – 2024-01-10');
  });

  it('should initialize with multiple dates when multiDate and values are set', () => {
    const container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
    const dp = new KTDatepicker(container, {
      multiDate: true,
      values: ['2024-01-01', '2024-01-10'],
      format: 'yyyy-MM-dd', // Use MM for month
    });
    const state = (dp as any)._state;
    expect(state.selectedDates.length).toBe(2);
    expect(state.selectedDates[0]).toEqual(new Date('2024-01-01'));
    expect(state.selectedDates[1]).toEqual(new Date('2024-01-10'));
    expect((dp as any)._input.value).toBe('2024-01-01, 2024-01-10');
  });

  it('should add and remove dates in multi-date mode', () => {
    const container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
    const dp = new KTDatepicker(container, {
      multiDate: true,
      format: 'yyyy-MM-dd', // Use MM for month
    });
    (dp as any).setDate(new Date('2024-01-01'));
    (dp as any).setDate(new Date('2024-01-10'));
    let state = (dp as any)._state;
    expect(state.selectedDates.length).toBe(2);
    expect((dp as any)._input.value).toBe('2024-01-01, 2024-01-10');
    // Deselect one date
    (dp as any).setDate(new Date('2024-01-01'));
    state = (dp as any)._state;
    expect(state.selectedDates.length).toBe(1);
    expect((dp as any)._input.value).toBe('2024-01-10');
  });

  it('should disable both input and calendar button when disabled', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._render();
    const input = (dp as any)._input;
    const calendarButton = container.querySelector('button[data-kt-datepicker-calendar-btn]');
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(calendarButton).not.toBeNull();
    expect(calendarButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should NOT open calendar via button when disabled', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._render();
    const calendarButton = container.querySelector('button[data-kt-datepicker-calendar-btn]');
    expect(calendarButton).not.toBeNull();
    if (calendarButton) {
      calendarButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should NOT open calendar via input focus when disabled', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._render();
    const input = (dp as any)._input;
    input.dispatchEvent(new FocusEvent('focus'));
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should NOT open calendar via API when disabled', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any).open();
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should not focus or activate calendar button when disabled (real user interaction)', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._render();
    const calendarButton = container.querySelector('button[data-kt-datepicker-calendar-btn]');
    expect(calendarButton).not.toBeNull();
    if (calendarButton) {
      // Instead of testing focus (which JSDOM does not enforce), check correct attributes
      expect(calendarButton.hasAttribute('disabled')).toBe(true);
      expect(calendarButton.getAttribute('tabindex')).toBe('-1');
      expect(calendarButton.getAttribute('aria-disabled')).toBe('true');
      calendarButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect((dp as any)._isOpen).toBe(false);
    }
  });

  it('should not focus or activate input when disabled (real user interaction)', () => {
    const dp = new KTDatepicker(container, { disabled: true });
    (dp as any)._render();
    const input = (dp as any)._input;
    input.focus();
    expect(document.activeElement).not.toBe(input);
    input.dispatchEvent(new FocusEvent('focus'));
    expect((dp as any)._isOpen).toBe(false);
  });

  it('renders two months side by side when visibleMonths is 2', async () => {
    const dp = new KTDatepicker(container, { visibleMonths: 2 });
    dp.open();
    // Should render the multiMonthContainer
    const multiMonth = container.querySelector('[data-kt-datepicker-multimonth-container]');
    expect(multiMonth).toBeInstanceOf(HTMLElement);
    // Should contain two headers and two calendar tables
    const headers = multiMonth?.querySelectorAll('[data-kt-datepicker-header]');
    const calendars = multiMonth?.querySelectorAll('[data-kt-datepicker-calendar-table]');
    expect(headers?.length).toBe(2);
    expect(calendars?.length).toBe(2);
    // Navigation: next button should be in the last header only
    const lastHeader = headers?.[1];
    const nextBtn = lastHeader?.querySelector('[data-kt-datepicker-next]');
    expect(nextBtn).toBeInstanceOf(HTMLElement);
    // Get the month names before navigation
    const monthSpans = multiMonth?.querySelectorAll('[data-kt-datepicker-month]');
    const firstMonthInitial = monthSpans?.[0]?.textContent;
    const secondMonthInitial = monthSpans?.[1]?.textContent;
    // Click next and wait for DOM update
    (nextBtn as HTMLElement).click();
    await Promise.resolve();
    // Query again after update
    const updatedMultiMonth = container.querySelector('[data-kt-datepicker-multimonth-container]');
    const updatedMonthSpans = updatedMultiMonth?.querySelectorAll('[data-kt-datepicker-month]');
    const updatedFirstMonth = updatedMonthSpans?.[0]?.textContent;
    // The new first month should be the previous second month
    expect(updatedFirstMonth).toBe(secondMonthInitial);
  });

  it('debug: log last header innerHTML for multi-month', () => {
    const dp = new KTDatepicker(container, { visibleMonths: 2 });
    dp.open();
    const multiMonth = container.querySelector('[data-kt-datepicker-multimonth-container]');
    const headers = multiMonth?.querySelectorAll('[data-kt-datepicker-header]');
    const lastHeader = headers?.[1];
    // eslint-disable-next-line no-console
    console.log('DEBUG lastHeader.innerHTML:', lastHeader?.innerHTML);
    expect(lastHeader).toBeInstanceOf(HTMLElement);
  });
});

describe('showOnFocus and closeOnSelect behaviors', () => {
  let container: HTMLElement;
  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
  });

  it('should open calendar on input focus if showOnFocus is true', () => {
    const dp = new KTDatepicker(container, { showOnFocus: true });
    const input = (dp as any)._input;
    input.dispatchEvent(new FocusEvent('focus'));
    expect((dp as any)._isOpen).toBe(true);
  });

  it('should NOT open calendar on input focus if showOnFocus is false', () => {
    const dp = new KTDatepicker(container, { showOnFocus: false });
    const input = (dp as any)._input;
    input.dispatchEvent(new FocusEvent('focus'));
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should close calendar after selection if closeOnSelect is true (single-date)', () => {
    const dp = new KTDatepicker(container, { closeOnSelect: true });
    (dp as any).open();
    (dp as any).setDate(new Date('2024-01-01'));
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should keep calendar open after selection if closeOnSelect is false (single-date)', () => {
    const dp = new KTDatepicker(container, { closeOnSelect: false });
    (dp as any).open();
    (dp as any).setDate(new Date('2024-01-01'));
    expect((dp as any)._isOpen).toBe(true);
  });

  it('should close calendar only on Apply in multi-date mode (closeOnSelect true)', () => {
    const dp = new KTDatepicker(container, { multiDate: true, closeOnSelect: true });
    (dp as any).open();
    // Simulate Apply button click
    const footer = document.createElement('div');
    const applyBtn = document.createElement('button');
    applyBtn.setAttribute('data-kt-datepicker-apply', '');
    footer.appendChild(applyBtn);
    document.body.appendChild(footer);
    (dp as any)._onApplyMultiDate({} as Event);
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should keep calendar open after Apply in multi-date mode if closeOnSelect is false', () => {
    const dp = new KTDatepicker(container, { multiDate: true, closeOnSelect: false });
    (dp as any).open();
    (dp as any)._onApplyMultiDate({} as Event);
    expect((dp as any)._isOpen).toBe(true);
  });
});

describe('outside click close behavior', () => {
  let container: HTMLElement;
  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
  });

  it('should close calendar on outside click', () => {
    const dp = new KTDatepicker(container, { showOnFocus: true });
    (dp as any).open();
    expect((dp as any)._isOpen).toBe(true);
    // Simulate outside click
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect((dp as any)._isOpen).toBe(false);
  });

  it('should NOT close calendar on inside click (dropdown)', () => {
    const dp = new KTDatepicker(container, { showOnFocus: true });
    (dp as any).open();
    expect((dp as any)._isOpen).toBe(true);
    const dropdown = container.querySelector('[data-kt-datepicker-dropdown]');
    if (dropdown) {
      dropdown.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
    expect((dp as any)._isOpen).toBe(true);
  });

  it('should NOT close calendar on input click', () => {
    const dp = new KTDatepicker(container, { showOnFocus: true });
    (dp as any).open();
    expect((dp as any)._isOpen).toBe(true);
    const input = (dp as any)._input;
    if (input) {
      input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
    expect((dp as any)._isOpen).toBe(true);
  });

  it('should NOT close calendar on calendar button click', () => {
    const dp = new KTDatepicker(container, { showOnFocus: true });
    (dp as any).open();
    expect((dp as any)._isOpen).toBe(true);
    const calendarBtn = container.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (calendarBtn) {
      calendarBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
    expect((dp as any)._isOpen).toBe(true);
  });
});

describe('parseDateFromFormat utility', () => {
  it('parses yyyy-MM-dd', () => {
    const d = parseDateFromFormat('2024-07-16', 'yyyy-MM-dd');
    expect(d).toEqual(new Date(2024, 6, 16));
  });
  it('parses dd/MM/yyyy', () => {
    const d = parseDateFromFormat('16/07/2024', 'dd/MM/yyyy');
    expect(d).toEqual(new Date(2024, 6, 16));
  });
  it('parses MM.dd.yyyy', () => {
    const d = parseDateFromFormat('07.16.2024', 'MM.dd.yyyy');
    expect(d).toEqual(new Date(2024, 6, 16));
  });
  it('parses d/M/yy', () => {
    const d = parseDateFromFormat('5/7/24', 'd/M/yy');
    expect(d).toEqual(new Date(2024, 6, 5));
  });
  it('returns null for invalid string', () => {
    const d = parseDateFromFormat('not-a-date', 'yyyy-MM-dd');
    expect(d).toBeNull();
  });
  it('returns null for mismatched format', () => {
    const d = parseDateFromFormat('2024/07/16', 'yyyy-MM-dd');
    expect(d).toBeNull();
  });
  it('parses with extra separators', () => {
    const d = parseDateFromFormat('2024--07--16', 'yyyy--MM--dd');
    expect(d).toEqual(new Date(2024, 6, 16));
  });
});