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
	) {
		super();

		this._element = element;
		this._toggleElement = toggleElement;
		this._dropdownElement = dropdownElement;
		this._config = config;
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

		this.toggle();
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
	 * Initialize the Popper instance for dropdown positioning
	 */
	private _initPopper(): void {
		// Destroy existing popper instance if it exists
		this._destroyPopper();

		// Default offset
		const offsetValue = '0, 5';

		// Get configuration options
		const placement = this._config.dropdownPlacement || 'bottom-start';
		const strategy = this._config.dropdownStrategy || 'fixed';
		const preventOverflow = this._config.dropdownPreventOverflow !== false;
		const flip = this._config.dropdownFlip !== false;

		// Create new popper instance
		this._popperInstance = createPopper(
			this._toggleElement,
			this._dropdownElement,
			{
				placement: placement as Placement,
				strategy: strategy as 'fixed' | 'absolute',
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
							boundary: 'viewport',
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
	 * Toggle the dropdown
	 */
	public toggle(): void {
		if (this._config.disabled) {
			if (this._config.debug) console.log('KTSelectDropdown.toggle: select is disabled, not toggling');
			return;
		}
		if (this._config.debug)
			console.log('KTSelectDropdown.toggle called - isOpen:', this._isOpen);

		if (this._isTransitioning) {
			if (this._config.debug)
				console.log('KTSelectDropdown.toggle - ignoring during transition');
			return;
		}

		if (this._isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * Open the dropdown
	 */
	public open(): void {
		if (this._config.disabled) {
			if (this._config.debug) console.log('KTSelectDropdown.open: select is disabled, not opening');
			return;
		}
		if (this._isOpen || this._isTransitioning) return;

		// Fire before show event
		const beforeShowEvent = new CustomEvent('kt.select.dropdown.show', {
			bubbles: true,
			cancelable: true,
		});
		this._element.dispatchEvent(beforeShowEvent);

		if (beforeShowEvent.defaultPrevented) return;

		// Begin opening transition
		this._isTransitioning = true;

		// Set initial styles - remove display: block and use class toggling instead
		this._dropdownElement.classList.remove('hidden');
		this._dropdownElement.style.opacity = '0';

		// Set dropdown width
		this._setDropdownWidth();

		// Make sure the element is visible for transitioning
		KTDom.reflow(this._dropdownElement);

		// Apply z-index if configured
		if (this._config.dropdownZindex) {
			this._dropdownElement.style.zIndex =
				this._config.dropdownZindex.toString();
		} else {
			// Auto-calculate z-index
			const parentZindex = KTDom.getHighestZindex(this._element);
			if (parentZindex) {
				this._dropdownElement.style.zIndex = (parentZindex + 1).toString();
			}
		}

		// Initialize popper for positioning
		this._initPopper();

		// Add active classes
		this._dropdownElement.classList.add('open');
		this._toggleElement.classList.add('active');
		this._toggleElement.setAttribute('aria-expanded', 'true');

		// Start transition
		this._dropdownElement.style.opacity = '1';

		// Handle transition end
		KTDom.transitionEnd(this._dropdownElement, () => {
			this._isTransitioning = false;
			this._isOpen = true;

			// Focus the first item if search is enabled
			if (this._config.enableSearch) {
				const searchInput = this._dropdownElement.querySelector(
					'input[type="search"]',
				);
				if (searchInput) {
					(searchInput as HTMLInputElement).focus();
				}
			}

			// Fire after show event
			const afterShowEvent = new CustomEvent('kt.select.dropdown.shown', {
				bubbles: true,
			});
			this._element.dispatchEvent(afterShowEvent);
		});
	}

	/**
	 * Focus the first option in the dropdown
	 */
	private _focusFirstOption(): void {
		const firstOption = this._focusManager.getVisibleOptions()[0];
		if (firstOption) {
			this._focusManager.applyFocus(firstOption);
			this._focusManager.scrollIntoView(firstOption);
		}
	}

	/**
	 * Close the dropdown
	 */
	public close(): void {
		if (this._config.debug)
			console.log(
				'KTSelectDropdown.close called - isOpen:',
				this._isOpen,
				'isTransitioning:',
				this._isTransitioning,
			);

		if (!this._isOpen || this._isTransitioning) {
			if (this._config.debug)
				console.log(
					'KTSelectDropdown.close - early return: dropdown not open or is transitioning',
				);
			return;
		}

		// Fire before hide event
		const beforeHideEvent = new CustomEvent('kt.select.dropdown.hide', {
			bubbles: true,
			cancelable: true,
		});
		this._element.dispatchEvent(beforeHideEvent);

		if (beforeHideEvent.defaultPrevented) {
			if (this._config.debug)
				console.log(
					'KTSelectDropdown.close - canceling due to defaultPrevented on beforeHideEvent',
				);
			return;
		}

		if (this._config.debug)
			console.log('KTSelectDropdown.close - starting transition');
		// Begin closing transition
		this._isTransitioning = true;

		// Start transition
		this._dropdownElement.style.opacity = '0';

		// Use a combination of transition end and a fallback timer
		let transitionComplete = false;

		// Set a fixed-duration fallback in case the transition event doesn't fire
		const fallbackTimer = setTimeout(() => {
			if (!transitionComplete) {
				if (this._config.debug)
					console.log('KTSelectDropdown.close - fallback timer triggered');
				completeTransition();
			}
		}, 300); // 300ms should be enough for most transitions

		// Setup the transition end function
		const completeTransition = () => {
			if (transitionComplete) return;
			transitionComplete = true;
			clearTimeout(fallbackTimer);

			if (this._config.debug)
				console.log('KTSelectDropdown.close - transition ended');
			// Remove active classes
			this._dropdownElement.classList.add('hidden');
			this._dropdownElement.classList.remove('open');
			this._toggleElement.classList.remove('active');
			this._toggleElement.setAttribute('aria-expanded', 'false');

			// Reset styles - replace display: none with adding hidden class
			this._dropdownElement.classList.add('hidden');
			this._dropdownElement.style.opacity = '';
			this._dropdownElement.style.zIndex = '';

			// Destroy popper
			this._destroyPopper();

			// Update state
			this._isTransitioning = false;
			this._isOpen = false;

			// Fire after hide event
			const afterHideEvent = new CustomEvent('kt.select.dropdown.hidden', {
				bubbles: true,
			});
			this._element.dispatchEvent(afterHideEvent);
			if (this._config.debug)
				console.log('KTSelectDropdown.close - complete, events fired');
		};

		// Handle transition end via the utility but also have the fallback
		KTDom.transitionEnd(this._dropdownElement, completeTransition);
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
}
