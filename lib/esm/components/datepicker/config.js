/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
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
import { DefaultLocales } from './locales';
import { isSameDay, isDateDisabled } from './utils';
import { KTDatepickerEventManager } from './events';
export var DefaultConfig = {
    locale: 'en-US',
    locales: DefaultLocales, // all locales
    weekDays: 'min',
    forceLeadingZero: true,
    // 0-indexed month
    // minDate: new Date(2024, 7, 20),
    // maxDate: new Date(2024, 8, 10),
    // supported formats: refer to dateFormat
    // minDate: '20/08/2024',
    // maxDate: '10/09/2024',
    // Calendar
    visibleMonths: 1, // visible months calendar to show
    visibleYears: 10, // visible years span to show on year selection
    keepViewModeOnSelection: false, // automatically switch view modes when selecting month/year
    // Date
    format: 'dd/MM/yyyy',
    // Time
    enableTime: false,
    timeFormat: 'hh:mm:ss A ZZZ', // 12-hours time format
    // timeFormat: 'HH:mm:ss ZZZ', // 24-hours time format
    am: 'AM',
    pm: 'PM',
    hourStep: 1,
    // minuteStep: 5,
    // secondStep: 10,
    // disabledHours: [0, 1, 2, 3, 4, 5, 6, 22, 23],
    // disabledMinutes: [0, 1, 2, 3],
    // Date range
    range: false,
    rangeSeparator: ' - ',
    // Multi-date selection
    multiDateSelection: false,
    maxDates: 0, // 0 means unlimited
    // Date blocking patterns
    disabledDates: [],
    enableNaturalLanguage: true,
    // Animation settings
    animationDuration: 250,
    animationEasing: '',
    animationEnterClass: '',
    animationExitClass: '',
};
/**
 * State manager class for KTDatepicker
 * Handles state management and configuration
 */
var KTDatepickerStateManager = /** @class */ (function () {
    /**
     * Constructor for the KTDatepickerStateManager class
     *
     * @param element - The datepicker element
     * @param config - Configuration object
     */
    function KTDatepickerStateManager(element, config) {
        this._element = element;
        this._config = this._mergeConfig(config || {});
        this._state = this._initializeState();
        this._events = new KTDatepickerEventManager(element);
    }
    /**
     * Merge provided configuration with default configuration
     *
     * @param config - User provided configuration
     * @returns Merged configuration
     */
    KTDatepickerStateManager.prototype._mergeConfig = function (config) {
        return __assign(__assign({}, DefaultConfig), config);
    };
    /**
     * Initialize the state object with default values
     */
    KTDatepickerStateManager.prototype._initializeState = function () {
        var now = new Date();
        var state = {
            currentDate: now,
            selectedDate: null,
            selectedDateRange: null,
            selectedDates: [],
            viewMode: 'days',
            isOpen: false,
            isFocused: false,
            isRangeSelectionStart: true,
            isRangeSelectionInProgress: false,
            selectedTime: null,
            prevIsOpen: false,
        };
        return state;
    };
    /**
     * Get the current configuration
     *
     * @returns Current configuration
     */
    KTDatepickerStateManager.prototype.getConfig = function () {
        return this._config;
    };
    /**
     * Get the current state
     *
     * @returns Current state
     */
    KTDatepickerStateManager.prototype.getState = function () {
        return this._state;
    };
    /**
     * Set the selected date
     *
     * @param date - Date to select
     */
    KTDatepickerStateManager.prototype.setSelectedDate = function (date) {
        var state = this._state;
        var config = this._config;
        if (date === null) {
            // Clear selection
            state.selectedDate = null;
            state.selectedDateRange = null;
            state.isRangeSelectionInProgress = false;
            this._dispatchChangeEvent();
            return;
        }
        // Check if the date is disabled (outside min/max range or explicitly disabled)
        // We add this check here as a second defense layer beyond the UI checks
        if (isDateDisabled(date, config)) {
            console.log('Date is disabled in setSelectedDate, ignoring selection:', date.toISOString());
            return;
        }
        if (config.range) {
            // Handle range selection
            if (!state.selectedDateRange) {
                // Initialize range object if it doesn't exist
                state.selectedDateRange = { startDate: null, endDate: null };
            }
            // If start date isn't set or if we're resetting the range, set the start date
            if (!state.selectedDateRange.startDate ||
                state.isRangeSelectionStart ||
                state.selectedDateRange.endDate) {
                // Reset the range with a new start date
                state.selectedDateRange.startDate = date;
                state.selectedDateRange.endDate = null;
                state.isRangeSelectionStart = false; // We've selected the start, next will be end
                // Set the flag to keep dropdown open during range selection
                state.isRangeSelectionInProgress = true;
                console.log('Range start selected - setting isRangeSelectionInProgress to true');
            }
            else {
                // Set the end date if the start date is already set
                // Ensure that start is before end (swap if needed)
                if (date < state.selectedDateRange.startDate) {
                    // Swap dates if the selected date is before the start date
                    state.selectedDateRange.endDate = state.selectedDateRange.startDate;
                    state.selectedDateRange.startDate = date;
                }
                else {
                    state.selectedDateRange.endDate = date;
                }
                state.isRangeSelectionStart = true; // Reset for next range selection
                // Clear the flag as range selection is complete
                state.isRangeSelectionInProgress = false;
                console.log('Range end selected - setting isRangeSelectionInProgress to false');
            }
            // For date range, we still set selectedDate for current focus
            state.selectedDate = date;
            // Trigger event with range data
            this._dispatchChangeEvent();
        }
        else {
            // Single date selection
            state.selectedDate = date;
            // Multi-date selection
            if (config.multiDateSelection) {
                // Add or remove the date from the array
                var existingIndex = state.selectedDates.findIndex(function (d) {
                    return isSameDay(d, date);
                });
                if (existingIndex !== -1) {
                    // Remove if already selected
                    state.selectedDates.splice(existingIndex, 1);
                }
                else if (state.selectedDates.length < config.maxDates) {
                    // Add if not exceeding max
                    state.selectedDates.push(date);
                }
            }
            // Trigger event with single date data
            this._dispatchChangeEvent();
        }
    };
    /**
     * Set the current view date (month/year being viewed)
     *
     * @param date - Date to set as current view
     */
    KTDatepickerStateManager.prototype.setCurrentDate = function (date) {
        this._state.currentDate = date;
        this._dispatchEvent('month-change', {
            month: date.getMonth(),
            year: date.getFullYear(),
        });
    };
    /**
     * Set the selected time
     *
     * @param time - Time configuration to set
     */
    KTDatepickerStateManager.prototype.setSelectedTime = function (time) {
        this._state.selectedTime = time;
        this._dispatchChangeEvent();
    };
    /**
     * Set the view mode (days, months, years)
     *
     * @param mode - View mode to set
     */
    KTDatepickerStateManager.prototype.setViewMode = function (mode) {
        this._state.viewMode = mode;
        this._dispatchEvent('view-mode-change', { mode: mode });
    };
    /**
     * Set the open state of the datepicker
     *
     * @param isOpen - Whether the datepicker is open
     */
    KTDatepickerStateManager.prototype.setOpen = function (isOpen) {
        this._state.isOpen = isOpen;
        this._dispatchEvent(isOpen ? 'open' : 'close');
        // Call callback if defined
        if (isOpen && this._config.onOpen) {
            this._config.onOpen();
        }
        else if (!isOpen && this._config.onClose) {
            this._config.onClose();
        }
    };
    /**
     * Set the focus state of the datepicker
     *
     * @param isFocused - Whether the datepicker is focused
     */
    KTDatepickerStateManager.prototype.setFocused = function (isFocused) {
        this._state.isFocused = isFocused;
        this._dispatchEvent(isFocused ? 'focus' : 'blur');
    };
    /**
     * Reset the state to initial values
     */
    KTDatepickerStateManager.prototype.resetState = function () {
        this._state = this._initializeState();
        this._dispatchEvent('reset');
    };
    /**
     * Dispatch change event with current date/time selection
     */
    KTDatepickerStateManager.prototype._dispatchChangeEvent = function () {
        var payload = {};
        if (this._config.range && this._state.selectedDateRange) {
            payload.selectedDateRange = this._state.selectedDateRange;
        }
        else if (this._config.multiDateSelection) {
            payload.selectedDates = __spreadArray([], this._state.selectedDates, true);
        }
        else {
            payload.selectedDate = this._state.selectedDate;
        }
        if (this._config.enableTime && this._state.selectedTime) {
            payload.selectedTime = __assign({}, this._state.selectedTime);
        }
        this._events.dispatchDateChangeEvent(payload);
        // Call onChange callback if defined
        if (this._config.onChange) {
            var value = void 0;
            if (this._config.range) {
                value = this._state.selectedDateRange || {
                    startDate: null,
                    endDate: null,
                };
            }
            else {
                value = this._state.selectedDate;
            }
            this._config.onChange(value);
        }
    };
    /**
     * Dispatch custom event
     *
     * @param eventName - Name of the event
     * @param payload - Optional payload data
     */
    KTDatepickerStateManager.prototype._dispatchEvent = function (eventName, payload) {
        this._events.dispatchEvent(eventName, payload);
    };
    /**
     * Get the event manager instance
     */
    KTDatepickerStateManager.prototype.getEventManager = function () {
        return this._events;
    };
    return KTDatepickerStateManager;
}());
export { KTDatepickerStateManager };
//# sourceMappingURL=config.js.map