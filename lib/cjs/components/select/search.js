"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTSelectSearch = void 0;
var templates_1 = require("./templates");
var utils_1 = require("./utils");
var KTSelectSearch = /** @class */ (function () {
    function KTSelectSearch(select) {
        this._noResultsElement = null;
        this._originalOptionContents = new Map();
        this._select = select;
        this._searchInput = select.getSearchInput();
        this._eventManager = new utils_1.EventManager();
        this._focusManager = new utils_1.FocusManager(this._select.getDropdownElement(), '[data-kt-select-option]', select.getConfig());
        this.handleSearchInput = this._handleSearchInput.bind(this);
        this._config = select.getConfig();
        this._cacheOriginalOptionContents();
    }
    KTSelectSearch.prototype.init = function () {
        var _this = this;
        if (this._select.getConfig().enableSearch) {
            this._searchInput = this._select.getSearchInput();
            if (this._searchInput) {
                if (this._config.debug)
                    console.log('Initializing search module with input:', this._searchInput);
                // First remove any existing listeners to prevent duplicates
                this._removeEventListeners();
                // Add the input event listener for filtering
                this._eventManager.addListener(this._searchInput, 'input', this.handleSearchInput);
                // Add keydown event listener for navigation, selection, and escape
                this._eventManager.addListener(this._searchInput, 'keydown', this._handleSearchKeyDown.bind(this));
                // Add blur event listener to ensure highlights are cleared when focus is lost
                this._eventManager.addListener(this._searchInput, 'blur', function () {
                    // Small delay to prevent race conditions with selection
                    setTimeout(function () {
                        if (!_this._searchInput.value) {
                            _this._resetAllOptions();
                            _this.clearSearch();
                        }
                    }, 100);
                });
                // Listen for remote search events to coordinate with remote search functionality
                if (this._select.getConfig().remote &&
                    this._select.getConfig().searchParam) {
                    this._select
                        .getElement()
                        .addEventListener('remoteSearchStart', function () {
                        // Reset focused option when remote search starts
                        _this._focusManager.resetFocus();
                    });
                    this._select.getElement().addEventListener('remoteSearchEnd', function () {
                        // After remote search completes, refresh our option cache
                        _this.refreshOptionCache();
                    });
                }
                // Listen for dropdown close to reset options - ATTACH TO WRAPPER
                this._select
                    .getWrapperElement()
                    .addEventListener('dropdown.close', function () {
                    _this._focusManager.resetFocus();
                    // If clearSearchOnClose is false and there's a value, the search term and filtered state should persist.
                    // KTSelect's closeDropdown method already calls this._searchModule.clearSearch() (which clears highlights)
                    // and conditionally clears the input value based on KTSelect's config.clearSearchOnClose.
                    // This listener in search.ts seems to unconditionally clear everything.
                    // For now, keeping its original behavior:
                    _this.clearSearch(); // Clears highlights from current options
                    _this._searchInput.value = ''; // Clears the search input field
                    _this._resetAllOptions(); // Shows all options, restores original text, removes highlights
                    _this._clearNoResultsMessage(); // Clears any "no results" message
                });
                // Clear highlights when an option is selected - ATTACH TO ORIGINAL SELECT (standard 'change' event)
                this._select.getElement().addEventListener('change', function () {
                    _this.clearSearch();
                    // Close dropdown only for single select mode
                    // Keep dropdown open for multiple select mode to allow additional selections
                    if (!_this._select.getConfig().multiple) {
                        _this._select.closeDropdown();
                    }
                });
                // Consolidated 'dropdown.show' event listener - ATTACH TO WRAPPER
                this._select
                    .getWrapperElement()
                    .addEventListener('dropdown.show', function () {
                    var _a;
                    _this._focusManager.resetFocus(); // Always clear previous focus state
                    if ((_a = _this._searchInput) === null || _a === void 0 ? void 0 : _a.value) {
                        // If there's an existing search term:
                        // 1. Re-filter options. This ensures the display (hidden/visible) is correct
                        //    and "no results" message is handled if query yields nothing.
                        _this._filterOptions(_this._searchInput.value);
                    }
                    else {
                        // If search input is empty:
                        // 1. Reset all options to their full, unfiltered, original state.
                        _this._resetAllOptions(); // Shows all, clears highlights from options, restores original text
                        // 2. Clear any "no results" message.
                        _this._clearNoResultsMessage();
                    }
                    // Handle autofocus for the search input (this was one of the original separate listeners)
                    if (_this._select.getConfig().searchAutofocus) {
                        setTimeout(function () {
                            var _a;
                            (_a = _this._searchInput) === null || _a === void 0 ? void 0 : _a.focus(); // Focus search input
                        }, 50); // Delay to ensure dropdown is visible
                    }
                    _this._select.updateSelectAllButtonState();
                });
            }
        }
    };
    /**
     * Remove event listeners to prevent memory leaks or duplicates
     */
    KTSelectSearch.prototype._removeEventListeners = function () {
        if (this._searchInput) {
            this._eventManager.removeAllListeners(this._searchInput);
        }
    };
    /**
     * Handles keydown events on the search input for navigation and actions.
     */
    KTSelectSearch.prototype._handleSearchKeyDown = function (event) {
        var key = event.key;
        switch (key) {
            case ' ': // Spacebar
                // Do nothing, allow space to be typed into the input
                // Stop propagation to prevent parent handlers from processing this event
                event.stopPropagation();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this._focusManager.focusNext();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this._focusManager.focusPrevious();
                break;
            case 'Enter':
                event.preventDefault();
                // Always attempt to select the first available option in the list.
                // focusFirst() finds, focuses, and returns the first visible, non-disabled option.
                var firstAvailableOption = this._focusManager.focusFirst();
                if (firstAvailableOption) {
                    var optionValue = firstAvailableOption.getAttribute('data-value');
                    if (optionValue) {
                        this._select.toggleSelection(optionValue);
                        // KTSelect.toggleSelection handles closing the dropdown based on config.closeOnSelect and config.multiple
                    }
                }
                break;
            case 'Escape':
                event.preventDefault();
                this._searchInput.value = '';
                this.clearSearch();
                this._resetAllOptions();
                this._clearNoResultsMessage();
                this._focusManager.focusFirst();
                break;
            default:
                break;
        }
    };
    /**
     * Store original HTML content of all options for later restoration
     * This prevents losing formatting when clearing search
     */
    KTSelectSearch.prototype._cacheOriginalOptionContents = function () {
        var _this = this;
        // Wait for options to be initialized
        setTimeout(function () {
            _this._originalOptionContents.clear(); // Clear before re-caching
            var options = Array.from(_this._select.getOptionsElement());
            options.forEach(function (option) {
                var value = option.getAttribute('data-value');
                if (value) {
                    // Store the full innerHTML as the original content
                    _this._originalOptionContents.set(value, option.innerHTML);
                }
            });
        }, 0);
    };
    /**
     * Restores the innerHTML of all options from the cache if they have been modified.
     * This is typically called before applying new filters/highlights.
     */
    KTSelectSearch.prototype._restoreOptionContentsBeforeFilter = function () {
        var _this = this;
        var options = Array.from(this._select.getOptionsElement());
        options.forEach(function (option) {
            var value = option.getAttribute('data-value');
            if (value && _this._originalOptionContents.has(value)) {
                var originalContent = _this._originalOptionContents.get(value);
                // Only restore if current content is different, to avoid unnecessary DOM manipulation
                if (option.innerHTML !== originalContent) {
                    option.innerHTML = originalContent;
                }
            }
        });
    };
    KTSelectSearch.prototype._handleSearchInput = function (event) {
        var query = event.target.value;
        var config = this._select.getConfig();
        // Reset focused option when search changes
        this._focusManager.resetFocus();
        // Restore original content for all options before filtering/highlighting again
        this._restoreOptionContentsBeforeFilter();
        if (query.trim() === '') {
            this._resetAllOptions();
            this._focusManager.focusFirst(); // Focus first option when search is cleared
            return;
        }
        // For remote search, KTSelect component handles it.
        // KTSelect will call refreshAfterSearch on this module when remote data is updated.
        if (config.remote && config.searchParam) {
            if (query.length < config.searchMinLength) {
                this._resetAllOptions();
                this._clearNoResultsMessage();
                this._focusManager.focusFirst(); // Focus first if query too short
            }
            return;
        }
        // For local search
        if (query.length >= config.searchMinLength) {
            this._filterOptions(query);
            this._focusManager.focusFirst(); // Focus first visible option after local filtering
        }
        else {
            this._resetAllOptions();
            this._clearNoResultsMessage();
            this._focusManager.focusFirst(); // Focus first if query too short and not remote
        }
    };
    KTSelectSearch.prototype._filterOptions = function (query) {
        var _this = this;
        var options = Array.from(this._select.getOptionsElement());
        var config = this._select.getConfig();
        var dropdownElement = this._select.getDropdownElement();
        // Cache original option HTML if not already cached
        if (this._originalOptionContents.size === 0) {
            this._cacheOriginalOptionContents();
        }
        // Restore original content before filtering, so highlighting is applied fresh.
        this._restoreOptionContentsBeforeFilter();
        var visibleCount = (0, utils_1.filterOptions)(options, query, config, dropdownElement, function (count) { return _this._handleNoResults(count); });
        this._select.updateSelectAllButtonState();
    };
    /**
     * Reset all options to their original state
     */
    KTSelectSearch.prototype._resetAllOptions = function () {
        var _this = this;
        // Show all options
        var options = Array.from(this._select.getOptionsElement());
        // Ensure the cache is populated if it's somehow empty here
        if (this._originalOptionContents.size === 0) {
            this._cacheOriginalOptionContents();
        }
        options.forEach(function (option) {
            option.classList.remove('hidden');
            if (option.style.display === 'none')
                option.style.display = ''; // Ensure visible
            // Restore original HTML content (remove highlights)
            var value = option.getAttribute('data-value');
            if (value && _this._originalOptionContents.has(value)) {
                var originalContent = _this._originalOptionContents.get(value);
                // Only update if different, to minimize DOM changes
                if (option.innerHTML !== originalContent) {
                    option.innerHTML = originalContent;
                }
            }
        });
        this._clearNoResultsMessage(); // Ensure no results message is cleared when resetting
        this._select.updateSelectAllButtonState();
    };
    KTSelectSearch.prototype._handleNoResults = function (visibleOptionsCount) {
        var _a, _b;
        if (visibleOptionsCount === 0 && ((_b = (_a = this._searchInput) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim()) !== '') {
            this._showNoResultsMessage();
        }
        else {
            this._clearNoResultsMessage();
        }
    };
    KTSelectSearch.prototype._showNoResultsMessage = function () {
        this._clearNoResultsMessage();
        var config = this._select.getConfig();
        this._noResultsElement = templates_1.defaultTemplates.searchEmpty(config);
        var dropdownElement = this._select.getDropdownElement();
        var optionsContainer = dropdownElement.querySelector('[data-kt-select-options]');
        if (optionsContainer) {
            optionsContainer.appendChild(this._noResultsElement);
        }
        else {
            dropdownElement.appendChild(this._noResultsElement);
        }
    };
    KTSelectSearch.prototype._clearNoResultsMessage = function () {
        if (this._noResultsElement && this._noResultsElement.parentNode) {
            this._noResultsElement.parentNode.removeChild(this._noResultsElement);
            this._noResultsElement = null;
        }
    };
    /**
     * Public method to explicitly clear all search highlights
     * This is called when search is reset or selection changes
     */
    KTSelectSearch.prototype.clearSearch = function () {
        var _this = this;
        // Restore original option content (removes highlighting)
        var optionsToClear = Array.from(this._select.getOptionsElement());
        // Ensure cache is available
        if (this._originalOptionContents.size === 0 && optionsToClear.length > 0) {
            this._cacheOriginalOptionContents();
        }
        optionsToClear.forEach(function (option) {
            var value = option.getAttribute('data-value');
            if (value && _this._originalOptionContents.has(value)) {
                var originalContent = _this._originalOptionContents.get(value);
                // Only restore if different
                if (option.innerHTML !== originalContent) {
                    option.innerHTML = originalContent;
                }
            }
        });
    };
    /**
     * This ensures that search highlighting works correctly with new options
     */
    KTSelectSearch.prototype.refreshOptionCache = function () {
        var _this = this;
        // Re-cache all option contents
        this._originalOptionContents.clear();
        var currentOptions = Array.from(this._select.getOptionsElement());
        currentOptions.forEach(function (option) {
            var value = option.getAttribute('data-value');
            if (value) {
                _this._originalOptionContents.set(value, option.innerHTML);
            }
        });
    };
    /**
     * Called after search (local or remote via KTSelect) to reset focus.
     */
    KTSelectSearch.prototype.refreshAfterSearch = function () {
        this._focusManager.resetFocus();
        this._focusManager.focusFirst();
        // Re-cache original contents as options might have changed (especially after remote search)
        this.refreshOptionCache();
    };
    /**
     * Clean up all resources used by the search module
     */
    KTSelectSearch.prototype.destroy = function () {
        // Remove all event listeners
        this._removeEventListeners();
        // Clear all references
        if (this._focusManager) {
            this._focusManager.dispose();
        }
        // Clear cached content
        this._originalOptionContents.clear();
        // Clear highlight elements
        this.clearSearch();
    };
    return KTSelectSearch;
}());
exports.KTSelectSearch = KTSelectSearch;
//# sourceMappingURL=search.js.map