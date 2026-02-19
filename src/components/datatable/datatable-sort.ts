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
}

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
	fireEvent: (eventName: string, eventData?: any) => void,
	dispatchEvent: (eventName: string, eventData?: any) => void,
	updateData: () => void,
): KTDataTableSortAPI<T> {
	// Helper to compare values for sorting (string)
	function compareValues(
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

	// Parse value for numeric sort: strip currency/commas, then parseFloat
	function parseNumeric(value: unknown): number {
		if (value === null || value === undefined || value === '') {
			return Number.NaN;
		}
		const s = String(value).replace(/[^0-9.-]/g, '');
		const n = parseFloat(s);
		return Number.isNaN(n) ? Number.NaN : n;
	}

	// Compare two numbers; NaN sorts to the end for both asc and desc
	function compareNumeric(
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

	function getColumnDef(sortField: keyof T | number):
		| {
				sortType?: 'string' | 'numeric';
				sortValue?: (
					cellValue: unknown,
					rowData: KTDataTableDataInterface,
				) => number | string;
		  }
		| undefined {
		const columns = config.columns;
		if (!columns) return undefined;
		const key =
			typeof sortField === 'number'
				? (Object.keys(columns)[sortField] as keyof T | undefined)
				: sortField;
		return key !== undefined ? columns[key as string] : undefined;
	}

	function sortData(
		data: T[],
		sortField: keyof T | number,
		sortOrder: KTDataTableSortOrderInterface,
	): T[] {
		const columnDef = getColumnDef(sortField);
		const sortValueFn = columnDef?.sortValue;
		const useNumeric = !sortValueFn && columnDef?.sortType === 'numeric';

		return data.sort((a, b) => {
			const aRaw = a[sortField as keyof T] as unknown;
			const bRaw = b[sortField as keyof T] as unknown;

			if (typeof sortValueFn === 'function') {
				const aVal = sortValueFn(aRaw, a as KTDataTableDataInterface);
				const bVal = sortValueFn(bRaw, b as KTDataTableDataInterface);
				const aNum = typeof aVal === 'number' ? aVal : parseNumeric(aVal);
				const bNum = typeof bVal === 'number' ? bVal : parseNumeric(bVal);
				if (typeof aVal === 'number' && typeof bVal === 'number') {
					return compareNumeric(aNum, bNum, sortOrder);
				}
				return compareValues(aVal, bVal, sortOrder);
			}
			if (useNumeric) {
				const aNum = parseNumeric(aRaw);
				const bNum = parseNumeric(bRaw);
				return compareNumeric(aNum, bNum, sortOrder);
			}
			return compareValues(aRaw, bRaw, sortOrder);
		});
	}

	function toggleSortOrder(
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

	function setSortIcon(
		sortField: keyof T,
		sortOrder: KTDataTableSortOrderInterface,
	): void {
		const baseClass = config.sort?.classes?.base || '';
		const sortClass = sortOrder
			? sortOrder === 'asc'
				? config.sort?.classes?.asc || ''
				: config.sort?.classes?.desc || ''
			: '';
		// Clear all headers: remove sort state so only the active column shows highlighted arrow
		const allTh = theadElement.querySelectorAll('th');
		allTh.forEach((header) => {
			const el = header as HTMLElement;
			el.setAttribute('aria-sort', 'none');
			const sortElement = header.querySelector(`.${baseClass}`) as HTMLElement;
			if (sortElement) {
				sortElement.className = baseClass;
			}
		});
		// Apply sort state to the active column so table.css [aria-sort='asc'] / [aria-sort='desc'] can highlight the arrow
		const th =
			typeof sortField === 'number'
				? allTh[sortField]
				: (theadElement.querySelector(
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

	function initSort(): void {
		if (!theadElement) return;
		// Set the initial sort icon
		setSortIcon(getState().sortField as keyof T, getState().sortOrder);
		// Get all the table headers
		const headers = Array.from(theadElement.querySelectorAll('th'));
		headers.forEach((header) => {
			// If the sort class is not found, it's not a sortable column
			if (!header.querySelector(`.${config.sort?.classes?.base}`)) return;

			// Check if sorting is disabled for this column
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
				const state = getState();
				const sortOrder = toggleSortOrder(
					state.sortField,
					state.sortOrder,
					sortField,
				);
				setSortIcon(sortField, sortOrder);
				setState(sortField, sortOrder);
				fireEvent('sort', { field: sortField, order: sortOrder });
				dispatchEvent('sort', { field: sortField, order: sortOrder });
				updateData();
			});
		});
	}

	return { initSort, sortData, toggleSortOrder, setSortIcon };
}
