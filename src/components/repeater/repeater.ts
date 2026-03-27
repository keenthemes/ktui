/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTRepeaterInterface, KTRepeaterConfigInterface } from './types';

const DELETE_SELECTOR = '[data-kt-repeater-delete]';

declare global {
	interface Window {
		KTRepeater: typeof KTRepeater;
	}
}

export class KTRepeater extends KTComponent implements KTRepeaterInterface {
	protected override _name: string = 'repeater';
	protected override _defaultConfig: KTRepeaterConfigInterface = {
		target: '',
		wrapper: '',
		limit: 0,
	};
	protected override _config: KTRepeaterConfigInterface = this
		._defaultConfig as KTRepeaterConfigInterface;
	protected _wrapperElement: HTMLElement | null = null;
	protected _deleteHandler: (e: Event) => void;

	constructor(
		element: HTMLElement,
		config: KTRepeaterConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;

		this._wrapperElement = KTDom.getElement(
			this._getOption('wrapper') as string,
		);
		if (!this._wrapperElement) return;

		this._deleteHandler = this._handleDeleteClick.bind(this);
		this._handlers();
		this._syncTriggerDisabled();
		this._syncDeleteButtonsDisabled();
	}

	protected _getTargetElement(): HTMLElement | null {
		return KTDom.getElement(this._getOption('target') as string);
	}

	protected _getCloneCount(): number {
		return this._wrapperElement ? this._wrapperElement.children.length : 0;
	}

	protected _syncTriggerDisabled(): void {
		if (!this._element || !this._wrapperElement) return;
		const limit = Number(this._getOption('limit')) || 0;
		if (limit <= 0) return;
		const atLimit = this._getCloneCount() >= limit;
		if (this._element.hasAttribute('disabled') !== atLimit) {
			if (atLimit) {
				this._element.setAttribute('disabled', '');
			} else {
				this._element.removeAttribute('disabled');
			}
		}
	}

	protected _syncDeleteButtonsDisabled(): void {
		if (!this._wrapperElement) return;
		const count = this._wrapperElement.children.length;
		const isOnlyOne = count <= 1;
		Array.from(this._wrapperElement.children).forEach((row) => {
			const deleteBtn = (row as HTMLElement).querySelector(
				DELETE_SELECTOR,
			) as HTMLElement | null;
			if (!deleteBtn) return;
			if (isOnlyOne) {
				deleteBtn.setAttribute('disabled', '');
				deleteBtn.setAttribute('aria-disabled', 'true');
			} else {
				deleteBtn.removeAttribute('disabled');
				deleteBtn.removeAttribute('aria-disabled');
			}
		});
	}

	protected _handlers(): void {
		if (!this._element) return;

		this._element.addEventListener('click', (event: Event) => {
			event.preventDefault();
			this._add();
		});

		this._wrapperElement?.addEventListener('click', this._deleteHandler);
	}

	protected _handleDeleteClick(event: Event): void {
		const target = event.target as HTMLElement;
		const deleteEl = target.closest(DELETE_SELECTOR);
		if (!deleteEl || !this._wrapperElement) return;
		// Keep at least one row so the template remains for cloning
		if (this._wrapperElement.children.length <= 1) return;
		const cloneContainer = Array.from(this._wrapperElement.children).find(
			(child) => child.contains(deleteEl),
		);
		if (!cloneContainer) return;
		KTDom.remove(cloneContainer as HTMLElement);
		this._syncTriggerDisabled();
		this._syncDeleteButtonsDisabled();
	}

	protected _add(): void {
		if (!this._wrapperElement) return;
		const targetEl = this._getTargetElement();
		if (!targetEl) return;

		const limit = Number(this._getOption('limit')) || 0;
		const count = this._getCloneCount();
		if (limit > 0 && count >= limit) return;

		const clone = targetEl.cloneNode(true) as HTMLElement;
		this._wrapperElement.appendChild(clone);

		const payload = { element: clone };
		this._fireEvent('add', payload);
		this._dispatchEvent('add', payload);

		this._syncTriggerDisabled();
		this._syncDeleteButtonsDisabled();
	}

	public add(): void {
		this._add();
	}

	public static getInstance(element: HTMLElement): KTRepeater | null {
		if (!element) return null;
		if (KTData.has(element, 'repeater')) {
			return KTData.get(element, 'repeater') as KTRepeater;
		}
		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTRepeaterConfigInterface,
	): KTRepeater {
		return (
			this.getInstance(element) || new KTRepeater(element, config ?? undefined)
		);
	}

	public static createInstances(): void {
		document.querySelectorAll('[data-kt-repeater]').forEach((el) => {
			new KTRepeater(el as HTMLElement);
		});
	}

	public static init(): void {
		KTRepeater.createInstances();
	}

	public override dispose(): void {
		this._wrapperElement?.removeEventListener('click', this._deleteHandler);
		super.dispose();
	}
}

if (typeof window !== 'undefined') {
	window.KTRepeater = KTRepeater;
}
