import { describe, it, expect, beforeEach } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { getTemplateStrings, defaultTemplates } from '../templates';

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
});