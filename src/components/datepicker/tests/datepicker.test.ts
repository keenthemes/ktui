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
});