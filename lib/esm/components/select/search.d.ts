/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelect } from './select';
export declare class KTSelectSearch {
    private _select;
    private _searchInput;
    private _noResultsElement;
    private _originalOptionContents;
    private _eventManager;
    private _focusManager;
    private _config;
    handleSearchInput: (...args: any[]) => void;
    constructor(select: KTSelect);
    init(): void;
    /**
     * Remove event listeners to prevent memory leaks or duplicates
     */
    private _removeEventListeners;
    /**
     * Handles keydown events on the search input for navigation and actions.
     */
    private _handleSearchKeyDown;
    /**
     * Store original HTML content of all options for later restoration
     * This prevents losing formatting when clearing search
     */
    private _cacheOriginalOptionContents;
    /**
     * Restores the innerHTML of all options from the cache if they have been modified.
     * This is typically called before applying new filters/highlights.
     */
    private _restoreOptionContentsBeforeFilter;
    private _handleSearchInput;
    private _filterOptions;
    /**
     * Reset all options to their original state
     */
    private _resetAllOptions;
    private _handleNoResults;
    private _showNoResultsMessage;
    private _clearNoResultsMessage;
    /**
     * Public method to explicitly clear all search highlights
     * This is called when search is reset or selection changes
     */
    clearSearch(): void;
    /**
     * This ensures that search highlighting works correctly with new options
     */
    refreshOptionCache(): void;
    /**
     * Called after search (local or remote via KTSelect) to reset focus.
     */
    refreshAfterSearch(): void;
    /**
     * Clean up all resources used by the search module
     */
    destroy(): void;
}
//# sourceMappingURL=search.d.ts.map