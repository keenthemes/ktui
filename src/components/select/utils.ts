/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// utils.ts

import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import { KTSelectConfigInterface } from './config';

/**
 * Format a number as a currency string
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);
}

/**
 * Filter options based on a search query
 */
export function filterOptions(
	options: HTMLElement[],
	query: string,
	config: KTSelectConfigInterface,
	dropdownElement: HTMLElement,
	onVisibleCount?: (count: number) => void,
): number {
	let visibleOptionsCount = 0;

	// Clear existing "no results" messages
	const noResultsElement = dropdownElement.querySelector(
		'[data-kt-select-no-results]',
	);
	if (noResultsElement) {
		noResultsElement.remove();
	}

	// For empty query, ensure highlights are cleared from all options
	if (!query || query.trim() === '') {
		// Just make all options visible without highlighting
		for (const option of options) {
			// Make option visible by removing hidden classes and inline styles
			option.classList.remove('hidden');

			// Clean up any inline display styles from legacy code
			if (
				option.hasAttribute('style') &&
				option.getAttribute('style').includes('display:')
			) {
				const styleAttr = option.getAttribute('style');
				if (
					styleAttr.trim() === 'display: none;' ||
					styleAttr.trim() === 'display: block;'
				) {
					option.removeAttribute('style');
				} else {
					option.setAttribute(
						'style',
						styleAttr.replace(/display:\s*[^;]+;?/gi, '').trim(),
					);
				}
			}

			// Clear highlights by restoring original text content
			if (option.dataset && option.dataset.originalText) {
				option.innerHTML = option.dataset.originalText;
			} else {
				option.innerHTML = option.textContent || '';
			}
			// Remove the cache if present
			if (option.dataset && option.dataset.originalText) {
				delete option.dataset.originalText;
			}

			visibleOptionsCount++;
		}

		// Call the callback with the visible count if provided
		if (onVisibleCount) {
			onVisibleCount(visibleOptionsCount);
		}

		return visibleOptionsCount;
	}

	// Filter options based on query
	for (const option of options) {
		const optionText = option.textContent?.toLowerCase() || '';
		const isMatch = optionText.includes(query.toLowerCase());

		// Check if option is disabled
		const isDisabled = option.classList.contains('disabled') || option.getAttribute('aria-disabled') === 'true';

		if (isMatch || query.trim() === '') {
			// Show option by removing the hidden class and any display inline styles
			option.classList.remove('hidden');

			// Remove any inline display styles that might be present
			if (
				option.hasAttribute('style') &&
				option.getAttribute('style').includes('display:')
			) {
				const styleAttr = option.getAttribute('style');
				if (
					styleAttr.trim() === 'display: none;' ||
					styleAttr.trim() === 'display: block;'
				) {
					option.removeAttribute('style');
				} else {
					option.setAttribute(
						'style',
						styleAttr.replace(/display:\s*[^;]+;?/gi, '').trim(),
					);
				}
			}

			visibleOptionsCount++;

			if (config.searchHighlight && query.trim() !== '') {
				if (option.dataset && !option.dataset.originalText) {
					option.dataset.originalText = option.innerHTML;
				}
				highlightTextInElementDebounced(option, query, config);
			}

		} else {
			// Hide option using hidden class
			option.classList.add('hidden');

			// Remove any inline display styles
			if (
				option.hasAttribute('style') &&
				option.getAttribute('style').includes('display:')
			) {
				const styleAttr = option.getAttribute('style');
				if (
					styleAttr.trim() === 'display: none;' ||
					styleAttr.trim() === 'display: block;'
				) {
					option.removeAttribute('style');
				} else {
					option.setAttribute(
						'style',
						styleAttr.replace(/display:\s*[^;]+;?/gi, '').trim(),
					);
				}
			}
		}

		// Early exit if maxItems limit is reached
		if (config.searchMaxItems && visibleOptionsCount >= config.searchMaxItems) {
			break;
		}
	}

	// Call the callback with the visible count if provided
	if (onVisibleCount) {
		onVisibleCount(visibleOptionsCount);
	}

	return visibleOptionsCount;
}

/**
 * Highlight text only within a specific element, preserving other elements
 */
export function highlightTextInElement(
	element: HTMLElement,
	query: string,
	config: KTSelectConfigInterface,
): void {
	if (!element || !query || query.trim() === '') return;

	const queryLower = query.toLowerCase();
	const text = element.textContent || '';
	if (!text) return;

	// Escape regex special characters in query
	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(escapedQuery, 'gi');

	// Replace all matches with the highlight template
	let lastIndex = 0;
	let result = '';
	let match: RegExpExecArray | null;
	let matches = [];
	while ((match = regex.exec(text)) !== null) {
		matches.push({ start: match.index, end: regex.lastIndex });
	}

	if (matches.length === 0) {
		element.innerHTML = text;
		return;
	}

	for (let i = 0; i < matches.length; i++) {
		const { start, end } = matches[i];
		// Add text before match
		result += text.slice(lastIndex, start);
		// Add highlighted match using template
		const highlighted = defaultTemplates.highlight(config, text.slice(start, end)).outerHTML;
		result += highlighted;
		lastIndex = end;
	}
	// Add remaining text
	result += text.slice(lastIndex);

	element.innerHTML = result;
}

// Debounced version for performance
export const highlightTextInElementDebounced = debounce(highlightTextInElement, 100);

/**
 * Focus manager for keyboard navigation
 * Consolidates redundant focus management logic into shared functions
 */
export class FocusManager {
	private _element: HTMLElement;
	private _optionsSelector: string;
	private _focusedOptionIndex: number | null = null;
	private _focusClass: string;
	private _hoverClass: string;
	private _eventManager: EventManager;

	constructor(
		element: HTMLElement,
		optionsSelector: string = '[data-kt-select-option]',
		config?: KTSelectConfigInterface,
	) {
		this._element = element;
		this._optionsSelector = optionsSelector;
		this._eventManager = new EventManager();

		// Add click handler to update focus state when options are clicked
		this._setupOptionClickHandlers();
	}

	/**
	 * Set up click handlers for all options to update focus state
	 */
	private _setupOptionClickHandlers(): void {
		// Add click handler to the options container
		this._eventManager.addListener(this._element, 'click', (e: Event) => {
			const target = e.target as HTMLElement;
			const optionElement = target.closest(this._optionsSelector);

			if (optionElement) {
			}
		});
	}

	/**
	 * Get all visible options
	 */
	public getVisibleOptions(): HTMLElement[] {
		return Array.from(
			this._element.querySelectorAll(this._optionsSelector),
		).filter((option) => {
			const element = option as HTMLElement;
			// Check only for hidden class
			if (element.classList.contains('hidden')) {
				return false;
			}
			// Also check inline styles for backward compatibility
			if (element.style.display === 'none') {
				return false;
			}
			return true;
		}) as HTMLElement[];
	}

	/**
	 * Focus the next visible option
	 */
	public focusNext(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;

		this.resetFocus();

		if (this._focusedOptionIndex === null) {
			this._focusedOptionIndex = 0;
		} else {
			this._focusedOptionIndex =
				(this._focusedOptionIndex + 1) % options.length;
		}

		const option = options[this._focusedOptionIndex];
		this.applyFocus(option);
		this.scrollIntoView(option);

		return option;
	}

	/**
	 * Focus the previous visible option
	 */
	public focusPrevious(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;

		// If any option is hovered, start from there
		const hoveredIndex = options.findIndex(option => option.classList.contains(this._hoverClass));
		if (hoveredIndex !== -1) {
			this._focusedOptionIndex = hoveredIndex;
		}

		this.resetFocus();

		if (this._focusedOptionIndex === null) {
			this._focusedOptionIndex = options.length - 1;
		} else {
			this._focusedOptionIndex =
				(this._focusedOptionIndex - 1 + options.length) % options.length;
		}

		const option = options[this._focusedOptionIndex];
		this.applyFocus(option);
		this.scrollIntoView(option);

		return option;
	}

	/**
	 * Apply focus to a specific option
	 */
	public applyFocus(option: HTMLElement): void {
		if (!option) return;

		// Prevent focusing disabled options
		if (option.classList.contains('disabled') || option.getAttribute('aria-disabled') === 'true') {
			return;
		}

		// Remove focus from all options first
		this.resetFocus();

		// Add focus to this option
		option.classList.add(this._focusClass);
		option.classList.add(this._hoverClass);
	}

	/**
	 * Reset focus on all options
	 */
	public resetFocus(): void {
		// Find all elements with the focus classes
		const focusedElements = this._element.querySelectorAll(
			`.${this._focusClass}, .${this._hoverClass}`,
		);

		// Remove classes from all elements
		focusedElements.forEach((element) => {
		});

		// Reset index if visible options have changed
		const visibleOptions = this.getVisibleOptions();
		if (
			this._focusedOptionIndex !== null &&
			this._focusedOptionIndex >= visibleOptions.length
		) {
			this._focusedOptionIndex = null;
		}
	}

	/**
	 * Ensure the focused option is visible in the scrollable container
	 */
	public scrollIntoView(option: HTMLElement): void {
		if (!option) return;

		const container = this._element.querySelector(
			'[data-kt-select-options-container]',
		);
		if (!container) return;

		const optionRect = option.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Check if option is below the visible area
		if (optionRect.bottom > containerRect.bottom) {
			option.scrollIntoView({ block: 'end', behavior: 'smooth' });
		}
		// Check if option is above the visible area
		else if (optionRect.top < containerRect.top) {
			option.scrollIntoView({ block: 'start', behavior: 'smooth' });
		}
	}

	/**
	 * Focus a specific option by its value
	 */
	public focusOptionByValue(value: string): boolean {
		const options = this.getVisibleOptions();
		const index = options.findIndex((option) => option.dataset.value === value);

		if (index >= 0) {
			this._focusedOptionIndex = index;
			this.applyFocus(options[index]);
			this.scrollIntoView(options[index]);
			return true;
		}

		return false;
	}

	/**
	 * Get the currently focused option
	 */
	public getFocusedOption(): HTMLElement | null {
		const options = this.getVisibleOptions();

		if (
			this._focusedOptionIndex !== null &&
			this._focusedOptionIndex < options.length
		) {
			return options[this._focusedOptionIndex];
		}

		return null;
	}

	/**
	 * Get the index of the currently focused option
	 */
	public getFocusedIndex(): number | null {
		return this._focusedOptionIndex;
	}

	/**
	 * Set the focused option index directly
	 */
	public setFocusedIndex(index: number | null): void {
		this._focusedOptionIndex = index;
	}

	/**
	 * Clean up event listeners
	 */
	public dispose(): void {
		if (this._eventManager) {
			this._eventManager.removeAllListeners(this._element);
		}
	}
}

/**
 * Shared keyboard navigation handler for dropdown options
 * Can be used by both combobox and search modules
 */
export function handleDropdownKeyNavigation(
	event: KeyboardEvent,
	select: KTSelect,
	config: {
		multiple?: boolean;
		closeOnSelect?: boolean;
	},
	callbacks?: {
		onArrowUp?: () => void;
		onArrowDown?: () => void;
		onEnter?: () => void;
		onClose?: () => void;
	},
): void {
	try {
		// Get the dropdown state
		const isDropdownOpen = (select as any)._dropdownIsOpen;

		// Log the event to help debug
		const origin = 'handleDropdownKeyNavigation';
		if (select.getConfig && select.getConfig().debug)
			console.log(
				`[${origin}] Key: ${event.key}, Dropdown open: ${isDropdownOpen}`,
			);

		// Handle basic keyboard navigation
		switch (event.key) {
			case 'ArrowDown':
				if (!isDropdownOpen) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Opening dropdown on ArrowDown`);
					select.openDropdown();

					// Focus the first option after opening
					setTimeout(() => {
						(select as any)._focusNextOption();
					}, 50);
				} else if (callbacks?.onArrowDown) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Using custom onArrowDown callback`);
					callbacks.onArrowDown();
				} else {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Using default _focusNextOption`);
					const focusedOption = (select as any)._focusNextOption();

					// Ensure we have a focused option
					if (focusedOption) {
						if (select.getConfig && select.getConfig().debug)
							console.log(`[${origin}] Focused next option:`, focusedOption);
					}
				}
				event.preventDefault();
				break;

			case 'ArrowUp':
				if (!isDropdownOpen) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Opening dropdown on ArrowUp`);
					select.openDropdown();

					// Focus the last option after opening
					setTimeout(() => {
						(select as any)._focusPreviousOption();
					}, 50);
				} else if (callbacks?.onArrowUp) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Using custom onArrowUp callback`);
					callbacks.onArrowUp();
				} else {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Using default _focusPreviousOption`);
					const focusedOption = (select as any)._focusPreviousOption();

					// Ensure we have a focused option
					if (focusedOption) {
						if (select.getConfig && select.getConfig().debug)
							console.log(
								`[${origin}] Focused previous option:`,
								focusedOption,
							);
					}
				}
				event.preventDefault();
				break;

			case 'Enter':
				// Prevent form submission
				event.preventDefault();

				if (isDropdownOpen) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Enter pressed with dropdown open`);

					if (callbacks?.onEnter) {
						if (select.getConfig && select.getConfig().debug)
							console.log(`[${origin}] Using custom onEnter callback`);
						callbacks.onEnter();
					} else {
						if (select.getConfig && select.getConfig().debug)
							console.log(`[${origin}] Using default selectFocusedOption`);
						// Make sure there is a focused option before trying to select it
						if (
							(select as any)._focusManager &&
							(select as any)._focusManager.getFocusedOption()
						) {
							select.selectFocusedOption();
						} else {
							// If no option is focused, try to focus the first one
							const focusedOption = (select as any)._focusNextOption();
							// Only select if an option was successfully focused
							if (focusedOption) {
								select.selectFocusedOption();
							}
						}
					}

					// Close dropdown after selection if not multiple and closeOnSelect is true
					if (!config.multiple && config.closeOnSelect !== false) {
						if (select.getConfig && select.getConfig().debug)
							console.log(`[${origin}] Closing dropdown after selection`);
						select.closeDropdown();
					}
				} else {
					// If dropdown is closed, open it on Enter
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Opening dropdown on Enter`);
					select.openDropdown();

					// Focus the first option after opening
					setTimeout(() => {
						(select as any)._focusNextOption();
					}, 50);
				}
				break;

			case 'Tab':
				// Only handle tab if dropdown is open
				if (isDropdownOpen) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Closing dropdown on Tab`);
					select.closeDropdown();
					if (callbacks?.onClose) {
						callbacks.onClose();
					}
					// Don't prevent default tab behavior - let it move focus naturally
				}
				break;

			case 'Escape':
				// Only handle escape if dropdown is open
				if (isDropdownOpen) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Closing dropdown on Escape`);
					select.closeDropdown();
					if (callbacks?.onClose) {
						callbacks.onClose();
					}
					event.preventDefault(); // Prevent other escape handlers
				}
				break;

			case ' ': // Space key
				// If dropdown is closed, space should open it (but not if in combobox mode)
				if (!isDropdownOpen && !(select.getConfig().combobox)) {
					if (select.getConfig && select.getConfig().debug)
						console.log(`[${origin}] Opening dropdown on Space`);
					select.openDropdown();

					// Focus the first option after opening
					setTimeout(() => {
						(select as any)._focusNextOption();
					}, 50);

					event.preventDefault();
				}
				break;
		}
	} catch (error) {
		console.error('Error in keyboard navigation handler:', error);
	}
}

/**
 * Centralized event listener management
 */
export class EventManager {
	private _boundHandlers: Map<
		string,
		Map<EventListenerOrEventListenerObject, EventListenerOrEventListenerObject>
	> = new Map();

	/**
	 * Add an event listener with a bound context
	 */
	public addListener(
		element: HTMLElement,
		event: string,
		handler: EventListenerOrEventListenerObject,
		context?: any,
	): void {
		if (!element) return;

		// Create a bound version of the handler if context provided
		const boundHandler: EventListenerOrEventListenerObject =
			context && typeof handler === 'function'
				? handler.bind(context)
				: handler;

		// Store the relationship between original and bound handler
		if (!this._boundHandlers.has(event)) {
			this._boundHandlers.set(event, new Map());
		}

		const eventMap = this._boundHandlers.get(event)!;
		eventMap.set(handler, boundHandler);

		// Add the event listener
		element.addEventListener(event, boundHandler);
	}

	/**
	 * Remove an event listener
	 */
	public removeListener(
		element: HTMLElement,
		event: string,
		handler: EventListenerOrEventListenerObject,
	): void {
		if (!element) return;

		const eventMap = this._boundHandlers.get(event);
		if (!eventMap) return;

		// Get the bound version of the handler
		const boundHandler = eventMap.get(handler);
		if (!boundHandler) return;

		// Remove the event listener
		element.removeEventListener(event, boundHandler);

		// Clean up the map
		eventMap.delete(handler);
		if (eventMap.size === 0) {
			this._boundHandlers.delete(event);
		}
	}

	/**
	 * Remove all event listeners
	 */
	public removeAllListeners(element: HTMLElement): void {
		if (!element) return;

		// Go through each event type
		this._boundHandlers.forEach((eventMap, event) => {
			// For each event type, go through each handler
			eventMap.forEach((boundHandler) => {
				element.removeEventListener(event, boundHandler);
			});
		});

		// Clear the maps
		this._boundHandlers.clear();
	}
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce(
	func: (...args: any[]) => void,
	delay: number,
): (...args: any[]) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return function (...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
}

/**
 * Replaces all {{key}} in the template with the corresponding value from the data object.
 * If a key is missing in data, replaces with an empty string.
 */
export function renderTemplateString(template: string, data: Record<string, any>): string {
	return template.replace(/{{(\w+)}}/g, (_, key) =>
		data[key] !== undefined && data[key] !== null ? String(data[key]) : ''
	);
}
