// @vitest-environment jsdom
// alert.config.test.ts - Config merging logic tests for KTAlert
import { describe, it, expect } from 'vitest';
import { KTAlertConfig } from '../types';
import { KTAlert } from '../alert';

// Placeholder test for config merging (to be implemented)
describe('KTAlert config merging', () => {
  it('should merge default, global, data attributes, JSON config, and user config in correct order', () => {
    // Mock element with data attributes and JSON config
    const el = document.createElement('div');
    el.setAttribute('data-kt-alert-type', 'warning');
    el.setAttribute('data-kt-alert-title', 'From Data Attr');
    el.setAttribute('data-kt-alert-config', JSON.stringify({ title: 'From JSON', dismissible: true }));
    // User config
    const userConfig = { title: 'From User', customContent: 'User Content' };
    // Instantiate KTAlert and build config
    const alert = new KTAlert(document.createElement("div"));
    (alert as any)._element = el;
    (alert as any)._getGlobalConfig = () => ({ type: 'error', message: 'From Global' });
    (alert as any)._buildConfig(userConfig);
    const config = (alert as any)._config;
    // Check precedence
    expect(config.type).toBe('warning'); // data attribute overrides global
    expect(config.title).toBe('From User'); // user config overrides JSON/data/global/default
    expect(config.message).toBe('From Global'); // global overrides default
    expect(config.dismissible).toBe(true); // JSON config overrides data/global/default
    expect(config.customContent).toBe('User Content'); // user config
  });

  it('should support all new config options and merge them correctly', () => {
    const el = document.createElement('div');
    el.setAttribute('data-kt-alert-icon', 'info');
    el.setAttribute('data-kt-alert-position', 'top');
    el.setAttribute('data-kt-alert-show-confirm-button', 'false');
    el.setAttribute('data-kt-alert-show-cancel-button', 'true');
    el.setAttribute('data-kt-alert-show-close-button', 'false');
    el.setAttribute('data-kt-alert-input-placeholder', 'Enter value');
    el.setAttribute('data-kt-alert-input-type', 'email');
    el.setAttribute('data-kt-alert-input-label', 'Email');
    el.setAttribute('data-kt-alert-input-attributes', JSON.stringify({ maxlength: '10', required: 'true' }));
    el.setAttribute('data-kt-alert-custom-class', 'my-alert');
    el.setAttribute('data-kt-alert-loader-html', '<span>Loading...</span>');
    el.setAttribute('data-kt-alert-allow-outside-click', 'false');
    el.setAttribute('data-kt-alert-allow-escape-key', 'false');
    el.setAttribute('data-kt-alert-focus-confirm', 'false');
    el.setAttribute('data-kt-alert-show-loader-on-confirm', 'true');
    el.setAttribute('data-kt-alert-timer', '5000');
    // User config
    const userConfig = { icon: 'error', position: 'bottom', showConfirmButton: true, showCancelButton: false, showCloseButton: true, inputPlaceholder: 'Override', inputType: 'text', inputLabel: 'Override', inputAttributes: { maxlength: '5' }, customClass: 'user-alert', loaderHtml: '<span>User Loading</span>', allowOutsideClick: true, allowEscapeKey: true, focusConfirm: true, showLoaderOnConfirm: false, timer: 10000 };
    // Instantiate KTAlert and build config
    const alert = new KTAlert(document.createElement('div'));
    (alert as any)._element = el;
    (alert as any)._getGlobalConfig = () => ({ icon: 'question', position: 'center' });
    (alert as any)._buildConfig(userConfig);
    const config = (alert as any)._config;
    // Data attributes should override global, user config should override all
    expect(config.icon).toBe('error'); // user config
    expect(config.position).toBe('bottom'); // user config
    expect(config.showConfirmButton).toBe(true); // user config
    expect(config.showCancelButton).toBe(false); // user config
    expect(config.showCloseButton).toBe(true); // user config
    expect(config.inputPlaceholder).toBe('Override'); // user config
    expect(config.inputType).toBe('text'); // user config
    expect(config.inputLabel).toBe('Override'); // user config
    expect(config.inputAttributes).toEqual({ maxlength: '5' }); // user config
    expect(config.customClass).toBe('user-alert'); // user config
    expect(config.loaderHtml).toBe('<span>User Loading</span>'); // user config
    expect(config.allowOutsideClick).toBe(true); // user config
    expect(config.allowEscapeKey).toBe(true); // user config
    expect(config.focusConfirm).toBe(true); // user config
    expect(config.showLoaderOnConfirm).toBe(false); // user config
    expect(config.timer).toBe(10000); // user config
  });
});