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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTSelectState, } from './config';
import { KTSelectOption } from './option';
import { KTSelectRemote } from './remote';
import { KTSelectSearch } from './search';
import { defaultTemplates } from './templates';
import { KTSelectCombobox } from './combobox';
import { KTSelectDropdown } from './dropdown';
import { FocusManager, EventManager, renderTemplateString, TypeToSearchBuffer, } from './utils';
import { KTSelectTags } from './tags';
var KTSelect = /** @class */ (function (_super) {
    __extends(KTSelect, _super);
    /**
     * Constructor: Initializes the select component
     */
    function KTSelect(element, config) {
        var _this = _super.call(this) || this;
        // Core properties
        _this._name = 'select';
        _this._dataOptionPrefix = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
        // Cached DOM references for performance
        _this._optionsContainer = null;
        // State
        _this._dropdownIsOpen = false;
        _this._comboboxModule = null;
        _this._tagsModule = null;
        _this._dropdownModule = null;
        _this._loadMoreIndicator = null;
        _this._selectAllButton = null;
        _this._selectAllButtonToggle = null;
        _this._typeToSearchBuffer = new TypeToSearchBuffer();
        _this._mutationObserver = null;
        _this._preSelectedValues = [];
        // Search debounce timeout
        _this._searchDebounceTimeout = null;
        // Store original options HTML for restoring after search
        _this._originalOptionsHtml = null;
        if (KTData.has(element, _this._name)) {
            return _this;
        }
        _this._init(element);
        _this._buildConfig(config);
        _this._state = new KTSelectState(_this._config);
        _this._config = _this._state.getConfig();
        element.instance = _this;
        // Initialize event manager
        _this._eventManager = new EventManager();
        // Initialize remote module if remote data is enabled
        if (_this._config.remote) {
            _this._remoteModule = new KTSelectRemote(_this._config, _this._element);
            _this._initializeRemoteData();
        }
        else {
            _this._state
                .setItems()
                .then(function () {
                if (_this._config.debug)
                    console.log('Setting up component after remote data is loaded');
                _this._setupComponent();
            })
                .catch(function (error) {
                console.error('Error setting items:', error);
                // Handle the error, e.g., display an error message to the user
            });
        }
        return _this;
    }
    /**
     * Set global select configuration options.
     * This allows setting default configuration that will be applied to all new KTSelect instances.
     * @param options Partial select config to merge with global config.
     * @example
     * KTSelect.config({
     *   enableSearch: true,
     *   searchPlaceholder: 'Type to search...',
     *   dropdownZindex: 9999,
     *   height: 300
     * });
     */
    KTSelect.config = function (options) {
        this.globalConfig = __assign(__assign({}, this.globalConfig), options);
    };
    /**
     * Override _buildConfig to include static globalConfig in the merge chain
     */
    KTSelect.prototype._buildConfig = function (config) {
        if (config === void 0) { config = {}; }
        if (!this._element)
            return;
        // Cast to writable to allow assignment (config is readonly but needs initialization)
        this._config = __assign(__assign(__assign(__assign(__assign({}, this._defaultConfig), KTSelect.globalConfig), this._getGlobalConfig()), KTDom.getDataAttributes(this._element, this._dataOptionPrefix + this._name)), config);
    };
    /**
     * Initialize remote data fetching
     */
    KTSelect.prototype._initializeRemoteData = function () {
        var _this = this;
        if (!this._remoteModule || !this._config.remote)
            return;
        if (this._config.debug)
            console.log('Initializing remote data with URL:', this._config.dataUrl);
        // For remote data, we need to create the HTML structure first
        // so that the component can be properly initialized
        this._createHtmlStructure();
        this._setupElementReferences();
        // Show loading state
        this._renderLoadingState();
        // Fetch remote data
        this._remoteModule
            .fetchData()
            .then(function (items) {
            if (_this._config.debug)
                console.log('Remote data fetched:', items);
            // Remove placeholder/loading options before setting new items
            _this._clearExistingOptions();
            // Update state with fetched items
            _this._state
                .setItems(items)
                .then(function () {
                // Generate options from the fetched data
                _this._generateOptionsHtml(_this._element);
                if (_this._config.debug)
                    console.log('Generating options HTML from remote data');
                // Update the dropdown to show the new options
                _this._updateDropdownWithNewOptions();
                // Complete the component setup with the fetched data
                _this._completeRemoteSetup();
                // Add pagination "Load More" button if needed
                if (_this._config.pagination && _this._remoteModule.hasMorePages()) {
                    _this._addLoadMoreButton();
                }
            })
                .catch(function (error) {
                console.error('Error setting items:', error);
                _this._renderErrorState(error.message || 'Failed to load data');
            });
        })
            .catch(function (error) {
            console.error('Error fetching remote data:', error);
            _this._renderErrorState(_this._remoteModule.getErrorMessage() || 'Failed to load data');
        });
    };
    /**
     * Clear existing options from the select element
     */
    KTSelect.prototype._clearExistingOptions = function () {
        // Capture pre-selected values before clearing (for remote data)
        var selectedOptions = Array.from(this._element.querySelectorAll('option[selected]:not([value=""])'));
        if (selectedOptions.length > 0) {
            this._preSelectedValues = selectedOptions.map(function (opt) { return opt.value; });
            if (this._config.debug) {
                console.log('Captured pre-selected values before clearing:', this._preSelectedValues);
            }
        }
        // Keep only the empty/placeholder option and remove the rest
        var options = Array.from(this._element.querySelectorAll('option:not([value=""])'));
        options.forEach(function (option) { return option.remove(); });
    };
    /**
     * Unified method to render options in dropdown - eliminates code duplication
     */
    KTSelect.prototype._renderOptionsInDropdown = function (optionsData, clearContainer) {
        var _this = this;
        if (clearContainer === void 0) { clearContainer = true; }
        if (!this._dropdownContentElement)
            return;
        // Use cached options container for better performance
        var optionsContainer = this._optionsContainer ||
            this._dropdownContentElement.querySelector('[data-kt-select-options]');
        if (!optionsContainer)
            return;
        // Clear container if requested
        if (clearContainer) {
            optionsContainer.innerHTML = '';
        }
        // Use DocumentFragment for efficient DOM manipulation
        var fragment = document.createDocumentFragment();
        // Process options data
        optionsData.forEach(function (optionData) {
            var optionElement;
            // Handle different input types
            if (optionData instanceof HTMLOptionElement) {
                // Skip empty placeholder options
                if (optionData.value === '' && optionData.textContent.trim() === '') {
                    return;
                }
                optionElement = optionData;
            }
            else {
                // Handle KTSelectOptionData objects - cast to ensure type safety
                var dataItem = optionData;
                optionElement = document.createElement('option');
                optionElement.value = dataItem.id || '';
                optionElement.textContent = dataItem.title || '';
                if (dataItem.selected) {
                    optionElement.setAttribute('selected', 'selected');
                }
                if (dataItem.disabled) {
                    optionElement.setAttribute('disabled', 'disabled');
                }
            }
            // Create KTSelectOption instance for proper rendering
            var selectOption = new KTSelectOption(optionElement, _this._config);
            var renderedOption = selectOption.render();
            // Add to fragment for batch DOM operation
            fragment.appendChild(renderedOption);
        });
        // Batch append all options at once
        optionsContainer.appendChild(fragment);
        // Update options NodeList
        this._options = this._dropdownContentElement.querySelectorAll('[data-kt-select-option]');
        if (this._config.debug) {
            console.log("Rendered ".concat(optionsData.length, " options in dropdown"));
        }
    };
    /**
     * Update dropdown with new options from the original select element
     */
    KTSelect.prototype._updateDropdownWithNewOptions = function () {
        // Get all options from the original select element
        var options = Array.from(this._element.querySelectorAll('option'));
        // Use unified renderer
        this._renderOptionsInDropdown(options, true);
    };
    /**
     * Complete the setup for remote data after HTML structure is created
     */
    KTSelect.prototype._completeRemoteSetup = function () {
        // Initialize options
        this._preSelectOptions(this._element);
        // Apply pre-selected values captured before remote data was loaded
        if (this._preSelectedValues.length > 0) {
            if (this._config.debug) {
                console.log('Applying pre-selected values after remote data loaded:', this._preSelectedValues);
            }
            // Get all available option values from the loaded remote data
            var availableValues_1 = Array.from(this._element.querySelectorAll('option')).map(function (opt) { return opt.value; });
            // Filter pre-selected values to only those that exist in remote data
            var validPreSelectedValues = this._preSelectedValues.filter(function (value) {
                return availableValues_1.includes(value);
            });
            if (validPreSelectedValues.length > 0) {
                // For single-select mode, only use the first value
                var valuesToSelect = this._config.multiple
                    ? validPreSelectedValues
                    : [validPreSelectedValues[0]];
                if (this._config.debug) {
                    console.log('Selecting matched values:', valuesToSelect);
                }
                // Get any existing selections from _preSelectOptions (e.g., data-kt-select-pre-selected)
                var existingSelections = this._state.getSelectedOptions();
                // Merge existing selections with native pre-selected values (no duplicates)
                var allSelections_1 = this._config.multiple
                    ? Array.from(new Set(__spreadArray(__spreadArray([], existingSelections, true), valuesToSelect, true)))
                    : valuesToSelect;
                // Set all selections at once to avoid toggling issues
                this._state.setSelectedOptions(allSelections_1);
                // Update the native select element to match
                Array.from(this._element.querySelectorAll('option')).forEach(function (opt) {
                    opt.selected = allSelections_1.includes(opt.value);
                });
                // Update the visual display
                this.updateSelectedOptionDisplay();
                this._updateSelectedOptionClass();
            }
            else if (this._config.debug) {
                console.log('None of the pre-selected values matched remote data:', this._preSelectedValues);
            }
            // Clear the pre-selected values array after processing
            this._preSelectedValues = [];
        }
        // Apply disabled state if needed
        this._applyInitialDisabledState();
        // Initialize search if enabled
        if (this._config.enableSearch) {
            this._initializeSearchModule();
        }
        // Initialize combobox if enabled
        if (this._config.combobox) {
            this._comboboxModule = new KTSelectCombobox(this);
        }
        // Initialize tags if enabled
        if (this._config.tags) {
            this._tagsModule = new KTSelectTags(this);
        }
        // Initialize focus manager after dropdown element is created
        this._focusManager = new FocusManager(this._dropdownContentElement, '[data-kt-select-option]', this._config);
        // Initialize dropdown module after all elements are created
        this._dropdownModule = new KTSelectDropdown(this._wrapperElement, this._displayElement, this._dropdownContentElement, this._config, this);
        // Update display and set ARIA attributes
        this._updateDisplayAndAriaAttributes();
        this.updateSelectedOptionDisplay();
        this._setAriaAttributes();
        // Update select all button state
        this.updateSelectAllButtonState();
        // Focus the first selected option or first option if nothing selected
        this._focusSelectedOption();
        // Attach event listeners after all modules are initialized
        this._attachEventListeners();
        this._observeNativeSelect();
    };
    /**
     * Helper to show a dropdown message (error, loading, noResults)
     */
    KTSelect.prototype._showDropdownMessage = function (type, message) {
        if (!this._dropdownContentElement)
            return;
        var optionsContainer = this._dropdownContentElement.querySelector('[data-kt-select-options]');
        if (!optionsContainer)
            return;
        // Clear previous messages
        optionsContainer.innerHTML = '';
        switch (type) {
            case 'error':
                optionsContainer.appendChild(defaultTemplates.error(__assign(__assign({}, this._config), { errorMessage: message })));
                break;
            case 'loading':
                optionsContainer.appendChild(defaultTemplates.loading(this._config, message || 'Loading...'));
                break;
            case 'empty':
                optionsContainer.appendChild(defaultTemplates.searchEmpty(this._config));
                break;
        }
    };
    /**
     * Render loading state in dropdown
     */
    KTSelect.prototype._renderLoadingState = function () {
        if (this._element.querySelectorAll('option').length <= 1) {
            var existingLoadingOptions = this._element.querySelectorAll('option[disabled][selected][value=""]');
            existingLoadingOptions.forEach(function (option) { return option.remove(); });
            this._showDropdownMessage('loading', 'Loading options...');
        }
    };
    /**
     * Render error state
     * @param message Error message
     */
    KTSelect.prototype._renderErrorState = function (message) {
        // If dropdown is already created, show error message there
        this._showDropdownMessage('error', message);
        if (!this._wrapperElement) {
            if (this._config.debug)
                console.log('Setting up component after error');
            this._setupComponent();
        }
    };
    /**
     * Add "Load More" button for pagination
     */
    KTSelect.prototype._addLoadMoreButton = function () {
        if (!this._dropdownContentElement || !this._config.pagination)
            return;
        // Remove existing button if any
        if (this._loadMoreIndicator) {
            this._loadMoreIndicator.remove();
            this._loadMoreIndicator = null;
        }
        // Create load more button using template
        this._loadMoreIndicator = defaultTemplates.loadMore(this._config);
        // Add to dropdown
        var optionsContainer = this._dropdownContentElement.querySelector('[data-kt-select-options]');
        if (optionsContainer) {
            optionsContainer.appendChild(this._loadMoreIndicator);
        }
        else {
            this._dropdownContentElement.appendChild(this._loadMoreIndicator);
        }
        // Add event listener
        this._loadMoreIndicator.addEventListener('click', this._handleLoadMore.bind(this));
    };
    /**
     * Handle load more button click
     */
    KTSelect.prototype._handleLoadMore = function () {
        var _this = this;
        if (!this._remoteModule || !this._config.pagination)
            return;
        // Show loading state
        if (this._loadMoreIndicator) {
            this._loadMoreIndicator.textContent = 'Loading...';
        }
        // Fetch next page
        this._remoteModule
            .loadNextPage()
            .then(function (newItems) {
            // Get existing items
            var existingItems = _this._state.getItems();
            // Combine new items with existing items
            _this._state
                .setItems(__spreadArray(__spreadArray([], existingItems, true), newItems, true))
                .then(function () {
                // Update options in the dropdown
                _this._updateOptionsInDropdown(newItems);
                // Check if there are more pages
                if (_this._remoteModule.hasMorePages()) {
                    // Reset load more button
                    if (_this._loadMoreIndicator) {
                        _this._loadMoreIndicator.textContent =
                            _this._config.loadMoreText || 'Load more...';
                    }
                }
                else {
                    // Remove load more button if no more pages
                    if (_this._loadMoreIndicator) {
                        _this._loadMoreIndicator.remove();
                        _this._loadMoreIndicator = null;
                    }
                }
            })
                .catch(function (error) {
                console.error('Error updating items:', error);
                // Reset load more button
                if (_this._loadMoreIndicator) {
                    _this._loadMoreIndicator.textContent = 'Error loading more items';
                }
            });
        })
            .catch(function (error) {
            console.error('Error loading more items:', error);
            // Reset load more button
            if (_this._loadMoreIndicator) {
                _this._loadMoreIndicator.textContent = 'Error loading more items';
            }
        });
    };
    /**
     * Update options in the dropdown
     * @param newItems New items to add to the dropdown
     */
    KTSelect.prototype._updateOptionsInDropdown = function (newItems) {
        if (!this._dropdownContentElement || !newItems.length)
            return;
        var optionsContainer = this._dropdownContentElement.querySelector("[data-kt-select-options]");
        if (!optionsContainer)
            return;
        // Get the load more button
        var loadMoreButton = optionsContainer.querySelector("[data-kt-select-load-more]");
        // Process each new item
        newItems.forEach(function (item) {
            // Create option for the original select
            var selectOption = document.createElement('option');
            selectOption.value = item.id || '';
            // Add to dropdown container
            if (loadMoreButton) {
                // Insert before the load more button
                optionsContainer.insertBefore(selectOption, loadMoreButton);
            }
            else {
                // Append to the end
                optionsContainer.appendChild(selectOption);
            }
        });
        // Update options NodeList to include the new options
        this._options = this._dropdownContentElement.querySelectorAll("[data-kt-select-option]");
        if (this._config.debug)
            console.log("Added ".concat(newItems.length, " more options to dropdown"));
    };
    /**
     * ========================================================================
     * INITIALIZATION METHODS
     * ========================================================================
     */
    /**
     * Set up the component after everything is initialized
     */
    KTSelect.prototype._setupComponent = function () {
        // Setup HTML structure
        this._createHtmlStructure();
        this._setupElementReferences();
        // Initialize options
        this._preSelectOptions(this._element);
        // Apply disabled state if needed
        this._applyInitialDisabledState();
        // Initialize search if enabled
        if (this._config.enableSearch) {
            this._initializeSearchModule();
        }
        // Initialize combobox if enabled
        if (this._config.combobox) {
            this._comboboxModule = new KTSelectCombobox(this);
        }
        // Initialize tags if enabled
        if (this._config.tags) {
            this._tagsModule = new KTSelectTags(this);
        }
        // Initialize focus manager after dropdown element is created
        this._focusManager = new FocusManager(this._dropdownContentElement, '[data-kt-select-option]', this._config);
        // Initialize dropdown module after all elements are created
        this._dropdownModule = new KTSelectDropdown(this._wrapperElement, this._displayElement, this._dropdownContentElement, this._config, this);
        // Update display and set ARIA attributes
        this._updateDisplayAndAriaAttributes();
        this.updateSelectedOptionDisplay();
        this._setAriaAttributes();
        // Update select all button state
        this.updateSelectAllButtonState();
        // Focus the first selected option or first option if nothing selected
        this._focusSelectedOption();
        // Attach event listeners after all modules are initialized
        this._attachEventListeners();
        this._observeNativeSelect();
    };
    /**
     * Creates the HTML structure for the select component
     */
    KTSelect.prototype._createHtmlStructure = function () {
        var _a, _b;
        var _this = this;
        var options = Array.from(this._element.querySelectorAll('option'));
        // Create wrapper and display elements
        var wrapperElement = defaultTemplates.wrapper(this._config);
        var displayElement = defaultTemplates.display(this._config);
        // Add the display element to the wrapper
        wrapperElement.appendChild(displayElement);
        // Move classes from original select to wrapper and display elements
        if (this._element.classList.length > 0) {
            var originalClasses = Array.from(this._element.classList);
            var displaySpecificClasses_1 = [
                'kt-select',
                'kt-select-sm',
                'kt-select-lg',
            ];
            var classesForWrapper = originalClasses.filter(function (className) { return !displaySpecificClasses_1.includes(className); });
            if (classesForWrapper.length > 0) {
                (_a = wrapperElement.classList).add.apply(_a, classesForWrapper);
            }
            // Move display-specific classes to display element
            var classesForDisplay = originalClasses.filter(function (className) {
                return displaySpecificClasses_1.includes(className);
            });
            if (classesForDisplay.length > 0) {
                (_b = displayElement.classList).add.apply(_b, classesForDisplay);
            }
            this._element.className = ''; // Clear classes from original select element
        }
        // Create an empty dropdown first (without options) using template
        var dropdownElement = defaultTemplates.dropdown(__assign(__assign({}, this._config), { zindex: this._config.dropdownZindex }));
        // Add search input if needed
        if (this._config.enableSearch) {
            var searchElement = defaultTemplates.search(this._config);
            dropdownElement.appendChild(searchElement);
        }
        // Add select all button if needed
        if (this._config.multiple && this._config.enableSelectAll) {
            var selectAllElement = defaultTemplates.selectAll(this._config);
            dropdownElement.appendChild(selectAllElement);
        }
        // Create options container using template
        var optionsContainer = defaultTemplates.options(this._config);
        // Add each option directly to the container (only if options exist)
        options.forEach(function (optionElement) {
            // Skip empty placeholder options (only if BOTH value AND text are empty)
            // This allows options with empty value but visible text to display in dropdown
            if (optionElement.value === '' &&
                optionElement.textContent.trim() === '') {
                return;
            }
            // Create new KTSelectOption instance for each option
            var selectOption = new KTSelectOption(optionElement, _this._config);
            var renderedOption = selectOption.render();
            // Append directly to options container
            optionsContainer.appendChild(renderedOption);
        });
        // Add options container to dropdown
        dropdownElement.appendChild(optionsContainer);
        // Add dropdown to wrapper
        wrapperElement.appendChild(dropdownElement);
        // Insert after the original element
        this._element.after(wrapperElement);
        this._element.classList.add('hidden');
    };
    /**
     * Setup all element references after DOM is created
     */
    KTSelect.prototype._setupElementReferences = function () {
        this._wrapperElement = this._element.nextElementSibling;
        // Safety check - ensure wrapper element exists
        if (!this._wrapperElement) {
            console.error('KTSelect: Wrapper element not found. HTML structure may not be created properly.');
            return;
        }
        // Get display element
        this._displayElement = this._wrapperElement.querySelector("[data-kt-select-display]");
        // Get dropdown content element - this is critical for dropdown functionality
        this._dropdownContentElement = this._wrapperElement.querySelector("[data-kt-select-dropdown]");
        if (!this._dropdownContentElement) {
            console.error('KTSelect: Dropdown content element not found', this._wrapperElement);
            return;
        }
        // Get search input element - this is used for the search functionality
        this._searchInputElement = this._dropdownContentElement.querySelector("[data-kt-select-search]");
        // If not found in dropdown, check if it's the display element itself
        if (!this._searchInputElement) {
            this._searchInputElement = this._displayElement;
        }
        this._selectAllButton = this._wrapperElement.querySelector('[data-kt-select-select-all]');
        // Cache the options container for performance
        this._optionsContainer = this._dropdownContentElement.querySelector('[data-kt-select-options]');
        this._options = this._dropdownContentElement.querySelectorAll("[data-kt-select-option]");
    };
    /**
     * Attach all event listeners to elements
     */
    KTSelect.prototype._attachEventListeners = function () {
        // Document level event listeners
        document.addEventListener('click', this._handleDocumentClick.bind(this));
        // Dropdown option click events
        this._eventManager.addListener(this._dropdownContentElement, 'click', this._handleDropdownOptionClick.bind(this));
        if (this._selectAllButton) {
            this._selectAllButtonToggle =
                this._selectAllButton.querySelector('button');
            if (this._selectAllButtonToggle) {
                this._eventManager.addListener(this._selectAllButtonToggle, 'click', this._handleSelectAllClick.bind(this));
            }
        }
        // Attach centralized keyboard handler to the wrapper element.
        // Events from focusable children like _displayElement or _searchInputElement (if present) will bubble up.
        if (this._wrapperElement) {
            this._wrapperElement.addEventListener('keydown', this._handleKeyboardEvent.bind(this));
        }
    };
    /**
     * Initialize search module if search is enabled
     */
    KTSelect.prototype._initializeSearchModule = function () {
        if (this._config.enableSearch) {
            this._searchModule = new KTSelectSearch(this);
            this._searchModule.init();
            // If remote search is enabled, add event listener for search input
            if (this._config.remote &&
                this._config.searchParam &&
                this._searchInputElement) {
                this._searchInputElement.addEventListener('input', this._handleRemoteSearch.bind(this));
            }
        }
    };
    /**
     * Apply ARIA attributes and update display
     */
    KTSelect.prototype._updateDisplayAndAriaAttributes = function () {
        this.updateSelectedOptionDisplay();
        this._setAriaAttributes();
    };
    /**
     * Apply initial disabled state if configured
     */
    KTSelect.prototype._applyInitialDisabledState = function () {
        if (this._config.disabled) {
            this.getElement().classList.add('disabled');
            this.getElement().setAttribute('disabled', 'disabled');
            this._wrapperElement.classList.add('disabled');
        }
    };
    /**
     * Generate options HTML from data items
     */
    KTSelect.prototype._generateOptionsHtml = function (element) {
        var _this = this;
        var items = this._state.getItems() || [];
        if (this._config.debug)
            console.log("Generating options HTML from ".concat(items.length, " items"));
        // Only modify options if we have items to replace them with
        if (items && items.length > 0) {
            // Clear existing options except the first empty one
            var options = element.querySelectorAll('option:not(:first-child)');
            options.forEach(function (option) { return option.remove(); });
            // Generate options from data
            items.forEach(function (item) {
                var optionElement = document.createElement('option');
                // Get value - use item.id directly if available, otherwise try dataValueField
                var value = '';
                if (item.id !== undefined) {
                    value = String(item.id);
                }
                else if (_this._config.dataValueField) {
                    var extractedValue = _this._getValueByKey(item, _this._config.dataValueField);
                    value = extractedValue !== null ? String(extractedValue) : '';
                }
                // Get label - use item.title directly if available, otherwise try dataFieldText
                var label = '';
                if (item.title !== undefined) {
                    label = String(item.title);
                }
                else if (_this._config.dataFieldText) {
                    var extractedLabel = _this._getValueByKey(item, _this._config.dataFieldText);
                    label =
                        extractedLabel !== null ? String(extractedLabel) : 'Unnamed option';
                }
                // Log the extracted values for debugging
                if (_this._config.debug)
                    console.log("Option: value=".concat(value, ", label=").concat(label));
                // Set option attributes
                optionElement.value = value;
                optionElement.textContent = label || 'Unnamed option';
                if (item.selected) {
                    optionElement.setAttribute('selected', 'selected');
                }
                element.appendChild(optionElement);
            });
            if (this._config.debug)
                console.log("Added ".concat(items.length, " options to select element"));
        }
        else {
            if (this._config.debug)
                console.log('No items to generate options from');
        }
    };
    /**
     * Extract nested property value from object using dot notation
     */
    KTSelect.prototype._getValueByKey = function (obj, key) {
        if (!key || !obj)
            return null;
        // Use reduce to walk through the object by splitting the key on dots
        var result = key
            .split('.')
            .reduce(function (o, k) { return (o && o[k] !== undefined ? o[k] : null); }, obj);
        if (this._config.debug)
            console.log("Extracting [".concat(key, "] from object => ").concat(result !== null ? JSON.stringify(result) : 'null'));
        return result;
    };
    /**
     * Pre-select options that have the selected attribute
     */
    KTSelect.prototype._preSelectOptions = function (element) {
        var _this = this;
        // Handle options with selected attribute
        Array.from(element.querySelectorAll('option[selected]')).forEach(function (option) {
            var value = option.value;
            _this._selectOption(value);
        });
        // Handle data-kt-select-pre-selected attribute for React compatibility
        var preSelectedValues = element.getAttribute('data-kt-select-pre-selected');
        if (preSelectedValues) {
            var values = preSelectedValues.split(',').map(function (v) { return v.trim(); });
            values.forEach(function (value) {
                if (value) {
                    _this._selectOption(value);
                }
            });
        }
    };
    /**
     * ========================================================================
     * DROPDOWN MANAGEMENT
     * ========================================================================
     */
    /**
     * Open the dropdown
     */
    KTSelect.prototype.openDropdown = function () {
        if (this._config.disabled) {
            if (this._config.debug)
                console.log('openDropdown: select is disabled, not opening');
            return;
        }
        if (this._config.debug)
            console.log('openDropdown called, dropdownModule exists:', !!this._dropdownModule);
        if (!this._dropdownModule) {
            if (this._config.debug)
                console.log('Early return from openDropdown - module missing');
            return;
        }
        // Don't open dropdown if the select is disabled
        if (this._config.disabled) {
            if (this._config.debug)
                console.log('Early return from openDropdown - select is disabled');
            return;
        }
        if (this._config.debug)
            console.log('Opening dropdown via dropdownModule...');
        // Set our internal flag to match what we're doing
        this._dropdownIsOpen = true;
        // Open the dropdown via the module
        this._dropdownModule.open();
        // Dispatch custom event
        this._dispatchEvent('show');
        this._fireEvent('show');
        // Update ARIA states
        this._setAriaAttributes();
        // Update select all button state
        this.updateSelectAllButtonState();
        // Focus the first selected option or first option if nothing selected
        this._focusSelectedOption();
    };
    /**
     * Close the dropdown
     */
    KTSelect.prototype.closeDropdown = function () {
        if (this._config.debug)
            console.log('closeDropdown called, dropdownModule exists:', !!this._dropdownModule);
        // Only check if dropdown module exists, not dropdownIsOpen flag
        if (!this._dropdownModule) {
            if (this._config.debug)
                console.log('Early return from closeDropdown - module missing');
            return;
        }
        // Always close by delegating to the dropdown module, which is the source of truth
        if (this._config.debug)
            console.log('Closing dropdown via dropdownModule...');
        // Clear search input if the dropdown is closing
        if (this._searchModule && this._searchInputElement) {
            // Clear search input if configured to do so
            if (this._config.clearSearchOnClose) {
                this._searchInputElement.value = '';
            }
            // Clear search input when dropdown closes
            this._searchModule.clearSearch();
        }
        // Set our internal flag to match what we're doing
        this._dropdownIsOpen = false;
        // Call the dropdown module's close method
        this._dropdownModule.close();
        // Reset all focus states
        if (this._focusManager) {
            this._focusManager.resetFocus();
        }
        // Dispatch custom events
        this._dispatchEvent('close');
        this._fireEvent('close');
        // Update ARIA states
        this._setAriaAttributes();
        if (this._config.debug)
            console.log('closeDropdown complete');
    };
    /**
     * Update dropdown position
     */
    KTSelect.prototype.updateDropdownPosition = function () {
        if (this._dropdownModule) {
            this._dropdownModule.updatePosition();
        }
    };
    /**
     * Focus on the first selected option if any exists in the dropdown
     */
    KTSelect.prototype._focusSelectedOption = function () {
        // Get selected options
        var selectedOptions = this.getSelectedOptions();
        if (selectedOptions.length === 0)
            return;
        // Iterate through selected options and focus the first one that is visible
        for (var _i = 0, selectedOptions_1 = selectedOptions; _i < selectedOptions_1.length; _i++) {
            var value = selectedOptions_1[_i];
            if (this._focusManager && this._focusManager.focusOptionByValue(value)) {
                break; // Stop after focusing the first found selected and visible option
            }
        }
    };
    /**
     * ========================================================================
     * SELECTION MANAGEMENT
     * ========================================================================
     */
    /**
     * Select an option by value
     */
    KTSelect.prototype._selectOption = function (value) {
        // Prevent selection if the option is disabled (in dropdown or original select)
        if (this._isOptionDisabled(value)) {
            if (this._config.debug)
                console.log('_selectOption: Option is disabled, ignoring selection');
            return;
        }
        // Get current selection state
        var isSelected = this._state.isSelected(value);
        // Toggle selection in state
        if (this._config.multiple) {
            // Toggle in multiple mode
            this._state.toggleSelectedOptions(value);
        }
        else {
            // Set as only selection in single mode
            this._state.setSelectedOptions(value);
        }
        // Update the original select element's option selected state
        var optionEl = Array.from(this._element.querySelectorAll('option')).find(function (opt) { return opt.value === value; });
        if (optionEl) {
            if (this._config.multiple) {
                // Toggle the selection for multiple select
                optionEl.selected = !isSelected;
            }
            else {
                // Set as only selection for single select
                Array.from(this._element.querySelectorAll('option')).forEach(function (opt) {
                    opt.selected = opt.value === value;
                });
            }
        }
        // Update the visual display of selected options
        this.updateSelectedOptionDisplay();
        // Update option classes without re-rendering the dropdown content
        this._updateSelectedOptionClass();
        // Dispatch standard and custom change events
        this._dispatchEvent('change', {
            value: value,
            selected: !isSelected,
            selectedOptions: this.getSelectedOptions(),
        });
        this._fireEvent('change', {
            value: value,
            selected: !isSelected,
            selectedOptions: this.getSelectedOptions(),
        });
    };
    /**
     * Sync native select value attribute for FormData support
     */
    KTSelect.prototype._syncNativeSelectValue = function () {
        var selectedOptions = this.getSelectedOptions();
        if (this._config.multiple) {
            // For multiple select, the selected options are marked via option.selected
            // The native select's value property will return the first selected option's value
            // FormData will include all selected values automatically
        }
        else {
            // For single select, set the value attribute explicitly
            var selectedValue = selectedOptions.length > 0 ? selectedOptions[0] : '';
            this._element.value = selectedValue;
        }
    };
    /**
     * Update selected option display value
     */
    KTSelect.prototype.updateSelectedOptionDisplay = function () {
        var selectedOptions = this.getSelectedOptions();
        var tagsEnabled = this._config.tags && this._tagsModule;
        var valueDisplayEl = this.getValueDisplayElement();
        // Sync native select value for FormData support
        this._syncNativeSelectValue();
        if (tagsEnabled) {
            // Tags module will render tags if selectedOptions > 0, or clear them if selectedOptions === 0.
            this._tagsModule.updateTagsDisplay(selectedOptions);
        }
        // Guard against valueDisplayEl being null due to template modifications
        if (!valueDisplayEl) {
            if (this._config.debug) {
                console.warn('KTSelect: Value display element is null. Cannot update display or placeholder. Check template for [data-kt-select-value].');
            }
            return; // Nothing to display on if the element is missing
        }
        if (typeof this._config.renderSelected === 'function') {
            valueDisplayEl.innerHTML = this._config.renderSelected(selectedOptions);
        }
        else {
            if (selectedOptions.length === 0) {
                // No options selected: display placeholder.
                // This runs if tags are off, OR if tags are on but no items are selected (tags module would have cleared tags).
                var placeholderEl = defaultTemplates.placeholder(this._config);
                valueDisplayEl.replaceChildren(placeholderEl);
            }
            else {
                // Options are selected.
                if (tagsEnabled) {
                    // Tags are enabled AND options are selected: tags module has rendered them.
                    // Completely clear all content to avoid redundancy with tags
                    // Don't touch the innerHTML here as tags module manages it
                    // Just ensure no text content is generated
                    return; // Exit early to prevent any text generation
                }
                else {
                    // Tags are not enabled AND options are selected: render normal text display.
                    var content = '';
                    if (this._config.displayTemplate) {
                        content = this.renderDisplayTemplateForSelected(this.getSelectedOptions());
                    }
                    else {
                        content = this.getSelectedOptionsText();
                    }
                    valueDisplayEl.innerHTML = content;
                }
            }
        }
    };
    /**
     * Check if an option was originally disabled in the HTML
     */
    KTSelect.prototype._isOptionOriginallyDisabled = function (value) {
        var originalOption = Array.from(this._element.querySelectorAll('option')).find(function (opt) { return opt.value === value; });
        return originalOption ? originalOption.disabled : false;
    };
    /**
     * Update CSS classes for selected options
     */
    KTSelect.prototype._updateSelectedOptionClass = function () {
        var _this = this;
        var allOptions = this._dropdownContentElement.querySelectorAll("[data-kt-select-option]");
        var selectedValues = this._state.getSelectedOptions();
        var maxReached = typeof this._config.maxSelections === 'number' &&
            selectedValues.length >= this._config.maxSelections;
        if (this._config.debug)
            console.log('Updating selected classes for options, selected values:', selectedValues);
        allOptions.forEach(function (option) {
            var optionValue = option.getAttribute('data-value');
            if (!optionValue)
                return;
            var isSelected = selectedValues.includes(optionValue);
            var isOriginallyDisabled = _this._isOptionOriginallyDisabled(optionValue);
            if (isSelected) {
                option.classList.add('selected');
                option.setAttribute('aria-selected', 'true');
                // Selected options should not be visually hidden or disabled by maxSelections logic
                option.classList.remove('hidden');
                option.classList.remove('disabled');
                option.removeAttribute('aria-disabled');
            }
            else {
                option.classList.remove('selected');
                option.setAttribute('aria-selected', 'false');
                // An option should be disabled if it was originally disabled OR if maxSelections is reached
                if (isOriginallyDisabled || maxReached) {
                    option.classList.add('disabled');
                    option.setAttribute('aria-disabled', 'true');
                }
                else {
                    option.classList.remove('disabled');
                    option.removeAttribute('aria-disabled');
                }
            }
        });
    };
    /**
     * Clear all selected options
     */
    KTSelect.prototype.clearSelection = function () {
        // Clear the current selection
        this._state.setSelectedOptions([]);
        // Clear all native select options
        Array.from(this._element.querySelectorAll('option')).forEach(function (opt) {
            opt.selected = false;
        });
        // Clear native select value
        this._element.value = '';
        this.updateSelectedOptionDisplay();
        this._updateSelectedOptionClass();
        // Update select all button state
        this.updateSelectAllButtonState();
        // Dispatch change event
        this._dispatchEvent('change');
        this._fireEvent('change');
    };
    /**
     * Set selected options programmatically
     */
    KTSelect.prototype.setSelectedOptions = function (options) {
        var values = Array.from(options).map(function (option) { return option.value; });
        this._state.setSelectedOptions(values);
    };
    /**
     * Select the currently focused option
     */
    KTSelect.prototype.selectFocusedOption = function () {
        var _a, _b;
        var focusedOption = this._focusManager.getFocusedOption();
        if (focusedOption) {
            var selectedValue = focusedOption.dataset.value;
            // Extract just the title text, not including description
            var selectedText = '';
            var titleElement = focusedOption.querySelector('[data-kt-option-title]');
            if (titleElement) {
                // If it has a structured content with title element
                selectedText = ((_a = titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            }
            else {
                // Fallback to the whole text content
                selectedText = ((_b = focusedOption.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            }
            // First trigger the selection to ensure state is updated properly
            if (selectedValue) {
                this._selectOption(selectedValue);
            }
        }
    };
    /**
     * ========================================================================
     * EVENT HANDLERS
     * ========================================================================
     */
    /**
     * Handle click within the dropdown
     */
    KTSelect.prototype._handleDropdownOptionClick = function (event) {
        var optionElement = event.target.closest("[data-kt-select-option]");
        // If an option is clicked, handle the option click
        if (optionElement) {
            this._handleOptionClick(event);
        }
    };
    /**
     * Handle clicking on an option in the dropdown
     */
    KTSelect.prototype._handleOptionClick = function (event) {
        if (this._config.debug)
            console.log('_handleOptionClick called', event.target);
        event.preventDefault();
        event.stopPropagation();
        // Find the clicked option element
        var clickedOption = event.target.closest("[data-kt-select-option]");
        if (!clickedOption) {
            if (this._config.debug)
                console.log('No clicked option found');
            return;
        }
        // Check if the option is disabled
        if (clickedOption.getAttribute('aria-disabled') === 'true') {
            if (this._config.debug)
                console.log('Option is disabled, ignoring click');
            return;
        }
        // Use dataset.value to get the option value
        var optionValue = clickedOption.dataset.value;
        if (optionValue === undefined) {
            if (this._config.debug)
                console.log('Option value is undefined');
            return;
        }
        if (this._config.debug)
            console.log('Option clicked:', optionValue);
        // If in single-select mode and the clicked option is already selected, just close the dropdown.
        if (!this._config.multiple && this._state.isSelected(optionValue)) {
            if (this._config.debug)
                console.log('Single select mode: clicked already selected option. Closing dropdown.');
            this.closeDropdown();
            return;
        }
        // Use toggleSelection instead of _selectOption to prevent re-rendering
        this.toggleSelection(optionValue);
    };
    /**
     * Handle document click for closing dropdown
     */
    KTSelect.prototype._handleDocumentClick = function (event) {
        var targetElement = event.target;
        // Check if the click is outside the dropdown and the display element
        if (!this._wrapperElement.contains(targetElement)) {
            this.closeDropdown();
        }
    };
    /**
     * ========================================================================
     * ACCESSIBILITY METHODS
     * ========================================================================
     */
    /**
     * Set ARIA attributes for accessibility
     */
    KTSelect.prototype._setAriaAttributes = function () {
        this._displayElement.setAttribute('aria-expanded', this._dropdownIsOpen.toString());
    };
    /**
     * ========================================================================
     * PUBLIC API
     * ========================================================================
     */
    /**
     * Get the search input element
     */
    KTSelect.prototype.getSearchInput = function () {
        return this._searchInputElement;
    };
    /**
     * Get selected options
     */
    KTSelect.prototype.getSelectedOptions = function () {
        return this._state.getSelectedOptions();
    };
    /**
     * Get configuration
     */
    KTSelect.prototype.getConfig = function () {
        return this._config;
    };
    /**
     * Get option elements
     */
    KTSelect.prototype.getOptionsElement = function () {
        return this._options;
    };
    /**
     * Get dropdown element
     */
    KTSelect.prototype.getDropdownElement = function () {
        return this._dropdownContentElement;
    };
    /**
     * Get value display element
     */
    KTSelect.prototype.getValueDisplayElement = function () {
        return this._displayElement;
    };
    /**
     * Get wrapper element
     */
    KTSelect.prototype.getWrapperElement = function () {
        return this._wrapperElement;
    };
    /**
     * Show all options in the dropdown
     */
    KTSelect.prototype.showAllOptions = function () {
        // Get all options in the dropdown
        var options = Array.from(this._dropdownContentElement.querySelectorAll("[data-kt-select-option]"));
        // Show all options by removing the hidden class and any inline styles
        options.forEach(function (option) {
            var _a;
            // Remove hidden class
            option.classList.remove('hidden');
            // Clean up any existing inline styles for backward compatibility
            if (option.hasAttribute('style')) {
                var styleAttr = option.getAttribute('style');
                if (styleAttr.includes('display:')) {
                    // If style only contains display property, remove the entire attribute
                    if (styleAttr.trim() === 'display: none;' ||
                        styleAttr.trim() === 'display: block;') {
                        option.removeAttribute('style');
                    }
                    else {
                        // Otherwise, remove just the display property
                        option.setAttribute('style', (_a = styleAttr === null || styleAttr === void 0 ? void 0 : styleAttr.replace(/display:\s*[^;]+;?/gi, '')) === null || _a === void 0 ? void 0 : _a.trim());
                    }
                }
            }
        });
        // If search input exists, clear it
        if (this._searchInputElement) {
            this._searchInputElement.value = '';
            // If we have a search module, clear any search filtering
            if (this._searchModule) {
                this._searchModule.clearSearch();
            }
        }
    };
    /**
     * Toggle multi-select functionality
     */
    KTSelect.prototype.enableMultiSelect = function () {
        this._state.modifyConfig({ multiple: true });
    };
    /**
     * Disable multi-select functionality
     */
    KTSelect.prototype.disableMultiSelect = function () {
        this._state.modifyConfig({ multiple: false });
    };
    /**
     * Toggle the selection of an option
     */
    KTSelect.prototype.toggleSelection = function (value) {
        // Prevent selection if the option is disabled (in dropdown or original select)
        if (this._isOptionDisabled(value)) {
            if (this._config.debug)
                console.log('toggleSelection: Option is disabled, ignoring selection');
            return;
        }
        // Get current selection state
        var isSelected = this._state.isSelected(value);
        if (this._config.debug)
            console.log("toggleSelection called for value: ".concat(value, ", isSelected: ").concat(isSelected, ", multiple: ").concat(this._config.multiple));
        // If already selected in single select mode, do nothing (can't deselect in single select)
        if (isSelected && !this._config.multiple) {
            if (this._config.debug)
                console.log('Early return from toggleSelection - already selected in single select mode');
            return;
        }
        if (this._config.debug)
            console.log("Toggling selection for option: ".concat(value, ", currently selected: ").concat(isSelected));
        // Ensure any search input is cleared when selection changes
        if (this._searchModule) {
            this._searchModule.clearSearch();
        }
        // Toggle the selection in the state
        this._state.toggleSelectedOptions(value);
        // Update the original select element's option selected state
        var optionEl = Array.from(this._element.querySelectorAll('option')).find(function (opt) { return opt.value === value; });
        if (optionEl) {
            // For multiple select, toggle the 'selected' attribute
            if (this._config.multiple) {
                optionEl.selected = !isSelected;
            }
            else {
                // For single select, deselect all other options and select this one
                Array.from(this._element.querySelectorAll('option')).forEach(function (opt) {
                    opt.selected = opt.value === value;
                });
            }
        }
        // Update the display element value
        this.updateSelectedOptionDisplay();
        // Update option classes without re-rendering the dropdown content
        this._updateSelectedOptionClass();
        // For single select mode, always close the dropdown after selection
        // For multiple select mode, keep the dropdown open to allow multiple selections
        if (!this._config.multiple) {
            if (this._config.debug)
                console.log('About to call closeDropdown() for single select mode - always close after selection');
            this.closeDropdown();
        }
        else {
            if (this._config.debug)
                console.log('Multiple select mode - keeping dropdown open for additional selections');
            // Don't close dropdown in multiple select mode to allow multiple selections
            this.updateSelectAllButtonState();
        }
        // Dispatch custom change event with additional data
        this._dispatchEvent('change', {
            value: value,
            selected: !isSelected,
            selectedOptions: this.getSelectedOptions(),
        });
        this._fireEvent('change', {
            value: value,
            selected: !isSelected,
            selectedOptions: this.getSelectedOptions(),
        });
    };
    /**
     * Clean up all resources when the component is destroyed
     * This overrides the parent dispose method
     */
    KTSelect.prototype.dispose = function () {
        // Clean up event listeners
        this._eventManager.removeAllListeners(null);
        // Dispose modules
        if (this._dropdownModule) {
            this._dropdownModule.dispose();
        }
        if (this._comboboxModule) {
            if (typeof this._comboboxModule.destroy === 'function') {
                this._comboboxModule.destroy();
            }
        }
        if (this._tagsModule) {
            if (typeof this._tagsModule.destroy === 'function') {
                this._tagsModule.destroy();
            }
        }
        if (this._searchModule) {
            if (typeof this._searchModule.destroy === 'function') {
                this._searchModule.destroy();
            }
        }
        // Remove DOM elements
        if (this._wrapperElement && this._wrapperElement.parentNode) {
            this._wrapperElement.parentNode.removeChild(this._wrapperElement);
        }
        // Call parent dispose to clean up data
        _super.prototype.dispose.call(this);
    };
    /**
     * ========================================================================
     * DYNAMIC CONTROL METHODS
     * ========================================================================
     */
    /**
     * Programmatically enable the select component
     * @public
     */
    KTSelect.prototype.enable = function () {
        // Update config state
        this._config.disabled = false;
        // Remove disabled attribute from native select
        this._element.removeAttribute('disabled');
        this._element.classList.remove('disabled');
        // Remove disabled state from wrapper and display elements
        if (this._wrapperElement) {
            this._wrapperElement.classList.remove('disabled');
        }
        if (this._displayElement) {
            this._displayElement.removeAttribute('aria-disabled');
        }
        // Dispatch enabled event
        this._dispatchEvent('enabled');
        this._fireEvent('enabled');
    };
    /**
     * Programmatically disable the select component
     * @public
     */
    KTSelect.prototype.disable = function () {
        // Update config state
        this._config.disabled = true;
        // Close dropdown if currently open
        if (this._dropdownIsOpen) {
            this.closeDropdown();
        }
        // Add disabled attribute to native select
        this._element.setAttribute('disabled', 'disabled');
        this._element.classList.add('disabled');
        // Add disabled state to wrapper and display elements
        if (this._wrapperElement) {
            this._wrapperElement.classList.add('disabled');
        }
        if (this._displayElement) {
            this._displayElement.setAttribute('aria-disabled', 'true');
        }
        // Dispatch disabled event
        this._dispatchEvent('disabled');
        this._fireEvent('disabled');
    };
    /**
     * Update the dropdown to sync with native select element changes
     * For remote selects, refetches data from the server
     * Optionally accepts new options to replace existing ones (static selects only)
     * @param newOptions Optional array of new options [{value, text}, ...]
     * @public
     */
    KTSelect.prototype.update = function (newOptions) {
        var _this = this;
        // For remote selects, refetch data
        if (this._config.remote && this._remoteModule) {
            this._remoteModule
                .fetchData()
                .then(function (items) {
                // Clear existing options
                _this._clearExistingOptions();
                // Add new options from remote data
                items.forEach(function (item) {
                    var option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.title;
                    if (item.disabled)
                        option.disabled = true;
                    _this._element.appendChild(option);
                });
                // Rebuild dropdown
                _this._rebuildOptionsFromNative();
                // Dispatch updated event
                _this._dispatchEvent('updated');
                _this._fireEvent('updated');
            })
                .catch(function (error) {
                console.error('Error updating remote data:', error);
                _this._dispatchEvent('updateError');
                _this._fireEvent('updateError');
            });
        }
        else {
            // For static selects, handle new options
            if (newOptions) {
                // Clear existing options except placeholder
                this._clearExistingOptions();
                // Add new options to native select
                newOptions.forEach(function (opt) {
                    var option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    _this._element.appendChild(option);
                });
            }
            // Rebuild dropdown from native select
            this._rebuildOptionsFromNative();
            // Dispatch updated event
            this._dispatchEvent('updated');
            this._fireEvent('updated');
        }
    };
    /**
     * Reload remote data and rebuild the dropdown
     * Only works with remote data enabled
     * @returns Promise that resolves when reload completes
     * @public
     */
    KTSelect.prototype.reload = function () {
        var _this = this;
        // Guard clause: only works with remote data
        if (!this._config.remote || !this._remoteModule) {
            console.warn('reload() only works with remote data enabled');
            return Promise.resolve();
        }
        // Dispatch reload start event
        this._dispatchEvent('reloadStart');
        this._fireEvent('reloadStart');
        // Fetch fresh remote data
        return this._remoteModule
            .fetchData()
            .then(function (items) {
            // Clear existing options
            _this._clearExistingOptions();
            // Update state with new items
            return _this._state.setItems(items).then(function () {
                // Generate new options HTML
                _this._generateOptionsHtml(_this._element);
                // Update the dropdown
                _this._updateDropdownWithNewOptions();
                // Sync selection state from native select
                _this._syncSelectionFromNative();
                // Update visual display
                _this.updateSelectedOptionDisplay();
                _this._updateSelectedOptionClass();
                // Update select all button state if applicable
                if (_this._config.multiple && _this._config.enableSelectAll) {
                    _this.updateSelectAllButtonState();
                }
                // Dispatch reload complete event
                _this._dispatchEvent('reloadComplete');
                _this._fireEvent('reloadComplete');
            });
        })
            .catch(function (error) {
            console.error('Error reloading remote data:', error);
            // Dispatch reload error event with error details
            _this._dispatchEvent('reloadError', { error: error });
            _this._fireEvent('reloadError', { error: error });
            // Re-throw error so caller can handle it
            throw error;
        });
    };
    /**
     * Refresh the visual display and state without rebuilding options
     * For remote selects, refetches data from the server
     * @public
     */
    KTSelect.prototype.refresh = function () {
        var _this = this;
        // For remote selects, refetch data
        if (this._config.remote && this._remoteModule) {
            this._remoteModule
                .fetchData()
                .then(function (items) {
                // Clear existing options
                _this._clearExistingOptions();
                // Add new options
                items.forEach(function (item) {
                    var option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.title;
                    if (item.disabled)
                        option.disabled = true;
                    _this._element.appendChild(option);
                });
                // Rebuild dropdown
                _this._rebuildOptionsFromNative();
                // Sync selection state
                _this._syncSelectionFromNative();
                // Reapply ARIA attributes
                _this._setAriaAttributes();
                // Dispatch refreshed event
                _this._dispatchEvent('refreshed');
                _this._fireEvent('refreshed');
            })
                .catch(function (error) {
                console.error('Error refreshing remote data:', error);
                _this._dispatchEvent('refreshError');
                _this._fireEvent('refreshError');
            });
        }
        else {
            // For static selects, just sync visual state
            this._syncSelectionFromNative();
            // Reapply ARIA attributes
            this._setAriaAttributes();
            // Dispatch refreshed event
            this._dispatchEvent('refreshed');
            this._fireEvent('refreshed');
        }
    };
    /**
     * ========================================================================
     * STATIC METHODS
     * ========================================================================
     */
    /**
     * Create instances of KTSelect for all matching elements
     */
    KTSelect.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-select]');
        elements.forEach(function (element) {
            if (element.hasAttribute('data-kt-select') &&
                !element.classList.contains('data-kt-select-initialized')) {
                new KTSelect(element);
            }
        });
    };
    /**
     * Initialize all KTSelect instances
     */
    KTSelect.init = function () {
        KTSelect.createInstances();
    };
    /**
     * Get an existing KTSelect instance from an element
     */
    KTSelect.getInstance = function (element) {
        if (!element)
            return null;
        if (KTData.has(element, 'select')) {
            return KTData.get(element, 'select');
        }
        if (element.getAttribute('data-kt-select')) {
            return new KTSelect(element);
        }
        return null;
    };
    /**
     * Get an existing KTSelect instance or create a new one
     */
    KTSelect.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTSelect(element, config);
    };
    /**
     * Handle remote search
     * @param event Input event
     */
    KTSelect.prototype._handleRemoteSearch = function (event) {
        var _this = this;
        if (!this._remoteModule ||
            !this._config.remote ||
            !this._config.searchParam)
            return;
        var query = event.target.value;
        // Check if the query is long enough
        if (query.length < (this._config.searchMinLength || 0)) {
            // Restore original options if query is too short
            this._restoreOriginalOptions();
            return;
        }
        // Debounce the search
        if (this._searchDebounceTimeout) {
            clearTimeout(this._searchDebounceTimeout);
        }
        this._searchDebounceTimeout = window.setTimeout(function () {
            // Show loading state
            _this._renderSearchLoadingState();
            // Fetch remote data with search query
            _this._remoteModule
                .fetchData(query)
                .then(function (items) {
                // Update state with fetched items
                _this._state
                    .setItems(items)
                    .then(function () {
                    // Update options in the dropdown
                    _this._updateSearchResults(items);
                    // Refresh the search module to update focus and cache
                    if (_this._searchModule) {
                        _this._searchModule.refreshAfterSearch();
                    }
                    _this.updateSelectAllButtonState();
                })
                    .catch(function (error) {
                    console.error('Error updating search results:', error);
                    _this._renderSearchErrorState(error.message || 'Failed to load search results');
                });
            })
                .catch(function (error) {
                console.error('Error fetching search results:', error);
                _this._renderSearchErrorState(_this._remoteModule.getErrorMessage() ||
                    'Failed to load search results');
            });
        }, this._config.searchDebounce || 300);
    };
    /**
     * Render loading state for search
     */
    KTSelect.prototype._renderSearchLoadingState = function () {
        if (!this._originalOptionsHtml && this._dropdownContentElement) {
            var optionsContainer = this._dropdownContentElement.querySelector('[data-kt-select-options]');
            if (optionsContainer) {
                this._originalOptionsHtml = optionsContainer.innerHTML;
            }
        }
        this._showDropdownMessage('loading', 'Searching...');
    };
    /**
     * Render error state for search
     * @param message Error message
     */
    KTSelect.prototype._renderSearchErrorState = function (message) {
        var _this = this;
        this._showDropdownMessage('error', message);
        // Restore original options after error with a delay
        setTimeout(function () {
            _this._restoreOriginalOptions();
        }, 2000);
    };
    /**
     * Restore original options when search is cleared
     */
    KTSelect.prototype._restoreOriginalOptions = function () {
        if (!this._dropdownContentElement || !this._originalOptionsHtml)
            return;
        // Use cached options container for better performance
        var optionsContainer = this._optionsContainer ||
            this._dropdownContentElement.querySelector('[data-kt-select-options]');
        if (!optionsContainer)
            return;
        // Restore original options
        optionsContainer.innerHTML = this._originalOptionsHtml;
        // Update options NodeList
        this._options = this._dropdownContentElement.querySelectorAll('[data-kt-select-option]');
        // Refresh search module
        if (this._searchModule) {
            this._searchModule.refreshAfterSearch();
        }
        this.updateSelectAllButtonState();
        if (this._config.debug) {
            console.log('Restored original options after search clear');
        }
    };
    /**
     * Update search results in the dropdown
     * @param items Search result items
     */
    KTSelect.prototype._updateSearchResults = function (items) {
        if (!this._dropdownContentElement)
            return;
        // Use cached options container for better performance
        var optionsContainer = this._optionsContainer ||
            this._dropdownContentElement.querySelector('[data-kt-select-options]');
        if (!optionsContainer)
            return;
        // Handle empty results
        if (items.length === 0) {
            optionsContainer.innerHTML = '';
            var noResultsElement = defaultTemplates.searchEmpty(this._config);
            optionsContainer.appendChild(noResultsElement);
            return;
        }
        // First update the original select element with search results
        this._updateOriginalSelectWithSearchResults(items);
        // Then update dropdown using the standard flow
        this._updateDropdownWithNewOptions();
        // Add pagination "Load More" button if needed
        if (this._config.pagination && this._remoteModule.hasMorePages()) {
            this._addLoadMoreButton();
        }
    };
    /**
     * Update original select element with search results
     * @param items Search result items
     */
    KTSelect.prototype._updateOriginalSelectWithSearchResults = function (items) {
        var _this = this;
        // Clear existing options except placeholder
        this._clearExistingOptions();
        // Add search result items to original select element
        items.forEach(function (item) {
            var optionElement = document.createElement('option');
            optionElement.value = item.id || '';
            optionElement.textContent = item.title || '';
            if (item.selected) {
                optionElement.setAttribute('selected', 'selected');
            }
            if (item.disabled) {
                optionElement.setAttribute('disabled', 'disabled');
            }
            _this._element.appendChild(optionElement);
        });
        if (this._config.debug) {
            console.log("Updated original select with ".concat(items.length, " search results"));
        }
    };
    /**
     * Check if dropdown is open
     */
    KTSelect.prototype.isDropdownOpen = function () {
        return this._dropdownIsOpen;
    };
    KTSelect.prototype.getSelectedOptionsText = function () {
        var _this = this;
        var selectedValues = this.getSelectedOptions();
        var displaySeparator = this._config.displaySeparator || ', ';
        var texts = selectedValues
            .map(function (value) {
            var option = Array.from(_this._options).find(function (opt) { return opt.getAttribute('data-value') === value; });
            return (option === null || option === void 0 ? void 0 : option.getAttribute('data-text')) || '';
        })
            .filter(Boolean);
        return texts.join(displaySeparator);
    };
    /**
     * Check if an option is disabled (either in dropdown or original select)
     */
    KTSelect.prototype._isOptionDisabled = function (value) {
        var dropdownOption = Array.from(this._options).find(function (opt) { return opt.getAttribute('data-value') === value; });
        var isDropdownDisabled = dropdownOption &&
            (dropdownOption.classList.contains('disabled') ||
                dropdownOption.getAttribute('aria-disabled') === 'true');
        var selectOption = Array.from(this._element.querySelectorAll('option')).find(function (opt) { return opt.value === value; });
        var isNativeDisabled = selectOption && selectOption.disabled;
        return Boolean(isDropdownDisabled || isNativeDisabled);
    };
    /**
     * Centralized keyboard event handler for all select modes
     */
    KTSelect.prototype._handleKeyboardEvent = function (event) {
        // If the event target is the search input and the event was already handled (defaultPrevented),
        // then return early to avoid duplicate processing by this broader handler.
        if (event.target === this._searchInputElement && event.defaultPrevented) {
            return;
        }
        var isOpen = this._dropdownIsOpen;
        var config = this._config;
        var focusManager = this._focusManager;
        var buffer = this._typeToSearchBuffer;
        // If the event target is the search input, let it handle most typing keys naturally.
        if (event.target === this._searchInputElement) {
            // Allow navigation keys like ArrowDown, ArrowUp, Escape, Enter (for search/selection) to be handled by the logic below.
            // For other keys (characters, space, backspace, delete), let the input field process them.
            if (event.key !== 'ArrowDown' &&
                event.key !== 'ArrowUp' &&
                event.key !== 'Escape' &&
                event.key !== 'Enter' &&
                event.key !== 'Tab' &&
                event.key !== 'Home' &&
                event.key !== 'End' &&
                event.key !== ' ') {
                // If it's a character key and we are NOT type-to-searching (because search has focus)
                // then let the input field handle it for its own value.
                // The search module's 'input' event will handle filtering based on the input's value.
                buffer.clear(); // Clear type-to-search buffer when typing in search field
                return;
            }
            // For Enter specifically in search input, we might want to select the focused option or submit search.
            // This is handled later in the switch.
        }
        // Ignore modifier keys (except for specific combinations if added later)
        if (event.altKey || event.ctrlKey || event.metaKey)
            return;
        // Type-to-search: only for single char keys, when search input does not have focus
        if (event.key.length === 1 &&
            !event.repeat &&
            !event.key.match(/\s/) &&
            document.activeElement !== this._searchInputElement) {
            buffer.push(event.key);
            var str = buffer.getBuffer();
            if (isOpen) {
                focusManager.focusByString(str);
            }
            else {
                // If closed, type-to-search could potentially open and select.
                // For now, let's assume it only works when open or opens it first.
                // Or, we could find the matching option and set it directly without opening.
            }
            return; // Type-to-search handles the event
        }
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) {
                    this.openDropdown();
                }
                else {
                    focusManager.focusNext();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) {
                    this.openDropdown();
                }
                else {
                    focusManager.focusPrevious();
                }
                break;
            case 'Home':
                event.preventDefault();
                if (isOpen)
                    focusManager.focusFirst();
                break;
            case 'End':
                event.preventDefault();
                if (isOpen)
                    focusManager.focusLast();
                break;
            case 'Enter':
            case ' ': // Space
                if (isOpen) {
                    var focusedOptionEl = this._focusManager.getFocusedOption();
                    if (focusedOptionEl) {
                        var val = focusedOptionEl.dataset.value;
                        // If single select, and the item is already selected, just close.
                        if (val !== undefined &&
                            !this._config.multiple &&
                            this._state.isSelected(val)) {
                            if (this._config.debug)
                                console.log('Enter on already selected item in single-select mode. Closing.');
                            this.closeDropdown();
                            event.preventDefault();
                            break;
                        }
                    }
                    // Proceed with selection if not handled above
                    this.selectFocusedOption();
                    // Close dropdown only for single select mode (for new selections)
                    // Keep dropdown open for multiple select mode to allow additional selections
                    if (!this._config.multiple) {
                        // This will also be true for the case handled above, but closeDropdown is idempotent.
                        // However, the break above prevents this from being reached for that specific case.
                        this.closeDropdown();
                    }
                    event.preventDefault(); // Prevent form submission or other default actions
                    break;
                }
                else {
                    this.openDropdown();
                }
                break;
            case 'Escape':
                if (isOpen) {
                    this.closeDropdown();
                    event.target.blur();
                }
                break;
            case 'Tab':
                // Let Tab propagate for normal focus movement
                break;
            default:
                break;
        }
    };
    KTSelect.prototype.renderDisplayTemplateForSelected = function (selectedValues) {
        var _this = this;
        var optionsConfig = this._config.optionsConfig || {};
        var displaySeparator = this._config.displaySeparator || ', ';
        var contentArray = Array.from(new Set(selectedValues
            .map(function (value) {
            var option = Array.from(_this._options).find(function (opt) { return opt.getAttribute('data-value') === value; });
            if (!option)
                return '';
            var displayTemplate = _this._config.displayTemplate;
            var text = option.getAttribute('data-text') || '';
            // Replace all {{varname}} in option.innerHTML with values from _config
            Object.entries(optionsConfig[value] || {}).forEach(function (_a) {
                var key = _a[0], val = _a[1];
                if (['string', 'number', 'boolean'].includes(typeof val)) {
                    displayTemplate = displayTemplate.replace(new RegExp("{{".concat(key, "}}"), 'g'), String(val));
                }
            });
            return renderTemplateString(displayTemplate, {
                selectedCount: selectedValues.length || 0,
                selectedTexts: _this.getSelectedOptionsText() || '',
                text: text,
            });
        })
            .filter(Boolean)));
        return contentArray.join(displaySeparator);
    };
    KTSelect.prototype.getDisplayElement = function () {
        return this._displayElement;
    };
    KTSelect.prototype._observeNativeSelect = function () {
        var _this = this;
        if (this._mutationObserver)
            return; // Prevent double observers
        this._mutationObserver = new MutationObserver(function (mutations) {
            var needsRebuild = false;
            var needsSelectionSync = false;
            for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
                var mutation = mutations_1[_i];
                if (mutation.type === 'childList') {
                    // Option(s) added or removed
                    needsRebuild = true;
                }
                else if (mutation.type === 'attributes' &&
                    mutation.target instanceof HTMLOptionElement) {
                    if (mutation.attributeName === 'selected') {
                        needsSelectionSync = true;
                    }
                }
            }
            if (needsRebuild) {
                // Rebuild the custom dropdown options
                _this._rebuildOptionsFromNative();
            }
            if (needsSelectionSync) {
                _this._syncSelectionFromNative();
            }
        });
        this._mutationObserver.observe(this._element, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['selected'],
        });
    };
    KTSelect.prototype._rebuildOptionsFromNative = function () {
        var _this = this;
        // Remove and rebuild the custom dropdown options from the native select
        if (this._dropdownContentElement) {
            var optionsContainer_1 = this._dropdownContentElement.querySelector('[data-kt-select-options]');
            if (optionsContainer_1) {
                optionsContainer_1.innerHTML = '';
                var options = Array.from(this._element.querySelectorAll('option'));
                options.forEach(function (optionElement) {
                    if (optionElement.value === '' &&
                        optionElement.textContent.trim() === '') {
                        return;
                    }
                    var selectOption = new KTSelectOption(optionElement, _this._config);
                    var renderedOption = selectOption.render();
                    optionsContainer_1.appendChild(renderedOption);
                });
                // Update internal references
                this._options = this._dropdownContentElement.querySelectorAll('[data-kt-select-option]');
            }
        }
        // Sync selection after rebuilding
        this._syncSelectionFromNative();
        this.updateSelectedOptionDisplay();
        this._updateSelectedOptionClass();
    };
    KTSelect.prototype._syncSelectionFromNative = function () {
        // Sync internal state from the native select's selected options
        var selected = Array.from(this._element.querySelectorAll('option:checked')).map(function (opt) { return opt.value; });
        this._state.setSelectedOptions(this._config.multiple ? selected : selected[0] || '');
        this.updateSelectedOptionDisplay();
        this._updateSelectedOptionClass();
        this.updateSelectAllButtonState();
    };
    KTSelect.prototype._handleSelectAllClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var visibleOptions = this._focusManager
            .getVisibleOptions()
            .filter(function (opt) { return opt.getAttribute('aria-disabled') !== 'true'; });
        if (visibleOptions.length === 0)
            return;
        var visibleValues = visibleOptions.map(function (opt) { return opt.dataset.value; });
        var selectedValues = new Set(this.getSelectedOptions());
        var isAllSelected = visibleOptions.every(function (opt) {
            return selectedValues.has(opt.dataset.value);
        });
        if (isAllSelected) {
            // Deselect all visible
            visibleValues.forEach(function (value) { return selectedValues.delete(value); });
        }
        else {
            // Select all visible
            visibleValues.forEach(function (value) { return selectedValues.add(value); });
        }
        this._state.setSelectedOptions(Array.from(selectedValues));
        this.updateSelectedOptionDisplay();
        this._updateSelectedOptionClass();
        this.updateSelectAllButtonState();
        this._dispatchEvent('change');
        this._fireEvent('change');
    };
    KTSelect.prototype.updateSelectAllButtonState = function () {
        if (!this._config.multiple ||
            !this._config.enableSelectAll ||
            !this._selectAllButtonToggle) {
            return;
        }
        var visibleOptions = this._focusManager
            .getVisibleOptions()
            .filter(function (opt) { return opt.getAttribute('aria-disabled') !== 'true'; });
        if (visibleOptions.length === 0) {
            this._selectAllButton.style.display = 'none';
            return;
        }
        this._selectAllButton.style.display = '';
        var selectedValues = new Set(this.getSelectedOptions());
        var isAllSelected = visibleOptions.every(function (opt) {
            return selectedValues.has(opt.dataset.value);
        });
        this._selectAllButtonToggle.textContent = isAllSelected
            ? this._config.clearAllText
            : this._config.selectAllText;
    };
    // Static global configuration
    KTSelect.globalConfig = {};
    return KTSelect;
}(KTComponent));
export { KTSelect };
//# sourceMappingURL=select.js.map