/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	Instance as PopperInstance,
	createPopper,
	Placement,
	VirtualElement,
} from '@popperjs/core';
import KTDom from '../../helpers/dom';
import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTDropdownConfigInterface, KTDropdownInterface } from './types';

declare global {
	interface Window {
		KT_DROPDOWN_INITIALIZED: boolean;
		KTDropdown: typeof KTDropdown;
	}
}

export class KTDropdown extends KTComponent implements KTDropdownInterface {
	protected override _name: string = 'dropdown';
	protected override _defaultConfig: KTDropdownConfigInterface = {
		zindex: 105,
		hoverTimeout: 200,
		placement: 'bottom-start',
		placementRtl: 'bottom-end',
		permanent: false,
		dismiss: false,
		keyboard: true,
		trigger: 'click',
		attach: '',
		offset: '0px, 5px',
		offsetRtl: '0px, 5px',
		hiddenClass: 'hidden',
		container: '',
	};
	protected override _config: KTDropdownConfigInterface = this._defaultConfig;
	protected _disabled: boolean = false;
	protected _toggleElement: HTMLElement;
	protected _menuElement: HTMLElement;
	protected _isTransitioning: boolean = false;
	protected _isOpen: boolean = false;

	constructor(element: HTMLElement, config?: KTDropdownConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._toggleElement = this._element.querySelector(
			'[data-kt-dropdown-toggle]',
		) as HTMLElement;
		if (!this._toggleElement) return;
		this._menuElement = this._element.querySelector(
			'[data-kt-dropdown-menu]',
		) as HTMLElement;
		if (!this._menuElement) return;

		KTData.set(this._menuElement, 'dropdownElement', this._element);
		this._setupNestedDropdowns();
		this._handleContainer();
	}

	protected _handleContainer(): void {
		if (this._getOption('container')) {
			if (this._getOption('container') === 'body') {
				document.body.appendChild(this._menuElement);
			} else {
				document
					.querySelector(this._getOption('container') as string)
					?.appendChild(this._menuElement);
			}
		}
	}

	protected _setupNestedDropdowns(): void {
		const subDropdowns = this._menuElement.querySelectorAll(
			'[data-kt-dropdown-toggle]',
		);
		subDropdowns.forEach((subToggle) => {
			const subItem = subToggle.closest(
				'[data-kt-dropdown-item]',
			) as HTMLElement;
			const subMenu = subToggle
				.closest('.kt-menu-item')
				?.querySelector('[data-kt-dropdown-menu]');
			if (subItem && subMenu) {
				new KTDropdown(subItem);
			}
		});
	}

	protected _click(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		if (this._disabled) return;

		if (this._getOption('trigger') !== 'click') return;

		this._toggle();
	}

	protected _mouseover(event: MouseEvent): void {
		if (this._disabled) return;

		if (this._getOption('trigger') !== 'hover') return;

		if (KTData.get(this._element, 'hover') === '1') {
			clearTimeout(KTData.get(this._element, 'timeout') as number);
			KTData.remove(this._element, 'hover');
			KTData.remove(this._element, 'timeout');
		}

		this._show();
	}

	protected _mouseout(event: MouseEvent): void {
		if (this._disabled) return;

		if (this._getOption('trigger') !== 'hover') return;

		const relatedTarget = event.relatedTarget as HTMLElement;
		const isWithinDropdown = this._element.contains(relatedTarget);

		if (isWithinDropdown) return;

		const timeout = setTimeout(
			() => {
				if (KTData.get(this._element, 'hover') === '1') {
					this._hide();
				}
			},
			parseInt(this._getOption('hoverTimeout') as string),
		);

		KTData.set(this._element, 'hover', '1');
		KTData.set(this._element, 'timeout', timeout);
	}

	protected _toggle(): void {
		if (this._isOpen) {
			this._hide();
		} else {
			this._show();
		}
	}

	protected _show(): void {
		if (this._isOpen || this._isTransitioning) return;

		const payload = { cancel: false };
		this._fireEvent('show', payload);
		this._dispatchEvent('show', payload);
		if (payload.cancel) return;

		KTDropdown.hide(this._element);

		let zIndex: number = parseInt(this._getOption('zindex') as string);
		const parentZindex: number = KTDom.getHighestZindex(this._element);

		if (parentZindex !== null && parentZindex >= zIndex) {
			zIndex = parentZindex + 1;
		}
		if (zIndex > 0) {
			this._menuElement.style.zIndex = zIndex.toString();
		}

		this._menuElement.style.display = 'block';
		this._menuElement.style.opacity = '0';
		KTDom.reflow(this._menuElement);
		this._menuElement.style.opacity = '1';

		this._menuElement.classList.remove(
			this._getOption('hiddenClass') as string,
		);
		this._toggleElement.classList.add('active');
		this._menuElement.classList.add('open');
		this._element.classList.add('open');

		this._initPopper();

		KTDom.transitionEnd(this._menuElement, () => {
			this._isTransitioning = false;
			this._isOpen = true;

			this._fireEvent('shown');
			this._dispatchEvent('shown');
		});
	}

	protected _hide(): void {
		if (!this._isOpen || this._isTransitioning) return;

		const payload = { cancel: false };
		this._fireEvent('hide', payload);
		this._dispatchEvent('hide', payload);
		if (payload.cancel) return;

		this._menuElement.style.opacity = '1';
		KTDom.reflow(this._menuElement);
		this._menuElement.style.opacity = '0';
		this._menuElement.classList.remove('open');
		this._toggleElement.classList.remove('active');
		this._element.classList.remove('open');

		KTDom.transitionEnd(this._menuElement, () => {
			this._isTransitioning = false;
			this._isOpen = false;

			this._menuElement.classList.add(this._getOption('hiddenClass') as string);
			this._menuElement.style.display = '';
			this._menuElement.style.zIndex = '';

			this._destroyPopper();

			this._fireEvent('hidden');
			this._dispatchEvent('hidden');
		});
	}

	public dispose(): void {
		this._destroyPopper();
		super.dispose();
	}

	protected _initPopper(): void {
		const isRtl = KTDom.isRTL();
		let reference: HTMLElement;
		const attach = this._getOption('attach') as string;

		if (attach) {
			reference =
				attach === 'parent'
					? (this._toggleElement.parentNode as HTMLElement)
					: (document.querySelector(attach) as HTMLElement);
		} else {
			reference = this._toggleElement;
		}

		if (reference) {
			const popper = createPopper(
				reference as Element | VirtualElement,
				this._menuElement,
				this._getPopperConfig(),
			);
			KTData.set(this._element, 'popper', popper);
		}
	}

	protected _destroyPopper(): void {
		if (KTData.has(this._element, 'popper')) {
			(KTData.get(this._element, 'popper') as PopperInstance).destroy();
			KTData.remove(this._element, 'popper');
		}
	}

	protected _isDropdownOpen(): boolean {
		return (
			this._element.classList.contains('open') &&
			this._menuElement.classList.contains('open')
		);
	}

	protected _getPopperConfig(): object {
		const isRtl = KTDom.isRTL();
		let placement = this._getOption('placement') as Placement;
		if (isRtl && this._getOption('placementRtl')) {
			placement = this._getOption('placementRtl') as Placement;
		}

		let offsetValue = this._getOption('offset');
		if (isRtl && this._getOption('offsetRtl')) {
			offsetValue = this._getOption('offsetRtl') as Placement;
		}
		const offset = offsetValue
			? offsetValue
					.toString()
					.split(',')
					.map((value) => parseInt(value.trim(), 10))
			: [0, 0];

		const strategy =
			this._getOption('overflow') === true ? 'absolute' : 'fixed';
		const altAxis = this._getOption('flip') !== false;
		return {
			placement: placement,
			strategy: strategy,
			modifiers: [
				{
					name: 'offset',
					options: { offset: offset },
				},
				{
					name: 'preventOverflow',
					options: { altAxis: altAxis },
				},
				{
					name: 'flip',
					options: { flipVariations: false },
				},
			],
		};
	}

	protected _getToggleElement(): HTMLElement {
		return this._toggleElement;
	}

	protected _getContentElement(): HTMLElement {
		return this._menuElement;
	}

	// General Methods
	public click(event: Event): void {
		this._click(event);
	}

	public mouseover(event: MouseEvent): void {
		this._mouseover(event);
	}

	public mouseout(event: MouseEvent): void {
		this._mouseout(event);
	}

	public show(): void {
		this._show();
	}

	public hide(): void {
		this._hide();
	}

	public toggle(): void {
		this._toggle();
	}

	public getToggleElement(): HTMLElement {
		return this._toggleElement;
	}

	public getContentElement(): HTMLElement {
		return this._menuElement;
	}

	public isPermanent(): boolean {
		return this._getOption('permanent') as boolean;
	}

	public disable(): void {
		this._disabled = true;
	}

	public enable(): void {
		this._disabled = false;
	}

	public isOpen(): boolean {
		return this._isDropdownOpen();
	}

	// Static Methods
	public static getElement(reference: HTMLElement): HTMLElement {
		if (reference && reference.hasAttribute('data-kt-dropdown'))
			return reference;

		const findElement =
			reference && (reference.closest('[data-kt-dropdown]') as HTMLElement);
		if (findElement) return findElement;

		if (
			reference &&
			reference.hasAttribute('data-kt-dropdown-menu') &&
			KTData.has(reference, 'dropdownElement')
		) {
			return KTData.get(reference, 'dropdownElement') as HTMLElement;
		}

		return null;
	}

	public static getInstance(element: HTMLElement): KTDropdown {
		element = this.getElement(element);

		if (!element) return null;

		if (KTData.has(element, 'dropdown')) {
			return KTData.get(element, 'dropdown') as KTDropdown;
		}

		if (element.getAttribute('data-kt-dropdown')) {
			return new KTDropdown(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTDropdownConfigInterface,
	): KTDropdown {
		return this.getInstance(element) || new KTDropdown(element, config);
	}

	public static update(): void {
		document
			.querySelectorAll('.open[data-kt-dropdown-initialized]')
			.forEach((item) => {
				if (KTData.has(item as HTMLElement, 'popper')) {
					(
						KTData.get(item as HTMLElement, 'popper') as PopperInstance
					).forceUpdate();
				}
			});
	}

	public static hide(skipElement?: HTMLElement): void {
		document
			.querySelectorAll(
				'.open[data-kt-dropdown-initialized]:not([data-kt-dropdown-permanent="true"])',
			)
			.forEach((item) => {
				if (skipElement && (skipElement === item || item.contains(skipElement)))
					return;

				const dropdown = KTDropdown.getInstance(item as HTMLElement);
				if (dropdown) dropdown.hide();
			});
	}

	public static handleClickAway(): void {
		document.addEventListener('click', (event: Event) => {
			document
				.querySelectorAll(
					'.open[data-kt-dropdown-initialized]:not([data-kt-dropdown-permanent="true"])',
				)
				.forEach((element) => {
					const dropdown = KTDropdown.getInstance(element as HTMLElement);
					if (!dropdown) return;

					const contentElement = dropdown.getContentElement();
					const toggleElement = dropdown.getToggleElement();

					if (
						toggleElement === event.target ||
						toggleElement.contains(event.target as HTMLElement) ||
						contentElement === event.target ||
						contentElement.contains(event.target as HTMLElement)
					) {
						return;
					}

					dropdown.hide();
				});
		});
	}

	public static handleKeyboard(): void {
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			const dropdownEl = document.querySelector(
				'.open[data-kt-dropdown-initialized]',
			);
			const dropdown = KTDropdown.getInstance(dropdownEl as HTMLElement);
			if (!dropdown || !dropdown._getOption('keyboard')) return;

			if (
				event.key === 'Escape' &&
				!(event.ctrlKey || event.altKey || event.shiftKey)
			) {
				dropdown.hide();
			}
		});
	}

	public static handleMouseover(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-dropdown-toggle], [data-kt-dropdown-menu]',
			'mouseover',
			(event: Event, target: HTMLElement) => {
				const dropdown = KTDropdown.getInstance(target);
				if (dropdown && dropdown._getOption('trigger') === 'hover') {
					dropdown.mouseover(event as MouseEvent);
				}
			},
		);
	}

	public static handleMouseout(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-dropdown-toggle], [data-kt-dropdown-menu]',
			'mouseout',
			(event: Event, target: HTMLElement) => {
				const dropdown = KTDropdown.getInstance(target);
				if (dropdown && dropdown._getOption('trigger') === 'hover') {
					dropdown.mouseout(event as MouseEvent);
				}
			},
		);
	}

	public static handleClick(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-dropdown-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				const dropdown = KTDropdown.getInstance(target);
				if (dropdown) {
					dropdown.click(event);
				}
			},
		);
	}

	public static handleDismiss(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-dropdown-dismiss]',
			'click',
			(event: Event, target: HTMLElement) => {
				const dropdown = KTDropdown.getInstance(target);
				if (dropdown) {
					dropdown.hide();
				}
			},
		);
	}

	public static initHandlers(): void {
		this.handleClickAway();
		this.handleKeyboard();
		this.handleMouseover();
		this.handleMouseout();
		this.handleClick();
		this.handleDismiss();
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-dropdown]');
		elements.forEach((element) => {
			new KTDropdown(element as HTMLElement);
		});
	}

	public static init(): void {
		KTDropdown.createInstances();

		if (window.KT_DROPDOWN_INITIALIZED !== true) {
			KTDropdown.initHandlers();
			window.KT_DROPDOWN_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTDropdown = KTDropdown;
}
