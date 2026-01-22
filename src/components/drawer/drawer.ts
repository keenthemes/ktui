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

		if (KTData.has(element as HTMLElement, this._name)) {
			return;
		}

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

		// If drawer needs to be in front of backdrop, ensure it's in body (for proper z-index stacking)
		// This ensures the drawer and backdrop are in the same stacking context
		if (this._getOption('container') === 'body' && this._element.parentElement !== document.body) {
			// Store original parent for restoration when hiding
			if (!this._element.hasAttribute('data-kt-drawer-original-parent-id')) {
				const originalParent = this._element.parentElement;
				if (originalParent && originalParent !== document.body) {
					this._element.setAttribute('data-kt-drawer-original-parent-id', originalParent.id || '');
					// Store a reference to find the parent later (using closest to find Livewire component or header)
					const livewireComponent = originalParent.closest('[wire\\:id]');
					const header = originalParent.closest('header#header');
					if (livewireComponent) {
						this._element.setAttribute('data-kt-drawer-original-wire-id', (livewireComponent as HTMLElement).getAttribute('wire:id') || '');
					}
					if (header) {
						this._element.setAttribute('data-kt-drawer-original-in-header', 'true');
					}
				}
			}
			document.body.appendChild(this._element);
		}

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

			// Note: We don't move drawer back to original location here
			// Livewire will handle DOM structure on next navigation, and drawer will be reinitialized
			// in its original location from the persisted component HTML

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
				// Check if drawer is in a persisted Livewire component (like header with @persist)
				// If so, don't move it to body - keep it in place so Livewire can preserve it
				// This follows the same pattern as dropdowns/menus which work with wire:navigate
				const originalParent = this._element.parentNode;
				const isInPersistedComponent = originalParent &&
					((originalParent as HTMLElement).closest('[wire\\:id]') !== null ||
					 (originalParent as HTMLElement).closest('header#header') !== null);

				if (isInPersistedComponent) {
					// Don't move to body - keep in original location for Livewire persistence
					// Use fixed positioning to achieve the same visual effect
					// Ensure drawer has fixed positioning to work from its current location
					if (!this._element.style.position || this._element.style.position === 'static') {
						this._element.style.position = 'fixed';
					}
				} else {
					// Not in persisted component - safe to move to body (follows original behavior)
					document.body.appendChild(this._element);
				}
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

	public static getElement(reference: HTMLElement): HTMLElement {
		if (reference && reference.hasAttribute('data-kt-drawer-initialized'))
			return reference;

		const findElement =
			reference &&
			(reference.closest('[data-kt-drawer-initialized]') as HTMLElement);
		if (findElement) return findElement;

		// Fallback: look for parent with data-kt-drawer attribute
		if (reference) {
			const drawerContainer = reference.closest('[data-kt-drawer]') as HTMLElement;
			if (drawerContainer) return drawerContainer;
		}

		// If reference is a toggle button with a selector, find the drawer by selector
		// This handles cases where the toggle button is not a child of the drawer
		if (reference && reference.hasAttribute('data-kt-drawer-toggle')) {
			const selector = reference.getAttribute('data-kt-drawer-toggle');
			if (selector) {
				// Check both document and body (drawers with container="body" are moved to body)
				const drawerElInDoc = document.querySelector(selector);
				const drawerElInBody = document.body.querySelector(selector);
				const drawerEl = drawerElInDoc || drawerElInBody;
				if (drawerEl) return drawerEl as HTMLElement;
			}
		}

		return null;
	}

	/**
	 * Wait for an element to appear in the DOM using polling with MutationObserver fallback
	 * Useful for persisted Livewire components that may not be in DOM immediately
	 */
	public static waitForElement(selector: string, timeout: number = 2000): Promise<HTMLElement | null> {
		return new Promise((resolve) => {
			let resolved = false;

			const doResolve = (element: HTMLElement | null) => {
				if (!resolved) {
					resolved = true;
					resolve(element);
				}
			};

			// Check if element already exists
			const existing = document.querySelector(selector) || document.body.querySelector(selector);
			if (existing) {
				doResolve(existing as HTMLElement);
				return;
			}

			// Use polling for faster detection (check every 50ms)
			let attempts = 0;
			const maxAttempts = timeout / 50;
			const pollInterval = setInterval(() => {
				if (resolved) {
					clearInterval(pollInterval);
					return;
				}
				attempts++;
				const element = document.querySelector(selector) || document.body.querySelector(selector);
				if (element) {
					clearInterval(pollInterval);
					doResolve(element as HTMLElement);
					return;
				}
				if (attempts >= maxAttempts) {
					clearInterval(pollInterval);
					doResolve(null);
				}
			}, 50);

			// Also use MutationObserver as backup for immediate detection
			const observer = new MutationObserver(() => {
				if (resolved) {
					observer.disconnect();
					return;
				}
				const element = document.querySelector(selector) || document.body.querySelector(selector);
				if (element) {
					clearInterval(pollInterval);
					observer.disconnect();
					doResolve(element as HTMLElement);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});

			// Cleanup on timeout
			setTimeout(() => {
				if (!resolved) {
					clearInterval(pollInterval);
					observer.disconnect();
					doResolve(null);
				}
			}, timeout);
		});
	}

	public static getInstance(element: HTMLElement): KTDrawer {
		if (!element) return null;

		const drawerElement = KTDrawer.getElement(element);
		if (!drawerElement) {
			// If element is a toggle button and drawer element wasn't found, return null
			// The handleToggle() will handle waiting for the element to appear
			if (element.hasAttribute('data-kt-drawer-toggle')) {
			}
			return null;
		}

		if (KTData.has(drawerElement, 'drawer')) {
			return KTData.get(drawerElement, 'drawer') as KTDrawer;
		}

		if (drawerElement.getAttribute('data-kt-drawer-initialized') === 'true') {
			return new KTDrawer(drawerElement);
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

		// Add raw click listener to document.body to track all clicks
		document.body.addEventListener('click', (rawEvent: MouseEvent) => {
			const target = rawEvent.target as HTMLElement;
			if (target && target.hasAttribute('data-kt-drawer-toggle')) {
			}
		}, true); // Use capture phase to catch before any stopPropagation

		KTEventHandler.on(
			document.body,
			'[data-kt-drawer-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.stopPropagation();

				const selector = target.getAttribute('data-kt-drawer-toggle');
				if (!selector) return;

				// Try to get instance immediately
				const drawer = KTDrawer.getInstance(target);

				if (drawer) {
					drawer.toggle();
				} else {
					// Drawer element not found - wait for it to appear (handles persisted Livewire components)
					// Check if drawer exists in persisted components (might be in header that's persisted)
					const persistedHeader = document.querySelector('[wire\\:id]')?.closest('[wire\\:id]') || document.querySelector('header#header');
					const drawerInPersisted = persistedHeader ? persistedHeader.querySelector(selector) : null;

					// Wait longer for persisted components that may take time to render
					// Also check if drawer exists in persisted header component
					KTDrawer.waitForElement(selector, 5000).then((drawerElement) => {
						if (drawerElement) {
							// Initialize the drawer if not already initialized
							if (!KTData.has(drawerElement, 'drawer')) {
								new KTDrawer(drawerElement);
							}
							// Get instance and toggle
							const drawerInstance = KTDrawer.getInstance(drawerElement);
							if (drawerInstance) {
								drawerInstance.toggle();
							}
						} else {
							// Drawer never appeared - trigger a reinit to see if it helps
							// This handles cases where drawers are in persisted components that haven't rendered yet
							setTimeout(() => {
								KTDrawer.reinit();
								// Try one more time after reinit
								const drawerAfterReinit = document.querySelector(selector) || document.body.querySelector(selector);
								if (drawerAfterReinit) {
									if (!KTData.has(drawerAfterReinit as HTMLElement, 'drawer')) {
										new KTDrawer(drawerAfterReinit as HTMLElement);
									}
									const drawerInstance = KTDrawer.getInstance(drawerAfterReinit as HTMLElement);
									if (drawerInstance) {
										drawerInstance.toggle();
									}
								}
							}, 500);
						}
					});
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
		// Find all drawer elements - check both document and body (drawers with container="body" are moved there)
		const elementsInDoc = document.querySelectorAll('[data-kt-drawer]');
		const elementsInBody = document.body.querySelectorAll('[data-kt-drawer]');
		// Combine and deduplicate
		const allElements = new Set([...Array.from(elementsInDoc), ...Array.from(elementsInBody)]);
		const elements = Array.from(allElements);
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

	/**
	 * Force reinitialization of drawers by clearing KTData entries.
	 * Useful for Livewire wire:navigate where persisted elements need reinitialization.
	 */
	public static reinit(): void {
		// Follow the same simple pattern as KTDropdown.reinit()
		// Find all drawer elements - check both document and body (some may be moved to body)
		const elementsInDoc = document.querySelectorAll('[data-kt-drawer]');
		const elementsInBody = document.body.querySelectorAll('[data-kt-drawer]');
		// Combine and deduplicate
		const allElements = new Set([...Array.from(elementsInDoc), ...Array.from(elementsInBody)]);
		const elements = Array.from(allElements);


		// Clean up existing instances
		elements.forEach((element) => {
			try {
				// Get existing instance to clean up
				const instance = KTDrawer.getInstance(element as HTMLElement);
				if (instance && typeof instance.hide === 'function') {
					instance.hide(); // This will clean up backdrop and state
				}
				// Clear KTData entries
				const hadDrawer = KTData.has(element as HTMLElement, 'drawer');
				KTData.remove(element as HTMLElement, 'drawer');
				// Remove initialization attribute to allow fresh initialization
				element.removeAttribute('data-kt-drawer-initialized');
			} catch (e) {
				// Ignore errors for individual elements
			}
		});

		// Now create fresh instances
		KTDrawer.createInstances();

		// Always ensure handlers are set up (similar to KTMenu.init() behavior)
		// Event handlers use delegation so they persist, but we ensure they're attached
		KTDrawer.handleToggle();
		KTDrawer.handleDismiss();
		KTDrawer.handleResize();
		KTDrawer.handleClickAway();
		KTDrawer.handleKeyword();

	}
}

if (typeof window !== 'undefined') {
	window.KTDrawer = KTDrawer;
}
