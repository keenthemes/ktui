// alert.templates.test.ts - Template merging logic tests for KTAlert
import { describe, it, expect } from 'vitest';
import { getTemplateStrings, coreTemplateStrings } from '../templates';

describe('KTAlert template merging', () => {
  it('should use default templates if no user templates provided', () => {
    const templates = getTemplateStrings();
    expect(templates).toMatchObject(coreTemplateStrings);
  });

  it('should override default templates with user templates', () => {
    const userTemplates = { title: '<h1>Custom Title</h1>' };
    const templates = getTemplateStrings({ templates: userTemplates });
    expect(templates.title).toBe('<h1>Custom Title</h1>');
    expect(templates.icon).toBe(coreTemplateStrings.icon);
  });
});