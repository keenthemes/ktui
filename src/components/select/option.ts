/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import {
	KTSelectConfigInterface,
} from './config';
import { defaultTemplates } from './templates';

export class KTSelectOption extends KTComponent {
	protected override readonly _name: string = 'select-option';
	protected override readonly _dataOptionPrefix: string = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
	protected override readonly _config: KTSelectConfigInterface;
	private _globalConfig: KTSelectConfigInterface;

	constructor(element: HTMLElement, config?: KTSelectConfigInterface) {
		super();

		// Always initialize a new option instance
		this._init(element);
		this._buildConfig();
		this._globalConfig = config;

		// Don't store in KTData to avoid Singleton pattern issues
		// Each option should be a unique instance
		(element as any).instance = this;
	}

	public getHTMLOptionElement(): HTMLOptionElement {
		return this._element as HTMLOptionElement;
	}

	public render(): HTMLElement {
		const optionElement = this.getHTMLOptionElement();

		// Render the option using the default template, injecting the content
		let option = defaultTemplates.option(optionElement, this._globalConfig);

		// Replace {{varname}} in option.innerHTML with values from _config
		if (option && option.innerHTML) {
			Object.entries(this._config).forEach(([key, value]) => {
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					option.innerHTML = option.innerHTML.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
				}
			});
		}

		console.log(this._config);

		return option;
	}
}
