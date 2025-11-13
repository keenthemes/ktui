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
import { KTDatepickerConfigInterface } from './types';
import { KTDatepickerStateManager } from './config';
import { KTDatepickerEvents } from './types';

/**
 * Class to manage focus within the dropdown
 */
class FocusManager {
	private _element: HTMLElement;
	private _focusableSelector: string =
		'button:not([disabled]), [tabindex]:not([tabindex="-1"])';

	constructor(element: HTMLElement) {
		this._element = element;
	}

	/**
	 * Get all visible focusable options
	 */
	public getVisibleOptions(): HTMLElement[] {
		return Array.from(
			this._element.querySelectorAll(this._focusableSelector)
		).filter((el) => {
			const element = el as HTMLElement;
			return element.offsetParent !== null; // Only visible elements
		}) as HTMLElement[];
	}

	/**
	 * Apply focus to an element
	 */
	public applyFocus(element: HTMLElement): void {
		if (element && typeof element.focus === 'function') {
			element.focus();
		}
	}

	/**
	 * Focus next element
	 */
	public focusNext(): void {
		const options = this.getVisibleOptions();
		const currentFocused = document.activeElement;

		let nextIndex = 0;
		if (currentFocused) {
			const currentIndex = options.indexOf(currentFocused as HTMLElement);
			nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
		}

		if (options.length > 0) {
			this.applyFocus(options[nextIndex]);
		}
	}

	/**
	 * Focus previous element
	 */
	public focusPrevious(): void {
		const options = this.getVisibleOptions();
		const currentFocused = document.activeElement;

		let prevIndex = options.length - 1;
		if (currentFocused) {
			const currentIndex = options.indexOf(currentFocused as HTMLElement);
			prevIndex =
				currentIndex >= 0
					? (currentIndex - 1 + options.length) % options.length
					: prevIndex;
		}

		if (options.length > 0) {
			this.applyFocus(options[prevIndex]);
		}
	}

	/**
	 * Scroll element into view
	 */
	public scrollIntoView(element: HTMLElement): void {
		if (element && typeof element.scrollIntoView === 'function') {
			element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}

	/**
	 * Clean up resources
	 */
	public dispose(): void {
		// Nothing to clean up yet
	}
}

/**
 * Class to manage event listeners
 */
class EventManager {
	private _listeners: Map<HTMLElement, Map<string, Function[]>> = new Map();

	/**
	 * Add event listener and track it
	 */
	public addListener(
		element: HTMLElement,
		eventType: string,
		handler: Function
	): void {
		if (!this._listeners.has(element)) {
			this._listeners.set(element, new Map());
		}

		const elementListeners = this._listeners.get(element)!;
		if (!elementListeners.has(eventType)) {
			elementListeners.set(eventType, []);
		}

		const handlers = elementListeners.get(eventType)!;
		element.addEventListener(eventType, handler as EventListener);
		handlers.push(handler);
	}

	/**
	 * Remove all listeners for an element
	 */
	public removeAllListeners(element: HTMLElement): void {
		if (this._listeners.has(element)) {
			const elementListeners = this._listeners.get(element)!;

			elementListeners.forEach((handlers, eventType) => {
				handlers.forEach((handler) => {
					element.removeEventListener(eventType, handler as EventListener);
				});
			});

			this._listeners.delete(element);
		}
	}
}

/**
 * Focus trap class to manage keyboard focus within the dropdown
 */
class FocusTrap {
	private _element: HTMLElement;
	private _focusableElements: HTMLElement[] = [];
	private _firstFocusableElement: HTMLElement | null = null;
	private _lastFocusableElement: HTMLElement | null = null;

	/**
	 * Constructor
	 *
	 * @param element - Element to trap focus within
	 */
	constructor(element: HTMLElement) {
		this._element = element;
		this._update();
	}

	/**
	 * Update the focusable elements
	 */
	public update(): void {
		this._update();
	}

	/**
	 * Update the list of focusable elements
	 */
	private _update(): void {
		// Get all focusable elements
		const focusableElements = this._element.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		// Convert to array and filter out disabled elements
		this._focusableElements = Array.from(focusableElements).filter(
			(el) => !el.hasAttribute('disabled')
		) as HTMLElement[];

		// Get first and last focusable elements
		this._firstFocusableElement = this._focusableElements[0] || null;
		this._lastFocusableElement =
			this._focusableElements[this._focusableElements.length - 1] || null;
	}

	/**
	 * Handle tab key press to trap focus
	 *
	 * @param event - Keyboard event
	 */
	public handleTab(event: KeyboardEvent): void {
		// If no focusable elements, do nothing
		if (!this._firstFocusableElement || !this._lastFocusableElement) {
			event.preventDefault();
			return;
		}

		const isTabPressed = event.key === 'Tab' || event.keyCode === 9;

		if (!isTabPressed) return;

		// Handle Shift+Tab to focus last element when on first
		if (event.shiftKey) {
			if (document.activeElement === this._firstFocusableElement) {
				this._lastFocusableElement.focus();
				event.preventDefault();
			}
		} else {
			// Handle Tab to focus first element when on last
			if (document.activeElement === this._lastFocusableElement) {
				this._firstFocusableElement.focus();
				event.preventDefault();
			}
		}
	}

	/**
	 * Focus the first interactive element
	 */
	public focusFirstElement(): void {
		if (this._firstFocusableElement) {
			this._firstFocusableElement.focus();
		}
	}
}

/**
 * KTDatepickerDropdown
 *
 * A specialized dropdown implementation for the KTDatepicker component.
 * This module handles the dropdown functionality for the datepicker component,
 * including positioning, showing/hiding, and keyboard navigation.
 */
export class KTDatepickerDropdown extends KTComponent {
	protected override readonly _name: string = 'datepicker-dropdown';
	protected override readonly _config: KTDatepickerConfigInterface;

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
	private _focusTrap: FocusTrap | null = null;
	private _activeElement: Element | null = null;

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
		config: KTDatepickerConfigInterface
	) {
		super();

		this._element = element;
		this._toggleElement = toggleElement;
		this._dropdownElement = dropdownElement;
		this._config = config;
		this._eventManager = new EventManager();
		this._focusManager = new FocusManager(dropdownElement);

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
			this._handleToggleClick.bind(this)
		);

		// Keyboard navigation
		this._eventManager.addListener(
			this._element,
			'keydown',
			this._handleKeyDown.bind(this)
		);

		// Close on outside click
		this._eventManager.addListener(
			document as unknown as HTMLElement,
			'click',
			this._handleOutsideClick.bind(this)
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
	 * Handle keyboard events
	 */
	private _handleKeyDown(event: KeyboardEvent): void {
		if (!this._isOpen) return;

		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				this.close();
				this._toggleElement.focus();
				break;
			case 'ArrowDown':
				event.preventDefault();
				this._focusManager.focusNext();
				break;
			case 'ArrowUp':
				event.preventDefault();
				this._focusManager.focusPrevious();
				break;
			case 'Home':
				event.preventDefault();
				// Focus first visible option
				const firstOption = this._focusManager.getVisibleOptions()[0];
				if (firstOption) {
					this._focusManager.applyFocus(firstOption);
					this._focusManager.scrollIntoView(firstOption);
				}
				break;
			case 'End':
				event.preventDefault();
				// Focus last visible option
				const visibleOptions = this._focusManager.getVisibleOptions();
				const lastOption = visibleOptions[visibleOptions.length - 1];
				if (lastOption) {
					this._focusManager.applyFocus(lastOption);
					this._focusManager.scrollIntoView(lastOption);
				}
				break;
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
			// Before closing, check if a range selection is in progress
			const datepickerElement = this._element.closest('[data-kt-datepicker]');
			if (datepickerElement) {
				// Get the state manager through the calendar instance or directly
				const stateManager = (datepickerElement as any).instance?._state;

				if (stateManager) {
					const state = stateManager.getState();
					const config = stateManager.getConfig();

					// If we're in range mode and range selection is in progress, don't close
					if (config.range && state.isRangeSelectionInProgress) {
						console.log(
							'Outside click detected but range selection in progress - keeping dropdown open'
						);
						return;
					}
				}
			}

			this.close();
		}
	}

	/**
	 * Set width of dropdown based on toggle element
	 */
	private _setDropdownWidth(): void {
		if (!this._dropdownElement || !this._toggleElement) return;

		// Get the datepicker configuration
		const datepickerElement = this._element.closest('[data-kt-datepicker]');
		let visibleMonths = 1;

		if (datepickerElement) {
			// Get visible months from config
			const instance = (datepickerElement as any).instance;
			if (instance && instance._config) {
				visibleMonths = instance._config.visibleMonths || 1;
			}
		}

		// Calculate appropriate width based on number of visible months
		if (visibleMonths > 1) {
			// For multiple months, calculate a fixed width per month plus padding and gaps
			const monthWidth = 280; // Fixed width for each month
			const padding = 24; // Left/right padding (p-3 = 0.75rem × 2 × 16px = 24px)
			const spacing = 16 * (visibleMonths - 1); // Gap between months (gap-4 = 1rem × 16px)

			// Limit to showing max 3 months at once for UX (user can scroll to see more)
			const visibleWidth = Math.min(visibleMonths, 3);

			const totalWidth = monthWidth * visibleWidth + spacing + padding;

			// Set fixed width for the dropdown
			this._dropdownElement.style.width = `${totalWidth}px`;
			this._dropdownElement.style.minWidth = `${totalWidth}px`;
		} else {
			// For single month, use a fixed width that works well for most calendars
			this._dropdownElement.style.width = '332px'; // 280px calendar width + 24px padding + border
			this._dropdownElement.style.minWidth = '332px';
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
		const placement = 'bottom-start';
		const strategy = 'absolute';
		const preventOverflow = true;
		const flip = true;

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
				],
			}
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
		// Look for the display element rather than using the input directly
		const displayElement = this._element.querySelector(
			'[data-kt-datepicker-display]'
		) as HTMLElement;
		const triggerElement = displayElement || this._toggleElement;

		if (!triggerElement || !this._dropdownElement) return;

		// Reset position styles
		this._dropdownElement.style.top = '';
		this._dropdownElement.style.bottom = '';
		this._dropdownElement.style.left = '';
		this._dropdownElement.style.right = '';

		// Set width before positioning
		this._setDropdownWidth();

		// Get position information
		const triggerRect = triggerElement.getBoundingClientRect();
		const containerRect = this._element.getBoundingClientRect();
		const dropdownRect = this._dropdownElement.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;

		// Calculate available space below and above the trigger
		const spaceBelow = viewportHeight - triggerRect.bottom;
		const spaceAbove = triggerRect.top;

		// Calculate if dropdown would overflow horizontally
		const overflowRight = triggerRect.left + dropdownRect.width > viewportWidth;

		// Position dropdown
		this._dropdownElement.style.position = 'absolute';

		// Determine vertical position
		if (spaceBelow >= dropdownRect.height || spaceBelow >= spaceAbove) {
			// Position below the trigger
			this._dropdownElement.style.top = `${triggerRect.height + 5}px`;
		} else {
			// Position above the trigger
			this._dropdownElement.style.bottom = `${triggerRect.height + 5}px`;
		}

		// Determine horizontal position - handle potential overflow
		if (overflowRight) {
			// Align with right edge of trigger to prevent overflow
			const rightOffset = Math.max(0, dropdownRect.width - triggerRect.width);
			this._dropdownElement.style.right = `0px`;
		} else {
			// Align with left edge of trigger
			this._dropdownElement.style.left = `0px`;
		}
	}

	/**
	 * Toggle the dropdown
	 */
	public toggle(): void {
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
		if (this._isOpen || this._isTransitioning) return;

		// Fire before show event
		const beforeShowEvent = new CustomEvent('kt.datepicker.dropdown.show', {
			bubbles: true,
			cancelable: true,
		});
		this._element.dispatchEvent(beforeShowEvent);

		if (beforeShowEvent.defaultPrevented) return;

		// Begin opening transition
		this._isTransitioning = true;

		// Set dropdown visibility
		this._dropdownElement.classList.remove('hidden');
		this._dropdownElement.setAttribute('aria-hidden', 'false');

		// Set dropdown width
		this._setDropdownWidth();

		// Make sure the element is visible for transitioning
		KTDom.reflow(this._dropdownElement);

		// Apply z-index
		this._dropdownElement.style.zIndex = '1000';

		// Initialize popper for positioning
		this._initPopper();

		// Add active classes
		this._toggleElement.classList.add('ring', 'ring-blue-300');
		this._toggleElement.setAttribute('aria-expanded', 'true');

		// Start transition
		this._dropdownElement.classList.remove('opacity-0', 'translate-y-2');
		this._dropdownElement.classList.add('opacity-100', 'translate-y-0');

		// Handle transition end
		KTDom.transitionEnd(this._dropdownElement, () => {
			this._isTransitioning = false;
			this._isOpen = true;

			// Focus the first interactive element
			this._focusFirstInteractiveElement();

			// Fire after show event
			const afterShowEvent = new CustomEvent('kt.datepicker.dropdown.shown', {
				bubbles: true,
			});
			this._element.dispatchEvent(afterShowEvent);
		});
	}

	/**
	 * Focus the first interactive element in the dropdown
	 */
	private _focusFirstInteractiveElement(): void {
		// Priority of elements to focus:
		// 1. A "Today" button if available
		// 2. The first day in the current month
		// 3. Any other focusable element

		// Find the Today button using standard DOM selectors
		let todayBtn: HTMLElement | null = null;
		const buttons = this._dropdownElement.querySelectorAll('button');
		for (let i = 0; i < buttons.length; i++) {
			if (buttons[i].textContent && buttons[i].textContent.trim() === 'Today') {
				todayBtn = buttons[i] as HTMLElement;
				break;
			}
		}

		if (todayBtn) {
			todayBtn.focus();
			return;
		}

		const currentMonthDay = this._dropdownElement.querySelector(
			'button[data-date]:not(.text-gray-400)'
		) as HTMLElement;
		if (currentMonthDay) {
			currentMonthDay.focus();
			return;
		}

		const firstOption = this._focusManager.getVisibleOptions()[0];
		if (firstOption) {
			this._focusManager.applyFocus(firstOption);
		}
	}

	/**
	 * Close the dropdown
	 */
	public close(): void {
		if (!this._isOpen || this._isTransitioning) return;

		// Fire before hide event
		const beforeHideEvent = new CustomEvent('kt.datepicker.dropdown.hide', {
			bubbles: true,
			cancelable: true,
		});
		this._element.dispatchEvent(beforeHideEvent);

		if (beforeHideEvent.defaultPrevented) return;

		// Begin closing transition
		this._isTransitioning = true;

		// Start transition
		this._dropdownElement.classList.add('opacity-0', 'translate-y-2');
		this._dropdownElement.classList.remove('opacity-100', 'translate-y-0');

		// Handle transition end
		KTDom.transitionEnd(this._dropdownElement, () => {
			// Remove active classes
			this._dropdownElement.classList.add('hidden');
			this._dropdownElement.setAttribute('aria-hidden', 'true');

			// Reset styles
			this._dropdownElement.style.opacity = '';
			this._dropdownElement.style.transform = '';
			this._dropdownElement.style.zIndex = '';

			// Destroy popper
			this._destroyPopper();

			// Update state
			this._isTransitioning = false;
			this._isOpen = false;

			// Fire after hide event
			const afterHideEvent = new CustomEvent('kt.datepicker.dropdown.hidden', {
				bubbles: true,
			});
			this._element.dispatchEvent(afterHideEvent);
		});
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
