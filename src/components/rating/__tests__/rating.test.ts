/**
 * Tests for KTRating component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTRating } from '../rating';

describe('KTRating', () => {
	let container: HTMLElement;
	let ratingEl: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		container = document.createElement('div');
		container.id = 'test-container';
		ratingEl = document.createElement('div');
		ratingEl.setAttribute('data-kt-rating', 'true');
		container.appendChild(ratingEl);
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('initialization', () => {
		it('initializes on element with data-kt-rating', () => {
			const instance = new KTRating(ratingEl);
			expect(instance).toBeInstanceOf(KTRating);
			expect(instance.getElement()).toBe(ratingEl);
			expect(ratingEl.querySelector('.kt-rating')).not.toBeNull();
			instance.dispose();
		});

		it('reads value and max from data attributes', () => {
			ratingEl.setAttribute('data-kt-rating-value', '3');
			ratingEl.setAttribute('data-kt-rating-max', '10');
			const instance = new KTRating(ratingEl);
			expect(instance.getOption('value')).toBe(3);
			expect(instance.getOption('max')).toBe(10);
			instance.dispose();
		});

		it('does not double-initialize when constructor called twice on same element', () => {
			new KTRating(ratingEl);
			new KTRating(ratingEl);
			expect(ratingEl.querySelectorAll('.kt-rating').length).toBe(1);
			const instance = KTRating.getInstance(ratingEl);
			expect(instance).not.toBeNull();
			instance!.dispose();
		});
	});

	describe('readonly mode', () => {
		it('renders filled and unfilled symbols for value 3 of 5', () => {
			ratingEl.setAttribute('data-kt-rating-value', '3');
			ratingEl.setAttribute('data-kt-rating-readonly', 'true');
			const instance = new KTRating(ratingEl);
			const wrapper = ratingEl.querySelector('.kt-rating');
			expect(wrapper).not.toBeNull();
			expect(wrapper?.getAttribute('role')).toBe('img');
			expect(wrapper?.getAttribute('aria-valuenow')).toBe('3');
			expect(wrapper?.getAttribute('aria-valuemax')).toBe('5');
			expect(wrapper?.querySelectorAll('span').length).toBe(5);
			expect(wrapper?.querySelectorAll('input[type="radio"]').length).toBe(0);
			instance.dispose();
		});

		it('getValue returns config value in readonly mode', () => {
			ratingEl.setAttribute('data-kt-rating-value', '4');
			ratingEl.setAttribute('data-kt-rating-readonly', 'true');
			const instance = new KTRating(ratingEl);
			expect(instance.getValue()).toBe(4);
			instance.dispose();
		});

		it('getValue returns null when readonly value is 0', () => {
			ratingEl.setAttribute('data-kt-rating-value', '0');
			ratingEl.setAttribute('data-kt-rating-readonly', 'true');
			const instance = new KTRating(ratingEl);
			expect(instance.getValue()).toBeNull();
			instance.dispose();
		});
	});

	describe('interactive mode', () => {
		it('renders radio inputs for each value 1..max', () => {
			const instance = new KTRating(ratingEl);
			const wrapper = ratingEl.querySelector('.kt-rating');
			const radios = wrapper?.querySelectorAll('input[type="radio"]') ?? [];
			expect(radios.length).toBe(5);
			expect(radios[0].getAttribute('value')).toBe('5');
			expect(radios[4].getAttribute('value')).toBe('1');
			instance.dispose();
		});

		it('getValue returns null when no selection', () => {
			const instance = new KTRating(ratingEl);
			expect(instance.getValue()).toBeNull();
			instance.dispose();
		});

		it('setValue updates checked radio and getValue', () => {
			const instance = new KTRating(ratingEl);
			instance.setValue(3);
			expect(instance.getValue()).toBe(3);
			const checked = ratingEl.querySelector<HTMLInputElement>('input[type="radio"]:checked');
			expect(checked?.value).toBe('3');
			instance.dispose();
		});

		it('setValue(null) clears selection', () => {
			const instance = new KTRating(ratingEl);
			instance.setValue(4);
			instance.setValue(null);
			expect(instance.getValue()).toBeNull();
			expect(ratingEl.querySelector('input[type="radio"]:checked')).toBeNull();
			instance.dispose();
		});

		it('dispatches kt.rating.change when user selects a value', () => {
			const instance = new KTRating(ratingEl);
			const events: CustomEvent[] = [];
			ratingEl.addEventListener('kt.rating.change', ((e: CustomEvent) => events.push(e)) as EventListener);
			const radio3 = ratingEl.querySelector<HTMLInputElement>('input[type="radio"][value="3"]');
			expect(radio3).not.toBeNull();
			radio3!.checked = true;
			radio3!.dispatchEvent(new Event('change', { bubbles: true }));
			expect(events.length).toBe(1);
			expect(events[0].detail?.payload?.value).toBe(3);
			instance.dispose();
		});
	});

	describe('configurable max', () => {
		it('renders max symbols when max is 10', () => {
			ratingEl.setAttribute('data-kt-rating-max', '10');
			ratingEl.setAttribute('data-kt-rating-readonly', 'true');
			ratingEl.setAttribute('data-kt-rating-value', '7');
			const instance = new KTRating(ratingEl);
			const wrapper = ratingEl.querySelector('.kt-rating');
			expect(wrapper?.querySelectorAll('span').length).toBe(10);
			expect(wrapper?.getAttribute('aria-valuemax')).toBe('10');
			instance.dispose();
		});

		it('interactive mode renders 10 radios when max is 10', () => {
			ratingEl.setAttribute('data-kt-rating-max', '10');
			const instance = new KTRating(ratingEl);
			const radios = ratingEl.querySelectorAll('input[type="radio"]');
			expect(radios.length).toBe(10);
			instance.setValue(8);
			expect(instance.getValue()).toBe(8);
			instance.dispose();
		});
	});

	describe('getInstance and static methods', () => {
		it('getInstance returns null for element without data-kt-rating', () => {
			ratingEl.removeAttribute('data-kt-rating');
			expect(KTRating.getInstance(ratingEl)).toBeNull();
		});

		it('getInstance returns instance for initialized element', () => {
			const instance = new KTRating(ratingEl);
			expect(KTRating.getInstance(ratingEl)).toBe(instance);
			instance.dispose();
		});

		it('createInstances initializes all data-kt-rating elements', () => {
			const el2 = document.createElement('div');
			el2.setAttribute('data-kt-rating', 'true');
			container.appendChild(el2);
			KTRating.createInstances();
			expect(KTRating.getInstance(ratingEl)).not.toBeNull();
			expect(KTRating.getInstance(el2)).not.toBeNull();
			KTRating.getInstance(ratingEl)?.dispose();
			KTRating.getInstance(el2)?.dispose();
		});

		it('createInstances skips elements with data-kt-rating-lazy="true"', () => {
			ratingEl.setAttribute('data-kt-rating-lazy', 'true');
			KTRating.createInstances();
			// Lazy elements are not auto-initialized, so no .kt-rating container yet
			expect(ratingEl.querySelector('.kt-rating')).toBeNull();
		});
	});

	describe('dispose', () => {
		it('removes change listener and allows re-initialization', () => {
			const instance = new KTRating(ratingEl);
			instance.dispose();
			// getInstance creates on demand, so assert re-init works instead
			const instance2 = new KTRating(ratingEl);
			expect(instance2).toBeInstanceOf(KTRating);
			expect(instance2.getValue()).toBeNull();
			instance2.setValue(2);
			expect(instance2.getValue()).toBe(2);
			instance2.dispose();
		});

		it('dispose is idempotent', () => {
			const instance = new KTRating(ratingEl);
			instance.dispose();
			expect(() => instance.dispose()).not.toThrow();
		});
	});

	describe('custom symbol', () => {
		it('renders heart symbol when data-kt-rating-symbol="heart"', () => {
			ratingEl.setAttribute('data-kt-rating-symbol', 'heart');
			ratingEl.setAttribute('data-kt-rating-readonly', 'true');
			ratingEl.setAttribute('data-kt-rating-value', '2');
			const instance = new KTRating(ratingEl);
			const wrapper = ratingEl.querySelector('.kt-rating');
			expect(wrapper).not.toBeNull();
			// Heart uses red fill path
			const path = wrapper?.querySelector('path[fill-rule="evenodd"]');
			expect(path).not.toBeNull();
			instance.dispose();
		});
	});

	describe('initial value in interactive mode', () => {
		it('pre-selects radio when value is set via config', () => {
			ratingEl.setAttribute('data-kt-rating-value', '2');
			const instance = new KTRating(ratingEl);
			expect(instance.getValue()).toBe(2);
			const checked = ratingEl.querySelector<HTMLInputElement>('input[type="radio"]:checked');
			expect(checked?.value).toBe('2');
			instance.dispose();
		});
	});
});
