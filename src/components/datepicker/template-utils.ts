/*
 * template-utils.ts - Template utilities for KTDatepicker (revamp)
 * Provides merging and rendering utilities for template customization.
 */

import { KTDatepickerTemplateStrings } from './types';

/**
 * Merges default templates with user overrides.
 * User overrides take precedence.
 */
export function mergeTemplates(
  defaults: KTDatepickerTemplateStrings,
  overrides?: KTDatepickerTemplateStrings
): KTDatepickerTemplateStrings {
  return { ...defaults, ...(overrides || {}) };
}

/**
 * Renders a template string with data using {{key}} placeholders.
 */
export function renderTemplateString(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{(\w+)}}/g, (_, key) =>
    data[key] !== undefined ? String(data[key]) : ''
  );
}

/**
 * Checks if a template is a function.
 */
export function isTemplateFunction(tpl: unknown): tpl is (data: any) => string {
  return typeof tpl === 'function';
}