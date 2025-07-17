/*
 * templates.ts - Default templates and merging logic for KTAlert (modular alert/dialog component)
 * Defines all default template strings and provides merged template set.
 *
 * Accessibility: All templates include ARIA roles and attributes for screen reader and keyboard support.
 */

import { KTAlertConfig, KTAlertTemplateStrings } from './types';

// Default template strings for all UI fragments
export const defaultTemplates: KTAlertTemplateStrings = {
  // Container: role=alertdialog for modal, role=alert for non-modal
  container: `<div data-kt-alert-container role="alertdialog" aria-modal="true" aria-label="Alert Dialog">{{content}}</div>`,
  icon: `<span data-kt-alert-icon aria-hidden="true">{{icon}}</span>`,
  title: `<h2 data-kt-alert-title id="kt-alert-title">{{title}}</h2>`,
  message: `<div data-kt-alert-message id="kt-alert-message">{{message}}</div>`,
  actions: `<div data-kt-alert-actions>{{confirmButton}} {{cancelButton}}</div>`,
  confirmButton: `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0">{{confirmText}}</button>`,
  cancelButton: `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0">{{cancelText}}</button>`,
  input: `<input data-kt-alert-input type="text" aria-label="Prompt input" tabindex="0" />`,
  closeButton: `<button type="button" data-kt-alert-close aria-label="Close alert" tabindex="0">&times;</button>`,
  customContent: `<div data-kt-alert-custom-content>{{customContent}}</div>`,
};

/**
 * Returns the merged template set for a given config.
 */
export function getTemplateStrings(config?: KTAlertConfig): KTAlertTemplateStrings {
  return { ...defaultTemplates, ...(config?.templates || {}) };
}

/**
 * Renders a template string with data using {{key}} placeholders.
 */
export function renderTemplateString(template: string, data: Record<string, any>): string {
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