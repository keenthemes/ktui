/**
 * Tests for KTPinInput
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTPinInput } from '../pin-input';

function createPinRoot(
	opts: { count?: number; attrs?: Record<string, string> } = {},
): HTMLElement {
	const { count = 4, attrs = {} } = opts;
	const root = document.createElement('div');
	root.setAttribute('data-kt-pin-input', 'true');
	for (const [k, v] of Object.entries(attrs)) {
		root.setAttribute(k, v);
	}
	for (let i = 0; i < count; i++) {
		const input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('data-kt-pin-input-item', 'true');
		root.appendChild(input);
	}
	return root;
}

describe('KTPinInput', () => {
	let container: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('initializes and stores instance on root', () => {
		const root = createPinRoot();
		container.appendChild(root);
		const instance = new KTPinInput(root);
		expect(instance.getElement()).toBe(root);
		expect(KTPinInput.getInstance(root)).toBe(instance);
		instance.dispose();
	});

	it('returns null from getOrCreateInstance when no items', () => {
		const root = document.createElement('div');
		root.setAttribute('data-kt-pin-input', 'true');
		container.appendChild(root);
		expect(KTPinInput.getOrCreateInstance(root)).toBeNull();
	});

	it('types digit and moves focus forward', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new KeyboardEvent('keydown', {
			key: '5',
			bubbles: true,
			cancelable: true,
		});
		inputs[0].dispatchEvent(ev);
		expect(inputs[0].value).toBe('5');
		expect(document.activeElement).toBe(inputs[1]);
		instance.dispose();
	});

	it('backspace clears cell then moves to previous when empty', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '1';
		inputs[1].focus();
		let ev = new KeyboardEvent('keydown', {
			key: 'Backspace',
			bubbles: true,
			cancelable: true,
		});
		inputs[1].dispatchEvent(ev);
		expect(inputs[1].value).toBe('');
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Backspace',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[0]);
		expect(inputs[0].value).toBe('1');
		instance.dispose();
	});

	it('arrow keys move focus', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[1].focus();
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[0]);
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[1]);
		instance.dispose();
	});

	it('distributes multi-character input (paste / autofill path)', () => {
		const root = createPinRoot({ count: 4 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].value = '12ab34';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		expect(inputs[0].value).toBe('1');
		expect(inputs[1].value).toBe('2');
		expect(inputs[2].value).toBe('3');
		expect(inputs[3].value).toBe('4');
		instance.dispose();
	});

	it('numeric pattern rejects letters', () => {
		const root = createPinRoot();
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new KeyboardEvent('keydown', {
			key: 'a',
			bubbles: true,
			cancelable: true,
		});
		inputs[0].dispatchEvent(ev);
		expect(inputs[0].value).toBe('');
		instance.dispose();
	});

	it('custom availableChars allows hex', () => {
		const root = createPinRoot({
			attrs: { 'data-kt-pin-input-available-chars': '[0-9a-fA-F]' },
		});
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'a',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('a');
		instance.dispose();
	});

	it('fires complete when all cells filled', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		const completes: unknown[] = [];
		root.addEventListener('kt.pin-input.complete', (e) => {
			completes.push((e as CustomEvent).detail?.payload);
		});
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '1',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(completes.length).toBe(0);
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '2',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(completes.length).toBe(1);
		expect((completes[0] as { value: string }).value).toBe('12');
		expect((completes[0] as { complete: boolean }).complete).toBe(true);
		instance.dispose();
	});

	it('skips disabled cells in paste distribution', () => {
		const root = createPinRoot({ count: 4 });
		container.appendChild(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[2].disabled = true;
		const instance = new KTPinInput(root);
		inputs[0].focus();
		inputs[0].value = '123';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		expect(inputs[0].value).toBe('1');
		expect(inputs[1].value).toBe('2');
		expect(inputs[2].value).toBe('');
		expect(inputs[3].value).toBe('3');
		instance.dispose();
	});

	it('getValue and setValue', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		instance.setValue('789');
		expect(instance.getValue()).toBe('789');
		instance.setValue('');
		expect(instance.getValue()).toBe('');
		instance.dispose();
	});

	it('dispose removes instance and listeners', () => {
		const root = createPinRoot();
		container.appendChild(root);
		const instance = new KTPinInput(root);
		instance.dispose();
		expect(KTPinInput.getInstance(root)).toBeNull();
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '1',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('');
	});

	it('syncs hidden input when name is set', () => {
		const root = createPinRoot({
			count: 2,
			attrs: { 'data-kt-pin-input-name': 'otp' },
		});
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const hidden = root.querySelector<HTMLInputElement>(
			'input[type="hidden"][data-kt-pin-input-hidden]',
		);
		expect(hidden).toBeTruthy();
		expect(hidden?.name).toBe('otp');
		instance.setValue('42');
		expect(hidden?.value).toBe('42');
		instance.dispose();
	});

	it('lazy roots are skipped by createInstances', () => {
		const root = createPinRoot();
		root.setAttribute('data-kt-pin-input-lazy', 'true');
		container.appendChild(root);
		KTPinInput.createInstances();
		expect(KTPinInput.getInstance(root)).toBeNull();
	});
});
