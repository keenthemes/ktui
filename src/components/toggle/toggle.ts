/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTToggleConfigInterface, KTToggleInterface } from './types';

declare global {
	interface Window {
		KTToggle: typeof KTToggle;
	}
}

export class KTToggle extends KTComponent implements KTToggleInterface {
	protected override _name: string = 'toggle';
	protected override _defaultConfig: KTToggleConfigInterface = {
		target: '',
		activeClass: 'active',
		class: '',
		removeClass: '',
		attribute: '',
	};
	protected override _config: KTToggleConfigInterface = this._defaultConfig;
	protected _targetElement: HTMLElement;

	constructor(
		element: HTMLElement,
		config: KTToggleConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._targetElement = this._getTargetElement();
		if (!this._targetElement) {
			return;
		}

		this._handlers();
	}

	protected _handlers(): void {
		if (!this._element) return;

		this._element.addEventListener('click', () => {
			this._toggle();
		});
	}

	private _getTargetElement(): HTMLElement | null {
		return (
			KTDom.getElement(
				this._element.getAttribute('data-kt-toggle') as string,
			) || KTDom.getElement(this._getOption('target') as string)
		);
	}

	protected _toggle(): void {
		if (!this._element) return;
		const payload = { cancel: false };
		this._fireEvent('toggle', payload);
		this._dispatchEvent('toggle', payload);
		if (payload.cancel === true) {
			return;
		}

		this._element.classList.toggle(this._getOption('activeClass') as string);
		this._update();

		this._fireEvent('toggled');
		this._dispatchEvent('toggled');
	}

	protected _update(): void {
		if (!this._targetElement) return;

		if (this._getOption('removeClass')) {
			KTDom.removeClass(
				this._targetElement,
				this._getOption('removeClass') as string,
			);
		}

		if (!this._isActive()) {
			if (this._getOption('class')) {
				KTDom.addClass(this._targetElement, this._getOption('class') as string);
			}

			if (this._getOption('attribute')) {
				this._targetElement.setAttribute(
					this._getOption('attribute') as string,
					'true',
				);
			}
		} else {
			if (this._getOption('class')) {
				KTDom.removeClass(
					this._targetElement,
					this._getOption('class') as string,
				);
			}

			if (this._getOption('attribute')) {
				this._targetElement.removeAttribute(
					this._getOption('attribute') as string,
				);
			}
		}
	}

	public _isActive(): boolean {
		if (!this._element) return false;

		return (
			KTDom.hasClass(this._targetElement, this._getOption('class') as string) ||
			this._targetElement.hasAttribute(this._getOption('attribute') as string)
		);
	}

	public toggle(): void {
		this._toggle();
	}

	public update(): void {
		this._update();
	}

	public isActive(): boolean {
		return this._isActive();
	}

	public static getInstance(element: HTMLElement): KTToggle {
		if (!element) return null;

		if (KTData.has(element, 'toggle')) {
			return KTData.get(element, 'toggle') as KTToggle;
		}

		if (element.getAttribute('data-kt-toggle')) {
			return new KTToggle(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTToggleConfigInterface,
	): KTToggle {
		return this.getInstance(element) || new KTToggle(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-toggle]');
		elements.forEach((element) => {
			new KTToggle(element as HTMLElement);
		});
	}

	public static init(): void {
		KTToggle.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTToggle = KTToggle;
}
