/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// Sorting logic for KTDataTable

import {
	KTDataTableConfigInterface,
	KTDataTableSortOrderInterface,
	KTDataTableDataInterface,
} from './types';

export interface KTDataTableSortAPI<T = KTDataTableDataInterface> {
	initSort(): void;
	sortData(
		data: T[],
		sortField: keyof T | number,
		sortOrder: KTDataTableSortOrderInterface,
	): T[];
	toggleSortOrder(
		currentField: keyof T | number,
		currentOrder: KTDataTableSortOrderInterface,
		newField: keyof T | number,
	): KTDataTableSortOrderInterface;
	setSortIcon(
		sortField: keyof T,
		sortOrder: KTDataTableSortOrderInterface,
	): void;
	dispose(): void;
}

export class KTDataTableSortHandler<T = KTDataTableDataInterface>
	implements KTDataTableSortAPI<T>
{
	private _config: KTDataTableConfigInterface;
	private _theadElement: HTMLTableSectionElement;
	private _getState: () => {
		sortField: keyof T | number;
		sortOrder: KTDataTableSortOrderInterface;
	};
	private _setState: (
		field: keyof T | number,
		order: KTDataTableSortOrderInterface,
	) => void;
	private _emit: (eventName: string, eventData?: object) => void;
	private _updateData: () => void;
	private _sortAbortController: AbortController | null = null;

	constructor(
		config: KTDataTableConfigInterface,
		theadElement: HTMLTableSectionElement,
		getState: () => {
			sortField: keyof T | number;
			sortOrder: KTDataTableSortOrderInterface;
		},
		setState: (
			field: keyof T | number,
			order: KTDataTableSortOrderInterface,
		) => void,
		emit: (eventName: string, eventData?: object) => void,
		updateData: () => void,
	) {
		this._config = config;
		this._theadElement = theadElement;
		this._getState = getState;
		this._setState = setState;
		this._emit = emit;
		this._updateData = updateData;
	}

	private static _compareValues(
		a: unknown,
		b: unknown,
		sortOrder: KTDataTableSortOrderInterface,
	): number {
		const aText = String(a).replace(/<[^>]*>|&nbsp;/g, '');
		const bText = String(b).replace(/<[^>]*>|&nbsp;/g, '');
		return aText > bText
			? sortOrder === 'asc'
				? 1
				: -1
			: aText < bText
				? sortOrder === 'asc'
					? -1
					: 1
				: 0;
	}

	private static _parseNumeric(value: unknown): number {
		if (value === null || value === undefined || value === '') {
			return Number.NaN;
		}
		const s = String(value).replace(/[^0-9.-]/g, '');
		const n = parseFloat(s);
		return Number.isNaN(n) ? Number.NaN : n;
	}

	private static _compareNumeric(
		aNum: number,
		bNum: number,
		sortOrder: KTDataTableSortOrderInterface,
	): number {
		const aNaN = Number.isNaN(aNum);
		const bNaN = Number.isNaN(bNum);
		if (aNaN && bNaN) return 0;
		if (aNaN) return 1;
		if (bNaN) return -1;
		if (aNum < bNum) return sortOrder === 'asc' ? -1 : 1;
		if (aNum > bNum) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	}

	private _getColumnDef(sortField: keyof T | number):
		| {
				sortType?: 'string' | 'numeric';
				sortValue?: (
					cellValue:
						| KTDataTableDataInterface[keyof KTDataTableDataInterface]
						| string,
					rowData: KTDataTableDataInterface,
				) => number | string;
		  }
		| undefined {
		const columns = this._config.columns;
		if (!columns) return undefined;
		const key =
			typeof sortField === 'number'
				? (Object.keys(columns)[sortField] as keyof T | undefined)
				: sortField;
		return key !== undefined ? columns[key as string] : undefined;
	}

	public sortData(
		data: T[],
		sortField: keyof T | number,
		sortOrder: KTDataTableSortOrderInterface,
	): T[] {
		const columnDef = this._getColumnDef(sortField);
		const sortValueFn = columnDef?.sortValue;
		const useNumeric = !sortValueFn && columnDef?.sortType === 'numeric';

		// Pre-strip HTML from cell values once (instead of on every comparison).
		// For N rows this runs N regex replacements instead of N*log(N).
		const strippedCache = new Map<T, string>();
		const stripHtml = (value: unknown): string =>
			String(value).replace(/<[^>]*>|&nbsp;/g, '');

		if (!sortValueFn) {
			for (const item of data) {
				strippedCache.set(item, stripHtml(item[sortField as keyof T]));
			}
		}

		return data.sort((a, b) => {
			const aRaw = a[sortField as keyof T] as unknown;
			const bRaw = b[sortField as keyof T] as unknown;

			if (typeof sortValueFn === 'function') {
				const aVal = sortValueFn(
					aRaw as
						| KTDataTableDataInterface[keyof KTDataTableDataInterface]
						| string,
					a as KTDataTableDataInterface,
				);
				const bVal = sortValueFn(
					bRaw as
						| KTDataTableDataInterface[keyof KTDataTableDataInterface]
						| string,
					b as KTDataTableDataInterface,
				);
				const aNum =
					typeof aVal === 'number'
						? aVal
						: KTDataTableSortHandler._parseNumeric(aVal);
				const bNum =
					typeof bVal === 'number'
						? bVal
						: KTDataTableSortHandler._parseNumeric(bVal);
				if (typeof aVal === 'number' && typeof bVal === 'number') {
					return KTDataTableSortHandler._compareNumeric(aNum, bNum, sortOrder);
				}
				return KTDataTableSortHandler._compareValues(aVal, bVal, sortOrder);
			}
			if (useNumeric) {
				const aNum = KTDataTableSortHandler._parseNumeric(strippedCache.get(a) ?? aRaw);
				const bNum = KTDataTableSortHandler._parseNumeric(strippedCache.get(b) ?? bRaw);
				return KTDataTableSortHandler._compareNumeric(aNum, bNum, sortOrder);
			}
			return KTDataTableSortHandler._compareValues(
				strippedCache.get(a) ?? aRaw,
				strippedCache.get(b) ?? bRaw,
				sortOrder,
			);
		});
	}

	public toggleSortOrder(
		currentField: keyof T | number,
		currentOrder: KTDataTableSortOrderInterface,
		newField: keyof T | number,
	): KTDataTableSortOrderInterface {
		if (currentField === newField) {
			switch (currentOrder) {
				case 'asc':
					return 'desc';
				case 'desc':
					return '';
				default:
					return 'asc';
			}
		}
		return 'asc';
	}

	public setSortIcon(
		sortField: keyof T,
		sortOrder: KTDataTableSortOrderInterface,
	): void {
		const baseClass = this._config.sort?.classes?.base || '';
		const sortClass = sortOrder
			? sortOrder === 'asc'
				? this._config.sort?.classes?.asc || ''
				: this._config.sort?.classes?.desc || ''
			: '';
		const allTh = this._theadElement.querySelectorAll('th');
		allTh.forEach((header) => {
			const el = header as HTMLElement;
			el.setAttribute('aria-sort', 'none');
			const sortElement = header.querySelector(`.${baseClass}`) as HTMLElement;
			if (sortElement) {
				sortElement.className = baseClass;
			}
		});
		const th =
			typeof sortField === 'number'
				? allTh[sortField]
				: (this._theadElement.querySelector(
						`th[data-kt-datatable-column="${String(sortField)}"], th[data-kt-datatable-column-sort="${String(sortField)}"]`,
					) as HTMLElement);
		if (th) {
			const sortElement = th.querySelector(`.${baseClass}`) as HTMLElement;
			if (sortElement) {
				sortElement.className = `${baseClass} ${sortClass}`.trim();
			}
			if (sortOrder) {
				th.setAttribute('aria-sort', sortOrder);
			} else {
				th.setAttribute('aria-sort', 'none');
			}
		}
	}

	public initSort(): void {
		if (!this._theadElement) return;

		// Abort previous sort listeners before attaching new ones
		if (this._sortAbortController) {
			this._sortAbortController.abort();
		}
		this._sortAbortController = new AbortController();
		const signal = this._sortAbortController.signal;

		this.setSortIcon(
			this._getState().sortField as keyof T,
			this._getState().sortOrder,
		);
		const headers = Array.from(this._theadElement.querySelectorAll('th'));
		headers.forEach((header) => {
			if (!header.querySelector(`.${this._config.sort?.classes?.base}`))
				return;

			const sortDisabled =
				header.getAttribute('data-kt-datatable-column-sort') === 'false';
			if (sortDisabled) return;

			const sortAttribute =
				header.getAttribute('data-kt-datatable-column-sort') ||
				header.getAttribute('data-kt-datatable-column');
			const sortField = sortAttribute
				? (sortAttribute as keyof T)
				: (header.cellIndex as keyof T);
			header.addEventListener('click', () => {
				const state = this._getState();
				const sortOrder = this.toggleSortOrder(
					state.sortField,
					state.sortOrder,
					sortField,
				);
				this.setSortIcon(sortField, sortOrder);
				this._setState(sortField, sortOrder);
				this._emit('sort', { field: sortField, order: sortOrder });
				this._updateData();
			}, { signal });
		});
	}

	public dispose(): void {
		if (this._sortAbortController) {
			this._sortAbortController.abort();
			this._sortAbortController = null;
		}
	}
}

/** @deprecated Use `new KTDataTableSortHandler(config, theadElement, getState, setState, emit, updateData)` instead */
export function createSortHandler<T = KTDataTableDataInterface>(
	config: KTDataTableConfigInterface,
	theadElement: HTMLTableSectionElement,
	getState: () => {
		sortField: keyof T | number;
		sortOrder: KTDataTableSortOrderInterface;
	},
	setState: (
		field: keyof T | number,
		order: KTDataTableSortOrderInterface,
	) => void,
	emit: (eventName: string, eventData?: object) => void,
	updateData: () => void,
): KTDataTableSortAPI<T> {
	return new KTDataTableSortHandler(
		config,
		theadElement,
		getState,
		setState,
		emit,
		updateData,
	);
}
