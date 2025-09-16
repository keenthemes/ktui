/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { calendarGridTemplate, dayTemplate, monthYearSelectTemplate, monthSelectionTemplate, yearSelectionTemplate, } from './templates';
import { generateCalendarMonth, getLocaleConfig, isSameDay, isDateDisabled, isDateBetween, isWeekend, } from './utils';
import { KTDatepickerDropdown } from './dropdown';
import { KTDatepickerEventName } from './events';
/**
 * Calendar component for the KTDatepicker
 * Handles rendering and interactions with the calendar
 */
var KTDatepickerCalendar = /** @class */ (function () {
    /**
     * Constructor for the KTDatepickerCalendar class
     *
     * @param element - The datepicker element
     * @param stateManager - State manager for the datepicker
     */
    function KTDatepickerCalendar(element, stateManager) {
        this._calendarContainer = null;
        this._dropdownElement = null;
        this._dropdownManager = null;
        this._isVisible = false;
        this._element = element;
        this._stateManager = stateManager;
        this._eventManager = stateManager.getEventManager();
        // Get current date/time
        var now = new Date();
        this._currentViewMonth = now.getMonth();
        this._currentViewYear = now.getFullYear();
        this._initializeCalendar();
        this._setupEventListeners();
    }
    /**
     * Initialize the calendar
     */
    KTDatepickerCalendar.prototype._initializeCalendar = function () {
        var _this = this;
        var config = this._stateManager.getConfig();
        var locale = getLocaleConfig(config);
        // Create calendar container
        this._dropdownElement = document.createElement('div');
        this._dropdownElement.className = 'kt-datepicker-dropdown';
        this._dropdownElement.setAttribute('role', 'dialog');
        this._dropdownElement.setAttribute('aria-modal', 'true');
        this._dropdownElement.setAttribute('aria-label', 'Calendar');
        // Hidden by default
        this._dropdownElement.classList.add('hidden');
        this._dropdownElement.setAttribute('aria-hidden', 'true');
        // Create header for navigation
        var headerElement = document.createElement('div');
        headerElement.className = 'kt-datepicker-calendar-header';
        // Left navigation button
        var leftNavButton = document.createElement('button');
        leftNavButton.type = 'button';
        leftNavButton.className = 'kt-datepicker-calendar-left-nav-btn';
        leftNavButton.setAttribute('aria-label', 'Previous month');
        leftNavButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
        leftNavButton.addEventListener('click', function () { return _this._navigateMonth(-1); });
        // Month and Year selector (center)
        var headerCenter = document.createElement('div');
        headerCenter.className = 'kt-datepicker-datepicker-header-middle';
        // Right navigation button
        var rightNavButton = document.createElement('button');
        rightNavButton.type = 'button';
        rightNavButton.className = 'kt-dropdown-calendar-right-nav-btn';
        rightNavButton.setAttribute('aria-label', 'Next month');
        rightNavButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>';
        rightNavButton.addEventListener('click', function () { return _this._navigateMonth(1); });
        // Assemble header
        headerElement.appendChild(leftNavButton);
        headerElement.appendChild(headerCenter);
        headerElement.appendChild(rightNavButton);
        this._dropdownElement.appendChild(headerElement);
        // Create calendar content container
        this._calendarContainer = document.createElement('div');
        this._calendarContainer.className = 'kt-datepicker-calendar-container';
        this._dropdownElement.appendChild(this._calendarContainer);
        // Add calendar footer with action buttons
        var footerElement = document.createElement('div');
        footerElement.className = 'kt-datepicker-calendar-footer';
        // Today button
        var todayButton = document.createElement('button');
        todayButton.type = 'button';
        todayButton.className = 'kt-datepicker-calendar-today-btn';
        todayButton.textContent = 'Today';
        todayButton.addEventListener('click', function () { return _this._goToToday(); });
        // Clear button
        var clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'kt-datepicker-calendar-clear-btn';
        clearButton.textContent = 'Clear';
        clearButton.addEventListener('click', function () { return _this._clearSelection(); });
        // Apply button
        var applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.className = 'kt-datepicker-calendar-clear-btn';
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', function () { return _this._applySelection(); });
        // Assemble footer
        footerElement.appendChild(todayButton);
        var rightFooter = document.createElement('div');
        rightFooter.className = 'kt-datepicker-calendar-footer-right';
        rightFooter.appendChild(clearButton);
        rightFooter.appendChild(applyButton);
        footerElement.appendChild(rightFooter);
        this._dropdownElement.appendChild(footerElement);
        // Add to document
        this._element.appendChild(this._dropdownElement);
        // Initialize dropdown manager
        this._initDropdownManager();
        // Initialize calendar view
        this._renderCalendarView();
    };
    /**
     * Initialize the dropdown manager
     */
    KTDatepickerCalendar.prototype._initDropdownManager = function () {
        var _this = this;
        var config = this._stateManager.getConfig();
        // Use the display element rather than the input element
        var displayElement = this._element.querySelector('[data-kt-datepicker-display]');
        var inputElement = this._element.querySelector('[data-kt-datepicker-input]');
        var triggerElement = displayElement || inputElement;
        if (triggerElement && this._dropdownElement) {
            this._dropdownManager = new KTDatepickerDropdown(this._element, triggerElement, this._dropdownElement, config);
            // Add keyboard event listener to the trigger element
            triggerElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!_this._isVisible) {
                        // Open the dropdown
                        _this._stateManager.setOpen(true);
                    }
                }
            });
        }
    };
    /**
     * Set up event listeners for calendar interactions
     */
    KTDatepickerCalendar.prototype._setupEventListeners = function () {
        var _this = this;
        if (!this._dropdownElement)
            return;
        // Get elements
        var prevMonthBtn = this._dropdownElement.querySelector('button[aria-label="Previous Month"]');
        var nextMonthBtn = this._dropdownElement.querySelector('button[aria-label="Next Month"]');
        // Find buttons by text content instead of using jQuery-style selectors
        var buttons = this._dropdownElement.querySelectorAll('button');
        var todayBtn = null;
        var clearBtn = null;
        var applyBtn = null;
        buttons.forEach(function (btn) {
            var _a;
            var btnText = (_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            if (btnText === 'Today')
                todayBtn = btn;
            else if (btnText === 'Clear')
                clearBtn = btn;
            else if (btnText === 'Apply')
                applyBtn = btn;
        });
        var monthYearText = this._dropdownElement.querySelector('.kt-datepicker-calendar-monthyear-text');
        // Month navigation
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function () { return _this._navigateMonth(-1); });
        }
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function () { return _this._navigateMonth(1); });
        }
        // Month/year view toggle
        if (monthYearText) {
            monthYearText.addEventListener('click', function () {
                return _this._toggleMonthYearView();
            });
        }
        // Today, Clear, Apply buttons
        if (todayBtn) {
            todayBtn.addEventListener('click', function () { return _this._goToToday(); });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function () { return _this._clearSelection(); });
        }
        if (applyBtn) {
            applyBtn.addEventListener('click', function () { return _this._applySelection(); });
        }
        // Handle day selection through event delegation
        if (this._calendarContainer) {
            this._calendarContainer.addEventListener('click', function (e) {
                var target = e.target;
                var dayButton = target.closest('button[data-date]');
                if (dayButton && !dayButton.hasAttribute('disabled')) {
                    // Get the date ID directly from the clicked button (YYYY-MM-DD format)
                    var dateIdAttr = dayButton.getAttribute('data-date-id');
                    if (dateIdAttr) {
                        // Parse the ISO date string to get exact year, month, day
                        var _a = dateIdAttr
                            .split('-')
                            .map(function (part) { return parseInt(part, 10); }), year = _a[0], month = _a[1], day = _a[2];
                        // Create the date object from the parsed components
                        var clickedDate = new Date(year, month - 1, day); // Month is 0-indexed in JS
                        clickedDate.setHours(0, 0, 0, 0); // Set to midnight
                        // Handle this date directly instead of using day number
                        _this._handleDateSelection(clickedDate, dayButton);
                    }
                    else {
                        // Fallback to old method using day number if date-id is not present
                        var dateAttr = dayButton.getAttribute('data-date');
                        if (dateAttr) {
                            var day = parseInt(dateAttr, 10);
                            _this._handleDaySelection(day);
                        }
                    }
                }
            });
            // Add hover effect for range selection
            this._calendarContainer.addEventListener('mouseover', function (e) {
                var state = _this._stateManager.getState();
                var config = _this._stateManager.getConfig();
                // Only apply hover effect in range mode when start date is selected but end date is not
                if (!config.range ||
                    !state.selectedDateRange ||
                    !state.selectedDateRange.startDate ||
                    state.selectedDateRange.endDate) {
                    return;
                }
                var target = e.target;
                var dayButton = target.closest('button[data-date]');
                if (dayButton && !dayButton.hasAttribute('disabled')) {
                    // Clear any existing hover classes
                    _this._clearRangeHoverClasses();
                    // Get the proper date from the data-date-id attribute
                    var dateIdAttr = dayButton.getAttribute('data-date-id');
                    if (dateIdAttr) {
                        // Parse the ISO date string (YYYY-MM-DD)
                        var _a = dateIdAttr
                            .split('-')
                            .map(function (part) { return parseInt(part, 10); }), year = _a[0], month = _a[1], day = _a[2];
                        var hoverDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
                        // Apply hover effect between start date and current hover date
                        _this._applyRangeHoverEffect(state.selectedDateRange.startDate, hoverDate);
                    }
                    else {
                        // Fallback to old method if data-date-id is not present
                        var dateAttr = dayButton.getAttribute('data-date');
                        if (dateAttr) {
                            var day = parseInt(dateAttr, 10);
                            var hoverDate = new Date(state.currentDate);
                            hoverDate.setDate(day);
                            // Apply hover effect between start date and current hover date
                            _this._applyRangeHoverEffect(state.selectedDateRange.startDate, hoverDate);
                        }
                    }
                }
            });
            // Clear hover effect when mouse leaves the calendar
            this._calendarContainer.addEventListener('mouseleave', function () {
                _this._clearRangeHoverClasses();
            });
        }
        // Listen for state changes
        this._eventManager.addEventListener(KTDatepickerEventName.STATE_CHANGE, function (e) {
            var _a;
            var detail = (_a = e.detail) === null || _a === void 0 ? void 0 : _a.payload;
            var config = _this._stateManager.getConfig();
            // For range selection, check if we need to keep the dropdown open
            if (config.range && detail && detail.selectedDateRange) {
                var _b = detail.selectedDateRange, startDate = _b.startDate, endDate = _b.endDate;
                // If start date is set but no end date, keep dropdown open
                if (startDate && !endDate) {
                    _this._stateManager.getState().isRangeSelectionInProgress = true;
                }
                else if (startDate && endDate) {
                    _this._stateManager.getState().isRangeSelectionInProgress = false;
                }
            }
            // Update calendar view
            _this._updateCalendarView();
        });
        // Listen for other state changes
        this._eventManager.addEventListener(KTDatepickerEventName.VIEW_CHANGE, function () {
            return _this._updateViewMode();
        });
        this._eventManager.addEventListener(KTDatepickerEventName.OPEN, function () {
            return _this.show();
        });
        this._eventManager.addEventListener(KTDatepickerEventName.CLOSE, function () {
            return _this.hide();
        });
        this._eventManager.addEventListener(KTDatepickerEventName.UPDATE, function () {
            return _this._updateCalendarView();
        });
        // Time inputs
        var timeContainer = this._dropdownElement.querySelector('.kt-datepicker-calendar-time-container');
        if (timeContainer) {
            var hourInput = timeContainer.querySelector('input[aria-label="Hour"]');
            var minuteInput = timeContainer.querySelector('input[aria-label="Minute"]');
            var secondInput = timeContainer.querySelector('input[aria-label="Second"]');
            var amButton = timeContainer.querySelector('button[aria-label="AM"]');
            var pmButton = timeContainer.querySelector('button[aria-label="PM"]');
            // Update AM/PM button texts
            var config = this._stateManager.getConfig();
            if (amButton)
                amButton.textContent = config.am;
            if (pmButton)
                pmButton.textContent = config.pm;
            // Time input listeners
            if (hourInput) {
                hourInput.addEventListener('change', function () { return _this._handleTimeChange(); });
            }
            if (minuteInput) {
                minuteInput.addEventListener('change', function () { return _this._handleTimeChange(); });
            }
            if (secondInput) {
                secondInput.addEventListener('change', function () { return _this._handleTimeChange(); });
            }
            // AM/PM selection
            if (amButton) {
                amButton.addEventListener('click', function () { return _this._setAmPm('AM'); });
            }
            if (pmButton) {
                pmButton.addEventListener('click', function () { return _this._setAmPm('PM'); });
            }
        }
    };
    /**
     * Render the calendar view based on current state
     */
    KTDatepickerCalendar.prototype._renderCalendarView = function () {
        var _this = this;
        if (!this._calendarContainer)
            return;
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var locale = getLocaleConfig(config);
        // Clear existing content
        this._calendarContainer.innerHTML = '';
        // Set up proper container classes for multiple months view
        if (config.visibleMonths > 1) {
            // For multiple months, use a flex container with no wrapping
            this._calendarContainer.className = 'kt-datepicker-calendar-container-mt';
        }
        else {
            this._calendarContainer.className = 'kt-datepicker-calendar-container';
        }
        // Render based on view mode
        switch (state.viewMode) {
            case 'days':
                // For each visible month, create a calendar
                for (var i = 0; i < config.visibleMonths; i++) {
                    // Calculate the month to display
                    var tempDate = new Date(state.currentDate);
                    tempDate.setMonth(state.currentDate.getMonth() + i);
                    var month = tempDate.getMonth();
                    var year = tempDate.getFullYear();
                    // Create month container
                    var monthContainer = document.createElement('div');
                    // Set appropriate class based on number of months
                    if (config.visibleMonths > 1) {
                        // For multiple months, use fixed width and properly spaced
                        monthContainer.className = 'kt-datepicker-calendar-month-mt';
                        monthContainer.setAttribute('data-month-id', "".concat(month, "-").concat(year));
                    }
                    else {
                        monthContainer.className = 'kt-datepicker-calendar-month';
                    }
                    // Add month header
                    var monthHeader = document.createElement('div');
                    monthHeader.className = 'kt-datepicker-calendar-month-header';
                    monthHeader.textContent = "".concat(locale.monthNames[month], " ").concat(year);
                    monthContainer.appendChild(monthHeader);
                    // Generate calendar grid
                    monthContainer.innerHTML += calendarGridTemplate(locale, config.weekDays);
                    // Get days for the month
                    var calendarMatrix = generateCalendarMonth(year, month, config);
                    // Render days
                    var daysBody = monthContainer.querySelector('tbody');
                    if (daysBody) {
                        daysBody.innerHTML = this._renderDays(calendarMatrix, month, year);
                    }
                    // Add to container
                    this._calendarContainer.appendChild(monthContainer);
                }
                // Update the month/year display in header
                this._updateMonthYearDisplay();
                break;
            case 'months':
                // Render month selection view with current month
                var currentMonth = state.currentDate.getMonth();
                this._calendarContainer.innerHTML = monthSelectionTemplate(locale, currentMonth);
                // Add click events to month buttons
                var monthButtons = this._calendarContainer.querySelectorAll('button[data-month]');
                monthButtons.forEach(function (btn) {
                    btn.addEventListener('click', function (e) {
                        var target = e.target;
                        var monthIdx = target.getAttribute('data-month');
                        if (monthIdx) {
                            _this._selectMonth(parseInt(monthIdx, 10));
                        }
                    });
                });
                break;
            case 'years':
                // Get current year and calculate year range
                var currentYear = state.currentDate.getFullYear();
                var startYear_1 = currentYear - Math.floor(config.visibleYears / 2);
                var endYear_1 = startYear_1 + config.visibleYears - 1;
                // Render year selection view
                this._calendarContainer.innerHTML = yearSelectionTemplate(startYear_1, endYear_1, currentYear);
                // Add click events to year buttons
                var yearButtons = this._calendarContainer.querySelectorAll('button[data-year]');
                yearButtons.forEach(function (btn) {
                    btn.addEventListener('click', function (e) {
                        var target = e.target;
                        var year = target.getAttribute('data-year');
                        if (year) {
                            _this._selectYear(parseInt(year, 10));
                        }
                    });
                });
                // Add navigation for year ranges
                var prevYearsBtn = this._calendarContainer.querySelector('button[data-year-nav="prev"]');
                if (prevYearsBtn) {
                    prevYearsBtn.addEventListener('click', function () {
                        var newYear = startYear_1 - config.visibleYears;
                        var newDate = new Date(state.currentDate);
                        newDate.setFullYear(newYear);
                        _this._stateManager.setCurrentDate(newDate);
                        _this._renderCalendarView();
                    });
                }
                var nextYearsBtn = this._calendarContainer.querySelector('button[data-year-nav="next"]');
                if (nextYearsBtn) {
                    nextYearsBtn.addEventListener('click', function () {
                        var newYear = endYear_1 + 1;
                        var newDate = new Date(state.currentDate);
                        newDate.setFullYear(newYear);
                        _this._stateManager.setCurrentDate(newDate);
                        _this._renderCalendarView();
                    });
                }
                break;
        }
    };
    /**
     * Render days for a calendar month
     *
     * @param calendarMatrix - Matrix of dates for the month
     * @param currentMonth - Current month
     * @param currentYear - Current year
     * @returns HTML string for the days
     */
    KTDatepickerCalendar.prototype._renderDays = function (calendarMatrix, currentMonth, currentYear) {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var html = '';
        // Loop through each week
        for (var _i = 0, calendarMatrix_1 = calendarMatrix; _i < calendarMatrix_1.length; _i++) {
            var week = calendarMatrix_1[_i];
            html += '<tr>';
            var _loop_1 = function (date) {
                // Determine cell properties
                var isCurrentMonth = date.getMonth() === currentMonth;
                var isToday = isSameDay(date, today);
                var isSelected = false;
                var isRangeStart = false;
                var isRangeEnd = false;
                var isInRange = false;
                // Check if date is selected
                if (state.selectedDate && isSameDay(date, state.selectedDate)) {
                    isSelected = true;
                }
                // Check if date is in range for range selection
                if (config.range && state.selectedDateRange) {
                    var _b = state.selectedDateRange, startDate = _b.startDate, endDate = _b.endDate;
                    if (startDate && isSameDay(date, startDate)) {
                        isRangeStart = true;
                        isSelected = true;
                    }
                    if (endDate && isSameDay(date, endDate)) {
                        isRangeEnd = true;
                        isSelected = true;
                    }
                    if (startDate && endDate && isDateBetween(date, startDate, endDate)) {
                        isInRange = true;
                    }
                }
                // Check if date is in multi-date selection
                if (config.multiDateSelection && state.selectedDates.length > 0) {
                    isSelected = state.selectedDates.some(function (d) { return isSameDay(date, d); });
                }
                // Check if date is disabled
                var isDisabled = isDateDisabled(date, config);
                // Check if weekend
                var isWeekendDay = isWeekend(date);
                // Get the actual month and year of this date (may differ from currentMonth/currentYear for adjacent months)
                var actualMonth = date.getMonth();
                var actualYear = date.getFullYear();
                // Generate day cell
                html += dayTemplate(date.getDate(), actualMonth, actualYear, isCurrentMonth, isToday, isSelected, isDisabled, isRangeStart, isRangeEnd, isInRange, isWeekendDay);
            };
            // Loop through each day in the week
            for (var _a = 0, week_1 = week; _a < week_1.length; _a++) {
                var date = week_1[_a];
                _loop_1(date);
            }
            html += '</tr>';
        }
        return html;
    };
    /**
     * Update the month and year display in the header
     */
    KTDatepickerCalendar.prototype._updateMonthYearDisplay = function () {
        var _this = this;
        if (!this._dropdownElement)
            return;
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var locale = getLocaleConfig(config);
        // Find the calendar header
        var calendarHeader = this._dropdownElement.querySelector('.kt-datepicker-calendar-header');
        if (!calendarHeader)
            return;
        var currentMonth = state.currentDate.getMonth();
        var currentYear = state.currentDate.getFullYear();
        // Update the header with month/year selectors
        calendarHeader.innerHTML = monthYearSelectTemplate(locale, currentMonth, currentYear);
        // Add event listeners to the month and year selectors
        var monthSelector = calendarHeader.querySelector('.kt-datepicker-calendar-month-selector');
        var yearSelector = calendarHeader.querySelector('.kt-datepicker-calendar-year-selector');
        if (monthSelector) {
            monthSelector.addEventListener('click', function () {
                // Switch to months view
                _this._stateManager.setViewMode('months');
                _this._renderCalendarView();
            });
        }
        if (yearSelector) {
            yearSelector.addEventListener('click', function () {
                // Switch to years view
                _this._stateManager.setViewMode('years');
                _this._renderCalendarView();
            });
        }
    };
    /**
     * Navigate to a different month
     *
     * @param offset - Number of months to offset by
     */
    KTDatepickerCalendar.prototype._navigateMonth = function (offset) {
        var state = this._stateManager.getState();
        var newDate = new Date(state.currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        this._stateManager.setCurrentDate(newDate);
        this._renderCalendarView();
    };
    /**
     * Handle direct date selection (new method that takes the actual date object)
     *
     * @param selectedDate - The exact date that was selected
     * @param clickedButton - The button element that was clicked
     */
    KTDatepickerCalendar.prototype._handleDateSelection = function (selectedDate, clickedButton) {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        // Check if the date is disabled (outside min/max range or explicitly disabled)
        if (isDateDisabled(selectedDate, config)) {
            console.log('Date is disabled, ignoring selection:', selectedDate.toISOString());
            return;
        }
        // Create a new date object set to noon of the selected date in local timezone
        // This prevents timezone shifts causing the wrong date to be selected
        var localSelectedDate = new Date(selectedDate);
        localSelectedDate.setHours(12, 0, 0, 0);
        // Set time if enabled
        if (config.enableTime && state.selectedTime) {
            localSelectedDate.setHours(state.selectedTime.hours, state.selectedTime.minutes, state.selectedTime.seconds, 0);
        }
        // Get the current range state before updating
        var currentRange = state.selectedDateRange;
        var isStartingNewRange = !currentRange ||
            !currentRange.startDate ||
            (currentRange.startDate && currentRange.endDate);
        // Determine if we're in a month different from the currently displayed one
        var selectedMonth = localSelectedDate.getMonth();
        var currentViewMonth = state.currentDate.getMonth();
        var isInDifferentMonth = selectedMonth !== currentViewMonth;
        console.log('Selected date:', localSelectedDate.toISOString(), 'Month:', selectedMonth, 'Current view month:', currentViewMonth, 'Day of month:', localSelectedDate.getDate());
        // Call the state manager's setSelectedDate method
        this._stateManager.setSelectedDate(localSelectedDate);
        // After setting the date, get the updated range state
        var updatedRange = state.selectedDateRange;
        // If we're in range mode, handle specific range selection behavior
        if (config.range) {
            if (isStartingNewRange) {
                console.log('Starting new range selection with date:', localSelectedDate.toISOString());
                // If starting a range with a date in a different month, update the view
                if (isInDifferentMonth) {
                    this._stateManager.setCurrentDate(localSelectedDate);
                }
                // Explicitly clear any hover effects when starting a new range
                this._clearRangeHoverClasses();
            }
            else {
                // This is the second click to complete a range
                console.log('Completing range selection with date:', localSelectedDate.toISOString());
                // If the selected range spans different months and we have multiple visible months
                if (updatedRange &&
                    updatedRange.startDate &&
                    updatedRange.endDate &&
                    config.visibleMonths > 1) {
                    // Determine range start and end months
                    var startMonth = updatedRange.startDate.getMonth();
                    var endMonth = updatedRange.endDate.getMonth();
                    // If range spans multiple months, update view to show the earlier month
                    if (startMonth !== endMonth) {
                        // Show the earlier month as the first visible month
                        var earlierDate = updatedRange.startDate < updatedRange.endDate
                            ? updatedRange.startDate
                            : updatedRange.endDate;
                        this._stateManager.setCurrentDate(earlierDate);
                    }
                }
            }
            // Close dropdown only if range selection is complete
            if (updatedRange && updatedRange.startDate && updatedRange.endDate) {
                this._stateManager.setOpen(false);
            }
        }
        else {
            // For single date selection, close the dropdown
            this._stateManager.setOpen(false);
        }
        // Update calendar view to reflect changes
        this._updateCalendarView();
    };
    /**
     * Handle day selection (legacy method, kept for backward compatibility)
     *
     * @param day - Day number
     */
    KTDatepickerCalendar.prototype._handleDaySelection = function (day) {
        var _a;
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        // Find the clicked button element using data-date attribute
        var dayButtons = (_a = this._calendarContainer) === null || _a === void 0 ? void 0 : _a.querySelectorAll("button[data-date=\"".concat(day, "\"]"));
        if (!dayButtons || dayButtons.length === 0)
            return;
        // First look for the button that matches the clicked target in the current month
        var clickedButton = null;
        // Find the actual button that was likely clicked (prefer current month days)
        for (var i = 0; i < dayButtons.length; i++) {
            var button = dayButtons[i];
            var parentCell = button.closest('td');
            // Check if the day is in the current month (not faded)
            var isCurrentMonth = !button.classList.contains('current') &&
                (!parentCell || !parentCell.classList.contains('current'));
            if (isCurrentMonth) {
                clickedButton = button;
                break;
            }
        }
        // If no current month button found, use the first one
        if (!clickedButton && dayButtons.length > 0) {
            clickedButton = dayButtons[0];
        }
        if (!clickedButton)
            return;
        // Get the proper date from the data-date-id attribute which contains YYYY-MM-DD
        var dateIdAttr = clickedButton.getAttribute('data-date-id');
        if (!dateIdAttr)
            return;
        // Parse the ISO date string
        var _b = dateIdAttr
            .split('-')
            .map(function (part) { return parseInt(part, 10); }), year = _b[0], month = _b[1], dayOfMonth = _b[2];
        // Create the date object with the proper timezone handling
        // We'll set it to noon in local time to avoid timezone issues
        var selectedDate = new Date(year, month - 1, dayOfMonth, 12, 0, 0, 0); // Month is 0-indexed in JS Date, and setting time to noon
        // First check if this date is disabled (outside min/max range)
        if (isDateDisabled(selectedDate, config)) {
            console.log('Date is disabled, ignoring selection:', selectedDate.toISOString());
            return;
        }
        // Use the new direct date selection method
        this._handleDateSelection(selectedDate, clickedButton);
    };
    /**
     * Toggle between days, months, and years view
     */
    KTDatepickerCalendar.prototype._toggleMonthYearView = function () {
        var state = this._stateManager.getState();
        var newMode;
        switch (state.viewMode) {
            case 'days':
                newMode = 'months';
                break;
            case 'months':
                newMode = 'years';
                break;
            case 'years':
                newMode = 'days';
                break;
            default:
                newMode = 'days';
        }
        this._stateManager.setViewMode(newMode);
        this._renderCalendarView();
    };
    /**
     * Update view mode based on state change
     */
    KTDatepickerCalendar.prototype._updateViewMode = function () {
        this._renderCalendarView();
    };
    /**
     * Go to today's date
     */
    KTDatepickerCalendar.prototype._goToToday = function () {
        var today = new Date();
        this._stateManager.setCurrentDate(today);
        this._renderCalendarView();
    };
    /**
     * Clear date selection
     */
    KTDatepickerCalendar.prototype._clearSelection = function () {
        this._stateManager.setSelectedDate(null);
        this._updateCalendarView();
    };
    /**
     * Apply current selection and close dropdown
     */
    KTDatepickerCalendar.prototype._applySelection = function () {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        // For range selection, check if range selection is in progress
        if (config.range && state.isRangeSelectionInProgress) {
            console.log('Apply button clicked, but range selection in progress - keeping dropdown open');
            // Don't close when range selection is in progress
            return;
        }
        // Close dropdown for other cases
        this._stateManager.setOpen(false);
    };
    /**
     * Handle time input changes
     */
    KTDatepickerCalendar.prototype._handleTimeChange = function () {
        if (!this._dropdownElement)
            return;
        var timeContainer = this._dropdownElement.querySelector('.kt-datepicker-calendar-time-container');
        if (!timeContainer)
            return;
        var hourInput = timeContainer.querySelector('input[aria-label="Hour"]');
        var minuteInput = timeContainer.querySelector('input[aria-label="Minute"]');
        var secondInput = timeContainer.querySelector('input[aria-label="Second"]');
        var amButton = timeContainer.querySelector('button[aria-label="AM"]');
        var pmButton = timeContainer.querySelector('button[aria-label="PM"]');
        if (!hourInput || !minuteInput || !secondInput)
            return;
        // Get input values
        var hours = parseInt(hourInput.value, 10);
        var minutes = parseInt(minuteInput.value, 10);
        var seconds = parseInt(secondInput.value, 10);
        // Validate values
        var isValidHours = !isNaN(hours) && hours >= 0 && hours <= 23;
        var isValidMinutes = !isNaN(minutes) && minutes >= 0 && minutes <= 59;
        var isValidSeconds = !isNaN(seconds) && seconds >= 0 && seconds <= 59;
        if (!isValidHours || !isValidMinutes || !isValidSeconds)
            return;
        // Check if using 12-hour format and adjust for AM/PM
        var isPM = amButton && amButton.classList.contains('bg-blue-500');
        if (isPM && hours < 12) {
            hours += 12;
        }
        else if (!isPM && hours === 12) {
            hours = 0;
        }
        // Update time in state
        this._stateManager.setSelectedTime({
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            ampm: isPM ? 'PM' : 'AM',
        });
        // Update selected date with new time if a date is selected
        var state = this._stateManager.getState();
        if (state.selectedDate) {
            var updatedDate = new Date(state.selectedDate);
            updatedDate.setHours(hours, minutes, seconds, 0);
            this._stateManager.setSelectedDate(updatedDate);
        }
    };
    /**
     * Set AM/PM selection
     *
     * @param period - 'AM' or 'PM'
     */
    KTDatepickerCalendar.prototype._setAmPm = function (period) {
        if (!this._dropdownElement)
            return;
        var timeContainer = this._dropdownElement.querySelector('.py-3.border-t');
        if (!timeContainer)
            return;
        var amButton = timeContainer.querySelector('button[aria-label="AM"]');
        var pmButton = timeContainer.querySelector('button[aria-label="PM"]');
        if (!amButton || !pmButton)
            return;
        // Update button states
        if (period === 'AM') {
            amButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
            amButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
            pmButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
            pmButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
        }
        else {
            amButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
            amButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
            pmButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
            pmButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
        }
        // Update time
        this._handleTimeChange();
    };
    /**
     * Select a month
     *
     * @param month - Month index (0-11)
     */
    KTDatepickerCalendar.prototype._selectMonth = function (month) {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var newDate = new Date(state.currentDate);
        newDate.setMonth(month);
        this._stateManager.setCurrentDate(newDate);
        // Only change view mode if keepViewModeOnSelection is false
        if (!config.keepViewModeOnSelection) {
            this._stateManager.setViewMode('days');
        }
        this._renderCalendarView();
    };
    /**
     * Select a year
     *
     * @param year - Year value
     */
    KTDatepickerCalendar.prototype._selectYear = function (year) {
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        var newDate = new Date(state.currentDate);
        newDate.setFullYear(year);
        this._stateManager.setCurrentDate(newDate);
        // Only change view mode if keepViewModeOnSelection is false
        if (!config.keepViewModeOnSelection) {
            this._stateManager.setViewMode('months');
        }
        this._renderCalendarView();
    };
    /**
     * Update calendar view to reflect state changes
     */
    KTDatepickerCalendar.prototype._updateCalendarView = function () {
        this._renderCalendarView();
        this._updateTimeDisplay();
    };
    /**
     * Update time inputs to reflect current time selection
     */
    KTDatepickerCalendar.prototype._updateTimeDisplay = function () {
        if (!this._dropdownElement)
            return;
        var state = this._stateManager.getState();
        var config = this._stateManager.getConfig();
        // Skip if time is not enabled
        if (!config.enableTime)
            return;
        var timeContainer = this._dropdownElement.querySelector('.py-3.border-t');
        if (!timeContainer)
            return;
        var hourInput = timeContainer.querySelector('input[aria-label="Hour"]');
        var minuteInput = timeContainer.querySelector('input[aria-label="Minute"]');
        var secondInput = timeContainer.querySelector('input[aria-label="Second"]');
        var amButton = timeContainer.querySelector('button[aria-label="AM"]');
        var pmButton = timeContainer.querySelector('button[aria-label="PM"]');
        // Get time from selected date or default to current time
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var isAM = true;
        if (state.selectedTime) {
            hours = state.selectedTime.hours;
            minutes = state.selectedTime.minutes;
            seconds = state.selectedTime.seconds;
            isAM = state.selectedTime.ampm === 'AM';
        }
        else if (state.selectedDate) {
            hours = state.selectedDate.getHours();
            minutes = state.selectedDate.getMinutes();
            seconds = state.selectedDate.getSeconds();
            isAM = hours < 12;
        }
        else {
            var now = new Date();
            hours = now.getHours();
            minutes = now.getMinutes();
            seconds = now.getSeconds();
            isAM = hours < 12;
        }
        // Adjust for 12-hour display if needed
        var displayHours = hours;
        if (hourInput && config.timeFormat.includes('h')) {
            displayHours = hours % 12;
            if (displayHours === 0)
                displayHours = 12;
        }
        // Update input values
        if (hourInput)
            hourInput.value =
                config.forceLeadingZero && displayHours < 10
                    ? "0".concat(displayHours)
                    : "".concat(displayHours);
        if (minuteInput)
            minuteInput.value =
                config.forceLeadingZero && minutes < 10 ? "0".concat(minutes) : "".concat(minutes);
        if (secondInput)
            secondInput.value =
                config.forceLeadingZero && seconds < 10 ? "0".concat(seconds) : "".concat(seconds);
        // Update AM/PM buttons
        if (amButton && pmButton) {
            if (isAM) {
                amButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
                amButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
                pmButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
                pmButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
            }
            else {
                amButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
                amButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
                pmButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
                pmButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
            }
        }
    };
    /**
     * Show the calendar dropdown
     */
    KTDatepickerCalendar.prototype.show = function () {
        if (!this._dropdownElement || this._isVisible)
            return;
        // Ensure we're in days view
        var state = this._stateManager.getState();
        if (state.viewMode !== 'days') {
            this._stateManager.setViewMode('days');
        }
        // Render calendar before showing
        this._renderCalendarView();
        this._updateTimeDisplay();
        // Show dropdown using dropdown manager
        if (this._dropdownManager) {
            this._dropdownManager.open();
            this._isVisible = true;
        }
    };
    /**
     * Hide the calendar dropdown
     */
    KTDatepickerCalendar.prototype.hide = function () {
        if (!this._dropdownElement || !this._isVisible)
            return;
        // Hide dropdown using dropdown manager
        if (this._dropdownManager) {
            this._dropdownManager.close();
            this._isVisible = false;
        }
    };
    /**
     * Update dropdown position
     */
    KTDatepickerCalendar.prototype.updatePosition = function () {
        if (this._dropdownManager) {
            this._dropdownManager.updatePosition();
        }
    };
    /**
     * Clear range hover classes from all day cells
     */
    KTDatepickerCalendar.prototype._clearRangeHoverClasses = function () {
        if (!this._calendarContainer)
            return;
        // Find all day cells with hover classes across all month containers
        var hoverCells = this._calendarContainer.querySelectorAll('.bg-blue-50, .text-blue-600, button[data-hover-date="true"]');
        hoverCells.forEach(function (cell) {
            cell.classList.remove('bg-blue-50', 'text-blue-600');
        });
    };
    /**
     * Apply hover effect to show potential range selection
     *
     * @param startDate - Start date of the range
     * @param hoverDate - Current date being hovered
     */
    KTDatepickerCalendar.prototype._applyRangeHoverEffect = function (startDate, hoverDate) {
        var _this = this;
        if (!this._calendarContainer)
            return;
        // Clear any existing hover effects first
        this._clearRangeHoverClasses();
        // Normalize dates to midnight for comparison
        var startDateMidnight = new Date(startDate);
        startDateMidnight.setHours(0, 0, 0, 0);
        var hoverDateMidnight = new Date(hoverDate);
        hoverDateMidnight.setHours(0, 0, 0, 0);
        // Ensure proper order for comparison (start date <= end date)
        var rangeStart = startDateMidnight <= hoverDateMidnight
            ? startDateMidnight
            : hoverDateMidnight;
        var rangeEnd = startDateMidnight <= hoverDateMidnight
            ? hoverDateMidnight
            : startDateMidnight;
        // Generate all dates in the range as ISO strings (YYYY-MM-DD)
        var dateRangeISOStrings = [];
        var currentDate = new Date(rangeStart);
        while (currentDate <= rangeEnd) {
            // Format as YYYY-MM-DD
            var year = currentDate.getFullYear();
            var month = String(currentDate.getMonth() + 1).padStart(2, '0');
            var day = String(currentDate.getDate()).padStart(2, '0');
            dateRangeISOStrings.push("".concat(year, "-").concat(month, "-").concat(day));
            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Apply hover effect to all day cells in the range using the date-id attribute
        dateRangeISOStrings.forEach(function (dateStr) {
            // Find the day cell with matching date-id
            var dayCells = _this._calendarContainer.querySelectorAll("button[data-date-id=\"".concat(dateStr, "\"]"));
            dayCells.forEach(function (cell) {
                // Skip if this is already a selected date (has blue background)
                if (cell.classList.contains('bg-blue-600'))
                    return;
                // Apply hover effect
                cell.classList.add('bg-blue-50', 'text-blue-600');
            });
        });
    };
    return KTDatepickerCalendar;
}());
export { KTDatepickerCalendar };
//# sourceMappingURL=calendar.js.map