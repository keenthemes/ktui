/**
 * Tests for KTRangeSlider component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTRangeSlider } from '../range-slider';

describe('KTRangeSlider', () => {
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
		it('initializes on wrapper with nested range input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(instance.getElement()).toBe(wrap);
			expect(instance.getRangeInput()).toBe(input);
			expect(instance.getValue()).toBe(40);
			instance.dispose();
		});

		it('initializes on the range input root', () => {
			const input = document.createElement('input');
			input.type = 'range';
			input.setAttribute('data-kt-range-slider', 'true');
			input.min = '0';
			input.max = '50';
			input.value = '25';
			container.appendChild(input);

			const instance = new KTRangeSlider(input);
			expect(instance.getElement()).toBe(input);
			expect(instance.getRangeInput()).toBe(input);
			instance.dispose();
		});

		it('binds to the first range input when multiple exist', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const a = document.createElement('input');
			a.type = 'range';
			a.value = '10';
			const b = document.createElement('input');
			b.type = 'range';
			b.value = '20';
			wrap.appendChild(a);
			wrap.appendChild(b);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(instance.getRangeInput()).toBe(a);
			instance.dispose();
		});

		it('does not initialize without a range input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			container.appendChild(wrap);
			const instance = new KTRangeSlider(wrap);
			expect(instance.getElement()).toBeNull();
			expect(instance.getRangeInput()).toBeNull();
		});
	});

	describe('output binding', () => {
		it('updates output element text on input', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '.rs-out');
			const out = document.createElement('span');
			out.className = 'rs-out';
			wrap.appendChild(out);
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '30';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(out.textContent).toBe('30');

			input.value = '72';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('72');
			instance.dispose();
		});

		it('still updates output if the native range input is replaced', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '.rs-out');

			const out = document.createElement('span');
			out.className = 'rs-out';
			wrap.appendChild(out);

			const input1 = document.createElement('input');
			input1.type = 'range';
			input1.min = '0';
			input1.max = '100';
			input1.value = '30';
			wrap.appendChild(input1);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(out.textContent).toBe('30');

			// Simulate a preview re-render replacing the native input.
			wrap.removeChild(input1);
			const input2 = document.createElement('input');
			input2.type = 'range';
			input2.min = '0';
			input2.max = '100';
			input2.value = '45';
			wrap.appendChild(input2);

			input2.value = '55';
			input2.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('55');

			instance.dispose();
		});

		it('trims and binds output selector within the root', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '  .rs-out  ');

			const out = document.createElement('span');
			out.className = 'rs-out';
			wrap.appendChild(out);

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '20';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(out.textContent).toBe('20');

			input.value = '33';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('33');

			instance.dispose();
		});

		it('falls back to document query for the output selector', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '.rs-doc-out');

			// Not inside the wrapper; should be resolved via document.querySelector.
			const out = document.createElement('span');
			out.className = 'rs-doc-out';
			document.body.appendChild(out);

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '30';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(out.textContent).toBe('30');

			input.value = '90';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('90');

			instance.dispose();
		});

		it('still updates track fill even when output selector does not resolve', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '.does-not-exist');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe('0.4');

			input.value = '100';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe('1');

			instance.dispose();
		});

		it('ignores bubbled input events coming from non-range inputs', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-output', '.rs-out');

			const out = document.createElement('span');
			out.className = 'rs-out';
			wrap.appendChild(out);

			const range = document.createElement('input');
			range.type = 'range';
			range.min = '0';
			range.max = '100';
			range.value = '25';
			wrap.appendChild(range);

			const text = document.createElement('input');
			text.type = 'text';
			text.value = 'hello';
			wrap.appendChild(text);

			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(out.textContent).toBe('25');

			// Event bubbles to wrapper, but should be ignored by handler because target isn't range.
			text.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('25');

			instance.dispose();
		});
	});

	describe('events', () => {
		it('includes native step in kt.range-slider.input detail when step is numeric', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.step = '5';
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				value: 40,
				min: 0,
				max: 100,
				step: 5,
			});

			instance.dispose();
		});

		it('omits step in kt.range-slider.input payload when step="any"', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.step = 'any';
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			const payload = spy.mock.calls[0][0].detail.payload as Record<
				string,
				unknown
			>;

			expect(payload).toMatchObject({ value: 40, min: 0, max: 100 });
			expect(payload).not.toHaveProperty('step');
		});

		it('defaults step to 1 when step attribute is empty', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.setAttribute('step', '');
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				value: 40,
				min: 0,
				max: 100,
				step: 1,
			});
		});

		it('defaults step to 1 when step attribute is invalid', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.step = '-2';
			input.value = '40';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.input', spy);

			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				step: 1,
			});
		});

		it('dispatches kt.range-slider.change on native change', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '10';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.change', spy);

			input.value = '55';
			input.dispatchEvent(new Event('change', { bubbles: true }));
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].detail.payload).toMatchObject({
				value: 55,
			});
		});
	});

	describe('fill CSS variable', () => {
		it('sets --kt-range-fill on the root from value', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '25';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe(
				'0.25',
			);

			input.value = '100';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe('1');
			instance.dispose();
		});

		it('defaults numeric min/max when attributes are invalid', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = 'not-a-number';
			input.max = 'also-not-a-number';
			input.value = '30';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			// ratio = (30 - 0) / (100 - 0) = 0.3
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe('0.3');
		});

		it('sets fill ratio to 0 when max equals min', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '50';
			input.max = '50';
			input.value = '50';
			wrap.appendChild(input);
			container.appendChild(wrap);

			new KTRangeSlider(wrap);
			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe('0');
		});

		it('handles max<min path via _clamp branch', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '10';
			input.max = '0';
			input.value = '5';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);

			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			const value = instance.getValue();

			const clamped = max < min ? value : Math.min(max, Math.max(min, value));
			const ratio = max === min ? 0 : (clamped - min) / (max - min);

			expect(wrap.style.getPropertyValue('--kt-range-fill').trim()).toBe(
				String(ratio),
			);
		});
	});

	describe('dispose', () => {
		it('removes listeners and clears data', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '50';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap);
			const spy = vi.fn();
			wrap.addEventListener('kt.range-slider.input', spy);

			instance.dispose();
			expect(KTRangeSlider.getInstance(wrap)).toBeNull();

			input.value = '80';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('createInstances', () => {
		it('respects data-kt-range-slider-lazy', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			wrap.setAttribute('data-kt-range-slider-lazy', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '20';
			wrap.appendChild(input);
			container.appendChild(wrap);

			KTRangeSlider.createInstances();
			expect(KTRangeSlider.getInstance(wrap)).toBeNull();
		});

		it('is idempotent for the same root', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			wrap.appendChild(input);
			container.appendChild(wrap);

			KTRangeSlider.createInstances();
			const a = KTRangeSlider.getInstance(wrap);
			KTRangeSlider.createInstances();
			const b = KTRangeSlider.getInstance(wrap);
			expect(a).toBe(b);
			a?.dispose();
		});

		it('constructor does not re-init an already-connected instance', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '20';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance1 = new KTRangeSlider(wrap);
			const a = KTRangeSlider.getInstance(wrap);
			// Second constructor call should not create a second instance.
			new KTRangeSlider(wrap);
			const b = KTRangeSlider.getInstance(wrap);

			expect(a).toBe(b);
			expect(a).not.toBeNull();

			instance1?.dispose?.();
		});
	});

	describe('static helpers', () => {
		it('getInstance returns null for empty element input', () => {
			expect(
				KTRangeSlider.getInstance(null as unknown as HTMLElement),
			).toBeNull();
		});

		it('getOrCreateInstance returns null when no range input exists', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			container.appendChild(wrap);

			expect(KTRangeSlider.getOrCreateInstance(wrap)).toBeNull();
		});

		it('getOrCreateInstance creates when range input exists and no instance yet', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			container.appendChild(wrap);

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '20';
			wrap.appendChild(input);

			const instance = KTRangeSlider.getOrCreateInstance(wrap);
			expect(instance).not.toBeNull();
			expect(KTRangeSlider.getInstance(wrap)).toBe(instance);

			instance?.dispose();
		});

		it('getOrCreateInstance returns existing instance when already initialized', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			container.appendChild(wrap);

			const input = document.createElement('input');
			input.type = 'range';
			wrap.appendChild(input);

			const first = new KTRangeSlider(wrap);
			const second = KTRangeSlider.getOrCreateInstance(wrap);
			expect(second).toBe(first);
			first.dispose();
		});
	});

	describe('config + init', () => {
		it('supports output selector from config object', () => {
			const wrap = document.createElement('div');
			const out = document.createElement('span');
			out.className = 'cfg-out';
			wrap.appendChild(out);

			const input = document.createElement('input');
			input.type = 'range';
			input.min = '0';
			input.max = '100';
			input.value = '25';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const instance = new KTRangeSlider(wrap, { output: '.cfg-out' });
			expect(out.textContent).toBe('25');

			input.value = '60';
			input.dispatchEvent(new Event('input', { bubbles: true }));
			expect(out.textContent).toBe('60');
			instance.dispose();
		});

		it('init() initializes eligible slider roots', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			wrap.appendChild(input);
			container.appendChild(wrap);

			KTRangeSlider.init();
			expect(KTRangeSlider.getInstance(wrap)).not.toBeNull();
		});

		it('reinitializes after element is disconnected then reattached', () => {
			const wrap = document.createElement('div');
			wrap.setAttribute('data-kt-range-slider', 'true');
			const input = document.createElement('input');
			input.type = 'range';
			wrap.appendChild(input);
			container.appendChild(wrap);

			const first = new KTRangeSlider(wrap);
			container.removeChild(wrap);
			// disconnected element with previous instance should not be skipped
			const second = new KTRangeSlider(wrap);
			container.appendChild(wrap);

			expect(second.getElement()).toBe(wrap);
			expect(second).not.toBe(first);
			second.dispose();
		});
	});
});
