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
import { KTContextMenuConfigInterface, KTContextMenuInterface } from './types';

declare global {
	interface Window {
		KT_CONTEXT_MENU_INITIALIZED: boolean;
		KTContextMenu: typeof KTContextMenu;
	}
}

type Point = { x: number; y: number };

export class KTContextMenu
	extends KTComponent
	implements KTContextMenuInterface
{
	protected override _name = 'context-menu';
	protected override _defaultConfig: KTContextMenuConfigInterface = {
		zindex: 105,
		placement: 'right-start',
		placementRtl: 'left-start',
		permanent: false,
		dismiss: true,
		keyboard: true,
		offset: '0px, 4px',
		offsetRtl: '0px, 4px',
		hiddenClass: 'hidden',
		container: '',
		preventNativeMenu: true,
		flip: true,
		overflow: false,
	};
	protected override _config: KTContextMenuConfigInterface =
		this._defaultConfig;
	protected _menuElement: HTMLElement;
	protected _targetElement: HTMLElement;
	protected _isTransitioning = false;
	protected _isOpen = false;
	protected _shownAt = 0;
	protected _lastPoint: Point = { x: 0, y: 0 };

	constructor(element: HTMLElement, config?: KTContextMenuConfigInterface) {
		super();

		if (KTData.has(element, this._name)) return;

		this._init(element);
		this._buildConfig(config);
		if (!this._element) return;

		this._targetElement = this._resolveTargetElement(this._element);
		if (!this._targetElement) return;

		this._menuElement = this._resolveMenuElement(this._element);
		if (!this._menuElement) return;

		KTData.set(this._menuElement, 'contextMenuElement', this._element);
		this._setupNestedSubmenus();
		this._handleContainer();
	}

	protected _resolveTargetElement(root: HTMLElement): HTMLElement {
		const selector = root.getAttribute('data-kt-context-menu-target') || '';
		if (selector) {
			const target = document.querySelector(selector) as HTMLElement | null;
			if (target) return target;
		}

		const localTarget = root.querySelector(
			'[data-kt-context-menu-trigger]',
		) as HTMLElement | null;
		const localToggle = root.querySelector(
			'[data-kt-context-menu-toggle]',
		) as HTMLElement | null;
		return localTarget || localToggle || root;
	}

	protected _resolveMenuElement(root: HTMLElement): HTMLElement {
		const menu = root.querySelector(
			'[data-kt-context-menu-menu]',
		) as HTMLElement | null;
		return menu;
	}

	protected _handleContainer(): void {
		const container = this._getOption('container');
		if (!container) return;

		if (container === 'body') {
			document.body.appendChild(this._menuElement);
		} else {
			document
				.querySelector(container as string)
				?.appendChild(this._menuElement);
		}
	}

	protected _setupNestedSubmenus(): void {
		const submenus = this._menuElement.querySelectorAll(
			'[data-kt-context-menu]',
		);
		submenus.forEach((submenu) => {
			new KTContextMenu(submenu as HTMLElement);
		});
	}

	protected _updatePoint(x: number, y: number): void {
		this._lastPoint = { x, y };
	}

	protected _toggleAtEvent(event: MouseEvent): void {
		if (this._isOpen) {
			this._hide();
			return;
		}

		this._showAt(event.clientX, event.clientY);
	}

	protected _showAtEvent(event: MouseEvent): void {
		event.stopPropagation();
		if ((this._getOption('preventNativeMenu') as boolean) === true) {
			event.preventDefault();
		}

		this._toggleAtEvent(event);
	}

	protected _showAt(x: number, y: number): void {
		if (this._isOpen || this._isTransitioning) return;

		const payload = { cancel: false };
		this._fireEvent('show', payload);
		this._dispatchEvent('show', payload);
		if (payload.cancel) return;

		KTContextMenu.hide(this._element);
		this._updatePoint(x, y);

		let zIndex = parseInt(this._getOption('zindex') as string, 10);
		const parentZindex = KTDom.getHighestZindex(this._targetElement);
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
		this._menuElement.classList.add('open');
		this._element.classList.add('open');

		this._initPopper();

		KTDom.transitionEnd(this._menuElement, () => {
			this._isTransitioning = false;
			this._isOpen = true;
			this._fireEvent('shown');
			this._dispatchEvent('shown');
		});
		this._shownAt = Date.now();
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

	protected _getVirtualReference(): VirtualElement {
		const point = this._lastPoint;
		return {
			getBoundingClientRect: () =>
				({
					x: point.x,
					y: point.y,
					top: point.y,
					left: point.x,
					right: point.x,
					bottom: point.y,
					width: 0,
					height: 0,
					toJSON: () => ({}),
				}) as DOMRect,
		};
	}

	protected _initPopper(): void {
		const popper = createPopper(
			this._getVirtualReference(),
			this._menuElement,
			this._getPopperConfig(),
		);
		KTData.set(this._element, 'popper', popper);
	}

	protected _destroyPopper(): void {
		if (KTData.has(this._element, 'popper')) {
			(KTData.get(this._element, 'popper') as PopperInstance).destroy();
			KTData.remove(this._element, 'popper');
		}
	}

	protected _getPopperConfig(): object {
		const isRtl = KTDom.isRTL();
		let placement = this._getOption('placement') as Placement;
		if (isRtl && this._getOption('placementRtl')) {
			placement = this._getOption('placementRtl') as Placement;
		}

		let offsetValue = this._getOption('offset');
		if (isRtl && this._getOption('offsetRtl')) {
			offsetValue = this._getOption('offsetRtl') as string;
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
			placement,
			strategy,
			modifiers: [
				{ name: 'offset', options: { offset } },
				{ name: 'preventOverflow', options: { altAxis } },
				{ name: 'flip', options: { flipVariations: false } },
			],
		};
	}

	protected _isContextMenuOpen(): boolean {
		return (
			this._element.classList.contains('open') &&
			this._menuElement.classList.contains('open')
		);
	}

	public showAt(x: number, y: number): void {
		this._showAt(x, y);
	}

	public showAtEvent(event: MouseEvent): void {
		this._showAtEvent(event);
	}

	public hide(): void {
		this._hide();
	}

	public toggleAtEvent(event: MouseEvent): void {
		this._toggleAtEvent(event);
	}

	public isOpen(): boolean {
		return this._isContextMenuOpen();
	}

	public getMenuElement(): HTMLElement {
		return this._menuElement;
	}

	public getTargetElement(): HTMLElement {
		return this._targetElement;
	}

	public static getElement(reference: HTMLElement): HTMLElement {
		if (
			reference &&
			reference.hasAttribute('data-kt-context-menu-initialized')
		) {
			return reference;
		}

		const initializedParent = reference?.closest(
			'[data-kt-context-menu-initialized]',
		) as HTMLElement | null;
		if (initializedParent) return initializedParent;

		const container = reference?.closest(
			'[data-kt-context-menu]',
		) as HTMLElement | null;
		if (container) return container;

		if (
			reference &&
			reference.hasAttribute('data-kt-context-menu-menu') &&
			KTData.has(reference, 'contextMenuElement')
		) {
			return KTData.get(reference, 'contextMenuElement') as HTMLElement;
		}

		return null;
	}

	public static getInstance(element: HTMLElement): KTContextMenu {
		element = this.getElement(element);
		if (!element) return null;

		if (KTData.has(element, 'context-menu')) {
			return KTData.get(element, 'context-menu') as KTContextMenu;
		}

		if (element.getAttribute('data-kt-context-menu-initialized') === 'true') {
			return new KTContextMenu(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTContextMenuConfigInterface,
	): KTContextMenu {
		return this.getInstance(element) || new KTContextMenu(element, config);
	}

	public static update(): void {
		document
			.querySelectorAll('.open[data-kt-context-menu-initialized]')
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
				'.open[data-kt-context-menu-initialized]:not([data-kt-context-menu-permanent="true"])',
			)
			.forEach((item) => {
				if (skipElement && (skipElement === item || item.contains(skipElement)))
					return;
				const contextMenu = KTContextMenu.getInstance(item as HTMLElement);
				if (contextMenu) contextMenu.hide();
			});
	}

	public static handleOpen(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-context-menu-trigger], [data-kt-context-menu-target], [data-kt-context-menu]',
			'contextmenu',
			(event: Event, target: HTMLElement) => {
				const contextMenu = KTContextMenu.getInstance(target);
				if (contextMenu) {
					contextMenu.showAtEvent(event as MouseEvent);
				}
			},
		);
	}

	public static handleToggle(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-context-menu-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.preventDefault();
				event.stopPropagation();

				const contextMenu = KTContextMenu.getInstance(target);
				if (contextMenu) {
					const rect = target.getBoundingClientRect();
					contextMenu.showAt(rect.right, rect.top);
				}
			},
		);
	}

	public static handleClickAway(): void {
		document.addEventListener('click', (event: Event) => {
			document
				.querySelectorAll(
					'.open[data-kt-context-menu-initialized]:not([data-kt-context-menu-permanent="true"])',
				)
				.forEach((element) => {
					const contextMenu = KTContextMenu.getInstance(element as HTMLElement);
					if (!contextMenu) return;

					const menuElement = contextMenu.getMenuElement();
					const targetElement = contextMenu.getTargetElement();

					if (
						targetElement === event.target ||
						targetElement.contains(event.target as HTMLElement) ||
						menuElement === event.target ||
						menuElement.contains(event.target as HTMLElement)
					) {
						return;
					}

					contextMenu.hide();
				});
		});
	}

	public static handleKeyboard(): void {
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			const contextMenuEl = document.querySelector(
				'.open[data-kt-context-menu-initialized]',
			) as HTMLElement | null;
			const contextMenu = KTContextMenu.getInstance(
				contextMenuEl as HTMLElement,
			);
			if (!contextMenu || !contextMenu._getOption('keyboard')) return;

			if (
				event.key === 'Escape' &&
				!(event.ctrlKey || event.altKey || event.shiftKey)
			) {
				contextMenu.hide();
			}
		});
	}

	public static handleDismiss(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-context-menu-dismiss], [data-kt-dropdown-dismiss]',
			'click',
			(_event: Event, target: HTMLElement) => {
				const contextMenu = KTContextMenu.getInstance(target);
				if (contextMenu) {
					contextMenu.hide();
				}
			},
		);
	}

	public static initHandlers(): void {
		this.handleOpen();
		this.handleToggle();
		this.handleClickAway();
		this.handleKeyboard();
		this.handleDismiss();
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-context-menu]');
		elements.forEach((element) => {
			new KTContextMenu(element as HTMLElement);
		});
	}

	public static init(): void {
		KTContextMenu.createInstances();
		if (window.KT_CONTEXT_MENU_INITIALIZED !== true) {
			KTContextMenu.initHandlers();
			window.KT_CONTEXT_MENU_INITIALIZED = true;
		}
	}

	public static reinit(): void {
		const elements = document.querySelectorAll('[data-kt-context-menu]');
		elements.forEach((element) => {
			try {
				const instance = KTContextMenu.getInstance(element as HTMLElement);
				if (instance && typeof instance.hide === 'function') {
					instance.hide();
				}
				KTData.remove(element as HTMLElement, 'context-menu');
				KTData.remove(element as HTMLElement, 'popper');
				element.removeAttribute('data-kt-context-menu-initialized');
				const menu = element.querySelector('[data-kt-context-menu-menu]');
				if (menu) {
					KTData.remove(menu as HTMLElement, 'contextMenuElement');
				}
			} catch {
				// ignore per-element cleanup errors
			}
		});

		KTContextMenu.createInstances();
		KTContextMenu.initHandlers();
	}
}

if (typeof window !== 'undefined') {
	window.KTContextMenu = KTContextMenu;
}
