/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// utils.ts

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
	private _onFocusChange: ((option: HTMLElement | null, index: number | null) => void) | null = null;

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

		this._focusClass = 'focus'; // or whatever your intended class is
		this._hoverClass = 'hover'; // or your intended class
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
	 * Focus the first visible option
	 */
	public focusFirst(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;
		for (let i = 0; i < options.length; i++) {
			const option = options[i];
			if (!option.classList.contains('disabled') && option.getAttribute('aria-disabled') !== 'true') {
				this.resetFocus();
				this._focusedOptionIndex = i;
				this.applyFocus(option);
				this.scrollIntoView(option);
				return option;
			}
		}
		return null;
	}

	/**
	 * Focus the last visible option
	 */
	public focusLast(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;
		for (let i = options.length - 1; i >= 0; i--) {
			const option = options[i];
			if (!option.classList.contains('disabled') && option.getAttribute('aria-disabled') !== 'true') {
				this.resetFocus();
				this._focusedOptionIndex = i;
				this.applyFocus(option);
				this.scrollIntoView(option);
				return option;
			}
		}
		return null;
	}

	/**
	 * Focus the next visible option that matches the search string
	 */
	public focusByString(str: string): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;
		const lowerStr = str.toLowerCase();
		const startIdx = (this._focusedOptionIndex ?? -1) + 1;
		for (let i = 0; i < options.length; i++) {
			const idx = (startIdx + i) % options.length;
			const option = options[idx];
			if (
				!option.classList.contains('disabled') &&
				option.getAttribute('aria-disabled') !== 'true' &&
				(option.textContent?.toLowerCase().startsWith(lowerStr) || option.dataset.value?.toLowerCase().startsWith(lowerStr))
			) {
				this._focusedOptionIndex = idx;
				this.applyFocus(option);
				this.scrollIntoView(option);
				return option;
			}
		}
		return null;
	}

	/**
	 * Focus the next visible option
	 */
	public focusNext(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;
		let idx = this._focusedOptionIndex === null ? 0 : (this._focusedOptionIndex + 1) % options.length;
		let startIdx = idx;
		do {
			const option = options[idx];
			if (!option.classList.contains('disabled') && option.getAttribute('aria-disabled') !== 'true') {
				this.resetFocus();
				this._focusedOptionIndex = idx;
				this.applyFocus(option);
				this.scrollIntoView(option);
				return option;
			}
			idx = (idx + 1) % options.length;
		} while (idx !== startIdx);
		return null;
	}

	/**
	 * Focus the previous visible option
	 */
	public focusPrevious(): HTMLElement | null {
		const options = this.getVisibleOptions();
		if (options.length === 0) return null;
		let idx = this._focusedOptionIndex === null ? options.length - 1 : (this._focusedOptionIndex - 1 + options.length) % options.length;
		let startIdx = idx;
		do {
			const option = options[idx];
			if (!option.classList.contains('disabled') && option.getAttribute('aria-disabled') !== 'true') {
				this.resetFocus();
				this._focusedOptionIndex = idx;
				this.applyFocus(option);
				this.scrollIntoView(option);
				return option;
			}
			idx = (idx - 1 + options.length) % options.length;
		} while (idx !== startIdx);
		return null;
	}

	/**
	 * Apply focus to a specific option
	 */
	public applyFocus(option: HTMLElement): void {
		if (!option) return;
		if (option.classList.contains('disabled') || option.getAttribute('aria-disabled') === 'true') {
			return;
		}
		this.resetFocus();
		option.classList.add(this._focusClass);
		option.classList.add(this._hoverClass);
		this._triggerFocusChange();
	}

	/**
	 * Reset focus on all options
	 */
	public resetFocus(): void {
		const focusedElements = this._element.querySelectorAll(`.${this._focusClass}, .${this._hoverClass}`);

		// Remove focus and hover classes from all options
		focusedElements.forEach((element) => {
			element.classList.remove(this._focusClass, this._hoverClass);
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
			'[data-kt-select-options]',
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
	 * Set a callback to be called when focus changes
	 */
	public setOnFocusChange(cb: (option: HTMLElement | null, index: number | null) => void) {
		this._onFocusChange = cb;
	}

	private _triggerFocusChange() {
		if (this._onFocusChange) {
			this._onFocusChange(this.getFocusedOption(), this._focusedOptionIndex);
		}
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

// Type-to-search buffer utility for keyboard navigation
export class TypeToSearchBuffer {
	private buffer: string = '';
	private lastTime: number = 0;
	private timeout: number;

	constructor(timeout: number = 500) {
		this.timeout = timeout;
	}

	public push(char: string) {
		const now = Date.now();
		if (now - this.lastTime > this.timeout) {
			this.buffer = '';
		}
		this.buffer += char;
		this.lastTime = now;
	}

	public getBuffer() {
		return this.buffer;
	}

	public clear() {
		this.buffer = '';
	}
}

export function stringToElement(html: string): HTMLElement {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstElementChild as HTMLElement;
}