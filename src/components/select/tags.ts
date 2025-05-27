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
		// Remove any existing tag elements
		const wrapper = this._valueDisplayElement.parentElement;
		if (!wrapper) return;

		// Remove all previous tags
		Array.from(wrapper.querySelectorAll('[data-kt-select-tag]')).forEach(tag => tag.remove());

		// If no options selected, do nothing (let display show placeholder)
		if (selectedOptions.length === 0) {
			return;
		}

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
				const originalOptions = this._select.getElement().querySelectorAll('option');
				for (const opt of Array.from(originalOptions)) {
					if ((opt as HTMLOptionElement).value === optionValue) {
						optionElement = opt as HTMLOptionElement;
						break;
					}
				}
			}

			const tag = defaultTemplates.tag(optionElement, this._config);

			// Add event listener to the close button
			const closeButton = tag.querySelector('[data-kt-select-remove-button]') as HTMLElement;
			if (closeButton) {
				this._eventManager.addListener(closeButton, 'click', (event: Event) => {
					event.stopPropagation();
					this._removeTag(optionValue);
				});
			}

			// Insert tag before the display element
			wrapper.insertBefore(tag, this._valueDisplayElement);
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
		this._eventManager.removeAllListeners(null);
	}
}
