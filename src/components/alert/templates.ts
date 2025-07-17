/*
 * templates.ts - Default templates and merging logic for KTAlert (modular alert/dialog component)
 * Defines all default template strings and provides merged template set.
 *
 * Accessibility: All templates include ARIA roles and attributes for screen reader and keyboard support.
 */

import { KTAlertConfig, KTAlertTemplateStrings } from './types';

// Default template strings for all UI fragments
export const defaultTemplates: KTAlertTemplateStrings = {
  // Overlay: wraps the modal for modal alerts
  overlay: `<div data-kt-alert-overlay aria-hidden="false">{{modal}}</div>`,
  // Modal container: role=alertdialog for modal, role=alert for non-modal
  modal: `<div data-kt-alert data-kt-alert-type="{{type}}" data-kt-alert-variant="{{variant}}" aria-modal="{{ariaModal}}" role="{{role}}" aria-label="Alert Dialog" class="{{customClass}}" data-kt-alert-position="{{position}}">{{content}}</div>`,
  // Fallback container (non-modal, or if no template provided)
  container: `<div>{{content}}</div>`,
  icon: `<span data-kt-alert-icon aria-hidden="true">{{icon}}</span>`,
  title: `<h2 data-kt-alert-title id="kt-alert-title">{{title}}</h2>`,
  message: `<div data-kt-alert-message id="kt-alert-message">{{message}}</div>`,
  actions: `<div data-kt-alert-actions>{{confirmButton}} {{cancelButton}}</div>`,
  // Confirm/cancel buttons (default, can be overridden with custom class)
  confirmButton: `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0">{{confirmText}}</button>`,
  cancelButton: `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0">{{cancelText}}</button>`,
  // Confirm/cancel buttons with custom class (for per-type theming)
  confirmButtonCustomClass: `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0" class="{{confirmButtonClass}}">{{confirmText}}</button>`,
  cancelButtonCustomClass: `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0" class="{{cancelButtonClass}}">{{cancelText}}</button>`,
  // Input templates for each type
  inputText: `<label data-kt-alert-input-label>{{inputLabel}}<input data-kt-alert-input type="{{inputType}}" placeholder="{{inputPlaceholder}}" value="{{inputValue}}" {{attrs}} aria-label="Prompt input" tabindex="0" /></label>`,
  inputTextarea: `<label data-kt-alert-input-label>{{inputLabel}}<textarea data-kt-alert-input placeholder="{{inputPlaceholder}}" {{attrs}} aria-label="Prompt input" tabindex="0">{{inputValue}}</textarea></label>`,
  inputSelect: `<label data-kt-alert-input-label>{{inputLabel}}<select data-kt-alert-input {{attrs}} aria-label="Prompt input" tabindex="0">{{optionsHtml}}</select></label>`,
  inputRadio: `<fieldset data-kt-alert-input-label><legend>{{inputLabel}}</legend>{{optionsHtml}}</fieldset>`,
  inputCheckbox: `<fieldset data-kt-alert-input-label><legend>{{inputLabel}}</legend>{{optionsHtml}}</fieldset>`,
  closeButton: `<button type="button" data-kt-alert-close aria-label="Close alert" tabindex="0">&times;</button>`,
  customContent: `<div data-kt-alert-custom-content>{{customContent}}</div>`,
  loaderHtml: `<span data-kt-alert-loader>{{loaderHtml}}</span>`,
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