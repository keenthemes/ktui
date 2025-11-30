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
import { StateObserver, KTDatepickerUnifiedStateManager } from '../../core/unified-state-manager';
import { KTDatepickerState } from '../../config/types';

/**
 * KTDatepickerDropdown
 *
 * A specialized dropdown implementation for the KTDatepicker component.
 * This module handles the dropdown functionality for the datepicker component,
 * including positioning and showing/hiding.
 */
export class KTDatepickerDropdown extends KTComponent implements StateObserver {
  protected override readonly _name: string = 'datepicker-dropdown';
  protected override readonly _config: KTDatepickerConfig;

  // DOM Elements
  protected _element: HTMLElement;
  private _toggleElement: HTMLElement;
  private _dropdownElement: HTMLElement;

  // State (will be managed by unified state manager)
  private _isOpen: boolean = false;
  private _isTransitioning: boolean = false;
  private _popperInstance: PopperInstance | null = null;
  private _eventManager: EventManager;

  // Unified state manager reference
  private _unifiedStateManager: KTDatepickerUnifiedStateManager | null = null;

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
   * StateObserver implementation
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    // React to dropdown state changes from unified state manager
    if (newState.dropdownState.isOpen !== oldState.dropdownState.isOpen) {
      if (newState.dropdownState.isOpen) {
        this._handleOpenFromState();
      } else {
        this._handleCloseFromState();
      }
    }

    if (newState.dropdownState.isTransitioning !== oldState.dropdownState.isTransitioning) {
      this._isTransitioning = newState.dropdownState.isTransitioning;
    }
  }

  public getUpdatePriority(): number {
    return 10; // Medium priority for dropdown updates
  }

  /**
   * Set unified state manager reference
   */
  public setUnifiedStateManager(stateManager: KTDatepickerUnifiedStateManager): void {
    this._unifiedStateManager = stateManager;
  }

  /**
   * Handle open state change from unified state manager
   */
  private _handleOpenFromState(): void {
    this._isOpen = true;
    this._performOpenTransition();
  }

  /**
   * Handle close state change from unified state manager
   */
  private _handleCloseFromState(): void {
    this._performCloseTransition();
  }

  /**
   * Perform the actual open transition
   */
  private _performOpenTransition(): void {
    if (this._isTransitioning) return;

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

      // Notify unified state manager that transition is complete
      if (this._unifiedStateManager) {
        this._unifiedStateManager.setDropdownTransitioning(false, 'dropdown-transition-complete');
      }
    });
  }

  /**
   * Perform the actual close transition
   */
  private _performCloseTransition(): void {
    if (this._isTransitioning) return;

    this._isTransitioning = true;
    this._dropdownElement.style.opacity = '0';

    let transitionComplete = false;
    const fallbackTimer = setTimeout(() => {
      if (!transitionComplete) {
        transitionComplete = true;
        this._completeCloseTransition();
      }
    }, 300); // Fallback timeout

    const completeTransition = () => {
      if (!transitionComplete) {
        transitionComplete = true;
        clearTimeout(fallbackTimer);
        this._completeCloseTransition();
      }
    };

    KTDom.transitionEnd(this._dropdownElement, completeTransition);
  }

  /**
   * Complete the close transition
   */
  private _completeCloseTransition(): void {
    this._isTransitioning = false;
    this._isOpen = false;

    // Remove active classes
    this._dropdownElement.classList.remove('open');
    this._toggleElement.classList.remove('active');

    // Hide dropdown
    this._dropdownElement.classList.add('hidden');

    // Clean up popper
    this._destroyPopper();

    // Notify unified state manager that transition is complete
    if (this._unifiedStateManager) {
      this._unifiedStateManager.setDropdownTransitioning(false, 'dropdown-transition-complete');
    }
  }

  /**
   * Set dropdown width to match input wrapper element (matching ktselect behavior)
   * Dynamically calculates width based on visibleMonths for multi-month view
   */
  private _setDropdownWidth(): void {
    if (!this._dropdownElement || !this._element) return;

    // Find the input wrapper element to match its width
    const inputWrapper = this._element.querySelector('[data-kt-datepicker-input-wrapper]') as HTMLElement;
    if (!inputWrapper) return;

    // Get visible months count
    const visibleMonths = this._config.visibleMonths ?? 1;

    // Check if width is configured
    if (this._config.dropdownWidth) {
      // If custom width is set, use that
      if (this._config.dropdownWidth === 'auto') {
        // Try to measure the actual content width first (if already rendered)
        const multiMonthContainer = this._dropdownElement.querySelector('[data-kt-datepicker-multimonth-container]') as HTMLElement;

        if (multiMonthContainer && visibleMonths > 1) {
          // Content is already rendered, measure it
          // Force a reflow to ensure accurate measurement
          KTDom.reflow(multiMonthContainer);

          // Measure content width including gaps
          const contentWidth = multiMonthContainer.scrollWidth;

          // Add dropdown padding (px-3 = 12px on each side = 24px total)
          const padding = 24;
          const totalWidth = contentWidth + padding;

          this._dropdownElement.style.width = `${totalWidth}px`;
          this._dropdownElement.style.minWidth = `${totalWidth}px`;
        } else if (visibleMonths > 1) {
          // Content not yet rendered, calculate expected width
          // Base month width: 20rem (320px) per month
          // Gap between months: 1rem (16px) per gap (gap-4)
          // Padding: 0.75rem (12px) on each side = 1.5rem (24px) total
          const monthWidth = 320; // 20rem = 320px
          const gapWidth = 16; // 1rem = 16px (gap-4)
          const paddingWidth = 24; // 1.5rem = 24px (px-3 on each side)

          // Calculate total width: (n months * 320px) + ((n-1) gaps * 16px) + padding
          const totalWidth = (visibleMonths * monthWidth) + ((visibleMonths - 1) * gapWidth) + paddingWidth;

          this._dropdownElement.style.width = `${totalWidth}px`;
          this._dropdownElement.style.minWidth = `${totalWidth}px`;
        } else {
          // Single month: use auto (CSS default applies)
          this._dropdownElement.style.width = 'auto';
          this._dropdownElement.style.minWidth = 'auto';
        }
      } else if (typeof this._config.dropdownWidth === 'string') {
        this._dropdownElement.style.width = this._config.dropdownWidth;
        // Clear min-width when custom width is set
        this._dropdownElement.style.minWidth = '';
      }
    } else {
      // Otherwise, match input wrapper width for a cleaner appearance (like ktselect)
      const inputWrapperWidth = inputWrapper.offsetWidth;
      this._dropdownElement.style.width = `${inputWrapperWidth}px`;
      // Clear min-width to ensure input wrapper width takes precedence
      this._dropdownElement.style.minWidth = '';
    }
  }

  /**
   * Detect if the datepicker is inside a modal container
   * @returns The modal element if found, null otherwise
   */
  private _getModalContainer(): HTMLElement | null {
    return this._element.closest(
      '[data-kt-modal], .kt-modal, .kt-modal-center',
    ) as HTMLElement | null;
  }

  /**
   * Get the appropriate boundary element for Popper positioning
   * For centered modals, use .kt-modal-content to avoid transform calculation issues
   * @returns The boundary element, or null if no modal found
   */
  private _getModalBoundary(): HTMLElement | null {
    const modalParent = this._getModalContainer();
    if (!modalParent) {
      return null;
    }

    // For centered modals, use .kt-modal-content as boundary to avoid transform issues
    if (modalParent.classList.contains('kt-modal-center')) {
      const modalContent = modalParent.querySelector(
        '.kt-modal-content',
      ) as HTMLElement | null;
      return modalContent || modalParent;
    }

    // For non-centered modals, use the modal element itself
    return modalParent;
  }

  /**
   * Get the appropriate positioning strategy based on context
   * @returns 'fixed' if inside non-centered modal, 'absolute' for centered modals or no modal
   */
  private _getPositioningStrategy(): 'fixed' | 'absolute' {
    // Check if config explicitly sets strategy
    if (this._config.dropdownStrategy) {
      return this._config.dropdownStrategy as 'fixed' | 'absolute';
    }

    // For centered modals, use absolute positioning to avoid transform calculation issues
    // For non-centered modals, use fixed positioning
    const modalParent = this._getModalContainer();
    if (modalParent && modalParent.classList.contains('kt-modal-center')) {
      return 'absolute';
    }

    // Use fixed positioning for non-centered modals
    return modalParent ? 'fixed' : 'absolute';
  }

  /**
   * Get the reference element for Popper positioning (calendar button/icon)
   */
  private _getPopperReferenceElement(): HTMLElement {
    // Use calendar button (toggle element) for positioning - dropdown sticks under the icon
    return this._toggleElement;
  }

  /**
   * Initialize Popper.js for positioning
   */
  private _initPopper(): void {
    if (this._popperInstance) {
      this._popperInstance.destroy();
    }

    // Default offset - matching ktselect
    const offsetValue = this._config.dropdownOffset || '0, 5';

    // Get configuration options
    const placement = (this._config.dropdownPlacement as Placement) || 'bottom-start';
    const strategy = this._getPositioningStrategy();
    const preventOverflow = this._config.dropdownPreventOverflow !== false;
    const flip = this._config.dropdownFlip !== false;

    // Get appropriate boundary element for modal context
    const boundary = this._getModalBoundary() || this._config.dropdownBoundary || 'clippingParents';

    // Get reference element for positioning (input wrapper, not the calendar button)
    const referenceElement = this._getPopperReferenceElement();

    // Create new popper instance
    this._popperInstance = createPopper(
      referenceElement,
      this._dropdownElement,
      {
        placement: placement,
        strategy: strategy,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: this._parseOffset(offsetValue),
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: boundary,
              altAxis: preventOverflow,
            },
          },
          {
            name: 'flip',
            options: {
              enabled: flip,
              fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
            },
          },
          {
            name: 'sameWidth',
            enabled: !this._config.dropdownWidth, // Enable when dropdownWidth is null/undefined (matching ktselect)
            phase: 'beforeWrite',
            requires: ['computeStyles'],
            fn: ({ state }) => {
              // Use input wrapper width instead of toggle element width
              const inputWrapper = this._element.querySelector('[data-kt-datepicker-input-wrapper]') as HTMLElement;
              if (inputWrapper) {
                state.styles.popper.width = `${inputWrapper.offsetWidth}px`;
              } else {
                // Fallback to reference width if input wrapper not found
                state.styles.popper.width = `${state.rects.reference.width}px`;
              }
            },
            effect: ({ state }) => {
              // Use input wrapper width instead of toggle element width
              const inputWrapper = this._element.querySelector('[data-kt-datepicker-input-wrapper]') as HTMLElement;
              if (inputWrapper && 'offsetWidth' in inputWrapper) {
                state.elements.popper.style.width = `${inputWrapper.offsetWidth}px`;
              } else {
                // Fallback to reference width if input wrapper not found
                const reference = state.elements.reference as HTMLElement;
                if (reference && 'offsetWidth' in reference) {
                  state.elements.popper.style.width = `${reference.offsetWidth}px`;
                }
              }
            },
          },
        ],
      },
    );
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
   * Update dropdown width (useful after content is rendered)
   */
  public updateWidth(): void {
    this._setDropdownWidth();
    // Also update popper position after width change
    if (this._popperInstance) {
      this._popperInstance.update();
    }
  }

  /**
   * Open the dropdown (legacy method - now handled by observer pattern)
   */
  public open(): void {
    // This method is now deprecated - use unified state manager instead
    if (this._unifiedStateManager) {
      this._unifiedStateManager.setDropdownOpen(true, 'legacy-open-method');
    }
  }

  /**
   * Close the dropdown (legacy method - now handled by observer pattern)
   */
  public close(): void {
    // This method is now deprecated - use unified state manager instead
    if (this._unifiedStateManager) {
      this._unifiedStateManager.setDropdownOpen(false, 'legacy-close-method');
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