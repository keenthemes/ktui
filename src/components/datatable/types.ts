/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTOptionType } from '../../types';

// Define the sort order and filter criteria types
export type KTDataTableSortOrderInterface = 'asc' | 'desc' | '';

export interface KTDataTableDataInterface {
	[key: string]: KTOptionType;
}

export interface KTDataTableAttributeInterface {
	[index: number]: { [key: string]: string };
}

export interface KTDataTableStateInterface {
	page: number;
	sortField: keyof KTDataTableDataInterface | number;
	sortOrder: KTDataTableSortOrderInterface;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	selectedRows: string[];
	filters: KTDataTableColumnFilterInterface[];
	search: string | object;
	originalData: KTDataTableDataInterface[];
	originalDataAttributes: KTDataTableAttributeInterface[];
	_contentChecksum?: string;
	_configChecksum?: string;
}

/**
 * The public methods of the DataTable component
 */
export interface KTDataTableInterface {
	/**
	 * Sort the data by the given field. The sort order is ASC by default.
	 * @param field The field to sort the data by
	 */
	sort: (field: keyof KTDataTableDataInterface | number) => void;

	/**
	 * Go to the given page.
	 * @param page The page number to go to
	 */
	goPage: (page: number) => void;

	/**
	 * Reload the data from the API endpoint.
	 */
	reload: () => void;

	/**
	 * Set the page size.
	 * @param size The new page size
	 */
	setPageSize: (pageSize: number) => void;

	showSpinner(): void;

	hideSpinner(): void;

	/**
	 * Redraw the table, optionally navigating to a specific page.
	 * @param page The page number to navigate to (defaults to 1)
	 */
	redraw(page?: number): void;

	/**
	 * Search the data using a string query or object.
	 * @param query The search query
	 */
	search(query: string | object): void;

	/**
	 * Set or replace a column filter.
	 * @param filter The filter to apply
	 */
	setFilter(filter: KTDataTableColumnFilterInterface): void;

	/**
	 * Get the current state of the datatable.
	 */
	getState(): KTDataTableStateInterface;

	/**
	 * Dispose of the datatable instance, cleaning up event listeners and DOM nodes.
	 */
	dispose(): void;

	/**
	 * Check if all visible rows are checked (header checkbox state).
	 */
	isChecked(): boolean;

	/**
	 * Toggle all visible row checkboxes.
	 */
	toggle(): void;

	/**
	 * Check all visible row checkboxes.
	 */
	check(): void;

	/**
	 * Uncheck all visible row checkboxes.
	 */
	uncheck(): void;

	/**
	 * Get all checked row IDs.
	 */
	getChecked(): string[];

	/**
	 * Reapply checked state to visible checkboxes after redraw/pagination.
	 */
	update(): void;
}

export interface KTDataTableResponseDataInterface {
	data: KTDataTableDataInterface[];
	totalCount: number;
}

export interface KTDataTableLockedRowsConfigInterface {
	top?: number;
	bottom?: number;
}

export interface KTDataTableLockedColumnsConfigInterface {
	left?: string[];
	right?: string[];
}

export interface KTDataTableLockedLayoutConfigInterface {
	stickyHeader?: boolean;
	stickyRows?: KTDataTableLockedRowsConfigInterface;
	stickyColumns?: KTDataTableLockedColumnsConfigInterface;
}

export interface KTDataTableLayoutPluginContextInterface {
	rootElement: HTMLElement;
	tableElement: HTMLTableElement;
	theadElement: HTMLTableSectionElement;
	tbodyElement: HTMLTableSectionElement;
	config: KTDataTableConfigInterface;
}

export interface KTDataTableLayoutPluginInterface {
	beforeDraw?: (ctx: KTDataTableLayoutPluginContextInterface) => void;
	afterDraw?: (ctx: KTDataTableLayoutPluginContextInterface) => void;
	dispose?: (ctx: KTDataTableLayoutPluginContextInterface) => void;
}

// Define the DataTable options type
export interface KTDataTableConfigInterface<
	T extends KTDataTableDataInterface = KTDataTableDataInterface,
> {
	requestMethod?: string;
	requestHeaders?: { [key: string]: string };
	requestCredentials?: RequestCredentials;
	apiEndpoint?: string;
	mapResponse?: (
		data: KTDataTableResponseDataInterface,
	) => KTDataTableResponseDataInterface;
	mapRequest?: (query: URLSearchParams) => URLSearchParams;

	pageSize?: number;
	pageMore?: boolean;
	pageMoreLimit?: number;
	stateSave?: boolean;
	stateNamespace?: string;
	pageSizes?: number[];
	columns?: {
		[key: string]: {
			title?: string;
			render?: (
				item: T[keyof T] | string,
				data: T,
				context: KTDataTableInterface,
			) => string | HTMLElement | DocumentFragment;
			checkbox?: boolean;
			createdCell?: (
				cell: HTMLTableCellElement,
				cellData: T[keyof T] | string,
				rowData: T,
				row: HTMLTableRowElement,
			) => void;
			/**
			 * Sort comparison type for this column. When 'numeric', values are parsed
			 * (e.g. strip currency/commas) and compared as numbers.
			 */
			sortType?: 'string' | 'numeric';
			/**
			 * Custom value used for sorting. When set, this is used instead of the raw
			 * cell value (and instead of sortType). Return a number or string to sort by.
			 * Use for custom formats (e.g. dates, combined fields, custom parsing).
			 */
			sortValue?: (
				cellValue: T[keyof T] | string,
				rowData: T,
			) => number | string;
		};
	};

	infoEmpty?: string;

	info?: string;

	loading?: {
		template: string;
		content: string;
	};

	sort?: {
		classes?: {
			base?: string;
			asc?: string;
			desc?: string;
		};
		// local data sort callback
		callback?: (
			data: T[],
			sortField: keyof T | number,
			sortOrder: KTDataTableSortOrderInterface,
		) => T[];
	};

	search?: {
		delay?: number; // delay in milliseconds
		callback?: (data: T[], search: string) => T[]; // search callback
	};

	pagination?: {
		number: {
			class: string;
			text: string;
		};
		previous: {
			class: string;
			text: string;
		};
		next: {
			class: string;
			text: string;
		};
		more: {
			class: string;
			text: string;
		};
	};

	attributes?: {
		table?: string;
		info?: string;
		size?: string;
		pagination?: string;
		spinner?: string;
		check?: string;
		checkbox?: string;
	};

	checkbox?: {
		checkedClass?: string;
		preserveSelection?: boolean;
	};

	lockedLayout?: KTDataTableLockedLayoutConfigInterface;
	layoutPlugin?: KTDataTableLayoutPluginInterface;

	_state?: KTDataTableStateInterface;
	_data?: T[];

	loadingClass?: string;
}

export type KTDataTableColumnFilterTypeInterface =
	| 'text'
	| 'numeric'
	| 'dateRange';

export interface KTDataTableTextFilterInterface {
	column: keyof KTDataTableDataInterface;
	type: 'text';
	value: string;
}

export interface KTDataTableNumericFilterInterface {
	column: keyof KTDataTableDataInterface;
	type: 'numeric';
	value: number;
}

export interface KTDataTableDateRangeFilterInterface {
	column: keyof KTDataTableDataInterface;
	type: 'dateRange';
	value: { from: string; to: string };
}

export type KTDataTableColumnFilterInterface =
	| KTDataTableTextFilterInterface
	| KTDataTableNumericFilterInterface
	| KTDataTableDateRangeFilterInterface;

export interface KTDataTableCheckConfigInterface {
	target: string;
	checkedClass: string;
}

export interface KTDataTableCheckInterface {
	toggle(): void;

	check(): void;

	uncheck(): void;

	isChecked(): boolean;

	getChecked(): string[];
}

export interface KTDataTableCheckChangePayloadInterface {
	cancel?: boolean;
}
