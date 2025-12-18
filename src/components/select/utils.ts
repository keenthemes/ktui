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

	// For empty query, make all options visible
	// The KTSelectSearch class is now responsible for restoring original content before calling this.
	if (!query || query.trim() === '') {
		for (const option of options) {
			option.classList.remove('hidden');
			// Remove inline display style if it was used to hide
			if (option.style.display === 'none') {
				option.style.display = '';
			}
			// At this point, option.innerHTML should be its original.
			visibleOptionsCount++;
		}

		if (onVisibleCount) {
			onVisibleCount(visibleOptionsCount);
		}
		return visibleOptionsCount;
	}

	const queryLower = query.toLowerCase();

	for (const option of options) {
		// Use data-text for matching if available, otherwise fall back to textContent
		const optionText = (
			option.dataset.text ||
			option.textContent ||
			''
		).toLowerCase();
		const isMatch = optionText.includes(queryLower);

		if (isMatch) {
			option.classList.remove('hidden');
			if (option.style.display === 'none') option.style.display = ''; // Ensure visible
			visibleOptionsCount++;
		} else {
			option.classList.add('hidden');
		}

		// Early exit if maxItems limit is reached (optional)
		// if (config.searchMaxItems && visibleOptionsCount >= config.searchMaxItems) {
		// 	break;
		// }
	}

	if (onVisibleCount) {
		onVisibleCount(visibleOptionsCount);
	}

	return visibleOptionsCount;
}

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
	private _onFocusChange:
		| ((option: HTMLElement | null, index: number | null) => void)
		| null = null;

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
			if (
				!option.classList.contains('disabled') &&
				option.getAttribute('aria-disabled') !== 'true'
			) {
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
			if (
				!option.classList.contains('disabled') &&
				option.getAttribute('aria-disabled') !== 'true'
			) {
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
				(option.textContent?.toLowerCase().startsWith(lowerStr) ||
					option.dataset.value?.toLowerCase().startsWith(lowerStr))
			) {
				this.resetFocus();
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
		let idx =
			this._focusedOptionIndex === null
				? 0
				: (this._focusedOptionIndex + 1) % options.length;
		let startIdx = idx;
		do {
			const option = options[idx];
			if (
				!option.classList.contains('disabled') &&
				option.getAttribute('aria-disabled') !== 'true'
			) {
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
		let idx =
			this._focusedOptionIndex === null
				? options.length - 1
				: (this._focusedOptionIndex - 1 + options.length) % options.length;
		let startIdx = idx;
		do {
			const option = options[idx];
			if (
				!option.classList.contains('disabled') &&
				option.getAttribute('aria-disabled') !== 'true'
			) {
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
		// Ensure it's not disabled
		if (
			option.classList.contains('disabled') ||
			option.getAttribute('aria-disabled') === 'true'
		) {
			return;
		}
		// DO NOT CALL resetFocus() here. Caller's responsibility.
		option.classList.add(this._focusClass);
		option.classList.add(this._hoverClass);
		// _triggerFocusChange needs _focusedOptionIndex to be set by the caller before this.
		this._triggerFocusChange();
	}

	/**
	 * Reset focus on all options
	 */
	public resetFocus(): void {
		const focusedElements = this._element.querySelectorAll(
			`.${this._focusClass}, .${this._hoverClass}`,
		);

		// Remove focus and hover classes from all options
		focusedElements.forEach((element) => {
			element.classList.remove(this._focusClass, this._hoverClass);
		});

		this._focusedOptionIndex = null; // Always reset the index
	}

	/**
	 * Ensure the focused option is visible in the scrollable container
	 */
	public scrollIntoView(option: HTMLElement): void {
		if (!option) return;

		const container = this._element.querySelector('[data-kt-select-options]');
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
			const optionToFocus = options[index];
			if (
				!optionToFocus.classList.contains('disabled') &&
				optionToFocus.getAttribute('aria-disabled') !== 'true'
			) {
				this.resetFocus();
				this._focusedOptionIndex = index;
				this.applyFocus(optionToFocus);
				this.scrollIntoView(optionToFocus);
				return true;
			}
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
	public setOnFocusChange(
		cb: (option: HTMLElement | null, index: number | null) => void,
	) {
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
/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Converts HTML special characters to their entity equivalents.
 *
 * @param text - The text to escape. Can be a string, null, or undefined.
 * @returns The escaped string, or empty string if input is null/undefined.
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string | null | undefined): string {
	if (text === null || text === undefined) {
		return '';
	}

	const str = String(text);
	const escapeMap: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	};

	return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

export function renderTemplateString(
	template: string,
	data: Record<string, any>,
): string {
	return template.replace(/{{(\w+)}}/g, (_, key) =>
		data[key] !== undefined && data[key] !== null ? String(data[key]) : '',
	);
}

/**
 * Escapes HTML attribute values (quotes and ampersands) while preserving URLs and other safe content.
 * This is used for values in HTML attributes like src, href, etc.
 *
 * @param text - The text to escape for use in HTML attributes
 * @returns The escaped string safe for HTML attributes
 */
function escapeHtmlAttribute(text: string | null | undefined): string {
	if (text === null || text === undefined) {
		return '';
	}

	const str = String(text);
	// For attributes, we need to escape quotes and ampersands, but preserve URLs
	// Escape quotes to prevent attribute injection, and & to prevent entity confusion
	return str.replace(/["'&]/g, (char) => {
		if (char === '"') return '&quot;';
		if (char === "'") return '&#39;';
		if (char === '&') {
			// Only escape & if it's not already part of an entity
			// Simple check: if followed by alphanumeric and #, it might be an entity
			return '&amp;';
		}
		return char;
	});
}

/**
 * Renders a template string with HTML-escaped variable values to prevent XSS.
 * The template structure itself (HTML tags) is preserved, but all variable values are escaped.
 * Values in attribute contexts (inside quotes) are escaped for attributes, while values in
 * text content are escaped for HTML entities.
 *
 * @param template - The template string with {{key}} placeholders
 * @param data - The data object containing values to insert
 * @returns The rendered template with escaped values
 *
 * @example
 * renderTemplateStringSafe('<div>{{text}}</div>', { text: '<script>alert("XSS")</script>' })
 * // Returns: '<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>'
 *
 * @example
 * renderTemplateStringSafe('<img src="{{url}}" />', { url: 'https://example.com?q=1&p=2' })
 * // Returns: '<img src="https://example.com?q=1&amp;p=2" />'
 */
export function renderTemplateStringSafe(
	template: string,
	data: Record<string, any>,
): string {
	return template.replace(/{{(\w+)}}/g, (match, key, offset) => {
		if (data[key] === undefined || data[key] === null) {
			return '';
		}

		const value = String(data[key]);

		// Check if this placeholder is inside an HTML attribute (between quotes)
		// Look backwards to find the opening quote and check for = before it
		const beforeMatch = template.substring(Math.max(0, offset - 200), offset);
		const afterMatch = template.substring(offset + match.length, offset + match.length + 50);

		// More robust detection: look for attribute pattern like: attr="...{{key}}..."
		// Pattern: = followed by optional whitespace, then quote, then content up to our match
		const attributePattern = /=\s*["'][^"']*$/;
		const isInAttribute =
			attributePattern.test(beforeMatch) &&
			(/^[^"']*["']/.test(afterMatch) || /^[^"']*[\s>]/.test(afterMatch));

		if (isInAttribute) {
			// For attribute values, escape quotes and ampersands but preserve URLs
			// URLs with & will become &amp; which browsers correctly decode
			return escapeHtmlAttribute(value);
		} else {
			// For text content, escape all HTML special characters
			return escapeHtml(value);
		}
	});
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
