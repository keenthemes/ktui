/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTComponent from '../component';
import { KTStickyInterface, KTStickyConfigInterface } from './types';

declare global {
	interface Window {
		KT_STICKY_INITIALIZED: boolean;
		KTSticky: typeof KTSticky;
	}
}

/**
 * KSticky is a utility for making elements sticky (fixed) on scroll.
 * It supports dynamic offset, release/activate triggers, and responsive updates.
 *
 * Key methods:
 * - _getOffset: Calculates the offset for sticky activation, considering config and activate element.
 * - _process: Handles scroll logic and toggles sticky state.
 * - update/refresh: Public method to recalculate offset and update sticky state (call after DOM/layout changes).
 */
export class KTSticky extends KTComponent implements KTStickyInterface {
	protected override _name: string = 'sticky';
	protected override _defaultConfig: KTStickyConfigInterface = {
		target: 'body',
		name: '',
		class: '',
		top: '',
		start: '',
		end: '',
		width: '',
		zindex: '',
		offset: 0,
		reverse: false,
		release: '',
		activate: '',
	};
	protected override _config: KTStickyConfigInterface = this._defaultConfig;
	protected _targetElement: HTMLElement | Document | null = null;

	protected _attributeRoot: string;
	protected _eventTriggerState: boolean;
	protected _lastScrollTop: number;
	protected _releaseElement: HTMLElement;
	protected _activateElement: HTMLElement;
	protected _wrapperElement: HTMLElement;
	private _mutationObserver: MutationObserver | null = null;

	constructor(
		element: HTMLElement,
		config: KTStickyConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._releaseElement = KTDom.getElement(
			this._getOption('release') as string,
		);
		this._activateElement = KTDom.getElement(
			this._getOption('activate') as string,
		);
		this._wrapperElement = this._element.closest('[data-kt-sticky-wrapper]');
		this._attributeRoot = `data-kt-sticky-${this._getOption('name')}`;
		this._eventTriggerState = true;
		this._lastScrollTop = 0;

		const targetElement =
			this._getTarget() === 'body'
				? document
				: KTDom.getElement(this._getTarget());
		if (!targetElement) return;

		this._targetElement = targetElement;

		this._handlers();
		this._process();
		this._update();
		this._initMutationObserver();
	}

	private _getTarget(): string {
		return (
			(this._element.getAttribute('data-kt-sticky-target') as string) ||
			(this._getOption('target') as string)
		);
	}

	protected _handlers(): void {
		window.addEventListener('resize', () => {
			let timer;

			KTUtils.throttle(
				timer,
				() => {
					this._update();
				},
				200,
			);
		});

		this._targetElement.addEventListener('scroll', () => {
			this._process();
		});
	}

	protected _process(): void {
		const reverse = this._getOption('reverse');
		const offset = this._getOffset();

		if (offset < 0) {
			this._disable();
			return;
		}

		const st =
			this._getTarget() === 'body'
				? KTDom.getScrollTop()
				: (this._targetElement as HTMLElement).scrollTop;
		const release =
			this._releaseElement && KTDom.isPartiallyInViewport(this._releaseElement);

		// Release on reverse scroll mode
		if (reverse === true) {
			// Forward scroll mode
			if (st > offset && !release) {
				if (document.body.hasAttribute(this._attributeRoot) === false) {
					if (this._enable() === false) {
						return;
					}

					document.body.setAttribute(this._attributeRoot, 'on');
				}

				if (this._eventTriggerState === true) {
					const payload = { active: true };
					this._fireEvent('change', payload);
					this._dispatchEvent('change', payload);
					this._eventTriggerState = false;
				}
				// Back scroll mode
			} else {
				if (document.body.hasAttribute(this._attributeRoot) === true) {
					this._disable();
					if (release) {
						this._element.classList.add('release');
					}
					document.body.removeAttribute(this._attributeRoot);
				}

				if (this._eventTriggerState === false) {
					const payload = { active: false };
					this._fireEvent('change', payload);
					this._dispatchEvent('change', payload);
					this._eventTriggerState = true;
				}
			}

			this._lastScrollTop = st;
			// Classic scroll mode
		} else {
			// Forward scroll mode
			if (st > offset && !release) {
				if (document.body.hasAttribute(this._attributeRoot) === false) {
					if (this._enable() === false) {
						return;
					}

					document.body.setAttribute(this._attributeRoot, 'on');
				}

				if (this._eventTriggerState === true) {
					const payload = { active: true };
					this._fireEvent('change', payload);
					this._dispatchEvent('change', payload);
					this._eventTriggerState = false;
				}
				// Back scroll mode
			} else {
				// back scroll mode
				if (document.body.hasAttribute(this._attributeRoot) === true) {
					this._disable();
					if (release) {
						this._element.classList.add('release');
					}
					document.body.removeAttribute(this._attributeRoot);
				}

				if (this._eventTriggerState === false) {
					const payload = { active: false };
					this._fireEvent('change', payload);
					this._dispatchEvent('change', payload);
					this._eventTriggerState = true;
				}
			}
		}
	}

	/**
	 * Calculates the offset for sticky activation.
	 * Considers the configured offset and the position of the activate element (if any).
	 * @returns {number} The computed offset in pixels.
	 */
	protected _calculateOffset(): number {
		let offset = parseInt(this._getOption('offset') as string);
		const activateElement = KTDom.getElement(
			this._getOption('activate') as string,
		);
		if (activateElement) {
			offset = Math.abs(offset - activateElement.offsetTop);
		}
		return offset;
	}

	protected _getOffset(): number {
		// Deprecated: use _calculateOffset instead
		return this._calculateOffset();
	}

	protected _enable(): boolean {
		if (!this._element) return false;

		let width = this._getOption('width') as string;
		const top = this._getOption('top') as string;
		const start = this._getOption('start') as string;
		const end = this._getOption('end') as string;
		const height = this._calculateHeight();
		const zindex = this._getOption('zindex') as string;
		const classList = this._getOption('class') as string;

		if (height + parseInt(top) > KTDom.getViewPort().height) {
			return false;
		}

		if (width) {
			const targetElement = document.querySelector(width) as HTMLElement;
			if (targetElement) {
				width = KTDom.getCssProp(targetElement, 'width');
			} else if (width == 'auto') {
				width = KTDom.getCssProp(this._element, 'width');
			}

			this._element.style.width = `${Math.round(parseFloat(width))}px`;
		}

		if (top) {
			this._element.style.top = `${top}px`;
		}

		if (start) {
			if (start === 'auto') {
				const offsetLeft = KTDom.offset(this._element).left;
				if (offsetLeft >= 0) {
					this._element.style.insetInlineStart = `${offsetLeft}px`;
				}
			} else {
				this._element.style.insetInlineStart = `${start}px`;
			}
		}

		if (end) {
			if (end === 'auto') {
				const offseRight = KTDom.offset(this._element).right;
				if (offseRight >= 0) {
					this._element.style.insetInlineEnd = `${offseRight}px`;
				}
			} else {
				this._element.style.insetInlineEnd = `${end}px`;
			}
		}

		if (zindex) {
			this._element.style.zIndex = zindex;
			this._element.style.position = 'fixed';
		}

		if (classList) {
			KTDom.addClass(this._element, classList);
		}

		if (this._wrapperElement) {
			this._wrapperElement.style.height = `${height}px`;
		}

		this._element.classList.add('active');
		this._element.classList.remove('release');

		return true;
	}

	protected _disable(): void {
		if (!this._element) return;

		this._element.style.top = '';
		this._element.style.width = '';
		this._element.style.left = '';
		this._element.style.right = '';
		this._element.style.zIndex = '';
		this._element.style.position = '';

		const classList = this._getOption('class') as string;

		if (this._wrapperElement) {
			this._wrapperElement.style.height = '';
		}

		if (classList) {
			KTDom.removeClass(this._element, classList);
		}

		this._element.classList.remove('active');
	}

	protected _update(): void {
		if (this._isActive()) {
			this._disable();
			this._enable();
		} else {
			this._disable();
		}
	}

	protected _calculateHeight(): number {
		if (!this._element) return 0;

		let height = parseFloat(KTDom.getCssProp(this._element, 'height'));
		height += parseFloat(KTDom.getCssProp(this._element, 'margin-top'));
		height += parseFloat(KTDom.getCssProp(this._element, 'margin-bottom'));

		if (KTDom.getCssProp(this._element, 'border-top')) {
			height =
				height + parseFloat(KTDom.getCssProp(this._element, 'border-top'));
		}

		if (KTDom.getCssProp(this._element, 'border-bottom')) {
			height =
				height + parseFloat(KTDom.getCssProp(this._element, 'border-bottom'));
		}

		return height;
	}

	protected _isActive(): boolean {
		return this._element.classList.contains('active');
	}

	public update(): void {
		this._update();
	}

	public isActive(): boolean {
		return this._isActive();
	}

	/**
	 * Public method to refresh sticky offset and state.
	 * Call this after dynamic DOM/layout changes.
	 */
	public refresh(): void {
		this._update();
	}

	/**
	 * Initializes a MutationObserver to watch for DOM changes that may affect sticky layout.
	 */
	private _initMutationObserver(): void {
		if (typeof MutationObserver === 'undefined') return;
		// Observe the parent node or body for subtree modifications
		const observeTarget = this._element.parentElement || document.body;
		this._mutationObserver = new MutationObserver(() => {
			this.refresh();
		});
		this._mutationObserver.observe(observeTarget, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: false,
		});
	}

	/**
	 * Disconnects the MutationObserver when the sticky instance is destroyed.
	 */
	private _disconnectMutationObserver(): void {
		if (this._mutationObserver) {
			this._mutationObserver.disconnect();
			this._mutationObserver = null;
		}
	}

	public override dispose(): void {
		this._disconnectMutationObserver();
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTSticky {
		if (!element) return null;

		if (KTData.has(element, 'sticky')) {
			return KTData.get(element, 'sticky') as KTSticky;
		}

		if (element.getAttribute('data-kt-sticky')) {
			return new KTSticky(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTStickyConfigInterface,
	): KTSticky {
		return this.getInstance(element) || new KTSticky(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-sticky]');

		elements.forEach((element) => {
			new KTSticky(element as HTMLElement);
		});
	}

	public static init(): void {
		KTSticky.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTSticky = KTSticky;
}
