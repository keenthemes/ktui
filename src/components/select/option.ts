/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import KTComponent from '../component';
import {
	KTSelectOptionConfigInterface,
	KTSelectConfigInterface,
} from './config';
import { defaultTemplates } from './templates';

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
		// Use the global config if available, or create a minimal valid config
		const config = this._globalConfig || { height: 250 };
		// Create a new option element every time
		return defaultTemplates.option(optionElement, config);
	}
}
