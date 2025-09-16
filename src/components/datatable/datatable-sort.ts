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
		sortOrder: KTDataTableSortOrderInterface
	): T[];
	toggleSortOrder(
		currentField: keyof T | number,
		currentOrder: KTDataTableSortOrderInterface,
		newField: keyof T | number
	): KTDataTableSortOrderInterface;
	setSortIcon(
		sortField: keyof T,
		sortOrder: KTDataTableSortOrderInterface
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
		order: KTDataTableSortOrderInterface
	) => void,
	fireEvent: (eventName: string, eventData?: any) => void,
	dispatchEvent: (eventName: string, eventData?: any) => void,
	updateData: () => void
): KTDataTableSortAPI<T> {
	// Helper to compare values for sorting
	function compareValues(
		a: unknown,
		b: unknown,
		sortOrder: KTDataTableSortOrderInterface
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

	function sortData(
		data: T[],
		sortField: keyof T | number,
		sortOrder: KTDataTableSortOrderInterface
	): T[] {
		return data.sort((a, b) => {
			const aValue = a[sortField as keyof T] as unknown;
			const bValue = b[sortField as keyof T] as unknown;
			return compareValues(aValue, bValue, sortOrder);
		});
	}

	function toggleSortOrder(
		currentField: keyof T | number,
		currentOrder: KTDataTableSortOrderInterface,
		newField: keyof T | number
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
		sortOrder: KTDataTableSortOrderInterface
	): void {
		const sortClass = sortOrder
			? sortOrder === 'asc'
				? config.sort?.classes?.asc || ''
				: config.sort?.classes?.desc || ''
			: '';
		const th =
			typeof sortField === 'number'
				? theadElement.querySelectorAll('th')[sortField]
				: (theadElement.querySelector(
						`th[data-kt-datatable-column="${String(sortField)}"], th[data-kt-datatable-column-sort="${String(sortField)}"]`
					) as HTMLElement);
		if (th) {
			const sortElement = th.querySelector(
				`.${config.sort?.classes?.base}`
			) as HTMLElement;
			if (sortElement) {
				sortElement.className =
					`${config.sort?.classes?.base} ${sortClass}`.trim();
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
					sortField
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
