import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KTDom from '../dom';

describe('KTDom', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	describe('isRTL', () => {
		it('returns true when dir attribute is rtl', () => {
			document.documentElement.setAttribute('dir', 'rtl');
			expect(KTDom.isRTL()).toBe(true);
			document.documentElement.removeAttribute('dir');
		});

		it('returns false when dir attribute is not rtl', () => {
			document.documentElement.setAttribute('dir', 'ltr');
			expect(KTDom.isRTL()).toBe(false);
			document.documentElement.removeAttribute('dir');
		});

		it('returns false when no dir attribute', () => {
			document.documentElement.removeAttribute('dir');
			expect(KTDom.isRTL()).toBe(false);
		});
	});

	describe('isElement', () => {
		it('returns true for HTMLElement', () => {
			expect(KTDom.isElement(document.createElement('div'))).toBe(true);
		});

		it('returns false for null', () => {
			expect(KTDom.isElement(null)).toBe(false);
		});

		it('returns false for string', () => {
			expect(KTDom.isElement('div')).toBe(false);
		});

		it('returns false for plain object', () => {
			expect(KTDom.isElement({})).toBe(false);
		});
	});

	describe('getElement', () => {
		it('returns element by string selector', () => {
			const el = document.createElement('div');
			el.id = 'test';
			document.body.appendChild(el);
			expect(KTDom.getElement('#test')).toBe(el);
		});

		it('returns element when passed an HTMLElement', () => {
			const el = document.createElement('div');
			expect(KTDom.getElement(el)).toBe(el);
		});

		it('returns null for empty string', () => {
			expect(KTDom.getElement('')).toBeNull();
		});

		it('returns null for null', () => {
			expect(KTDom.getElement(null)).toBeNull();
		});

		it('returns null when selector matches nothing', () => {
			expect(KTDom.getElement('#nonexistent')).toBeNull();
		});
	});

	describe('remove', () => {
		it('removes element from parent', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			document.body.appendChild(parent);

			KTDom.remove(child);
			expect(parent.children.length).toBe(0);
		});

		it('does nothing when element has no parent', () => {
			const el = document.createElement('div');
			expect(() => KTDom.remove(el)).not.toThrow();
		});
	});

	describe('hasClass', () => {
		it('returns true when element has class', () => {
			const el = document.createElement('div');
			el.className = 'foo bar';
			expect(KTDom.hasClass(el, 'foo')).toBe(true);
		});

		it('returns false when element lacks class', () => {
			const el = document.createElement('div');
			el.className = 'foo';
			expect(KTDom.hasClass(el, 'bar')).toBe(false);
		});

		it('returns true when all space-separated classes present', () => {
			const el = document.createElement('div');
			el.className = 'foo bar baz';
			expect(KTDom.hasClass(el, 'foo bar')).toBe(true);
		});

		it('returns false when any space-separated class is missing', () => {
			const el = document.createElement('div');
			el.className = 'foo baz';
			expect(KTDom.hasClass(el, 'foo bar')).toBe(false);
		});
	});

	describe('addClass', () => {
		it('adds multiple space-separated classes', () => {
			const el = document.createElement('div');
			KTDom.addClass(el, 'c1 c2');
			expect(el.classList.contains('c1')).toBe(true);
			expect(el.classList.contains('c2')).toBe(true);
		});

		it('does not duplicate existing class', () => {
			const el = document.createElement('div');
			el.className = 'c1';
			KTDom.addClass(el, 'c1 c2');
			expect(el.className).toBe('c1 c2');
		});

		it('ignores empty class names from split', () => {
			const el = document.createElement('div');
			KTDom.addClass(el, 'c1  c2');
			expect(el.classList.contains('c1')).toBe(true);
			expect(el.classList.contains('c2')).toBe(true);
		});
	});

	describe('removeClass', () => {
		it('removes multiple space-separated classes', () => {
			const el = document.createElement('div');
			el.className = 'c1 c2 c3';
			KTDom.removeClass(el, 'c1 c2');
			expect(el.classList.contains('c1')).toBe(false);
			expect(el.classList.contains('c2')).toBe(false);
			expect(el.classList.contains('c3')).toBe(true);
		});

		it('does nothing when class is not present', () => {
			const el = document.createElement('div');
			el.className = 'c1';
			KTDom.removeClass(el, 'c2');
			expect(el.className).toBe('c1');
		});
	});

	describe('getCssProp', () => {
		it('returns computed style property value', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				getPropertyValue: (prop: string) => (prop === 'color' ? 'red' : ''),
			} as unknown as CSSStyleDeclaration);

			expect(KTDom.getCssProp(el, 'color')).toBe('red');
			vi.restoreAllMocks();
		});

		it('returns empty string for null element', () => {
			expect(KTDom.getCssProp(null as unknown as HTMLElement, 'color')).toBe(
				'',
			);
		});
	});

	describe('setCssProp', () => {
		it('sets property via getComputedStyle().setProperty', () => {
			const el = document.createElement('div');
			const mockSetProperty = vi.fn();
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				setProperty: mockSetProperty,
			} as unknown as CSSStyleDeclaration);

			KTDom.setCssProp(el, 'color', 'blue');
			expect(mockSetProperty).toHaveBeenCalledWith('color', 'blue');
			vi.restoreAllMocks();
		});

		it('does nothing for null element', () => {
			expect(() =>
				KTDom.setCssProp(null as unknown as HTMLElement, 'color', 'blue'),
			).not.toThrow();
		});
	});

	describe('offset', () => {
		it('returns bounding rect offsets', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: 10,
				left: 20,
				right: 100,
				bottom: 50,
				width: 80,
				height: 40,
			} as DOMRect);
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});

			const result = KTDom.offset(el);
			expect(result).toEqual({
				top: 10,
				left: 20,
				right: 924,
				bottom: 758,
			});
		});

		it('returns zeros for null element', () => {
			const result = KTDom.offset(null as unknown as HTMLElement);
			expect(result).toEqual({ top: 0, left: 0, right: 0, bottom: 0 });
		});
	});

	describe('getIndex', () => {
		it('returns index of element among siblings', () => {
			const parent = document.createElement('div');
			const c0 = document.createElement('span');
			const c1 = document.createElement('span');
			const c2 = document.createElement('span');
			parent.append(c0, c1, c2);
			expect(KTDom.getIndex(c1)).toBe(1);
		});

		it('returns 0 for first child', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			expect(KTDom.getIndex(child)).toBe(0);
		});
	});

	describe('parents', () => {
		it('returns all ancestor elements when no selector', () => {
			const grandparent = document.createElement('div');
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			grandparent.appendChild(parent);
			document.body.appendChild(grandparent);

			const result = KTDom.parents(child, '');
			expect(result).toContain(parent);
			expect(result).toContain(grandparent);
			expect(result).toContain(document.body);
		});

		it('returns only ancestors matching selector', () => {
			const grandparent = document.createElement('div');
			grandparent.className = 'target';
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			grandparent.appendChild(parent);
			document.body.appendChild(grandparent);

			const result = KTDom.parents(child, '.target');
			expect(result).toHaveLength(1);
			expect(result[0]).toBe(grandparent);
		});

		it('returns empty array for element with no parent', () => {
			const el = document.createElement('div');
			expect(KTDom.parents(el, '')).toEqual([]);
		});
	});

	describe('siblings', () => {
		it('returns all sibling elements', () => {
			const parent = document.createElement('div');
			const c0 = document.createElement('span');
			const c1 = document.createElement('span');
			const c2 = document.createElement('span');
			parent.append(c0, c1, c2);

			const result = KTDom.siblings(c1);
			expect(result).toContain(c0);
			expect(result).toContain(c2);
			expect(result).not.toContain(c1);
		});

		it('returns empty array when element has no parent', () => {
			const el = document.createElement('div');
			expect(KTDom.siblings(el)).toEqual([]);
		});

		it('returns empty array for only child', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			expect(KTDom.siblings(child)).toEqual([]);
		});
	});

	describe('children', () => {
		it('returns children matching selector', () => {
			const parent = document.createElement('div');
			const c1 = document.createElement('span');
			c1.className = 'match';
			const c2 = document.createElement('span');
			const c3 = document.createElement('span');
			c3.className = 'match';
			parent.append(c1, c2, c3);

			const result = KTDom.children(parent, '.match');
			expect(result).toHaveLength(2);
			expect(result[0]).toBe(c1);
			expect(result[1]).toBe(c3);
		});

		it('returns empty array for element with no children', () => {
			const el = document.createElement('div');
			expect(KTDom.children(el, '.any')).toEqual([]);
		});

		it('returns empty array for null element', () => {
			expect(KTDom.children(null as unknown as HTMLElement, '.any')).toEqual(
				[],
			);
		});
	});

	describe('child', () => {
		it('returns first child matching selector', () => {
			const parent = document.createElement('div');
			const c1 = document.createElement('span');
			c1.className = 'match';
			const c2 = document.createElement('span');
			c2.className = 'match';
			parent.append(c1, c2);

			expect(KTDom.child(parent, '.match')).toBe(c1);
		});

		it('returns undefined when no children match', () => {
			const parent = document.createElement('div');
			expect(KTDom.child(parent, '.none')).toBeUndefined();
		});
	});

	describe('isVisible', () => {
		it('returns true for visible element', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			vi.spyOn(el, 'getClientRects').mockReturnValue({
				length: 1,
			} as unknown as DOMRectList);
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				getPropertyValue: (prop: string) =>
					prop === 'visibility' ? 'visible' : '',
			} as unknown as CSSStyleDeclaration);

			expect(KTDom.isVisible(el)).toBe(true);
			vi.restoreAllMocks();
		});

		it('returns false for element with no client rects', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getClientRects').mockReturnValue({
				length: 0,
			} as unknown as DOMRectList);
			expect(KTDom.isVisible(el)).toBe(false);
		});

		it('returns false for non-element', () => {
			expect(KTDom.isVisible('text' as unknown as HTMLElement)).toBe(false);
		});

		it('returns false when visibility is hidden', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			vi.spyOn(el, 'getClientRects').mockReturnValue({
				length: 1,
			} as unknown as DOMRectList);
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				getPropertyValue: (prop: string) =>
					prop === 'visibility' ? 'hidden' : '',
			} as unknown as CSSStyleDeclaration);

			expect(KTDom.isVisible(el)).toBe(false);
			vi.restoreAllMocks();
		});
	});

	describe('isDisabled', () => {
		it('returns true for disabled input', () => {
			const el = document.createElement('input');
			el.disabled = true;
			expect(KTDom.isDisabled(el)).toBe(true);
		});

		it('returns false for enabled input', () => {
			const el = document.createElement('input');
			el.disabled = false;
			expect(KTDom.isDisabled(el)).toBe(false);
		});

		it('returns true for element with disabled class', () => {
			const el = document.createElement('button');
			el.className = 'disabled';
			expect(KTDom.isDisabled(el)).toBe(true);
		});

		it('returns true for null element', () => {
			expect(KTDom.isDisabled(null as unknown as HTMLInputElement)).toBe(true);
		});

		it('returns true when disabled attribute is "true"', () => {
			const el = document.createElement('button');
			el.setAttribute('disabled', 'true');
			expect(KTDom.isDisabled(el)).toBe(true);
		});

		it('returns true when disabled attribute is present even if "false"', () => {
			const el = document.createElement('button');
			el.setAttribute('disabled', 'false');
			// The DOM disabled property is a boolean: presence of the attribute makes it true
			expect(KTDom.isDisabled(el)).toBe(true);
		});
	});

	describe('transitionEnd', () => {
		it('calls callback after transition duration', () => {
			vi.useFakeTimers();
			const el = document.createElement('div');
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				transitionDuration: '0.3s',
			} as unknown as CSSStyleDeclaration);

			const cb = vi.fn();
			KTDom.transitionEnd(el, cb);
			expect(cb).not.toHaveBeenCalled();
			vi.advanceTimersByTime(300);
			expect(cb).toHaveBeenCalledTimes(1);
			vi.useRealTimers();
			vi.restoreAllMocks();
		});
	});

	describe('animationEnd', () => {
		it('calls callback after animation duration', () => {
			vi.useFakeTimers();
			const el = document.createElement('div');
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				animationDuration: '0.5s',
			} as unknown as CSSStyleDeclaration);

			const cb = vi.fn();
			KTDom.animationEnd(el, cb);
			expect(cb).not.toHaveBeenCalled();
			vi.advanceTimersByTime(500);
			expect(cb).toHaveBeenCalledTimes(1);
			vi.useRealTimers();
			vi.restoreAllMocks();
		});
	});

	describe('getCSSTransitionDuration', () => {
		it('returns duration in milliseconds', () => {
			const el = document.createElement('div');
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				transitionDuration: '0.3s',
			} as unknown as CSSStyleDeclaration);
			expect(KTDom.getCSSTransitionDuration(el)).toBe(300);
			vi.restoreAllMocks();
		});
	});

	describe('getCSSAnimationDuration', () => {
		it('returns duration in milliseconds', () => {
			const el = document.createElement('div');
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				animationDuration: '1s',
			} as unknown as CSSStyleDeclaration);
			expect(KTDom.getCSSAnimationDuration(el)).toBe(1000);
			vi.restoreAllMocks();
		});
	});

	describe('reflow', () => {
		it('triggers reflow by accessing offsetHeight', () => {
			const el = document.createElement('div');
			const spy = vi.spyOn(el, 'offsetHeight', 'get').mockReturnValue(0);
			KTDom.reflow(el);
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe('insertAfter', () => {
		it('inserts new element after reference node', () => {
			const parent = document.createElement('div');
			const ref = document.createElement('span');
			const newEl = document.createElement('p');
			parent.appendChild(ref);
			document.body.appendChild(parent);

			KTDom.insertAfter(newEl, ref);
			expect(parent.children[1]).toBe(newEl);
		});

		it('does nothing when reference node has no parent', () => {
			const ref = document.createElement('div');
			const newEl = document.createElement('div');
			expect(() => KTDom.insertAfter(newEl, ref)).not.toThrow();
		});
	});

	describe('getHighestZindex', () => {
		it('returns 1 for element with no positioned ancestors', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			expect(KTDom.getHighestZindex(el)).toBe(1);
		});

		it('returns z-index of positioned ancestor', () => {
			const parent = document.createElement('div');
			parent.style.position = 'absolute';
			parent.style.zIndex = '50';
			const child = document.createElement('div');
			parent.appendChild(child);
			document.body.appendChild(parent);
			expect(KTDom.getHighestZindex(child)).toBe(50);
		});

		it('ignores z-index of 0', () => {
			const parent = document.createElement('div');
			parent.style.position = 'relative';
			parent.style.zIndex = '0';
			const child = document.createElement('div');
			parent.appendChild(child);
			document.body.appendChild(parent);
			expect(KTDom.getHighestZindex(child)).toBe(1);
		});

		it('returns 1 for null element', () => {
			expect(KTDom.getHighestZindex(null as unknown as HTMLElement)).toBe(1);
		});
	});

	describe('isParentOrElementHidden', () => {
		it('returns true when element has display none', () => {
			const el = document.createElement('div');
			el.style.display = 'none';
			document.body.appendChild(el);
			expect(KTDom.isParentOrElementHidden(el)).toBe(true);
		});

		it('returns false when element and parents are visible', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			expect(KTDom.isParentOrElementHidden(el)).toBe(false);
		});

		it('returns false for null element', () => {
			expect(KTDom.isParentOrElementHidden(null)).toBe(false);
		});

		it('returns true when parent has display none', () => {
			const parent = document.createElement('div');
			parent.style.display = 'none';
			const child = document.createElement('div');
			parent.appendChild(child);
			document.body.appendChild(parent);
			expect(KTDom.isParentOrElementHidden(child)).toBe(true);
		});
	});

	describe('getViewPort', () => {
		it('returns width and height', () => {
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});
			const result = KTDom.getViewPort();
			expect(result).toEqual({ width: 1024, height: 768 });
		});
	});

	describe('getScrollTop', () => {
		it('returns scrollTop value', () => {
			const result = KTDom.getScrollTop();
			expect(typeof result).toBe('number');
		});
	});

	describe('isInViewport', () => {
		it('returns true for element fully in viewport', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: 0,
				left: 0,
				bottom: 100,
				right: 100,
			} as DOMRect);
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});

			expect(KTDom.isInViewport(el)).toBe(true);
		});

		it('returns false for element below viewport', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: 800,
				left: 0,
				bottom: 900,
				right: 100,
			} as DOMRect);
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});

			expect(KTDom.isInViewport(el)).toBe(false);
		});
	});

	describe('isPartiallyInViewport', () => {
		it('returns true for partially visible element', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: 700,
				left: 0,
			} as DOMRect);
			Object.defineProperty(el, 'clientWidth', {
				value: 100,
				configurable: true,
			});
			Object.defineProperty(el, 'clientHeight', {
				value: 100,
				configurable: true,
			});
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});

			expect(KTDom.isPartiallyInViewport(el)).toBe(true);
		});

		it('returns false for element completely out of viewport', () => {
			const el = document.createElement('div');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: -200,
				left: -200,
			} as DOMRect);
			Object.defineProperty(el, 'clientWidth', {
				value: 50,
				configurable: true,
			});
			Object.defineProperty(el, 'clientHeight', {
				value: 50,
				configurable: true,
			});
			Object.defineProperty(window, 'innerHeight', {
				value: 768,
				configurable: true,
			});
			Object.defineProperty(window, 'innerWidth', {
				value: 1024,
				configurable: true,
			});

			expect(KTDom.isPartiallyInViewport(el)).toBe(false);
		});
	});

	describe('isVisibleInParent', () => {
		it('returns true for child within parent bounds', () => {
			const parent = document.createElement('div');
			const child = document.createElement('div');
			parent.appendChild(child);
			document.body.appendChild(parent);

			vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
				top: 10,
				left: 10,
				bottom: 50,
				right: 50,
			} as DOMRect);
			vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
				top: 0,
				left: 0,
				bottom: 100,
				right: 100,
			} as DOMRect);
			Object.defineProperty(child, 'offsetParent', {
				value: parent,
				configurable: true,
			});
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				visibility: 'visible',
				display: 'block',
			} as unknown as CSSStyleDeclaration);

			expect(KTDom.isVisibleInParent(child, parent)).toBe(true);
			vi.restoreAllMocks();
		});

		it('returns false when child has display none', () => {
			const parent = document.createElement('div');
			const child = document.createElement('div');
			parent.appendChild(child);

			Object.defineProperty(child, 'offsetParent', {
				value: null,
				configurable: true,
			});
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				visibility: 'visible',
				display: 'none',
			} as unknown as CSSStyleDeclaration);

			expect(KTDom.isVisibleInParent(child, parent)).toBe(false);
			vi.restoreAllMocks();
		});
	});

	describe('getRelativeTopPosition', () => {
		it('returns relative top position', () => {
			const parent = document.createElement('div');
			const child = document.createElement('div');
			parent.appendChild(child);

			vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
				top: 50,
			} as DOMRect);
			vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
				top: 20,
			} as DOMRect);

			expect(KTDom.getRelativeTopPosition(child, parent)).toBe(30);
		});
	});

	describe('getDataAttributes', () => {
		it('returns parsed data attributes with prefix', () => {
			const el = document.createElement('div');
			el.setAttribute('data-kt-foo-bar', 'baz');
			el.setAttribute('data-kt-foo-count', '42');
			el.setAttribute('data-other', 'ignored');

			const result = KTDom.getDataAttributes(el, 'kt-foo') as Record<
				string,
				unknown
			>;
			expect(result.bar).toBe('baz');
			expect(result.count).toBe(42);
			expect(result).not.toHaveProperty('other');
		});

		it('returns empty object for null element', () => {
			expect(
				KTDom.getDataAttributes(null as unknown as HTMLElement, 'kt-'),
			).toEqual({});
		});

		it('returns empty object when no matching attributes', () => {
			const el = document.createElement('div');
			el.setAttribute('data-other', 'value');
			expect(KTDom.getDataAttributes(el, 'kt-foo')).toEqual({});
		});
	});

	describe('ready', () => {
		it('calls callback immediately when DOM is ready', () => {
			const cb = vi.fn();
			KTDom.ready(cb);
			expect(cb).toHaveBeenCalled();
		});

		it('adds event listener when DOM is loading', () => {
			const origReadyState = Object.getOwnPropertyDescriptor(
				document,
				'readyState',
			);
			Object.defineProperty(document, 'readyState', {
				value: 'loading',
				configurable: true,
			});

			const addSpy = vi.spyOn(document, 'addEventListener');
			const cb = vi.fn();
			KTDom.ready(cb);
			expect(addSpy).toHaveBeenCalledWith(
				'DOMContentLoaded',
				expect.any(Function),
			);
			expect(cb).not.toHaveBeenCalled();

			if (origReadyState) {
				Object.defineProperty(document, 'readyState', origReadyState);
			}
			addSpy.mockRestore();
		});
	});
});
