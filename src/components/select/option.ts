/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import {
	KTSelectConfigInterface,
} from './config';
import { defaultTemplates } from './templates';
import { renderTemplateString } from './utils';

export class KTSelectOption extends KTComponent {
	protected override readonly _name: string = 'select-option';
	protected override readonly _dataOptionPrefix: string = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
	protected override readonly _config: KTSelectConfigInterface;
	private _globalConfig: KTSelectConfigInterface;

	constructor(element: HTMLElement, config?: KTSelectConfigInterface,) {
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

		// Get the original template
		let originalTemplate = this._globalConfig.optionTemplate;

		// Replace all {{varname}} in option.innerHTML with values from _config
		Object.entries((this._config as any)[''] || {}).forEach(([key, value]) => {
			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				this._globalConfig.optionTemplate = this._globalConfig.optionTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
			}
		});

		let template = defaultTemplates.option(optionElement, this._globalConfig);

		// Restore the original template
		this._globalConfig.optionTemplate = originalTemplate;

		return template;
	}
}
