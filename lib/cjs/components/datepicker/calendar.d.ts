/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDatepickerStateManager } from './config';
/**
 * Calendar component for the KTDatepicker
 * Handles rendering and interactions with the calendar
 */
export declare class KTDatepickerCalendar {
    private _element;
    private _stateManager;
    private _eventManager;
    private _calendarContainer;
    private _dropdownElement;
    private _dropdownManager;
    private _isVisible;
    private _currentViewMonth;
    private _currentViewYear;
    /**
     * Constructor for the KTDatepickerCalendar class
     *
     * @param element - The datepicker element
     * @param stateManager - State manager for the datepicker
     */
    constructor(element: HTMLElement, stateManager: KTDatepickerStateManager);
    /**
     * Initialize the calendar
     */
    private _initializeCalendar;
    /**
     * Initialize the dropdown manager
     */
    private _initDropdownManager;
    /**
     * Set up event listeners for calendar interactions
     */
    private _setupEventListeners;
    /**
     * Render the calendar view based on current state
     */
    private _renderCalendarView;
    /**
     * Render days for a calendar month
     *
     * @param calendarMatrix - Matrix of dates for the month
     * @param currentMonth - Current month
     * @param currentYear - Current year
     * @returns HTML string for the days
     */
    private _renderDays;
    /**
     * Update the month and year display in the header
     */
    private _updateMonthYearDisplay;
    /**
     * Navigate to a different month
     *
     * @param offset - Number of months to offset by
     */
    private _navigateMonth;
    /**
     * Handle direct date selection (new method that takes the actual date object)
     *
     * @param selectedDate - The exact date that was selected
     * @param clickedButton - The button element that was clicked
     */
    private _handleDateSelection;
    /**
     * Handle day selection (legacy method, kept for backward compatibility)
     *
     * @param day - Day number
     */
    private _handleDaySelection;
    /**
     * Toggle between days, months, and years view
     */
    private _toggleMonthYearView;
    /**
     * Update view mode based on state change
     */
    private _updateViewMode;
    /**
     * Go to today's date
     */
    private _goToToday;
    /**
     * Clear date selection
     */
    private _clearSelection;
    /**
     * Apply current selection and close dropdown
     */
    private _applySelection;
    /**
     * Handle time input changes
     */
    private _handleTimeChange;
    /**
     * Set AM/PM selection
     *
     * @param period - 'AM' or 'PM'
     */
    private _setAmPm;
    /**
     * Select a month
     *
     * @param month - Month index (0-11)
     */
    private _selectMonth;
    /**
     * Select a year
     *
     * @param year - Year value
     */
    private _selectYear;
    /**
     * Update calendar view to reflect state changes
     */
    private _updateCalendarView;
    /**
     * Update time inputs to reflect current time selection
     */
    private _updateTimeDisplay;
    /**
     * Show the calendar dropdown
     */
    show(): void;
    /**
     * Hide the calendar dropdown
     */
    hide(): void;
    /**
     * Update dropdown position
     */
    updatePosition(): void;
    /**
     * Clear range hover classes from all day cells
     */
    private _clearRangeHoverClasses;
    /**
     * Apply hover effect to show potential range selection
     *
     * @param startDate - Start date of the range
     * @param hoverDate - Current date being hovered
     */
    private _applyRangeHoverEffect;
}
//# sourceMappingURL=calendar.d.ts.map