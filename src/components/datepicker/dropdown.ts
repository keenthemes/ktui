/*
 * dropdown.ts - Dropdown management for KTDatepicker (revamp)
 * Follows KTSelectDropdown pattern: extends KTComponent, modular, manages open/close and events.
 */

import KTComponent from '../component';
import { KTDatepickerConfig } from './types';

/**
 * KTDatepickerDropdown
 *
 * Manages the dropdown UI for the datepicker, including open/close and event handling.
 * Ready for popper.js integration for advanced positioning.
 */
export class KTDatepickerDropdown extends KTComponent {
  protected override readonly _name: string = 'datepicker-dropdown';
  protected override readonly _config: KTDatepickerConfig;

  // DOM Elements
  protected _element: HTMLElement;
  private _toggleElement: HTMLElement;
  private _dropdownElement: HTMLElement;

  // State
  private _isOpen: boolean = false;

  /**
   * Constructor
   * @param element The parent element (datepicker wrapper)
   * @param toggleElement The element that triggers the dropdown
   * @param dropdownElement The dropdown content element
   * @param config The configuration options
   */
  constructor(
    element: HTMLElement,
    toggleElement: HTMLElement,
    dropdownElement: HTMLElement,
    config: KTDatepickerConfig
  ) {
    super();
    this._element = element;
    this._toggleElement = toggleElement;
    this._dropdownElement = dropdownElement;
    this._config = config;
    this._setupEventListeners();
  }

  /**
   * Set up event listeners for the dropdown
   */
  private _setupEventListeners(): void {
    // Toggle click
    this._toggleElement.addEventListener('click', this._handleToggleClick.bind(this));
    // Close on outside click
    document.addEventListener('click', this._handleOutsideClick.bind(this));
  }

  /**
   * Handle toggle element click
   */
  private _handleToggleClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle clicks outside the dropdown
   */
  private _handleOutsideClick(event: MouseEvent): void {
    if (!this._isOpen) return;
    const target = event.target as HTMLElement;
    if (
      !this._element.contains(target) &&
      !this._dropdownElement.contains(target)
    ) {
      this.close();
    }
  }

  /**
   * Open the dropdown
   */
  public open(): void {
    if (this._isOpen) return;
    this._dropdownElement.classList.add('open');
    this._dropdownElement.classList.remove('hidden');
    this._isOpen = true;
  }

  /**
   * Close the dropdown
   */
  public close(): void {
    if (!this._isOpen) return;
    this._dropdownElement.classList.remove('open');
    this._dropdownElement.classList.add('hidden');
    this._isOpen = false;
  }

  /**
   * Check if dropdown is open
   */
  public isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Clean up component
   */
  public override dispose(): void {
    this._toggleElement.removeEventListener('click', this._handleToggleClick as any);
    document.removeEventListener('click', this._handleOutsideClick as any);
    this._isOpen = false;
  }
}