/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelectConfigInterface, KTSelectOption as KTSelectOptionData } from './config';
/**
 * KTSelectRemote class
 * Handles fetching remote data for the KTSelect component
 */
export declare class KTSelectRemote {
    private _config;
    private _isLoading;
    private _hasError;
    private _errorMessage;
    private _currentPage;
    private _totalPages;
    private _lastQuery;
    private _element;
    /**
     * Constructor
     * @param config KTSelect configuration
     * @param element The select element
     */
    constructor(config: KTSelectConfigInterface, element?: HTMLElement);
    /**
     * Fetch data from remote URL
     * @param query Optional search query
     * @param page Page number for pagination
     * @returns Promise with fetched items
     */
    fetchData(query?: string, page?: number): Promise<KTSelectOptionData[]>;
    /**
     * Dispatch custom events to notify about search state changes
     * @param eventName Name of the event to dispatch
     */
    private _dispatchEvent;
    /**
     * Build the URL for the API request
     * @param query Search query
     * @param page Page number
     * @returns Fully formed URL
     */
    private _buildUrl;
    /**
     * Process the API response data
     * @param data API response data
     * @returns Array of KTSelectOptionData
     */
    private _processData;
    /**
     * Map a data item to KTSelectOptionData format
     * @param item Data item from API
     * @returns KTSelectOptionData object
     */
    private _mapItemToOption;
    /**
     * Load the next page of results
     * @returns Promise with fetched items
     */
    loadNextPage(): Promise<KTSelectOptionData[]>;
    /**
     * Check if there are more pages available
     * @returns Boolean indicating if more pages exist
     */
    hasMorePages(): boolean;
    /**
     * Get loading state
     * @returns Boolean indicating if data is loading
     */
    isLoading(): boolean;
    /**
     * Get error state
     * @returns Boolean indicating if there was an error
     */
    hasError(): boolean;
    /**
     * Get error message
     * @returns Error message
     */
    getErrorMessage(): string;
    /**
     * Reset the remote data state
     */
    reset(): void;
    /**
     * Set the select element for event dispatching
     * @param element The select element
     */
    setElement(element: HTMLElement): void;
}
//# sourceMappingURL=remote.d.ts.map