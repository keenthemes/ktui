/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTDrawerInterface, KTDrawerConfigInterface } from './types';

declare global {
	interface Window {
		KT_DRAWER_INITIALIZED: boolean;
		KTDrawer: typeof KTDrawer;
	}
}

export class KTDrawer extends KTComponent implements KTDrawerInterface {
	protected override _name: string = 'drawer';
	protected override _defaultConfig: KTDrawerConfigInterface = {
		zindex: '100',
		enable: true,
		class: '',
		shownClass: 'flex',
		hiddenClass: 'hidden',
		backdrop: true,
		backdropClass: 'kt-drawer-backdrop',
		backdropStatic: false,
		keyboard: true,
		disableScroll: true,
		persistent: false,
		container: '',
		focus: true,
	};
	protected override _config: KTDrawerConfigInterface = this._defaultConfig;
	protected _isOpen: boolean = false;
	protected _isTransitioning: boolean = false;
	protected _backdropElement: HTMLElement | null = null;
	protected _relatedTarget: HTMLElement | null = null;

	constructor(element: HTMLElement, config?: KTDrawerConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);
		this._handleClose();
		this._update();
		this._handleContainer();
	}

	protected _handleClose(): void {
		if (!this._element) return;
		KTEventHandler.on(this._element, '[data-kt-drawer-hide]', 'click', () => {
			this._hide();
		});
	}

	protected _toggle(relatedTarget?: HTMLElement): void {
		const payload = { cancel: false };
		this._fireEvent('toggle', payload);
		this._dispatchEvent('toggle', payload);
		if (payload.cancel === true) {
			return;
		}

		if (this._isOpen === true) {
			this._hide();
		} else {
			this._show(relatedTarget);
		}
	}

	protected _show(relatedTarget?: HTMLElement): void {
		if (this._isOpen || this._isTransitioning) {
			return;
		}

		const payload = { cancel: false };
		this._fireEvent('show', payload);
		this._dispatchEvent('show', payload);
		if (payload.cancel === true) {
			return;
		}

		KTDrawer.hide();

		if (this._getOption('backdrop') === true) this._createBackdrop();

		if (relatedTarget) this._relatedTarget = relatedTarget;

		if (!this._element) return;
		this._isTransitioning = true;
		this._element.classList.remove(this._getOption('hiddenClass') as string);
		this._element.classList.add(this._getOption('shownClass') as string);
		this._element.setAttribute('role', 'dialog');
		this._element.setAttribute('aria-modal', 'true');
		this._element.setAttribute('tabindex', '-1');

		const zindex: number = parseInt(this._getOption('zindex') as string);
		if (zindex > 0) {
			this._element.style.zIndex = `${zindex}`;
		}

		if (this._getOption('disableScroll')) {
			document.body.style.overflow = 'hidden';
		}

		KTDom.reflow(this._element);
		this._element.classList.add('open');

		KTDom.transitionEnd(this._element, () => {
			this._isTransitioning = false;
			this._isOpen = true;

			if (this._getOption('focus') === true) {
				this._autoFocus();
			}

			this._fireEvent('shown');
			this._dispatchEvent('shown');
		});
	}

	protected _hide(): void {
		if (!this._element) return;
		if (this._isOpen === false || this._isTransitioning) {
			return;
		}

		const payload = { cancel: false };
		this._fireEvent('hide', payload);
		this._dispatchEvent('hide', payload);
		if (payload.cancel === true) {
			return;
		}

		this._isTransitioning = true;
		this._element.removeAttribute('role');
		this._element.removeAttribute('aria-modal');
		this._element.removeAttribute('tabindex');
		if (this._getOption('disableScroll')) {
			document.body.style.overflow = '';
		}

		KTDom.reflow(this._element);
		this._element.classList.remove('open');

		if (this._getOption('backdrop') === true) {
			this._deleteBackdrop();
		}

		KTDom.transitionEnd(this._element, () => {
			if (!this._element) return;

			this._isTransitioning = false;
			this._isOpen = false;
			this._element.classList.add(this._getOption('hiddenClass') as string);
			this._element.classList.remove(this._getOption('shownClass') as string);
			this._element.style.zIndex = '';

			this._fireEvent('hidden');
			this._dispatchEvent('hidden');
		});
	}

	protected _update(): void {
		if ((this._getOption('class') as string)?.length > 0) {
			if (this.isEnabled()) {
				KTDom.addClass(this._element, this._getOption('class') as string);
			} else {
				KTDom.removeClass(this._element, this._getOption('class') as string);
			}
		}
	}

	protected _handleContainer(): void {
		if (this._getOption('container')) {
			if (this._getOption('container') === 'body') {
				document.body.appendChild(this._element);
			} else {
				document
					.querySelector(this._getOption('container') as string)
					?.appendChild(this._element);
			}
		}
	}

	protected _autoFocus(): void {
		if (!this._element) return;
		const input: HTMLInputElement | null = this._element.querySelector(
			'[data-kt-drawer-focus]',
		);
		if (!input) return;
		else input.focus();
	}

	protected _createBackdrop(): void {
		if (!this._element) return;

		const zindex: number = parseInt(this._getOption('zindex') as string);

		this._backdropElement = document.createElement('DIV');
		this._backdropElement.style.zIndex = (zindex - 1).toString();
		this._backdropElement.setAttribute('data-kt-drawer-backdrop', 'true');
		document.body.append(this._backdropElement);
		KTDom.reflow(this._backdropElement);
		KTDom.addClass(
			this._backdropElement,
			this._getOption('backdropClass') as string,
		);

		this._backdropElement.addEventListener('click', (event: Event) => {
			event.preventDefault();
			if (this._getOption('backdropStatic') === false) {
				this._hide();
			}
		});
	}

	protected _deleteBackdrop(): void {
		if (!this._backdropElement) return;

		KTDom.reflow(this._backdropElement);
		this._backdropElement.style.opacity = '0';

		KTDom.transitionEnd(this._backdropElement, () => {
			if (!this._backdropElement) return;
			KTDom.remove(this._backdropElement);
		});
	}

	protected _isEnabled(): boolean {
		return KTUtils.stringToBoolean(this._getOption('enable'));
	}

	public toggle(): void {
		return this._toggle();
	}

	public show(relatedTarget?: HTMLElement): void {
		return this._show(relatedTarget);
	}

	public hide(): void {
		return this._hide();
	}

	public update(): void {
		return this._update();
	}

	public getRelatedTarget(): HTMLElement | null {
		return this._relatedTarget;
	}

	public isOpen(): boolean {
		return this._isOpen;
	}

	public isEnabled(): boolean {
		return this._isEnabled();
	}

	public static getInstance(element: HTMLElement): KTDrawer {
		if (!element) return null;

		if (KTData.has(element, 'drawer')) {
			return KTData.get(element, 'drawer') as KTDrawer;
		}

		if (element.getAttribute('data-kt-drawer-initialized') === 'true') {
			return new KTDrawer(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTDrawerConfigInterface,
	): KTDrawer {
		return this.getInstance(element) || new KTDrawer(element, config);
	}

	public static hide(): void {
		const elements = document.querySelectorAll('[data-kt-drawer-initialized]');

		elements.forEach((element) => {
			const drawer = KTDrawer.getInstance(element as HTMLElement);

			if (drawer && drawer.isOpen()) {
				drawer.hide();
			}
		});
	}

	public static handleResize(): void {
		window.addEventListener('resize', () => {
			let timer;

			KTUtils.throttle(
				timer,
				() => {
					document
						.querySelectorAll('[data-kt-drawer-initialized]')
						.forEach((element) => {
							const drawer = KTDrawer.getInstance(element as HTMLElement);
							drawer.update();

							if (drawer && drawer.isOpen() && !drawer.isEnabled()) {
								drawer.hide();
							}
						});
				},
				200,
			);
		});
	}

	public static handleToggle(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-drawer-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.stopPropagation();

				const selector = target.getAttribute('data-kt-drawer-toggle');
				if (!selector) return;

				const drawerEl = document.querySelector(selector);
				const drawer = KTDrawer.getInstance(drawerEl as HTMLElement);
				if (drawer) {
					drawer.toggle();
				}
			},
		);
	}

	public static handleDismiss(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-drawer-dismiss]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.stopPropagation();

				const modalElement = target.closest(
					'[data-kt-drawer="true"]',
				) as HTMLElement;
				if (modalElement) {
					const modal = KTDrawer.getInstance(modalElement);
					if (modal) {
						modal.hide();
					}
				}
			},
		);
	}

	public static handleClickAway() {
		document.addEventListener('click', (event: Event) => {
			const drawerEl = document.querySelector(
				'.open[data-kt-drawer-initialized]',
			);
			if (!drawerEl) return;

			const drawer = KTDrawer.getInstance(drawerEl as HTMLElement);
			if (!drawer) return;

			if (drawer.getOption('persistent')) return;

			if (drawer.getOption('backdrop')) return;

			if (
				drawerEl !== event.target &&
				drawer.getRelatedTarget() !== event.target &&
				drawerEl.contains(event.target as HTMLElement) === false
			) {
				drawer.hide();
			}
		});
	}

	public static handleKeyword() {
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			const drawerEl = document.querySelector(
				'.open[data-kt-drawer-initialized]',
			);
			const drawer = KTDrawer.getInstance(drawerEl as HTMLElement);
			if (!drawer) {
				return;
			}

			// if esc key was not pressed in combination with ctrl or alt or shift
			if (
				event.key === 'Escape' &&
				!(event.ctrlKey || event.altKey || event.shiftKey)
			) {
				drawer.hide();
			}

			if (event.code === 'Tab' && !event.metaKey) {
				return;
			}
		});
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-drawer]');

		elements.forEach((element) => {
			new KTDrawer(element as HTMLElement);
		});
	}

	public static init(): void {
		KTDrawer.createInstances();

		if (window.KT_DRAWER_INITIALIZED !== true) {
			KTDrawer.handleToggle();
			KTDrawer.handleDismiss();
			KTDrawer.handleResize();
			KTDrawer.handleClickAway();
			KTDrawer.handleKeyword();
			window.KT_DRAWER_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTDrawer = KTDrawer;
}
