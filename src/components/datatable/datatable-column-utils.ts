/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Shared column resolution utilities for KTDataTable.
 * Eliminates duplicated column discovery logic across local-provider,
 * table-renderer, and the main datatable class.
 */

export interface ResolvedColumns {
	/** All <th> elements from the thead */
	allThs: HTMLTableCellElement[];
	/** Only <th> elements that have data-kt-datatable-column attribute */
	typedThs: HTMLTableCellElement[];
	/** The column list to use for rendering: typedThs if all ths have the attr, else allThs */
	columnsByIndex: HTMLTableCellElement[];
}

/**
 * Resolve column headers from a thead element.
 * Returns both the raw th list and the typed (data-kt-datatable-column) subset.
 * When some ths lack the attribute, columnsByIndex falls back to all ths by index.
 */
export function resolveColumns(
	theadElement: HTMLTableSectionElement | null,
): ResolvedColumns {
	const allThs: HTMLTableCellElement[] = theadElement
		? Array.from(theadElement.querySelectorAll('th'))
		: [];

	const typedThs = allThs.filter((th) =>
		th.hasAttribute('data-kt-datatable-column'),
	);

	const columnsByIndex = typedThs.length > 0 ? typedThs : allThs;

	return { allThs, typedThs, columnsByIndex };
}

/**
 * Get the logical column count: number of data columns.
 * Prefers originalData keys, falls back to first tbody row td count,
 * then to resolved columns from thead.
 */
export function getLogicalColumnCount(
	theadElement: HTMLTableSectionElement | null,
	tbodyElement: HTMLTableSectionElement | null,
	originalData?: Array<Record<string, unknown>>,
): number {
	if (originalData && originalData.length > 0) {
		return Object.keys(originalData[0]).length;
	}
	if (tbodyElement) {
		const firstRow = tbodyElement.querySelector<HTMLTableRowElement>('tr');
		if (firstRow) {
			return firstRow.querySelectorAll('td').length;
		}
	}
	const { columnsByIndex } = resolveColumns(theadElement);
	return columnsByIndex.length;
}
