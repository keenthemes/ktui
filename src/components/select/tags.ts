/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import { EventManager } from './utils';
import { renderTemplateString } from './utils';
import { defaultTemplateStrings } from './templates';

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
		// Find the original option element (in dropdown or select)
		let optionElement: HTMLElement | null = null;
		const optionElements = this._select.getOptionsElement();
		for (const opt of Array.from(optionElements)) {
			if ((opt as HTMLElement).dataset.value === optionValue) {
				optionElement = opt as HTMLElement;
				break;
			}
		}
		if (!optionElement) {
			const originalOptions = this._select.getElement().querySelectorAll('option');
			for (const opt of Array.from(originalOptions)) {
				if ((opt as HTMLOptionElement).value === optionValue) {
					optionElement = opt as HTMLElement;
					break;
				}
			}
		}

		let content = '';
		if (optionElement && optionElement.hasAttribute('data-kt-select-template-tag')) {
			const customTemplate = optionElement.getAttribute('data-kt-select-template-tag');
			const data: Record<string, any> = {};
			for (const [key, value] of Object.entries(optionElement.dataset)) {
				data[key] = value;
			}
			data.value = optionValue;
			data.text = optionLabel;
			content = renderTemplateString(customTemplate, data);
		} else {
			content = optionLabel;
		}

		// Render the tag using the default template, injecting the content
		let html = defaultTemplateStrings.tag.replace('{{content}}', content);
		const template = document.createElement('template');
		template.innerHTML = html.trim();
		const tag = template.content.firstElementChild as HTMLElement;

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
