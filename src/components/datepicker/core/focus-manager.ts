/*
 * focus-manager.ts - Internal focus management for KTDatepicker
 * Replaces external dependency on select component's FocusManager
 */

/**
 * Focus manager configuration
 */
export interface FocusManagerConfig {
  enableFocusTrapping: boolean;
  enableFocusRestoration: boolean;
  enableKeyboardNavigation: boolean;
  enableDebugging: boolean;
}

/**
 * Focusable element interface
 */
export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  isFocusable: boolean;
}

/**
 * Focus manager for handling focus states and navigation
 */
export class FocusManager {
  private _config: FocusManagerConfig;
  private _focusedElement: HTMLElement | null = null;
  private _previousFocusedElement: HTMLElement | null = null;
  private _focusableElements: FocusableElement[] = [];
  private _currentFocusIndex: number = -1;

  constructor(config?: Partial<FocusManagerConfig>) {
    this._config = {
      enableFocusTrapping: true,
      enableFocusRestoration: true,
      enableKeyboardNavigation: true,
      enableDebugging: false,
      ...config
    };
  }

  /**
   * Set focus to element
   */
  public focus(element: HTMLElement): boolean {
    if (!element || !this._isElementFocusable(element)) {
      if (this._config.enableDebugging) {
        console.log('[FocusManager] Element not focusable:', element);
      }
      return false;
    }

    this._previousFocusedElement = this._focusedElement;
    this._focusedElement = element;

    try {
      element.focus();

      if (this._config.enableDebugging) {
        console.log('[FocusManager] Focused element:', element);
      }

      return true;
    } catch (error) {
      if (this._config.enableDebugging) {
        console.log('[FocusManager] Failed to focus element:', error);
      }
      return false;
    }
  }

  /**
   * Get currently focused element
   */
  public getFocusedElement(): HTMLElement | null {
    return this._focusedElement;
  }

  /**
   * Get previously focused element
   */
  public getPreviousFocusedElement(): HTMLElement | null {
    return this._previousFocusedElement;
  }

  /**
   * Restore focus to previous element
   */
  public restoreFocus(): boolean {
    if (!this._config.enableFocusRestoration || !this._previousFocusedElement) {
      return false;
    }

    return this.focus(this._previousFocusedElement);
  }

  /**
   * Set focusable elements for navigation
   */
  public setFocusableElements(elements: HTMLElement[]): void {
    this._focusableElements = elements
      .filter(element => this._isElementFocusable(element))
      .map(element => ({
        element,
        tabIndex: this._getTabIndex(element),
        isFocusable: true
      }))
      .sort((a, b) => a.tabIndex - b.tabIndex);

    if (this._config.enableDebugging) {
      console.log('[FocusManager] Set focusable elements:', this._focusableElements.length);
    }
  }

  /**
   * Focus next element
   */
  public focusNext(): boolean {
    if (!this._config.enableKeyboardNavigation || this._focusableElements.length === 0) {
      return false;
    }

    this._currentFocusIndex = (this._currentFocusIndex + 1) % this._focusableElements.length;
    const nextElement = this._focusableElements[this._currentFocusIndex];

    return this.focus(nextElement.element);
  }

  /**
   * Focus previous element
   */
  public focusPrevious(): boolean {
    if (!this._config.enableKeyboardNavigation || this._focusableElements.length === 0) {
      return false;
    }

    this._currentFocusIndex = this._currentFocusIndex <= 0
      ? this._focusableElements.length - 1
      : this._currentFocusIndex - 1;

    const prevElement = this._focusableElements[this._currentFocusIndex];

    return this.focus(prevElement.element);
  }

  /**
   * Focus first element
   */
  public focusFirst(): boolean {
    if (this._focusableElements.length === 0) {
      return false;
    }

    this._currentFocusIndex = 0;
    return this.focus(this._focusableElements[0].element);
  }

  /**
   * Focus last element
   */
  public focusLast(): boolean {
    if (this._focusableElements.length === 0) {
      return false;
    }

    this._currentFocusIndex = this._focusableElements.length - 1;
    return this.focus(this._focusableElements[this._currentFocusIndex].element);
  }

  /**
   * Check if element is focusable
   */
  private _isElementFocusable(element: HTMLElement): boolean {
    if (!element || element.hidden || element.style.display === 'none') {
      return false;
    }

    const tabIndex = this._getTabIndex(element);
    return tabIndex >= 0;
  }

  /**
   * Get tab index of element
   */
  private _getTabIndex(element: HTMLElement): number {
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === null) {
      // Check if element is naturally focusable
      const tagName = element.tagName.toLowerCase();
      const naturallyFocusable = ['input', 'button', 'select', 'textarea', 'a'].includes(tagName);
      return naturallyFocusable ? 0 : -1;
    }

    return parseInt(tabIndex, 10);
  }

  /**
   * Clear focus
   */
  public clearFocus(): void {
    this._focusedElement = null;
    this._currentFocusIndex = -1;
  }

  /**
   * Dispose of focus manager
   */
  public dispose(): void {
    this.clearFocus();
    this._focusableElements = [];
    this._previousFocusedElement = null;
  }
}