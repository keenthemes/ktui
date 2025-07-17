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
  dismissible: false,
  modal: false,
  input: false,
  customContent: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  timer: undefined,
};

/**
 * KTAlert
 *
 * Modular alert/dialog component for notifications, confirmations, and custom content.
 *
 * @class
 * @extends KTComponent
 *
 * Features (to be implemented):
 * - Modal and non-modal support
 * - Multiple alert types (success, error, warning, info, question)
 * - Customizable via templates and data attributes
 * - Dismiss, confirm, cancel, and input flows
 * - Accessibility and ARIA support
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
        dataAttrs[key] = attr.value;
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
    this._config = {
      ...defaultConfig,
      ...globalConfig,
      ...dataAttrs,
      ...jsonConfig,
      ...(config || {}),
    };
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
      containerHtml = `<div>${content}</div>`;
    }
    // Create DOM node
    const temp = document.createElement('div');
    temp.innerHTML = containerHtml;
    this._container = temp.firstElementChild as HTMLElement;
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
    if (!this._templateSet.icon) return '';
    const iconVal = this._config.icon || '';
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
    if (!this._config.input || !this._templateSet.input) return '';
    const inputVal = this._config.inputValue || '';
    const tpl = this._templateSet.input;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, input: inputVal });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, input: inputVal });
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
    if (!this._templateSet.confirmButton) return '';
    const confirmText = this._config.confirmText || 'OK';
    const tpl = this._templateSet.confirmButton;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, confirmText });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, confirmText });
    }
    return '';
  }

  /** Render cancel button fragment */
  private _renderCancelButton(): string {
    if (!this._templateSet.cancelButton) return '';
    const cancelText = this._config.cancelText || 'Cancel';
    const tpl = this._templateSet.cancelButton;
    if (isTemplateFunction(tpl)) {
      return tpl({ ...this._config, cancelText });
    } else if (typeof tpl === 'string') {
      return renderTemplateString(tpl, { ...this._config, cancelText });
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
    if (!this._config.dismissible || !this._templateSet.closeButton) return '';
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
        this._state.isDismissed = true;
        this._fireEvent('dismiss', {});
        this._element.innerHTML = '';
      });
    }
    // Confirm button
    const confirmBtn = this._container.querySelector('[data-kt-alert-confirm]');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this._fireEvent('confirm', { inputValue: this._state.inputValue });
        this._state.isDismissed = true;
        this._element.innerHTML = '';
      });
    }
    // Cancel button
    const cancelBtn = this._container.querySelector('[data-kt-alert-cancel]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._fireEvent('cancel', {});
        this._state.isDismissed = true;
        this._element.innerHTML = '';
      });
    }
    // Input field
    const inputEl = this._container.querySelector('[data-kt-alert-input]') as HTMLInputElement;
    if (inputEl) {
      inputEl.addEventListener('input', (e: Event) => {
        this._state.inputValue = (e.target as HTMLInputElement).value;
        this._fireEvent('input', { value: this._state.inputValue });
      });
    }
  }

  /**
   * Show an alert as a modal overlay (SweetAlert2-style JS API).
   * Creates and manages its own overlay/modal DOM. Returns a Promise that resolves with the user's action/result.
   * @param config - KTAlertConfig for the alert
   */
  static show(config: KTAlertConfig): Promise<{ action: 'confirm' | 'cancel' | 'dismiss', inputValue?: string }> {
    // Remove any existing overlay
    const existing = document.getElementById('kt-alert-overlay');
    if (existing) existing.parentNode?.removeChild(existing);
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'kt-alert-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0,0,0,0.2)';
    document.body.appendChild(overlay);
    // Render alert in overlay
    const alertInstance = new KTAlert(overlay, config);
    // Promise for result
    return new Promise((resolve) => {
      // Helper to clean up overlay
      const cleanup = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };
      // Listen for confirm, cancel, dismiss
      overlay.addEventListener('click', (e) => {
        // Prevent overlay click from closing unless explicitly allowed (optional: config.closeOnClickOutside)
        if (e.target === overlay && config.closeOnClickOutside) {
          cleanup();
          resolve({ action: 'dismiss' });
        }
      });
      // Listen for alert actions
      const observer = new MutationObserver(() => {
        if (!overlay.contains(overlay.firstChild)) {
          cleanup();
          observer.disconnect();
        }
      });
      observer.observe(overlay, { childList: true });
      // Patch KTAlert to fire custom events for confirm/cancel/dismiss
      const origFireEvent = (alertInstance as any)._fireEvent;
      (alertInstance as any)._fireEvent = function(type: string, payload: any) {
        origFireEvent.call(this, type, payload);
        if (type === 'confirm') {
          cleanup();
          resolve({ action: 'confirm', inputValue: payload?.inputValue });
        } else if (type === 'cancel') {
          cleanup();
          resolve({ action: 'cancel' });
        } else if (type === 'dismiss') {
          cleanup();
          resolve({ action: 'dismiss' });
        }
      };
    });
  }

  /**
   * [DEPRECATED] Auto-initializes all KTAlert components in the DOM.
   * Declarative [data-kt-alert] usage is no longer supported. Use KTAlert.show(config) instead.
   */
  // static init(selector: string = '[data-kt-alert]'): void {
  //   const elements = document.querySelectorAll<HTMLElement>(selector);
  //   elements.forEach((el) => {
  //     const anyEl = el as any;
  //     if (anyEl.__kt_alert_instance__) return;
  //     const isButton = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.tagName === 'A';
  //     if (isButton) {
  //       el.addEventListener('click', (e) => {
  //         e.preventDefault();
  //         let alertOverlay = document.createElement('div');
  //         alertOverlay.style.position = 'fixed';
  //         alertOverlay.style.top = '0';
  //         alertOverlay.style.left = '0';
  //         alertOverlay.style.width = '100vw';
  //         alertOverlay.style.height = '100vh';
  //         alertOverlay.style.zIndex = '9999';
  //         alertOverlay.style.display = 'flex';
  //         alertOverlay.style.alignItems = 'center';
  //         alertOverlay.style.justifyContent = 'center';
  //         alertOverlay.style.background = 'rgba(0,0,0,0.2)';
  //         document.body.appendChild(alertOverlay);
  //         const alertInstance = new KTAlert(alertOverlay, undefined);
  //         Array.from(el.attributes).forEach(attr => {
  //           if (attr.name.startsWith('data-kt-alert-')) {
  //             alertOverlay.setAttribute(attr.name, attr.value);
  //           }
  //         });
  //         (alertInstance as any)._buildConfig();
  //         (alertInstance as any)._render();
  //         const removeOverlay = () => {
  //           if (alertOverlay.parentNode) alertOverlay.parentNode.removeChild(alertOverlay);
  //         };
  //         alertOverlay.addEventListener('dismiss', removeOverlay);
  //         alertOverlay.addEventListener('kt-alert-dismiss', removeOverlay);
  //         const observer = new MutationObserver(() => {
  //           if (!alertOverlay.contains(alertOverlay.firstChild)) {
  //             removeOverlay();
  //             observer.disconnect();
  //           }
  //         });
  //         observer.observe(alertOverlay, { childList: true });
  //       });
  //       anyEl.__kt_alert_instance__ = true;
  //     } else {
  //       anyEl.__kt_alert_instance__ = new KTAlert(el);
  //     }
  //   });
  // }
}