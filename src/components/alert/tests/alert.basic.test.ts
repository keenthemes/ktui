// alert.basic.test.ts - Basic instantiation and type safety tests for KTAlert
import { describe, it, expect } from 'vitest';
import { KTAlert } from '../alert';
import { vi } from 'vitest';

describe('KTAlert', () => {
  it('should instantiate without errors', () => {
    // Create a dummy element
    const el = document.createElement('div');
    // Instantiate KTAlert
    const alert = new KTAlert(document.createElement("div"));
    // Should be defined
    expect(alert).toBeDefined();
    // Should have correct name
    expect((alert as any)._name).toBe('alert');
  });

  it('should auto-dismiss after timer expires', async () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { timer: 1000, dismissible: true });
    // Spy on _fireEvent
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    // Wait for microtasks
    await vi.runAllTicks();
    expect(fireEventSpy).toHaveBeenCalledWith('dismiss', { reason: 'timer' });
    expect(el.innerHTML).toBe('');
    vi.useRealTimers();
  });

  it('should not auto-dismiss if manually dismissed first', async () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { timer: 1000, dismissible: true });
    // Spy on _fireEvent
    const fireEventSpy = vi.spyOn(alert as any, '_fireEvent');
    // Simulate manual dismiss
    (alert as any)._clearTimer();
    (alert as any)._state.isDismissed = true;
    (alert as any)._element.innerHTML = '';
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    // Wait for microtasks
    await vi.runAllTicks();
    // Should not call _fireEvent again for timer
    expect(fireEventSpy).not.toHaveBeenCalledWith('dismiss', { reason: 'timer' });
    vi.useRealTimers();
  });
});

describe('KTAlert input types', () => {
  it('should render and capture text input', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { input: true, inputType: 'text', inputValue: 'foo' });
    const input = el.querySelector('input[data-kt-alert-input]') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('foo');
    input.value = 'bar';
    input.dispatchEvent(new Event('input'));
    expect((alert as any)._state.inputValue).toBe('bar');
  });

  it('should render and capture textarea input', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { input: true, inputType: 'textarea', inputValue: 'foo' });
    const textarea = el.querySelector('textarea[data-kt-alert-input]') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe('foo');
    textarea.value = 'bar';
    textarea.dispatchEvent(new Event('input'));
    expect((alert as any)._state.inputValue).toBe('bar');
  });

  it('should render and capture select input', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { input: true, inputType: 'select', inputValue: 'b', inputOptions: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ] });
    const select = el.querySelector('select[data-kt-alert-input]') as HTMLSelectElement;
    expect(select).toBeDefined();
    expect(select.value).toBe('b');
    select.value = 'c';
    select.dispatchEvent(new Event('change'));
    expect((alert as any)._state.inputValue).toBe('c');
  });

  it('should render and capture radio input', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { input: true, inputType: 'radio', inputValue: 'b', inputOptions: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ] });
    const radios = el.querySelectorAll('input[type="radio"][data-kt-alert-input]') as NodeListOf<HTMLInputElement>;
    expect(radios.length).toBe(3);
    radios[2].checked = true;
    radios[2].dispatchEvent(new Event('change'));
    expect((alert as any)._state.inputValue).toBe('c');
  });

  it('should render and capture checkbox input', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const alert = new KTAlert(el, { input: true, inputType: 'checkbox', inputOptions: [
      { value: 'a', label: 'A', checked: true },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C', checked: true },
    ] });
    const checkboxes = el.querySelectorAll('input[type="checkbox"][data-kt-alert-input]') as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(3);
    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change'));
    // Should be comma-separated string of checked values
    expect((alert as any)._state.inputValue.split(',').sort()).toEqual(['a','b','c'].sort());
  });
});