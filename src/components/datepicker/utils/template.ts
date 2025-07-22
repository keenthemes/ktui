/*
 * template.ts - Template utilities for KTDatepicker (revamp)
 * Provides merging and rendering utilities for template customization.
 */

import { KTDatepickerTemplateStrings } from '../types';

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
 * Enhanced to handle class placeholders specifically.
 */
export function renderTemplateString(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    const value = data[key];
    if (value !== undefined) {
      return String(value);
    }
    return '';
  });
}

/**
 * Merges class data with template data for rendering.
 * Extracts class for specific template key from config classes object.
 */
export function mergeClassData(
  templateKey: string,
  templateData: Record<string, any>,
  configClasses?: Record<string, string>
): Record<string, any> {
  const classValue = configClasses?.[templateKey] || '';
  return {
    ...templateData,
    class: classValue
  };
}

/**
 * Checks if a template is a function.
 */
export function isTemplateFunction(tpl: unknown): tpl is (data: any) => string {
  return typeof tpl === 'function';
}

/**
 * Renders a template string with data and returns a DocumentFragment.
 * Usage: const frag = renderTemplateToDOM(template, data)
 */
export function renderTemplateToDOM(template: string, data: Record<string, any> = {}): DocumentFragment {
  const html = renderTemplateString(template, data);
  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');
  temp.innerHTML = html;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}