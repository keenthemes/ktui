/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Optional CSS selector (document or root-relative) for an element whose text
 * updates with the current range value. Prefer `data-kt-range-slider-output` on the root.
 */
export interface KTRangeSliderConfigInterface {
	/** Selector for the output element; also read from `data-kt-range-slider-output`. */
	output?: string;

	/**
	 * When true, skip auto-init; use `getInstance` / `new KTRangeSlider(element)` manually.
	 */
	lazy?: boolean;
}

export interface KTRangeSliderEventPayloadInterface {
	value: number;
	min: number;
	max: number;
	/** From the input `step` attribute; omitted when `step="any"`. */
	step?: number;
}

export interface KTRangeSliderInterface {
	getOption(name: string): unknown;
	getElement(): HTMLElement;
	getRangeInput(): HTMLInputElement | null;
	getValue(): number;
	on(eventType: string, callback: CallableFunction): string;
	off(eventType: string, eventId: string): void;
	dispose(): void;
}
