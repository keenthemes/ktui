/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTComponent from '../component';
import { KTScrollableInterface, KTScrollableConfigInterface } from './types';

declare global {
	interface Window {
		KT_SCROLLABLE_INITIALIZED: boolean;
		KTScrollable: typeof KTScrollable;
	}
}

export class KTScrollable extends KTComponent implements KTScrollableInterface {
	protected override _name: string = 'scrollable';
	protected override _defaultConfig: KTScrollableConfigInterface = {
		save: true,
		dependencies: '',
		wrappers: '',
		offset: '',
	};
	protected override _config: KTScrollableConfigInterface = this._defaultConfig;
	protected _elementId: string | null = null;

	constructor(element: HTMLElement, config?: KTScrollableConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;
		this._elementId = this._element.getAttribute('id');
		this._handlers();
		this._update();
	}

	protected _handlers(): void {
		if (!this._element) return;
		this._element.addEventListener('scroll', () => {
			if (!this._element) return;
			localStorage.setItem(
				`${this._elementId}st`,
				this._element.scrollTop.toString(),
			);
		});
	}

	protected _update(): void {
		this._setupHeight();
		this._setupState();
	}

	protected _setupHeight(): void {
		if (!this._element) return;

		const heightType = this._getHeightType();
		const height = this._getHeight();

		// Set height
		if (height && height != '0' && height.length > 0) {
			this._element.style.setProperty(heightType, height);
		} else {
			this._element.style.setProperty(heightType, '');
		}
	}

	protected _setupState(): void {
		if (!this._element) return;
		const stateEnabled = this._getOption('state') === true;
		const elementIdExists = Boolean(this._elementId);

		if (stateEnabled && elementIdExists) {
			const storedPosition = localStorage.getItem(this._elementId + 'st');

			if (storedPosition) {
				const pos = parseInt(storedPosition);

				if (pos > 0) {
					this._element.scroll({
						top: pos,
						behavior: 'instant',
					});
				}
			}
		}
	}

	protected _getHeight(): string {
		const height = this._getHeightOption();

		if (
			height !== null &&
			typeof height === 'string' &&
			height.toLowerCase() === 'auto'
		) {
			return this._getAutoHeight();
		} else if (height) {
			return parseInt(height).toString() + 'px';
		} else {
			return '0';
		}
	}

	protected _getAutoHeight(): string {
		if (!this._element) return '';
		let height = KTDom.getViewPort().height;
		const dependencies = this._getOption('dependencies') as string;
		const wrappers = this._getOption('wrappers') as string;
		const offset = this._getOption('offset') as string;
		height -= this._getElementSpacing(this._element);

		if (dependencies && dependencies.length > 0) {
			const elements = document.querySelectorAll(dependencies);
			elements.forEach((element) => {
				if (KTDom.getCssProp(element as HTMLElement, 'display') === 'none') {
					return;
				}
				height -= this._getElementHeight(element as HTMLElement);
			});
		}

		if (wrappers && wrappers.length > 0) {
			const elements = document.querySelectorAll(wrappers);
			elements.forEach((element) => {
				if (KTDom.getCssProp(element as HTMLElement, 'display') === 'none') {
					return;
				}
				height -= this._getElementSpacing(element as HTMLElement);
			});
		}

		if (offset && offset.length > 0) {
			height -= parseInt(offset);
		}

		return height.toString() + 'px';
	}

	protected _getElementHeight(element: HTMLElement): number {
		let height = 0;

		if (!element) {
			return height;
		}

		const computedStyle = window.getComputedStyle(element);
		if (computedStyle.height) {
			height += parseInt(computedStyle.height);
		}
		if (computedStyle.marginTop) {
			height += parseInt(computedStyle.marginTop);
		}
		if (computedStyle.marginBottom) {
			height += parseInt(computedStyle.marginBottom);
		}
		if (computedStyle.borderTopWidth) {
			height += parseInt(computedStyle.borderTopWidth);
		}
		if (computedStyle.borderBottomWidth) {
			height += parseInt(computedStyle.borderBottomWidth);
		}

		return height;
	}

	protected _getElementSpacing(element: HTMLElement): number {
		let spacing: number = 0;

		if (!element) {
			return spacing;
		}

		const computedStyle = window.getComputedStyle(element);
		if (computedStyle.marginTop) {
			spacing += parseInt(computedStyle.marginTop);
		}
		if (computedStyle.marginBottom) {
			spacing += parseInt(computedStyle.marginBottom);
		}
		if (computedStyle.paddingTop) {
			spacing += parseInt(computedStyle.paddingTop);
		}
		if (computedStyle.paddingBottom) {
			spacing += parseInt(computedStyle.paddingBottom);
		}
		if (computedStyle.borderTopWidth) {
			spacing += parseInt(computedStyle.borderTopWidth);
		}
		if (computedStyle.borderBottomWidth) {
			spacing += parseInt(computedStyle.borderBottomWidth);
		}

		return spacing;
	}

	protected _getHeightType(): string {
		if (this._getOption('minHeight')) {
			return 'min-height';
		}
		if (this._getOption('maxHeight')) {
			return 'max-height';
		} else {
			return 'height';
		}
	}

	protected _getHeightOption(): string {
		const heightType = this._getHeightType();

		if (heightType == 'min-height') {
			return this._getOption('minHeight') as string;
		}
		if (heightType == 'max-height') {
			return this._getOption('maxHeight') as string;
		} else {
			return this._getOption('height') as string;
		}
	}

	public update(): void {
		return this._update();
	}

	public getHeight(): string {
		return this._getHeight();
	}

	public static getInstance(element: HTMLElement): KTScrollable {
		if (!element) return null;

		if (KTData.has(element, 'scrollable')) {
			return KTData.get(element, 'scrollable') as KTScrollable;
		}

		if (element.getAttribute('data-kt-scrollable')) {
			return new KTScrollable(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTScrollableConfigInterface,
	): KTScrollable {
		return this.getInstance(element) || new KTScrollable(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-scrollable]');

		elements.forEach((element) => {
			new KTScrollable(element as HTMLElement);
		});
	}

	public static handleResize(): void {
		window.addEventListener('resize', () => {
			let timer;

			KTUtils.throttle(
				timer,
				function () {
					// Locate and update scrollable instances on window resize
					const elements = document.querySelectorAll(
						'[data-kt-scrollable-initialized]',
					);
					elements.forEach((element) => {
						KTScrollable.getInstance(element as HTMLElement)?.update();
					});
				},
				200,
			);
		});
	}

	public static init(): void {
		KTScrollable.createInstances();

		if (window.KT_SCROLLABLE_INITIALIZED !== true) {
			KTScrollable.handleResize();

			window.KT_SCROLLABLE_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTScrollable = KTScrollable;
}
