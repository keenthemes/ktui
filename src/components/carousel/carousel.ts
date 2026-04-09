/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTComponent from '../component';
import {
	KTCarouselChangePayloadInterface,
	KTCarouselConfigInterface,
	KTCarouselInterface,
} from './types';

declare global {
	interface Window {
		KTCarousel: typeof KTCarousel;
	}
}

const SELECTOR_VIEWPORT = '[data-kt-carousel-viewport]';
const SELECTOR_ITEM = '[data-kt-carousel-item]';
const SELECTOR_PREV = '[data-kt-carousel-prev]';
const SELECTOR_NEXT = '[data-kt-carousel-next]';
const SELECTOR_PAGINATION = '[data-kt-carousel-pagination]';
const SELECTOR_PAGINATION_ITEM = '[data-kt-carousel-pagination-item]';
const SELECTOR_THUMBS = '[data-kt-carousel-thumbnails]';
const SELECTOR_THUMB = '[data-kt-carousel-thumbnail]';
const SELECTOR_CURRENT = '[data-kt-carousel-current]';
const SELECTOR_TOTAL = '[data-kt-carousel-total]';

export class KTCarousel extends KTComponent implements KTCarouselInterface {
	protected override _name: string = 'carousel';
	protected override _defaultConfig: KTCarouselConfigInterface = {
		autoplay: false,
		autoplayInterval: 4000,
		infiniteLoop: false,
		rtl: false,
		perView: 1,
		centered: false,
		draggable: false,
		snap: false,
		autoHeight: false,
		lazy: false,
		pauseOnHover: true,
		changeEvent: 'kt.carousel.change',
	};

	protected override _config: KTCarouselConfigInterface = this
		._defaultConfig as KTCarouselConfigInterface;

	private _viewport: HTMLElement | null = null;
	private _slides: HTMLElement[] = [];
	private _index = 0;
	private _autoplayTimer: ReturnType<typeof setInterval> | null = null;
	private _programmaticScroll = false;
	private _resizeObserver: ResizeObserver | null = null;
	private _prefersReducedMotion = false;

	private _onPrevClick: ((e: Event) => void) | null = null;
	private _onNextClick: ((e: Event) => void) | null = null;
	private _onScroll: (() => void) | null = null;
	private _onScrollEnd: (() => void) | null = null;
	private _onKeyDown: ((e: KeyboardEvent) => void) | null = null;
	private _onPointerDown: ((e: PointerEvent) => void) | null = null;
	private _onPointerMove: ((e: PointerEvent) => void) | null = null;
	private _onPointerUp: ((e: PointerEvent) => void) | null = null;
	private _paginationHandlers: Array<{
		el: HTMLElement;
		fn: (e: Event) => void;
	}> = [];
	private _thumbHandlers: Array<{ el: HTMLElement; fn: (e: Event) => void }> =
		[];
	private _pauseAutoplay: (() => void) | null = null;
	private _resumeAutoplay: (() => void) | null = null;
	private _dragStartX = 0;
	private _dragStartScroll = 0;
	private _dragging = false;
	private _dragMoved = false;
	private _pointerId: number | null = null;

	constructor(
		element: HTMLElement,
		config: Partial<KTCarouselConfigInterface> | null = null,
	) {
		super();

		if (this._shouldSkipInit(element)) {
			return;
		}

		const viewport = KTCarousel._resolveViewportStatic(element);
		const slides = KTCarousel._collectSlidesStatic(viewport);
		if (!viewport || slides.length === 0) {
			return;
		}

		this._init(element);
		this._buildConfig(config);

		this._viewport = viewport;
		this._slides = slides;

		this._prefersReducedMotion = this._readPrefersReducedMotion();
		this._bindControls();
		this._bindScrollSync();
		this._bindKeyboard();
		this._bindAutoplayHoverPause();
		this._bindDraggable();
		this._bindAutoHeight();

		this._syncIndexFromScroll(false);
		this._updateInfo();
		this._updatePaginationState();
		this._updateThumbState();
		this._startAutoplay();
	}

	private _readPrefersReducedMotion(): boolean {
		if (typeof window === 'undefined' || !window.matchMedia) {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	private static _resolveViewportStatic(root: HTMLElement): HTMLElement | null {
		const explicit = root.querySelector<HTMLElement>(SELECTOR_VIEWPORT);
		if (explicit) return explicit;
		return root;
	}

	private static _collectSlidesStatic(
		viewport: HTMLElement | null,
	): HTMLElement[] {
		if (!viewport) return [];
		return Array.from(viewport.querySelectorAll<HTMLElement>(SELECTOR_ITEM));
	}

	private _isRtl(): boolean {
		if (this._getOption('rtl') === true) return true;
		if (this._element?.getAttribute('dir') === 'rtl') return true;
		if (
			this._viewport &&
			getComputedStyle(this._viewport).direction === 'rtl'
		) {
			return true;
		}
		return false;
	}

	private _scrollBehavior(): ScrollBehavior {
		return this._prefersReducedMotion ? 'auto' : 'smooth';
	}

	private _effectiveDraggable(): boolean {
		if (this._getOption('snap') === true) return false;
		return this._getOption('draggable') === true;
	}

	private _bindControls(): void {
		if (!this._element) return;

		this._onPrevClick = (e: Event) => {
			e.preventDefault();
			this.prev(true);
		};
		this._onNextClick = (e: Event) => {
			e.preventDefault();
			this.next(true);
		};

		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_PREV)
			.forEach((btn) => {
				btn.addEventListener('click', this._onPrevClick!);
			});
		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_NEXT)
			.forEach((btn) => {
				btn.addEventListener('click', this._onNextClick!);
			});

		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_PAGINATION)
			.forEach((root) => {
				const items = root.querySelectorAll<HTMLElement>(
					SELECTOR_PAGINATION_ITEM,
				);
				items.forEach((item, i) => {
					const fn = (e: Event) => {
						e.preventDefault();
						this.goTo(i, true);
					};
					item.addEventListener('click', fn);
					this._paginationHandlers.push({ el: item, fn });
				});
			});

		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_THUMBS)
			.forEach((root) => {
				const items = root.querySelectorAll<HTMLElement>(SELECTOR_THUMB);
				items.forEach((item, i) => {
					const fn = (e: Event) => {
						e.preventDefault();
						this.goTo(i, true);
					};
					item.addEventListener('click', fn);
					this._thumbHandlers.push({ el: item, fn });
				});
			});
	}

	private _bindScrollSync(): void {
		if (!this._viewport) return;

		let raf = 0;
		this._onScroll = () => {
			if (this._programmaticScroll) return;
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				raf = 0;
				const prev = this._index;
				this._syncIndexFromScroll(true);
				if (prev !== this._index) {
					this._updateInfo();
					this._updatePaginationState();
					this._updateThumbState();
					this._applyAutoHeight();
					this._observeActiveSlideForHeight();
					this._dispatchChange(this._index, prev, true);
				}
			});
		};

		this._viewport.addEventListener('scroll', this._onScroll, {
			passive: true,
		});

		this._onScrollEnd = () => {
			if (this._programmaticScroll) return;
			const prev = this._index;
			this._syncIndexFromScroll(true);
			if (prev !== this._index) {
				this._updateInfo();
				this._updatePaginationState();
				this._updateThumbState();
				this._applyAutoHeight();
				this._observeActiveSlideForHeight();
				this._dispatchChange(this._index, prev, true);
			}
		};

		this._viewport.addEventListener(
			'scrollend',
			this._onScrollEnd as EventListener,
		);
	}

	private _bindKeyboard(): void {
		if (!this._element) return;
		this._onKeyDown = (e: KeyboardEvent) => {
			if (!this._element?.contains(e.target as Node)) return;
			const t = e.target as HTMLElement | null;
			if (
				t &&
				(t.tagName === 'INPUT' ||
					t.tagName === 'TEXTAREA' ||
					t.isContentEditable)
			) {
				return;
			}

			if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

			const rtl = this._isRtl();
			const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
			const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';

			if (e.key === nextKey) {
				e.preventDefault();
				this.next(true);
			} else if (e.key === prevKey) {
				e.preventDefault();
				this.prev(true);
			}
		};
		this._element.addEventListener('keydown', this._onKeyDown);
	}

	private _bindAutoplayHoverPause(): void {
		if (!this._element || !this._viewport) return;
		if (this._getOption('pauseOnHover') !== true) return;

		this._pauseAutoplay = () => this._stopAutoplay();
		this._resumeAutoplay = () => this._startAutoplay();

		this._element.addEventListener('mouseenter', this._pauseAutoplay);
		this._element.addEventListener('mouseleave', this._resumeAutoplay);
		this._element.addEventListener('focusin', this._pauseAutoplay);
		this._element.addEventListener('focusout', this._resumeAutoplay);
	}

	private _bindDraggable(): void {
		if (!this._viewport || !this._effectiveDraggable()) return;

		this._onPointerDown = (e: PointerEvent) => {
			if (e.pointerType === 'mouse' && e.button !== 0) return;
			const t = e.target as HTMLElement | null;
			if (t && t.closest('button,a,input,textarea,select')) return;

			this._pointerId = e.pointerId;
			this._dragStartX = e.clientX;
			this._dragStartScroll = this._viewport!.scrollLeft;
			this._dragging = true;
			this._dragMoved = false;
			this._viewport!.setPointerCapture(e.pointerId);
		};

		this._onPointerMove = (e: PointerEvent) => {
			if (!this._dragging || e.pointerId !== this._pointerId) return;
			const dx = e.clientX - this._dragStartX;
			if (Math.abs(dx) > 5) this._dragMoved = true;
			this._viewport!.scrollLeft = this._dragStartScroll - dx;
		};

		this._onPointerUp = (e: PointerEvent) => {
			if (e.pointerId !== this._pointerId) return;
			this._dragging = false;
			this._pointerId = null;
			try {
				this._viewport!.releasePointerCapture(e.pointerId);
			} catch {
				/* ignore */
			}
		};

		this._viewport.addEventListener('pointerdown', this._onPointerDown);
		this._viewport.addEventListener('pointermove', this._onPointerMove);
		this._viewport.addEventListener('pointerup', this._onPointerUp);
		this._viewport.addEventListener('pointercancel', this._onPointerUp);
	}

	private _bindAutoHeight(): void {
		if (!this._viewport || this._getOption('autoHeight') !== true) return;

		this._applyAutoHeight();
		this._observeActiveSlideForHeight();
	}

	private _observeActiveSlideForHeight(): void {
		if (this._getOption('autoHeight') !== true) return;
		const active = this._slides[this._index];
		if (!active || typeof ResizeObserver === 'undefined') return;

		if (!this._resizeObserver) {
			this._resizeObserver = new ResizeObserver(() => {
				this._applyAutoHeight();
			});
		} else {
			this._resizeObserver.disconnect();
		}
		this._resizeObserver.observe(active);
	}

	private _applyAutoHeight(): void {
		if (!this._viewport || this._getOption('autoHeight') !== true) return;
		const slide = this._slides[this._index];
		if (!slide) return;
		const h = slide.offsetHeight;
		if (h > 0) {
			this._viewport.style.height = `${h}px`;
		}
	}

	private _nearestIndex(): number {
		if (!this._viewport || this._slides.length === 0) return 0;
		const vp = this._viewport;
		const origin = vp.scrollLeft;
		let best = 0;
		let bestDist = Infinity;
		for (let i = 0; i < this._slides.length; i++) {
			const slide = this._slides[i];
			const dist = Math.abs(slide.offsetLeft - origin);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
		return best;
	}

	private _syncIndexFromScroll(_userInitiated: boolean): void {
		if (this._slides.length === 0) return;
		this._index = this._nearestIndex();
	}

	/**
	 * Scroll the viewport only. Avoid `Element.scrollIntoView`, which walks
	 * ancestor scroll containers and can pull the whole docs page to an embedded
	 * carousel (e.g. autoplay ticking on `/docs/carousel`).
	 */
	private _scrollToIndex(index: number, behavior: ScrollBehavior): void {
		if (!this._viewport) return;
		const slide = this._slides[index];
		if (!slide) return;

		this._programmaticScroll = true;
		const vp = this._viewport;
		const centered = this._getOption('centered') === true;
		const slideRect = slide.getBoundingClientRect();
		const vpRect = vp.getBoundingClientRect();
		let left = vp.scrollLeft + slideRect.left - vpRect.left;
		if (centered) {
			left -= (vp.clientWidth - slideRect.width) / 2;
		}
		const maxScroll = Math.max(0, vp.scrollWidth - vp.clientWidth);
		left = Math.max(0, Math.min(left, maxScroll));

		try {
			vp.scrollTo({ left, top: vp.scrollTop, behavior });
		} catch {
			vp.scrollLeft = left;
		}

		const reset = () => {
			this._programmaticScroll = false;
		};
		setTimeout(reset, behavior === 'smooth' ? 400 : 0);
		requestAnimationFrame(() => {
			if (behavior === 'auto') reset();
		});
	}

	public goTo(index: number, userInitiated = false): void {
		if (this._slides.length === 0) return;
		const n = this._slides.length;
		let target = index;
		if (target < 0) target = 0;
		if (target >= n) target = n - 1;

		const prev = this._index;
		if (target === prev) return;

		this._index = target;
		this._scrollToIndex(target, this._scrollBehavior());
		this._updateInfo();
		this._updatePaginationState();
		this._updateThumbState();
		this._applyAutoHeight();
		this._observeActiveSlideForHeight();
		this._dispatchChange(target, prev, userInitiated);
	}

	public next(userInitiated = false): void {
		if (this._slides.length === 0) return;
		const n = this._slides.length;
		const last = n - 1;
		const infinite = this._getOption('infiniteLoop') === true;

		if (this._index >= last) {
			if (infinite) {
				this.goTo(0, userInitiated);
				return;
			}
			return;
		}
		this.goTo(this._index + 1, userInitiated);
	}

	public prev(userInitiated = false): void {
		if (this._slides.length === 0) return;
		const infinite = this._getOption('infiniteLoop') === true;

		if (this._index <= 0) {
			if (infinite) {
				this.goTo(this._slides.length - 1, userInitiated);
				return;
			}
			return;
		}
		this.goTo(this._index - 1, userInitiated);
	}

	public getIndex(): number {
		return this._index;
	}

	public getSlideCount(): number {
		return this._slides.length;
	}

	private _getChangeEventName(): string {
		const name = this._getOption('changeEvent');
		return typeof name === 'string' && name.length > 0
			? name
			: 'kt.carousel.change';
	}

	private _dispatchChange(
		index: number,
		prevIndex: number,
		userInitiated: boolean,
	): void {
		if (!this._element) return;
		const payload: KTCarouselChangePayloadInterface = {
			index,
			prevIndex,
			userInitiated,
		};
		const eventName = this._getChangeEventName();
		this._fireEvent(eventName, payload);
		this._dispatchEvent(eventName, payload);
	}

	private _updateInfo(): void {
		if (!this._element) return;
		const total = this._slides.length;
		const cur = total === 0 ? 0 : this._index + 1;

		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_CURRENT)
			.forEach((el) => {
				el.textContent = String(cur);
			});
		this._element
			.querySelectorAll<HTMLElement>(SELECTOR_TOTAL)
			.forEach((el) => {
				el.textContent = String(total);
			});
	}

	private _updatePaginationState(): void {
		this._paginationHandlers.forEach(({ el }, i) => {
			const active = i === this._index;
			if (active) {
				el.setAttribute('aria-current', 'true');
			} else {
				el.removeAttribute('aria-current');
			}
			el.toggleAttribute('data-kt-carousel-pagination-active', active);
		});
	}

	private _updateThumbState(): void {
		this._thumbHandlers.forEach(({ el }, i) => {
			const active = i === this._index;
			if (active) {
				el.setAttribute('aria-current', 'true');
			} else {
				el.removeAttribute('aria-current');
			}
			el.toggleAttribute('data-kt-carousel-thumbnail-active', active);
		});
	}

	private _startAutoplay(): void {
		this._stopAutoplay();
		if (this._getOption('autoplay') !== true) return;
		if (this._prefersReducedMotion) return;
		if (this._slides.length <= 1) return;

		const raw = this._getOption('autoplayInterval');
		const interval = typeof raw === 'number' && raw >= 200 ? raw : 4000;

		this._autoplayTimer = setInterval(() => {
			this.next(false);
		}, interval);
	}

	private _stopAutoplay(): void {
		if (this._autoplayTimer !== null) {
			clearInterval(this._autoplayTimer);
			this._autoplayTimer = null;
		}
	}

	public override dispose(): void {
		this._stopAutoplay();

		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}

		if (this._element) {
			if (this._onPrevClick) {
				this._element
					.querySelectorAll<HTMLElement>(SELECTOR_PREV)
					.forEach((btn) =>
						btn.removeEventListener('click', this._onPrevClick!),
					);
			}
			if (this._onNextClick) {
				this._element
					.querySelectorAll<HTMLElement>(SELECTOR_NEXT)
					.forEach((btn) =>
						btn.removeEventListener('click', this._onNextClick!),
					);
			}
			this._paginationHandlers.forEach(({ el, fn }) => {
				el.removeEventListener('click', fn);
			});
			this._paginationHandlers = [];
			this._thumbHandlers.forEach(({ el, fn }) => {
				el.removeEventListener('click', fn);
			});
			this._thumbHandlers = [];

			if (this._onKeyDown) {
				this._element.removeEventListener('keydown', this._onKeyDown);
			}
			if (this._pauseAutoplay && this._resumeAutoplay) {
				this._element.removeEventListener('mouseenter', this._pauseAutoplay);
				this._element.removeEventListener('mouseleave', this._resumeAutoplay);
				this._element.removeEventListener('focusin', this._pauseAutoplay);
				this._element.removeEventListener('focusout', this._resumeAutoplay);
			}
			this._pauseAutoplay = null;
			this._resumeAutoplay = null;
		}

		if (this._viewport && this._onScroll) {
			this._viewport.removeEventListener('scroll', this._onScroll);
		}
		if (this._viewport && this._onScrollEnd) {
			this._viewport.removeEventListener('scrollend', this._onScrollEnd);
		}
		if (this._viewport && this._onPointerDown) {
			this._viewport.removeEventListener('pointerdown', this._onPointerDown);
			this._viewport.removeEventListener('pointermove', this._onPointerMove!);
			this._viewport.removeEventListener('pointerup', this._onPointerUp!);
			this._viewport.removeEventListener('pointercancel', this._onPointerUp!);
		}

		if (this._viewport && this._getOption('autoHeight') === true) {
			this._viewport.style.height = '';
		}

		this._onPrevClick = null;
		this._onNextClick = null;
		this._onScroll = null;
		this._onScrollEnd = null;
		this._onKeyDown = null;
		this._onPointerDown = null;
		this._onPointerMove = null;
		this._onPointerUp = null;

		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTCarousel | null {
		if (!element) return null;
		if (KTData.has(element, 'carousel')) {
			return KTData.get(element, 'carousel') as KTCarousel;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: Partial<KTCarouselConfigInterface>,
	): KTCarousel | null {
		const existing = this.getInstance(element);
		if (existing) return existing;
		new KTCarousel(element, config ?? undefined);
		return this.getInstance(element);
	}

	public static createInstances(): void {
		document
			.querySelectorAll<HTMLElement>('[data-kt-carousel]')
			.forEach((el) => {
				if (el.getAttribute('data-kt-carousel-lazy') === 'true') {
					return;
				}
				new KTCarousel(el);
			});
	}

	public static init(): void {
		KTCarousel.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTCarousel = KTCarousel;
}
