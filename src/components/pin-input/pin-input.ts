/**
 * KTUI - PIN / OTP multi-field input
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTComponent from '../component';
import {
	KTPinInputConfigInterface,
	KTPinInputEventPayloadInterface,
	KTPinInputInterface,
} from './types';

declare global {
	interface Window {
		KTPinInput: typeof KTPinInput;
	}
}

const ITEM_SELECTOR = '[data-kt-pin-input-item]';

export class KTPinInput extends KTComponent implements KTPinInputInterface {
	protected override _name: string = 'pin-input';

	protected override _defaultConfig: KTPinInputConfigInterface = {
		lazy: false,
		availableChars: '[0-9]',
		name: '',
	};

	protected override _config: KTPinInputConfigInterface = this
		._defaultConfig as KTPinInputConfigInterface;

	private _cells: HTMLInputElement[] = [];
	private _hiddenInput: HTMLInputElement | null = null;
	private _charRegex: RegExp | null = null;
	private _wasComplete = false;

	private _onKeydownBound = (e: KeyboardEvent) => this._onKeydown(e);
	private _onInputBound = (e: Event) => this._onInput(e);
	private _onPasteBound = (e: ClipboardEvent) => this._onPaste(e);

	constructor(
		element: HTMLElement,
		config: KTPinInputConfigInterface | null = null,
	) {
		super();

		const cells = KTPinInput.collectItems(element);
		if (cells.length === 0) {
			return;
		}

		if (this._shouldSkipInit(element)) {
			return;
		}

		this._cells = cells;
		this._init(element);
		this._buildConfig(config);
		this._compileRegex();
		this._ensureHiddenInput();
		this._prepareCells();

		this._element?.addEventListener('keydown', this._onKeydownBound, true);
		this._element?.addEventListener('input', this._onInputBound, true);
		this._element?.addEventListener('paste', this._onPasteBound, true);

		this._syncFromDom(undefined, { silent: true });
	}

	private static collectItems(root: HTMLElement): HTMLInputElement[] {
		return Array.from(
			root.querySelectorAll<HTMLInputElement>(ITEM_SELECTOR),
		).filter((el) => root.contains(el));
	}

	private _compileRegex(): void {
		const raw = this._getOption('availableChars');
		const pattern =
			typeof raw === 'string' && raw.trim() !== ''
				? raw.trim()
				: '[0-9]';
		try {
			this._charRegex = new RegExp(pattern);
		} catch {
			this._charRegex = /[0-9]/;
		}
	}

	private _isValidChar(char: string): boolean {
		if (!char || !this._charRegex) {
			return false;
		}
		return this._charRegex.test(char);
	}

	private _enabledCells(): HTMLInputElement[] {
		return this._cells.filter((c) => !c.disabled);
	}

	private _prepareCells(): void {
		for (const cell of this._cells) {
			if (cell.getAttribute('maxlength') === null) {
				cell.setAttribute('maxlength', '1');
			}
		}
	}

	private _ensureHiddenInput(): void {
		const raw = this._getOption('name');
		const name = typeof raw === 'string' ? raw.trim() : '';
		if (!name || !this._element) {
			this._hiddenInput = null;
			return;
		}

		let h = this._element.querySelector<HTMLInputElement>(
			'input[type="hidden"][data-kt-pin-input-hidden]',
		);
		if (!h) {
			h = document.createElement('input');
			h.type = 'hidden';
			h.name = name;
			h.setAttribute('data-kt-pin-input-hidden', 'true');
			this._element.appendChild(h);
		}
		this._hiddenInput = h;
	}

	private _cellIndex(cell: HTMLInputElement): number {
		return this._cells.indexOf(cell);
	}

	private _focusCell(index: number, select = true): void {
		const enabled = this._enabledCells();
		const target = enabled[index];
		if (!target) {
			return;
		}
		target.focus();
		if (select) {
			target.select();
		}
	}

	private _focusRelative(cell: HTMLInputElement, delta: number): void {
		const enabled = this._enabledCells();
		const idx = enabled.indexOf(cell);
		if (idx < 0) {
			return;
		}
		const next = idx + delta;
		if (next >= 0 && next < enabled.length) {
			enabled[next].focus();
			enabled[next].select();
		}
	}

	private _focusFirst(): void {
		this._focusCell(0);
	}

	private _focusLast(): void {
		const enabled = this._enabledCells();
		if (enabled.length > 0) {
			this._focusCell(enabled.length - 1);
		}
	}

	private _filterString(str: string): string {
		let out = '';
		for (const ch of str) {
			if (this._isValidChar(ch)) {
				out += ch;
			}
		}
		return out;
	}

	private _buildPayload(cellIndex?: number): KTPinInputEventPayloadInterface {
		const value = this.getValue();
		const enabled = this._enabledCells();
		const filled = enabled.filter((c) => (c.value || '').length > 0).length;
		const complete =
			enabled.length > 0 && filled === enabled.length;
		return {
			value,
			complete,
			cellCount: enabled.length,
			filledCount: filled,
			...(cellIndex !== undefined ? { cellIndex } : {}),
		};
	}

	private _emit(payload: KTPinInputEventPayloadInterface): void {
		this._fireEvent('input', payload);
		this._dispatchEvent('kt.pin-input.input', payload);
		this._dispatchEvent('kt.pin-input.change', payload);

		if (payload.complete && !this._wasComplete) {
			this._dispatchEvent('kt.pin-input.complete', payload);
		}
		this._wasComplete = payload.complete;
	}

	private _syncHidden(value: string): void {
		if (this._hiddenInput) {
			this._hiddenInput.value = value;
		}
	}

	/**
	 * Re-read state from the DOM and optionally emit events.
	 */
	private _syncFromDom(cellIndex?: number, opts?: { silent?: boolean }): void {
		const payload = this._buildPayload(cellIndex);
		this._syncHidden(payload.value);
		if (!opts?.silent) {
			this._emit(payload);
		} else {
			this._wasComplete = payload.complete;
		}
	}

	private _onKeydown(e: KeyboardEvent): void {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}
		if (!this._cells.includes(target) || target.disabled) {
			return;
		}

		if (e.key === 'Backspace') {
			e.preventDefault();
			if (target.value.length > 0) {
				target.value = '';
				this._syncFromDom(this._cellIndex(target));
			} else {
				this._focusRelative(target, -1);
			}
			return;
		}

		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			this._focusRelative(target, -1);
			return;
		}
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			this._focusRelative(target, 1);
			return;
		}
		if (e.key === 'Home') {
			e.preventDefault();
			this._focusFirst();
			return;
		}
		if (e.key === 'End') {
			e.preventDefault();
			this._focusLast();
			return;
		}

		if (e.ctrlKey || e.metaKey || e.altKey) {
			return;
		}

		if (e.key.length === 1) {
			if (!this._isValidChar(e.key)) {
				e.preventDefault();
				return;
			}
			e.preventDefault();
			target.value = e.key;
			this._syncFromDom(this._cellIndex(target));
			const enabled = this._enabledCells();
			const idx = enabled.indexOf(target);
			if (idx >= 0 && idx < enabled.length - 1) {
				enabled[idx + 1].focus();
				enabled[idx + 1].select();
			}
		}
	}

	private _onInput(e: Event): void {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}
		if (!this._cells.includes(target) || target.disabled) {
			return;
		}

		const v = target.value;
		if (v.length <= 1) {
			if (v.length === 1 && !this._isValidChar(v)) {
				target.value = '';
				this._syncFromDom(this._cellIndex(target));
				return;
			}
			this._syncFromDom(this._cellIndex(target));
			if (v.length === 1) {
				const enabled = this._enabledCells();
				const idx = enabled.indexOf(target);
				if (idx >= 0 && idx < enabled.length - 1) {
					enabled[idx + 1].focus();
					enabled[idx + 1].select();
				}
			}
			return;
		}

		// Mobile / autofill: multiple characters in one cell
		const filtered = this._filterString(v);
		target.value = '';
		this._distributeFromIndex(this._cellIndex(target), filtered);
	}

	private _onPaste(e: ClipboardEvent): void {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}
		if (!this._cells.includes(target) || target.disabled) {
			return;
		}
		e.preventDefault();
		const text = e.clipboardData?.getData('text') || '';
		const filtered = this._filterString(text);
		this._distributeFromIndex(this._cellIndex(target), filtered);
	}

	private _distributeFromIndex(startCellIndex: number, chars: string): void {
		if (chars.length === 0) {
			return;
		}
		const startCell = this._cells[startCellIndex];
		if (!startCell || startCell.disabled) {
			return;
		}
		const enabled = this._enabledCells();
		const startIdx = enabled.indexOf(startCell);
		if (startIdx < 0) {
			return;
		}
		let charPos = 0;
		for (let i = startIdx; i < enabled.length && charPos < chars.length; i++) {
			enabled[i].value = chars[charPos];
			charPos++;
		}
		if (charPos > 0) {
			const lastIdx = Math.min(startIdx + charPos - 1, enabled.length - 1);
			enabled[lastIdx].focus();
			enabled[lastIdx].select();
		}
		this._syncFromDom(startCellIndex);
	}

	public getValue(): string {
		return this._cells.map((c) => (c.disabled ? '' : c.value || '')).join('');
	}

	public setValue(value: string): void {
		const enabled = this._enabledCells();
		const filtered = this._filterString(typeof value === 'string' ? value : '');
		for (let i = 0; i < enabled.length; i++) {
			enabled[i].value = filtered[i] ?? '';
		}
		this._syncFromDom(0);
	}

	public override dispose(): void {
		if (this._element) {
			this._element.removeEventListener('keydown', this._onKeydownBound, true);
			this._element.removeEventListener('input', this._onInputBound, true);
			this._element.removeEventListener('paste', this._onPasteBound, true);
		}
		this._cells = [];
		this._hiddenInput = null;
		this._charRegex = null;
		super.dispose();
	}

	public static getInstance(element: HTMLElement): KTPinInput | null {
		if (!element) {
			return null;
		}
		if (KTData.has(element, 'pin-input')) {
			return KTData.get(element, 'pin-input') as KTPinInput;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTPinInputConfigInterface,
	): KTPinInput | null {
		const existing = this.getInstance(element);
		if (existing) {
			return existing;
		}
		if (this.collectItems(element).length === 0) {
			return null;
		}
		new KTPinInput(element, config ?? undefined);
		return this.getInstance(element);
	}

	public static createInstances(): void {
		document
			.querySelectorAll<HTMLElement>('[data-kt-pin-input]')
			.forEach((el) => {
				if (el.getAttribute('data-kt-pin-input-lazy') === 'true') {
					return;
				}
				new KTPinInput(el);
			});
	}

	public static init(): void {
		KTPinInput.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTPinInput = KTPinInput;
}
