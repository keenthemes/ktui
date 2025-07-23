/*
 * template.test.ts - Unit tests for template utilities (KTDatepicker)
 * Uses Vitest for type-safe testing of template utility functions.
 */

import { describe, it, expect } from 'vitest';
import { mergeTemplates, renderTemplateString, isTemplateFunction, renderTemplateToDOM } from '../../templates/templates';

describe('mergeTemplates', () => {
  it('merges defaults and overrides, with overrides taking precedence', () => {
    const defaults = { a: 'A', b: 'B' } as any;
    const overrides = { b: 'BB', c: 'C' } as any;
    expect(mergeTemplates(defaults, overrides)).toEqual({ a: 'A', b: 'BB', c: 'C' });
  });
});

describe('renderTemplateString', () => {
  it('renders a template string with data', () => {
    expect(renderTemplateString('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!');
  });
  it('replaces missing keys with empty string', () => {
    expect(renderTemplateString('Hi, {{foo}}!', {})).toBe('Hi, !');
  });
});

describe('isTemplateFunction', () => {
  it('detects a function', () => {
    expect(isTemplateFunction(() => 'x')).toBe(true);
  });
  it('detects a string as not a function', () => {
    expect(isTemplateFunction('foo')).toBe(false);
  });
});

describe('renderTemplateToDOM', () => {
  it('returns a DocumentFragment with correct HTML', () => {
    const frag = renderTemplateToDOM('<div>Test</div>');
    expect(frag.firstChild).toBeInstanceOf(HTMLElement);
    expect((frag.firstChild as HTMLElement).textContent).toBe('Test');
  });
});