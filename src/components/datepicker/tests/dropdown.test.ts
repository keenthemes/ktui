import { describe, it, expect, beforeEach } from 'vitest';
import { KTDatepickerDropdown } from '../dropdown';


describe('KTDatepickerDropdown', () => {
  let wrapper: HTMLElement;
  let toggle: HTMLElement;
  let dropdown: HTMLElement;
  let config: any;
  let dd: KTDatepickerDropdown;

  beforeEach(() => {
    document.body.innerHTML = '';
    wrapper = document.createElement('div');
    toggle = document.createElement('button');
    dropdown = document.createElement('div');
    dropdown.classList.add('hidden');
    config = {};
    document.body.appendChild(wrapper);
    wrapper.appendChild(toggle);
    wrapper.appendChild(dropdown);
    dd = new KTDatepickerDropdown(wrapper, toggle, dropdown, config);
  });

  it('should open and close the dropdown', () => {
    dd.open();
    expect(dropdown.classList.contains('open')).toBe(true);
    expect(dropdown.classList.contains('hidden')).toBe(false);
    dd.close();
    expect(dropdown.classList.contains('open')).toBe(false);
    expect(dropdown.classList.contains('hidden')).toBe(true);
  });

  it('should toggle open/close on toggle click', () => {
    toggle.click();
    expect(dd.isOpen()).toBe(true);
    toggle.click();
    expect(dd.isOpen()).toBe(false);
  });
});