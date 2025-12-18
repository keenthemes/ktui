/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import { KTSelectConfigInterface } from './config';
import { defaultTemplates } from './templates';

export class KTSelectOption extends KTComponent {
	protected override readonly _name: string = 'select-option';
	protected override readonly _dataOptionPrefix: string = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
	protected override readonly _config: KTSelectConfigInterface; // Holds option-specific data from data-kt-*
	private _globalConfig: KTSelectConfigInterface; // Main select's config

	constructor(element: HTMLElement, config?: KTSelectConfigInterface) {
		super();

		// Always initialize a new option instance
		this._init(element);
		this._globalConfig = config;
		this._buildConfig();

		// Clean the config
		this._config = (this._config as any)?.[''] || {};

		// Add the option config to the global config
		// Ensure optionsConfig is initialized
		if (this._globalConfig) {
			this._globalConfig.optionsConfig = this._globalConfig.optionsConfig || {};
			this._globalConfig.optionsConfig[(element as HTMLInputElement).value] =
				this._config;
			// console.log('[KTSelectOption] Populating _globalConfig.optionsConfig for value', (element as HTMLInputElement).value, 'with:', JSON.parse(JSON.stringify(this._config)));
			// console.log('[KTSelectOption] _globalConfig.optionsConfig is now:', JSON.parse(JSON.stringify(this._globalConfig.optionsConfig)));
		} else {
			// Handle case where _globalConfig might be undefined, though constructor expects it.
			// This might indicate a need to ensure config is always passed or has a default.
			console.warn(
				'KTSelectOption: _globalConfig is undefined during constructor.',
			);
		}

		// Don't store in KTData to avoid Singleton pattern issues
		// Each option should be a unique instance
		(element as any).instance = this;
	}

	public get id(): string {
		return this.getHTMLOptionElement().value;
	}

	public get title(): string {
		return this.getHTMLOptionElement().textContent || '';
	}

	public getHTMLOptionElement(): HTMLOptionElement {
		return this._element as HTMLOptionElement;
	}

	/**
	 * Gathers all necessary data for rendering this option,
	 * including standard HTML attributes and custom data-kt-* attributes.
	 */
	public getOptionDataForTemplate(): Record<string, any> {
		const el = this.getHTMLOptionElement();
		if (!el) {
			// Element was removed from DOM, return empty data
			return { value: '', text: '' };
		}
		const text = el.textContent || '';
		return {
			// Custom data from data-kt-select-option attributes (parsed into this._config)
			...this._config,
			// Standard HTMLOptionElement properties
			value: el.value,
			text: text, // Original text
			selected: el.selected,
			disabled: el.disabled,
			// Provide 'content' for convenience in templates, defaulting to text.
			// User's optionTemplate can then use {{content}} or specific fields like {{text}}, {{icon}}, etc.
			content: text,
		};
	}

	public render(): HTMLElement {
		// 'this' is the KTSelectOption instance.
		// defaultTemplates.option will handle using this instance's data along with _globalConfig.
		return defaultTemplates.option(this, this._globalConfig);
	}
}
