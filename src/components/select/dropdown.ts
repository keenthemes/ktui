/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	Instance as PopperInstance,
	createPopper,
	Placement,
} from '@popperjs/core';
import KTDom from '../../helpers/dom';
import KTData from '../../helpers/data';
import KTComponent from '../component';
import { KTSelectConfigInterface } from './config';
import { FocusManager, EventManager } from './utils';
import { KTSelect } from './select'; // Added import

/**
 * KTSelectDropdown
 *
 * A specialized dropdown implementation for the KTSelect component.
 * This module handles the dropdown functionality for the select component,
 * including positioning and showing/hiding.
 */
export class KTSelectDropdown extends KTComponent {
	protected override readonly _name: string = 'select-dropdown';
	protected override readonly _config: KTSelectConfigInterface;

	// DOM Elements
	protected _element: HTMLElement;
	private _toggleElement: HTMLElement;
	private _dropdownElement: HTMLElement;

	// State
	private _isOpen: boolean = false;
	private _isTransitioning: boolean = false;
	private _popperInstance: PopperInstance | null = null;
	private _eventManager: EventManager;
	private _focusManager: FocusManager;
	private _ktSelectInstance: KTSelect; // Added instance variable

	/**
	 * Constructor
	 * @param element The parent element (select wrapper)
	 * @param toggleElement The element that triggers the dropdown
	 * @param dropdownElement The dropdown content element
	 * @param config The configuration options
	 */
	constructor(
		element: HTMLElement,
		toggleElement: HTMLElement,
		dropdownElement: HTMLElement,
		config: KTSelectConfigInterface,
		ktSelectInstance: KTSelect, // Added parameter
	) {
		super();

		this._element = element;
		this._toggleElement = toggleElement;
		this._dropdownElement = dropdownElement;
		this._config = config;
		this._ktSelectInstance = ktSelectInstance; // Assign instance

		// For centered modals, don't move dropdown to container to preserve positioning context
		// For other cases, move to container if specified
		const modalParent = this._getModalContainer();
		const isCenteredModal =
			modalParent && modalParent.classList.contains('kt-modal-center');

		// Only move dropdown if not in centered modal (regardless of strategy override)
		// This prevents the positioning bug even if user sets dropdownStrategy: 'fixed'
		const container = this._resolveDropdownContainer();
		if (container && !isCenteredModal) {
			if (container !== this._dropdownElement.parentElement) {
				container.appendChild(this._dropdownElement);
			}
		}

		this._eventManager = new EventManager();
		this._focusManager = new FocusManager(
			dropdownElement,
			'[data-kt-select-option]',
			config,
		);

		this._setupEventListeners();
	}

	/**
	 * Set up event listeners for the dropdown
	 */
	private _setupEventListeners(): void {
		// Toggle click
		this._eventManager.addListener(
			this._toggleElement,
			'click',
			this._handleToggleClick.bind(this),
		);

		// Close on outside click
		this._eventManager.addListener(
			document as unknown as HTMLElement,
			'click',
			this._handleOutsideClick.bind(this),
		);
	}

	/**
	 * Handle toggle element click
	 */
	private _handleToggleClick(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		if (this._config.disabled) {
			return;
		}

		// Call KTSelect's methods
		if (this._ktSelectInstance.isDropdownOpen()) {
			this._ktSelectInstance.closeDropdown();
		} else {
			this._ktSelectInstance.openDropdown();
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
			// Call KTSelect's closeDropdown method
			this._ktSelectInstance.closeDropdown();
		}
	}

	/**
	 * Set width of dropdown based on toggle element
	 */
	private _setDropdownWidth(): void {
		if (!this._dropdownElement || !this._toggleElement) return;

		// Check if width is configured
		if (this._config.dropdownWidth) {
			// If custom width is set, use that
			this._dropdownElement.style.width = this._config.dropdownWidth;
		} else {
			// Otherwise, match toggle element width for a cleaner appearance
			const toggleWidth = this._toggleElement.offsetWidth;
			this._dropdownElement.style.width = `${toggleWidth}px`;
		}
	}

	/**
	 * Detect if the select is inside a modal container
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
	 * Initialize the Popper instance for dropdown positioning
	 */
	private _initPopper(): void {
		// Destroy existing popper instance if it exists
		this._destroyPopper();

		// Default offset
		const offsetValue = '0, 5';

		// Get configuration options
		const placement = this._config.dropdownPlacement || 'bottom-start';
		const strategy = this._getPositioningStrategy();
		const preventOverflow = this._config.dropdownPreventOverflow !== false;
		const flip = this._config.dropdownFlip !== false;

		// Get appropriate boundary element for modal context
		const boundary = this._getModalBoundary() || 'clippingParents';

		// Create new popper instance
		this._popperInstance = createPopper(
			this._toggleElement,
			this._dropdownElement,
			{
				placement: placement as Placement,
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
						enabled: !this._config.dropdownWidth,
						phase: 'beforeWrite',
						requires: ['computeStyles'],
						fn: ({ state }) => {
							state.styles.popper.width = `${state.rects.reference.width}px`;
						},
						effect: ({ state }) => {
							// Add type guard for HTMLElement
							const reference = state.elements.reference as HTMLElement;
							if (reference && 'offsetWidth' in reference) {
								state.elements.popper.style.width = `${reference.offsetWidth}px`;
							}
						},
					},
				],
			},
		);
	}

	/**
	 * Parse offset string into an array of numbers
	 */
	private _parseOffset(offset: string): number[] {
		return offset.split(',').map((value) => parseInt(value.trim(), 10));
	}

	/**
	 * Destroy the Popper instance
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
		const currentDropdownZIndexStr = KTDom.getCssProp(
			this._dropdownElement,
			'z-index',
		);
		if (currentDropdownZIndexStr && currentDropdownZIndexStr !== 'auto') {
			const currentDropdownZIndex = parseInt(currentDropdownZIndexStr);
			if (
				!isNaN(currentDropdownZIndex) &&
				currentDropdownZIndex > (zIndexToApply || 0)
			) {
				zIndexToApply = currentDropdownZIndex;
			}
		}

		// Ensure dropdown is above elements within its original toggle's parent context
		const toggleParentContextZindex = KTDom.getHighestZindex(this._element); // _element is the select wrapper
		if (
			toggleParentContextZindex !== null &&
			toggleParentContextZindex >= (zIndexToApply || 0)
		) {
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
		// ARIA attributes will be handled by KTSelect

		// Start transition
		this._dropdownElement.style.opacity = '1';

		// Handle transition end
		KTDom.transitionEnd(this._dropdownElement, () => {
			this._isTransitioning = false;
			this._isOpen = true;
			// Focus and events will be handled by KTSelect
		});
	}

	/**
	 * Close the dropdown
	 */
	public close(): void {
		if (!this._isOpen || this._isTransitioning) {
			return;
		}

		// Events and ARIA will be handled by KTSelect

		this._isTransitioning = true;

		this._dropdownElement.style.opacity = '0';

		let transitionComplete = false;
		const fallbackTimer = setTimeout(() => {
			if (!transitionComplete) {
				completeTransition();
			}
		}, 300);

		const completeTransition = () => {
			if (transitionComplete) return;
			transitionComplete = true;
			clearTimeout(fallbackTimer);


			this._dropdownElement.classList.add('hidden');
			this._dropdownElement.classList.remove('open');
			this._toggleElement.classList.remove('active');
			// ARIA attributes will be handled by KTSelect

			this._destroyPopper();

			this._isTransitioning = false;
			this._isOpen = false;

			// Events will be handled by KTSelect

		};

		KTDom.transitionEnd(this._dropdownElement, completeTransition);

		if (
			KTDom.getCssProp(this._dropdownElement, 'transition-duration') === '0s'
		) {
			completeTransition();
		}
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
		// Destroy popper
		this._destroyPopper();

		// Remove event listeners
		this._eventManager.removeAllListeners(this._element);
		this._eventManager.removeAllListeners(this._toggleElement);
		this._eventManager.removeAllListeners(document as unknown as HTMLElement);

		// Clean up focus manager
		if (
			this._focusManager &&
			typeof this._focusManager.dispose === 'function'
		) {
			this._focusManager.dispose();
		}

		// Clean up state
		this._isOpen = false;
		this._isTransitioning = false;

		// Remove data reference
		KTData.remove(this._element, this._name);
	}

	private _resolveDropdownContainer(): HTMLElement | null {
		const containerSelector = this._config.dropdownContainer;
		if (containerSelector) {
			const containerElement = document.querySelector(
				containerSelector,
			) as HTMLElement | null;
			if (!containerElement && this._config.debug) {
				console.warn(
					`KTSelectDropdown: dropdownContainer selector "${containerSelector}" not found. Dropdown will remain in its default position.`,
				);
			}
			return containerElement;
		}
		return null;
	}
}
