/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTDismissInterface, KTDismissConfigInterface } from './types';
import { KTDismissModeType } from './types';

declare global {
	interface Window {
		KT_DISMISS_INITIALIZED: boolean;
		KTDismiss: typeof KTDismiss;
	}
}

export class KTDismiss extends KTComponent implements KTDismissInterface {
	protected override _name: string = 'dismiss';
	protected override _defaultConfig: KTDismissConfigInterface = {
		hiddenClass: 'hidden',
		mode: 'remove',
		interrupt: true,
		target: '',
	};
	protected override _config: KTDismissConfigInterface = this._defaultConfig;
	protected _isAnimating: boolean = false;
	protected _targetElement: HTMLElement | null = null;

	constructor(element: HTMLElement, config?: KTDismissConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._config['mode'] = this._config['mode'] as KTDismissModeType;

		if (!this._element) return;

		this._targetElement = this._getTargetElement();
		if (!this._targetElement) {
			return;
		}

		this._handlers();
	}

	private _getTargetElement(): HTMLElement | null {
		return (
			KTDom.getElement(
				this._element.getAttribute('data-kt-dismiss') as string,
			) || KTDom.getElement(this._getOption('target') as string)
		);
	}

	protected _handlers(): void {
		if (!this._element) return;

		this._element.addEventListener('click', (event: Event) => {
			event.preventDefault();

			if ((this._getOption('interrupt') as boolean) === true) {
				event.stopPropagation();
			}

			this._dismiss();
		});
	}

	protected _dismiss(): void {
		if (this._isAnimating) {
			return;
		}

		const payload = { cancel: false };
		this._fireEvent('dismiss', payload);
		this._dispatchEvent('dismiss', payload);
		if (payload.cancel === true) {
			return;
		}

		if (!this._targetElement) return;
		this._targetElement.style.opacity = '0';
		KTDom.reflow(this._targetElement);
		this._isAnimating = true;

		KTDom.transitionEnd(this._targetElement, () => {
			if (!this._targetElement) return;
			this._isAnimating = false;
			this._targetElement.style.opacity = '';

			if (this._getOption('mode').toString().toLowerCase() === 'hide') {
				this._targetElement.classList.add(
					this._getOption('hiddenClass') as string,
				);
			} else {
				KTDom.remove(this._targetElement);
			}

			this._fireEvent('dismissed');
			this._dispatchEvent('dismissed');
		});
	}

	public getTargetElement(): HTMLElement {
		return this._targetElement;
	}

	public dismiss(): void {
		this._dismiss();
	}

	public static getInstance(element: HTMLElement): KTDismiss {
		if (!element) return null;

		if (KTData.has(element, 'dismiss')) {
			return KTData.get(element, 'dismiss') as KTDismiss;
		}

		if (element.getAttribute('data-kt-dismiss')) {
			return new KTDismiss(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTDismissConfigInterface,
	): KTDismiss {
		return this.getInstance(element) || new KTDismiss(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-dismiss]');

		elements.forEach((element) => {
			new KTDismiss(element as HTMLElement);
		});
	}

	public static init(): void {
		KTDismiss.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTDismiss = KTDismiss;
}
