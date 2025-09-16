/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTDataTableDataInterface, KTDataTableInterface, KTDataTableConfigInterface as KTDataTableConfigInterface, KTDataTableStateInterface, KTDataTableColumnFilterInterface } from './types';
/**
 * Custom DataTable plugin class with server-side API, pagination, and sorting
 * @classdesc A custom KTComponent class that integrates server-side API, pagination, and sorting functionality into a table.
 * It supports fetching data from a server-side API, pagination, and sorting of the fetched data.
 * @class
 * @extends {KTComponent}
 * @param {HTMLElement} element The table element
 * @param {KTDataTableConfigInterface} [config] Additional configuration options
 */
export declare class KTDataTable<T extends KTDataTableDataInterface> extends KTComponent implements KTDataTableInterface {
    protected _name: string;
    protected _config: KTDataTableConfigInterface;
    protected _defaultConfig: KTDataTableConfigInterface;
    private _tableElement;
    private _tbodyElement;
    private _theadElement;
    private _originalTbodyClass;
    private _originalTrClasses;
    private _originalTheadClass;
    private _originalTdClasses;
    private _originalThClasses;
    private _infoElement;
    private _sizeElement;
    private _paginationElement;
    private _checkbox;
    private _sortHandler;
    private _data;
    private _isFetching;
    constructor(element: HTMLElement, config?: KTDataTableConfigInterface);
    /**
     * Initialize default configuration for the datatable
     * @param config User-provided configuration options
     * @returns Default configuration merged with user-provided options
     */
    private _initDefaultConfig;
    /**
     * Initialize table, tbody, thead, info, size, and pagination elements
     * @returns {void}
     */
    private _initElements;
    /**
     * Store original classes from table elements
     * @returns {void}
     */
    private _storeOriginalClasses;
    /**
     * Fetch data from the server or from the DOM if `apiEndpoint` is not defined.
     * @returns {Promise<void>} Promise which is resolved after data has been fetched and checkbox plugin initialized.
     */
    private _updateData;
    /**
     * Finalize data table after data has been fetched
     * @returns {void}
     */
    private _finalize;
    /**
     * Attach search event to the search input element
     * @returns {void}
     */
    private _attachSearchEvent;
    /**
     * Fetch data from the DOM
     * Fetch data from the table element and save it to the `originalData` state property.
     * This method is used when the data is not fetched from the server via an API endpoint.
     */
    private _fetchDataFromLocal;
    /**
     * Checks if the table content has been invalidated by comparing the current checksum of the table body
     * with the stored checksum in the state. If the checksums are different, the state is updated with the
     * new checksum and `true` is returned. Otherwise, `false` is returned.
     *
     * @returns {boolean} `true` if the table content has been invalidated, `false` otherwise.
     */
    private _localTableContentInvalidate;
    private _tableConfigInvalidate;
    /**
     * Extract the table content and returns it as an object containing an array of original data and an array of original data attributes.
     *
     * @returns {{originalData: T[], originalDataAttributes: KTDataTableAttributeInterface[]}} - An object containing an array of original data and an array of original data attributes.
     */
    private _localExtractTableContent;
    /**
     * Check if the table header is invalidated
     * @returns {boolean} - Returns true if the table header is invalidated, false otherwise
     */
    private _localTableHeaderInvalidate;
    /**
     * Fetch data from the server
     */
    private _fetchDataFromServer;
    /**
     * Get the query params for a fetch request
     * @returns The query params for the fetch request
     */
    private _getQueryParamsForFetchRequest;
    private _performFetchRequest;
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
    private _createUrl;
    /**
     * Update the table and pagination controls with new data
     * @returns {Promise<void>} A promise that resolves when the table and pagination controls are updated
     */
    private _draw;
    /**
     * Update the HTML table with new data
     * @returns {HTMLTableSectionElement} The new table body element
     */
    private _updateTable;
    /**
     * Update the table content
     * @param tbodyElement The table body element
     * @returns {HTMLTableSectionElement} The updated table body element
     */
    private _updateTableContent;
    /**
     * Show a notice on the table
     * @param message The message to show. If empty, the message will be removed
     * @returns {void}
     */
    private _noticeOnTable;
    private _updatePagination;
    /**
     * Removes all child elements from the given container element.
     * @param container The container element to remove the child elements from.
     */
    private _removeChildElements;
    /**
     * Creates a container element for the items per page selector.
     * @param _sizeElement The element to create the page size controls in.
     * @returns The container element.
     */
    private _createPageSizeControls;
    /**
     * Reloads the data with the specified page size and optional page number.
     * @param pageSize The new page size.
     * @param page The new page number (optional, defaults to 1).
     */
    private _reloadPageSize;
    /**
     * Creates the pagination controls for the component.
     * @param _infoElement The element to set the info text in.
     * @param _paginationElement The element to create the pagination controls in.
     * @return {HTMLElement} The element containing the pagination controls.
     */
    private _createPaginationControls;
    /**
     * Sets the info text for the pagination controls.
     * @param _infoElement The element to set the info text in.
     */
    private _setPaginationInfoText;
    /**
     * Creates the container element for the pagination controls.
     * @param _paginationElement The element to create the pagination controls in.
     * @return {HTMLElement} The container element.
     */
    private _createPaginationContainer;
    /**
     * Creates the pagination buttons for the component.
     * @param paginationContainer The container element for the pagination controls.
     */
    private _createPaginationButtons;
    private _calculatePageRange;
    /**
     * Method for handling pagination
     * @param page - The page number to navigate to
     */
    private _paginateData;
    private _showSpinner;
    private _hideSpinner;
    private _createSpinner;
    /**
     * Saves the current state of the table to local storage.
     * @returns {void}
     */
    private _saveState;
    /**
     * Loads the saved state of the table from local storage, if it exists.
     * @returns {Object} The saved state of the table, or null if no saved state exists.
     */
    private _loadState;
    private _deleteState;
    /**
     * Gets the namespace for the table's state.
     * If a namespace is specified in the config, it is used.
     * Otherwise, if the table element has an ID, it is used.
     * Otherwise, if the component element has an ID, it is used.
     * Finally, the component's UID is used.
     * @returns {string} The namespace for the table's state.
     */
    private _tableNamespace;
    private _tableId;
    /**
     * Clean up all event listeners, handlers, and DOM nodes created by this instance.
     * This method is called before re-rendering or when disposing the component.
     */
    private _dispose;
    private _debounce;
    /**
     * Gets the current state of the table.
     * @returns {KTDataTableStateInterface} The current state of the table.
     */
    getState(): KTDataTableStateInterface;
    /**
     * Sorts the data in the table by the specified field.
     * @param field The field to sort by.
     */
    sort(field: keyof T | number): void;
    /**
     * Navigates to the specified page in the data table.
     * @param page The page number to navigate to.
     */
    goPage(page: number): void;
    /**
     * Set the page size of the data table.
     * @param pageSize The new page size.
     */
    setPageSize(pageSize: number): void;
    /**
     * Reloads the data from the server and updates the table.
     * Triggers the 'reload' event and the 'kt.datatable.reload' custom event.
     */
    reload(): void;
    redraw(page?: number): void;
    /**
     * Show the loading spinner of the data table.
     */
    showSpinner(): void;
    /**
     * Hide the loading spinner of the data table.
     */
    hideSpinner(): void;
    /**
     * Filter data using the specified filter object.
     * Replaces the existing filter object for the column with the new one.
     * @param filter Filter object containing the column name and its value.
     * @returns The KTDataTable instance.
     * @throws Error if the filter object is null or undefined.
     */
    setFilter(filter: KTDataTableColumnFilterInterface): KTDataTable<T>;
    dispose(): void;
    search(query: string | object): void;
    /**
     * Static variables
     */
    private static _instances;
    /**
     * Create KTDataTable instances for all elements with a data-kt-datatable="true" attribute.
     * This function is now browser-guarded and must be called explicitly.
     */
    static createInstances(): void;
    /**
     * Get the KTDataTable instance for a given element.
     *
     * @param element The element to retrieve the instance for
     * @returns The KTDataTable instance or undefined if not found
     */
    static getInstance(element: HTMLElement): KTDataTable<KTDataTableDataInterface> | undefined;
    /**
     * Initializes all KTDataTable instances on the page.
     * This function is now browser-guarded and must be called explicitly.
     */
    static init(): void;
    /**
     * Check if all visible rows are checked (header checkbox state)
     * @returns {boolean}
     */
    isChecked(): boolean;
    /**
     * Toggle all visible row checkboxes (header checkbox)
     * @returns {void}
     */
    toggle(): void;
    /**
     * Check all visible row checkboxes
     * @returns {void}
     */
    check(): void;
    /**
     * Uncheck all visible row checkboxes
     * @returns {void}
     */
    uncheck(): void;
    /**
     * Get all checked row IDs (across all pages if preserveSelection is true)
     * @returns {string[]}
     */
    getChecked(): string[];
    /**
     * Reapply checked state to visible checkboxes (after redraw/pagination)
     * @returns {void}
     */
    update(): void;
}
/**
 * NOTE: This module is now PURE. No side effects or DOM/global assignments occur on import.
 * To auto-initialize all datatables on the page, call the exported `initAllDataTables()` function explicitly in the browser.
 */
export declare function initAllDataTables(): void;
//# sourceMappingURL=datatable.d.ts.map