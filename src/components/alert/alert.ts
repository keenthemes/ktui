/*
 * alert.ts - Main entry point for KTAlert (modular alert/dialog component)
 *
 * Provides a modular, extensible alert/dialog system for notifications, confirmations, and custom content.
 * Follows the KTDatepicker pattern: extends KTComponent, uses a template system, and supports full customization.
 *
 * All UI fragments are rendered via dedicated methods and customizable via a one-level config/template system.
 *
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import { KTAlertConfig, KTAlertState, KTAlertTemplateStrings } from './types';
import { getTemplateStrings, defaultTemplates, renderTemplateString, isTemplateFunction } from './templates';

/**
 * Default configuration for KTAlert
 */
const defaultConfig: KTAlertConfig = {
  type: 'info',
  title: '',
  message: '',
  icon: undefined, // success, error, warning, info, question, or custom HTML
  position: 'center',
  dismissible: false,
  modal: false,
  input: false,
  inputPlaceholder: '',
  inputValue: '',
  inputType: 'text',
  inputLabel: '',
  inputAttributes: {},
  customContent: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showConfirmButton: true,
  showCancelButton: false,
  showCloseButton: true,
  timer: undefined,
  allowOutsideClick: true,
  allowEscapeKey: true,
  focusConfirm: true,
  showLoaderOnConfirm: false,
  customClass: '',
  loaderHtml: '',
};

/**
 * KTAlert
 *
 * Modular alert/dialog component for notifications, confirmations, and custom content.
 *
 * @class
 * @extends KTComponent
 */
export class KTAlert extends KTComponent {
  /**
   * Component name for data attributes and config
   * @protected
   * @type {string}
   */
  protected override readonly _name: string = 'alert';

  /**
   * Component configuration (merged from defaults, global, data attributes, and user config)
   * @protected
   * @type {KTAlertConfig}
   */
  protected override _config: KTAlertConfig;

  /**
   * Component state (open, modal, dismissed, etc.)
   * @protected
   * @type {KTAlertState}
   */
  protected _state: KTAlertState;

  /**
   * Set of template strings for all UI fragments
   * @protected
   * @type {KTAlertTemplateStrings}
   */
  protected _templateSet: ReturnType<typeof getTemplateStrings>;

  /**
   * User-provided template overrides
   * @private
   * @type {Record<string, string | ((data: any) => string)>}
   */
  private _userTemplates: Record<string, string | ((data: any) => string)> = {};

  /**
   * Main container element for the alert
   * @private
   * @type {HTMLElement}
   */
  private _container: HTMLElement;

  /**
   * Timer ID for auto-dismiss
   * @private
   * @type {ReturnType<typeof setTimeout> | null}
   */
  private _timerId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Constructor: Initializes the alert component (matches KTDatepicker pattern)
   * @param element - The root element for the alert
   * @param config - Optional user config
   */
  constructor(element: HTMLElement, config?: KTAlertConfig) {
    super();
    this._init(element);
    this._buildConfig(config);
    this._templateSet = getTemplateStrings(this._config);
    this._state = {
      isOpen: true,
      isModal: !!this._config.modal,
      isDismissed: false,
      inputValue: this._config.inputValue || ''
    };
    this._render();
    // Auto-dismiss logic: start timer if timer is set in config
    if (typeof this._config.timer === 'number' && this._config.timer > 0) {
      this._timerId = setTimeout(() => {
        if (!this._state.isDismissed) {
          this._state.isDismissed = true;
          this._fireEvent('dismiss', { reason: 'timer' });
          this._element.innerHTML = '';
        }
      }, this._config.timer);
    }
  }

  /**
   * Initialize the component (placeholder)
   * @param {HTMLElement} element - The root element for the alert
   * @protected
   */
  protected _init(element: HTMLElement) {
    super._init(element);
    // To be implemented: config merging, template setup, event binding
  }

  /**
   * Build the component config by merging defaults, global, data attributes, and user config
   * @param {KTAlertConfig} [config] - Optional user config
   * @protected
   */
  protected _buildConfig(config?: KTAlertConfig) {
    if (!this._element) return;
    // Merge order: defaultConfig < globalConfig < data attributes < JSON config < user config
    const globalConfig = this._getGlobalConfig() as KTAlertConfig;
    // Parse data-kt-alert-* attributes
    const dataAttrs: Record<string, any> = {};
    Array.from(this._element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-kt-alert-') && attr.name !== 'data-kt-alert-config') {
        // Convert kebab-case to camelCase
        const key = attr.name
          .replace('data-kt-alert-', '')
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        let value: any = attr.value;
        // Parse booleans and numbers for known config keys
        if ([
          'dismissible', 'modal', 'input', 'showConfirmButton', 'showCancelButton', 'showCloseButton',
          'allowOutsideClick', 'allowEscapeKey', 'focusConfirm', 'showLoaderOnConfirm'
        ].includes(key)) {
          value = value === 'true';
        } else if (['timer'].includes(key)) {
          value = Number(value);
        } else if (['inputAttributes'].includes(key)) {
          try { value = JSON.parse(value); } catch { value = {}; }
        }
        dataAttrs[key] = value;
      }
    });
    // JSON config (data-kt-alert-config)
    let jsonConfig = {};
    const jsonAttr = this._element.getAttribute('data-kt-alert-config');
    if (jsonAttr) {
      try {
        jsonConfig = JSON.parse(jsonAttr);
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    // Merge all config sources
    let mergedConfig: KTAlertConfig = {
      ...defaultConfig,
      ...globalConfig,
      ...dataAttrs,
      ...jsonConfig,
      ...(config || {}),
    };
    // Apply per-type theming if present
    if (mergedConfig.theme && mergedConfig.type && mergedConfig.theme[mergedConfig.type]) {
      const themeOverrides = mergedConfig.theme[mergedConfig.type];
      mergedConfig = {
        ...mergedConfig,
        ...themeOverrides,
        // Merge button classes into templates if provided
        templates: {
          ...((mergedConfig.templates as any) || {}),
          confirmButton: themeOverrides.confirmButtonClass
            ? `<button type="button" data-kt-alert-confirm aria-label="Confirm" tabindex="0" class="${themeOverrides.confirmButtonClass}">{{confirmText}}</button>`
            : ((mergedConfig.templates && mergedConfig.templates.confirmButton) || undefined),
          cancelButton: themeOverrides.cancelButtonClass
            ? `<button type="button" data-kt-alert-cancel aria-label="Cancel" tabindex="0" class="${themeOverrides.cancelButtonClass}">{{cancelText}}</button>`
            : ((mergedConfig.templates && mergedConfig.templates.cancelButton) || undefined),
        },
      };
    }
    this._config = mergedConfig;
  }

  /**
   * Render the alert UI by composing all fragments using templates and config
   * Adds ARIA roles and keyboard navigation for accessibility
   * @private
   */
  private _render() {
    if (!this._element) return;
    this._templateSet = getTemplateStrings(this._config);
    // Render fragments
    const icon = this._renderIcon();
    const title = this._renderTitle();
    const message = this._renderMessage();
    const input = this._renderInput();
    const customContent = this._renderCustomContent();
    const confirmButton = this._renderConfirmButton();
    const cancelButton = this._renderCancelButton();
    const actions = this._renderActions(confirmButton, cancelButton);
    const closeButton = this._renderCloseButton();
    // Compose content
    const content = [icon, title, message, input, customContent, actions, closeButton].join('');
    // Render container
    const containerTpl = this._templateSet.container;
    let containerHtml: string;
    if (isTemplateFunction(containerTpl)) {
      containerHtml = containerTpl({ ...this._config, content });
    } else if (typeof containerTpl === 'string') {
      containerHtml = renderTemplateString(containerTpl, { ...this._config, content });
    } else {
      // fallback
      containerHtml = `<div>${content}</div>`;
    }
    // Create DOM node
    const temp = document.createElement('div');
    temp.innerHTML = containerHtml;
    this._container = temp.firstElementChild as HTMLElement;
    // Add custom class if set
    if (this._config.customClass) {
      this._container.classList.add(this._config.customClass);
    }
    // Set ARIA attributes for accessibility
    this._container.setAttribute('role', this._config.modal ? 'alertdialog' : 'alert');
    this._container.setAttribute('aria-modal', this._config.modal ? 'true' : 'false');
    this._container.setAttribute('aria-labelledby', 'kt-alert-title');
    this._container.setAttribute('aria-describedby', 'kt-alert-message');
    // Replace or append to element
    this._element.innerHTML = '';
    this._element.appendChild(this._container);
    // Focus first interactive element
    this._focusFirstInteractive();
    // Bind event listeners
    this._bindEvents();
    // Bind keyboard navigation
    this._bindKeyboardNav();
  }

  /**
   * Focus the first interactive element (input, confirm, cancel, close)
   * @private
   */
  private _focusFirstInteractive() {
    if (!this._container) return;
    const first = this._container.querySelector('[data-kt-alert-input], [data-kt-alert-confirm], [data-kt-alert-cancel], [data-kt-alert-close]') as HTMLElement;
    if (first) first.focus();
  }

  /**
   * Keyboard navigation: focus trap, Escape closes, Enter triggers confirm
   * @private
   */
  private _bindKeyboardNav() {
    if (!this._container) return;
    const focusable = Array.from(this._container.querySelectorAll('[tabindex="0"]')) as HTMLElement[];
    if (focusable.length === 0) return;
    let current = 0;
    // Focus trap for modal
    if (this._config.modal) {
      this._container.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            current = (current - 1 + focusable.length) % focusable.length;
          } else {
            current = (current + 1) % focusable.length;
          }
          focusable[current].focus();
        }
      });
    }
    // Escape closes alert if dismissible or modal
    this._container.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (this._config.dismissible || this._config.modal)) {
        this._clearTimer();
        this._state.isDismissed = true;
        this._fireEvent('dismiss', {});
        this._element.innerHTML = '';
      }
      // Enter triggers confirm if present
      if (e.key === 'Enter') {
        const confirmBtn = this._container.querySelector('[data-kt-alert-confirm]') as HTMLElement;
        if (confirmBtn) {
          confirmBtn.click();
        }
      }
    });
  }

  /** Render icon fragment */
  private _renderIcon(): string {
    if (!this._config.icon || !this._templateSet.icon) return '';
    const iconVal = this._config.icon;
    const tpl = this._templateSet.icon;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, icon: iconVal });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, icon: iconVal });
    }
    return '';
  }

  /** Render title fragment */
  private _renderTitle(): string {
    if (!this._templateSet.title) return '';
    const titleVal = this._config.title || '';
    const tpl = this._templateSet.title;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, title: titleVal });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, title: titleVal });
    }
    return '';
  }

  /** Render message fragment */
  private _renderMessage(): string {
    if (!this._templateSet.message) return '';
    const messageVal = this._config.message || '';
    const tpl = this._templateSet.message;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, message: messageVal });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, message: messageVal });
    }
    return '';
  }

  /** Render input fragment */
  private _renderInput(): string {
    if (!this._config.input) return '';
    const inputType = this._config.inputType || 'text';
    const inputPlaceholder = this._config.inputPlaceholder || '';
    const inputValue = this._config.inputValue || '';
    const inputLabel = this._config.inputLabel || '';
    const attrs = this._config.inputAttributes
      ? Object.entries(this._config.inputAttributes).map(([k, v]) => `${k}="${v}"`).join(' ')
      : '';
    const options = this._config.inputOptions || [];
    let tplKey: string = 'inputText';
    let optionsHtml = '';
    switch (inputType) {
      case 'textarea':
        tplKey = 'inputTextarea';
        break;
      case 'select':
        tplKey = 'inputSelect';
        optionsHtml = options.map(opt => `<option value="${opt.value}"${opt.value === inputValue ? ' selected' : ''}${opt.disabled ? ' disabled' : ''}>${opt.label}</option>`).join('');
        break;
      case 'radio':
        tplKey = 'inputRadio';
        optionsHtml = options.map((opt, i) =>
          `<label><input type="radio" name="kt-alert-radio" data-kt-alert-input value="${opt.value}"${opt.value === inputValue ? ' checked' : ''}${opt.disabled ? ' disabled' : ''} ${attrs} aria-label="${opt.label}" tabindex="0" />${opt.label}</label>`
        ).join('');
        break;
      case 'checkbox':
        tplKey = 'inputCheckbox';
        optionsHtml = options.map((opt, i) =>
          `<label><input type="checkbox" name="kt-alert-checkbox" data-kt-alert-input value="${opt.value}"${opt.checked ? ' checked' : ''}${opt.disabled ? ' disabled' : ''} ${attrs} aria-label="${opt.label}" tabindex="0" />${opt.label}</label>`
        ).join('');
        break;
      default:
        tplKey = 'inputText';
        break;
    }
    // Use type assertion to satisfy TS for dynamic template keys
    const tpl = this._templateSet[tplKey as keyof typeof this._templateSet];
    const data = { ...this._config, inputType, inputPlaceholder, inputValue, inputLabel, attrs, optionsHtml };
    if (isTemplateFunction(tpl)) {
      return tpl(data);
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, data);
    }
    return '';
  }

  /** Render custom content fragment */
  private _renderCustomContent(): string {
    if (!this._templateSet.customContent) return '';
    const customVal = this._config.customContent || '';
    const tpl = this._templateSet.customContent;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, customContent: customVal });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, customContent: customVal });
    }
    return '';
  }

  /** Render confirm button fragment */
  private _renderConfirmButton(): string {
    if (!this._config.showConfirmButton) return '';
    const confirmText = this._config.confirmText || 'OK';
    let tpl = this._templateSet.confirmButton;
    // Use custom class template if present
    if (this._config.confirmButtonClass && this._templateSet.confirmButtonCustomClass) {
      tpl = this._templateSet.confirmButtonCustomClass;
    }
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, confirmText, confirmButtonClass: this._config.confirmButtonClass });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, confirmText, confirmButtonClass: this._config.confirmButtonClass });
    }
    return '';
  }

  /** Render cancel button fragment */
  private _renderCancelButton(): string {
    if (!this._config.showCancelButton) return '';
    const cancelText = this._config.cancelText || 'Cancel';
    let tpl = this._templateSet.cancelButton;
    // Use custom class template if present
    if (this._config.cancelButtonClass && this._templateSet.cancelButtonCustomClass) {
      tpl = this._templateSet.cancelButtonCustomClass;
    }
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, cancelText, cancelButtonClass: this._config.cancelButtonClass });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, cancelText, cancelButtonClass: this._config.cancelButtonClass });
    }
    return '';
  }

  /** Render actions fragment (wraps confirm/cancel buttons) */
  private _renderActions(confirmButton: string, cancelButton: string): string {
    if (!this._templateSet.actions) return '';
    const tpl = this._templateSet.actions;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, confirmButton, cancelButton });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, confirmButton, cancelButton });
    }
    return '';
  }

  /** Render close button fragment */
  private _renderCloseButton(): string {
    if (!this._config.showCloseButton || !this._templateSet.closeButton) return '';
    const tpl = this._templateSet.closeButton;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config });
    } else {
      return '';
    }
  }

  /**
   * Attach event listeners for dismiss, confirm, cancel, and input actions
   * @private
   */
  private _bindEvents() {
    if (!this._container) return;
    // Dismiss (close) button
    const closeBtn = this._container.querySelector('[data-kt-alert-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._clearTimer();
        this._state.isDismissed = true;
        this._fireEvent('dismiss', {});
        this._element.innerHTML = '';
      });
    }
    // Confirm button
    const confirmBtn = this._container.querySelector('[data-kt-alert-confirm]');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this._clearTimer();
        // Gather input value(s) for all supported types
        let inputValue: any = undefined;
        const inputType = this._config.inputType || 'text';
        if (inputType === 'checkbox') {
          const checkboxes = this._container.querySelectorAll('input[type="checkbox"][data-kt-alert-input]');
          // Return as comma-separated string for type safety
          inputValue = Array.from(checkboxes).filter((el: any) => el.checked).map((el: any) => el.value).join(',');
        } else if (inputType === 'radio') {
          const radio = this._container.querySelector('input[type="radio"][data-kt-alert-input]:checked') as HTMLInputElement;
          inputValue = radio ? radio.value : undefined;
        } else {
          const inputEl = this._container.querySelector('[data-kt-alert-input]') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          inputValue = inputEl ? inputEl.value : undefined;
        }
        this._fireEvent('confirm', { inputValue });
        this._state.isDismissed = true;
        this._element.innerHTML = '';
      });
    }
    // Cancel button
    const cancelBtn = this._container.querySelector('[data-kt-alert-cancel]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._clearTimer();
        this._fireEvent('cancel', {});
        this._state.isDismissed = true;
        this._element.innerHTML = '';
      });
    }
    // Outside click dismissal (for modal alerts)
    if (this._config.modal && this._config.allowOutsideClick) {
      const overlay = this._element.closest('[data-kt-alert-overlay]');
      if (overlay) {
        overlay.addEventListener('click', (e: Event) => {
          if (e.target === overlay) {
            this._clearTimer();
            this._state.isDismissed = true;
            this._fireEvent('dismiss', {});
            this._element.innerHTML = '';
          }
        });
      }
    }
    // Input field (update state on input/change)
    const inputType = this._config.inputType || 'text';
    if (inputType === 'checkbox' || inputType === 'radio' || inputType === 'select') {
      const inputs = this._container.querySelectorAll('[data-kt-alert-input]');
      inputs.forEach((input: any) => {
        input.addEventListener('change', (e: Event) => {
          if (inputType === 'checkbox') {
            const checkboxes = this._container.querySelectorAll('input[type="checkbox"][data-kt-alert-input]');
            // Store as comma-separated string for type safety
            this._state.inputValue = Array.from(checkboxes).filter((el: any) => el.checked).map((el: any) => el.value).join(',');
          } else if (inputType === 'radio') {
            const radio = this._container.querySelector('input[type="radio"][data-kt-alert-input]:checked') as HTMLInputElement;
            this._state.inputValue = radio ? radio.value : undefined;
          } else if (inputType === 'select') {
            const select = this._container.querySelector('select[data-kt-alert-input]') as HTMLSelectElement;
            this._state.inputValue = select ? select.value : undefined;
          }
          this._fireEvent('input', { value: this._state.inputValue });
        });
      });
    } else {
      const inputEl = this._container.querySelector('[data-kt-alert-input]') as HTMLInputElement | HTMLTextAreaElement;
      if (inputEl) {
        inputEl.addEventListener('input', (e: Event) => {
          this._state.inputValue = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
          this._fireEvent('input', { value: this._state.inputValue });
        });
      }
    }
  }

  /**
   * Clear the current timer if it exists.
   * @private
   */
  private _clearTimer() {
    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  /**
   * SweetAlert2-style API: KTAlert.fire(options)
   * Accepts a config object and returns a Promise that resolves with the user's action and input value.
   */
  static fire(options: any): Promise<{ isConfirmed: boolean, isDismissed: boolean, isCanceled: boolean, value?: string }> {
    // Remove any existing overlay
    const existing = document.querySelector('[data-kt-alert-overlay]');
    if (existing) existing.parentNode?.removeChild(existing);
    // Prepare templates
    const templates = getTemplateStrings(options);
    // Helper to resolve template (string or function)
    function resolveTemplate(tpl: string | ((data: any) => string) | undefined, data: any): string {
      if (typeof tpl === 'function') return tpl(data);
      return tpl ? renderTemplateString(tpl, data) : '';
    }

    // Set default icon based on type if no explicit icon is provided
    const iconToUse = options.icon === false ? '' : (options.icon || (() => {
      switch (options.type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        case 'info': return 'ℹ';
        case 'question': return '?';
        default: return '';
      }
    })());

    // Render modal content (all fragments)
    const icon = iconToUse ? resolveTemplate(templates.icon, { ...options, icon: iconToUse }) : '';
    const title = resolveTemplate(templates.title, options);
    const message = resolveTemplate(templates.message, { ...options, message: options.text || options.message || '' });

    // Render input based on type
    let input = '';
    if (options.input) {
      const inputType = options.inputType || 'text';
      const inputPlaceholder = options.inputPlaceholder || '';
      const inputValue = options.inputValue || '';
      const inputLabel = options.inputLabel || '';
      const attrs = options.inputAttributes ? Object.entries(options.inputAttributes).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
      const inputOptions = options.inputOptions || [];

      let tplKey = 'inputText';
      let optionsHtml = '';

      switch (inputType) {
        case 'textarea':
          tplKey = 'inputTextarea';
          break;
        case 'select':
          tplKey = 'inputSelect';
          optionsHtml = inputOptions.map((opt: any) =>
            `<option value="${opt.value}"${opt.value === inputValue ? ' selected' : ''}${opt.disabled ? ' disabled' : ''}>${opt.label}</option>`
          ).join('');
          break;
        case 'radio':
          tplKey = 'inputRadio';
          optionsHtml = inputOptions.map((opt: any) =>
            `<label><input type="radio" name="kt-alert-radio" data-kt-alert-input value="${opt.value}"${opt.value === inputValue ? ' checked' : ''}${opt.disabled ? ' disabled' : ''} ${attrs} aria-label="${opt.label}" tabindex="0" />${opt.label}</label>`
          ).join('');
          break;
        case 'checkbox':
          tplKey = 'inputCheckbox';
          optionsHtml = inputOptions.map((opt: any) =>
            `<label><input type="checkbox" name="kt-alert-checkbox" data-kt-alert-input value="${opt.value}"${opt.checked ? ' checked' : ''}${opt.disabled ? ' disabled' : ''} ${attrs} aria-label="${opt.label}" tabindex="0" />${opt.label}</label>`
          ).join('');
          break;
        default:
          tplKey = 'inputText';
          break;
      }

      const inputTemplate = templates[tplKey as keyof typeof templates];
      const inputData = {
        ...options,
        inputType,
        inputPlaceholder,
        inputValue,
        inputLabel,
        attrs,
        optionsHtml
      };

      if (typeof inputTemplate === 'string') {
        input = renderTemplateString(inputTemplate, inputData);
      } else if (typeof inputTemplate === 'function') {
        input = inputTemplate(inputData);
      }
    }

    const customContent = options.customContent ? resolveTemplate(templates.customContent, options) : '';
    const confirmButton = options.showConfirmButton !== false ? resolveTemplate(templates.confirmButton, { ...options, confirmText: options.confirmText || 'OK' }) : '';
    const cancelButton = options.showCancelButton ? resolveTemplate(templates.cancelButton, { ...options, cancelText: options.cancelText || 'Cancel' }) : '';
    const actions = resolveTemplate(templates.actions, { ...options, confirmButton, cancelButton });
    const closeButton = options.showCloseButton !== false ? resolveTemplate(templates.closeButton, options) : '';
    // Loader support
    const loaderHtml = options.showLoaderOnConfirm && options.loaderHtml ? resolveTemplate(templates.loaderHtml, options) : '';
    // Compose content
    const content = [icon, title, message, input, customContent, actions, closeButton, loaderHtml].join('');
    // Render modal container
    const modalHtml = resolveTemplate(templates.modal, {
      ...options,
      type: options.type || 'info',
      variant: options.variant || '',
      ariaModal: options.modal !== false ? 'true' : 'false',
      role: options.modal !== false ? 'alertdialog' : 'alert',
      content,
      customClass: options.customClass || '',
      position: options.position || 'center',
    });
    // Render overlay (if modal)
    const overlayHtml = options.modal !== false
      ? resolveTemplate(templates.overlay, { ...options, modal: modalHtml })
      : modalHtml;
    // Create DOM node from template
    const temp = document.createElement('div');
    temp.innerHTML = overlayHtml;
    const overlay = options.modal !== false
      ? temp.querySelector('[data-kt-alert-overlay]') as HTMLElement
      : temp.firstElementChild as HTMLElement;
    document.body.appendChild(overlay);

    // Set custom ID if provided
    const alert = overlay.querySelector('[data-kt-alert]') || overlay;
    if (options.id) {
      alert.id = options.id;
    }

    // Timer support (auto-dismiss)
    let timerId: ReturnType<typeof setTimeout> | null = null;
    // Promise for result
    return new Promise((resolve) => {
      // Helper to clean up overlay
      const cleanup = () => {
        if (timerId) clearTimeout(timerId);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };

      // Timer support (auto-dismiss) - moved inside Promise to access cleanup and resolve
      if (options.timer && typeof options.timer === 'number' && options.timer > 0) {
        timerId = setTimeout(() => {
          cleanup();
          resolve({ isConfirmed: false, isDismissed: true, isCanceled: false });
        }, options.timer);
      }

      // Bind events manually
      const alert = overlay.querySelector('[data-kt-alert]') || overlay;

      // Dismiss (close) button
      const closeBtn = alert.querySelector('[data-kt-alert-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          cleanup();
          resolve({ isConfirmed: false, isDismissed: true, isCanceled: false });
        });
      }

      // Confirm button
      const confirmBtn = alert.querySelector('[data-kt-alert-confirm]');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          // Gather input value(s) for all supported types
          let inputValue: any = undefined;
          const inputType = options.inputType || 'text';
          if (inputType === 'checkbox') {
            const checkboxes = alert.querySelectorAll('input[type="checkbox"][data-kt-alert-input]');
            inputValue = Array.from(checkboxes).filter((el: any) => el.checked).map((el: any) => el.value).join(',');
          } else if (inputType === 'radio') {
            const radio = alert.querySelector('input[type="radio"][data-kt-alert-input]:checked') as HTMLInputElement;
            inputValue = radio ? radio.value : undefined;
          } else {
            const inputEl = alert.querySelector('[data-kt-alert-input]') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            inputValue = inputEl ? inputEl.value : undefined;
          }
          cleanup();
          resolve({ isConfirmed: true, isDismissed: false, isCanceled: false, value: inputValue });
        });
      }

      // Cancel button
      const cancelBtn = alert.querySelector('[data-kt-alert-cancel]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          cleanup();
          resolve({ isConfirmed: false, isDismissed: false, isCanceled: true });
        });
      }

      // Outside click dismissal (for modal alerts)
      if (options.modal && options.allowOutsideClick) {
        overlay.addEventListener('click', (e: Event) => {
          if (e.target === overlay) {
            cleanup();
            resolve({ isConfirmed: false, isDismissed: true, isCanceled: false });
          }
        });
      }

      // Keyboard events
      alert.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && (options.allowEscapeKey !== false || options.dismissible || options.modal)) {
          cleanup();
          resolve({ isConfirmed: false, isDismissed: true, isCanceled: false });
        }
        if (e.key === 'Enter' && confirmBtn) {
          (confirmBtn as HTMLElement).click();
        }
      });
    });
  }

}