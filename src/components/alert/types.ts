/*
 * types.ts - Type definitions for KTAlert (modular alert/dialog component)
 * Defines config, template, and state interfaces for extensible template customization.
 */

// Template keys for all customizable UI fragments
export type KTAlertTemplateKey =
  | 'container'
  | 'icon'
  | 'title'
  | 'message'
  | 'actions'
  | 'confirmButton'
  | 'cancelButton'
  | 'input'
  | 'closeButton'
  | 'customContent';

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
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Whether the alert is modal (blocks background) */
  modal?: boolean;
  /** Whether to show an input field */
  input?: boolean;
  /** Custom content HTML */
  customContent?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Auto-dismiss timer (ms) */
  timer?: number;
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