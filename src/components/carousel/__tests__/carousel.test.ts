/**
 * Tests for KTCarousel component
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KTCarousel } from '../carousel';

function buildCarouselHtml(options?: {
	infinite?: boolean;
	autoplay?: boolean;
	lazy?: boolean;
	snap?: boolean;
	draggable?: boolean;
}) {
	const root = document.createElement('div');
	root.setAttribute('data-kt-carousel', 'true');
	if (options?.lazy) root.setAttribute('data-kt-carousel-lazy', 'true');
	if (options?.infinite) root.setAttribute('data-kt-carousel-infinite-loop', 'true');
	if (options?.autoplay) root.setAttribute('data-kt-carousel-autoplay', 'true');
	if (options?.snap) root.setAttribute('data-kt-carousel-snap', 'true');
	if (options?.draggable) root.setAttribute('data-kt-carousel-draggable', 'true');

	const viewport = document.createElement('div');
	viewport.setAttribute('data-kt-carousel-viewport', 'true');
	viewport.style.overflow = 'auto';
	viewport.style.width = '200px';

	for (let i = 0; i < 3; i++) {
		const slide = document.createElement('div');
		slide.setAttribute('data-kt-carousel-item', 'true');
		slide.style.width = '200px';
		slide.style.flexShrink = '0';
		slide.textContent = `S${i}`;
		viewport.appendChild(slide);
	}

	const next = document.createElement('button');
	next.type = 'button';
	next.setAttribute('data-kt-carousel-next', 'true');
	const prev = document.createElement('button');
	prev.type = 'button';
	prev.setAttribute('data-kt-carousel-prev', 'true');

	root.appendChild(viewport);
	root.appendChild(prev);
	root.appendChild(next);
	document.body.appendChild(root);

	const slides = Array.from(
		viewport.querySelectorAll<HTMLElement>('[data-kt-carousel-item]'),
	);
	const gap = 200;
	slides.forEach((slide, i) => {
		Object.defineProperty(slide, 'offsetLeft', {
			configurable: true,
			get: () => i * gap,
		});
		Object.defineProperty(slide, 'offsetHeight', {
			configurable: true,
			get: () => 100,
		});
	});

	let scrollLeft = 0;
	Object.defineProperty(viewport, 'scrollLeft', {
		configurable: true,
		get: () => scrollLeft,
		set: (v: number) => {
			scrollLeft = v;
		},
	});

	const origScrollIntoView = HTMLElement.prototype.scrollIntoView;
	HTMLElement.prototype.scrollIntoView = function (
		this: HTMLElement,
		opts?: boolean | ScrollIntoViewOptions,
	) {
		const inline = typeof opts === 'object' ? opts.inline : undefined;
		if (inline === 'center' || inline === 'start' || inline === 'nearest') {
			const idx = slides.indexOf(this as HTMLElement);
			if (idx >= 0) scrollLeft = idx * gap;
		}
	};

	return {
		root,
		viewport,
		slides,
		restoreScrollIntoView: () => {
			HTMLElement.prototype.scrollIntoView = origScrollIntoView;
		},
	};
}

describe('KTCarousel', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('goTo sets index immediately', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			expect(c.getSlideCount()).toBe(3);
			c.goTo(2);
			expect(c.getIndex()).toBe(2);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('next advances and prev goes back', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			c.next(true);
			expect(c.getIndex()).toBe(1);
			c.prev(true);
			expect(c.getIndex()).toBe(0);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('next at last without infinite does nothing', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			c.goTo(2);
			c.next(true);
			expect(c.getIndex()).toBe(2);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('next at last with infinite wraps to 0', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml({
			infinite: true,
		});
		try {
			const c = new KTCarousel(root);
			c.goTo(2);
			c.next(true);
			expect(c.getIndex()).toBe(0);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('dispose clears instance', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			c.dispose();
			expect(KTCarousel.getInstance(root)).toBeNull();
		} finally {
			restoreScrollIntoView();
		}
	});

	it('dispose is idempotent', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			c.dispose();
			c.dispose();
			expect(KTCarousel.getInstance(root)).toBeNull();
		} finally {
			restoreScrollIntoView();
		}
	});

	it('dispatches change event on next', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const c = new KTCarousel(root);
			const spy = vi.fn();
			root.addEventListener('kt.carousel.change', spy);
			c.next(true);
			expect(spy).toHaveBeenCalled();
		} finally {
			restoreScrollIntoView();
		}
	});

	it('createInstances skips lazy roots', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml({ lazy: true });
		try {
			KTCarousel.createInstances();
			expect(KTCarousel.getInstance(root)).toBeNull();
		} finally {
			restoreScrollIntoView();
		}
	});

	it('prefers-reduced-motion disables autoplay timer', () => {
		vi.useFakeTimers();
		const mm = vi.fn().mockImplementation((q: string) => ({
			matches: q.includes('prefers-reduced-motion'),
			media: q,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		}));
		vi.stubGlobal('matchMedia', mm);

		const { root, restoreScrollIntoView } = buildCarouselHtml({
			autoplay: true,
		});
		try {
			const c = new KTCarousel(root);
			vi.advanceTimersByTime(20000);
			expect(c.getIndex()).toBe(0);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('getOrCreateInstance returns same instance', () => {
		const { root, restoreScrollIntoView } = buildCarouselHtml();
		try {
			const a = KTCarousel.getOrCreateInstance(root);
			const b = KTCarousel.getOrCreateInstance(root);
			expect(a).toBe(b);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('snap mode does not attach pointer drag listeners', () => {
		const { root, viewport, restoreScrollIntoView } = buildCarouselHtml({
			snap: true,
			draggable: true,
		});
		try {
			const spy = vi.spyOn(viewport, 'addEventListener');
			new KTCarousel(root);
			const pointerDown = spy.mock.calls.some(
				(c) => c[0] === 'pointerdown',
			);
			expect(pointerDown).toBe(false);
		} finally {
			restoreScrollIntoView();
		}
	});

	it('draggable without snap attaches pointerdown', () => {
		const { root, viewport, restoreScrollIntoView } = buildCarouselHtml({
			draggable: true,
		});
		try {
			const spy = vi.spyOn(viewport, 'addEventListener');
			new KTCarousel(root);
			const pointerDown = spy.mock.calls.some(
				(c) => c[0] === 'pointerdown',
			);
			expect(pointerDown).toBe(true);
		} finally {
			restoreScrollIntoView();
		}
	});
});
