/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { handleDropdownKeyNavigation } from './utils';
import { SelectMode } from './types';

/**
 * KTSelectCombobox - Handles combobox-specific functionality for KTSelect
 */
export class KTSelectCombobox {
	private _select: KTSelect;
	private _config: KTSelectConfigInterface;
	private _searchInputElement: HTMLInputElement;
	private _clearButtonElement: HTMLElement | null;
	private _boundKeyNavHandler: (event: KeyboardEvent) => void;
	private _boundInputHandler: (event: Event) => void;
	private _boundClearHandler: (event: MouseEvent) => void;

	constructor(select: KTSelect) {
		this._select = select;
		this._config = select.getConfig();

		// Get the display element (could be the input directly or a parent div)
		const displayElement = select.getValueDisplayElement();

		// Find the input element - either it's the display element itself or a child
		this._searchInputElement =
			displayElement.tagName === 'INPUT'
				? (displayElement as HTMLInputElement)
				: displayElement.querySelector('input[data-kt-select-search]');

		// Find the clear button
		this._clearButtonElement =
			displayElement.tagName === 'DIV'
				? displayElement.querySelector('[data-kt-select-clear-button]')
				: null;

		// Create bound handler references to allow proper cleanup
		this._boundKeyNavHandler = this._handleComboboxKeyNav.bind(this);
		this._boundInputHandler = this._handleComboboxInput.bind(this);
		this._boundClearHandler = this._handleClearButtonClick.bind(this);

		// Attach event listeners
		this._attachEventListeners();

		if (this._config.debug) console.log('KTSelectCombobox initialized');
	}

	/**
	 * Attach event listeners specific to combobox
	 */
	private _attachEventListeners(): void {
		// First remove any existing listeners to prevent duplicates
		this._removeEventListeners();

		// Add input event handler to filter options as user types
		this._searchInputElement.addEventListener('input', this._boundInputHandler);

		// Add keyboard navigation for the combobox
		this._searchInputElement.addEventListener(
			'keydown',
			this._boundKeyNavHandler,
		);

		// Add clear button click event listener
		if (this._clearButtonElement) {
			this._clearButtonElement.addEventListener(
				'click',
				this._boundClearHandler,
			);
		}

		if (this._config.debug)
			console.log(
				'Combobox event listeners attached to:',
				this._searchInputElement,
			);
	}

	/**
	 * Remove event listeners to prevent memory leaks or duplicates
	 */
	private _removeEventListeners(): void {
		if (this._searchInputElement) {
			this._searchInputElement.removeEventListener(
				'input',
				this._boundInputHandler,
			);
			this._searchInputElement.removeEventListener(
				'keydown',
				this._boundKeyNavHandler,
			);
		}

		if (this._clearButtonElement) {
			this._clearButtonElement.removeEventListener(
				'click',
				this._boundClearHandler,
			);
		}
	}

	/**
	 * Handle combobox input events
	 */
	private _handleComboboxInput(event: Event): void {
		const inputElement = event.target as HTMLInputElement;
		const query = inputElement.value.toLowerCase();

		if (this._config.debug) console.log('Combobox input event, query:', query);

		// Toggle clear button visibility based on input value
		this._toggleClearButtonVisibility(query);

		// If dropdown isn't open, open it when user starts typing
		if (!(this._select as any)._dropdownIsOpen) {
			this._select.openDropdown();
		}

		// Filter options based on input
		this._filterOptionsForCombobox(query);
	}

	/**
	 * Handle clear button click
	 */
	private _handleClearButtonClick(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();

		// Clear the input
		this._searchInputElement.value = '';

		// Hide the clear button
		this._toggleClearButtonVisibility('');

		// Show all options and open dropdown
		this._select.showAllOptions();
		this._select.openDropdown();

		// Clear the current selection
		this._select.clearSelection();

		// Focus on the input
		this._searchInputElement.focus();
	}

	/**
	 * Toggle clear button visibility based on input value
	 */
	private _toggleClearButtonVisibility(value: string): void {
		if (!this._clearButtonElement) return;

		if (value.length > 0) {
			this._clearButtonElement.classList.remove('hidden');
		} else {
			this._clearButtonElement.classList.add('hidden');
		}
	}

	/**
	 * Filter options for combobox based on input query
	 */
	private _filterOptionsForCombobox(query: string): void {
		// Access the private method through type assertion
		(this._select as any)._filterOptionsForCombobox(query);
	}

	/**
	 * Handle keyboard navigation in combobox mode
	 */
	private _handleComboboxKeyNav(event: KeyboardEvent): void {
		if (this._config.debug) console.log('Combobox keydown event:', event.key);

		// Prevent event propagation to stop bubbling to other handlers
		event.stopPropagation();

		// Handle clear with Escape when dropdown is closed
		if (
			event.key === 'Escape' &&
			!(this._select as any)._dropdownIsOpen &&
			this._searchInputElement.value !== ''
		) {
			event.preventDefault();
			this._searchInputElement.value = '';
			this._toggleClearButtonVisibility('');
			this._select.clearSelection();
			return;
		}

		// Handle dropdown visibility with special keys
		if (
			!(this._select as any)._dropdownIsOpen &&
			(event.key === 'ArrowDown' ||
				event.key === 'ArrowUp' ||
				event.key === 'Enter')
		) {
			if (this._config.debug)
				console.log('Opening dropdown from keyboard in combobox');
			this._select.openDropdown();
			event.preventDefault();

			// If it's arrow keys, also move focus
			if (event.key === 'ArrowDown') {
				(this._select as any)._focusNextOption();
			} else if (event.key === 'ArrowUp') {
				(this._select as any)._focusPreviousOption();
			}
			return;
		}

		// Use the shared keyboard navigation handler
		handleDropdownKeyNavigation(event, this._select, {
			multiple: this._config.multiple,
			closeOnSelect: this._config.closeOnSelect,
		});
	}

	/**
	 * Update the combobox input value when an option is selected
	 */
	public updateSelectedValue(selectedText: string): void {
		if (this._searchInputElement) {
			// Extract just the text content if it contains HTML
			let cleanText = selectedText;

			// If the text might contain HTML (when description is present)
			if (selectedText.includes('<') || selectedText.includes('>')) {
				// Create a temporary element to extract just the text
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = selectedText;

				// Find and use only the option-title text if available
				const titleElement = tempDiv.querySelector('[data-kt-option-title]');
				if (titleElement) {
					cleanText = titleElement.textContent || selectedText;
				} else {
					// Fallback to all text content if option-title not found
					cleanText = tempDiv.textContent || selectedText;
				}
			}

			// Set the input value directly for immediate feedback
			this._searchInputElement.value = cleanText;

			// Show the clear button if there's a value
			this._toggleClearButtonVisibility(cleanText);

			// Trigger an input event to ensure any input-based listeners are notified
			const inputEvent = new Event('input', { bubbles: true });
			this._searchInputElement.dispatchEvent(inputEvent);

			if (this._config.debug)
				console.log('Combobox value updated to:', cleanText);
		}
	}

	/**
	 * Reset the input value to match the current selection
	 * This can be called to sync the input with the current state
	 */
	public resetInputValueToSelection(): void {
		const selectedOptions = this._select.getSelectedOptions();
		if (selectedOptions.length > 0) {
			const selectedOption = Array.from(this._select.getOptionsElement()).find(
				(opt) => opt.dataset.value === selectedOptions[0],
			) as HTMLElement;

			if (selectedOption) {
				// Find the option-title element to get just the title text
				const titleElement = selectedOption.querySelector(
					'[data-kt-option-title]',
				);
				let selectedText = '';

				if (titleElement) {
					// If it has a structured content with a title element
					selectedText = titleElement.textContent?.trim() || '';
				} else {
					// Fallback to the whole text content
					selectedText = selectedOption.textContent?.trim() || '';
				}

				this.updateSelectedValue(selectedText);
			}
		} else {
			// No selection, clear the input
			if (this._searchInputElement) {
				this._searchInputElement.value = '';
				this._toggleClearButtonVisibility('');
			}
		}
	}

	/**
	 * Destroy the combobox component and clean up event listeners
	 */
	public destroy(): void {
		this._removeEventListeners();
	}
}
