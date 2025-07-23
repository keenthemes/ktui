/*
 * dropdown.ts - Datepicker dropdown management
 * Provides dropdown functionality for KTDatepicker following select component patterns.
 * Handles positioning, transitions, and event management.
 */

import {
  Instance as PopperInstance,
  createPopper,
  Placement,
} from '@popperjs/core';
import KTDom from '../../../../helpers/dom';
import KTData from '../../../../helpers/data';
import KTComponent from '../../../component';
import { KTDatepickerConfig } from '../../config/types';
import { EventManager } from '../../core/event-manager';

/**
 * KTDatepickerDropdown
 *
 * A specialized dropdown implementation for the KTDatepicker component.
 * This module handles the dropdown functionality for the datepicker component,
 * including positioning and showing/hiding.
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
  private _isTransitioning: boolean = false;
  private _popperInstance: PopperInstance | null = null;
  private _eventManager: EventManager;

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
    config: KTDatepickerConfig,
  ) {
    super();

    this._element = element;
    this._toggleElement = toggleElement;
    this._dropdownElement = dropdownElement;
    this._config = config;

    const container = this._resolveDropdownContainer();
    if (container) {
      if (container !== this._dropdownElement.parentElement) {
        container.appendChild(this._dropdownElement);
      }
    }

    this._eventManager = new EventManager();
    this._setupEventListeners();
  }

  /**
   * Set up event listeners for the dropdown
   */
  private _setupEventListeners(): void {
    // Event listeners are managed by the main datepicker class
  }

  /**
   * Set dropdown width to match toggle element
   */
  private _setDropdownWidth(): void {
    if (this._config.dropdownWidth === 'auto') {
      this._dropdownElement.style.width = 'auto';
      this._dropdownElement.style.minWidth = 'auto';
    } else if (this._config.dropdownWidth === 'toggle') {
      const toggleRect = this._toggleElement.getBoundingClientRect();
      this._dropdownElement.style.width = `${toggleRect.width}px`;
    } else if (typeof this._config.dropdownWidth === 'string') {
      this._dropdownElement.style.width = this._config.dropdownWidth;
    }
  }

  /**
   * Initialize Popper.js for positioning
   */
  private _initPopper(): void {
    if (this._popperInstance) {
      this._popperInstance.destroy();
    }

    const placement = (this._config.dropdownPlacement as Placement) || 'bottom-start';
    const offset = this._parseOffset(this._config.dropdownOffset || '0,5');

    this._popperInstance = createPopper(this._toggleElement, this._dropdownElement, {
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset,
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: this._config.dropdownBoundary || 'clippingParents',
            padding: 8,
          },
        },
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start', 'bottom-start', 'top-end', 'bottom-end'],
          },
        },
      ],
    });
  }

  /**
   * Parse offset string to array
   */
  private _parseOffset(offset: string): number[] {
    return offset.split(',').map((val) => parseInt(val.trim(), 10));
  }

  /**
   * Destroy Popper instance
   */
  private _destroyPopper(): void {
    if (this._popperInstance) {
      this._popperInstance.destroy();
      this._popperInstance = null;
    }
  }

  /**
   * Update dropdown position
   */
  public updatePosition(): void {
    if (this._popperInstance) {
      this._popperInstance.update();
    }
  }

  /**
   * Open the dropdown
   */
  public open(): void {
    if (this._config.disabled) {
      if (this._config.debug) {
        console.log('KTDatepickerDropdown.open: datepicker is disabled, not opening');
      }
      return;
    }
    if (this._isOpen || this._isTransitioning) return;

    // Begin opening transition
    this._isTransitioning = true;

    // Set initial styles
    this._dropdownElement.classList.remove('hidden');
    this._dropdownElement.style.opacity = '0';

    // Set dropdown width
    this._setDropdownWidth();

    // Reflow
    KTDom.reflow(this._dropdownElement);

    // Apply z-index
    let zIndexToApply: number | null = null;

    if (this._config.dropdownZindex) {
      zIndexToApply = this._config.dropdownZindex;
    }

    // Consider the dropdown's current z-index if it's already set and higher
    const currentDropdownZIndexStr = KTDom.getCssProp(this._dropdownElement, 'z-index');
    if (currentDropdownZIndexStr && currentDropdownZIndexStr !== 'auto') {
      const currentDropdownZIndex = parseInt(currentDropdownZIndexStr);
      if (!isNaN(currentDropdownZIndex) && currentDropdownZIndex > (zIndexToApply || 0)) {
        zIndexToApply = currentDropdownZIndex;
      }
    }

    // Ensure dropdown is above elements within its original toggle's parent context
    const toggleParentContextZindex = KTDom.getHighestZindex(this._element);
    if (toggleParentContextZindex !== null && toggleParentContextZindex >= (zIndexToApply || 0)) {
      zIndexToApply = toggleParentContextZindex + 1;
    }

    if (zIndexToApply !== null) {
      this._dropdownElement.style.zIndex = zIndexToApply.toString();
    }

    // Initialize popper
    this._initPopper();

    // Add active classes for visual state
    this._dropdownElement.classList.add('open');
    this._toggleElement.classList.add('active');

    // Start transition
    this._dropdownElement.style.opacity = '1';

    // Handle transition end
    KTDom.transitionEnd(this._dropdownElement, () => {
      this._isTransitioning = false;
      this._isOpen = true;

      // Notify state manager that transition is complete
      if (this._config.debug) {
        console.log('KTDatepickerDropdown: Open transition completed');
      }
    });
  }

  /**
   * Close the dropdown
   */
  public close(): void {
    if (this._config.debug) {
      console.log('KTDatepickerDropdown.close called - isOpen:', this._isOpen, 'isTransitioning:', this._isTransitioning);
    }

    if (!this._isOpen || this._isTransitioning) {
      if (this._config.debug) {
        console.log('KTDatepickerDropdown.close - early return: dropdown not open or is transitioning');
      }
      return;
    }

    this._isTransitioning = true;
    this._dropdownElement.style.opacity = '0';

    let transitionComplete = false;
    const fallbackTimer = setTimeout(() => {
      if (!transitionComplete) {
        transitionComplete = true;
        this._completeClose();
      }
    }, 300); // Fallback timeout

    const completeTransition = () => {
      if (!transitionComplete) {
        transitionComplete = true;
        clearTimeout(fallbackTimer);
        this._completeClose();
      }
    };

    KTDom.transitionEnd(this._dropdownElement, completeTransition);
  }

  /**
   * Complete the close process
   */
  private _completeClose(): void {
    this._isTransitioning = false;
    this._isOpen = false;

    // Remove active classes
    this._dropdownElement.classList.remove('open');
    this._toggleElement.classList.remove('active');

    // Hide dropdown
    this._dropdownElement.classList.add('hidden');

    // Clean up popper
    this._destroyPopper();

    // Notify state manager that transition is complete
    if (this._config.debug) {
      console.log('KTDatepickerDropdown: Close transition completed');
    }
  }

  /**
   * Check if dropdown is open
   */
  public isOpen(): boolean {
    return this._isOpen;
  }

    /**
   * Dispose of the dropdown
   */
  public override dispose(): void {
    // Clean up event listeners
    this._eventManager.removeAllListeners(document as unknown as HTMLElement);
    this._destroyPopper();

    // Remove dropdown from DOM
    if (this._dropdownElement && this._dropdownElement.parentElement) {
      this._dropdownElement.parentElement.removeChild(this._dropdownElement);
    }
  }

  /**
   * Resolve the container for the dropdown
   */
  private _resolveDropdownContainer(): HTMLElement | null {
    // Check if dropdown should be rendered in a specific container
    if (this._config.dropdownContainer) {
      const container = document.querySelector(this._config.dropdownContainer);
      if (container instanceof HTMLElement) {
        return container;
      }
    }

    // Default to body for better positioning
    return document.body;
  }
}