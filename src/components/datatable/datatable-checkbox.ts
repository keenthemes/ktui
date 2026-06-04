/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// Checkbox logic for KTDataTable

import {
	KTDataTableConfigInterface,
	KTDataTableCheckChangePayloadInterface,
} from './types';
import KTEventHandler from '../../helpers/event-handler';
import { KTCallableType } from '../../types';

export interface KTDataTableCheckboxDeps {
	getState: () => { selectedRows?: string[] };
	setSelectedRows: (rows: string[]) => void;
}

export interface KTDataTableCheckboxAPI {
	init(): void;
	check(): void;
	uncheck(): void;
	toggle(): void;
	isChecked(): boolean;
	getChecked(): string[];
	updateState(): void;
	dispose(): void;
}

export class KTDataTableCheckboxHandler implements KTDataTableCheckboxAPI {
	private _element: HTMLElement;
	private _config: KTDataTableConfigInterface;
	private _fireEvent: (eventName: string, eventData?: object) => void;
	private _deps: KTDataTableCheckboxDeps;
	private _headerChecked = false;
	private _headerCheckElement: HTMLInputElement | null = null;
	private _targetElements: NodeListOf<HTMLInputElement> | null = null;
	private _delegatedEventId: string | null = null;
	private readonly _preserveSelection: boolean;

	constructor(
		element: HTMLElement,
		config: KTDataTableConfigInterface,
		fireEvent: (eventName: string, eventData?: object) => void,
		deps: KTDataTableCheckboxDeps,
	) {
		this._element = element;
		this._config = config;
		this._fireEvent = fireEvent;
		this._deps = deps;
		this._preserveSelection = config.checkbox?.preserveSelection !== false;
	}

	private _checkboxListener = (event: MouseEvent) => {
		this._checkboxToggle(event);
	};

	private _getSelectedRows(): string[] {
		const rows = this._deps.getState().selectedRows;
		return Array.isArray(rows) ? rows.map(String) : [];
	}

	private _setSelectedRows(rows: string[]) {
		this._deps.setSelectedRows(Array.from(new Set(rows.map(String))));
	}

	private _getVisibleRowIds(): string[] {
		if (!this._targetElements) return [];
		return Array.from(this._targetElements)
			.map((el) => el.value)
			.filter((v) => v != null && v !== '');
	}

	public init() {
		const attrs = this._config.attributes;
		if (!attrs?.check || !attrs.checkbox) {
			return;
		}
		this._headerCheckElement = this._element.querySelector<HTMLInputElement>(
			attrs.check,
		);
		if (!this._headerCheckElement) return;
		this._headerChecked = this._headerCheckElement.checked;
		this._targetElements = this._element.querySelectorAll<HTMLInputElement>(
			attrs.checkbox,
		);
		this._checkboxHandler();
		this._reapplyCheckedStates();
		this._updateHeaderCheckboxState();
	}

	private _checkboxHandler() {
		if (!this._headerCheckElement) return;
		const rowCheckboxSelector = this._config.attributes?.checkbox;
		if (!rowCheckboxSelector) return;
		this._headerCheckElement.addEventListener('click', this._checkboxListener);
		this._delegatedEventId = KTEventHandler.on(
			this._element,
			rowCheckboxSelector,
			'input',
			((event?: Event) => {
				if (event) this._handleRowCheckboxChange(event);
			}) as KTCallableType,
		);
	}

	private _handleRowCheckboxChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input) return;
		const value = input.value;
		let selectedRows = this._getSelectedRows();
		const wasChecked = selectedRows.includes(value);
		const isNowChecked = input.checked;

		if (isNowChecked) {
			if (!wasChecked) selectedRows.push(value);
		} else {
			selectedRows = selectedRows.filter((v) => v !== value);
		}
		this._setSelectedRows(selectedRows);
		this._updateHeaderCheckboxState();

		if (isNowChecked && !wasChecked) {
			this._fireEvent('checked', { value });
		} else if (!isNowChecked && wasChecked) {
			this._fireEvent('unchecked', { value });
		}

		this._fireEvent('changed');
	}

	private _checkboxToggle(_event?: Event) {
		const checked = !this.isChecked();
		this._change(checked);
		const eventType = checked ? 'checked' : 'unchecked';
		this._fireEvent(eventType);
	}

	private _change(checked: boolean) {
		const payload: KTDataTableCheckChangePayloadInterface = { cancel: false };
		this._fireEvent('change', payload);
		if (payload.cancel === true) return;
		this._headerChecked = checked;
		if (this._headerCheckElement) this._headerCheckElement.checked = checked;
		if (this._targetElements) {
			const visibleIds = this._getVisibleRowIds();
			let selectedRows = this._getSelectedRows();
			if (checked) {
				selectedRows = this._preserveSelection
					? Array.from(new Set([...selectedRows, ...visibleIds]))
					: visibleIds;
			} else {
				selectedRows = this._preserveSelection
					? selectedRows.filter((v) => !visibleIds.includes(v))
					: [];
			}
			this._setSelectedRows(selectedRows);
			this._targetElements.forEach((element: HTMLInputElement) => {
				if (element) {
					element.checked = checked;
				}
			});
		}
		this._updateHeaderCheckboxState();
		this._fireEvent('changed');
	}

	private _reapplyCheckedStates() {
		const selectedRows = this._getSelectedRows();
		if (!this._targetElements) return;
		this._targetElements.forEach((element: HTMLInputElement) => {
			if (!element) return;
			const value = element.value;
			element.checked = selectedRows.includes(value);
			const row = element.closest('tr');
			if (row && this._config.checkbox?.checkedClass) {
				if (element.checked) {
					row.classList.add(this._config.checkbox.checkedClass);
				} else {
					row.classList.remove(this._config.checkbox.checkedClass);
				}
			}
		});
	}

	private _updateHeaderCheckboxState() {
		if (!this._headerCheckElement || !this._targetElements) return;
		const total = this._targetElements.length;
		let checked = 0;
		for (let i = 0; i < total; i++) {
			if (this._targetElements[i].checked) checked++;
		}
		if (checked === 0) {
			this._headerCheckElement.indeterminate = false;
			this._headerCheckElement.checked = false;
			this._headerChecked = false;
		} else if (checked > 0 && checked < total) {
			this._headerCheckElement.indeterminate = true;
			this._headerCheckElement.checked = false;
			this._headerChecked = false;
		} else if (checked === total) {
			this._headerCheckElement.indeterminate = false;
			this._headerCheckElement.checked = true;
			this._headerChecked = true;
		}
	}

	public isChecked(): boolean {
		return this._headerChecked;
	}

	public getChecked(): string[] {
		return this._getSelectedRows();
	}

	public check() {
		this._change(true);
		this._reapplyCheckedStates();
		this._updateHeaderCheckboxState();
	}

	public uncheck() {
		this._change(false);
		this._reapplyCheckedStates();
		this._updateHeaderCheckboxState();
	}

	public toggle() {
		this._checkboxToggle();
		this._reapplyCheckedStates();
		this._updateHeaderCheckboxState();
	}

	public updateState() {
		const rowCheckSel = this._config.attributes?.checkbox;
		if (!rowCheckSel) {
			return;
		}
		this._targetElements =
			this._element.querySelectorAll<HTMLInputElement>(rowCheckSel);
		this._reapplyCheckedStates();
		this._updateHeaderCheckboxState();
	}

	public dispose() {
		if (this._headerCheckElement) {
			this._headerCheckElement.removeEventListener(
				'click',
				this._checkboxListener,
			);
		}
		const rowCheckboxSelector = this._config.attributes?.checkbox;
		if (this._delegatedEventId && rowCheckboxSelector) {
			KTEventHandler.off(this._element, 'input', this._delegatedEventId);
			this._delegatedEventId = null;
		}
		this._headerCheckElement = null;
		this._targetElements = null;
	}
}
