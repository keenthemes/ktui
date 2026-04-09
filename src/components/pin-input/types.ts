/**
 * KtUI - PIN / OTP multi-field input
 */

export interface KTPinInputConfigInterface {
	/**
	 * When true, skip auto-init; initialize manually with `getOrCreateInstance`.
	 */
	lazy?: boolean;

	/**
	 * Regular expression pattern string tested against **each** typed or pasted character.
	 * Default `[0-9]` (digits only). Examples: `[0-9a-fA-F]` (hex), `[a-zA-Z0-9]` (alphanumeric).
	 */
	availableChars?: string;

	/**
	 * If set, keeps a hidden `input[type="hidden"]` in sync for form posts.
	 * Also read from `data-kt-pin-input-name` on the root.
	 */
	name?: string;
}

export interface KTPinInputEventPayloadInterface {
	/** Concatenated values of all cells (including empty slots as empty string per cell). */
	value: string;
	/** True when every enabled cell has at least one character. */
	complete: boolean;
	/** Total enabled cell count. */
	cellCount: number;
	/** Enabled cells that currently have a value. */
	filledCount: number;
	/** Index of the cell that triggered the update, if known. */
	cellIndex?: number;
}

export interface KTPinInputInterface {
	getOption(name: string): unknown;
	getElement(): HTMLElement;
	getValue(): string;
	setValue(value: string): void;
	on(eventType: string, callback: CallableFunction): string;
	off(eventType: string, eventId: string): void;
	dispose(): void;
}
