/**
 * Tests for KTInputNumber component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTInputNumber } from '../input-number';

describe('KTInputNumber', () => {
	let container: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		container = document.createElement('div');
		container.id = 'test-container';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('initialization', () => {
		it('initializes on wrapper with nested number input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '10';
			input.value = '3';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			expect(instance.getElement()).toBe(wrap);
			expect(instance.getNumberInput()).toBe(input);
			expect(instance.getValue()).toBe(3);
			instance.dispose();
		});

		it('initializes on the number input root', () => {
			const input = document.createElement('input');
			input.type = 'number';
			input.setAttribute('data-kt-input-number', 'true');
			input.min = '0';
			input.max = '5';
			input.value = '2';
			container.appendChild(input);

			const instance = new KTInputNumber(input);
			expect(instance.getElement()).toBe(input);
			expect(instance.getNumberInput()).toBe(input);
			instance.dispose();
		});

		it('binds to the first number input when multiple exist', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const a = document.createElement('input');
			a.type = 'number';
			a.value = '1';
			const b = document.createElement('input');
			b.type = 'number';
			b.value = '2';
			wrap.appendChild(a);
			wrap.appendChild(b);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			expect(instance.getNumberInput()).toBe(a);
			instance.dispose();
		});

		it('does not initialize without a number input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			container.appendChild(wrap);
			const instance = new KTInputNumber(wrap);
			expect(instance.getElement()).toBeNull();
			expect(instance.getNumberInput()).toBeNull();
		});
	});

	describe('events', () => {
		it('dispatches kt.input-number.input with payload on native input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '100';
			input.step = '2';
			input.value = '4';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.input-number.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				value: 4,
				valueAsString: '4',
				min: 0,
				max: 100,
				step: 2,
			});

			instance.dispose();
		});

		it('dispatches kt.input-number.change on native change', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.value = '7';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.input-number.change', spy);

			input.dispatchEvent(new Event('change', { bubbles: true }));
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].detail.payload.value).toBe(7);

			instance.dispose();
		});

		it('uses null value when input is empty', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.value = '';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.input-number.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				value: null,
				valueAsString: '',
			});

			instance.dispose();
		});

		it('omits step in payload when step="any"', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '10';
			input.step = 'any';
			input.value = '3';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTInputNumber(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.input-number.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy.mock.calls[0][0].detail.payload.step).toBeUndefined();

			KTInputNumber.getInstance(wrap)?.dispose();
		});
	});

	describe('increment and decrement', () => {
		it('stepUp increases value by step within max', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '10';
			input.step = '2';
			input.value = '4';
			const inc = document.createElement('button');
			inc.type = 'button';
			inc.setAttribute('data-kt-input-number-increment', 'true');
			wrap.appendChild(inc);
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			expect(input.value).toBe('6');
			instance.dispose();
		});

		it('stepDown decreases value by step within min', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '10';
			input.step = '3';
			input.value = '6';
			const dec = document.createElement('button');
			dec.type = 'button';
			dec.setAttribute('data-kt-input-number-decrement', 'true');
			wrap.appendChild(dec);
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			dec.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			expect(input.value).toBe('3');
			instance.dispose();
		});

		it('does not adjust when input is disabled', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '10';
			input.value = '5';
			input.disabled = true;
			const inc = document.createElement('button');
			inc.type = 'button';
			inc.setAttribute('data-kt-input-number-increment', 'true');
			wrap.appendChild(inc);
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			expect(input.value).toBe('5');
			instance.dispose();
		});
	});

	describe('dispose', () => {
		it('removes listeners and clears instance', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.value = '1';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTInputNumber(wrap);
			instance.dispose();
			expect(KTInputNumber.getInstance(wrap)).toBeNull();
		});
	});

	describe('createInstances', () => {
		it('skips lazy roots', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-input-number', 'true');
			wrap.setAttribute('data-kt-input-number-lazy', 'true');
			const input = document.createElement('input');
			input.type = 'number';
			input.value = '1';
			wrap.appendChild(input);
			container.appendChild(wrap);

			KTInputNumber.createInstances();
			expect(KTInputNumber.getInstance(wrap)).toBeNull();
		});
	});
});
