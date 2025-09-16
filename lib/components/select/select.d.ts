/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTSelectConfigInterface } from './config';
export declare class KTSelect extends KTComponent {
    protected readonly _name: string;
    protected readonly _dataOptionPrefix: string;
    protected readonly _config: KTSelectConfigInterface;
    protected _defaultConfig: KTSelectConfigInterface;
    private _wrapperElement;
    private _displayElement;
    private _dropdownContentElement;
    private _searchInputElement;
    private _options;
    private _dropdownIsOpen;
    private _state;
    private _searchModule;
    private _remoteModule;
    private _comboboxModule;
    private _tagsModule;
    private _dropdownModule;
    private _loadMoreIndicator;
    private _selectAllButton;
    private _selectAllButtonToggle;
    private _focusManager;
    private _eventManager;
    private _typeToSearchBuffer;
    private _mutationObserver;
    /**
     * Constructor: Initializes the select component
     */
    constructor(element: HTMLElement, config?: KTSelectConfigInterface);
    /**
     * Initialize remote data fetching
     */
    private _initializeRemoteData;
    /**
     * Clear existing options from the select element
     */
    private _clearExistingOptions;
    /**
     * Helper to show a dropdown message (error, loading, noResults)
     */
    private _showDropdownMessage;
    /**
     * Render loading state in dropdown
     */
    private _renderLoadingState;
    /**
     * Render error state
     * @param message Error message
     */
    private _renderErrorState;
    /**
     * Add "Load More" button for pagination
     */
    private _addLoadMoreButton;
    /**
     * Handle load more button click
     */
    private _handleLoadMore;
    /**
     * Update options in the dropdown
     * @param newItems New items to add to the dropdown
     */
    private _updateOptionsInDropdown;
    /**
     * ========================================================================
     * INITIALIZATION METHODS
     * ========================================================================
     */
    /**
     * Set up the component after everything is initialized
     */
    private _setupComponent;
    /**
     * Creates the HTML structure for the select component
     */
    private _createHtmlStructure;
    /**
     * Setup all element references after DOM is created
     */
    private _setupElementReferences;
    /**
     * Attach all event listeners to elements
     */
    private _attachEventListeners;
    /**
     * Initialize search module if search is enabled
     */
    private _initializeSearchModule;
    /**
     * Apply ARIA attributes and update display
     */
    private _updateDisplayAndAriaAttributes;
    /**
     * Apply initial disabled state if configured
     */
    private _applyInitialDisabledState;
    /**
     * Generate options HTML from data items
     */
    private _generateOptionsHtml;
    /**
     * Extract nested property value from object using dot notation
     */
    private _getValueByKey;
    /**
     * Pre-select options that have the selected attribute
     */
    private _preSelectOptions;
    /**
     * ========================================================================
     * DROPDOWN MANAGEMENT
     * ========================================================================
     */
    /**
     * Open the dropdown
     */
    openDropdown(): void;
    /**
     * Close the dropdown
     */
    closeDropdown(): void;
    /**
     * Update dropdown position
     */
    updateDropdownPosition(): void;
    /**
     * Focus on the first selected option if any exists in the dropdown
     */
    private _focusSelectedOption;
    /**
     * ========================================================================
     * SELECTION MANAGEMENT
     * ========================================================================
     */
    /**
     * Select an option by value
     */
    private _selectOption;
    /**
     * Update selected option display value
     */
    updateSelectedOptionDisplay(): void;
    /**
     * Check if an option was originally disabled in the HTML
     */
    private _isOptionOriginallyDisabled;
    /**
     * Update CSS classes for selected options
     */
    private _updateSelectedOptionClass;
    /**
     * Clear all selected options
     */
    clearSelection(): void;
    /**
     * Set selected options programmatically
     */
    setSelectedOptions(options: HTMLOptionElement[]): void;
    /**
     * Select the currently focused option
     */
    selectFocusedOption(): void;
    /**
     * ========================================================================
     * EVENT HANDLERS
     * ========================================================================
     */
    /**
     * Handle click within the dropdown
     */
    private _handleDropdownOptionClick;
    /**
     * Handle clicking on an option in the dropdown
     */
    private _handleOptionClick;
    /**
     * Handle document click for closing dropdown
     */
    private _handleDocumentClick;
    /**
     * ========================================================================
     * ACCESSIBILITY METHODS
     * ========================================================================
     */
    /**
     * Set ARIA attributes for accessibility
     */
    private _setAriaAttributes;
    /**
     * ========================================================================
     * PUBLIC API
     * ========================================================================
     */
    /**
     * Get the search input element
     */
    getSearchInput(): HTMLInputElement;
    /**
     * Get selected options
     */
    getSelectedOptions(): string[];
    /**
     * Get configuration
     */
    getConfig(): KTSelectConfigInterface;
    /**
     * Get option elements
     */
    getOptionsElement(): NodeListOf<HTMLElement>;
    /**
     * Get dropdown element
     */
    getDropdownElement(): HTMLElement;
    /**
     * Get value display element
     */
    getValueDisplayElement(): HTMLElement;
    /**
     * Get wrapper element
     */
    getWrapperElement(): HTMLElement;
    /**
     * Show all options in the dropdown
     */
    showAllOptions(): void;
    /**
     * Toggle multi-select functionality
     */
    enableMultiSelect(): void;
    /**
     * Disable multi-select functionality
     */
    disableMultiSelect(): void;
    /**
     * Toggle the selection of an option
     */
    toggleSelection(value: string): void;
    /**
     * Clean up all resources when the component is destroyed
     * This overrides the parent dispose method
     */
    dispose(): void;
    /**
     * ========================================================================
     * STATIC METHODS
     * ========================================================================
     */
    private static readonly _instances;
    /**
     * Create instances of KTSelect for all matching elements
     */
    static createInstances(): void;
    /**
     * Initialize all KTSelect instances
     */
    static init(): void;
    /**
     * Handle remote search
     * @param event Input event
     */
    private _handleRemoteSearch;
    private _searchDebounceTimeout;
    /**
     * Render loading state for search
     */
    private _renderSearchLoadingState;
    private _originalOptionsHtml;
    /**
     * Render error state for search
     * @param message Error message
     */
    private _renderSearchErrorState;
    /**
     * Update search results in the dropdown
     * @param items Search result items
     */
    private _updateSearchResults;
    /**
     * Check if dropdown is open
     */
    isDropdownOpen(): boolean;
    getSelectedOptionsText(): string;
    /**
     * Check if an option is disabled (either in dropdown or original select)
     */
    private _isOptionDisabled;
    /**
     * Centralized keyboard event handler for all select modes
     */
    private _handleKeyboardEvent;
    renderDisplayTemplateForSelected(selectedValues: string[]): string;
    getDisplayElement(): HTMLElement;
    private _observeNativeSelect;
    private _rebuildOptionsFromNative;
    private _syncSelectionFromNative;
    private _handleSelectAllClick;
    updateSelectAllButtonState(): void;
}
//# sourceMappingURL=select.d.ts.map