/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// Define the sort order and filter criteria types
export type KTDataTableSortOrderInterface = 'asc' | 'desc' | '';

export interface KTDataTableDataInterface {
	[key: string]: string | number | boolean | object;
}

export interface KTDataTableAttributeInterface {
	[key: string]: string;
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
 * CSV Export configuration options
 */
export interface KTDataTableCSVExportConfigInterface {
	/**
	 * Enable CSV export functionality
	 * @default false
	 */
	enabled?: boolean;

	/**
	 * Export scope - current page data or all data
	 * @default 'current'
	 */
	scope?: 'current' | 'all' | 'selected';

	/**
	 * Include table headers in CSV export
	 * @default true
	 */
	includeHeaders?: boolean;

	/**
	 * CSV delimiter character
	 * @default ','
	 */
	delimiter?: string;

	/**
	 * Custom filename for the exported CSV file
	 * @default 'datatable-export'
	 */
	filename?: string;

	/**
	 * Include timestamp in filename
	 * @default true
	 */
	includeTimestamp?: boolean;

	/**
	 * Columns to include in export (if empty, all columns are included)
	 * @default []
	 */
	includeColumns?: string[];

	/**
	 * Columns to exclude from export
	 * @default []
	 */
	excludeColumns?: string[];

	/**
	 * Custom header mapping (column key -> display name)
	 * @default {}
	 */
	headerMapping?: Record<string, string>;

	/**
	 * Custom data transformation function for each cell
	 * @param value Cell value
	 * @param column Column key
	 * @param row Row data
	 * @returns Transformed value
	 */
	transformValue?: (value: any, column: string, row: any) => string;
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

	/**
	 * Show loading spinner
	 */
	showSpinner(): void;

	/**
	 * Hide loading spinner
	 */
	hideSpinner(): void;

	/**
	 * Export table data as CSV
	 * @param options Optional export configuration
	 * @returns Promise that resolves when export is complete
	 */
	exportCSV(options?: Partial<KTDataTableCSVExportConfigInterface>): Promise<void>;

	/**
	 * Get the current state of the datatable
	 * @returns Current state object
	 */
	getState(): KTDataTableStateInterface;
}

export interface KTDataTableResponseDataInterface {
	data: KTDataTableDataInterface[];
	totalCount: number;
}

export type KTDataTableColumnFilterTypeInterface =
	| 'text'
	| 'numeric'
	| 'dateRange';

export interface KTDataTableColumnFilterInterface {
	column: string;
	type: string;
	value: string;
}

// Define the DataTable options type
export interface KTDataTableConfigInterface {
	requestMethod?: string;
	requestHeaders?: { [key: string]: string };
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
		[key: keyof KTDataTableDataInterface | string]: {
			title?: string;
			render?: (
				item: KTDataTableDataInterface[keyof KTDataTableDataInterface] | string,
				data: KTDataTableDataInterface,
				context: KTDataTableInterface,
			) => string | HTMLElement | DocumentFragment;
			checkbox?: boolean;
			createdCell?: (
				cell: HTMLTableCellElement,
				cellData:
					| KTDataTableDataInterface[keyof KTDataTableDataInterface]
					| string,
				rowData: KTDataTableDataInterface,
				row: HTMLTableRowElement,
			) => void;
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
			data: KTDataTableDataInterface[],
			sortField: keyof KTDataTableDataInterface | number,
			sortOrder: KTDataTableSortOrderInterface,
		) => KTDataTableDataInterface[];
	};

	search?: {
		delay?: number; // delay in milliseconds
		callback?: (
			data: KTDataTableDataInterface[],
			search: string,
		) => KTDataTableDataInterface[]; // search callback
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

	/**
	 * CSV Export configuration
	 */
	csvExport?: KTDataTableCSVExportConfigInterface;

	checkbox?: {
		checkedClass?: string;
		preserveSelection?: boolean;
	};

	/**
	 * Private properties
	 */
	_state?: KTDataTableStateInterface;
	_data?: KTDataTableDataInterface[];

	loadingClass?: string;
}

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
