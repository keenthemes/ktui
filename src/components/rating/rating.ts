/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTComponent from '../component';
import { KTRatingConfigInterface, KTRatingInterface } from './types';

declare global {
	interface Window {
		KTRating: typeof KTRating;
	}
}

const STAR_SVG =
	'<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>';
const HEART_SVG =
	'<path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>';

export class KTRating extends KTComponent implements KTRatingInterface {
	protected override _name: string = 'rating';
	protected override _defaultConfig: KTRatingConfigInterface = {
		value: 0,
		max: 5,
		readonly: false,
		name: 'rating',
		symbol: 'star',
		lazy: false,
	};
	protected override _config: KTRatingConfigInterface = this._defaultConfig;
	protected _container: HTMLElement | null = null;
	protected _changeListener: ((e: Event) => void) | null = null;

	constructor(
		element: HTMLElement,
		config: KTRatingConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._render();
		if (!this._config.readonly) {
			this._handlers();
		}
	}

	protected _getMax(): number {
		const max = Number(this._getOption('max'));
		return Number.isFinite(max) && max >= 1 ? Math.floor(max) : 5;
	}

	protected _getValue(): number {
		const v = Number(this._getOption('value'));
		const max = this._getMax();
		return Number.isFinite(v) && v >= 0 && v <= max ? Math.floor(v) : 0;
	}

	protected _render(): void {
		if (!this._element) return;
		const max = this._getMax();
		const value = this._getValue();
		const readonly = this._config.readonly === true;
		const symbol = (this._config.symbol as string) || 'star';
		const name = (this._config.name as string) || 'rating';

		const isStar = symbol !== 'heart';
		const filledClass = isStar
			? 'text-yellow-400 dark:text-yellow-600'
			: 'text-red-500 dark:text-red-500';
		const unfilledClass =
			'text-muted-foreground/50 dark:text-muted-foreground/50';
		const path = isStar ? STAR_SVG : HEART_SVG;
		const svg = `<svg class="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">${path}</svg>`;

		const container = document.createElement('div');
		container.className =
			'kt-rating flex flex-row-reverse justify-end items-center gap-0';
		container.setAttribute('role', readonly ? 'img' : 'group');
		container.setAttribute('aria-label', `Rating: ${value} of ${max}`);
		if (readonly) {
			container.setAttribute('aria-valuenow', String(value));
			container.setAttribute('aria-valuemin', '0');
			container.setAttribute('aria-valuemax', String(max));
		}

		if (readonly) {
			for (let i = max; i >= 1; i--) {
				const filled = i <= value;
				const span = document.createElement('span');
				span.className = filled ? filledClass : unfilledClass;
				span.innerHTML = svg;
				container.appendChild(span);
			}
		} else {
			container.setAttribute('aria-valuenow', String(value));
			container.setAttribute('aria-valuemin', '1');
			container.setAttribute('aria-valuemax', String(max));
			for (let i = max; i >= 1; i--) {
				const id = `kt-rating-${this._uid}-${i}`;
				const radio = document.createElement('input');
				radio.type = 'radio';
				radio.name = name;
				radio.value = String(i);
				radio.id = id;
				radio.className =
					'peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0';
				radio.setAttribute('aria-label', `Rate ${i} of ${max}`);
				if (i === value) radio.checked = true;

				const label = document.createElement('label');
				label.htmlFor = id;
				label.setAttribute('data-kt-rating-value', String(i));
				label.className = `cursor-pointer kt-rating-label ${i <= value ? filledClass : unfilledClass}`;
				label.innerHTML = svg;

				container.appendChild(radio);
				container.appendChild(label);
			}
			this._updateInteractiveDisplay();
		}

		this._element.innerHTML = '';
		this._element.appendChild(container);
		this._container = container;
	}

	protected _updateInteractiveDisplay(): void {
		if (!this._container || this._config.readonly) return;
		const val = this.getValue();
		const max = this._getMax();
		const isStar = (this._config.symbol as string) !== 'heart';
		const filledClass = isStar
			? 'text-yellow-400 dark:text-yellow-600'
			: 'text-red-500 dark:text-red-500';
		const unfilledClass =
			'text-muted-foreground/50 dark:text-muted-foreground/50';
		const filledTokens = filledClass.split(' ');
		const unfilledTokens = unfilledClass.split(' ');
		this._container
			.querySelectorAll<HTMLElement>('.kt-rating-label')
			.forEach((label) => {
				const v = parseInt(
					label.getAttribute('data-kt-rating-value') || '0',
					10,
				);
				const filled = v <= (val ?? 0);
				label.classList.remove(...filledTokens, ...unfilledTokens);
				label.classList.add(...(filled ? filledTokens : unfilledTokens));
			});
		this._container.setAttribute(
			'aria-valuenow',
			val != null ? String(val) : '0',
		);
		this._container.setAttribute('aria-label', `Rating: ${val ?? 0} of ${max}`);
	}

	protected _handlers(): void {
		if (!this._container) return;
		this._changeListener = () => {
			this._updateInteractiveDisplay();
			const val = this.getValue();
			this._fireEvent('change', { value: val });
			this._dispatchEvent('kt.rating.change', { value: val });
		};
		this._container.addEventListener('change', this._changeListener);
	}

	public getValue(): number | null {
		if (!this._element) return null;
		if (this._config.readonly) {
			const v = this._getValue();
			return v > 0 ? v : null;
		}
		const radio = this._container?.querySelector<HTMLInputElement>(
			'input[type="radio"]:checked',
		);
		if (!radio) return null;
		const n = parseInt(radio.value, 10);
		return Number.isFinite(n) ? n : null;
	}

	public setValue(value: number | null): void {
		if (!this._container) return;
		const max = this._getMax();
		if (this._config.readonly) return;
		if (value !== null && value >= 1 && value <= max) {
			const radio = this._container.querySelector<HTMLInputElement>(
				`input[type="radio"][value="${value}"]`,
			);
			if (radio) {
				radio.checked = true;
				this._updateInteractiveDisplay();
			}
		} else {
			this._container
				.querySelectorAll<HTMLInputElement>('input[type="radio"]')
				.forEach((r) => {
					r.checked = false;
				});
			this._updateInteractiveDisplay();
		}
	}

	public override dispose(): void {
		if (this._container && this._changeListener) {
			this._container.removeEventListener('change', this._changeListener);
			this._changeListener = null;
		}
		this._container = null;
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTRating | null {
		if (!element) return null;
		if (KTData.has(element, 'rating')) {
			return KTData.get(element, 'rating') as KTRating;
		}
		if (element.getAttribute('data-kt-rating') !== null) {
			return new KTRating(element);
		}
		return null;
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll<HTMLElement>('[data-kt-rating]');
		elements.forEach((el) => {
			if (el.getAttribute('data-kt-rating-lazy') === 'true') return;
			new KTRating(el);
		});
	}

	public static init(): void {
		KTRating.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTRating = KTRating;
}
