/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTComponent from '../component';
import {
	KTRangeSliderConfigInterface,
	KTRangeSliderEventPayloadInterface,
	KTRangeSliderInterface,
} from './types';

declare global {
	interface Window {
		KTRangeSlider: typeof KTRangeSlider;
	}
}

const FILL_VAR = '--kt-range-fill';

export class KTRangeSlider
	extends KTComponent
	implements KTRangeSliderInterface
{
	protected override _name: string = 'range-slider';
	protected override _defaultConfig: KTRangeSliderConfigInterface = {
		output: '',
		lazy: false,
	};
	protected override _config: KTRangeSliderConfigInterface =
		this._defaultConfig;
	protected _rangeInput: HTMLInputElement | null = null;
	protected _onNativeInput: ((e: Event) => void) | null = null;
	protected _onNativeChange: ((e: Event) => void) | null = null;

	constructor(
		element: HTMLElement,
		config: KTRangeSliderConfigInterface | null = null,
	) {
		super();

		const input = KTRangeSlider.findRangeInput(element);
		if (!input) {
			return;
		}

		if (this._shouldSkipInit(element)) {
			return;
		}

		this._rangeInput = input;
		this._init(element);
		this._buildConfig(config);

		this._onNativeInput = this._handleNativeInput.bind(this);
		this._onNativeChange = this._handleNativeChange.bind(this);
		// Delegate events to the root so we keep working if the preview
		// re-renders and replaces the native range input element.
		this._element?.addEventListener('input', this._onNativeInput);
		this._element?.addEventListener('change', this._onNativeChange);

		this._syncFromInput();
	}

	private static findRangeInput(root: HTMLElement): HTMLInputElement | null {
		if (root instanceof HTMLInputElement && root.type === 'range') {
			return root;
		}
		return root.querySelector<HTMLInputElement>('input[type="range"]');
	}

	protected _getOutputSelector(): string {
		const raw = this._getOption('output');
		return typeof raw === 'string' ? raw.trim() : '';
	}

	protected _resolveOutputElement(): HTMLElement | null {
		const selector = this._getOutputSelector();
		if (!selector || !this._element) {
			return null;
		}
		const fromRoot = this._element.querySelector<HTMLElement>(selector);
		if (fromRoot) {
			return fromRoot;
		}
		return document.querySelector<HTMLElement>(selector);
	}

	protected _getNumericMin(): number {
		const input = this._rangeInput;
		if (!input) return 0;
		const n =
			typeof input.min === 'string' && input.min !== ''
				? parseFloat(input.min)
				: 0;
		return Number.isFinite(n) ? n : 0;
	}

	protected _getNumericMax(): number {
		const input = this._rangeInput;
		if (!input) return 100;
		if (typeof input.max === 'string' && input.max !== '') {
			const n = parseFloat(input.max);
			if (Number.isFinite(n)) return n;
		}
		return 100;
	}

	/** Reflects `step` for events; `undefined` when `step="any"`. */
	protected _getStepForPayload(): number | undefined {
		const input = this._rangeInput;
		if (!input) return undefined;
		const raw = input.getAttribute('step');
		if (raw === 'any') return undefined;
		if (raw === null || raw === '') return 1;
		const n = parseFloat(raw);
		return Number.isFinite(n) && n > 0 ? n : 1;
	}

	protected _getCurrentValue(): number {
		const input = this._rangeInput;
		if (!input) return 0;
		const v =
			typeof input.valueAsNumber === 'number' &&
			!Number.isNaN(input.valueAsNumber)
				? input.valueAsNumber
				: parseFloat(input.value);
		return Number.isFinite(v) ? v : 0;
	}

	protected _clamp(value: number, min: number, max: number): number {
		if (max < min) {
			return value;
		}
		return Math.min(max, Math.max(min, value));
	}

	protected _fillRatio(value: number, min: number, max: number): number {
		if (max === min) {
			return 0;
		}
		return (this._clamp(value, min, max) - min) / (max - min);
	}

	protected _buildEventPayload(): KTRangeSliderEventPayloadInterface {
		const min = this._getNumericMin();
		const max = this._getNumericMax();
		const value = this._getCurrentValue();
		const step = this._getStepForPayload();
		return {
			value,
			min,
			max,
			...(step !== undefined ? { step } : {}),
		};
	}

	protected _syncFromInput(): void {
		if (!this._element || !this._rangeInput) {
			return;
		}

		const min = this._getNumericMin();
		const max = this._getNumericMax();
		const value = this._getCurrentValue();
		const ratio = this._fillRatio(value, min, max);

		this._element.style.setProperty(FILL_VAR, String(ratio));

		const out = this._resolveOutputElement();
		if (out) {
			out.textContent = String(this._rangeInput.value);
		}
	}

	protected _handleNativeInput(_event: Event): void {
		const event = _event as Event;
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.type !== 'range') {
			return;
		}

		this._rangeInput = target;
		this._syncFromInput();

		const payload = this._buildEventPayload();
		this._fireEvent('input', payload);
		this._dispatchEvent('kt.range-slider.input', payload);
	}

	protected _handleNativeChange(_event: Event): void {
		const event = _event as Event;
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.type !== 'range') {
			return;
		}

		this._rangeInput = target;
		this._syncFromInput();

		const payload = this._buildEventPayload();
		this._fireEvent('change', payload);
		this._dispatchEvent('kt.range-slider.change', payload);
	}

	public getRangeInput(): HTMLInputElement | null {
		return this._rangeInput;
	}

	public getValue(): number {
		return this._getCurrentValue();
	}

	public override dispose(): void {
		if (this._element) {
			if (this._onNativeInput) {
				this._element.removeEventListener('input', this._onNativeInput);
			}
			if (this._onNativeChange) {
				this._element.removeEventListener('change', this._onNativeChange);
			}
		}
		this._onNativeInput = null;
		this._onNativeChange = null;
		this._rangeInput = null;
		if (this._element) {
			this._element.style.removeProperty(FILL_VAR);
		}
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTRangeSlider | null {
		if (!element) {
			return null;
		}
		if (KTData.has(element, 'range-slider')) {
			return KTData.get(element, 'range-slider') as KTRangeSlider;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTRangeSliderConfigInterface,
	): KTRangeSlider | null {
		const existing = this.getInstance(element);
		if (existing) {
			return existing;
		}
		if (!this.findRangeInput(element)) {
			return null;
		}
		new KTRangeSlider(element, config ?? undefined);
		return this.getInstance(element);
	}

	public static createInstances(): void {
		document
			.querySelectorAll<HTMLElement>('[data-kt-range-slider]')
			.forEach((el) => {
				if (el.getAttribute('data-kt-range-slider-lazy') === 'true') {
					return;
				}
				new KTRangeSlider(el);
			});
	}

	public static init(): void {
		KTRangeSlider.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTRangeSlider = KTRangeSlider;
}
