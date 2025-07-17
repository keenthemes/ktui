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
});