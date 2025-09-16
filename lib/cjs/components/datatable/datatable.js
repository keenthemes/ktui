"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTDataTable = void 0;
exports.initAllDataTables = initAllDataTables;
var component_1 = require("../component");
var utils_1 = require("../../helpers/utils");
var index_1 = require("../../index");
var data_1 = require("../../helpers/data");
var datatable_checkbox_1 = require("./datatable-checkbox");
var datatable_sort_1 = require("./datatable-sort");
/**
 * Custom DataTable plugin class with server-side API, pagination, and sorting
 * @classdesc A custom KTComponent class that integrates server-side API, pagination, and sorting functionality into a table.
 * It supports fetching data from a server-side API, pagination, and sorting of the fetched data.
 * @class
 * @extends {KTComponent}
 * @param {HTMLElement} element The table element
 * @param {KTDataTableConfigInterface} [config] Additional configuration options
 */
var KTDataTable = /** @class */ (function (_super) {
    __extends(KTDataTable, _super);
    function KTDataTable(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'datatable';
        _this._originalTbodyClass = ''; // Store original tbody class
        _this._originalTrClasses = []; // Store original tr classes
        _this._originalTheadClass = ''; // Store original thead class
        _this._originalTdClasses = []; // Store original td classes as a 2D array [row][col]
        _this._originalThClasses = []; // Store original th classes
        _this._data = [];
        _this._isFetching = false;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._defaultConfig = _this._initDefaultConfig(config);
        _this._init(element);
        _this._buildConfig();
        // Store the instance directly on the element
        element.instance = _this;
        _this._initElements();
        // Initialize checkbox handler
        _this._checkbox = (0, datatable_checkbox_1.createCheckboxHandler)(_this._element, _this._config, function (eventName, eventData) {
            _this._fireEvent(eventName, eventData);
            _this._dispatchEvent(eventName, eventData);
        });
        // Initialize sort handler
        _this._sortHandler = (0, datatable_sort_1.createSortHandler)(_this._config, _this._theadElement, function () { return ({
            sortField: _this.getState().sortField,
            sortOrder: _this.getState().sortOrder,
        }); }, function (field, order) {
            _this._config._state.sortField = field;
            _this._config._state.sortOrder = order;
        }, _this._fireEvent.bind(_this), _this._dispatchEvent.bind(_this), _this._updateData.bind(_this));
        _this._sortHandler.initSort();
        if (_this._config.stateSave === false) {
            _this._deleteState();
        }
        if (_this._config.stateSave) {
            _this._loadState();
        }
        _this._updateData();
        _this._fireEvent('init');
        _this._dispatchEvent('init');
        return _this;
    }
    /**
     * Initialize default configuration for the datatable
     * @param config User-provided configuration options
     * @returns Default configuration merged with user-provided options
     */
    KTDataTable.prototype._initDefaultConfig = function (config) {
        var _this = this;
        return __assign({ 
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
                    text: "\n\t\t\t\t\t\t<svg class=\"rtl:transform rtl:rotate-180 size-3.5 shrink-0\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n\t\t\t\t\t\t\t<path d=\"M8.86501 16.7882V12.8481H21.1459C21.3724 12.8481 21.5897 12.7581 21.7498 12.5979C21.91 12.4378 22 12.2205 22 11.994C22 11.7675 21.91 11.5503 21.7498 11.3901C21.5897 11.2299 21.3724 11.1399 21.1459 11.1399H8.86501V7.2112C8.86628 7.10375 8.83517 6.9984 8.77573 6.90887C8.7163 6.81934 8.63129 6.74978 8.53177 6.70923C8.43225 6.66869 8.32283 6.65904 8.21775 6.68155C8.11267 6.70405 8.0168 6.75766 7.94262 6.83541L2.15981 11.6182C2.1092 11.668 2.06901 11.7274 2.04157 11.7929C2.01413 11.8584 2 11.9287 2 11.9997C2 12.0707 2.01413 12.141 2.04157 12.2065C2.06901 12.272 2.1092 12.3314 2.15981 12.3812L7.94262 17.164C8.0168 17.2417 8.11267 17.2953 8.21775 17.3178C8.32283 17.3403 8.43225 17.3307 8.53177 17.2902C8.63129 17.2496 8.7163 17.18 8.77573 17.0905C8.83517 17.001 8.86628 16.8956 8.86501 16.7882Z\" fill=\"currentColor\"/>\n\t\t\t\t\t\t</svg>\n\t\t\t\t\t",
                },
                next: {
                    /**
                     * CSS classes to be added to the next pagination button
                     */
                    class: 'kt-datatable-pagination-button kt-datatable-pagination-next',
                    /**
                     * Text to be displayed in the next pagination button
                     */
                    text: "\n\t\t\t\t\t\t<svg class=\"rtl:transform rtl:rotate-180 size-3.5 shrink-0\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n\t\t\t\t\t\t\t<path d=\"M15.135 7.21144V11.1516H2.85407C2.62756 11.1516 2.41032 11.2415 2.25015 11.4017C2.08998 11.5619 2 11.7791 2 12.0056C2 12.2321 2.08998 12.4494 2.25015 12.6096C2.41032 12.7697 2.62756 12.8597 2.85407 12.8597H15.135V16.7884C15.1337 16.8959 15.1648 17.0012 15.2243 17.0908C15.2837 17.1803 15.3687 17.2499 15.4682 17.2904C15.5677 17.3309 15.6772 17.3406 15.7822 17.3181C15.8873 17.2956 15.9832 17.242 16.0574 17.1642L21.8402 12.3814C21.8908 12.3316 21.931 12.2722 21.9584 12.2067C21.9859 12.1412 22 12.0709 22 11.9999C22 11.9289 21.9859 11.8586 21.9584 11.7931C21.931 11.7276 21.8908 11.6683 21.8402 11.6185L16.0574 6.83565C15.9832 6.75791 15.8873 6.70429 15.7822 6.68179C15.6772 6.65929 15.5677 6.66893 15.4682 6.70948C15.3687 6.75002 15.2837 6.81959 15.2243 6.90911C15.1648 6.99864 15.1337 7.10399 15.135 7.21144Z\" fill=\"currentColor\"/>\n\t\t\t\t\t\t</svg>\n\t\t\t\t\t",
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
                callback: function (data, sortField, sortOrder) {
                    return _this._sortHandler
                        ? _this._sortHandler.sortData(data, sortField, sortOrder)
                        : data;
                },
            }, search: {
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
                callback: function (data, search) {
                    if (!data || !search) {
                        return [];
                    }
                    return data.filter(function (item) {
                        if (!item) {
                            return false;
                        }
                        return Object.values(item).some(function (value) {
                            if (typeof value !== 'string' &&
                                typeof value !== 'number' &&
                                typeof value !== 'boolean') {
                                return false;
                            }
                            var valueText = String(value)
                                .replace(/<[^>]*>|&nbsp;/g, '')
                                .toLowerCase();
                            return valueText.includes(search.toLowerCase());
                        });
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
                template: "\n\t\t\t\t\t<div class=\"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2\">\n\t\t\t\t\t\t<div class=\"kt-datatable-loading\">\n\t\t\t\t\t\t\t<svg class=\"animate-spin -ml-1 h-5 w-5 text-gray-600\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">\n\t\t\t\t\t\t\t\t<circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"3\"></circle>\n\t\t\t\t\t\t\t\t<path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t{content}\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t",
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
            stateSave: true, checkbox: {
                checkedClass: 'checked',
            }, 
            /**
             * Private properties
             */
            _state: {}, loadingClass: 'loading' }, config);
    };
    /**
     * Initialize table, tbody, thead, info, size, and pagination elements
     * @returns {void}
     */
    KTDataTable.prototype._initElements = function () {
        /**
         * Data table element
         */
        this._tableElement = this._element.querySelector(this._config.attributes.table);
        /**
         * Table body element
         */
        this._tbodyElement =
            this._tableElement.tBodies[0] || this._tableElement.createTBody();
        /**
         * Table head element
         */
        this._theadElement = this._tableElement.tHead;
        // Store original classes
        this._storeOriginalClasses();
        /**
         * Pagination info element
         */
        this._infoElement = this._element.querySelector(this._config.attributes.info);
        /**
         * Page size dropdown element
         */
        this._sizeElement = this._element.querySelector(this._config.attributes.size);
        /**
         * Pagination element
         */
        this._paginationElement = this._element.querySelector(this._config.attributes.pagination);
    };
    /**
     * Store original classes from table elements
     * @returns {void}
     */
    KTDataTable.prototype._storeOriginalClasses = function () {
        var _this = this;
        // Store tbody class
        if (this._tbodyElement) {
            this._originalTbodyClass = this._tbodyElement.className || '';
        }
        // Store thead class and th classes
        if (this._theadElement) {
            this._originalTheadClass = this._theadElement.className || '';
            // Store th classes
            var thElements = this._theadElement.querySelectorAll('th');
            this._originalThClasses = Array.from(thElements).map(function (th) { return th.className || ''; });
        }
        // Store tr and td classes
        if (this._tbodyElement) {
            var originalRows = this._tbodyElement.querySelectorAll('tr');
            this._originalTrClasses = Array.from(originalRows).map(function (row) { return row.className || ''; });
            // Store td classes as a 2D array
            this._originalTdClasses = [];
            Array.from(originalRows).forEach(function (row, rowIndex) {
                var tdElements = row.querySelectorAll('td');
                _this._originalTdClasses[rowIndex] = Array.from(tdElements).map(function (td) { return td.className || ''; });
            });
        }
    };
    /**
     * Fetch data from the server or from the DOM if `apiEndpoint` is not defined.
     * @returns {Promise<void>} Promise which is resolved after data has been fetched and checkbox plugin initialized.
     */
    KTDataTable.prototype._updateData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._isFetching)
                    return [2 /*return*/]; // Prevent duplicate fetches
                this._isFetching = true;
                try {
                    this._showSpinner(); // Show spinner before fetching data
                    // Fetch data from the DOM and initialize the checkbox plugin
                    return [2 /*return*/, typeof this._config.apiEndpoint === 'undefined'
                            ? this._fetchDataFromLocal().then(this._finalize.bind(this))
                            : this._fetchDataFromServer().then(this._finalize.bind(this))];
                }
                finally {
                    this._isFetching = false;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Finalize data table after data has been fetched
     * @returns {void}
     */
    KTDataTable.prototype._finalize = function () {
        this._element.classList.add('datatable-initialized');
        // Initialize checkbox logic
        this._checkbox.init();
        this._attachSearchEvent();
        if (typeof index_1.default !== 'undefined') {
            index_1.default.init();
        }
        /**
         * Hide spinner
         */
        this._hideSpinner();
    };
    /**
     * Attach search event to the search input element
     * @returns {void}
     */
    KTDataTable.prototype._attachSearchEvent = function () {
        var _this = this;
        var tableId = this._tableId();
        var searchElement = document.querySelector("[data-kt-datatable-search=\"#".concat(tableId, "\"]"));
        // Get search state
        var search = this.getState().search;
        // Set search value
        if (searchElement) {
            searchElement.value =
                search === undefined || search === null ? '' : typeof search === 'string' ? search : String(search);
        }
        if (searchElement) {
            // Check if a debounced search function already exists
            if (searchElement._debouncedSearch) {
                // Remove the existing debounced event listener
                searchElement.removeEventListener('keyup', searchElement._debouncedSearch);
            }
            // Create a new debounced search function
            var debouncedSearch = this._debounce(function () {
                _this.search(searchElement.value);
            }, this._config.search.delay);
            // Store the new debounced function as a property of the element
            searchElement._debouncedSearch = debouncedSearch;
            // Add the new debounced event listener
            searchElement.addEventListener('keyup', debouncedSearch);
        }
    };
    /**
     * Fetch data from the DOM
     * Fetch data from the table element and save it to the `originalData` state property.
     * This method is used when the data is not fetched from the server via an API endpoint.
     */
    KTDataTable.prototype._fetchDataFromLocal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sortField, sortOrder, page, pageSize, search, originalData, _b, originalData_1, originalDataAttributes, _temp, startIndex, endIndex;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this._fireEvent('fetch');
                        this._dispatchEvent('fetch');
                        _a = this.getState(), sortField = _a.sortField, sortOrder = _a.sortOrder, page = _a.page, pageSize = _a.pageSize, search = _a.search;
                        originalData = this.getState().originalData;
                        // If the table element or the original data is not defined, bail
                        if (!this._tableElement ||
                            originalData === undefined ||
                            this._tableConfigInvalidate() ||
                            this._localTableHeaderInvalidate() ||
                            this._localTableContentInvalidate()) {
                            this._deleteState();
                            _b = this._localExtractTableContent(), originalData_1 = _b.originalData, originalDataAttributes = _b.originalDataAttributes;
                            this._config._state.originalData = originalData_1;
                            this._config._state.originalDataAttributes = originalDataAttributes;
                        }
                        // Update the original data variable
                        originalData = this.getState().originalData;
                        _temp = (this._data = __spreadArray([], originalData, true));
                        if (search) {
                            _temp = this._data = this._config.search.callback.call(this, this._data, search);
                        }
                        // If sorting is defined, sort the data
                        if (sortField !== undefined &&
                            sortOrder !== undefined &&
                            sortOrder !== '') {
                            if (typeof this._config.sort.callback === 'function') {
                                this._data = this._config.sort.callback.call(this, this._data, sortField, sortOrder);
                            }
                        }
                        // If there is data, slice it to the current page size
                        if (((_c = this._data) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                            startIndex = (page - 1) * pageSize;
                            endIndex = startIndex + pageSize;
                            this._data = this._data.slice(startIndex, endIndex);
                        }
                        // Determine number of total rows
                        this._config._state.totalItems = _temp.length;
                        // Draw the data
                        return [4 /*yield*/, this._draw()];
                    case 1:
                        // Draw the data
                        _d.sent();
                        this._fireEvent('fetched');
                        this._dispatchEvent('fetched');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if the table content has been invalidated by comparing the current checksum of the table body
     * with the stored checksum in the state. If the checksums are different, the state is updated with the
     * new checksum and `true` is returned. Otherwise, `false` is returned.
     *
     * @returns {boolean} `true` if the table content has been invalidated, `false` otherwise.
     */
    KTDataTable.prototype._localTableContentInvalidate = function () {
        var checksum = utils_1.default.checksum(JSON.stringify(this._tbodyElement.innerHTML));
        if (this.getState()._contentChecksum !== checksum) {
            this._config._state._contentChecksum = checksum;
            return true;
        }
        return false;
    };
    KTDataTable.prototype._tableConfigInvalidate = function () {
        // Remove _data and _state from config
        var _a = this._config, _data = _a._data, _state = _a._state, restConfig = __rest(_a, ["_data", "_state"]);
        var checksum = utils_1.default.checksum(JSON.stringify(restConfig));
        if (_state._configChecksum !== checksum) {
            this._config._state._configChecksum = checksum;
            return true;
        }
        return false;
    };
    /**
     * Extract the table content and returns it as an object containing an array of original data and an array of original data attributes.
     *
     * @returns {{originalData: T[], originalDataAttributes: KTDataTableAttributeInterface[]}} - An object containing an array of original data and an array of original data attributes.
     */
    KTDataTable.prototype._localExtractTableContent = function () {
        var originalData = [];
        var originalDataAttributes = [];
        this._storeOriginalClasses();
        var rows = this._tbodyElement.querySelectorAll('tr');
        var ths = this._theadElement
            ? this._theadElement.querySelectorAll('th')
            : [];
        rows.forEach(function (row) {
            var dataRow = {};
            var dataRowAttribute = {};
            row.querySelectorAll('td').forEach(function (td, index) {
                var _a, _b, _c;
                var colName = (_a = ths[index]) === null || _a === void 0 ? void 0 : _a.getAttribute('data-kt-datatable-column');
                if (colName) {
                    dataRow[colName] = (_b = td.innerHTML) === null || _b === void 0 ? void 0 : _b.trim();
                }
                else {
                    // Store the original HTML for fallback
                    dataRow[index] = (_c = td.innerHTML) === null || _c === void 0 ? void 0 : _c.trim();
                }
            });
            if (Object.keys(dataRow).length > 0) {
                originalData.push(dataRow);
                originalDataAttributes.push(dataRowAttribute);
            }
        });
        return { originalData: originalData, originalDataAttributes: originalDataAttributes };
    };
    /**
     * Check if the table header is invalidated
     * @returns {boolean} - Returns true if the table header is invalidated, false otherwise
     */
    KTDataTable.prototype._localTableHeaderInvalidate = function () {
        var originalData = this.getState().originalData;
        var currentTableHeaders = this._theadElement
            ? this._theadElement.querySelectorAll('th').length
            : 0;
        var totalColumns = originalData.length
            ? Object.keys(originalData[0]).length
            : 0;
        return currentTableHeaders !== totalColumns;
    };
    /**
     * Fetch data from the server
     */
    KTDataTable.prototype._fetchDataFromServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._fireEvent('fetch');
                        this._dispatchEvent('fetch');
                        queryParams = this._getQueryParamsForFetchRequest();
                        return [4 /*yield*/, this._performFetchRequest(queryParams)];
                    case 1:
                        response = _a.sent();
                        responseData = null;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        responseData = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this._noticeOnTable('Error parsing API response as JSON: ' + String(error_1));
                        return [2 /*return*/];
                    case 5:
                        this._fireEvent('fetched', { response: responseData });
                        this._dispatchEvent('fetched', { response: responseData });
                        // Use the mapResponse function to transform the data if provided
                        if (typeof this._config.mapResponse === 'function') {
                            responseData = this._config.mapResponse.call(this, responseData);
                        }
                        this._data = responseData.data;
                        this._config._state.totalItems = responseData.totalCount;
                        return [4 /*yield*/, this._draw()];
                    case 6:
                        _a.sent();
                        this._fireEvent('fetched');
                        this._dispatchEvent('fetched');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the query params for a fetch request
     * @returns The query params for the fetch request
     */
    KTDataTable.prototype._getQueryParamsForFetchRequest = function () {
        // Get the current state of the datatable
        var _a = this.getState(), page = _a.page, pageSize = _a.pageSize, sortField = _a.sortField, sortOrder = _a.sortOrder, filters = _a.filters, search = _a.search;
        // Create a new URLSearchParams object to store the query params
        var queryParams = new URLSearchParams();
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
            queryParams.set('filters', JSON.stringify(filters.map(function (filter) { return ({
                // Map the filter object to a simpler object with just the necessary properties
                column: filter.column,
                type: filter.type,
                value: filter.value,
            }); })));
        }
        if (search) {
            queryParams.set('search', typeof search === 'object' ? JSON.stringify(search) : search);
        }
        // If a mapRequest function is provided, call it with the query params object
        if (typeof this._config.mapRequest === 'function') {
            queryParams = this._config.mapRequest.call(this, queryParams);
        }
        // Return the query params object
        return queryParams;
    };
    KTDataTable.prototype._performFetchRequest = function (queryParams) {
        return __awaiter(this, void 0, void 0, function () {
            var requestMethod, requestBody, apiEndpointWithQueryParams;
            var _this = this;
            return __generator(this, function (_a) {
                requestMethod = this._config.requestMethod;
                requestBody = undefined;
                // If the request method is POST, send the query params as the request body
                if (requestMethod === 'POST') {
                    requestBody = queryParams;
                }
                else if (requestMethod === 'GET') {
                    apiEndpointWithQueryParams = this._createUrl(this._config.apiEndpoint);
                    apiEndpointWithQueryParams.search = queryParams.toString();
                    this._config.apiEndpoint = apiEndpointWithQueryParams.toString();
                }
                return [2 /*return*/, fetch(this._config.apiEndpoint, {
                        method: requestMethod,
                        body: requestBody,
                        headers: this._config.requestHeaders,
                    }).catch(function (error) {
                        // Trigger an error event
                        _this._fireEvent('error', { error: error });
                        _this._dispatchEvent('error', { error: error });
                        _this._noticeOnTable('Error performing fetch request: ' + String(error));
                        throw error;
                    })];
            });
        });
    };
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
    KTDataTable.prototype._createUrl = function (pathOrUrl, baseUrl) {
        if (baseUrl === void 0) { baseUrl = window.location.origin; }
        // Regular expression to check if the input is a full URL
        var isFullUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(pathOrUrl);
        if (isFullUrl) {
            return new URL(pathOrUrl); // Return full URL as URL object
        }
        // Ensure path starts with a slash to avoid incorrect concatenation
        var normalizedPath = pathOrUrl.startsWith('/')
            ? pathOrUrl
            : "/".concat(pathOrUrl);
        return new URL(normalizedPath, baseUrl);
    };
    /**
     * Update the table and pagination controls with new data
     * @returns {Promise<void>} A promise that resolves when the table and pagination controls are updated
     */
    KTDataTable.prototype._draw = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                this._hideSpinner(); // Hide spinner after data is fetched
                if (this._config.stateSave) {
                    this._saveState();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update the HTML table with new data
     * @returns {HTMLTableSectionElement} The new table body element
     */
    KTDataTable.prototype._updateTable = function () {
        // Clear the existing table contents using a more efficient method
        while (this._tableElement.tBodies.length) {
            this._tableElement.removeChild(this._tableElement.tBodies[0]);
        }
        // Create the table body with the new data
        var tbodyElement = this._tableElement.createTBody();
        // Apply the original class to the new tbody element
        if (this._originalTbodyClass) {
            tbodyElement.className = this._originalTbodyClass;
        }
        this._updateTableContent(tbodyElement);
        return tbodyElement;
    };
    /**
     * Update the table content
     * @param tbodyElement The table body element
     * @returns {HTMLTableSectionElement} The updated table body element
     */
    KTDataTable.prototype._updateTableContent = function (tbodyElement) {
        var _this = this;
        var fragment = document.createDocumentFragment();
        tbodyElement.textContent = ''; // Clear the tbody element
        if (this._data.length === 0) {
            this._noticeOnTable(this._config.infoEmpty || '');
            return tbodyElement;
        }
        var ths = this._theadElement
            ? this._theadElement.querySelectorAll('th')
            : [];
        this._data.forEach(function (item, rowIndex) {
            var row = document.createElement('tr');
            // Apply original tr class if available
            if (_this._originalTrClasses && _this._originalTrClasses[rowIndex]) {
                row.className = _this._originalTrClasses[rowIndex];
            }
            if (!_this._config.columns) {
                var dataRowAttributes_1 = _this.getState().originalDataAttributes
                    ? _this.getState().originalDataAttributes[rowIndex]
                    : null;
                // Use the order of <th> elements to render <td>s in the correct order
                ths.forEach(function (th, colIndex) {
                    var colName = th.getAttribute('data-kt-datatable-column');
                    var td = document.createElement('td');
                    var value;
                    if (colName && Object.prototype.hasOwnProperty.call(item, colName)) {
                        value = item[colName];
                    }
                    else if (Object.prototype.hasOwnProperty.call(item, colIndex)) {
                        value = item[colIndex];
                    }
                    else {
                        value = '';
                    }
                    td.innerHTML = value;
                    // Apply original td class if available
                    if (_this._originalTdClasses &&
                        _this._originalTdClasses[rowIndex] &&
                        _this._originalTdClasses[rowIndex][colIndex]) {
                        td.className = _this._originalTdClasses[rowIndex][colIndex];
                    }
                    if (dataRowAttributes_1 && dataRowAttributes_1[colIndex]) {
                        for (var attr in dataRowAttributes_1[colIndex]) {
                            td.setAttribute(attr, dataRowAttributes_1[colIndex][attr]);
                        }
                    }
                    row.appendChild(td);
                });
            }
            else {
                Object.keys(_this._config.columns).forEach(function (key, colIndex) {
                    var td = document.createElement('td');
                    var columnDef = _this._config.columns[key];
                    // Apply original td class if available
                    if (_this._originalTdClasses &&
                        _this._originalTdClasses[rowIndex] &&
                        _this._originalTdClasses[rowIndex][colIndex]) {
                        td.className = _this._originalTdClasses[rowIndex][colIndex];
                    }
                    if (typeof columnDef.render === 'function') {
                        var result = columnDef.render.call(_this, item[key], item, _this);
                        if (result instanceof HTMLElement || result instanceof DocumentFragment) {
                            td.appendChild(result);
                        }
                        else if (typeof result === 'string') {
                            td.innerHTML = result;
                        }
                    }
                    else {
                        td.textContent = item[key];
                    }
                    if (typeof columnDef.createdCell === 'function') {
                        columnDef.createdCell.call(_this, td, item[key], item, row);
                    }
                    row.appendChild(td);
                });
            }
            fragment.appendChild(row);
        });
        tbodyElement.appendChild(fragment);
        return tbodyElement;
    };
    /**
     * Show a notice on the table
     * @param message The message to show. If empty, the message will be removed
     * @returns {void}
     */
    KTDataTable.prototype._noticeOnTable = function (message) {
        if (message === void 0) { message = ''; }
        var row = this._tableElement.tBodies[0].insertRow();
        var cell = row.insertCell();
        cell.colSpan = this._theadElement
            ? this._theadElement.querySelectorAll('th').length
            : 0;
        cell.innerHTML = message;
    };
    KTDataTable.prototype._updatePagination = function () {
        this._removeChildElements(this._sizeElement);
        this._createPageSizeControls(this._sizeElement);
        this._removeChildElements(this._paginationElement);
        this._createPaginationControls(this._infoElement, this._paginationElement);
    };
    /**
     * Removes all child elements from the given container element.
     * @param container The container element to remove the child elements from.
     */
    KTDataTable.prototype._removeChildElements = function (container) {
        if (!container) {
            return;
        }
        // Loop through all child elements of the container and remove them one by one
        while (container.firstChild) {
            // Remove the first child element (which is the first element in the list of child elements)
            container.removeChild(container.firstChild);
        }
    };
    /**
     * Creates a container element for the items per page selector.
     * @param _sizeElement The element to create the page size controls in.
     * @returns The container element.
     */
    KTDataTable.prototype._createPageSizeControls = function (_sizeElement) {
        var _this = this;
        // If no element is provided, return early
        if (!_sizeElement) {
            return _sizeElement;
        }
        // Wait for the element to be attached to the DOM
        setTimeout(function () {
            // Create <option> elements for each page size option
            var options = _this._config.pageSizes.map(function (size) {
                var option = document.createElement('option');
                option.value = String(size);
                option.text = String(size);
                option.selected = _this.getState().pageSize === size;
                return option;
            });
            // Add the <option> elements to the provided element
            _sizeElement.append.apply(_sizeElement, options);
        }, 100);
        // Create an event listener for the "change" event on the element
        var _pageSizeControlsEvent = function (event) {
            // When the element changes, reload the page with the new page size and page number 1
            _this._reloadPageSize(Number(event.target.value), 1);
        };
        // Bind the event listener to the component instance
        _sizeElement.onchange = _pageSizeControlsEvent.bind(this);
        // Return the element
        return _sizeElement;
    };
    /**
     * Reloads the data with the specified page size and optional page number.
     * @param pageSize The new page size.
     * @param page The new page number (optional, defaults to 1).
     */
    KTDataTable.prototype._reloadPageSize = function (pageSize, page) {
        if (page === void 0) { page = 1; }
        // Update the page size and page number in the state
        this._config._state.pageSize = pageSize;
        this._config._state.page = page;
        // Update the data with the new page size and page number
        this._updateData();
    };
    /**
     * Creates the pagination controls for the component.
     * @param _infoElement The element to set the info text in.
     * @param _paginationElement The element to create the pagination controls in.
     * @return {HTMLElement} The element containing the pagination controls.
     */
    KTDataTable.prototype._createPaginationControls = function (_infoElement, _paginationElement) {
        if (!_infoElement || !_paginationElement || this._data.length === 0) {
            return null;
        }
        this._setPaginationInfoText(_infoElement);
        var paginationContainer = this._createPaginationContainer(_paginationElement);
        if (paginationContainer) {
            this._createPaginationButtons(paginationContainer);
        }
        return paginationContainer;
    };
    /**
     * Sets the info text for the pagination controls.
     * @param _infoElement The element to set the info text in.
     */
    KTDataTable.prototype._setPaginationInfoText = function (_infoElement) {
        _infoElement.textContent = this._config.info
            .replace('{start}', (this.getState().page - 1) * this.getState().pageSize + 1 + '')
            .replace('{end}', Math.min(this.getState().page * this.getState().pageSize, this.getState().totalItems) + '')
            .replace('{total}', this.getState().totalItems + '');
    };
    /**
     * Creates the container element for the pagination controls.
     * @param _paginationElement The element to create the pagination controls in.
     * @return {HTMLElement} The container element.
     */
    KTDataTable.prototype._createPaginationContainer = function (_paginationElement) {
        // No longer create a wrapping div. Just return the pagination element itself.
        return _paginationElement;
    };
    /**
     * Creates the pagination buttons for the component.
     * @param paginationContainer The container element for the pagination controls.
     */
    KTDataTable.prototype._createPaginationButtons = function (paginationContainer) {
        var _this = this;
        var _a = this.getState(), currentPage = _a.page, totalPages = _a.totalPages;
        var _b = this._config.pagination, previous = _b.previous, next = _b.next, number = _b.number, more = _b.more;
        // Helper function to create a button
        var createButton = function (text, className, disabled, handleClick) {
            var button = document.createElement('button');
            button.className = className;
            button.innerHTML = text;
            button.disabled = disabled;
            button.onclick = handleClick;
            return button;
        };
        // Add Previous Button
        paginationContainer.appendChild(createButton(previous.text, "".concat(previous.class).concat(currentPage === 1 ? ' disabled' : ''), currentPage === 1, function () { return _this._paginateData(currentPage - 1); }));
        // Calculate range of pages
        var pageMoreEnabled = this._config.pageMore;
        if (pageMoreEnabled) {
            var maxButtons = this._config.pageMoreLimit;
            var range_1 = this._calculatePageRange(currentPage, totalPages, maxButtons);
            // Add start ellipsis
            if (range_1.start > 1) {
                paginationContainer.appendChild(createButton(more.text, more.class, false, function () {
                    return _this._paginateData(Math.max(1, range_1.start - 1));
                }));
            }
            var _loop_1 = function (i) {
                paginationContainer.appendChild(createButton(number.text.replace('{page}', i.toString()), "".concat(number.class).concat(currentPage === i ? ' active disabled' : ''), currentPage === i, function () { return _this._paginateData(i); }));
            };
            // Add page buttons
            for (var i = range_1.start; i <= range_1.end; i++) {
                _loop_1(i);
            }
            // Add end ellipsis
            if (pageMoreEnabled && range_1.end < totalPages) {
                paginationContainer.appendChild(createButton(more.text, more.class, false, function () {
                    return _this._paginateData(Math.min(totalPages, range_1.end + 1));
                }));
            }
        }
        else {
            var _loop_2 = function (i) {
                paginationContainer.appendChild(createButton(number.text.replace('{page}', i.toString()), "".concat(number.class).concat(currentPage === i ? ' active disabled' : ''), currentPage === i, function () { return _this._paginateData(i); }));
            };
            // Add page buttons
            for (var i = 1; i <= totalPages; i++) {
                _loop_2(i);
            }
        }
        // Add Next Button
        paginationContainer.appendChild(createButton(next.text, "".concat(next.class).concat(currentPage === totalPages ? ' disabled' : ''), currentPage === totalPages, function () { return _this._paginateData(currentPage + 1); }));
    };
    // New helper method to calculate page range
    KTDataTable.prototype._calculatePageRange = function (currentPage, totalPages, maxButtons) {
        var startPage, endPage;
        var halfMaxButtons = Math.floor(maxButtons / 2);
        if (totalPages <= maxButtons) {
            startPage = 1;
            endPage = totalPages;
        }
        else {
            startPage = Math.max(currentPage - halfMaxButtons, 1);
            endPage = Math.min(startPage + maxButtons - 1, totalPages);
            if (endPage - startPage < maxButtons - 1) {
                startPage = Math.max(endPage - maxButtons + 1, 1);
            }
        }
        return { start: startPage, end: endPage };
    };
    /**
     * Method for handling pagination
     * @param page - The page number to navigate to
     */
    KTDataTable.prototype._paginateData = function (page) {
        if (page < 1 || !Number.isInteger(page)) {
            return;
        }
        this._fireEvent('pagination', { page: page });
        this._dispatchEvent('pagination', { page: page });
        if (page >= 1 && page <= this.getState().totalPages) {
            this._config._state.page = page;
            this._updateData();
        }
    };
    // Method to show the loading spinner
    KTDataTable.prototype._showSpinner = function () {
        var spinner = this._element.querySelector(this._config.attributes.spinner) || this._createSpinner();
        if (spinner) {
            spinner.style.display = 'block';
        }
        this._element.classList.add(this._config.loadingClass);
    };
    // Method to hide the loading spinner
    KTDataTable.prototype._hideSpinner = function () {
        var spinner = this._element.querySelector(this._config.attributes.spinner);
        if (spinner) {
            spinner.style.display = 'none';
        }
        this._element.classList.remove(this._config.loadingClass);
    };
    // Method to create a spinner element if it doesn't exist
    KTDataTable.prototype._createSpinner = function () {
        if (typeof this._config.loading === 'undefined') {
            return null;
        }
        var template = document.createElement('template');
        template.innerHTML = this._config.loading.template
            .trim()
            .replace('{content}', this._config.loading.content);
        var spinner = template.content.firstChild;
        spinner.setAttribute('data-kt-datatable-spinner', 'true');
        this._tableElement.appendChild(spinner);
        return spinner;
    };
    /**
     * Saves the current state of the table to local storage.
     * @returns {void}
     */
    KTDataTable.prototype._saveState = function () {
        this._fireEvent('stateSave');
        this._dispatchEvent('stateSave');
        var ns = this._tableNamespace();
        if (ns) {
            localStorage.setItem(ns, JSON.stringify(this.getState()));
        }
    };
    /**
     * Loads the saved state of the table from local storage, if it exists.
     * @returns {Object} The saved state of the table, or null if no saved state exists.
     */
    KTDataTable.prototype._loadState = function () {
        var stateString = localStorage.getItem(this._tableNamespace());
        if (!stateString)
            return null;
        try {
            var state = JSON.parse(stateString);
            if (state)
                this._config._state = state;
            return state;
        }
        catch (_a) { } // eslint-disable-line no-empty
        return null;
    };
    KTDataTable.prototype._deleteState = function () {
        var ns = this._tableNamespace();
        if (ns) {
            localStorage.removeItem(ns);
        }
    };
    /**
     * Gets the namespace for the table's state.
     * If a namespace is specified in the config, it is used.
     * Otherwise, if the table element has an ID, it is used.
     * Otherwise, if the component element has an ID, it is used.
     * Finally, the component's UID is used.
     * @returns {string} The namespace for the table's state.
     */
    KTDataTable.prototype._tableNamespace = function () {
        var _a;
        // Use the specified namespace, if one is given
        if (this._config.stateNamespace) {
            return this._config.stateNamespace;
        }
        // Fallback to the component's UID
        return (_a = this._tableId()) !== null && _a !== void 0 ? _a : this._name;
    };
    KTDataTable.prototype._tableId = function () {
        var _a, _b;
        var id = null;
        // If the table element has an ID, use that
        if ((_a = this._tableElement) === null || _a === void 0 ? void 0 : _a.getAttribute('id')) {
            id = this._tableElement.getAttribute('id');
        }
        // If the component element has an ID, use that
        if ((_b = this._element) === null || _b === void 0 ? void 0 : _b.getAttribute('id')) {
            id = this._element.getAttribute('id');
        }
        return id;
    };
    /**
     * Clean up all event listeners, handlers, and DOM nodes created by this instance.
     * This method is called before re-rendering or when disposing the component.
     */
    KTDataTable.prototype._dispose = function () {
        // --- 1. Remove search input event listener (debounced) ---
        var tableId = this._tableId();
        var searchElement = document.querySelector("[data-kt-datatable-search=\"#".concat(tableId, "\"]"));
        if (searchElement && searchElement._debouncedSearch) {
            searchElement.removeEventListener('keyup', searchElement._debouncedSearch);
            delete searchElement._debouncedSearch;
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
        if (this._checkbox && typeof this._checkbox.dispose === 'function') {
            this._checkbox.dispose();
        }
        else {
            // Remove header checkbox event listener if possible
            var headerCheckElement = this._element.querySelector(this._config.attributes.check);
            if (headerCheckElement) {
                headerCheckElement.replaceWith(headerCheckElement.cloneNode(true));
            }
        }
        // KTDataTableSortAPI does not have a dispose method, but we can remove th click listeners by replacing them
        if (this._theadElement) {
            var ths = this._theadElement.querySelectorAll('th');
            ths.forEach(function (th) {
                th.replaceWith(th.cloneNode(true));
            });
        }
        // --- 5. Remove spinner DOM node if it exists ---
        var spinner = this._element.querySelector(this._config.attributes.spinner);
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
        this._element.classList.remove(this._config.loadingClass);
        // --- 6. Remove instance reference from the DOM element ---
        if (this._element.instance) {
            delete this._element.instance;
        }
        // --- 7. (Optional) Clear localStorage state ---
        // Uncomment the following line if you want to clear state on dispose:
        // this._deleteState();
    };
    KTDataTable.prototype._debounce = function (func, wait) {
        var timeout;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                clearTimeout(timeout);
                func.apply(void 0, args);
            };
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
        };
    };
    /**
     * Gets the current state of the table.
     * @returns {KTDataTableStateInterface} The current state of the table.
     */
    KTDataTable.prototype.getState = function () {
        return __assign({ 
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
            sortOrder: '', 
            /**
             * The number of rows to display per page.
             */
            pageSize: this._config.pageSize, filters: [] }, this._config._state);
    };
    /**
     * Sorts the data in the table by the specified field.
     * @param field The field to sort by.
     */
    KTDataTable.prototype.sort = function (field) {
        // Use the sort handler to update state and trigger sorting
        var state = this.getState();
        var sortOrder = this._sortHandler.toggleSortOrder(state.sortField, state.sortOrder, field);
        this._sortHandler.setSortIcon(field, sortOrder);
        this._config._state.sortField = field;
        this._config._state.sortOrder = sortOrder;
        this._fireEvent('sort', { field: field, order: sortOrder });
        this._dispatchEvent('sort', { field: field, order: sortOrder });
        this._updateData();
    };
    /**
     * Navigates to the specified page in the data table.
     * @param page The page number to navigate to.
     */
    KTDataTable.prototype.goPage = function (page) {
        if (page < 1 || !Number.isInteger(page)) {
            return;
        }
        // Navigate to the specified page
        this._paginateData(page);
    };
    /**
     * Set the page size of the data table.
     * @param pageSize The new page size.
     */
    KTDataTable.prototype.setPageSize = function (pageSize) {
        if (!Number.isInteger(pageSize)) {
            return;
        }
        /**
         * Reload the page size of the data table.
         * @param pageSize The new page size.
         */
        this._reloadPageSize(pageSize);
    };
    /**
     * Reloads the data from the server and updates the table.
     * Triggers the 'reload' event and the 'kt.datatable.reload' custom event.
     */
    KTDataTable.prototype.reload = function () {
        this._fireEvent('reload');
        this._dispatchEvent('reload');
        // Fetch the data from the server using the current sort and filter settings
        this._updateData();
    };
    KTDataTable.prototype.redraw = function (page) {
        if (page === void 0) { page = 1; }
        this._fireEvent('redraw');
        this._dispatchEvent('redraw');
        this._paginateData(page);
    };
    /**
     * Show the loading spinner of the data table.
     */
    KTDataTable.prototype.showSpinner = function () {
        /**
         * Show the loading spinner of the data table.
         */
        this._showSpinner();
    };
    /**
     * Hide the loading spinner of the data table.
     */
    KTDataTable.prototype.hideSpinner = function () {
        /**
         * Hide the loading spinner of the data table.
         */
        this._hideSpinner();
    };
    /**
     * Filter data using the specified filter object.
     * Replaces the existing filter object for the column with the new one.
     * @param filter Filter object containing the column name and its value.
     * @returns The KTDataTable instance.
     * @throws Error if the filter object is null or undefined.
     */
    KTDataTable.prototype.setFilter = function (filter) {
        this._config._state.filters = __spreadArray(__spreadArray([], (this.getState().filters || []).filter(function (f) { return f.column !== filter.column; }), true), [
            filter,
        ], false);
        return this;
    };
    KTDataTable.prototype.dispose = function () {
        this._dispose();
    };
    KTDataTable.prototype.search = function (query) {
        this._config._state.search = query;
        this.reload();
    };
    /**
     * Create KTDataTable instances for all elements with a data-kt-datatable="true" attribute.
     * This function is now browser-guarded and must be called explicitly.
     */
    KTDataTable.createInstances = function () {
        var _this = this;
        if (typeof document === 'undefined')
            return;
        var elements = document.querySelectorAll('[data-kt-datatable="true"]');
        elements.forEach(function (element) {
            if (element.hasAttribute('data-kt-datatable') &&
                !element.classList.contains('datatable-initialized')) {
                /**
                 * Create an instance of KTDataTable for the given element
                 * @param element The element to create an instance for
                 */
                var instance = new KTDataTable(element);
                _this._instances.set(element, instance);
            }
        });
    };
    /**
     * Get the KTDataTable instance for a given element.
     *
     * @param element The element to retrieve the instance for
     * @returns The KTDataTable instance or undefined if not found
     */
    KTDataTable.getInstance = function (element) {
        return this._instances.get(element);
    };
    /**
     * Initializes all KTDataTable instances on the page.
     * This function is now browser-guarded and must be called explicitly.
     */
    KTDataTable.init = function () {
        if (typeof document === 'undefined')
            return;
        // Create instances of KTDataTable for all elements with a
        // data-kt-datatable="true" attribute
        KTDataTable.createInstances();
    };
    /**
     * Check if all visible rows are checked (header checkbox state)
     * @returns {boolean}
     */
    KTDataTable.prototype.isChecked = function () {
        return this._checkbox.isChecked();
    };
    /**
     * Toggle all visible row checkboxes (header checkbox)
     * @returns {void}
     */
    KTDataTable.prototype.toggle = function () {
        this._checkbox.toggle();
    };
    /**
     * Check all visible row checkboxes
     * @returns {void}
     */
    KTDataTable.prototype.check = function () {
        this._checkbox.check();
        this._fireEvent('checked');
        this._dispatchEvent('checked');
    };
    /**
     * Uncheck all visible row checkboxes
     * @returns {void}
     */
    KTDataTable.prototype.uncheck = function () {
        this._checkbox.uncheck();
        this._fireEvent('unchecked');
        this._dispatchEvent('unchecked');
    };
    /**
     * Get all checked row IDs (across all pages if preserveSelection is true)
     * @returns {string[]}
     */
    KTDataTable.prototype.getChecked = function () {
        return this._checkbox.getChecked();
    };
    /**
     * Reapply checked state to visible checkboxes (after redraw/pagination)
     * @returns {void}
     */
    KTDataTable.prototype.update = function () {
        this._checkbox.updateState();
    };
    /**
     * Static variables
     */
    KTDataTable._instances = new Map();
    return KTDataTable;
}(component_1.default));
exports.KTDataTable = KTDataTable;
/**
 * NOTE: This module is now PURE. No side effects or DOM/global assignments occur on import.
 * To auto-initialize all datatables on the page, call the exported `initAllDataTables()` function explicitly in the browser.
 */
function initAllDataTables() {
    if (typeof document !== 'undefined') {
        KTDataTable.createInstances();
        // Optionally assign to window for legacy support
        window.KTDataTable = KTDataTable;
    }
}
//# sourceMappingURL=datatable.js.map