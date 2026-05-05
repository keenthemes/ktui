/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTComponent from '../component';
import {
	KTInputNumberConfigInterface,
	KTInputNumberEventPayloadInterface,
	KTInputNumberInterface,
} from './types';

declare global {
	interface Window {
		KTInputNumber: typeof KTInputNumber;
	}
}

export class KTInputNumber
	extends KTComponent
	implements KTInputNumberInterface
{
	protected override _name: string = 'input-number';
	protected override _defaultConfig: KTInputNumberConfigInterface = {};
	protected override _config: KTInputNumberConfigInterface =
		this._defaultConfig;
	protected _numberInput: HTMLInputElement | null = null;
	protected _onNativeInput: ((e: Event) => void) | null = null;
	protected _onNativeChange: ((e: Event) => void) | null = null;
	protected _onDecrementClick: ((e: Event) => void) | null = null;
	protected _onIncrementClick: ((e: Event) => void) | null = null;
	protected _decrementElement: HTMLElement | null = null;
	protected _incrementElement: HTMLElement | null = null;

	constructor(
		element: HTMLElement,
		config: KTInputNumberConfigInterface | null = null,
	) {
		super();

		const input = KTInputNumber.findNumberInput(element);
		if (!input) {
			return;
		}

		if (this._shouldSkipInit(element)) {
			return;
		}

		this._numberInput = input;
		this._init(element);
		this._buildConfig(config);

		this._onNativeInput = this._handleNativeInput.bind(this);
		this._onNativeChange = this._handleNativeChange.bind(this);
		this._element?.addEventListener('input', this._onNativeInput);
		this._element?.addEventListener('change', this._onNativeChange);

		this._decrementElement =
			this._element?.querySelector<HTMLElement>(
				'[data-kt-input-number-decrement]',
			) ?? null;
		this._incrementElement =
			this._element?.querySelector<HTMLElement>(
				'[data-kt-input-number-increment]',
			) ?? null;

		this._onDecrementClick = (e: Event) => {
			e.preventDefault();
			if (!this._numberInput || this._numberInput.disabled) return;
			if (typeof this._numberInput.stepDown === 'function') {
				this._numberInput.stepDown();
			}
		};
		this._onIncrementClick = (e: Event) => {
			e.preventDefault();
			if (!this._numberInput || this._numberInput.disabled) return;
			if (typeof this._numberInput.stepUp === 'function') {
				this._numberInput.stepUp();
			}
		};

		if (this._decrementElement && this._onDecrementClick) {
			this._decrementElement.addEventListener('click', this._onDecrementClick);
		}
		if (this._incrementElement && this._onIncrementClick) {
			this._incrementElement.addEventListener('click', this._onIncrementClick);
		}
	}

	private static findNumberInput(root: HTMLElement): HTMLInputElement | null {
		if (root instanceof HTMLInputElement && root.type === 'number') {
			return root;
		}
		return root.querySelector<HTMLInputElement>('input[type="number"]');
	}

	protected _getNumericMin(): number | undefined {
		const input = this._numberInput;
		if (!input) return undefined;
		if (typeof input.min === 'string' && input.min !== '') {
			const n = parseFloat(input.min);
			if (Number.isFinite(n)) return n;
		}
		return undefined;
	}

	protected _getNumericMax(): number | undefined {
		const input = this._numberInput;
		if (!input) return undefined;
		if (typeof input.max === 'string' && input.max !== '') {
			const n = parseFloat(input.max);
			if (Number.isFinite(n)) return n;
		}
		return undefined;
	}

	protected _getStepForPayload(): number | undefined {
		const input = this._numberInput;
		if (!input) return undefined;
		const raw = input.getAttribute('step');
		if (raw === 'any') return undefined;
		if (raw === null || raw === '') return 1;
		const n = parseFloat(raw);
		return Number.isFinite(n) && n > 0 ? n : 1;
	}

	protected _getCurrentNumericValue(): number | null {
		const input = this._numberInput;
		if (!input) return null;
		if (input.value === '') {
			return null;
		}
		const n =
			typeof input.valueAsNumber === 'number' &&
			!Number.isNaN(input.valueAsNumber)
				? input.valueAsNumber
				: parseFloat(input.value);
		return Number.isFinite(n) ? n : null;
	}

	protected _buildEventPayload(): KTInputNumberEventPayloadInterface {
		const input = this._numberInput;
		const min = this._getNumericMin();
		const max = this._getNumericMax();
		const step = this._getStepForPayload();
		const value = this._getCurrentNumericValue();
		const valueAsString = input?.value ?? '';
		return {
			value,
			valueAsString,
			...(min !== undefined ? { min } : {}),
			...(max !== undefined ? { max } : {}),
			...(step !== undefined ? { step } : {}),
		};
	}

	protected _handleNativeInput(_event: Event): void {
		const event = _event as Event;
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.type !== 'number') {
			return;
		}

		this._numberInput = target;
		const payload = this._buildEventPayload();
		this._fireEvent('input', payload);
		this._dispatchEvent('kt.input-number.input', payload);
	}

	protected _handleNativeChange(_event: Event): void {
		const event = _event as Event;
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.type !== 'number') {
			return;
		}

		this._numberInput = target;
		const payload = this._buildEventPayload();
		this._fireEvent('change', payload);
		this._dispatchEvent('kt.input-number.change', payload);
	}

	public getNumberInput(): HTMLInputElement | null {
		return this._numberInput;
	}

	public getValue(): number | null {
		return this._getCurrentNumericValue();
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
		if (this._decrementElement && this._onDecrementClick) {
			this._decrementElement.removeEventListener(
				'click',
				this._onDecrementClick,
			);
		}
		if (this._incrementElement && this._onIncrementClick) {
			this._incrementElement.removeEventListener(
				'click',
				this._onIncrementClick,
			);
		}
		this._onNativeInput = null;
		this._onNativeChange = null;
		this._onDecrementClick = null;
		this._onIncrementClick = null;
		this._decrementElement = null;
		this._incrementElement = null;
		this._numberInput = null;
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTInputNumber | null {
		if (!element) {
			return null;
		}
		if (KTData.has(element, 'input-number')) {
			return KTData.get(element, 'input-number') as KTInputNumber;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTInputNumberConfigInterface,
	): KTInputNumber | null {
		const existing = this.getInstance(element);
		if (existing) {
			return existing;
		}
		if (!this.findNumberInput(element)) {
			return null;
		}
		new KTInputNumber(element, config ?? undefined);
		return this.getInstance(element);
	}

	public static createInstances(): void {
		document
			.querySelectorAll<HTMLElement>('[data-kt-input-number]')
			.forEach((el) => {
				if (el.getAttribute('data-kt-input-number-lazy') === 'true') {
					return;
				}
				new KTInputNumber(el);
			});
	}

	public static init(): void {
		KTInputNumber.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTInputNumber = KTInputNumber;
}
