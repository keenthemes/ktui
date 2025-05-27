/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { filterOptions, renderTemplateString, stringToElement } from './utils';
import { defaultTemplates } from './templates';

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
	private _valuesContainerElement: HTMLElement | null; // For tags or displayTemplate output

	constructor(select: KTSelect) {
		this._select = select;
		this._config = select.getConfig();

		const displayElement = select.getDisplayElement(); // KTSelect's main display element for combobox

		this._searchInputElement = displayElement.querySelector('input[data-kt-select-search]');
		this._clearButtonElement = displayElement.querySelector('[data-kt-select-clear-button]');
		this._valuesContainerElement = displayElement.querySelector('[data-kt-select-combobox-values]');

		this._boundInputHandler = this._handleComboboxInput.bind(this);
		this._boundClearHandler = this._handleClearButtonClick.bind(this);

		this._attachEventListeners();

		this._select.getElement().addEventListener('dropdown.close', () => {
			// When dropdown closes, if not multi-select and not using displayTemplate,
			// ensure input shows the selected value or placeholder.
			if (!this._config.multiple && !this._config.displayTemplate) {
				this.updateDisplay(this._select.getSelectedOptions());
			} else {
				// For tags or displayTemplate, the input should be clear for typing.
				this._searchInputElement.value = '';
			}
			this._toggleClearButtonVisibility(this._searchInputElement.value);
			// this._select.showAllOptions(); // showAllOptions might be too broad, filtering is managed by typing.
		});

		if (this._config.debug) console.log('KTSelectCombobox initialized');
	}

	/**
	 * Attach event listeners specific to combobox
	 */
	private _attachEventListeners(): void {
		this._removeEventListeners();
		if (this._searchInputElement) { // Ensure element exists
			this._searchInputElement.addEventListener('input', this._boundInputHandler);
		}
		if (this._clearButtonElement) {
			this._clearButtonElement.addEventListener('click', this._boundClearHandler);
		}
	}

	/**
	 * Remove event listeners to prevent memory leaks or duplicates
	 */
	private _removeEventListeners(): void {
		if (this._searchInputElement) {
			this._searchInputElement.removeEventListener('input', this._boundInputHandler);
		}
		if (this._clearButtonElement) {
			this._clearButtonElement.removeEventListener('click', this._boundClearHandler);
		}
	}

	/**
	 * Handle combobox input events
	 */
	private _handleComboboxInput(event: Event): void {
		const inputElement = event.target as HTMLInputElement;
		const query = inputElement.value;

		this._toggleClearButtonVisibility(query);

		if (!(this._select as any).isDropdownOpen()) { // Use public getter
			this._select.openDropdown();
		}
		// For single select without displayTemplate, if user types, they are essentially clearing the previous selection text
		// The actual selection state isn't cleared until they pick a new option or clear explicitly.
		// For multi-select or with displayTemplate, the input is purely for search.
		if (this._config.multiple || this._config.displayTemplate) {
			// Values are in _valuesContainerElement, input is for search
		} else {
			// Single select, no displayTemplate: If user types, it implies they might be changing selection.
			// We don't clear the actual _select state here, just the visual in input.
		}

		this._filterOptionsForCombobox(query);
	}

	/**
	 * Handle clear button click
	 */
	private _handleClearButtonClick(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();

		this._searchInputElement.value = '';
		this._toggleClearButtonVisibility('');
		if (this._valuesContainerElement) {
			this._valuesContainerElement.innerHTML = '';
		}
		this._select.clearSelection(); // This will also trigger updateSelectedOptionDisplay
		this._select.showAllOptions(); // Show all options after clearing
		this._select.openDropdown();
		this._searchInputElement.focus();
	}

	/**
	 * Toggle clear button visibility based on input value and selection state.
	 * Clear button should be visible if there's text in input OR if there are selected items (for multi/displayTemplate modes).
	 */
	private _toggleClearButtonVisibility(inputValue: string): void {
		if (!this._clearButtonElement) return;
		const hasSelectedItems = this._select.getSelectedOptions().length > 0;

		if (inputValue.length > 0 || (hasSelectedItems && (this._config.multiple || this._config.displayTemplate))) {
			this._clearButtonElement.classList.remove('hidden');
		} else {
			this._clearButtonElement.classList.add('hidden');
		}
	}

	/**
	 * Filter options for combobox based on input query
	 */
	private _filterOptionsForCombobox(query: string): void {
		const options = Array.from(this._select.getOptionsElement()) as HTMLElement[];
		const config = this._select.getConfig();
		const dropdownElement = this._select.getDropdownElement();
		filterOptions(options, query, config, dropdownElement);
		// After filtering, focusManager in KTSelectSearch (if search is also enabled there)
		// or the main FocusManager should adjust focus if needed.
		// For combobox, this filtering is the primary search mechanism.
		// We might need to tell select's focus manager to focus first option.
		(this._select as any)._focusManager.focusFirst(); // Consider if this is always right
	}

	/**
	 * Updates the combobox display (input field or values container) based on selection.
	 */
	public updateDisplay(selectedOptions: string[]): void {
		if (!this._searchInputElement) return;

		// Always clear the values container first if it exists
		if (this._valuesContainerElement) {
			this._valuesContainerElement.innerHTML = '';
		}

		if (this._config.tags && this._valuesContainerElement) { // Combobox + Tags
			selectedOptions.forEach(value => {
				// Ensure value is properly escaped for querySelector
				const optionElement = this._select.getElement().querySelector(`option[value="${CSS.escape(value)}"]`) as HTMLOptionElement;
				if (optionElement) {
					const tagElement = defaultTemplates.tag(optionElement, this._config);
					this._valuesContainerElement.appendChild(tagElement);
				}
			});
			this._searchInputElement.value = ''; // Input field is for typing new searches
			this._searchInputElement.placeholder = selectedOptions.length > 0 ? '' : (this._config.placeholder || 'Select...');

		} else if (this._config.displayTemplate && this._valuesContainerElement) { // Combobox + DisplayTemplate (no tags)
			this._valuesContainerElement.innerHTML = this._select.renderDisplayTemplateForSelected(selectedOptions);
			this._searchInputElement.value = ''; // Input field is for typing new searches
			this._searchInputElement.placeholder = selectedOptions.length > 0 ? '' : (this._config.placeholder || 'Select...');

		} else if (this._config.multiple && this._valuesContainerElement) { // Combobox + Multiple (no tags, no display template)
			// For simplicity, join text. A proper tag implementation would be more complex here.
			this._valuesContainerElement.innerHTML = selectedOptions.map(value => {
				const optionEl = this._select.getElement().querySelector(`option[value="${CSS.escape(value)}"]`);
				return optionEl ? optionEl.textContent : '';
			}).join(', '); // Basic comma separation
			this._searchInputElement.value = '';
			this._searchInputElement.placeholder = selectedOptions.length > 0 ? '' : (this._config.placeholder || 'Select...');

		} else if (!this._config.multiple && selectedOptions.length > 0) { // Single select combobox: display selected option's text in the input
			const selectedValue = selectedOptions[0];
			const optionElement = this._select.getElement().querySelector(`option[value="${CSS.escape(selectedValue)}"]`);
			this._searchInputElement.value = optionElement ? optionElement.textContent || '' : '';
			// placeholder is implicitly handled by input value for single select

		} else { // No selection or not fitting above categories (e.g. single select, no items)
			this._searchInputElement.value = '';
			this._searchInputElement.placeholder = this._config.placeholder || 'Select...';
			// _valuesContainerElement is already cleared if it exists
		}
		this._toggleClearButtonVisibility(this._searchInputElement.value);
	}

	/**
	 * Destroy the combobox component and clean up event listeners
	 */
	public destroy(): void {
		this._removeEventListeners();
	}
}
