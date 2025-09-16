/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelect } from './select';
/**
 * KTSelectCombobox - Handles combobox-specific functionality for KTSelect
 */
export declare class KTSelectCombobox {
    private _select;
    private _config;
    private _searchInputElement;
    private _clearButtonElement;
    private _boundInputHandler;
    private _boundClearHandler;
    private _valuesContainerElement;
    constructor(select: KTSelect);
    /**
     * Attach event listeners specific to combobox
     */
    private _attachEventListeners;
    /**
     * Remove event listeners to prevent memory leaks or duplicates
     */
    private _removeEventListeners;
    /**
     * Handle combobox input events
     */
    private _handleComboboxInput;
    /**
     * Handle clear button click
     */
    private _handleClearButtonClick;
    /**
     * Toggle clear button visibility based on input value and selection state.
     * Clear button should be visible if there's text in input OR if there are selected items (for multi/displayTemplate modes).
     */
    private _toggleClearButtonVisibility;
    /**
     * Filter options for combobox based on input query
     */
    private _filterOptionsForCombobox;
    /**
     * Updates the combobox display (input field or values container) based on selection.
     */
    updateDisplay(selectedOptions: string[]): void;
    /**
     * Destroy the combobox component and clean up event listeners
     */
    destroy(): void;
}
//# sourceMappingURL=combobox.d.ts.map