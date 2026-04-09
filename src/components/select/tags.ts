/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
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
	private _valueDisplayElement: HTMLElement | null;
	private _eventManager: EventManager;

	/**
	 * Constructor: Initializes the tags component
	 */
	constructor(select: KTSelect) {
		this._select = select;
		this._config = select.getConfig();
		this._valueDisplayElement = select.getValueDisplayElement();
		this._eventManager = new EventManager();
	}

	/**
	 * Update selected tags display
	 * Renders selected options as tags in the display element
	 */
	public updateTagsDisplay(selectedOptions: string[]): void {
		if (!this._valueDisplayElement) return;
		const valueDisplayElement = this._valueDisplayElement;
		// Remove any existing tag elements
		const wrapper = valueDisplayElement.parentElement;
		if (!wrapper) return;

		// If no options selected, ensure placeholder is shown
		if (selectedOptions.length === 0) {
			// Clear any existing content and show placeholder
			valueDisplayElement.innerHTML = '';
			const placeholderEl = defaultTemplates.placeholder(this._config);
			valueDisplayElement.appendChild(placeholderEl);
			return;
		}

		// Clear all existing content before adding tags
		valueDisplayElement.innerHTML = '';

		// Insert each tag before the display element
		selectedOptions.forEach((optionValue) => {
			// Find the original option element (in dropdown or select)
			let optionElement: HTMLOptionElement | null = null;
			const optionElements = this._select.getOptionsElement();
			for (const opt of Array.from(optionElements)) {
				if ((opt as HTMLElement).dataset.value === optionValue) {
					optionElement = opt as HTMLOptionElement;
					break;
				}
			}
			if (!optionElement) {
				const originalOptions = this._select
					.getElement()
					?.querySelectorAll('option');
				if (!originalOptions) return;
				for (const opt of Array.from(originalOptions)) {
					if ((opt as HTMLOptionElement).value === optionValue) {
						optionElement = opt as HTMLOptionElement;
						break;
					}
				}
			}
			if (!optionElement) return;

			const tag = defaultTemplates.tag(optionElement, this._config);

			// Add event listener to the close button
			const closeButton = tag.querySelector(
				'[data-kt-select-remove-button]',
			) as HTMLElement;
			if (closeButton) {
				this._eventManager.addListener(closeButton, 'click', (event: Event) => {
					event.stopPropagation();
					this._removeTag(optionValue);
				});
			}

			// Insert tag inside the display element
			valueDisplayElement.appendChild(tag);
		});
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
		if (this._valueDisplayElement) {
			this._eventManager.removeAllListeners(this._valueDisplayElement);
		}
	}
}
