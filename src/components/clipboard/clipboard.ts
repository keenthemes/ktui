/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import {
	KTClipboardActionType,
	KTClipboardConfigInterface,
	KTClipboardInterface,
} from './types';

type KTClipboardEventPayload = {
	action: KTClipboardActionType;
	text: string | null;
	target: string | null;
	error?: string;
};

declare global {
	interface Window {
		KTClipboard: typeof KTClipboard;
	}
}

export class KTClipboard extends KTComponent implements KTClipboardInterface {
	protected override _name: string = 'clipboard';

	protected override _defaultConfig: KTClipboardConfigInterface = {
		target: '',
		text: '',
		action: 'copy',
		copiedClass: '',
		successEvent: 'kt.clipboard.success',
		errorEvent: 'kt.clipboard.error',
	};

	protected override _config: KTClipboardConfigInterface = this
		._defaultConfig as KTClipboardConfigInterface;

	private _activateHandler: ((event: Event) => void) | null = null;

	constructor(
		element: HTMLElement,
		config: KTClipboardConfigInterface | null = null,
	) {
		super();

		// Ensure we don't double bind handlers on the same trigger.
		if (this._shouldSkipInit(element)) {
			return;
		}

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;

		this._activateHandler = this._handleActivate.bind(this);
		this._element.addEventListener('click', this._activateHandler);
	}

	private _getSuccessEventName(): string {
		const eventName = this._getOption('successEvent');
		return typeof eventName === 'string' && eventName.length > 0
			? eventName
			: 'kt.clipboard.success';
	}

	private _getErrorEventName(): string {
		const eventName = this._getOption('errorEvent');
		return typeof eventName === 'string' && eventName.length > 0
			? eventName
			: 'kt.clipboard.error';
	}

	private _getAction(): KTClipboardActionType {
		const action = this._getOption('action');
		return action === 'cut' ? 'cut' : 'copy';
	}

	private _getTrimmedString(optionValue: unknown): string {
		return typeof optionValue === 'string' ? optionValue.trim() : '';
	}

	private _getPredefinedText(): string {
		const text = this._getOption('text');
		return this._getTrimmedString(text);
	}

	private _getTargetSelector(): string {
		const target = this._getOption('target');
		return this._getTrimmedString(target);
	}

	private _getCopiedClass(): string {
		const copiedClass = this._getOption('copiedClass');
		return this._getTrimmedString(copiedClass);
	}

	private _setCopiedClass(shouldSet: boolean): void {
		const copiedClass = this._getCopiedClass();
		if (!copiedClass || !this._element) return;

		// Keep deterministic behavior: remove any previous state before toggling.
		KTDom.removeClass(this._element, copiedClass);
		if (shouldSet) {
			KTDom.addClass(this._element, copiedClass);
		}
	}

	private _isInputLike(element: HTMLElement): boolean {
		return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
	}

	private _readTargetValue(target: HTMLElement): string {
		if (this._isInputLike(target)) {
			return (target as HTMLInputElement | HTMLTextAreaElement).value ?? '';
		}

		return target.textContent ?? '';
	}

	private _execCommandCopy(text: string): boolean {
		const textarea = document.createElement('textarea');
		textarea.value = text;

		// Avoid scrolling to bottom on iOS/Safari and keep it out of layout.
		textarea.style.position = 'fixed';
		textarea.style.top = '0';
		textarea.style.left = '0';
		textarea.style.opacity = '0';
		textarea.style.pointerEvents = 'none';

		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		// Some browsers require explicit range selection.
		textarea.setSelectionRange(0, textarea.value.length);

		try {
			return document.execCommand('copy');
		} catch {
			return false;
		} finally {
			textarea.remove();
		}
	}

	private async _writeText(text: string): Promise<boolean> {
		// Native Clipboard API (requires secure context).
		const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
		const writeText =
			clipboard && typeof clipboard.writeText === 'function'
				? clipboard.writeText.bind(clipboard)
				: null;

		if (writeText) {
			await writeText(text);
			return true;
		}

		const ok = this._execCommandCopy(text);
		if (!ok) {
			throw new Error('Clipboard copy failed.');
		}

		return true;
	}

	private async _handleActivate(event: Event): Promise<void> {
		event.preventDefault();

		const action = this._getAction();
		const successEventName = this._getSuccessEventName();
		const errorEventName = this._getErrorEventName();
		const textFromConfig = this._getPredefinedText();
		const targetSelector = this._getTargetSelector();
		const hasPredefinedText = Boolean(
			this._element?.hasAttribute('data-kt-clipboard-text'),
		);

		// Deterministic precedence:
		// - If `data-kt-clipboard-text` attribute is present, it wins over target.
		if (hasPredefinedText) {
			let targetElForCut: HTMLElement | null = null;

			// `cut` requires an editable target (input/textarea) even when predefined text is used.
			if (action === 'cut') {
				if (!targetSelector) {
					this._setCopiedClass(false);

					const payload: KTClipboardEventPayload = {
						action,
						text: null,
						target: null,
						error:
							'Cut action requires data-kt-clipboard-target pointing to an input/textarea.',
					};

					this._fireEvent(errorEventName, payload);
					this._dispatchEvent(errorEventName, payload);
					return;
				}

				targetElForCut = KTDom.getElement(
					targetSelector,
				) as HTMLElement | null;

				if (!targetElForCut || !this._isInputLike(targetElForCut)) {
					this._setCopiedClass(false);

					const payload: KTClipboardEventPayload = {
						action,
						text: null,
						target: targetSelector,
						error: 'Cut action is only supported for input/textarea targets.',
					};

					this._fireEvent(errorEventName, payload);
					this._dispatchEvent(errorEventName, payload);
					return;
				}
			}

			// Treat empty/whitespace-only predefined text as invalid.
			if (!textFromConfig) {
				this._setCopiedClass(false);

				const payload: KTClipboardEventPayload = {
					action,
					text: null,
					target: targetSelector || null,
					error: 'Predefined clipboard text is empty.',
				};

				this._fireEvent(errorEventName, payload);
				this._dispatchEvent(errorEventName, payload);
				return;
			}

			try {
				await this._writeText(textFromConfig);

				// For `cut`, clear the editable target after successful clipboard write.
				if (action === 'cut' && targetElForCut) {
					(targetElForCut as HTMLInputElement | HTMLTextAreaElement).value =
						'';
					targetElForCut.dispatchEvent(
						new Event('input', { bubbles: true }),
					);
				}

				this._setCopiedClass(true);

				const payload: KTClipboardEventPayload = {
					action,
					text: textFromConfig,
					target: targetSelector || null,
				};

				this._fireEvent(successEventName, payload);
				this._dispatchEvent(successEventName, payload);
			} catch (error) {
				this._setCopiedClass(false);

				const payload: KTClipboardEventPayload = {
					action,
					text: textFromConfig,
					target: targetSelector || null,
					error:
						error instanceof Error ? error.message : String(error ?? 'Unknown'),
				};

				this._fireEvent(errorEventName, payload);
				this._dispatchEvent(errorEventName, payload);
			}

			return;
		}

		// No usable predefined text; copy from target.
		if (!targetSelector) {
			this._setCopiedClass(false);

			const payload: KTClipboardEventPayload = {
				action,
				text: null,
				target: null,
				error: 'Missing clipboard source (provide data-kt-clipboard-text or data-kt-clipboard-target).',
			};

			this._fireEvent(errorEventName, payload);
			this._dispatchEvent(errorEventName, payload);
			return;
		}

		const targetEl = KTDom.getElement(targetSelector) as HTMLElement | null;
		if (!targetEl) {
			this._setCopiedClass(false);

			const payload: KTClipboardEventPayload = {
				action,
				text: null,
				target: targetSelector,
				error: `Clipboard target not found: ${targetSelector}`,
			};

			this._fireEvent(errorEventName, payload);
			this._dispatchEvent(errorEventName, payload);
			return;
		}

		const value = this._readTargetValue(targetEl).trim();
		if (!value) {
			this._setCopiedClass(false);

			const payload: KTClipboardEventPayload = {
				action,
				text: null,
				target: targetSelector,
				error: 'Target content is empty.',
			};

			this._fireEvent(errorEventName, payload);
			this._dispatchEvent(errorEventName, payload);
			return;
		}

		// Cut action: only allowed for input/textarea.
		if (action === 'cut' && !this._isInputLike(targetEl)) {
			this._setCopiedClass(false);

			const payload: KTClipboardEventPayload = {
				action,
				text: null,
				target: targetSelector,
				error: 'Cut action is only supported for input/textarea targets.',
			};

			this._fireEvent(errorEventName, payload);
			this._dispatchEvent(errorEventName, payload);
			return;
		}

		try {
			await this._writeText(value);
			this._setCopiedClass(true);

			if (action === 'cut') {
				(targetEl as HTMLInputElement | HTMLTextAreaElement).value = '';
				targetEl.dispatchEvent(new Event('input', { bubbles: true }));
			}

			const payload: KTClipboardEventPayload = {
				action,
				text: value,
				target: targetSelector,
			};

			this._fireEvent(successEventName, payload);
			this._dispatchEvent(successEventName, payload);
		} catch (error) {
			this._setCopiedClass(false);

			const payload: KTClipboardEventPayload = {
				action,
				text: null,
				target: targetSelector,
				error:
					error instanceof Error ? error.message : String(error ?? 'Unknown'),
			};

			this._fireEvent(errorEventName, payload);
			this._dispatchEvent(errorEventName, payload);
		}
	}

	public override dispose(): void {
		if (this._element && this._activateHandler) {
			this._element.removeEventListener('click', this._activateHandler);
		}
		this._activateHandler = null;
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTClipboard | null {
		if (!element) return null;
		if (KTData.has(element, 'clipboard')) {
			return KTData.get(element, 'clipboard') as KTClipboard;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTClipboardConfigInterface,
	): KTClipboard {
		return this.getInstance(element) || new KTClipboard(element, config ?? undefined);
	}

	public static createInstances(): void {
		document.querySelectorAll('[data-kt-clipboard]').forEach((el) => {
			new KTClipboard(el as HTMLElement);
		});
	}

	public static init(): void {
		KTClipboard.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTClipboard = KTClipboard;
}

