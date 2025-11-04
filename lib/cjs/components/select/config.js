"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
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
exports.KTSelectState = exports.DefaultConfig = void 0;
exports.DefaultConfig = {
    // ...other config options
    loadMoreText: 'Load more...',
    // General Display
    debug: false,
    placeholder: 'Select an option', // Default placeholder text when no option is selected
    // Data Handling
    items: [], // Static list of options
    isLoading: false, // Indicates if options are being loaded asynchronously
    onFetch: null, // Callback function to fetch options asynchronously
    // Remote Data Configuration
    remote: false, // Enable/disable remote data fetching
    dataUrl: null, // URL to fetch options from
    apiDataProperty: null, // Property in the response object that contains the options
    remoteErrorMessage: 'Failed to load data', // Error message to display if remote data fetch fails
    // Field Mapping
    dataValueField: null, // Property in the option object that contains the value (default: 'id')
    dataFieldText: null, // Property in the option object that contains the text (default: 'title')
    // Search Configuration
    searchParam: '', // Query parameter for API search requests
    searchDebounce: 300, // Debounce delay for search (in ms)
    // Pagination Configuration
    pagination: false, // Enable/disable pagination for remote data
    paginationLimit: 10, // Items per page
    paginationPageParam: 'page', // Parameter name for page number
    paginationLimitParam: 'limit', // Parameter name for items per page
    paginationTotalParam: 'total', // Parameter name for total items
    // Selection Behavior
    allowClear: false, // Allow clearing the selection (if true, an empty value can be set)
    multiple: false, // Enable/disable multi-select
    maxSelections: null, // Maximum number of selections allowed in multi-select mode (null for unlimited)
    disabled: false, // Disable the select component
    isRequired: false, // Make selection required
    // Search Functionality
    enableSearch: false, // Enable/disable search functionality within the dropdown
    searchPlaceholder: 'Search...', // Placeholder text for the search input
    searchAutofocus: true, // Autofocus on search input when dropdown opens
    searchMinLength: 0, // Minimum characters required to trigger search
    searchMaxItems: 50, // Maximum number of search results to display
    searchEmpty: 'No results', // Text to display when no search results are found
    clearSearchOnClose: true, // Clear search input when dropdown closes
    // Multi-Select Display
    selectAllText: 'Select all', // Text for the "Select All" option (if implemented)
    clearAllText: 'Clear all', // Text for the "Clear All" option (if implemented)
    enableSelectAll: false, // Enable/disable "Select All" button for multi-select
    showSelectedCount: true, // Show the number of selected options in multi-select mode
    renderSelected: null, // Custom function to render the selected value(s) in the display area
    // Accessibility & Usability
    label: 'Select an option', // Label for the select component (for screen readers)
    height: 250, // Maximum height of the dropdown menu in pixels (if exceeded, a scrollbar will appear)
    // Dropdown Configuration
    dropdownZindex: 105, // Initial z-index value for the dropdown
    dropdownContainer: null, // Container element for the dropdown
    dropdownPlacement: null,
    dropdownFlip: false,
    dropdownPreventOverflow: false,
    dropdownStrategy: null,
    dropdownWidth: null, // Custom width for dropdown (e.g., '300px'), null to match toggle element width
    // New Config
    dropdownTemplate: '',
};
var KTSelectState = /** @class */ (function () {
    function KTSelectState(config) {
        this._selectedOptions = [];
        this._config = this._initDefaultConfig(config);
    }
    KTSelectState.prototype._initDefaultConfig = function (config) {
        return __assign(__assign(__assign({}, exports.DefaultConfig), config), config.config);
    };
    KTSelectState.prototype.setItems = function (items, query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (items) {
                _this._config.items = items;
                resolve();
            }
            else if (_this._config.dataUrl) {
                _this._fetchRemoteData(query)
                    .then(resolve) // Resolve after _fetchRemoteData completes
                    .catch(reject);
            }
            else if (_this._config.onFetch) {
                _this._config.isLoading = true;
                _this._config
                    .onFetch(query)
                    .then(function (items) {
                    _this._config.items = items;
                    resolve(); // Resolve after onFetch completes
                })
                    .catch(function (error) {
                    console.error('Error fetching data:', error);
                    reject(error); // Reject on error
                })
                    .finally(function () {
                    _this._config.isLoading = false;
                });
            }
            else {
                resolve();
            }
        });
    };
    KTSelectState.prototype._fetchRemoteData = function (query) {
        var _this = this;
        this._config.isLoading = true; // Show loading indicator
        var url = this._config.dataUrl;
        if (query) {
            url += "?".concat(this._config.searchParam, "=").concat(encodeURIComponent(query));
        }
        return fetch(url)
            .then(function (response) { return response.json(); })
            .then(function (data) {
            if (_this._config.apiDataProperty) {
                // Extract the data property from the response
                if (_this._config.apiDataProperty in data) {
                    data = data[_this._config.apiDataProperty];
                }
                else {
                    console.error('Error fetching data:', "Property '".concat(_this._config.apiDataProperty, "' not found in response"));
                    return;
                }
            }
            _this._config.items = data;
        })
            .catch(function (error) {
            console.error('Error fetching data:', error);
            // Handle error (e.g., display an error message)
        })
            .finally(function () {
            _this._config.isLoading = false; // Hide loading indicator
        });
    };
    KTSelectState.prototype.getItems = function () {
        return this._config.items || [];
    };
    KTSelectState.prototype.setItemsFromOptions = function (options) {
        this._config.items = options.map(function (option) {
            var item = {
                id: option.value,
                title: option.textContent || option.value, // Use value as fallback for title
                // 'selected' property will be definitively set by _preSelectOptions
                disabled: option.disabled,
            };
            return item;
        });
        // The 'selected' status of these items and the overall component selection state
        // are now fully managed by _preSelectOptions in KTSelect during initialization.
    };
    KTSelectState.prototype.getConfig = function () {
        return this._config;
    };
    KTSelectState.prototype.setSelectedOptions = function (value) {
        // Handle empty array case first to prevent undefined elements
        if (Array.isArray(value) && value.length === 0) {
            this._selectedOptions = [];
            return;
        }
        if (this._config.multiple &&
            typeof value === 'string' &&
            !this._selectedOptions.includes(value)) {
            this._selectedOptions.push(value);
        }
        else if (!this._config.multiple) {
            // For single select, replace the previous selection with the new one
            this._selectedOptions = typeof value === 'string' ? [value] : [value[0]];
        }
        else if (this._config.multiple && Array.isArray(value)) {
            // For multiple select with array input, use the provided array
            this._selectedOptions = __spreadArray([], value, true);
        }
    };
    KTSelectState.prototype.toggleSelectedOptions = function (value) {
        if (!this._config.multiple) {
            // For non-multiple, always set the new value
            this._selectedOptions = [value];
            return;
        }
        // For multiple selection, toggle the value
        var index = this._selectedOptions.indexOf(value);
        if (index > -1) {
            this._selectedOptions.splice(index, 1);
        }
        else {
            this._selectedOptions.push(value);
        }
    };
    KTSelectState.prototype.getSelectedOptions = function () {
        return this._selectedOptions;
    };
    KTSelectState.prototype.isSelected = function (value) {
        return this._selectedOptions.includes(value);
    };
    KTSelectState.prototype.modifyConfig = function (config) {
        this._config = __assign(__assign({}, this._config), config);
    };
    return KTSelectState;
}());
exports.KTSelectState = KTSelectState;
//# sourceMappingURL=config.js.map