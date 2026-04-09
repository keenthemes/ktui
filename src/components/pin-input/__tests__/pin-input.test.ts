/**
 * Tests for KTPinInput
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTPinInput } from '../pin-input';

function dispatchPaste(target: HTMLElement, text: string): boolean {
	const ev = new Event('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(ev, 'clipboardData', {
		value: {
			getData: (type: string) =>
				type === 'text' || type === 'text/plain' ? text : '',
		},
	});
	return target.dispatchEvent(ev);
}

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

	it('routes a second digit to the next cell when the current cell is full', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '5';
		inputs[0].focus();
		inputs[0].setSelectionRange(1, 1);
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '6',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('5');
		expect(inputs[1].value).toBe('6');
		expect(document.activeElement).toBe(inputs[2]);
		instance.dispose();
	});

	it('sets maxLength 1 on each cell', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		expect(inputs[0].maxLength).toBe(1);
		expect(inputs[1].maxLength).toBe(1);
		instance.dispose();
	});

	it('backspace clears non-empty focused cell', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '4';
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Backspace',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('');
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
		const ev = new KeyboardEvent('keydown', {
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

	it('getInstance returns null for falsy element', () => {
		expect(KTPinInput.getInstance(null as unknown as HTMLElement)).toBeNull();
	});

	it('getOrCreateInstance returns existing instance', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const a = KTPinInput.getOrCreateInstance(root);
		const b = KTPinInput.getOrCreateInstance(root);
		expect(a).toBe(b);
		a?.dispose();
	});

	it('init delegates to createInstances', () => {
		const root = createPinRoot({ count: 1 });
		document.body.appendChild(root);
		KTPinInput.init();
		expect(KTPinInput.getInstance(root)).toBeTruthy();
		KTPinInput.getInstance(root)?.dispose();
		root.remove();
	});

	it('createInstances initializes non-lazy roots in document', () => {
		const root = createPinRoot({ count: 2 });
		document.body.appendChild(root);
		KTPinInput.createInstances();
		const inst = KTPinInput.getInstance(root);
		expect(inst).toBeTruthy();
		inst?.dispose();
		root.remove();
	});

	it('does not register instance when root has no items', () => {
		const root = document.createElement('div');
		root.setAttribute('data-kt-pin-input', 'true');
		container.appendChild(root);
		new KTPinInput(root);
		expect(KTPinInput.getInstance(root)).toBeNull();
	});

	it('skips second constructor when instance already on connected root', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const first = new KTPinInput(root);
		const second = new KTPinInput(root);
		expect(KTPinInput.getInstance(root)).toBe(first);
		expect(second).not.toBe(first);
		first.dispose();
	});

	it('Home and End move focus to first and last cell', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[1].focus();
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Home',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[0]);
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'End',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[2]);
		instance.dispose();
	});

	it('ignores printable keys with ctrl modifier', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].value = '';
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '1',
				ctrlKey: true,
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('');
		instance.dispose();
	});

	it('keydown ignores disabled pin item as target', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].disabled = true;
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '1',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('');
		instance.dispose();
	});

	it('keydown ignores events whose target is not a pin cell', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const ev = new KeyboardEvent('keydown', {
			key: '1',
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(ev, 'target', {
			value: document.body,
			enumerable: true,
		});
		root.dispatchEvent(ev);
		instance.dispose();
	});

	it('reuses existing hidden field when present', () => {
		const root = createPinRoot({
			count: 1,
			attrs: { 'data-kt-pin-input-name': 'code' },
		});
		const existing = document.createElement('input');
		existing.type = 'hidden';
		existing.name = 'code';
		existing.setAttribute('data-kt-pin-input-hidden', 'true');
		root.appendChild(existing);
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const hiddens = root.querySelectorAll(
			'input[type="hidden"][data-kt-pin-input-hidden]',
		);
		expect(hiddens.length).toBe(1);
		expect(hiddens[0]).toBe(existing);
		instance.dispose();
	});

	it('falls back to digits when availableChars is invalid regex', () => {
		const root = createPinRoot({
			attrs: { 'data-kt-pin-input-available-chars': '(' },
		});
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '7',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('7');
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'a',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('7');
		instance.dispose();
	});

	it('paste distributes filtered digits', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		dispatchPaste(inputs[0], '8x9');
		expect(inputs[0].value).toBe('8');
		expect(inputs[1].value).toBe('9');
		expect(inputs[2].value).toBe('');
		instance.dispose();
	});

	it('paste with empty text is a no-op for values', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '1';
		inputs[0].focus();
		dispatchPaste(inputs[0], '');
		expect(inputs[0].value).toBe('1');
		instance.dispose();
	});

	it('paste ignores events whose target is not a pin cell', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const ev = new Event('paste', { bubbles: true, cancelable: true });
		Object.defineProperty(ev, 'clipboardData', {
			value: { getData: () => '99' },
		});
		Object.defineProperty(ev, 'target', {
			value: document.body,
			enumerable: true,
		});
		root.dispatchEvent(ev);
		instance.dispose();
	});

	it('beforeinput insertFromPaste is prevented (paste handler applies)', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertFromPaste',
		});
		const prevented = !inputs[0].dispatchEvent(ev);
		expect(prevented).toBe(true);
		instance.dispose();
	});

	it('beforeinput insertText multi-char distributes', () => {
		const root = createPinRoot({ count: 3 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: '12',
			}),
		);
		expect(inputs[0].value).toBe('1');
		expect(inputs[1].value).toBe('2');
		instance.dispose();
	});

	it('beforeinput multi-char with no valid chars does not fill cells', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: 'ab',
			}),
		);
		expect(inputs[0].value).toBe('');
		expect(inputs[1].value).toBe('');
		instance.dispose();
	});

	it('beforeinput rejects invalid single character', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertText',
			data: 'z',
		});
		expect(inputs[0].dispatchEvent(ev)).toBe(false);
		instance.dispose();
	});

	it('beforeinput routes overflow digit when cell is full', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '3';
		inputs[0].focus();
		inputs[0].setSelectionRange(1, 1);
		inputs[0].dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: '4',
			}),
		);
		expect(inputs[0].value).toBe('3');
		expect(inputs[1].value).toBe('4');
		instance.dispose();
	});

	it('beforeinput insertFromYank is prevented', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertFromYank',
		});
		expect(inputs[0].dispatchEvent(ev)).toBe(false);
		instance.dispose();
	});

	it('beforeinput ignores events whose target is not a pin cell', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const ev = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertText',
			data: '1',
		});
		Object.defineProperty(ev, 'target', {
			value: document.body,
			enumerable: true,
		});
		root.dispatchEvent(ev);
		instance.dispose();
	});

	it('beforeinput without inputType is ignored', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		root.dispatchEvent(new Event('beforeinput', { bubbles: true }));
		instance.dispose();
	});

	it('beforeinput non-insertText inputType returns early', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'deleteContentBackward',
				data: null,
			}),
		);
		instance.dispose();
	});

	it('beforeinput insertText with empty data returns early', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new InputEvent('beforeinput', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: '',
			}),
		);
		instance.dispose();
	});

	it('beforeinput skips when isComposing', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		const ev = new InputEvent('beforeinput', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertText',
			data: '1',
		});
		Object.defineProperty(ev, 'isComposing', { value: true });
		inputs[0].dispatchEvent(ev);
		instance.dispose();
	});

	it('input event advances focus for single digit without keydown', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].value = '5';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		expect(document.activeElement).toBe(inputs[1]);
		instance.dispose();
	});

	it('input clears invalid single character', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].value = 'x';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		expect(inputs[0].value).toBe('');
		instance.dispose();
	});

	it('input multi-character with all invalid clears and syncs', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].value = 'xy';
		inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
		expect(inputs[0].value).toBe('');
		expect(inputs[1].value).toBe('');
		instance.dispose();
	});

	it('input ignores events from non-item targets', () => {
		const root = createPinRoot({ count: 1 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const ev = new Event('input', { bubbles: true });
		Object.defineProperty(ev, 'target', {
			value: document.body,
			enumerable: true,
		});
		root.dispatchEvent(ev);
		instance.dispose();
	});

	it('replace selection in cell types new digit in same cell', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '1';
		inputs[0].focus();
		inputs[0].setSelectionRange(0, 1);
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '9',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('9');
		expect(inputs[1].value).toBe('');
		instance.dispose();
	});

	it('typing on last full cell does not change next (none)', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].value = '1';
		inputs[1].value = '2';
		inputs[1].focus();
		inputs[1].setSelectionRange(1, 1);
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: '3',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(inputs[0].value).toBe('1');
		expect(inputs[1].value).toBe('2');
		instance.dispose();
	});

	it('setValue coerces non-string like empty', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		instance.setValue(null as unknown as string);
		expect(instance.getValue()).toBe('');
		instance.dispose();
	});

	it('arrow past boundary does not throw', () => {
		const root = createPinRoot({ count: 2 });
		container.appendChild(root);
		const instance = new KTPinInput(root);
		const inputs = root.querySelectorAll<HTMLInputElement>(
			'[data-kt-pin-input-item]',
		);
		inputs[0].focus();
		inputs[0].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[0]);
		inputs[1].focus();
		inputs[1].dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(document.activeElement).toBe(inputs[1]);
		instance.dispose();
	});
});
