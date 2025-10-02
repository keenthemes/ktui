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

export class KTSticky extends KTComponent implements KTStickyInterface {
	protected override _name: string = 'sticky';
	protected override _defaultConfig: KTStickyConfigInterface = {
		target: 'body',
		name: '',
		class: '',
		top: '',
		middle: false,
		bottom: '',
		start: '',
		center: false,
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

	protected _getOffset(): number {
		let offset = parseInt(this._getOption('offset') as string);
		const activateElement = KTDom.getElement(
			this._getOption('activate') as string,
		);

		if (activateElement) {
			offset = Math.abs(offset - activateElement.offsetTop);
		}

		return offset;
	}

	protected _enable(): boolean {
		if (!this._element) return false;

		let width = this._getOption('width') as string;
		const top = this._getOption('top') as string;
		const middle = this._getOption('middle') as boolean;
		const bottom = this._getOption('bottom') as string;
		const start = this._getOption('start') as string;
		const center = this._getOption('center') as boolean;
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

		if (middle === true) {
			this._element.style.insetBlockStart = `50%`;
		} else {
			if (top) {
				if (top === 'auto') {
					this._element.style.insetBlockStart = `0px`;
				} else {
					this._element.style.insetBlockStart = `${top}px`;
				}
			} else {
				if (bottom) {
					if (bottom === 'auto') {
						this._element.style.insetBlockEnd = `0px`;
					} else {
						this._element.style.insetBlockEnd = `${bottom}px`;
					}
				}
			}
		}

		if (center === true) {
			this._element.style.insetInlineStart = `50%`;
		} else {
			if (start) {
				if (start === 'auto') {
					const offsetLeft = KTDom.offset(this._element).left;
					if (offsetLeft >= 0) {
						this._element.style.insetInlineStart = `${offsetLeft}px`;
					}
				} else {
					this._element.style.insetInlineStart = `${start}px`;
				}
			} else {
				if (end) {
					if (end === 'auto') {
						const offsetRight = KTDom.offset(this._element).right;
						if (offsetRight >= 0) {
							this._element.style.insetInlineEnd = `${offsetRight}px`;
						}
					} else {
						this._element.style.insetInlineEnd = `${end}px`;
					}
				}
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
		this._element.style.bottom = '';
		this._element.style.insetInlineStart = '';
		this._element.style.insetInlineEnd = '';
		this._element.style.insetBlockStart = '';
		this._element.style.insetBlockEnd = '';
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
