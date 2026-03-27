/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export type KTClipboardActionType = 'copy' | 'cut';

export interface KTClipboardConfigInterface {
	/**
	 * CSS selector for the element to read from when copying from target.
	 * For `input`/`textarea`, reads `.value`; for other elements, reads `.textContent`.
	 */
	target?: string;

	/**
	 * Static string to copy. Takes precedence over `target` when both are present.
	 */
	text?: string;

	/**
	 * Clipboard action to perform.
	 * - `copy` (default)
	 * - `cut` (only valid for `input`/`textarea` targets)
	 */
	action?: KTClipboardActionType;

	/**
	 * Optional class toggled on the trigger when copy/cut succeeds.
	 */
	copiedClass?: string;

	/**
	 * Optional DOM event name dispatched on success.
	 * Defaults to `kt.clipboard.success`.
	 */
	successEvent?: string;

	/**
	 * Optional DOM event name dispatched on failure.
	 * Defaults to `kt.clipboard.error`.
	 */
	errorEvent?: string;
}

export interface KTClipboardInterface {
	getOption(name: string): unknown;
	getElement(): HTMLElement | null;
	on(eventType: string, callback: CallableFunction): string;
	off(eventType: string, eventId: string): void;
	dispose(): void;
}
