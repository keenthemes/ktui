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
	KTDataTableLayoutPluginContextInterface,
	KTDataTableLayoutPluginInterface,
} from './types';
import { KTOptionType } from '../../types';
import KTComponents from '../../index';
import KTData from '../../helpers/data';
import {
	createCheckboxHandler,
	KTDataTableCheckboxAPI,
} from './datatable-checkbox';
import { createSortHandler, KTDataTableSortAPI } from './datatable-sort';
import { createStickyLayoutPlugin } from './datatable-layout-plugin';
import { DATATABLE_DEFAULTS } from './datatable-defaults';
import { getLogicalColumnCount } from './datatable-column-utils';
import {
	KTDataTableCleanup,
	KTDataTableEventAdapter,
	KTDataTablePaginationRenderer,
	KTDataTableStateStore,
	KTDataTableTableRenderer,
} from './datatable-contracts';
import { createDataTableEventAdapter } from './datatable-event-adapter';
import { KTDataTableLocalDataProvider } from './datatable-local-provider';
import { KTDataTableRemoteDataProvider } from './datatable-remote-provider';
import { KTDataTableConfigStateStore } from './datatable-state-store';
import { KTDataTableDomPaginationRenderer } from './datatable-pagination-renderer';
import { KTDataTableDomTableRenderer } from './datatable-table-renderer';
import KTUtils from '../../helpers/utils';
import { createSearchHandler } from './datatable-search-handler';
import {
	createStatePersistence,
	resolveTableNamespace,
} from './datatable-state-persistence';
import { createSpinner } from './datatable-spinner';
import { createDataTableRegistry } from './datatable-registry';

/**
 * Custom DataTable plugin class with server-side API, pagination, and sorting
 * @classdesc A custom KTComponent class that integrates server-side API, pagination, and sorting functionality into a table.
 * It supports fetching data from a server-side API, pagination, and sorting of the fetched data.
 * @class
 * @extends {KTComponent}
 * @param {HTMLElement} element The table element
 * @param {KTDataTableConfigInterface} [config] Additional configuration options
 */
const datatableRegistry = createDataTableRegistry<
	KTDataTable<KTDataTableDataInterface>
>();

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

	private _infoElement: HTMLElement | null = null;
	private _sizeElement: HTMLSelectElement | null = null;
	private _paginationElement: HTMLElement | null = null;

	private _checkbox: KTDataTableCheckboxAPI;
	private _sortHandler: KTDataTableSortAPI<T>;
	private _layoutPlugin: KTDataTableLayoutPluginInterface | null = null;
	private _eventAdapter: KTDataTableEventAdapter;
	private _stateStore: KTDataTableStateStore;
	private _localProvider: KTDataTableLocalDataProvider<T>;
	private _remoteProvider: KTDataTableRemoteDataProvider<T>;
	private _tableRenderer: KTDataTableTableRenderer<T>;
	private _paginationRenderer: KTDataTablePaginationRenderer;
	private _cleanupCallbacks: KTDataTableCleanup[] = [];

	private _searchHandler = createSearchHandler();
	private _statePersistence = createStatePersistence();
	private _spinner = createSpinner();

	private _data: T[] = [];
	private _isFetching: boolean = false;

	constructor(element: HTMLElement, config?: KTDataTableConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) {
			// Already initialized (e.g. by createInstances). Merge demo config and redraw once.
			const existing = KTDataTable.getInstance(element as HTMLElement);
			if (existing && config) {
				existing._applyRuntimeConfig(config);
			}
			return;
		}

		this._defaultConfig = this._initDefaultConfig(config);

		this._init(element);
		if (!this._element) {
			return;
		}
		if (!this._element.hasAttribute('data-kt-datatable')) {
			this._element.setAttribute('data-kt-datatable', 'true');
		}
		this._buildConfig();
		this._normalizePageSizeConfig();
		this._stateStore = new KTDataTableConfigStateStore(this._config);
		this._eventAdapter = createDataTableEventAdapter(
			this._fireEvent.bind(this),
			this._dispatchEvent.bind(this),
		);

		// Store the instance directly on the element
		datatableRegistry.register(element, this);

		this._initElements();
		this._layoutPlugin = this._createLayoutPlugin();
		this._tableRenderer = new KTDataTableDomTableRenderer<T>();
		this._paginationRenderer = new KTDataTableDomPaginationRenderer();
		this._initDataProviders();

		// Initialize checkbox handler
		this._checkbox = createCheckboxHandler(
			this._element,
			this._config,
			this._emit.bind(this),
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
				this._stateStore.setSort(field as never, order);
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
			this._normalizePageState();
		}

		this._updateData();

		this._emit('init');
	}

	private _emit(eventName: string, eventData?: object): void {
		this._eventAdapter.emit(eventName, eventData);
	}

	private _initDataProviders(): void {
		this._localProvider = new KTDataTableLocalDataProvider<T>({
			config: this._config,
			elements: () => ({
				tableElement: this._tableElement,
				tbodyElement: this._tbodyElement,
				theadElement: this._theadElement,
			}),
			getLogicalColumnCount: this._getLogicalColumnCount.bind(this),
			storeOriginalClasses: this._storeOriginalClasses.bind(this),
			stateStore: this._stateStore,
		});

		this._remoteProvider = new KTDataTableRemoteDataProvider<T>({
			config: this._config,
			createUrl: this._createUrl.bind(this),
			eventAdapter: this._eventAdapter,
			noticeOnTable: this._noticeOnTable.bind(this),
			stateStore: this._stateStore,
		});
	}

	private _createLayoutPlugin(): KTDataTableLayoutPluginInterface | null {
		if (this._config.layoutPlugin) {
			return this._config.layoutPlugin;
		}

		if (this._config.lockedLayout) {
			return createStickyLayoutPlugin();
		}

		return null;
	}

	/**
	 * Apply config from a late constructor call (e.g. docs demo script after auto-init).
	 */
	private _applyRuntimeConfig(config: KTDataTableConfigInterface): void {
		this._mergeConfig(config);
		this._normalizePageSizeConfig();
		this._layoutPlugin = this._createLayoutPlugin();
		this.reload();
	}

	private _normalizePageSizeConfig(): void {
		const configuredPageSizes = Array.isArray(this._config.pageSizes)
			? this._config.pageSizes
			: [];
		const pageSizes = configuredPageSizes
			.map((size) => Number(size))
			.filter((size) => Number.isFinite(size) && size > 0)
			.map((size) => Math.floor(size));
		const fallbackPageSizes = [5, 10, 20, 30, 50];
		this._config.pageSizes =
			pageSizes.length > 0 ? Array.from(new Set(pageSizes)) : fallbackPageSizes;

		const configuredPageSize = Number(this._config.pageSize);
		this._config.pageSize =
			Number.isFinite(configuredPageSize) && configuredPageSize > 0
				? Math.floor(configuredPageSize)
				: this._config.pageSizes[0];
	}

	private _normalizePageState(): void {
		const statePageSize = Number(this._config._state.pageSize);
		this._config._state.pageSize =
			Number.isFinite(statePageSize) && statePageSize > 0
				? Math.floor(statePageSize)
				: this._config.pageSize;

		const statePage = Number(this._config._state.page);
		this._config._state.page =
			Number.isFinite(statePage) && statePage > 0 ? Math.floor(statePage) : 1;
	}

	private _getLayoutPluginContext(): KTDataTableLayoutPluginContextInterface {
		return {
			rootElement: this._element,
			tableElement: this._tableElement,
			theadElement: this._theadElement,
			tbodyElement: this._tbodyElement,
			config: this._config,
		};
	}

	/**
	 * Initialize default configuration for the datatable
	 * @param config User-provided configuration options
	 * @returns Default configuration merged with user-provided options
	 */
	private _initDefaultConfig(
		config?: KTDataTableConfigInterface,
	): KTDataTableConfigInterface {
		return {
			...DATATABLE_DEFAULTS,
			sort: {
				...DATATABLE_DEFAULTS.sort,
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
				...DATATABLE_DEFAULTS.search,
				callback: (data: T[], search: string): T[] => {
					if (!data || !search) {
						return [];
					}
					return data.filter((item: T) => {
						if (!item) {
							return false;
						}
						return Object.values(item).some((value: KTOptionType) => {
							if (
								typeof value !== 'string' &&
								typeof value !== 'number' &&
								typeof value !== 'boolean'
							) {
								return false;
							}
							const valueText = String(value)
								.replace(/<|>|&nbsp;/g, '')
								.toLowerCase();
							return valueText.includes(search.toLowerCase());
						});
					});
				},
			},
			...config,
		} as KTDataTableConfigInterface;
	}

	/**
	 * Initialize table, tbody, thead, info, size, and pagination elements
	 * @returns {void}
	 */
	private _initElements(): void {
		const root = this._element;
		const attrs = this._config.attributes;
		if (!root || !attrs?.table) {
			throw new Error(
				'KTDataTable: root element and table selector are required',
			);
		}

		const tableEl = root.querySelector<HTMLTableElement>(attrs.table);
		if (!tableEl) {
			throw new Error(`KTDataTable: table element not found (${attrs.table})`);
		}
		this._tableElement = tableEl;

		this._tbodyElement =
			this._tableElement.tBodies[0] || this._tableElement.createTBody();

		this._theadElement =
			this._tableElement.tHead ?? this._tableElement.createTHead();

		this._storeOriginalClasses();

		this._infoElement = attrs.info
			? root.querySelector<HTMLElement>(attrs.info)
			: null;
		this._sizeElement = attrs.size
			? root.querySelector<HTMLSelectElement>(attrs.size)
			: null;
		this._paginationElement = attrs.pagination
			? root.querySelector<HTMLElement>(attrs.pagination)
			: null;
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
		if (this._isFetching) return; // Prevent duplicate fetches
		this._isFetching = true;
		try {
			this._spinner.show(this._element, this._config, this._tableElement); // Show spinner before fetching data

			this._emit('fetch');
			const result =
				typeof this._config.apiEndpoint === 'undefined'
					? this._localProvider.fetchSync()
					: await this._remoteProvider.fetch();

			if (!result.skipped) {
				this._data = result.data;
				this._stateStore.patchState({ totalItems: result.totalItems });
				await this._draw();
				this._emit('fetched');
			}

			await this._finalize();
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
		this._element?.classList.add('datatable-initialized');

		// Initialize checkbox logic
		this._checkbox.init();

		// Re-initialize sort handler to restore click listeners after table redraw
		if (this._sortHandler) {
			this._sortHandler.initSort();
		}

		this._searchHandler.attach(
			this._tableId(),
			this.getState().search,
			this._config.search?.delay ?? 500,
			(query) => this.search(query),
		);

		if (typeof KTComponents !== 'undefined') {
			KTComponents.init();
		}

		/**
		 * Hide spinner
		 */
		this._spinner.hide(this._element, this._config);
	}

	/**
	 * Returns the logical data column count (number of data columns), used for multi-row headers
	 * where querySelectorAll('th') would overcount. Prefers state.originalData, then first tbody row td count.
	 * @returns {number} Number of data columns, or 0 if unknown
	 */
	private _getLogicalColumnCount(): number {
		return getLogicalColumnCount(
			this._theadElement,
			this._tbodyElement,
			this.getState().originalData as Array<Record<string, unknown>> | undefined,
		);
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
		baseUrl: string | null = typeof window !== 'undefined'
			? window.location.origin
			: null,
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

		// Opaque origins (e.g. srcdoc iframes) serialize as the string "null", which is not a valid URL base.
		const bases: string[] = [];
		if (baseUrl && baseUrl !== 'null') {
			bases.push(baseUrl);
		}
		if (typeof window !== 'undefined') {
			const href = window.location.href;
			if (href && !bases.includes(href)) {
				bases.push(href);
			}
			try {
				if (window.parent !== window && window.parent.location?.href) {
					const parentHref = window.parent.location.href;
					if (parentHref && !bases.includes(parentHref)) {
						bases.push(parentHref);
					}
				}
			} catch {
				// parent is cross-origin
			}
		}

		for (const base of bases) {
			try {
				return new URL(normalizedPath, base);
			} catch {
				// try next base
			}
		}

		throw new Error(
			`KTDataTable: cannot resolve relative apiEndpoint "${pathOrUrl}" (no valid base URL; use an absolute apiEndpoint).`,
		);
	}

	/**
	 * Update the table and pagination controls with new data
	 * @returns {Promise<void>} A promise that resolves when the table and pagination controls are updated
	 */
	private async _draw(): Promise<void> {
		const normalizedPageSize = Math.max(
			1,
			Number(this.getState().pageSize) || Number(this._config.pageSize) || 1,
		);
		const totalPages =
			Math.ceil(this.getState().totalItems / normalizedPageSize) || 0;
		const page =
			totalPages > 0
				? Math.min(Math.max(1, this.getState().page), totalPages)
				: 1;

		this._stateStore.patchState({ totalPages, page });

		this._layoutPlugin?.beforeDraw?.(this._getLayoutPluginContext());
		this._emit('draw');

		this._dispose();

		// Update the table and pagination controls
		if (this._theadElement && this._tbodyElement) {
			this._updateTable();
		}

		if (this._infoElement || this._sizeElement || this._paginationElement) {
			this._updatePagination();
		}

		this._layoutPlugin?.afterDraw?.(this._getLayoutPluginContext());
		if (!this._config.apiEndpoint) {
			this._stateStore.patchState({
				_contentChecksum: KTUtils.checksum(
					JSON.stringify(this._tbodyElement.innerHTML),
				),
			});
		}

		this._emit('drew');

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
		this._tbodyElement = this._tableRenderer.render({
			config: this._config,
			context: this,
			data: this._data,
			getLogicalColumnCount: this._getLogicalColumnCount.bind(this),
			getState: this.getState.bind(this),
			originalTbodyClass: this._originalTbodyClass,
			originalTrClasses: this._originalTrClasses,
			originalTdClasses: this._originalTdClasses,
			tableElement: this._tableElement,
			theadElement: this._theadElement,
		});
		return this._tbodyElement;
	}

	/**
	 * Show a notice on the table
	 * @param message The message to show. If empty, the message will be removed
	 * @returns {void}
	 */
	private _noticeOnTable(message: string = ''): void {
		this._tableRenderer.notice(
			this._tableElement,
			this._getLogicalColumnCount.bind(this),
			message,
		);
	}

	private _updatePagination(): void {
		const cleanup = this._paginationRenderer.render({
			config: this._config,
			dataLength: this._data.length,
			infoElement: this._infoElement,
			paginateData: this._paginateData.bind(this),
			paginationElement: this._paginationElement,
			reloadPageSize: this._reloadPageSize.bind(this),
			sizeElement: this._sizeElement,
			state: this.getState(),
		});

		if (typeof cleanup === 'function') {
			this._cleanupCallbacks.push(cleanup);
		}
	}

	/**
	 * Reloads the data with the specified page size and optional page number.
	 * @param pageSize The new page size.
	 * @param page The new page number (optional, defaults to 1).
	 */
	private _reloadPageSize(pageSize: number, page: number = 1): void {
		// Update the page size and page number in the state
		this._stateStore.setPageSize(pageSize, page);

		// Update the data with the new page size and page number
		this._updateData();
	}

	/**
	 * Method for handling pagination
	 * @param page - The page number to navigate to
	 */
	private _paginateData(page: number): void {
		if (page < 1 || !Number.isInteger(page)) {
			return;
		}

		this._emit('pagination', { page: page });

		if (page >= 1 && page <= this.getState().totalPages) {
			this._stateStore.setPage(page);
			this._updateData();
		}
	}

	/**
	 * Saves the current state of the table to local storage.
	 * @returns {void}
	 */
	private _saveState(): void {
		this._emit('stateSave');
		this._statePersistence.save(
			resolveTableNamespace(
				this._config,
				this._tableElement,
				this._element,
				this._name,
			),
			this.getState() as KTDataTableStateInterface,
		);
	}

	/**
	 * Loads the saved state of the table from local storage, if it exists.
	 * @returns {Object} The saved state of the table, or null if no saved state exists.
	 */
	private _loadState(): KTDataTableStateInterface | null {
		const ns = resolveTableNamespace(
			this._config,
			this._tableElement,
			this._element,
			this._name,
		);
		const saved = this._statePersistence.load(ns);
		if (saved) this._stateStore.replaceState(saved);
		return saved;
	}

	private _deleteState(): void {
		this._statePersistence.remove(
			resolveTableNamespace(
				this._config,
				this._tableElement,
				this._element,
				this._name,
			),
		);
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
		return resolveTableNamespace(
			this._config,
			this._tableElement,
			this._element,
			this._name,
		);
	}

	private _tableId(): string {
		const tableIdAttr = this._tableElement?.getAttribute('id');
		if (tableIdAttr) {
			return tableIdAttr;
		}
		const rootIdAttr = this._element?.getAttribute('id');
		if (rootIdAttr) {
			return rootIdAttr;
		}
		return '';
	}

	/**
	 * Clean up all event listeners, handlers, and DOM nodes created by this instance.
	 * This method is called before re-rendering or when disposing the component.
	 */
	private _dispose() {
		this._layoutPlugin?.dispose?.(this._getLayoutPluginContext());

		const root = this._element;
		if (!root) {
			return;
		}

		this._cleanupCallbacks.forEach((cleanup) => cleanup());
		this._cleanupCallbacks = [];

		// --- 1. Remove search input event listener (debounced) ---
		this._searchHandler.detach(this._tableId());

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
		this._checkbox.dispose();
		this._sortHandler.dispose();

		// --- 5. Remove spinner DOM node if it exists ---
		this._spinner.remove(this._element, this._config);

		// --- 6. Remove instance reference from the DOM element ---
		datatableRegistry.remove(root);

		KTData.remove(root, this._name);

		// --- 7. (Optional) Clear localStorage state ---
		// Uncomment the following line if you want to clear state on dispose:
		// this._deleteState();
	}

	/**
	 * Gets the current state of the table.
	 * @returns {KTDataTableStateInterface} The current state of the table.
	 */
	public getState(): KTDataTableStateInterface {
		return this._stateStore.getState();
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
		this._stateStore.setSort(field as never, sortOrder);
		this._emit('sort', { field, order: sortOrder });
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
		this._emit('reload');

		// Fetch the data from the server using the current sort and filter settings
		this._updateData();
	}

	public redraw(page: number = 1): void {
		this._emit('redraw');

		this._paginateData(page);
	}

	/**
	 * Show the loading spinner of the data table.
	 */
	public showSpinner(): void {
		this._spinner.show(this._element, this._config, this._tableElement);
	}

	/**
	 * Hide the loading spinner of the data table.
	 */
	public hideSpinner(): void {
		this._spinner.hide(this._element, this._config);
	}

	/**
	 * Filter data using the specified filter object.
	 * Replaces the existing filter object for the column with the new one.
	 * @param filter Filter object containing the column name and its value.
	 * @returns The KTDataTable instance.
	 * @throws Error if the filter object is null or undefined.
	 */
	public setFilter(filter: KTDataTableColumnFilterInterface): KTDataTable<T> {
		this._stateStore.setFilter(filter);
		return this;
	}

	public override dispose(): void {
		this._remoteProvider?.dispose();
		this._dispose();
	}

	public search(query: string | object): void {
		this._stateStore.setSearch(query);
		this.reload();
	}

	/**
	 * Create KTDataTable instances for all elements with a data-kt-datatable="true" attribute.
	 * This function is now browser-guarded and must be called explicitly.
	 */
	public static createInstances(): void {
		datatableRegistry.createAll((el) => new KTDataTable(el));
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
		return datatableRegistry.get(element);
	}

	/**
	 * Initializes all KTDataTable instances on the page.
	 * This function is now browser-guarded and must be called explicitly.
	 */
	public static init(): void {
		KTDataTable.createInstances();
	}

	/**
	 * Force reinitialization of datatables by clearing existing instances.
	 * Useful for Livewire wire:navigate where the DOM is replaced and new tables need to be initialized.
	 */
	public static reinit(): void {
		datatableRegistry.reinit((el) => new KTDataTable(el));
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
		this._emit('checked');
	}

	/**
	 * Uncheck all visible row checkboxes
	 * @returns {void}
	 */
	public uncheck(): void {
		this._checkbox.uncheck();
		this._emit('unchecked');
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
