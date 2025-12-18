/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import {
	KTDataTableDataInterface,
	KTDataTableInterface,
	KTDataTableConfigInterface as KTDataTableConfigInterface,
	KTDataTableSortOrderInterface,
	KTDataTableStateInterface,
	KTDataTableColumnFilterInterface,
	KTDataTableAttributeInterface,
} from './types';
import KTUtils from '../../helpers/utils';
import KTComponents from '../../index';
import KTData from '../../helpers/data';
import {
	createCheckboxHandler,
	KTDataTableCheckboxAPI,
} from './datatable-checkbox';
import { createSortHandler, KTDataTableSortAPI } from './datatable-sort';

/**
 * Custom DataTable plugin class with server-side API, pagination, and sorting
 * @classdesc A custom KTComponent class that integrates server-side API, pagination, and sorting functionality into a table.
 * It supports fetching data from a server-side API, pagination, and sorting of the fetched data.
 * @class
 * @extends {KTComponent}
 * @param {HTMLElement} element The table element
 * @param {KTDataTableConfigInterface} [config] Additional configuration options
 */
export class KTDataTable<T extends KTDataTableDataInterface>
	extends KTComponent
	implements KTDataTableInterface
{
	protected override _name: string = 'datatable';
	protected override _config: KTDataTableConfigInterface;
	protected override _defaultConfig: KTDataTableConfigInterface;

	private _tableElement: HTMLTableElement;
	private _tbodyElement: HTMLTableSectionElement;
	private _theadElement: HTMLTableSectionElement;
	private _originalTbodyClass: string = ''; // Store original tbody class
	private _originalTrClasses: string[] = []; // Store original tr classes
	private _originalTheadClass: string = ''; // Store original thead class
	private _originalTdClasses: string[][] = []; // Store original td classes as a 2D array [row][col]
	private _originalThClasses: string[] = []; // Store original th classes

	private _infoElement: HTMLElement;
	private _sizeElement: HTMLSelectElement;
	private _paginationElement: HTMLElement;

	private _checkbox: KTDataTableCheckboxAPI;
	private _sortHandler: KTDataTableSortAPI<T>;

	private _data: T[] = [];
	private _isFetching: boolean = false;

	/**
	 * AbortController for cancelling previous fetch requests
	 * Used to prevent race conditions when multiple requests are triggered rapidly
	 */
	private _abortController: AbortController | null = null;

	/**
	 * Request ID counter for tracking request sequence
	 * Used to detect and ignore stale responses from older requests
	 */
	private _requestId: number = 0;

	constructor(element: HTMLElement, config?: KTDataTableConfigInterface) {
		super();

		// Check for existing instance
		const existingInstance = KTData.get(element, this._name) as
			| KTDataTable<T>
			| undefined;
		if (existingInstance) {
			// If instance exists and is not disposed, return early (idempotent initialization)
			if (!existingInstance._disposed) {
				return;
			}
			// If instance exists but is disposed, it will be cleaned up in _init()
		}

		this._defaultConfig = this._initDefaultConfig(config);

		this._init(element);
		this._buildConfig();

		// Store the instance directly on the element
		(element as any).instance = this;

		// Store in static instances map for getInstance() lookup
		KTDataTable._instances.set(element, this as any);

		this._initElements();

		// Initialize checkbox handler
		this._checkbox = createCheckboxHandler(
			this._element,
			this._config,
			(eventName: string, eventData?: any) => {
				this._fireEvent(eventName, eventData);
				this._dispatchEvent(eventName, eventData);
			},
		);

		// Initialize sort handler
		this._sortHandler = createSortHandler(
			this._config,
			this._theadElement,
			() => ({
				sortField: this.getState().sortField,
				sortOrder: this.getState().sortOrder,
			}),
			(field, order) => {
				this._config._state.sortField = field as never;
				this._config._state.sortOrder = order;
			},
			this._fireEvent.bind(this),
			this._dispatchEvent.bind(this),
			this._updateData.bind(this),
		);

		this._sortHandler.initSort();

		if (this._config.stateSave === false) {
			this._deleteState();
		}

		if (this._config.stateSave) {
			this._loadState();
		}

		this._updateData();

		this._fireEvent('init');
		this._dispatchEvent('init');
	}

	/**
	 * Initialize default configuration for the datatable
	 * @param config User-provided configuration options
	 * @returns Default configuration merged with user-provided options
	 */
	private _initDefaultConfig(
		config?: KTDataTableConfigInterface,
	): KTDataTableConfigInterface {
		const defaultConfig = {
			/**
			 * HTTP method for server-side API call
			 */
			requestMethod: 'GET',
			/**
			 * Custom HTTP headers for the API request
			 */
			requestHeaders: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			/**
			 * Pagination info template
			 */
			info: '{start}-{end} of {total}',
			/**
			 * Info text when there is no data
			 */
			infoEmpty: 'No records found',
			/**
			 * Available page sizes
			 */
			pageSizes: [5, 10, 20, 30, 50],
			/**
			 * Default page size
			 */
			pageSize: 10,
			/**
			 * Enable or disable pagination more button
			 */
			pageMore: true,
			/**
			 * Maximum number of pages before enabling pagination more button
			 */
			pageMoreLimit: 3,
			/**
			 * Pagination button templates
			 */
			pagination: {
				number: {
					/**
					 * CSS classes to be added to the pagination button
					 */
					class: 'kt-datatable-pagination-button',
					/**
					 * Text to be displayed in the pagination button
					 */
					text: '{page}',
				},
				previous: {
					/**
					 * CSS classes to be added to the previous pagination button
					 */
					class: 'kt-datatable-pagination-button kt-datatable-pagination-prev',
					/**
					 * Text to be displayed in the previous pagination button
					 */
					text: `
						<svg class="rtl:transform rtl:rotate-180 size-3.5 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8.86501 16.7882V12.8481H21.1459C21.3724 12.8481 21.5897 12.7581 21.7498 12.5979C21.91 12.4378 22 12.2205 22 11.994C22 11.7675 21.91 11.5503 21.7498 11.3901C21.5897 11.2299 21.3724 11.1399 21.1459 11.1399H8.86501V7.2112C8.86628 7.10375 8.83517 6.9984 8.77573 6.90887C8.7163 6.81934 8.63129 6.74978 8.53177 6.70923C8.43225 6.66869 8.32283 6.65904 8.21775 6.68155C8.11267 6.70405 8.0168 6.75766 7.94262 6.83541L2.15981 11.6182C2.1092 11.668 2.06901 11.7274 2.04157 11.7929C2.01413 11.8584 2 11.9287 2 11.9997C2 12.0707 2.01413 12.141 2.04157 12.2065C2.06901 12.272 2.1092 12.3314 2.15981 12.3812L7.94262 17.164C8.0168 17.2417 8.11267 17.2953 8.21775 17.3178C8.32283 17.3403 8.43225 17.3307 8.53177 17.2902C8.63129 17.2496 8.7163 17.18 8.77573 17.0905C8.83517 17.001 8.86628 16.8956 8.86501 16.7882Z" fill="currentColor"/>
						</svg>
					`,
				},
				next: {
					/**
					 * CSS classes to be added to the next pagination button
					 */
					class: 'kt-datatable-pagination-button kt-datatable-pagination-next',
					/**
					 * Text to be displayed in the next pagination button
					 */
					text: `
						<svg class="rtl:transform rtl:rotate-180 size-3.5 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M15.135 7.21144V11.1516H2.85407C2.62756 11.1516 2.41032 11.2415 2.25015 11.4017C2.08998 11.5619 2 11.7791 2 12.0056C2 12.2321 2.08998 12.4494 2.25015 12.6096C2.41032 12.7697 2.62756 12.8597 2.85407 12.8597H15.135V16.7884C15.1337 16.8959 15.1648 17.0012 15.2243 17.0908C15.2837 17.1803 15.3687 17.2499 15.4682 17.2904C15.5677 17.3309 15.6772 17.3406 15.7822 17.3181C15.8873 17.2956 15.9832 17.242 16.0574 17.1642L21.8402 12.3814C21.8908 12.3316 21.931 12.2722 21.9584 12.2067C21.9859 12.1412 22 12.0709 22 11.9999C22 11.9289 21.9859 11.8586 21.9584 11.7931C21.931 11.7276 21.8908 11.6683 21.8402 11.6185L16.0574 6.83565C15.9832 6.75791 15.8873 6.70429 15.7822 6.68179C15.6772 6.65929 15.5677 6.66893 15.4682 6.70948C15.3687 6.75002 15.2837 6.81959 15.2243 6.90911C15.1648 6.99864 15.1337 7.10399 15.135 7.21144Z" fill="currentColor"/>
						</svg>
					`,
				},
				more: {
					/**
					 * CSS classes to be added to the pagination more button
					 */
					class: 'kt-datatable-pagination-button kt-datatable-pagination-more',
					/**
					 * Text to be displayed in the pagination more button
					 */
					text: '...',
				},
			},
			/**
			 * Sorting options
			 */
			sort: {
				/**
				 * CSS classes to be added to the sortable headers
				 */
				classes: {
					base: 'kt-table-col',
					asc: 'asc',
					desc: 'desc',
				},
				/**
				 * Local sorting callback function
				 * Sorts the data array based on the sort field and order
				 * @param data Data array to be sorted
				 * @param sortField Property name of the data object to be sorted by
				 * @param sortOrder Sorting order (ascending or descending)
				 * @returns Sorted data array
				 */
				callback: (
					data: T[],
					sortField: keyof T | number,
					sortOrder: KTDataTableSortOrderInterface,
				): T[] => {
					return this._sortHandler
						? this._sortHandler.sortData(data, sortField, sortOrder)
						: data;
				},
			},
			search: {
				/**
				 * Delay in milliseconds before the search function is applied to the data array
				 * @default 500
				 */
				delay: 500, // ms
				/**
				 * Local search callback function
				 * Filters the data array based on the search string
				 * @param data Data array to be filtered
				 * @param search Search string used to filter the data array
				 * @returns Filtered data array
				 */
				callback: (data: T[], search: string): T[] => {
					if (!data || !search) {
						return [];
					}

					return data.filter((item: T) => {
						if (!item) {
							return false;
						}

						return Object.values(item).some(
							(value: string | number | boolean) => {
								if (
									typeof value !== 'string' &&
									typeof value !== 'number' &&
									typeof value !== 'boolean'
								) {
									return false;
								}

								const valueText = String(value)
									.replace(/<[^>]*>|&nbsp;/g, '')
									.toLowerCase();
								return valueText.includes(search.toLowerCase());
							},
						);
					});
				},
			},
			/**
			 * Loading spinner options
			 */
			loading: {
				/**
				 * Template to be displayed during data fetching process
				 */
				template: `
					<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<div class="kt-datatable-loading">
							<svg class="animate-spin -ml-1 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							{content}
						</div>
					</div>
				`,
				/**
				 * Loading text to be displayed in the template
				 */
				content: 'Loading...',
			},
			/**
			 * Selectors of the elements to be targeted
			 */
			attributes: {
				/**
				 * Data table element
				 */
				table: 'table[data-kt-datatable-table="true"]',
				/**
				 * Pagination info element
				 */
				info: '[data-kt-datatable-info="true"]',
				/**
				 * Page size dropdown element
				 */
				size: '[data-kt-datatable-size="true"]',
				/**
				 * Pagination element
				 */
				pagination: '[data-kt-datatable-pagination="true"]',
				/**
				 * Spinner element
				 */
				spinner: '[data-kt-datatable-spinner="true"]',
				/**
				 * Checkbox element
				 */
				check: '[data-kt-datatable-check="true"]',
				checkbox: '[data-kt-datatable-row-check="true"]',
			},
			/**
			 * Enable or disable state saving
			 */
			stateSave: true,
			checkbox: {
				checkedClass: 'checked',
			},
			/**
			 * Private properties
			 */
			_state: {} as KTDataTableStateInterface,
			loadingClass: 'loading',
		} as KTDataTableConfigInterface;

		// Deep merge global config with defaults, then merge instance config (instance takes precedence)
		const mergedWithGlobal = KTDataTable._deepMerge(
			defaultConfig,
			KTDataTable._globalConfig,
		);
		const finalConfig = KTDataTable._deepMerge(mergedWithGlobal, config || {});

		return finalConfig as KTDataTableConfigInterface;
	}

	/**
	 * Initialize table, tbody, thead, info, size, and pagination elements
	 * @returns {void}
	 */
	private _initElements(): void {
		// Guard: check if element is null or disposed
		if (!this._element || this._disposed) {
			return;
		}
		/**
		 * Data table element
		 * First check if the element itself is a table matching the selector
		 * Otherwise, query for a table inside the container
		 */
		if (
			this._element instanceof HTMLTableElement &&
			this._element.matches(this._config.attributes.table)
		) {
			// Element is the table itself
			this._tableElement = this._element;
		} else {
			// Element is a container, query for table inside
			this._tableElement = this._element.querySelector<HTMLTableElement>(
				this._config.attributes.table,
			)!;
		}
		if (!this._tableElement) {
			return;
		}
		/**
		 * Table body element
		 */
		this._tbodyElement =
			this._tableElement.tBodies[0] || this._tableElement.createTBody();
		/**
		 * Table head element
		 */
		this._theadElement = this._tableElement.tHead!;

		// Store original classes
		this._storeOriginalClasses();

		/**
		 * Pagination info element
		 */
		this._infoElement = this._element.querySelector<HTMLElement>(
			this._config.attributes.info,
		)!;
		/**
		 * Page size dropdown element
		 */
		this._sizeElement = this._element.querySelector<HTMLSelectElement>(
			this._config.attributes.size,
		)!;
		/**
		 * Pagination element
		 */
		this._paginationElement = this._element.querySelector<HTMLElement>(
			this._config.attributes.pagination,
		)!;
	}

	/**
	 * Store original classes from table elements
	 * @returns {void}
	 */
	private _storeOriginalClasses(): void {
		// Store tbody class
		if (this._tbodyElement) {
			this._originalTbodyClass = this._tbodyElement.className || '';
		}

		// Store thead class and th classes
		if (this._theadElement) {
			this._originalTheadClass = this._theadElement.className || '';

			// Store th classes
			const thElements =
				this._theadElement.querySelectorAll<HTMLTableCellElement>('th');
			this._originalThClasses = Array.from(thElements).map(
				(th) => th.className || '',
			);
		}

		// Store tr and td classes
		if (this._tbodyElement) {
			const originalRows =
				this._tbodyElement.querySelectorAll<HTMLTableRowElement>('tr');
			this._originalTrClasses = Array.from(originalRows).map(
				(row) => row.className || '',
			);

			// Store td classes as a 2D array
			this._originalTdClasses = [];
			Array.from(originalRows).forEach((row, rowIndex) => {
				const tdElements = row.querySelectorAll<HTMLTableCellElement>('td');
				this._originalTdClasses[rowIndex] = Array.from(tdElements).map(
					(td) => td.className || '',
				);
			});
		}
	}

	/**
	 * Fetch data from the server or from the DOM if `apiEndpoint` is not defined.
	 * @returns {Promise<void>} Promise which is resolved after data has been fetched and checkbox plugin initialized.
	 */
	private async _updateData(): Promise<void> {
		// Guard: check if table element is initialized or disposed
		if (!this._tableElement || this._disposed) {
			return;
		}
		if (this._isFetching) return; // Prevent duplicate fetches
		this._isFetching = true;
		try {
			this._showSpinner(); // Show spinner before fetching data

			// Fetch data and finalize - properly await to ensure finally block runs after completion
			if (typeof this._config.apiEndpoint === 'undefined') {
				await this._fetchDataFromLocal();
				// Guard again before finalize (might have been disposed during fetch)
				if (!this._disposed && this._element) {
					await this._finalize();
				}
			} else {
				await this._fetchDataFromServer();
				// Guard again before finalize (might have been disposed during fetch)
				if (!this._disposed && this._element) {
					await this._finalize();
				}
			}
		} finally {
			// Finally block now correctly executes after promises resolve, not immediately
			this._isFetching = false;
		}
	}

	/**
	 * Finalize data table after data has been fetched
	 * @returns {void}
	 */
	private _finalize(): void {
		// Guard: check if disposed or element is null
		if (this._disposed || !this._element) {
			return;
		}
		this._element.classList.add('datatable-initialized');

		// Initialize checkbox logic
		this._checkbox.init();

		// Re-initialize sort handler to restore click listeners after table redraw
		if (this._sortHandler) {
			this._sortHandler.initSort();
		}

		this._attachSearchEvent();

		if (typeof KTComponents !== 'undefined') {
			KTComponents.init();
		}

		/**
		 * Hide spinner
		 */
		this._hideSpinner();
	}

	/**
	 * Attach search event to the search input element
	 * @returns {void}
	 */
	private _attachSearchEvent(): void {
		const tableId: string = this._tableId();
		const searchElement: HTMLInputElement | null =
			document.querySelector<HTMLInputElement>(
				`[data-kt-datatable-search="#${tableId}"]`,
			);

		// Get search state
		const { search } = this.getState();
		// Set search value
		if (searchElement) {
			searchElement.value =
				search === undefined || search === null
					? ''
					: typeof search === 'string'
						? search
						: String(search);
		}

		if (searchElement) {
			// Check if a debounced search function already exists
			if ((searchElement as any)._debouncedSearch) {
				// Remove the existing debounced event listener
				searchElement.removeEventListener(
					'keyup',
					(searchElement as any)._debouncedSearch,
				);
			}

			// Create a new debounced search function
			const debouncedSearch = this._debounce(() => {
				this.search(searchElement.value);
			}, this._config.search.delay);

			// Store the new debounced function as a property of the element
			(searchElement as any)._debouncedSearch = debouncedSearch;

			// Add the new debounced event listener
			searchElement.addEventListener('keyup', debouncedSearch);
		}
	}

	/**
	 * Fetch data from the DOM
	 * Fetch data from the table element and save it to the `originalData` state property.
	 * This method is used when the data is not fetched from the server via an API endpoint.
	 */
	private async _fetchDataFromLocal(): Promise<void> {
		this._fireEvent('fetch');
		this._dispatchEvent('fetch');

		const { sortField, sortOrder, page, pageSize, search } = this.getState();
		let { originalData } = this.getState();

		// If the table element or the original data is not defined, bail
		if (
			!this._tableElement ||
			originalData === undefined ||
			this._tableConfigInvalidate() ||
			this._localTableHeaderInvalidate() ||
			this._localTableContentInvalidate()
		) {
			this._deleteState();

			const { originalData, originalDataAttributes } =
				this._localExtractTableContent();

			this._config._state.originalData = originalData;
			this._config._state.originalDataAttributes = originalDataAttributes;
		}

		// Update the original data variable
		originalData = this.getState().originalData;

		// Clone the original data
		let _temp = (this._data = [...originalData] as T[]);

		if (search) {
			_temp = this._data = this._config.search.callback.call(
				this,
				this._data,
				search,
			) as T[];
		}

		// If sorting is defined, sort the data
		if (
			sortField !== undefined &&
			sortOrder !== undefined &&
			sortOrder !== ''
		) {
			if (typeof this._config.sort.callback === 'function') {
				this._data = this._config.sort.callback.call(
					this,
					this._data,
					sortField as string,
					sortOrder,
				) as T[];
			}
		}

		// If there is data, slice it to the current page size
		if (this._data?.length > 0) {
			// Calculate the start and end indices for the current page
			const startIndex = (page - 1) * pageSize;
			const endIndex = startIndex + pageSize;

			this._data = this._data.slice(startIndex, endIndex) as T[];
		}

		// Determine number of total rows
		this._config._state.totalItems = _temp.length;

		// Draw the data
		await this._draw();
		this._fireEvent('fetched');
		this._dispatchEvent('fetched');
	}

	/**
	 * Checks if the table content has been invalidated by comparing the current checksum of the table body
	 * with the stored checksum in the state. If the checksums are different, the state is updated with the
	 * new checksum and `true` is returned. Otherwise, `false` is returned.
	 *
	 * @returns {boolean} `true` if the table content has been invalidated, `false` otherwise.
	 */
	private _localTableContentInvalidate(): boolean {
		const checksum: string = KTUtils.checksum(
			JSON.stringify(this._tbodyElement.innerHTML),
		);
		if (this.getState()._contentChecksum !== checksum) {
			this._config._state._contentChecksum = checksum;
			return true;
		}
		return false;
	}

	private _tableConfigInvalidate(): boolean {
		// Remove _data and _state from config
		const { _data, _state, ...restConfig } = this._config;
		const checksum: string = KTUtils.checksum(JSON.stringify(restConfig));
		if (_state._configChecksum !== checksum) {
			this._config._state._configChecksum = checksum;
			return true;
		}
		return false;
	}

	/**
	 * Extract the table content and returns it as an object containing an array of original data and an array of original data attributes.
	 *
	 * @returns {{originalData: T[], originalDataAttributes: KTDataTableAttributeInterface[]}} - An object containing an array of original data and an array of original data attributes.
	 */
	private _localExtractTableContent(): {
		originalData: T[];
		originalDataAttributes: KTDataTableAttributeInterface[];
	} {
		const originalData: T[] = [];
		const originalDataAttributes: KTDataTableAttributeInterface[] = [];

		this._storeOriginalClasses();

		const rows = this._tbodyElement.querySelectorAll<HTMLTableRowElement>('tr');
		const ths: NodeListOf<HTMLTableCellElement> = this._theadElement
			? this._theadElement.querySelectorAll('th')
			: ([] as unknown as NodeListOf<HTMLTableCellElement>);

		rows.forEach((row: HTMLTableRowElement) => {
			const dataRow: T = {} as T;
			const dataRowAttribute: KTDataTableAttributeInterface =
				{} as KTDataTableAttributeInterface;

			row.querySelectorAll<HTMLTableCellElement>('td').forEach((td, index) => {
				const colName = ths[index]?.getAttribute('data-kt-datatable-column');
				if (colName) {
					dataRow[colName as keyof T] = td.innerHTML?.trim() as T[keyof T];
				} else {
					// Store the original HTML for fallback
					dataRow[index as keyof T] = td.innerHTML?.trim() as T[keyof T];
				}
			});

			if (Object.keys(dataRow).length > 0) {
				originalData.push(dataRow);
				originalDataAttributes.push(dataRowAttribute);
			}
		});

		return { originalData, originalDataAttributes };
	}

	/**
	 * Check if the table header is invalidated
	 * @returns {boolean} - Returns true if the table header is invalidated, false otherwise
	 */
	private _localTableHeaderInvalidate(): boolean {
		const { originalData } = this.getState();
		const currentTableHeaders = this._theadElement
			? this._theadElement.querySelectorAll('th').length
			: 0;
		const totalColumns = originalData.length
			? Object.keys(originalData[0]).length
			: 0;

		return currentTableHeaders !== totalColumns;
	}

	/**
	 * Fetch data from the server
	 */
	private async _fetchDataFromServer(): Promise<void> {
		// Increment request ID to track this specific request
		const currentRequestId = ++this._requestId;

		this._fireEvent('fetch');
		this._dispatchEvent('fetch');

		const queryParams = this._getQueryParamsForFetchRequest();

		let response: Response;
		try {
			response = await this._performFetchRequest(queryParams);
		} catch (error) {
			// Silently ignore AbortError - request was cancelled
			if ((error as Error).name === 'AbortError') {
				return;
			}
			throw error;
		}

		// Check if this response is stale (a newer request has been initiated)
		if (currentRequestId !== this._requestId) {
			// Ignore stale response - a more recent request is in progress or has completed
			return;
		}

		let responseData = null;

		try {
			responseData = await response.json();
		} catch (error) {
			// Fire event with complete error context for application handling
			this._fireEvent('parseError', {
				response,
				error: String(error),
				status: response.status,
				statusText: response.statusText
			});
			this._dispatchEvent('parseError', {
				response,
				error: String(error),
				status: response.status,
				statusText: response.statusText
			});
			return;
		}

		// Double-check request ID after JSON parsing (additional safety)
		if (currentRequestId !== this._requestId) {
			return;
		}

		this._fireEvent('fetched', { response: responseData });
		this._dispatchEvent('fetched', { response: responseData });

		// Use the mapResponse function to transform the data if provided
		if (typeof this._config.mapResponse === 'function') {
			responseData = this._config.mapResponse.call(this, responseData);
		}

		this._data = responseData.data;

		this._config._state.totalItems = responseData.totalCount;

		await this._draw();
		this._fireEvent('fetched');
		this._dispatchEvent('fetched');
	}

	/**
	 * Get the query params for a fetch request
	 * @returns The query params for the fetch request
	 */
	private _getQueryParamsForFetchRequest(): URLSearchParams {
		// Get the current state of the datatable
		const { page, pageSize, sortField, sortOrder, filters, search } =
			this.getState();

		// Create a new URLSearchParams object to store the query params
		let queryParams = new URLSearchParams();

		// Add the current page number and page size to the query params
		queryParams.set('page', String(page));
		queryParams.set('size', String(pageSize));

		// If there is a sort order and field set, add them to the query params
		if (sortOrder !== undefined) {
			queryParams.set('sortOrder', String(sortOrder));
		}

		if (sortField !== undefined) {
			queryParams.set('sortField', String(sortField));
		}

		// If there are any filters set, add them to the query params
		if (Array.isArray(filters) && filters.length) {
			queryParams.set(
				'filters',
				JSON.stringify(
					filters.map((filter: KTDataTableColumnFilterInterface) => ({
						// Map the filter object to a simpler object with just the necessary properties
						column: filter.column,
						type: filter.type,
						value: filter.value,
					})),
				),
			);
		}

		if (search) {
			queryParams.set(
				'search',
				typeof search === 'object' ? JSON.stringify(search) : search,
			);
		}

		// If a mapRequest function is provided, call it with the query params object
		if (typeof this._config.mapRequest === 'function') {
			queryParams = this._config.mapRequest.call(this, queryParams);
		}

		// Return the query params object
		return queryParams;
	}

	private async _performFetchRequest(
		queryParams: URLSearchParams,
	): Promise<Response> {
		let requestMethod: RequestInit['method'] = this._config.requestMethod;
		let requestBody: RequestInit['body'] | undefined = undefined;

		// Cancel previous request to prevent race conditions
		if (this._abortController) {
			this._abortController.abort();
		}

		// Create new AbortController for this request
		this._abortController = new AbortController();

		// If the request method is POST, send the query params as the request body
		if (requestMethod === 'POST') {
			requestBody = queryParams;
		} else if (requestMethod === 'GET') {
			// If the request method is GET, append the query params to the API endpoint
			const apiEndpointWithQueryParams = this._createUrl(
				this._config.apiEndpoint,
			);
			apiEndpointWithQueryParams.search = queryParams.toString();
			this._config.apiEndpoint = apiEndpointWithQueryParams.toString();
		}

		return fetch(this._config.apiEndpoint, {
			method: requestMethod,
			body: requestBody,
			headers: this._config.requestHeaders,
			...(this._config.requestCredentials && {
				credentials: this._config.requestCredentials,
			}),
			// Add abort signal if available
			...(this._abortController && { signal: this._abortController.signal }),
		}).catch((error) => {
			// Silently ignore AbortError - this is expected when requests are cancelled
			if (error.name === 'AbortError') {
				return Promise.reject(error);
			}

			// Trigger an error event for non-abort errors
			this._fireEvent('error', { error });
			this._dispatchEvent('error', { error });

			this._noticeOnTable('Error performing fetch request: ' + String(error));
			throw error;
		});
	}

	/**
	 * Creates a complete URL from a relative path or a full URL.
	 *
	 * This method accepts a string that can be either a relative path or a full URL.
	 * If the string is a complete URL (i.e., it contains a valid protocol), a URL
	 * object based on that string is returned. Otherwise, it ensures the path starts
	 * with a "/" and combines it with the provided base URL (or the current window's origin)
	 * to form a complete URL.
	 *
	 * @param {string} pathOrUrl - The path or URL to process.
	 * @param {string | null} [baseUrl=window.location.origin] - The base URL for resolving the relative path.
	 *                                                           Defaults to the current window's origin.
	 * @returns {URL} The resulting URL object.
	 */

	private _createUrl(
		pathOrUrl: string,
		baseUrl: string | null = window.location.origin,
	): URL {
		// Regular expression to check if the input is a full URL
		const isFullUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(pathOrUrl);

		if (isFullUrl) {
			return new URL(pathOrUrl); // Return full URL as URL object
		}

		// Ensure path starts with a slash to avoid incorrect concatenation
		const normalizedPath = pathOrUrl.startsWith('/')
			? pathOrUrl
			: `/${pathOrUrl}`;

		return new URL(normalizedPath, baseUrl);
	}

	/**
	 * Update the table and pagination controls with new data
	 * @returns {Promise<void>} A promise that resolves when the table and pagination controls are updated
	 */
	private async _draw(): Promise<void> {
		this._config._state.totalPages =
			Math.ceil(this.getState().totalItems / this.getState().pageSize) || 0;

		this._fireEvent('draw');
		this._dispatchEvent('draw');

		this._dispose();

		// Update the table and pagination controls
		if (this._theadElement && this._tbodyElement) {
			this._updateTable();
		}

		if (this._infoElement && this._paginationElement) {
			this._updatePagination();
		}

		this._fireEvent('drew');
		this._dispatchEvent('drew');

		// Spinner is hidden in _finalize() to ensure it stays visible until the entire request completes
		// Removed duplicate _hideSpinner() call here to prevent premature hiding

		if (this._config.stateSave) {
			this._saveState();
		}
	}

	/**
	 * Update the HTML table with new data
	 * @returns {HTMLTableSectionElement} The new table body element
	 */
	private _updateTable(): HTMLTableSectionElement {
		// Clear the existing table contents using a more efficient method
		while (this._tableElement.tBodies.length) {
			this._tableElement.removeChild(this._tableElement.tBodies[0]);
		}

		// Create the table body with the new data
		const tbodyElement =
			this._tableElement.createTBody() as HTMLTableSectionElement;

		// Apply the original class to the new tbody element
		if (this._originalTbodyClass) {
			tbodyElement.className = this._originalTbodyClass;
		}

		this._updateTableContent(tbodyElement);

		return tbodyElement;
	}

	/**
	 * Update the table content
	 * @param tbodyElement The table body element
	 * @returns {HTMLTableSectionElement} The updated table body element
	 */
	private _updateTableContent(
		tbodyElement: HTMLTableSectionElement,
	): HTMLTableSectionElement {
		const fragment = document.createDocumentFragment();

		tbodyElement.textContent = ''; // Clear the tbody element

		if (this._data.length === 0) {
			this._noticeOnTable(this._config.infoEmpty || '');
			return tbodyElement;
		}

		const ths: NodeListOf<HTMLTableCellElement> = this._theadElement
			? this._theadElement.querySelectorAll('th')
			: ([] as unknown as NodeListOf<HTMLTableCellElement>);

		this._data.forEach((item: T, rowIndex: number) => {
			const row = document.createElement('tr');

			// Apply original tr class if available
			if (this._originalTrClasses && this._originalTrClasses[rowIndex]) {
				row.className = this._originalTrClasses[rowIndex];
			}

			if (!this._config.columns) {
				const dataRowAttributes = this.getState().originalDataAttributes
					? this.getState().originalDataAttributes[rowIndex]
					: null;

				// Use the order of <th> elements to render <td>s in the correct order
				ths.forEach((th, colIndex) => {
					const colName = th.getAttribute('data-kt-datatable-column');
					const td = document.createElement('td');
					let value: any;
					if (colName && Object.prototype.hasOwnProperty.call(item, colName)) {
						value = item[colName as keyof T];
					} else if (Object.prototype.hasOwnProperty.call(item, colIndex)) {
						value = item[colIndex as keyof T];
					} else {
						value = '';
					}
					td.innerHTML = value as string;

					// Apply original td class if available
					if (
						this._originalTdClasses &&
						this._originalTdClasses[rowIndex] &&
						this._originalTdClasses[rowIndex][colIndex]
					) {
						td.className = this._originalTdClasses[rowIndex][colIndex];
					}

					if (dataRowAttributes && dataRowAttributes[colIndex]) {
						for (const attr in dataRowAttributes[colIndex]) {
							td.setAttribute(attr, dataRowAttributes[colIndex][attr]);
						}
					}

					row.appendChild(td);
				});
			} else {
				Object.keys(this._config.columns).forEach(
					(key: keyof T, colIndex: number) => {
						const td = document.createElement('td');
						const columnDef = this._config.columns[key as string];

						// Apply original td class if available
						if (
							this._originalTdClasses &&
							this._originalTdClasses[rowIndex] &&
							this._originalTdClasses[rowIndex][colIndex]
						) {
							td.className = this._originalTdClasses[rowIndex][colIndex];
						}

						if (typeof columnDef.render === 'function') {
							const result = columnDef.render.call(this, item[key], item, this);
							if (
								result instanceof HTMLElement ||
								result instanceof DocumentFragment
							) {
								td.appendChild(result);
							} else if (typeof result === 'string') {
								td.innerHTML = result as string;
							}
						} else {
							td.textContent = item[key] as string;
						}

						if (typeof columnDef.createdCell === 'function') {
							columnDef.createdCell.call(this, td, item[key], item, row);
						}

						row.appendChild(td);
					},
				);
			}

			fragment.appendChild(row);
		});

		tbodyElement.appendChild(fragment);
		return tbodyElement;
	}

	/**
	 * Show a notice on the table
	 * @param message The message to show. If empty, the message will be removed
	 * @returns {void}
	 */
	private _noticeOnTable(message: string = ''): void {
		const row = this._tableElement.tBodies[0].insertRow();
		const cell = row.insertCell();
		cell.colSpan = this._theadElement
			? this._theadElement.querySelectorAll('th').length
			: 0;
		cell.innerHTML = message;
	}

	private _updatePagination(): void {
		this._removeChildElements(this._sizeElement);
		this._createPageSizeControls(this._sizeElement);

		this._removeChildElements(this._paginationElement);
		this._createPaginationControls(this._infoElement, this._paginationElement);
	}

	/**
	 * Removes all child elements from the given container element.
	 * @param container The container element to remove the child elements from.
	 */
	private _removeChildElements(container: HTMLElement): void {
		if (!container) {
			return;
		}

		// Loop through all child elements of the container and remove them one by one
		while (container.firstChild) {
			// Remove the first child element (which is the first element in the list of child elements)
			container.removeChild(container.firstChild);
		}
	}

	/**
	 * Creates a container element for the items per page selector.
	 * @param _sizeElement The element to create the page size controls in.
	 * @returns The container element.
	 */
	private _createPageSizeControls(
		_sizeElement: HTMLSelectElement,
	): HTMLSelectElement {
		// If no element is provided, return early
		if (!_sizeElement) {
			return _sizeElement;
		}

		// Wait for the element to be attached to the DOM
		setTimeout(() => {
			// Create <option> elements for each page size option
			const options = this._config.pageSizes.map((size: number) => {
				const option = document.createElement('option') as HTMLOptionElement;
				option.value = String(size);
				option.text = String(size);
				option.selected = this.getState().pageSize === size;
				return option;
			});

			// Add the <option> elements to the provided element
			_sizeElement.append(...options);
		}, 100);

		// Create an event listener for the "change" event on the element
		const _pageSizeControlsEvent = (event: Event) => {
			// When the element changes, reload the page with the new page size and page number 1
			this._reloadPageSize(
				Number((event.target as HTMLSelectElement).value),
				1,
			);
		};

		// Bind the event listener to the component instance
		_sizeElement.onchange = _pageSizeControlsEvent.bind(this);

		// Return the element
		return _sizeElement;
	}

	/**
	 * Reloads the data with the specified page size and optional page number.
	 * @param pageSize The new page size.
	 * @param page The new page number (optional, defaults to 1).
	 */
	private _reloadPageSize(pageSize: number, page: number = 1): void {
		// Update the page size and page number in the state
		this._config._state.pageSize = pageSize;
		this._config._state.page = page;

		// Update the data with the new page size and page number
		this._updateData();
	}

	/**
	 * Creates the pagination controls for the component.
	 * @param _infoElement The element to set the info text in.
	 * @param _paginationElement The element to create the pagination controls in.
	 * @return {HTMLElement} The element containing the pagination controls.
	 */
	private _createPaginationControls(
		_infoElement: HTMLElement,
		_paginationElement: HTMLElement,
	): HTMLElement {
		if (!_infoElement || !_paginationElement || this._data.length === 0) {
			return null;
		}

		this._setPaginationInfoText(_infoElement);
		const paginationContainer =
			this._createPaginationContainer(_paginationElement);

		if (paginationContainer) {
			this._createPaginationButtons(paginationContainer);
		}

		return paginationContainer;
	}

	/**
	 * Sets the info text for the pagination controls.
	 * @param _infoElement The element to set the info text in.
	 */
	private _setPaginationInfoText(_infoElement: HTMLElement): void {
		_infoElement.textContent = this._config.info
			.replace(
				'{start}',
				(this.getState().page - 1) * this.getState().pageSize + 1 + '',
			)
			.replace(
				'{end}',
				Math.min(
					this.getState().page * this.getState().pageSize,
					this.getState().totalItems,
				) + '',
			)
			.replace('{total}', this.getState().totalItems + '');
	}

	/**
	 * Creates the container element for the pagination controls.
	 * @param _paginationElement The element to create the pagination controls in.
	 * @return {HTMLElement} The container element.
	 */
	private _createPaginationContainer(
		_paginationElement: HTMLElement,
	): HTMLElement {
		// No longer create a wrapping div. Just return the pagination element itself.
		return _paginationElement;
	}

	/**
	 * Creates the pagination buttons for the component.
	 * @param paginationContainer The container element for the pagination controls.
	 */
	private _createPaginationButtons(paginationContainer: HTMLElement): void {
		const { page: currentPage, totalPages } = this.getState();
		const { previous, next, number, more } = this._config.pagination;

		// Helper function to create a button
		const createButton = (
			text: string,
			className: string,
			disabled: boolean,
			handleClick: () => void,
		): HTMLButtonElement => {
			const button = document.createElement('button') as HTMLButtonElement;
			button.className = className;
			button.innerHTML = text;
			button.disabled = disabled;
			button.onclick = handleClick;
			return button;
		};

		// Add Previous Button
		paginationContainer.appendChild(
			createButton(
				previous.text,
				`${previous.class}${currentPage === 1 ? ' disabled' : ''}`,
				currentPage === 1,
				() => this._paginateData(currentPage - 1),
			),
		);

		// Calculate range of pages
		const pageMoreEnabled = this._config.pageMore;

		if (pageMoreEnabled) {
			const maxButtons = this._config.pageMoreLimit;
			const range = this._calculatePageRange(
				currentPage,
				totalPages,
				maxButtons,
			);

			// Add start ellipsis
			if (range.start > 1) {
				paginationContainer.appendChild(
					createButton(more.text, more.class, false, () =>
						this._paginateData(Math.max(1, range.start - 1)),
					),
				);
			}

			// Add page buttons
			for (let i = range.start; i <= range.end; i++) {
				paginationContainer.appendChild(
					createButton(
						number.text.replace('{page}', i.toString()),
						`${number.class}${currentPage === i ? ' active disabled' : ''}`,
						currentPage === i,
						() => this._paginateData(i),
					),
				);
			}

			// Add end ellipsis
			if (pageMoreEnabled && range.end < totalPages) {
				paginationContainer.appendChild(
					createButton(more.text, more.class, false, () =>
						this._paginateData(Math.min(totalPages, range.end + 1)),
					),
				);
			}
		} else {
			// Add page buttons
			for (let i = 1; i <= totalPages; i++) {
				paginationContainer.appendChild(
					createButton(
						number.text.replace('{page}', i.toString()),
						`${number.class}${currentPage === i ? ' active disabled' : ''}`,
						currentPage === i,
						() => this._paginateData(i),
					),
				);
			}
		}

		// Add Next Button
		paginationContainer.appendChild(
			createButton(
				next.text,
				`${next.class}${currentPage === totalPages ? ' disabled' : ''}`,
				currentPage === totalPages,
				() => this._paginateData(currentPage + 1),
			),
		);
	}

	// New helper method to calculate page range
	private _calculatePageRange(
		currentPage: number,
		totalPages: number,
		maxButtons: number,
	): { start: number; end: number } {
		let startPage: number, endPage: number;
		const halfMaxButtons = Math.floor(maxButtons / 2);

		if (totalPages <= maxButtons) {
			startPage = 1;
			endPage = totalPages;
		} else {
			startPage = Math.max(currentPage - halfMaxButtons, 1);
			endPage = Math.min(startPage + maxButtons - 1, totalPages);
			if (endPage - startPage < maxButtons - 1) {
				startPage = Math.max(endPage - maxButtons + 1, 1);
			}
		}

		return { start: startPage, end: endPage };
	}

	/**
	 * Method for handling pagination
	 * @param page - The page number to navigate to
	 */
	private _paginateData(page: number): void {
		if (page < 1 || !Number.isInteger(page)) {
			return;
		}

		this._fireEvent('pagination', { page: page });
		this._dispatchEvent('pagination', { page: page });

		if (page >= 1 && page <= this.getState().totalPages) {
			this._config._state.page = page;
			this._updateData();
		}
	}

	// Method to show the loading spinner
	private _showSpinner(): void {
		// Guard: check if element or table element is null
		if (!this._element || !this._tableElement) {
			return;
		}
		const spinner =
			this._element.querySelector<HTMLElement>(
				this._config.attributes.spinner,
			) || this._createSpinner();
		if (spinner) {
			spinner.style.display = 'block';
		}
		this._element.classList.add(this._config.loadingClass);
	}

	// Method to hide the loading spinner
	private _hideSpinner(): void {
		const spinner = this._element.querySelector<HTMLElement>(
			this._config.attributes.spinner,
		);
		if (spinner) {
			spinner.style.display = 'none';
		}
		this._element.classList.remove(this._config.loadingClass);
	}

	// Method to create a spinner element if it doesn't exist
	private _createSpinner(): HTMLElement {
		// Guard: check if table element is null
		if (!this._tableElement || typeof this._config.loading === 'undefined') {
			return null;
		}

		const template = document.createElement('template');
		template.innerHTML = this._config.loading.template
			.trim()
			.replace('{content}', this._config.loading.content);
		const spinner = template.content.firstChild as HTMLElement;
		spinner.setAttribute('data-kt-datatable-spinner', 'true');

		this._tableElement.appendChild(spinner);

		return spinner;
	}

	/**
	 * Saves the current state of the table to local storage.
	 * @returns {void}
	 */
	private _saveState(): void {
		this._fireEvent('stateSave');
		this._dispatchEvent('stateSave');

		const ns: string = this._tableNamespace();

		if (ns) {
			localStorage.setItem(
				ns,
				JSON.stringify(this.getState() as KTDataTableStateInterface),
			);
		}
	}

	/**
	 * Loads the saved state of the table from local storage, if it exists.
	 * @returns {Object} The saved state of the table, or null if no saved state exists.
	 */
	private _loadState(): KTDataTableStateInterface | null {
		const stateString = localStorage.getItem(this._tableNamespace());
		if (!stateString) return null;

		try {
			const state = JSON.parse(stateString) as KTDataTableStateInterface;
			if (state) this._config._state = state;
			return state;
		} catch {} // eslint-disable-line no-empty

		return null;
	}

	private _deleteState(): void {
		const ns = this._tableNamespace();

		if (ns) {
			localStorage.removeItem(ns);
		}
	}

	/**
	 * Gets the namespace for the table's state.
	 * If a namespace is specified in the config, it is used.
	 * Otherwise, if the table element has an ID, it is used.
	 * Otherwise, if the component element has an ID, it is used.
	 * Finally, the component's UID is used.
	 * @returns {string} The namespace for the table's state.
	 */
	private _tableNamespace(): string {
		// Use the specified namespace, if one is given
		if (this._config.stateNamespace) {
			return this._config.stateNamespace;
		}

		// Fallback to the component's UID
		return this._tableId() ?? this._name;
	}

	private _tableId(): string {
		let id: string = null;
		// If the table element has an ID, use that
		if (this._tableElement?.getAttribute('id')) {
			id = this._tableElement.getAttribute('id') as string;
		}

		// If the component element has an ID, use that
		if (this._element?.getAttribute('id')) {
			id = this._element.getAttribute('id') as string;
		}

		return id;
	}

	/**
	 * Clean up all event listeners, handlers, and DOM nodes created by this instance.
	 * This method is called before re-rendering or when disposing the component.
	 */
	private _dispose() {
		// --- 1. Remove search input event listener (debounced) ---
		const tableId: string = this._tableId();
		const searchElement: HTMLInputElement | null =
			document.querySelector<HTMLInputElement>(
				`[data-kt-datatable-search="#${tableId}"]`,
			);
		if (searchElement && (searchElement as any)._debouncedSearch) {
			searchElement.removeEventListener(
				'keyup',
				(searchElement as any)._debouncedSearch,
			);
			delete (searchElement as any)._debouncedSearch;
		}

		// --- 2. Remove page size dropdown event listener ---
		if (this._sizeElement && this._sizeElement.onchange) {
			this._sizeElement.onchange = null;
		}

		// --- 3. Remove all pagination button event listeners ---
		if (this._paginationElement) {
			// Remove all child nodes (buttons) to ensure no lingering listeners
			while (this._paginationElement.firstChild) {
				this._paginationElement.removeChild(this._paginationElement.firstChild);
			}
		}

		// --- 4. Dispose of handler objects (checkbox, sort) ---
		// KTDataTableCheckboxAPI does not have a dispose method, but we can remove header checkbox listener
		if (
			this._checkbox &&
			typeof (this._checkbox as any).dispose === 'function'
		) {
			(this._checkbox as any).dispose();
		} else {
			// Remove header checkbox event listener if possible
			const headerCheckElement = this._element.querySelector<HTMLInputElement>(
				this._config.attributes.check,
			);
			if (headerCheckElement) {
				headerCheckElement.replaceWith(headerCheckElement.cloneNode(true));
			}
		}
		// KTDataTableSortAPI does not have a dispose method, but we can remove th click listeners by replacing them
		if (this._theadElement) {
			const ths = this._theadElement.querySelectorAll('th');
			ths.forEach((th) => {
				th.replaceWith(th.cloneNode(true));
			});
		}

		// --- 5. Remove spinner DOM node if it exists ---
		const spinner = this._element.querySelector<HTMLElement>(
			this._config.attributes.spinner,
		);
		if (spinner && spinner.parentNode) {
			spinner.parentNode.removeChild(spinner);
		}
		this._element.classList.remove(this._config.loadingClass);

		// --- 6. Remove instance reference from the DOM element ---
		if ((this._element as any).instance) {
			delete (this._element as any).instance;
		}

		// --- 7. (Optional) Clear localStorage state ---
		// Uncomment the following line if you want to clear state on dispose:
		// this._deleteState();
	}

	private _debounce(func: Function, wait: number) {
		let timeout: number | undefined;
		return function (...args: any[]) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = window.setTimeout(later, wait);
		};
	}

	/**
	 * Gets the current state of the table.
	 * @returns {KTDataTableStateInterface} The current state of the table.
	 */
	public getState(): KTDataTableStateInterface {
		// Spread state first, then override with config values to ensure config.pageSize takes precedence
		const state = this._config._state || ({} as KTDataTableStateInterface);
		const result: KTDataTableStateInterface = {
			/**
			 * The current page number.
			 */
			page: 1,
			/**
			 * The field that the data is sorted by.
			 */
			sortField: null,
			/**
			 * The sort order (ascending or descending).
			 */
			sortOrder: '' as KTDataTableSortOrderInterface,
			filters: [],

			/**
			 * Any additional state that may have been stored in the config.
			 */
			...state,
			// Ensure config.pageSize overrides any pageSize from _state (must come after spread)
			pageSize: this._config.pageSize,
		};
		return result;
	}

	/**
	 * Sorts the data in the table by the specified field.
	 * @param field The field to sort by.
	 */
	public sort(field: keyof T | number): void {
		// Use the sort handler to update state and trigger sorting
		const state = this.getState();
		const sortOrder = this._sortHandler.toggleSortOrder(
			state.sortField,
			state.sortOrder,
			field,
		);
		this._sortHandler.setSortIcon(field as keyof T, sortOrder);
		this._config._state.sortField = field as never;
		this._config._state.sortOrder = sortOrder;
		this._fireEvent('sort', { field, order: sortOrder });
		this._dispatchEvent('sort', { field, order: sortOrder });
		this._updateData();
	}

	/**
	 * Navigates to the specified page in the data table.
	 * @param page The page number to navigate to.
	 */
	public goPage(page: number): void {
		if (page < 1 || !Number.isInteger(page)) {
			return;
		}

		// Navigate to the specified page
		this._paginateData(page);
	}

	/**
	 * Set the page size of the data table.
	 * @param pageSize The new page size.
	 */
	public setPageSize(pageSize: number): void {
		if (!Number.isInteger(pageSize)) {
			return;
		}

		/**
		 * Reload the page size of the data table.
		 * @param pageSize The new page size.
		 */
		this._reloadPageSize(pageSize);
	}

	/**
	 * Reloads the data from the server and updates the table.
	 * Triggers the 'reload' event and the 'kt.datatable.reload' custom event.
	 */
	public reload(): void {
		this._fireEvent('reload');
		this._dispatchEvent('reload');

		// Fetch the data from the server using the current sort and filter settings
		this._updateData();
	}

	public redraw(page: number = 1): void {
		this._fireEvent('redraw');
		this._dispatchEvent('redraw');

		this._paginateData(page);
	}

	/**
	 * Show the loading spinner of the data table.
	 */
	public showSpinner(): void {
		/**
		 * Show the loading spinner of the data table.
		 */
		this._showSpinner();
	}

	/**
	 * Hide the loading spinner of the data table.
	 */
	public hideSpinner(): void {
		/**
		 * Hide the loading spinner of the data table.
		 */
		this._hideSpinner();
	}

	/**
	 * Filter data using the specified filter object.
	 * Replaces the existing filter object for the column with the new one.
	 * @param filter Filter object containing the column name and its value.
	 * @returns The KTDataTable instance.
	 * @throws Error if the filter object is null or undefined.
	 */
	public setFilter(filter: KTDataTableColumnFilterInterface): KTDataTable<T> {
		this._config._state.filters = [
			...(this.getState().filters || []).filter(
				(f) => f.column !== filter.column,
			),
			filter,
		];
		this._config._state.page = 1;
		return this;
	}

	public override dispose(): void {
		// Idempotent: can be called multiple times safely
		if (this._disposed) return;

		// Cancel any pending async operations
		if (this._abortController) {
			this._abortController.abort();
			this._abortController = null;
		}

		// Reset fetching flag
		this._isFetching = false;

		// Call private dispose to clean up event listeners and DOM
		this._dispose();

		// Clear references
		this._checkbox = null;
		this._sortHandler = null;
		this._tableElement = null;
		this._tbodyElement = null;
		this._theadElement = null;
		this._infoElement = null;
		this._sizeElement = null;
		this._paginationElement = null;
		this._data = [];

		// Remove from static instances map
		if (KTDataTable._instances) {
			KTDataTable._instances.delete(this._element);
		}

		// Call parent dispose to clean up base class resources
		super.dispose();
	}

	public search(query: string | object): void {
		this._config._state.search = query;
		this._config._state.page = 1;
		// Save state immediately after resetting page to prevent state restore from overriding the reset
		if (this._config.stateSave) {
			this._saveState();
		}
		this.reload();
	}

	/**
	 * Static variables
	 */
	private static _instances = new Map<
		HTMLElement,
		KTDataTable<KTDataTableDataInterface>
	>();

	/**
	 * Global default configuration that applies to all new DataTable instances
	 */
	private static _globalConfig: Partial<KTDataTableConfigInterface> = {};

	/**
	 * Create KTDataTable instances for all elements with a data-kt-datatable="true" attribute.
	 * This function is now browser-guarded and must be called explicitly.
	 */
	public static createInstances(): void {
		if (typeof document === 'undefined') return;
		const elements = document.querySelectorAll<HTMLElement>(
			'[data-kt-datatable="true"]',
		);

		elements.forEach((element) => {
			if (
				element.hasAttribute('data-kt-datatable') &&
				!element.classList.contains('datatable-initialized')
			) {
				/**
				 * Create an instance of KTDataTable for the given element
				 * @param element The element to create an instance for
				 */
				const instance = new KTDataTable(element);
				this._instances.set(element, instance);
			}
		});
	}

	/**
	 * Get the KTDataTable instance for a given element.
	 *
	 * @param element The element to retrieve the instance for
	 * @returns The KTDataTable instance or undefined if not found
	 */
	public static getInstance(
		element: HTMLElement,
	): KTDataTable<KTDataTableDataInterface> | undefined {
		return this._instances.get(element);
	}

	/**
	 * Re-initialize a KTDataTable component on an element.
	 * If an active instance exists, it is returned. If a disposed instance exists, it is cleaned up and a new instance is created.
	 * @param element The HTML element to initialize the component on
	 * @param config Optional configuration to use for the new instance
	 * @returns The KTDataTable instance
	 * @example
	 * const table = KTDataTable.reinit(element);
	 * const tableWithConfig = KTDataTable.reinit(element, { apiEndpoint: '/api/data' });
	 */
	public static reinit<T extends KTDataTableDataInterface>(
		element: HTMLElement,
		config?: KTDataTableConfigInterface,
	): KTDataTable<T> {
		const existing = KTData.get(element, 'datatable') as
			| KTDataTable<T>
			| undefined;
		if (existing && !existing._disposed) {
			// Return existing active instance (idempotent)
			return existing;
		}
		if (existing && existing._disposed) {
			// Clean up disposed instance
			existing.dispose();
		}
		// Create new instance
		const instance = new KTDataTable<T>(element, config);
		this._instances.set(element, instance as any);
		return instance;
	}

	/**
	 * Set global default configuration that applies to all new DataTable instances.
	 * Global config merges with instance-specific config, with instance config taking precedence.
	 * Subsequent calls to setGlobalConfig merge with existing global config.
	 *
	 * @param config Partial configuration object to set as global defaults
	 * @example
	 * KTDataTable.setGlobalConfig({ pageSize: 20, pageSizes: [10, 20, 50] });
	 * const table = new KTDataTable(element); // Uses pageSize: 20
	 * const table2 = new KTDataTable(element2, { pageSize: 10 }); // Uses pageSize: 10 (overrides global)
	 */
	public static setGlobalConfig(
		config: Partial<KTDataTableConfigInterface>,
	): void {
		// Deep merge global config with new config
		KTDataTable._globalConfig = this._deepMerge(
			KTDataTable._globalConfig,
			config,
		);
	}

	/**
	 * Deep merge utility for configuration objects
	 * @param target Target object to merge into
	 * @param source Source object to merge from
	 * @returns Merged object
	 */
	private static _deepMerge(
		target: Partial<KTDataTableConfigInterface>,
		source: Partial<KTDataTableConfigInterface>,
	): Partial<KTDataTableConfigInterface> {
		const result: any = { ...target };

		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				const sourceValue = (source as any)[key];
				const targetValue = result[key];

				if (
					this._isPlainObject(sourceValue) &&
					this._isPlainObject(targetValue)
				) {
					// Recursively merge nested objects
					result[key] = this._deepMerge(
						targetValue as Partial<KTDataTableConfigInterface>,
						sourceValue as Partial<KTDataTableConfigInterface>,
					);
				} else {
					// Overwrite with source value
					result[key] = sourceValue;
				}
			}
		}

		return result as Partial<KTDataTableConfigInterface>;
	}

	/**
	 * Check if value is a plain object (not array, null, etc.)
	 * @param value Value to check
	 * @returns True if value is a plain object
	 */
	private static _isPlainObject(value: any): boolean {
		return (
			value !== null &&
			typeof value === 'object' &&
			!Array.isArray(value) &&
			Object.prototype.toString.call(value) === '[object Object]'
		);
	}

	/**
	 * Initializes all KTDataTable instances on the page.
	 * This function is now browser-guarded and must be called explicitly.
	 */
	public static init(): void {
		if (typeof document === 'undefined') return;
		// Create instances of KTDataTable for all elements with a
		// data-kt-datatable="true" attribute
		KTDataTable.createInstances();
	}

	/**
	 * Check if all visible rows are checked (header checkbox state)
	 * @returns {boolean}
	 */
	public isChecked(): boolean {
		return this._checkbox.isChecked();
	}

	/**
	 * Toggle all visible row checkboxes (header checkbox)
	 * @returns {void}
	 */
	public toggle(): void {
		this._checkbox.toggle();
	}

	/**
	 * Check all visible row checkboxes
	 * @returns {void}
	 */
	public check(): void {
		this._checkbox.check();
		this._fireEvent('checked');
		this._dispatchEvent('checked');
	}

	/**
	 * Uncheck all visible row checkboxes
	 * @returns {void}
	 */
	public uncheck(): void {
		this._checkbox.uncheck();
		this._fireEvent('unchecked');
		this._dispatchEvent('unchecked');
	}

	/**
	 * Get all checked row IDs (across all pages if preserveSelection is true)
	 * @returns {string[]}
	 */
	public getChecked(): string[] {
		return this._checkbox.getChecked();
	}

	/**
	 * Reapply checked state to visible checkboxes (after redraw/pagination)
	 * @returns {void}
	 */
	public update(): void {
		this._checkbox.updateState();
	}

	// Other plugin methods can be added here
}

/**
 * NOTE: This module is now PURE. No side effects or DOM/global assignments occur on import.
 * To auto-initialize all datatables on the page, call the exported `initAllDataTables()` function explicitly in the browser.
 */

export function initAllDataTables(): void {
	if (typeof document !== 'undefined') {
		KTDataTable.createInstances();
		// Optionally assign to window for legacy support
		window.KTDataTable = KTDataTable;
	}
}
