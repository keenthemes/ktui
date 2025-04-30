/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import { EventManager } from './utils';

/**
 * KTSelectTags - Handles tags-specific functionality for KTSelect
 */
export class KTSelectTags {
	private _select: KTSelect;
	private _config: KTSelectConfigInterface;
	private _valueDisplayElement: HTMLElement;
	private _eventManager: EventManager;

	/**
	 * Constructor: Initializes the tags component
	 */
	constructor(select: KTSelect) {
		this._select = select;
		this._config = select.getConfig();
		this._valueDisplayElement = select.getValueDisplayElement();
		this._eventManager = new EventManager();

		if (this._config.debug) console.log('KTSelectTags initialized');
	}

	/**
	 * Update selected tags display
	 * Renders selected options as tags in the display element
	 */
	public updateTagsDisplay(selectedOptions: string[]): void {
		// Clear existing content
		this._valueDisplayElement.innerHTML = '';

		// If no options selected, show placeholder
		if (selectedOptions.length === 0) {
			this._valueDisplayElement.textContent = this._config.placeholder || '';
			return;
		}

		// Create and append a tag element for each selected option
		selectedOptions.forEach((optionValue) => {
			const tagElement = this._createTagElement(optionValue);
			this._valueDisplayElement.appendChild(tagElement);
		});
	}

	/**
	 * Create tag element for a selected option
	 */
	private _createTagElement(optionValue: string): HTMLElement {
		const optionLabel = this._getOptionLabel(optionValue);
		// Create a mock option object to pass to the tag template
		const mockOption = {
			id: optionValue,
			title: optionLabel,
			selected: true,
		};

		// Use the tag template
		const tag = defaultTemplates.tag(mockOption, this._config);

		// Add event listener to the close button
		const closeButton = tag.querySelector(
			`[data-kt-select-remove-button]`,
		) as HTMLElement;

		if (closeButton) {
			this._eventManager.addListener(closeButton, 'click', (event: Event) => {
				event.stopPropagation();
				this._removeTag(optionValue);
			});
		}

		return tag;
	}

	/**
	 * Get the label/text for an option by its value
	 */
	private _getOptionLabel(optionValue: string): string {
		// First look for an option element in the dropdown with matching value
		const optionElements = this._select.getOptionsElement();
		for (const option of Array.from(optionElements)) {
			if ((option as HTMLElement).dataset.value === optionValue) {
				return (option as HTMLElement).textContent?.trim() || optionValue;
			}
		}

		// If not found in dropdown, look in original select element
		const originalOptions = this._select
			.getElement()
			.querySelectorAll('option');
		for (const option of Array.from(originalOptions)) {
			if ((option as HTMLOptionElement).value === optionValue) {
				return (option as HTMLOptionElement).textContent?.trim() || optionValue;
			}
		}

		// If still not found, return the value itself
		return optionValue;
	}

	/**
	 * Remove a tag and its selection
	 */
	private _removeTag(optionValue: string): void {
		// Delegate to the select component to handle state changes
		this._select.toggleSelection(optionValue);
	}

	/**
	 * Clean up resources used by this module
	 */
	public destroy(): void {
		this._eventManager.removeAllListeners(null);
	}
}
