/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { filterOptions, renderTemplateString, stringToElement } from './utils';

/**
 * KTSelectCombobox - Handles combobox-specific functionality for KTSelect
 */
export class KTSelectCombobox {
	private _select: KTSelect;
	private _config: KTSelectConfigInterface;
	private _searchInputElement: HTMLInputElement;
	private _clearButtonElement: HTMLElement | null;
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

		// Find the clear button robustly
		let clearButtonContainer: HTMLElement | null = null;
		if (displayElement.tagName === 'DIV') {
			clearButtonContainer = displayElement;
		} else if (displayElement.tagName === 'INPUT') {
			clearButtonContainer = displayElement.parentElement as HTMLElement;
		}
		this._clearButtonElement = clearButtonContainer
			? clearButtonContainer.querySelector('[data-kt-select-clear-button]')
			: null;

		// Create bound handler references to allow proper cleanup
		this._boundInputHandler = this._handleComboboxInput.bind(this);
		this._boundClearHandler = this._handleClearButtonClick.bind(this);

		// Attach event listeners
		this._attachEventListeners();

		// Reset combobox search state when dropdown closes
		this._select.getElement().addEventListener('dropdown.close', () => {
			this._searchInputElement.value = '';
			this._toggleClearButtonVisibility('');
			this._select.showAllOptions();
		});

		// When selection changes, update the input value to the selected option's text
		this._select.getElement().addEventListener('change', () => {
			// Only update the input value, do not reset the filter or show all options
			if (this._config.displayTemplate) {
				const selectedValues = this._select.getSelectedOptions();
				const content = this._select.renderDisplayTemplateForSelected(selectedValues);
				displayElement.parentElement?.prepend(stringToElement(content));
			} else {
				this._select.updateSelectedOptionDisplay();
			}
		});

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
		// Use the same filter logic as KTSelectSearch
		const options = Array.from(this._select.getOptionsElement()) as HTMLElement[];
		const config = this._select.getConfig();
		const dropdownElement = this._select.getDropdownElement();
		filterOptions(options, query, config, dropdownElement);
	}

	/**
	 * Destroy the combobox component and clean up event listeners
	 */
	public destroy(): void {
		this._removeEventListeners();
	}
}
