/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { DateRangeInterface, KTDatepickerConfigInterface } from './types';
/**
 * KTDatepicker - Main datepicker component class
 * Manages the datepicker functionality and integration with input elements
 */
export declare class KTDatepicker extends KTComponent {
    protected readonly _name: string;
    protected readonly _config: KTDatepickerConfigInterface;
    private _state;
    private _calendar;
    private _keyboard;
    private _eventManager;
    private _dateInputElement;
    private _startDateInputElement;
    private _endDateInputElement;
    private _displayElement;
    private _useSegmentedDisplay;
    private _displayWrapper;
    private _displayText;
    private _currentDate;
    private _currentRange;
    private _segmentFocused;
    /**
     * Constructor for the KTDatepicker class.
     */
    constructor(element: HTMLElement, config?: KTDatepickerConfigInterface);
    /**
     * Initialize input elements
     */
    private _initializeInputElements;
    /**
     * Create display element for datepicker
     */
    private _createDisplayElement;
    /**
     * Handle segment click to focus and open appropriate view
     *
     * @param segmentType - Type of segment clicked
     */
    private _handleSegmentClick;
    /**
     * Set up event listeners
     */
    private _setupEventListeners;
    /**
     * Handle keyboard navigation between segments
     *
     * @param e - Keyboard event
     */
    private _handleSegmentKeydown;
    /**
     * Navigate between segments with keyboard
     *
     * @param direction - 'prev' or 'next'
     * @param currentSegment - Current segment identifier
     */
    private _navigateSegments;
    /**
     * Remove highlight from all segments
     */
    private _removeSegmentHighlights;
    /**
     * Sync display element with the selected date
     */
    private _syncDisplayWithSelectedDate;
    /**
     * Handle date change events
     *
     * @param e - Custom event with date change details
     */
    private _handleDateChange;
    /**
     * Update the display element for a single date
     *
     * @param date - The date to display
     */
    private _updateDisplayElement;
    /**
     * Update the display element for a date range
     *
     * @param startDate - The start date of the range
     * @param endDate - The end date of the range
     */
    private _updateRangeDisplayElement;
    /**
     * Handle input change events
     *
     * @param e - Input change event
     */
    private _handleInputChange;
    /**
     * Initialize with default values from input
     */
    private _initializeDefaultValues;
    /**
     * ========================================================================
     * Public API
     * ========================================================================
     */
    /**
     * Get the currently selected date
     *
     * @returns Selected date, null if no selection, or date range object
     */
    getDate(): Date | null | DateRangeInterface;
    /**
     * Set the selected date
     *
     * @param date - Date to select or null to clear selection
     */
    setDate(date: Date | null): void;
    /**
     * Get the currently selected date range
     *
     * @returns Selected date range or null if no selection
     */
    getDateRange(): DateRangeInterface | null;
    /**
     * Set the selected date range
     *
     * @param start - Start date of the range
     * @param end - End date of the range
     */
    setDateRange(start: Date | null, end: Date | null): void;
    /**
     * Set the minimum selectable date
     *
     * @param minDate - Minimum date or null to remove constraint
     */
    setMinDate(minDate: Date | null): void;
    /**
     * Set the maximum selectable date
     *
     * @param maxDate - Maximum date or null to remove constraint
     */
    setMaxDate(maxDate: Date | null): void;
    /**
     * Update the datepicker (refresh view)
     */
    update(): void;
    /**
     * Destroy the datepicker instance and clean up
     */
    destroy(): void;
    /**
     * Dispatch a custom event
     *
     * @param eventName - Name of the event
     * @param payload - Optional event payload
     */
    protected _dispatchEvent(eventName: string, payload?: any): void;
    /**
     * ========================================================================
     * Static instances
     * ========================================================================
     */
    private static readonly _instances;
    /**
     * Create instances for all datepicker elements on the page
     */
    static createInstances(): void;
    /**
     * Initialize all datepickers on the page
     */
    static init(): void;
}
//# sourceMappingURL=datepicker.d.ts.map