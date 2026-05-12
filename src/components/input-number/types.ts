/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTInputNumberConfigInterface {
	/** Reserved for future options merged from data attributes. */
	[key: string]: string | number | boolean | undefined;
}

export interface KTInputNumberEventPayloadInterface {
	/** Parsed numeric value, or `null` when the input is empty or not a finite number. */
	value: number | null;
	/** Raw `value` attribute string of the controlled input. */
	valueAsString: string;
	/** Effective minimum when set on the input. */
	min?: number;
	/** Effective maximum when set on the input. */
	max?: number;
	/** Effective step when numeric; omitted when `step="any"` or missing. */
	step?: number;
}

export interface KTInputNumberInterface {
	getNumberInput(): HTMLInputElement | null;
	getValue(): number | null;
	getOption(name: string): unknown;
	getElement(): HTMLElement | null;
	on(eventType: string, callback: CallableFunction): string;
	off(eventType: string, eventId: string): void;
	dispose(): void;
}
