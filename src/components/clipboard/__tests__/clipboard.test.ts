/**
 * Tests for KTClipboard component
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KTClipboard } from '../clipboard';

function flushPromises() {
	return new Promise<void>((resolve) => {
		setTimeout(() => resolve(), 0);
	});
}

function createFixture(options?: {
	withPredefinedText?: boolean;
	predefinedTextValue?: string;
	predefinedTextAttributeEmpty?: boolean;
	action?: 'copy' | 'cut';
	withTarget?: boolean;
	targetExists?: boolean;
	targetType?: 'input' | 'textarea' | 'div';
	targetValue?: string;
	targetTextContent?: string;
}) {
	document.body.innerHTML = '';

	const targetType = options?.targetType ?? 'input';
	const targetId = 'kt-clipboard-target';
	const targetExists = options?.targetExists ?? true;

	const container = document.createElement('div');

	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.setAttribute('data-kt-clipboard', 'true');

	if (options?.action) {
		trigger.setAttribute('data-kt-clipboard-action', options.action);
	}

	if (options?.withTarget) {
		trigger.setAttribute('data-kt-clipboard-target', `#${targetId}`);
	}

	if (options?.withPredefinedText) {
		if (options.predefinedTextAttributeEmpty) {
			trigger.setAttribute('data-kt-clipboard-text', '');
		} else {
			trigger.setAttribute(
				'data-kt-clipboard-text',
				options.predefinedTextValue ?? '',
			);
		}
	}

	trigger.textContent = 'Copy';
	container.appendChild(trigger);

	if (targetExists && options?.withTarget) {
		if (targetType === 'input') {
			const input = document.createElement('input');
			input.id = targetId;
			input.value = options?.targetValue ?? 'input value';
			container.appendChild(input);
		} else if (targetType === 'textarea') {
			const textarea = document.createElement('textarea');
			textarea.id = targetId;
			textarea.value = options?.targetValue ?? 'textarea value';
			container.appendChild(textarea);
		} else {
			const div = document.createElement('div');
			div.id = targetId;
			div.textContent = options?.targetTextContent ?? 'div text';
			container.appendChild(div);
		}
	}

	document.body.appendChild(container);

	return { container, trigger };
}

describe('KTClipboard', () => {
	let originalExecCommand: any;

	beforeEach(() => {
		// Ensure a clean clipboard state between tests.
		originalExecCommand = document.execCommand;
	});

	afterEach(() => {
		document.body.innerHTML = '';
		// Restore execCommand (if it was replaced).
		document.execCommand = originalExecCommand as any;
	});

	it('copies predefined text (text wins over target)', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'hello',
			withTarget: true,
			targetExists: false, // target selector is missing; text must still win
			action: 'copy',
		});

		const successEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.success', (e) =>
			successEvents.push(e as CustomEvent),
		);
		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();

		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledTimes(1);
		expect(writeTextMock).toHaveBeenCalledWith('hello');
		expect(successEvents.length).toBe(1);
		expect(errorEvents.length).toBe(0);
	});

	it('falls back to execCommand when Clipboard API is unavailable', async () => {
		Object.defineProperty(navigator, 'clipboard', {
			value: undefined,
			configurable: true,
		});

		const execCommandMock = vi.fn().mockReturnValue(true);
		document.execCommand = execCommandMock as any;

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'fallback text',
			action: 'copy',
		});

		const successEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.success', (e) =>
			successEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(execCommandMock).toHaveBeenCalledWith('copy');
		expect(successEvents.length).toBe(1);
	});

	it('dispatches error if fallback execCommand fails', async () => {
		Object.defineProperty(navigator, 'clipboard', {
			value: undefined,
			configurable: true,
		});

		const execCommandMock = vi.fn().mockReturnValue(false);
		document.execCommand = execCommandMock as any;

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'will fail',
			action: 'copy',
		});

		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(execCommandMock).toHaveBeenCalledWith('copy');
		expect(errorEvents.length).toBe(1);
	});

	it('dispatches error when data-kt-clipboard-text attribute is present but empty (and ignores target)', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextAttributeEmpty: true,
			withTarget: true,
			targetType: 'input',
			targetValue: 'should not be used',
			action: 'copy',
		});

		const successEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.success', (e) =>
			successEvents.push(e as CustomEvent),
		);
		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).not.toHaveBeenCalled();
		expect(successEvents.length).toBe(0);
		expect(errorEvents.length).toBe(1);
	});

	it('dispatches error when Clipboard API writeText rejects', async () => {
		const writeTextMock = vi
			.fn()
			.mockRejectedValue(new Error('NotAllowedError: permission denied'));
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'hello',
			action: 'copy',
		});

		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledTimes(1);
		expect(errorEvents.length).toBe(1);
	});

	it('dispatches error for cut with predefined text when target is missing', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'hello',
			withTarget: false,
			action: 'cut',
		});

		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).not.toHaveBeenCalled();
		expect(errorEvents.length).toBe(1);
	});

	it('copies from input target value', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: false,
			withTarget: true,
			targetType: 'input',
			targetValue: 'input value',
			action: 'copy',
		});

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledTimes(1);
		expect(writeTextMock).toHaveBeenCalledWith('input value');
	});

	it('copies from non-input target textContent', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: false,
			withTarget: true,
			targetType: 'div',
			targetTextContent: 'div text content',
			action: 'copy',
		});

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledTimes(1);
		expect(writeTextMock).toHaveBeenCalledWith('div text content');
	});

	it('dispatches error when selector misses and no predefined text exists', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: false,
			withTarget: true,
			targetExists: false,
			action: 'copy',
		});

		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).not.toHaveBeenCalled();
		expect(errorEvents.length).toBe(1);
	});

	it('dispatches error for cut when target is not input/textarea', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: false,
			withTarget: true,
			targetType: 'div',
			targetTextContent: 'not cuttable',
			action: 'cut',
		});

		const errorEvents: CustomEvent[] = [];
		trigger.addEventListener('kt.clipboard.error', (e) =>
			errorEvents.push(e as CustomEvent),
		);

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).not.toHaveBeenCalled();
		expect(errorEvents.length).toBe(1);
	});

	it('cuts from input target (clears value on success)', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: false,
			withTarget: true,
			targetType: 'input',
			targetValue: 'cut value',
			action: 'cut',
		});

		const input = document.getElementById(
			'kt-clipboard-target',
		) as HTMLInputElement;
		expect(input.value).toBe('cut value');

		new KTClipboard(trigger);
		trigger.click();
		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledWith('cut value');
		expect(input.value).toBe('');
	});

	it('is idempotent: createInstances does not double bind', async () => {
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: writeTextMock },
			configurable: true,
		});

		const { trigger } = createFixture({
			withPredefinedText: true,
			predefinedTextValue: 'once',
			action: 'copy',
		});

		// Explicit instance creation.
		new KTClipboard(trigger);

		// Should not create another handler on the same element.
		KTClipboard.createInstances();

		trigger.click();
		await flushPromises();

		expect(writeTextMock).toHaveBeenCalledTimes(1);
	});

	it('returns null for getInstance on non-initialized trigger', () => {
		document.body.innerHTML = '';
		const trigger = document.createElement('button');
		trigger.setAttribute('data-kt-clipboard', 'true');
		document.body.appendChild(trigger);

		expect(KTClipboard.getInstance(trigger)).toBeNull();
	});
});
