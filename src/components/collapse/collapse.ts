/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTCollapseInterface, KTCollapseConfigInterface } from './types';

export class KTCollapse extends KTComponent implements KTCollapseInterface {
	protected override _name: string = 'collapse';
	protected override _defaultConfig: KTCollapseConfigInterface = {
		hiddenClass: 'hidden',
		activeClass: 'active',
		target: '',
	};
	protected override _config: KTCollapseConfigInterface = this._defaultConfig;
	protected _isAnimating: boolean = false;
	protected _targetElement: HTMLElement;

	constructor(element: HTMLElement, config?: KTCollapseConfigInterface) {
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

	private _getTargetElement(): HTMLElement | null {
		return (
			KTDom.getElement(
				this._element.getAttribute('data-kt-collapse') as string,
			) || KTDom.getElement(this._getOption('target') as string)
		);
	}

	protected _isOpen(): boolean {
		return this._targetElement.classList.contains(
			this._getOption('activeClass') as string,
		);
	}

	protected _handlers(): void {
		this._element.addEventListener('click', (event: Event) => {
			event.preventDefault();

			this._toggle();
		});
	}

	protected _expand(): void {
		if (this._isAnimating || this._isOpen()) {
			return;
		}

		const payload = { cancel: false };
		this._fireEvent('expand', payload);
		this._dispatchEvent('expand', payload);
		if (payload.cancel === true) {
			return;
		}

		if (this._element) {
			this._element.setAttribute('aria-expanded', 'true');
			this._element.classList.add(this._getOption('activeClass') as string);
		}
		this._targetElement.classList.remove(
			this._getOption('hiddenClass') as string,
		);
		this._targetElement.classList.add(this._getOption('activeClass') as string);

		this._targetElement.style.height = '0px';
		this._targetElement.style.overflow = 'hidden';
		KTDom.reflow(this._targetElement);
		this._targetElement.style.height = `${this._targetElement.scrollHeight}px`;
		this._isAnimating = true;

		KTDom.transitionEnd(this._targetElement, () => {
			this._isAnimating = false;
			this._targetElement.style.height = '';
			this._targetElement.style.overflow = '';

			this._fireEvent('expanded');
			this._dispatchEvent('expanded');
		});
	}

	protected _collapse(): void {
		if (this._isAnimating || !this._isOpen()) {
			return;
		}

		const payload = { cancel: false };
		this._fireEvent('collapse', payload);
		this._dispatchEvent('collapse', payload);
		if (payload.cancel === true) {
			return;
		}

		if (!this._element) return;
		this._element.setAttribute('aria-expanded', 'false');
		this._element.classList.remove(this._getOption('activeClass') as string);
		this._targetElement.classList.remove(
			this._getOption('activeClass') as string,
		);

		this._targetElement.style.height = `${this._targetElement.scrollHeight}px`;
		KTDom.reflow(this._targetElement);
		this._targetElement.style.height = `0px`;
		this._targetElement.style.overflow = 'hidden';
		this._isAnimating = true;

		KTDom.transitionEnd(this._targetElement, () => {
			this._isAnimating = false;
			this._targetElement.classList.add(
				this._getOption('hiddenClass') as string,
			);
			this._targetElement.style.overflow = '';

			this._fireEvent('collapsed');
			this._dispatchEvent('collapsed');
		});
	}

	protected _toggle(): void {
		const payload = { cancel: false };
		this._fireEvent('toggle', payload);
		this._dispatchEvent('toggle', payload);
		if (payload.cancel === true) {
			return;
		}

		if (this._isOpen()) {
			this._collapse();
		} else {
			this._expand();
		}
	}

	public expand(): void {
		return this._expand();
	}

	public collapse(): void {
		return this._collapse();
	}

	public isOpen(): boolean {
		return this._isOpen();
	}

	public static getInstance(element: HTMLElement): KTCollapse {
		if (!element) return null;

		if (KTData.has(element, 'collapse')) {
			return KTData.get(element, 'collapse') as KTCollapse;
		}

		if (element.getAttribute('data-kt-collapse')) {
			return new KTCollapse(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTCollapseConfigInterface,
	): KTCollapse {
		return this.getInstance(element) || new KTCollapse(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-collapse]');

		elements.forEach((element) => {
			new KTCollapse(element as HTMLElement);
		});
	}

	public static init(): void {
		KTCollapse.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTCollapse = KTCollapse;
}
