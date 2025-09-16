/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/**
 * KTSelectRemote class
 * Handles fetching remote data for the KTSelect component
 */
var KTSelectRemote = /** @class */ (function () {
    /**
     * Constructor
     * @param config KTSelect configuration
     * @param element The select element
     */
    function KTSelectRemote(config, element) {
        this._isLoading = false;
        this._hasError = false;
        this._errorMessage = '';
        this._currentPage = 1;
        this._totalPages = 1;
        this._lastQuery = '';
        this._element = null;
        this._config = config;
        this._element = element || null;
    }
    /**
     * Fetch data from remote URL
     * @param query Optional search query
     * @param page Page number for pagination
     * @returns Promise with fetched items
     */
    KTSelectRemote.prototype.fetchData = function (query, page) {
        var _this = this;
        if (page === void 0) { page = 1; }
        this._isLoading = true;
        this._hasError = false;
        this._errorMessage = '';
        this._lastQuery = query || '';
        this._currentPage = page;
        var url = this._buildUrl(query, page);
        if (this._config.debug)
            console.log('Fetching remote data from:', url);
        // Dispatch search start event
        this._dispatchEvent('remoteSearchStart');
        return fetch(url)
            .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error! Status: ".concat(response.status));
            }
            return response.json();
        })
            .then(function (data) {
            // Process the data
            return _this._processData(data);
        })
            .catch(function (error) {
            console.error('Error fetching remote data:', error);
            _this._hasError = true;
            _this._errorMessage =
                _this._config.remoteErrorMessage || 'Failed to load data';
            return [];
        })
            .finally(function () {
            _this._isLoading = false;
            // Dispatch search end event
            _this._dispatchEvent('remoteSearchEnd');
        });
    };
    /**
     * Dispatch custom events to notify about search state changes
     * @param eventName Name of the event to dispatch
     */
    KTSelectRemote.prototype._dispatchEvent = function (eventName) {
        if (!this._element)
            return;
        var event = new CustomEvent("ktselect.".concat(eventName), {
            bubbles: true,
            detail: {
                query: this._lastQuery,
                isLoading: this._isLoading,
                hasError: this._hasError,
                errorMessage: this._errorMessage,
            },
        });
        this._element.dispatchEvent(event);
    };
    /**
     * Build the URL for the API request
     * @param query Search query
     * @param page Page number
     * @returns Fully formed URL
     */
    KTSelectRemote.prototype._buildUrl = function (query, page) {
        if (page === void 0) { page = 1; }
        var url = this._config.dataUrl;
        if (!url) {
            console.error('No URL specified for remote data');
            return '';
        }
        // Add parameters
        var params = new URLSearchParams();
        // Add search parameter if provided
        if (query && this._config.searchParam) {
            params.append(this._config.searchParam, query);
        }
        // Add pagination parameters if enabled
        if (this._config.pagination) {
            var limitParam = this._config.paginationLimitParam || 'limit';
            var pageParam = this._config.paginationPageParam || 'page';
            var limit = this._config.paginationLimit || 10;
            params.append(limitParam, limit.toString());
            params.append(pageParam, page.toString());
        }
        // Append parameters to URL if there are any
        var paramsString = params.toString();
        if (paramsString) {
            url += (url.includes('?') ? '&' : '?') + paramsString;
        }
        return url;
    };
    /**
     * Process the API response data
     * @param data API response data
     * @returns Array of KTSelectOptionData
     */
    KTSelectRemote.prototype._processData = function (data) {
        var _this = this;
        try {
            if (this._config.debug)
                console.log('Processing API response:', data);
            var processedData = data;
            // Extract data from the API property if specified
            if (this._config.apiDataProperty && data[this._config.apiDataProperty]) {
                if (this._config.debug)
                    console.log("Extracting data from property: ".concat(this._config.apiDataProperty));
                // If pagination metadata is available, extract it
                if (this._config.pagination) {
                    if (data.total_pages) {
                        this._totalPages = data.total_pages;
                        if (this._config.debug)
                            console.log("Total pages found: ".concat(this._totalPages));
                    }
                    if (data.total) {
                        this._totalPages = Math.ceil(data.total / (this._config.paginationLimit || 10));
                        if (this._config.debug)
                            console.log("Calculated total pages: ".concat(this._totalPages, " from total: ").concat(data.total));
                    }
                }
                processedData = data[this._config.apiDataProperty];
            }
            // Ensure data is an array
            if (!Array.isArray(processedData)) {
                console.warn('Remote data is not an array:', processedData);
                return [];
            }
            if (this._config.debug)
                console.log("Mapping ".concat(processedData.length, " items to KTSelectOptionData format"));
            // Map data to KTSelectOptionData format
            var mappedData = processedData.map(function (item) {
                var mappedItem = _this._mapItemToOption(item);
                // Add logging to trace data path extraction
                if (_this._config.dataValueField &&
                    _this._config.dataValueField.includes('.')) {
                    // For nested paths, verify extraction worked
                    var parts = _this._config.dataValueField.split('.');
                    var nestedValue = item;
                    // Try to navigate to the value manually for verification
                    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                        var part = parts_1[_i];
                        if (nestedValue &&
                            typeof nestedValue === 'object' &&
                            part in nestedValue) {
                            nestedValue = nestedValue[part];
                        }
                        else {
                            nestedValue = null;
                            break;
                        }
                    }
                    // If we found a value, verify it matches what was extracted
                    if (nestedValue !== null && nestedValue !== undefined) {
                        var expectedValue = String(nestedValue);
                        if (_this._config.debug)
                            console.log("Data path verification for [".concat(_this._config.dataValueField, "]: Expected: ").concat(expectedValue, ", Got: ").concat(mappedItem.id));
                        if (mappedItem.id !== expectedValue && expectedValue) {
                            console.warn("Value mismatch! Path: ".concat(_this._config.dataValueField, ", Expected: ").concat(expectedValue, ", Got: ").concat(mappedItem.id));
                        }
                    }
                }
                if (_this._config.debug)
                    console.log("Mapped item: ".concat(JSON.stringify(mappedItem)));
                return mappedItem;
            });
            if (this._config.debug)
                console.log("Returned ".concat(mappedData.length, " mapped items"));
            return mappedData;
        }
        catch (error) {
            console.error('Error processing remote data:', error);
            this._hasError = true;
            this._errorMessage = 'Error processing data';
            return [];
        }
    };
    /**
     * Map a data item to KTSelectOptionData format
     * @param item Data item from API
     * @returns KTSelectOptionData object
     */
    KTSelectRemote.prototype._mapItemToOption = function (item) {
        var _this = this;
        // Get the field mapping from config with fallbacks for common field names
        var valueField = this._config.dataValueField || 'id';
        var labelField = this._config.dataFieldText || 'title';
        if (this._config.debug)
            console.log("Mapping fields: value=".concat(valueField, ", label=").concat(labelField));
        if (this._config.debug)
            console.log('Item data:', JSON.stringify(item).substring(0, 200) + '...'); // Trimmed for readability
        // Extract values using improved getValue function
        var getValue = function (obj, path) {
            if (!path || !obj)
                return null;
            try {
                // Handle dot notation to access nested properties
                var parts = path.split('.');
                var result_1 = obj;
                for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
                    var part = parts_2[_i];
                    if (result_1 === null || result_1 === undefined || typeof result_1 !== 'object') {
                        return null;
                    }
                    result_1 = result_1[part];
                }
                // Log the extraction result
                if (_this._config.debug)
                    console.log("Extracted [".concat(path, "] => ").concat(result_1 !== null && result_1 !== undefined
                        ? typeof result_1 === 'object'
                            ? JSON.stringify(result_1).substring(0, 50)
                            : String(result_1).substring(0, 50)
                        : 'null'));
                return result_1;
            }
            catch (error) {
                console.error("Error extracting path ".concat(path, ":"), error);
                return null;
            }
        };
        // Get ID and ensure it's a string
        var id = getValue(item, valueField);
        if (id === null || id === undefined) {
            // Try common fallback fields for ID
            var fallbackFields = ['id', 'value', 'key', 'pk'];
            for (var _i = 0, fallbackFields_1 = fallbackFields; _i < fallbackFields_1.length; _i++) {
                var field = fallbackFields_1[_i];
                if (item[field] !== null && item[field] !== undefined) {
                    id = String(item[field]);
                    if (this._config.debug)
                        console.log("Using fallback field '".concat(field, "' for ID: ").concat(id));
                    break;
                }
            }
        }
        else {
            id = String(id);
        }
        // If still no ID, generate one
        if (!id) {
            id = "option-".concat(Math.random().toString(36).substr(2, 9));
            if (this._config.debug)
                console.log("Generated fallback ID: ".concat(id));
        }
        // Get label with proper fallbacks
        var title = getValue(item, labelField);
        if (!title) {
            // Try common fallback fields for title
            var fallbackFields = ['name', 'title', 'label', 'text', 'displayName', 'description'];
            for (var _a = 0, fallbackFields_2 = fallbackFields; _a < fallbackFields_2.length; _a++) {
                var field = fallbackFields_2[_a];
                if (item[field] !== null && item[field] !== undefined) {
                    title = String(item[field]);
                    if (this._config.debug)
                        console.log("Using fallback field '".concat(field, "' for title: ").concat(title));
                    break;
                }
            }
        }
        else {
            title = String(title);
        }
        // If still no title, use ID as fallback
        if (!title) {
            title = "Option ".concat(id);
            if (this._config.debug)
                console.log("Using ID as fallback title: ".concat(title));
        }
        // Create the option object with consistent structure
        var result = {
            id: id,
            title: title,
            selected: Boolean(item.selected),
            disabled: Boolean(item.disabled)
        };
        if (this._config.debug)
            console.log('Final mapped item:', JSON.stringify(result));
        return result;
    };
    /**
     * Load the next page of results
     * @returns Promise with fetched items
     */
    KTSelectRemote.prototype.loadNextPage = function () {
        if (this._currentPage < this._totalPages) {
            return this.fetchData(this._lastQuery, this._currentPage + 1);
        }
        return Promise.resolve([]);
    };
    /**
     * Check if there are more pages available
     * @returns Boolean indicating if more pages exist
     */
    KTSelectRemote.prototype.hasMorePages = function () {
        return this._currentPage < this._totalPages;
    };
    /**
     * Get loading state
     * @returns Boolean indicating if data is loading
     */
    KTSelectRemote.prototype.isLoading = function () {
        return this._isLoading;
    };
    /**
     * Get error state
     * @returns Boolean indicating if there was an error
     */
    KTSelectRemote.prototype.hasError = function () {
        return this._hasError;
    };
    /**
     * Get error message
     * @returns Error message
     */
    KTSelectRemote.prototype.getErrorMessage = function () {
        return this._errorMessage;
    };
    /**
     * Reset the remote data state
     */
    KTSelectRemote.prototype.reset = function () {
        this._isLoading = false;
        this._hasError = false;
        this._errorMessage = '';
        this._currentPage = 1;
        this._totalPages = 1;
        this._lastQuery = '';
    };
    /**
     * Set the select element for event dispatching
     * @param element The select element
     */
    KTSelectRemote.prototype.setElement = function (element) {
        this._element = element;
    };
    return KTSelectRemote;
}());
export { KTSelectRemote };
//# sourceMappingURL=remote.js.map