/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import {
	KTSelectOptionConfigInterface,
	KTSelectConfigInterface,
} from './config';
import { defaultTemplates } from './templates';
import { renderTemplateString } from './utils';

export class KTSelectOption extends KTComponent {
	protected override readonly _name: string = 'select-option';
	protected override readonly _dataOptionPrefix: string = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
	protected override readonly _config: KTSelectOptionConfigInterface;
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
		const config = this._globalConfig || { height: 250 };

		let content = '';
		content = optionElement.textContent || optionElement.value;

		// Render the option using the default template, injecting the content
		let html = defaultTemplates.option(optionElement, this._globalConfig).outerHTML
			.replace('{{value}}', optionElement.value)
			.replace('{{selectedClass}}', optionElement.selected ? ' selected' : '')
			.replace('{{disabledClass}}', optionElement.disabled ? ' disabled' : '')
			.replace('{{selected}}', optionElement.selected ? 'aria-selected="true"' : 'aria-selected="false"')
			.replace('{{disabled}}', optionElement.disabled ? 'aria-disabled="true"' : '')
			.replace('{{content}}', content);

		const template = document.createElement('template');
		template.innerHTML = html.trim();
		return template.content.firstElementChild as HTMLElement;
	}
}
