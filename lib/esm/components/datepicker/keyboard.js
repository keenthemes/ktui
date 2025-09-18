/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDatepickerEventName } from './events';
/**
 * Keyboard navigation handler for KTDatepicker
 */
var KTDatepickerKeyboard = /** @class */ (function () {
    /**
     * Constructor for the KTDatepickerKeyboard class
     *
     * @param element - The datepicker element
     * @param stateManager - State manager for the datepicker
     */
    function KTDatepickerKeyboard(element, stateManager) {
        var _this = this;
        this._focusedDay = null;
        this._isListening = false;
        /**
         * Handle keydown events
         */
        this._handleKeyDown = function (e) {
            var state = _this._stateManager.getState();
            var viewMode = state.viewMode;
            // ESC key closes the dropdown
            if (e.key === 'Escape') {
                e.preventDefault();
                _this._stateManager.setOpen(false);
                return;
            }
            // Handle different view modes differently
            switch (viewMode) {
                case 'days':
                    _this._handleDaysViewKeyNavigation(e);
                    break;
                case 'months':
                    _this._handleMonthsViewKeyNavigation(e);
                    break;
                case 'years':
                    _this._handleYearsViewKeyNavigation(e);
                    break;
            }
        };
        this._element = element;
        this._stateManager = stateManager;
        this._eventManager = stateManager.getEventManager();
        // Set up listeners
        this._setupEventListeners();
    }
    /**
     * Set up event listeners for keyboard navigation
     */
    KTDatepickerKeyboard.prototype._setupEventListeners = function () {
        var _this = this;
        // Listen for open/close events to activate/deactivate keyboard navigation
        this._eventManager.addEventListener(KTDatepickerEventName.OPEN, function () {
            return _this._activateKeyboardNavigation();
        });
        this._eventManager.addEventListener(KTDatepickerEventName.CLOSE, function () {
            return _this._deactivateKeyboardNavigation();
        });
        // Listen for custom keyboard-open event
        this._eventManager.addEventListener(KTDatepickerEventName.KEYBOARD_OPEN, function () {
            // Ensure we activate keyboard navigation
            _this._activateKeyboardNavigation();
            // Set initial focus day with a slight delay to allow the dropdown to render
            setTimeout(function () {
                // Initialize focused day if needed
                if (_this._focusedDay === null) {
                    var state = _this._stateManager.getState();
                    if (state.selectedDate) {
                        _this._focusedDay = state.selectedDate.getDate();
                    }
                    else {
                        _this._focusedDay = new Date().getDate();
                    }
                }
                // Focus the day
                _this._focusDay();
            }, 150);
        });
        // Handle focus events
        this._element.addEventListener('focusin', function (e) {
            if (_this._stateManager.getState().isOpen && !_this._isListening) {
                _this._activateKeyboardNavigation();
            }
        });
        // Add keydown event to the element itself to open dropdown with Enter key
        this._element.addEventListener('keydown', function (e) {
            var state = _this._stateManager.getState();
            // If not open yet, handle keys that should open the dropdown
            if (!state.isOpen) {
                if (e.key === 'Enter' ||
                    e.key === ' ' ||
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp') {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent other handlers from capturing this event
                    _this._stateManager.setOpen(true);
                    // Set initial focus day if none
                    if (_this._focusedDay === null) {
                        if (state.selectedDate) {
                            _this._focusedDay = state.selectedDate.getDate();
                        }
                        else {
                            _this._focusedDay = new Date().getDate();
                        }
                        // Focus the day after dropdown opens
                        setTimeout(function () { return _this._focusDay(); }, 150);
                    }
                }
            }
        });
        // Add an additional event listener to the input field specifically
        var inputs = this._element.querySelectorAll('input');
        inputs.forEach(function (input) {
            input.addEventListener('keydown', function (e) {
                var state = _this._stateManager.getState();
                if (!state.isOpen) {
                    if (e.key === 'Enter' ||
                        e.key === ' ' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                        _this._stateManager.setOpen(true);
                        // Set initial focus day
                        if (_this._focusedDay === null) {
                            if (state.selectedDate) {
                                _this._focusedDay = state.selectedDate.getDate();
                            }
                            else {
                                _this._focusedDay = new Date().getDate();
                            }
                            // Focus the day after dropdown opens
                            setTimeout(function () { return _this._focusDay(); }, 150);
                        }
                    }
                }
            });
        });
        // Add an even more specific listener for Enter key on the display element
        var displayElement = this._element.querySelector('[data-kt-datepicker-display]');
        if (displayElement) {
            displayElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    var state_1 = _this._stateManager.getState();
                    if (!state_1.isOpen) {
                        _this._stateManager.setOpen(true);
                        // Focus the current day with a slightly longer delay
                        setTimeout(function () {
                            if (_this._focusedDay === null) {
                                if (state_1.selectedDate) {
                                    _this._focusedDay = state_1.selectedDate.getDate();
                                }
                                else {
                                    _this._focusedDay = new Date().getDate();
                                }
                            }
                            _this._focusDay();
                        }, 200);
                    }
                }
            }, true); // Use capture phase to ensure this runs first
        }
    };
    /**
     * Activate keyboard navigation
     */
    KTDatepickerKeyboard.prototype._activateKeyboardNavigation = function () {
        var _this = this;
        if (this._isListening)
            return;
        // Add global keydown listener
        document.addEventListener('keydown', this._handleKeyDown);
        this._isListening = true;
        // Set initial focus day if none
        if (this._focusedDay === null) {
            var state = this._stateManager.getState();
            if (state.selectedDate) {
                this._focusedDay = state.selectedDate.getDate();
            }
            else {
                this._focusedDay = new Date().getDate();
            }
            // Focus the day
            setTimeout(function () { return _this._focusDay(); }, 100);
        }
    };
    /**
     * Deactivate keyboard navigation
     */
    KTDatepickerKeyboard.prototype._deactivateKeyboardNavigation = function () {
        if (!this._isListening)
            return;
        // Remove global keydown listener
        document.removeEventListener('keydown', this._handleKeyDown);
        this._isListening = false;
    };
    /**
     * Handle key navigation in days view
     */
    KTDatepickerKeyboard.prototype._handleDaysViewKeyNavigation = function (e) {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var currentDate = new Date(state.currentDate);
        var daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        // Get the day of week for the first day of the month to calculate grid positions
        var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        // Adjust for first day of week setting
        var firstDayOffset = (firstDayOfMonth - config.locales[config.locale].firstDayOfWeek + 7) % 7;
        // Ensure we have a focused day
        if (this._focusedDay === null) {
            if (state.selectedDate) {
                this._focusedDay = state.selectedDate.getDate();
            }
            else {
                this._focusedDay = new Date().getDate();
            }
        }
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                e.stopPropagation(); // Stop event propagation
                if (this._focusedDay === 1) {
                    // Move to previous month
                    var newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    this._stateManager.setCurrentDate(newDate);
                    // Set focus to last day of previous month
                    var lastDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
                    this._focusedDay = lastDayPrevMonth;
                }
                else {
                    this._focusedDay = Math.max(1, (this._focusedDay || 1) - 1);
                }
                this._focusDay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation(); // Stop event propagation
                if (this._focusedDay === daysInMonth) {
                    // Move to next month
                    var newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    this._stateManager.setCurrentDate(newDate);
                    // Set focus to first day of next month
                    this._focusedDay = 1;
                }
                else {
                    this._focusedDay = Math.min(daysInMonth, (this._focusedDay || 1) + 1);
                }
                this._focusDay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation(); // Stop event propagation
                if (this._focusedDay && this._focusedDay <= 7) {
                    // We're in the first row of the current month
                    // Calculate the row position in the grid
                    var dayPosition = (this._focusedDay - 1 + firstDayOffset) % 7;
                    // Move to previous month
                    var newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    this._stateManager.setCurrentDate(newDate);
                    // Get days in previous month
                    var lastDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
                    // Calculate the corresponding day in the previous month's last row
                    // Start with the last day of previous month
                    this._focusedDay = lastDayPrevMonth - (6 - dayPosition);
                }
                else {
                    // Move up one week (7 days)
                    this._focusedDay = (this._focusedDay || 1) - 7;
                }
                this._focusDay();
                break;
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation(); // Stop event propagation
                var lastRowStart = daysInMonth - ((daysInMonth + firstDayOffset) % 7);
                if (this._focusedDay && this._focusedDay > lastRowStart) {
                    // We're in the last row of the current month
                    // Calculate position in last row (0-6)
                    var dayPosition = (this._focusedDay - 1 + firstDayOffset) % 7;
                    // Move to next month
                    var newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    this._stateManager.setCurrentDate(newDate);
                    // Calculate the corresponding day in next month's first row
                    this._focusedDay =
                        dayPosition + 1 - ((dayPosition + firstDayOffset) % 7);
                    // Ensure we're in bounds for next month
                    var nextMonthDays_1 = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
                    this._focusedDay = Math.min(this._focusedDay, nextMonthDays_1);
                }
                else {
                    // Move down one week (7 days)
                    this._focusedDay = Math.min(daysInMonth, (this._focusedDay || 1) + 7);
                }
                this._focusDay();
                break;
            case 'Home':
                e.preventDefault();
                // Move to first day of the month
                this._focusedDay = 1;
                this._focusDay();
                break;
            case 'End':
                e.preventDefault();
                // Move to last day of the month
                this._focusedDay = daysInMonth;
                this._focusDay();
                break;
            case 'PageUp':
                e.preventDefault();
                // Move to previous month
                var prevMonthDate = new Date(currentDate);
                prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
                this._stateManager.setCurrentDate(prevMonthDate);
                // Adjust focused day if needed
                var prevMonthDays = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
                if (this._focusedDay > prevMonthDays) {
                    this._focusedDay = prevMonthDays;
                }
                this._focusDay();
                break;
            case 'PageDown':
                e.preventDefault();
                // Move to next month
                var nextMonthDate = new Date(currentDate);
                nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
                this._stateManager.setCurrentDate(nextMonthDate);
                // Adjust focused day if needed
                var nextMonthDays = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0).getDate();
                if (this._focusedDay > nextMonthDays) {
                    this._focusedDay = nextMonthDays;
                }
                this._focusDay();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (this._focusedDay) {
                    // Select the focused day
                    var selectedDate = new Date(currentDate);
                    selectedDate.setDate(this._focusedDay);
                    if (config.enableTime && state.selectedTime) {
                        selectedDate.setHours(state.selectedTime.hours, state.selectedTime.minutes, state.selectedTime.seconds);
                    }
                    else {
                        selectedDate.setHours(0, 0, 0, 0);
                    }
                    this._stateManager.setSelectedDate(selectedDate);
                    // Close the dropdown if not range selection or if range is complete
                    if (!config.range ||
                        (state.selectedDateRange &&
                            state.selectedDateRange.startDate &&
                            state.selectedDateRange.endDate)) {
                        this._stateManager.setOpen(false);
                    }
                }
                break;
        }
    };
    /**
     * Handle key navigation in months view
     */
    KTDatepickerKeyboard.prototype._handleMonthsViewKeyNavigation = function (e) {
        var state = this._stateManager.getState();
        var currentDate = new Date(state.currentDate);
        var currentMonth = currentDate.getMonth();
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                currentDate.setMonth((currentMonth - 1 + 12) % 12);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowRight':
                e.preventDefault();
                currentDate.setMonth((currentMonth + 1) % 12);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentDate.setMonth((currentMonth - 3 + 12) % 12);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowDown':
                e.preventDefault();
                currentDate.setMonth((currentMonth + 3) % 12);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'Home':
                e.preventDefault();
                currentDate.setMonth(0);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'End':
                e.preventDefault();
                currentDate.setMonth(11);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this._stateManager.setViewMode('days');
                break;
        }
    };
    /**
     * Handle key navigation in years view
     */
    KTDatepickerKeyboard.prototype._handleYearsViewKeyNavigation = function (e) {
        var state = this._stateManager.getState();
        var currentDate = new Date(state.currentDate);
        var currentYear = currentDate.getFullYear();
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                currentDate.setFullYear(currentYear - 1);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowRight':
                e.preventDefault();
                currentDate.setFullYear(currentYear + 1);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentDate.setFullYear(currentYear - 4);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'ArrowDown':
                e.preventDefault();
                currentDate.setFullYear(currentYear + 4);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'Home':
                e.preventDefault();
                var yearsPerView = this._stateManager.getConfig().visibleYears;
                var startYear = currentYear - (currentYear % yearsPerView);
                currentDate.setFullYear(startYear);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'End':
                e.preventDefault();
                var yearsPerPage = this._stateManager.getConfig().visibleYears;
                var startYearEnd = currentYear - (currentYear % yearsPerPage);
                var endYear = startYearEnd + yearsPerPage - 1;
                currentDate.setFullYear(endYear);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'PageUp':
                e.preventDefault();
                var yearsPerPageUp = this._stateManager.getConfig().visibleYears;
                currentDate.setFullYear(currentYear - yearsPerPageUp);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'PageDown':
                e.preventDefault();
                var yearsPerPageDown = this._stateManager.getConfig().visibleYears;
                currentDate.setFullYear(currentYear + yearsPerPageDown);
                this._stateManager.setCurrentDate(currentDate);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this._stateManager.setViewMode('months');
                break;
        }
    };
    /**
     * Focus the currently focused day in the calendar
     */
    KTDatepickerKeyboard.prototype._focusDay = function () {
        if (!this._focusedDay)
            return;
        var state = this._stateManager.getState();
        // Try different selectors for the dropdown
        var selectors = [
            '.absolute.bg-white.shadow-lg.rounded-lg',
            '.kt-datepicker-dropdown',
            '.calendar-container',
        ];
        var dropdown = null;
        for (var _i = 0, selectors_1 = selectors; _i < selectors_1.length; _i++) {
            var selector = selectors_1[_i];
            dropdown = this._element.querySelector(selector);
            if (dropdown)
                break;
        }
        if (!dropdown) {
            // If no dropdown found, try getting any element with calendar buttons
            dropdown =
                this._element.querySelector('.multiple-months') ||
                    this._element.querySelector('[data-kt-datepicker-container]') ||
                    this._element;
        }
        var currentDay = this._focusedDay;
        var currentMonth = state.currentDate.getMonth();
        var currentYear = state.currentDate.getFullYear();
        // First try to find the day in the current month
        var dayButton = dropdown.querySelector("button[data-date=\"".concat(currentDay, "\"]:not(.text-gray-400)"));
        // If not found, try to find any button with the day number
        if (!dayButton) {
            dayButton = dropdown.querySelector("button[data-date=\"".concat(currentDay, "\"]"));
        }
        // If still not found, try to find by date-id
        if (!dayButton) {
            var dateId = "".concat(currentYear, "-").concat(String(currentMonth + 1).padStart(2, '0'), "-").concat(String(currentDay).padStart(2, '0'));
            dayButton = dropdown.querySelector("button[data-date-id=\"".concat(dateId, "\"]"));
        }
        // As a last resort, find any day button
        if (!dayButton) {
            dayButton = dropdown.querySelector('button[data-date]');
        }
        // Focus the day button if found
        if (dayButton) {
            dayButton.focus();
            // Scroll into view if needed
            if (dayButton.scrollIntoView) {
                dayButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    };
    return KTDatepickerKeyboard;
}());
export { KTDatepickerKeyboard };
//# sourceMappingURL=keyboard.js.map