/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTTabsInterface, KTTabsConfigInterface } from './types';

declare global {
	interface Window {
		KT_TABS_INITIALIZED: boolean;
		KTTabs: typeof KTTabs;
	}
}

export class KTTabs extends KTComponent implements KTTabsInterface {
	protected override _name: string = 'tabs';
	protected override _defaultConfig: KTTabsConfigInterface = {
		hiddenClass: 'hidden',
	};
	protected override _config: KTTabsConfigInterface = this._defaultConfig;
	protected _currentTabElement: HTMLElement | null = null;
	protected _currentContentElement: HTMLElement | null = null;
	protected _lastTabElement: HTMLElement | null = null;
	protected _lastContentElement: HTMLElement | null = null;
	protected _tabElements: NodeListOf<HTMLElement> | null = null;
	protected _isTransitioning: boolean = false;

	constructor(element: HTMLElement, config?: KTTabsConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;
		this._tabElements = this._element.querySelectorAll('[data-kt-tab-toggle]');
		this._currentTabElement = this._element.querySelector(
			'.active[data-kt-tab-toggle]'
		);
		this._currentContentElement =
			(this._currentTabElement &&
				(KTDom.getElement(
					this._currentTabElement.getAttribute('data-kt-tab-toggle')
				) ||
					KTDom.getElement(this._currentTabElement.getAttribute('href')))) ||
			null;

		this._handlers();
	}

	protected _handlers(): void {
		if (!this._element) return;

		KTEventHandler.on(
			this._element,
			'[data-kt-tab-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.preventDefault();
				this._show(target);
			}
		);
	}

	protected _show(tabElement: HTMLElement): void {
		if (this._isShown(tabElement) || this._isTransitioning) return;

		const payload = { cancel: false };
		this._fireEvent('show', payload);
		this._dispatchEvent('show', payload);
		if (payload.cancel === true) {
			return;
		}

		this._currentTabElement?.classList.remove('active');
		this._currentTabElement?.classList.remove('selected');
		this._currentContentElement?.classList.add(
			this._getOption('hiddenClass') as string
		);
		this._lastTabElement = this._currentTabElement;
		this._getDropdownToggleElement(this._lastTabElement)?.classList.remove(
			'active'
		);

		this._lastContentElement = this._currentContentElement;
		this._currentTabElement = tabElement;
		this._currentContentElement =
			KTDom.getElement(tabElement.getAttribute('data-kt-tab-toggle')) ||
			KTDom.getElement(tabElement.getAttribute('href'));
		this._currentTabElement?.classList.add('active');
		this._currentTabElement?.classList.add('selected');
		this._currentContentElement?.classList.remove(
			this._getOption('hiddenClass') as string
		);
		this._getDropdownToggleElement(this._currentTabElement)?.classList.add(
			'active'
		);

		this._currentContentElement.style.opacity = '0';
		KTDom.reflow(this._currentContentElement);
		this._currentContentElement.style.opacity = '1';

		KTDom.transitionEnd(this._currentContentElement, () => {
			this._isTransitioning = false;
			this._currentContentElement.style.opacity = '';

			this._fireEvent('shown');
			this._dispatchEvent('shown');
		});
	}

	protected _getDropdownToggleElement(element: HTMLElement): HTMLElement {
		const containerElement = element.closest(
			'[data-kt-dropdown-initialized],[data-kt-menu-initialized]'
		) as HTMLElement;

		if (containerElement) {
			return containerElement.querySelector(
				'[data-kt-dropdown-toggle], [data-kt-menu-toggle]'
			);
		} else {
			return null;
		}
	}

	protected _isShown(tabElement: HTMLElement): boolean {
		return tabElement.classList.contains('active');
	}

	public isShown(tabElement: HTMLElement): boolean {
		return this._isShown(tabElement);
	}

	public show(tabElement: HTMLElement): void {
		return this._show(tabElement);
	}

	public static keyboardArrow(): void {}

	public static keyboardJump(): void {}

	public static handleAccessibility(): void {}

	public static getInstance(element: HTMLElement): KTTabs {
		if (!element) return null;

		if (KTData.has(element, 'tabs')) {
			return KTData.get(element, 'tabs') as KTTabs;
		}

		if (element.getAttribute('data-kt-tabs')) {
			return new KTTabs(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTTabsConfigInterface
	): KTTabs {
		return this.getInstance(element) || new KTTabs(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-tabs]');

		elements.forEach((element) => {
			new KTTabs(element as HTMLElement);
		});
	}

	public static init(): void {
		KTTabs.createInstances();

		if (window.KT_TABS_INITIALIZED !== true) {
			KTTabs.handleAccessibility();
			window.KT_TABS_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTTabs = KTTabs;
}
