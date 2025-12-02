/*
 * types.ts - Type definitions for KTAlert (modular alert/dialog component)
 * Defines config, template, and state interfaces for extensible template customization.
 */

// Template keys for all customizable UI fragments
export type KTAlertTemplateKey =
  | 'container'
  | 'overlay'
  | 'modal'
  | 'icon'
  | 'title'
  | 'message'
  | 'actions'
  | 'confirmButton'
  | 'cancelButton'
  | 'confirmButtonCustomClass'
  | 'cancelButtonCustomClass'
  | 'input'
  | 'inputText'
  | 'inputTextarea'
  | 'inputSelect'
  | 'inputRadio'
  | 'inputCheckbox'
  | 'inputError'
  | 'closeButton'
  | 'customContent'
  | 'loaderHtml'
  | 'option'
  | 'radioOption'
  | 'checkboxOption';

// Template string map
export type KTAlertTemplateStrings = {
  [K in KTAlertTemplateKey]?: string | ((data: any) => string);
};

/**
 * Configuration options for KTAlert
 */
export interface KTAlertConfig {
  /** Custom templates for UI fragments */
  templates?: KTAlertTemplateStrings;
  /** Alert type (success, error, warning, info, question, custom) */
  type?: string;
  /** Title text or HTML */
  title?: string;
  /** Message text or HTML */
  message?: string;
  /** Icon name or HTML (success, error, warning, info, question, or custom HTML) */
  icon?: string;
  /** Position of the alert (top, center, bottom, etc.) */
  position?: string;
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Whether the alert is modal (blocks background) */
  modal?: boolean;
  /** Whether to show an input field */
  input?: boolean;
  /** Input placeholder text */
  inputPlaceholder?: string;
  /** Input default value */
  inputValue?: string;
  /** Input type (text, password, email, textarea, select, radio, checkbox, etc.) */
  inputType?: string;
  /** Input label */
  inputLabel?: string;
  /** Input attributes (object of key-value pairs) */
  inputAttributes?: Record<string, string>;
  /** Input options (for select, radio, checkbox, etc.) */
  inputOptions?: Array<{ value: string; label: string; checked?: boolean; disabled?: boolean }>;
  /** Custom content HTML */
  customContent?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Show confirm button */
  showConfirmButton?: boolean;
  /** Show cancel button */
  showCancelButton?: boolean;
  /** Show close (X) button */
  showCloseButton?: boolean;
  /** Auto-dismiss timer (ms) */
  timer?: number;
  /** Allow dismiss by clicking outside the alert */
  allowOutsideClick?: boolean;
  /** Allow dismiss by pressing Escape key */
  allowEscapeKey?: boolean;
  /** Focus confirm button on open */
  focusConfirm?: boolean;
  /** Show loader on confirm */
  showLoaderOnConfirm?: boolean;
  /** Custom class for alert container */
  customClass?: string;
  /** Loader HTML or template */
  loaderHtml?: string;

  // Validation and processing callbacks
  /** Input validation function - return string for error, null/undefined for success */
  inputValidator?: (value: string) => string | null | undefined | Promise<string | null | undefined>;
  /** Pre-confirmation processing function - can return Promise for async processing */
  preConfirm?: (value: string) => string | Promise<string>;
  /** Auto-focus the input field when alert opens */
  inputAutoFocus?: boolean;

  // Granular class overrides for individual UI elements
  overlayClass?: string;
  modalClass?: string;
  containerClass?: string;
  iconClass?: string;
  titleClass?: string;
  messageClass?: string;
  actionsClass?: string;
  inputClass?: string;
  inputLabelClass?: string;
  closeButtonClass?: string;
  customContentClass?: string;
  loaderClass?: string;
  /**
   * Per-type theming overrides (e.g., { success: { customClass, icon, confirmText, ... }, ... })
   */
  theme?: {
    [type: string]: {
      customClass?: string;
      icon?: string;
      confirmText?: string;
      cancelText?: string;
      confirmButtonClass?: string;
      cancelButtonClass?: string;
      // Add more per-type overrides as needed
    }
  };
  /** Additional config options */
  [key: string]: any;
}

// State interface for KTAlert
export interface KTAlertState {
  isOpen: boolean;
  isModal: boolean;
  isDismissed: boolean;
  inputValue?: string;
  // Add more state fields as needed
}