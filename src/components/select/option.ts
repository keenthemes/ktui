/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import {
	KTSelectConfigInterface,
} from './config';
import { defaultTemplates, getTemplateStrings } from './templates';

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

		if (this._globalConfig.templates && this._globalConfig.templates.optionContent) {

			let optionContent = this._globalConfig.templates.optionContent;

			if ("" in this._config) {
				const config = this._config[''] as any;
				for (const key of Object.keys(config)) {
					const value = config[key as keyof KTSelectConfigInterface];
					if (typeof value === 'string') {
						optionContent = optionContent.replace(`{{${key}}}`, value);
					}
				}
			}

			option.innerHTML = optionContent.replace('{{content}}', option.textContent);
		}

		return option;
	}
}
