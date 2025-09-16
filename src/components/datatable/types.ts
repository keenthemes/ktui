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
}

export interface KTDataTableResponseDataInterface {
	data: KTDataTableDataInterface[];
	totalCount: number;
}

// Define the DataTable options type
export interface KTDataTableConfigInterface {
	requestMethod?: string;
	requestHeaders?: { [key: string]: string };
	apiEndpoint?: string;
	mapResponse?: (
		data: KTDataTableResponseDataInterface
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
				context: KTDataTableInterface
			) => string | HTMLElement | DocumentFragment;
			checkbox?: boolean;
			createdCell?: (
				cell: HTMLTableCellElement,
				cellData:
					| KTDataTableDataInterface[keyof KTDataTableDataInterface]
					| string,
				rowData: KTDataTableDataInterface,
				row: HTMLTableRowElement
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
			sortOrder: KTDataTableSortOrderInterface
		) => KTDataTableDataInterface[];
	};

	search?: {
		delay?: number; // delay in milliseconds
		callback?: (
			data: KTDataTableDataInterface[],
			search: string
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

	checkbox?: {
		checkedClass?: string;
		preserveSelection?: boolean;
	};

	_state?: KTDataTableStateInterface;
	_data?: KTDataTableDataInterface[];

	loadingClass?: string;
}

export type KTDataTableColumnFilterTypeInterface =
	| 'text'
	| 'numeric'
	| 'dateRange';

export type KTDataTableColumnFilterInterface = {
	column: keyof KTDataTableDataInterface;
	type: KTDataTableColumnFilterTypeInterface;
	value: string;
};

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
