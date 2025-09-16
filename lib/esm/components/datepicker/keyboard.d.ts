/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDatepickerStateManager } from './config';
/**
 * Keyboard navigation handler for KTDatepicker
 */
export declare class KTDatepickerKeyboard {
    private _element;
    private _stateManager;
    private _eventManager;
    private _focusedDay;
    private _isListening;
    /**
     * Constructor for the KTDatepickerKeyboard class
     *
     * @param element - The datepicker element
     * @param stateManager - State manager for the datepicker
     */
    constructor(element: HTMLElement, stateManager: KTDatepickerStateManager);
    /**
     * Set up event listeners for keyboard navigation
     */
    private _setupEventListeners;
    /**
     * Activate keyboard navigation
     */
    private _activateKeyboardNavigation;
    /**
     * Deactivate keyboard navigation
     */
    private _deactivateKeyboardNavigation;
    /**
     * Handle keydown events
     */
    private _handleKeyDown;
    /**
     * Handle key navigation in days view
     */
    private _handleDaysViewKeyNavigation;
    /**
     * Handle key navigation in months view
     */
    private _handleMonthsViewKeyNavigation;
    /**
     * Handle key navigation in years view
     */
    private _handleYearsViewKeyNavigation;
    /**
     * Focus the currently focused day in the calendar
     */
    private _focusDay;
}
//# sourceMappingURL=keyboard.d.ts.map