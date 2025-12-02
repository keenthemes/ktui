/*
 * templates.ts - Default templates and merging logic for KTAlert (modular alert/dialog component)
 * Defines all default template strings and provides merged template set.
 *
 * Accessibility: All templates include ARIA roles and attributes for screen reader and keyboard support.
 */

import { KTAlertConfig, KTAlertTemplateStrings } from './types';

// Core template strings for all UI fragments
export const coreTemplateStrings: KTAlertTemplateStrings = {
  // Overlay: wraps the modal for modal alerts
  overlay: `<div data-kt-alert-overlay aria-hidden="false" class="kt-alert-overlay {{class}}">{{modal}}</div>`,
  // Modal container: role=alertdialog for modal, role=alert for non-modal
  modal: `<div data-kt-alert data-kt-alert-type="{{type}}" data-kt-alert-variant="{{variant}}" aria-modal="{{ariaModal}}" role="{{role}}" aria-label="Alert Dialog" class="kt-alert-modal {{class}}" data-kt-alert-position="{{position}}">{{content}}</div>`,
  // Fallback container (non-modal, or if no template provided)
  container: `<div class="kt-alert-container {{class}}">{{content}}</div>`,
  icon: `<span data-kt-alert-icon aria-hidden="true" class="kt-alert-icon {{class}}">{{icon}}</span>`,
  title: `<h2 data-kt-alert-title id="kt-alert-title" class="kt-alert-title {{class}}">{{title}}</h2>`,
  message: `<div data-kt-alert-message id="kt-alert-message" class="kt-alert-message {{class}}">{{message}}</div>`,
  actions: `<div data-kt-alert-actions class="kt-alert-actions {{class}}">{{confirmButton}} {{cancelButton}}</div>`,
  // Confirm/cancel buttons (default, can be overridden with custom class)
  confirmButton: `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0" class="kt-alert-confirm-button {{class}}">{{confirmText}}</button>`,
  cancelButton: `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0" class="kt-alert-cancel-button {{class}}">{{cancelText}}</button>`,
  // Confirm/cancel buttons with custom class (for per-type theming)
  confirmButtonCustomClass: `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0" class="{{confirmButtonClass}}">{{confirmText}}</button>`,
  cancelButtonCustomClass: `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0" class="{{cancelButtonClass}}">{{cancelText}}</button>`,
  // Input templates for each type
  inputText: `<label data-kt-alert-input-label class="kt-alert-input-label {{inputLabelClass}}">{{inputLabel}}<input data-kt-alert-input type="{{inputType}}" placeholder="{{inputPlaceholder}}" value="{{inputValue}}" {{attrs}} aria-label="Prompt input" tabindex="0" class="kt-alert-input {{inputClass}}" /></label>`,
  inputTextarea: `<label data-kt-alert-input-label class="kt-alert-input-label {{inputLabelClass}}">{{inputLabel}}<textarea data-kt-alert-input placeholder="{{inputPlaceholder}}" {{attrs}} aria-label="Prompt input" tabindex="0" class="kt-alert-input {{inputClass}}">{{inputValue}}</textarea></label>`,
  inputSelect: `<label data-kt-alert-input-label class="kt-alert-input-label {{inputLabelClass}}">{{inputLabel}}<select data-kt-alert-input {{attrs}} aria-label="Prompt input" tabindex="0" class="kt-alert-input {{inputClass}}">{{optionsHtml}}</select></label>`,
  inputRadio: `<fieldset data-kt-alert-input-label class="kt-alert-input-label {{inputLabelClass}}"><legend>{{inputLabel}}</legend>{{optionsHtml}}</fieldset>`,
  inputCheckbox: `<fieldset data-kt-alert-input-label class="kt-alert-input-label {{inputLabelClass}}"><legend>{{inputLabel}}</legend>{{optionsHtml}}</fieldset>`,
  inputError: `<div data-kt-alert-input-error class="kt-alert-input-error {{class}}" role="alert" aria-live="polite">{{errorMessage}}</div>`,
  closeButton: `<button type="button" data-kt-alert-close aria-label="Close alert" tabindex="0" class="kt-alert-close-button {{class}}">&times;</button>`,
  customContent: `<div data-kt-alert-custom-content class="kt-alert-custom-content {{class}}">{{customContent}}</div>`,
  loaderHtml: `<span data-kt-alert-loader class="kt-alert-loader {{class}}">{{loaderHtml}}</span>`,
  // Input option templates
  option: `<option value="{{value}}"{{selected}} {{disabled}}>{{label}}</option>`,
  radioOption: `<label><input type="radio" name="kt-alert-radio" data-kt-alert-input value="{{value}}"{{checked}} {{disabled}} {{attrs}} aria-label="{{label}}" tabindex="0" />{{label}}</label>`,
  checkboxOption: `<label><input type="checkbox" name="kt-alert-checkbox" data-kt-alert-input value="{{value}}"{{checked}} {{disabled}} {{attrs}} aria-label="{{label}}" tabindex="0" />{{label}}</label>`,
};

/**
 * Get the complete template set, merging defaults, user overrides, and config templates.
 * @param config Optional config object with a "templates" property.
 */
export function getTemplateStrings(config?: KTAlertConfig): KTAlertTemplateStrings {
  const templates = config?.templates;
  if (templates) {
    return { ...coreTemplateStrings, ...userTemplateStrings, ...templates };
  }
  return { ...coreTemplateStrings, ...userTemplateStrings };
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

/**
 * User-supplied template overrides. Use setTemplateStrings() to add or update.
 */
let userTemplateStrings: Partial<typeof coreTemplateStrings> = {};

/**
 * Register or update user template overrides.
 * @param templates Partial template object to merge with defaults.
 */
export function setTemplateStrings(templates: Partial<typeof coreTemplateStrings>): void {
  userTemplateStrings = { ...userTemplateStrings, ...templates };
}

/**
 * Renders an array of options using a template.
 */
export function renderOptions(options: Array<any>, templateKey: string, templateSet: KTAlertTemplateStrings): string {
  const template = templateSet[templateKey as keyof KTAlertTemplateStrings];
  if (!template) return '';

  return options.map(option => {
    const data = {
      value: option.value,
      label: option.label,
      selected: option.value === option.inputValue ? ' selected' : '',
      checked: option.checked || false ? ' checked' : '',
      disabled: option.disabled || false ? ' disabled' : '',
      attrs: option.attrs || ''
    };

    if (isTemplateFunction(template)) {
      return template(data);
    } else if (typeof template === 'string') {
      return renderTemplateString(template, data);
    }
    return '';
  }).join('');
}

