"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTDatepicker = void 0;
var component_1 = __importDefault(require("../component"));
var calendar_1 = require("./calendar");
var config_1 = require("./config");
var keyboard_1 = require("./keyboard");
var utils_1 = require("./utils");
var templates_1 = require("./templates");
var events_1 = require("./events");
// Helper function to replace stringToElement
function createElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}
/**
 * KTDatepicker - Main datepicker component class
 * Manages the datepicker functionality and integration with input elements
 */
var KTDatepicker = /** @class */ (function (_super) {
    __extends(KTDatepicker, _super);
    /**
     * Constructor for the KTDatepicker class.
     */
    function KTDatepicker(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'datepicker';
        _this._dateInputElement = null;
        _this._startDateInputElement = null;
        _this._endDateInputElement = null;
        _this._displayElement = null;
        _this._useSegmentedDisplay = false;
        _this._displayWrapper = null;
        _this._displayText = null;
        _this._currentDate = null;
        _this._currentRange = null;
        _this._segmentFocused = null;
        // Check if the element already has a datepicker instance attached to it
        if (element.getAttribute('data-kt-datepicker-initialized') === 'true') {
            return _this;
        }
        // Initialize the datepicker with the provided element
        _this._init(element);
        // Build the configuration object by merging the default config with the provided config
        _this._buildConfig(config);
        // Store the instance of the datepicker directly on the element
        element.instance = _this;
        // Ensure the element is focusable
        _this._element.setAttribute('tabindex', '0');
        _this._element.classList.add('kt-datepicker', 'relative', 'focus:outline-none');
        // Mark as initialized
        _this._element.setAttribute('data-kt-datepicker-initialized', 'true');
        // Find input elements
        _this._initializeInputElements();
        // Create display element if needed
        _this._createDisplayElement();
        // Create state manager first
        _this._state = new config_1.KTDatepickerStateManager(_this._element, _this._config);
        _this._config = _this._state.getConfig();
        // Initialize the calendar and keyboard after creating the state manager
        _this._calendar = new calendar_1.KTDatepickerCalendar(_this._element, _this._state);
        _this._keyboard = new keyboard_1.KTDatepickerKeyboard(_this._element, _this._state);
        // Initialize event manager
        _this._eventManager = _this._state.getEventManager();
        // Set up event listeners
        _this._setupEventListeners();
        // Initialize with any default values
        _this._initializeDefaultValues();
        return _this;
    }
    /**
     * Initialize input elements
     */
    KTDatepicker.prototype._initializeInputElements = function () {
        // Get main input element - will be hidden
        this._dateInputElement = this._element.querySelector('[data-kt-datepicker-input]');
        // Hide the input element and make it only for data storage
        if (this._dateInputElement) {
            this._dateInputElement.classList.add('hidden', 'sr-only');
            this._dateInputElement.setAttribute('aria-hidden', 'true');
            this._dateInputElement.tabIndex = -1;
        }
        // Get range input elements if applicable
        this._startDateInputElement = this._element.querySelector('[data-kt-datepicker-start]');
        this._endDateInputElement = this._element.querySelector('[data-kt-datepicker-end]');
        // Get display element if exists
        this._displayElement = this._element.querySelector('[data-kt-datepicker-display]');
        // Check if we should use segmented display
        this._useSegmentedDisplay =
            this._element.hasAttribute('data-kt-datepicker-segmented') ||
                this._element.hasAttribute('data-kt-datepicker-segmented-input');
    };
    /**
     * Create display element for datepicker
     */
    KTDatepicker.prototype._createDisplayElement = function () {
        var _this = this;
        var _a;
        // Skip if already created
        if (this._displayElement) {
            return;
        }
        // Get format from config or use default
        var format = this._config.format || 'mm/dd/yyyy';
        var placeholder = ((_a = this._dateInputElement) === null || _a === void 0 ? void 0 : _a.getAttribute('placeholder')) || format;
        // Create wrapper for display element
        this._displayWrapper = document.createElement('div');
        this._displayWrapper.className =
            'kt-datepicker-display-wrapper kt-datepicker-display-segment';
        this._displayWrapper.setAttribute('role', 'combobox');
        this._displayWrapper.setAttribute('aria-haspopup', 'dialog');
        this._displayWrapper.setAttribute('aria-expanded', 'false');
        this._element.appendChild(this._displayWrapper);
        if (this._useSegmentedDisplay) {
            // Create segmented display for better date part selection
            var displayContainer = document.createElement('div');
            displayContainer.className = 'kt-datepicker-display-element';
            displayContainer.setAttribute('tabindex', '0');
            displayContainer.setAttribute('role', 'textbox');
            displayContainer.setAttribute('aria-label', placeholder);
            displayContainer.setAttribute('data-kt-datepicker-display', '');
            // Add segmented template based on range mode
            if (this._config.range) {
                displayContainer.innerHTML = (0, templates_1.segmentedDateRangeInputTemplate)(this._config.format || 'mm/dd/yyyy');
            }
            else {
                displayContainer.innerHTML = (0, templates_1.segmentedDateInputTemplate)(this._config.format || 'mm/dd/yyyy');
            }
            this._displayElement = displayContainer;
            this._displayWrapper.appendChild(this._displayElement);
            // Add click handlers for segments
            var segments = this._displayElement.querySelectorAll('[data-segment]');
            segments.forEach(function (segment) {
                segment.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var segmentType = segment.getAttribute('data-segment');
                    _this._handleSegmentClick(segmentType);
                });
            });
        }
        else {
            // Create simple display element
            this._displayElement = document.createElement('div');
            this._displayElement.className = 'kt-datepicker-display-element';
            this._displayElement.setAttribute('tabindex', '0');
            this._displayElement.setAttribute('role', 'textbox');
            this._displayElement.setAttribute('aria-label', placeholder);
            this._displayElement.setAttribute('data-placeholder', placeholder);
            this._displayElement.setAttribute('data-kt-datepicker-display', '');
            // Create display text element
            this._displayText = document.createElement('span');
            this._displayText.className = 'kt-datepicker-display-text';
            this._displayText.textContent = placeholder;
            this._displayText.classList.add('text-gray-400');
            this._displayElement.appendChild(this._displayText);
            this._displayWrapper.appendChild(this._displayElement);
        }
        // Add click event to display element
        this._displayElement.addEventListener('click', function (e) {
            e.preventDefault();
            if (!_this._state.getState().isOpen) {
                _this._state.setOpen(true);
            }
        });
        // Enhanced keyboard event handling for display element
        this._displayElement.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                // If not already open, open the dropdown
                if (!_this._state.getState().isOpen) {
                    _this._state.setOpen(true);
                    // Dispatch a custom event to notify about the keyboard open
                    _this._eventManager.dispatchKeyboardOpenEvent();
                }
            }
        });
    };
    /**
     * Handle segment click to focus and open appropriate view
     *
     * @param segmentType - Type of segment clicked
     */
    KTDatepicker.prototype._handleSegmentClick = function (segmentType) {
        if (!segmentType)
            return;
        // Store the focused segment
        this._segmentFocused = segmentType;
        // Remove highlight from all segments
        this._removeSegmentHighlights();
        // Add highlight to clicked segment
        if (this._displayElement) {
            var segment = this._displayElement.querySelector("[data-segment=\"".concat(segmentType, "\"]"));
            if (segment) {
                segment.classList.add('kt-datepicker-segment-focused');
            }
        }
        // Set the appropriate view mode based on segment type
        if (segmentType.includes('day')) {
            // Day segment - open in days view (default)
            this._state.setViewMode('days');
            this._state.setOpen(true);
        }
        else if (segmentType.includes('month')) {
            // Month segment - open in months view
            this._state.setViewMode('months');
            this._state.setOpen(true);
        }
        else if (segmentType.includes('year')) {
            // Year segment - open in years view
            this._state.setViewMode('years');
            this._state.setOpen(true);
        }
    };
    /**
     * Set up event listeners
     */
    KTDatepicker.prototype._setupEventListeners = function () {
        var _this = this;
        // Listen for state changes
        this._eventManager.addEventListener(events_1.KTDatepickerEventName.STATE_CHANGE, function (e) {
            var state = e.detail.state;
            // Update ARIA attributes based on open state
            if (_this._displayWrapper) {
                _this._displayWrapper.setAttribute('aria-expanded', state.isOpen.toString());
            }
            // Update display when closing
            if (!state.isOpen && state.prevIsOpen) {
                _this._syncDisplayWithSelectedDate();
            }
        });
        // Set up change event listener to update input values
        this._eventManager.addEventListener(events_1.KTDatepickerEventName.DATE_CHANGE, this._handleDateChange.bind(this));
        // Add keyboard events to the root element
        this._element.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                var state = _this._state.getState();
                if (!state.isOpen) {
                    e.preventDefault();
                    _this._state.setOpen(true);
                }
            }
        });
        // Add keyboard navigation for segments
        if (this._displayElement && this._useSegmentedDisplay) {
            this._displayElement.addEventListener('keydown', this._handleSegmentKeydown.bind(this));
        }
    };
    /**
     * Handle keyboard navigation between segments
     *
     * @param e - Keyboard event
     */
    KTDatepicker.prototype._handleSegmentKeydown = function (e) {
        // Only handle if we have a focused segment
        if (!this._segmentFocused)
            return;
        var target = e.target;
        var segmentType = target.getAttribute('data-segment');
        if (!segmentType)
            return;
        // Handle keyboard navigation
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this._navigateSegments('prev', segmentType);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this._navigateSegments('next', segmentType);
                break;
            case 'Tab':
                // Let default tab behavior work, but update focus segment when tabbing
                this._segmentFocused = segmentType;
                // Remove highlight from all segments
                this._removeSegmentHighlights();
                // Add highlight to current segment
                target.classList.add('segment-focused');
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this._handleSegmentClick(segmentType);
                break;
        }
    };
    /**
     * Navigate between segments with keyboard
     *
     * @param direction - 'prev' or 'next'
     * @param currentSegment - Current segment identifier
     */
    KTDatepicker.prototype._navigateSegments = function (direction, currentSegment) {
        if (!this._displayElement)
            return;
        // Define segment order
        var segments;
        if (this._config.range) {
            segments = [
                'start-month',
                'start-day',
                'start-year',
                'end-month',
                'end-day',
                'end-year',
            ];
        }
        else {
            segments = ['month', 'day', 'year'];
        }
        // Find current index
        var currentIndex = segments.indexOf(currentSegment);
        if (currentIndex === -1)
            return;
        // Calculate new index
        var newIndex;
        if (direction === 'prev') {
            newIndex = currentIndex === 0 ? segments.length - 1 : currentIndex - 1;
        }
        else {
            newIndex = currentIndex === segments.length - 1 ? 0 : currentIndex + 1;
        }
        // Find new segment element
        var newSegment = this._displayElement.querySelector("[data-segment=\"".concat(segments[newIndex], "\"]"));
        if (!newSegment)
            return;
        // Update focus
        newSegment.focus();
        this._segmentFocused = segments[newIndex];
        // Remove highlight from all segments
        this._removeSegmentHighlights();
        // Add highlight to new segment
        newSegment.classList.add('segment-focused');
    };
    /**
     * Remove highlight from all segments
     */
    KTDatepicker.prototype._removeSegmentHighlights = function () {
        if (!this._displayElement)
            return;
        var segments = this._displayElement.querySelectorAll('.segment-part');
        segments.forEach(function (segment) {
            segment.classList.remove('segment-focused');
        });
    };
    /**
     * Sync display element with the selected date
     */
    KTDatepicker.prototype._syncDisplayWithSelectedDate = function () {
        var _a;
        if (!this._displayElement)
            return;
        var state = this._state.getState();
        var selectedDate = state.selectedDate;
        var selectedDateRange = state.selectedDateRange;
        if (this._useSegmentedDisplay) {
            // Update segmented display elements
            if (selectedDate) {
                // Single date
                var daySegment = this._displayElement.querySelector('[data-segment="day"]');
                var monthSegment = this._displayElement.querySelector('[data-segment="month"]');
                var yearSegment = this._displayElement.querySelector('[data-segment="year"]');
                if (daySegment) {
                    daySegment.textContent = selectedDate
                        .getDate()
                        .toString()
                        .padStart(2, '0');
                }
                if (monthSegment) {
                    monthSegment.textContent = (selectedDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0');
                }
                if (yearSegment) {
                    yearSegment.textContent = selectedDate.getFullYear().toString();
                }
            }
            else if (selectedDateRange && selectedDateRange.startDate) {
                // Range selection
                var startDay = this._displayElement.querySelector('[data-segment="start-day"]');
                var startMonth = this._displayElement.querySelector('[data-segment="start-month"]');
                var startYear = this._displayElement.querySelector('[data-segment="start-year"]');
                if (startDay) {
                    startDay.textContent = selectedDateRange.startDate
                        .getDate()
                        .toString()
                        .padStart(2, '0');
                }
                if (startMonth) {
                    startMonth.textContent = (selectedDateRange.startDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0');
                }
                if (startYear) {
                    startYear.textContent = selectedDateRange.startDate
                        .getFullYear()
                        .toString();
                }
                if (selectedDateRange.endDate) {
                    var endDay = this._displayElement.querySelector('[data-segment="end-day"]');
                    var endMonth = this._displayElement.querySelector('[data-segment="end-month"]');
                    var endYear = this._displayElement.querySelector('[data-segment="end-year"]');
                    if (endDay) {
                        endDay.textContent = selectedDateRange.endDate
                            .getDate()
                            .toString()
                            .padStart(2, '0');
                    }
                    if (endMonth) {
                        endMonth.textContent = (selectedDateRange.endDate.getMonth() + 1)
                            .toString()
                            .padStart(2, '0');
                    }
                    if (endYear) {
                        endYear.textContent = selectedDateRange.endDate
                            .getFullYear()
                            .toString();
                    }
                }
            }
        }
        else if (this._displayText) {
            // Simple display
            if (selectedDate) {
                // Clear placeholder styling
                this._displayText.classList.remove('placeholder');
                // Format date(s) based on config
                if (this._config.range &&
                    selectedDateRange &&
                    selectedDateRange.startDate &&
                    selectedDateRange.endDate) {
                    this._displayText.textContent = "".concat((0, utils_1.formatDate)(selectedDateRange.startDate, this._config.format, this._config), " - ").concat((0, utils_1.formatDate)(selectedDateRange.endDate, this._config.format, this._config));
                }
                else {
                    this._displayText.textContent = (0, utils_1.formatDate)(selectedDate, this._config.format, this._config);
                }
            }
            else {
                // No date selected, show format as placeholder
                var placeholder = ((_a = this._displayElement) === null || _a === void 0 ? void 0 : _a.getAttribute('data-placeholder')) ||
                    this._config.format;
                this._displayText.textContent = placeholder;
                this._displayText.classList.add('placeholder');
            }
        }
    };
    /**
     * Handle date change events
     *
     * @param e - Custom event with date change details
     */
    KTDatepicker.prototype._handleDateChange = function (e) {
        var _a;
        var detail = (_a = e.detail) === null || _a === void 0 ? void 0 : _a.payload;
        if (!detail)
            return;
        // Handle single date selection
        if (detail.selectedDate) {
            var formattedDate = (0, utils_1.formatDate)(detail.selectedDate, this._config.format, this._config);
            // Update hidden input value
            if (this._dateInputElement) {
                this._dateInputElement.value = formattedDate;
                // Dispatch change event on input to trigger form validation
                this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // Update display element
            this._updateDisplayElement(detail.selectedDate);
        }
        // Handle date range selection
        if (detail.selectedDateRange && this._config.range) {
            var _b = detail.selectedDateRange, startDate = _b.startDate, endDate = _b.endDate;
            // Format the range for the hidden input
            if (this._dateInputElement) {
                var displayValue = '';
                if (startDate) {
                    displayValue = (0, utils_1.formatDate)(startDate, this._config.format, this._config);
                    if (endDate) {
                        var endFormatted = (0, utils_1.formatDate)(endDate, this._config.format, this._config);
                        displayValue += "".concat(this._config.rangeSeparator).concat(endFormatted);
                    }
                }
                this._dateInputElement.value = displayValue;
                // Dispatch change event on input
                this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // Update individual start/end inputs if they exist
            if (this._startDateInputElement && startDate) {
                this._startDateInputElement.value = (0, utils_1.formatDate)(startDate, this._config.format, this._config);
                this._startDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (this._endDateInputElement && endDate) {
                this._endDateInputElement.value = (0, utils_1.formatDate)(endDate, this._config.format, this._config);
                this._endDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // Update display element for range
            this._updateRangeDisplayElement(startDate, endDate);
        }
    };
    /**
     * Update the display element for a single date
     *
     * @param date - The date to display
     */
    KTDatepicker.prototype._updateDisplayElement = function (date) {
        var _a;
        if (!this._displayElement)
            return;
        if (!date) {
            // If no date, show placeholder
            var placeholder = ((_a = this._dateInputElement) === null || _a === void 0 ? void 0 : _a.getAttribute('placeholder')) || 'Select date';
            this._displayElement.innerHTML = (0, templates_1.placeholderTemplate)(placeholder);
            return;
        }
        if (this._useSegmentedDisplay) {
            // Update segmented display
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var daySegment = this._displayElement.querySelector('[data-segment="day"]');
            var monthSegment = this._displayElement.querySelector('[data-segment="month"]');
            var yearSegment = this._displayElement.querySelector('[data-segment="year"]');
            if (daySegment)
                daySegment.textContent = day < 10 ? "0".concat(day) : "".concat(day);
            if (monthSegment)
                monthSegment.textContent = month < 10 ? "0".concat(month) : "".concat(month);
            if (yearSegment)
                yearSegment.textContent = "".concat(year);
        }
        else {
            // Simple display
            this._displayElement.textContent = (0, utils_1.formatDate)(date, this._config.format, this._config);
        }
    };
    /**
     * Update the display element for a date range
     *
     * @param startDate - The start date of the range
     * @param endDate - The end date of the range
     */
    KTDatepicker.prototype._updateRangeDisplayElement = function (startDate, endDate) {
        var _a;
        if (!this._displayElement)
            return;
        if (!startDate) {
            // If no date, show placeholder
            var placeholder = ((_a = this._dateInputElement) === null || _a === void 0 ? void 0 : _a.getAttribute('placeholder')) ||
                'Select date range';
            this._displayElement.innerHTML = (0, templates_1.placeholderTemplate)(placeholder);
            return;
        }
        if (this._useSegmentedDisplay) {
            // Update segmented range display
            // Start date segments
            var startDay = this._displayElement.querySelector('[data-segment="start-day"]');
            var startMonth = this._displayElement.querySelector('[data-segment="start-month"]');
            var startYear = this._displayElement.querySelector('[data-segment="start-year"]');
            if (startDay)
                startDay.textContent =
                    startDate.getDate() < 10
                        ? "0".concat(startDate.getDate())
                        : "".concat(startDate.getDate());
            if (startMonth)
                startMonth.textContent =
                    startDate.getMonth() + 1 < 10
                        ? "0".concat(startDate.getMonth() + 1)
                        : "".concat(startDate.getMonth() + 1);
            if (startYear)
                startYear.textContent = "".concat(startDate.getFullYear());
            // End date segments
            if (endDate) {
                var endDay = this._displayElement.querySelector('[data-segment="end-day"]');
                var endMonth = this._displayElement.querySelector('[data-segment="end-month"]');
                var endYear = this._displayElement.querySelector('[data-segment="end-year"]');
                if (endDay)
                    endDay.textContent =
                        endDate.getDate() < 10
                            ? "0".concat(endDate.getDate())
                            : "".concat(endDate.getDate());
                if (endMonth)
                    endMonth.textContent =
                        endDate.getMonth() + 1 < 10
                            ? "0".concat(endDate.getMonth() + 1)
                            : "".concat(endDate.getMonth() + 1);
                if (endYear)
                    endYear.textContent = "".concat(endDate.getFullYear());
            }
        }
        else {
            // Simple display
            var displayText = (0, utils_1.formatDate)(startDate, this._config.format, this._config);
            if (endDate) {
                var endFormatted = (0, utils_1.formatDate)(endDate, this._config.format, this._config);
                displayText += "".concat(this._config.rangeSeparator).concat(endFormatted);
            }
            this._displayElement.textContent = displayText;
        }
    };
    /**
     * Handle input change events
     *
     * @param e - Input change event
     */
    KTDatepicker.prototype._handleInputChange = function (e) {
        var input = e.target;
        var inputValue = input.value.trim();
        if (!inputValue) {
            // Clear selection if input is empty
            this._state.setSelectedDate(null);
            return;
        }
        if (this._config.range) {
            // Handle range input
            var rangeParts = inputValue.split(this._config.rangeSeparator);
            if (rangeParts.length === 2) {
                var startDate = (0, utils_1.parseDate)(rangeParts[0].trim(), this._config.format, this._config);
                var endDate = (0, utils_1.parseDate)(rangeParts[1].trim(), this._config.format, this._config);
                // Validate dates are within min/max constraints
                if (startDate && (0, utils_1.isDateDisabled)(startDate, this._config)) {
                    console.log('Start date from input is outside allowed range:', startDate.toISOString());
                    return;
                }
                if (endDate && (0, utils_1.isDateDisabled)(endDate, this._config)) {
                    console.log('End date from input is outside allowed range:', endDate.toISOString());
                    return;
                }
                if (startDate && endDate) {
                    this.setDateRange(startDate, endDate);
                }
            }
            else if (rangeParts.length === 1) {
                var singleDate = (0, utils_1.parseDate)(rangeParts[0].trim(), this._config.format, this._config);
                // Validate date is within min/max constraints
                if (singleDate && (0, utils_1.isDateDisabled)(singleDate, this._config)) {
                    console.log('Date from input is outside allowed range:', singleDate.toISOString());
                    return;
                }
                if (singleDate) {
                    this.setDateRange(singleDate, null);
                }
            }
        }
        else {
            // Handle single date input
            var parsedDate = (0, utils_1.parseDate)(inputValue, this._config.format, this._config);
            // Validate date is within min/max constraints
            if (parsedDate && (0, utils_1.isDateDisabled)(parsedDate, this._config)) {
                console.log('Date from input is outside allowed range:', parsedDate.toISOString());
                return;
            }
            if (parsedDate) {
                this.setDate(parsedDate);
            }
        }
    };
    /**
     * Initialize with default values from input
     */
    KTDatepicker.prototype._initializeDefaultValues = function () {
        // Set min and max dates from attributes if they exist
        var minDateAttr = this._element.getAttribute('data-kt-datepicker-min-date');
        var maxDateAttr = this._element.getAttribute('data-kt-datepicker-max-date');
        if (minDateAttr) {
            var minDate = (0, utils_1.parseDate)(minDateAttr, this._config.format, this._config);
            if (minDate) {
                this.setMinDate(minDate);
            }
        }
        if (maxDateAttr) {
            var maxDate = (0, utils_1.parseDate)(maxDateAttr, this._config.format, this._config);
            if (maxDate) {
                this.setMaxDate(maxDate);
            }
        }
        // Check for default value in main input
        if (this._dateInputElement && this._dateInputElement.value) {
            this._handleInputChange({
                target: this._dateInputElement,
            });
        }
        // Check for default values in range inputs
        else if (this._config.range &&
            this._startDateInputElement &&
            this._startDateInputElement.value) {
            var startDate = (0, utils_1.parseDate)(this._startDateInputElement.value, this._config.format, this._config);
            var endDate = null;
            if (this._endDateInputElement && this._endDateInputElement.value) {
                endDate = (0, utils_1.parseDate)(this._endDateInputElement.value, this._config.format, this._config);
            }
            if (startDate) {
                this.setDateRange(startDate, endDate);
            }
        }
    };
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
    KTDatepicker.prototype.getDate = function () {
        var state = this._state.getState();
        var config = this._state.getConfig();
        if (config.range) {
            return state.selectedDateRange || { startDate: null, endDate: null };
        }
        else {
            return state.selectedDate;
        }
    };
    /**
     * Set the selected date
     *
     * @param date - Date to select or null to clear selection
     */
    KTDatepicker.prototype.setDate = function (date) {
        // Skip if the date is disabled (outside min/max range)
        if (date && (0, utils_1.isDateDisabled)(date, this._config)) {
            console.log('Date is disabled in setDate, ignoring selection:', date.toISOString());
            return;
        }
        this._state.setSelectedDate(date);
        if (date) {
            this._state.setCurrentDate(date);
        }
        // Update the display
        this._updateDisplayElement(date);
        // Update hidden input
        if (this._dateInputElement && date) {
            this._dateInputElement.value = (0, utils_1.formatDate)(date, this._config.format, this._config);
            this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
        else if (this._dateInputElement) {
            this._dateInputElement.value = '';
            this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };
    /**
     * Get the currently selected date range
     *
     * @returns Selected date range or null if no selection
     */
    KTDatepicker.prototype.getDateRange = function () {
        var state = this._state.getState();
        return state.selectedDateRange;
    };
    /**
     * Set the selected date range
     *
     * @param start - Start date of the range
     * @param end - End date of the range
     */
    KTDatepicker.prototype.setDateRange = function (start, end) {
        var _a;
        var state = this._state.getState();
        // Ensure we're in range mode
        if (!this._config.range) {
            console.warn('Cannot set date range when range mode is disabled');
            return;
        }
        // Validate start and end dates are within min/max range
        if (start && (0, utils_1.isDateDisabled)(start, this._config)) {
            console.log('Start date is disabled in setDateRange, ignoring selection:', start.toISOString());
            return;
        }
        if (end && (0, utils_1.isDateDisabled)(end, this._config)) {
            console.log('End date is disabled in setDateRange, ignoring selection:', end.toISOString());
            return;
        }
        // Reset range selection state
        this._state.getState().isRangeSelectionStart = true;
        // Set start date
        if (start) {
            if (!state.selectedDateRange) {
                state.selectedDateRange = { startDate: null, endDate: null };
            }
            state.selectedDateRange.startDate = start;
            this._state.setCurrentDate(start);
            // Set end date if provided
            if (end) {
                state.selectedDateRange.endDate = end;
            }
            else {
                state.selectedDateRange.endDate = null;
            }
            // Update display element
            this._updateRangeDisplayElement(start, end);
            // Update hidden inputs
            if (this._dateInputElement) {
                var inputValue = (0, utils_1.formatDate)(start, this._config.format, this._config);
                if (end) {
                    inputValue += "".concat(this._config.rangeSeparator).concat((0, utils_1.formatDate)(end, this._config.format, this._config));
                }
                this._dateInputElement.value = inputValue;
                this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (this._startDateInputElement) {
                this._startDateInputElement.value = (0, utils_1.formatDate)(start, this._config.format, this._config);
                this._startDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (this._endDateInputElement && end) {
                this._endDateInputElement.value = (0, utils_1.formatDate)(end, this._config.format, this._config);
                this._endDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            else if (this._endDateInputElement) {
                this._endDateInputElement.value = '';
            }
            // Dispatch change event
            this._eventManager.dispatchEvent(events_1.KTDatepickerEventName.DATE_CHANGE, {
                selectedDateRange: state.selectedDateRange,
            });
        }
        else {
            // Clear selection
            this._state.getState().selectedDateRange = null;
            // Clear display
            if (this._displayElement) {
                var placeholder = ((_a = this._dateInputElement) === null || _a === void 0 ? void 0 : _a.getAttribute('placeholder')) ||
                    'Select date range';
                this._displayElement.innerHTML = (0, templates_1.placeholderTemplate)(placeholder);
            }
            // Clear inputs
            if (this._dateInputElement) {
                this._dateInputElement.value = '';
                this._dateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (this._startDateInputElement) {
                this._startDateInputElement.value = '';
                this._startDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (this._endDateInputElement) {
                this._endDateInputElement.value = '';
                this._endDateInputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            this._eventManager.dispatchEvent(events_1.KTDatepickerEventName.DATE_CHANGE, {
                selectedDateRange: null,
            });
        }
    };
    /**
     * Set the minimum selectable date
     *
     * @param minDate - Minimum date or null to remove constraint
     */
    KTDatepicker.prototype.setMinDate = function (minDate) {
        this._config.minDate = minDate;
        // Refresh calendar view to apply new constraints
        this._eventManager.dispatchEvent(events_1.KTDatepickerEventName.UPDATE);
    };
    /**
     * Set the maximum selectable date
     *
     * @param maxDate - Maximum date or null to remove constraint
     */
    KTDatepicker.prototype.setMaxDate = function (maxDate) {
        this._config.maxDate = maxDate;
        // Refresh calendar view to apply new constraints
        this._eventManager.dispatchEvent(events_1.KTDatepickerEventName.UPDATE);
    };
    /**
     * Update the datepicker (refresh view)
     */
    KTDatepicker.prototype.update = function () {
        // Trigger calendar update through events
        this._eventManager.dispatchEvent(events_1.KTDatepickerEventName.UPDATE);
    };
    /**
     * Destroy the datepicker instance and clean up
     */
    KTDatepicker.prototype.destroy = function () {
        // Remove event listeners
        this._eventManager.removeEventListener(events_1.KTDatepickerEventName.DATE_CHANGE, this._handleDateChange.bind(this));
        if (this._dateInputElement) {
            this._dateInputElement.removeEventListener('change', this._handleInputChange.bind(this));
        }
        if (this._displayElement) {
            this._displayElement.remove();
        }
        // Remove instance from element
        this._element.removeAttribute('data-kt-datepicker-initialized');
        delete this._element.instance;
        // Remove initialized class
        this._element.classList.remove('relative');
        // Remove from instances map
        KTDatepicker._instances.delete(this._element);
    };
    /**
     * Dispatch a custom event
     *
     * @param eventName - Name of the event
     * @param payload - Optional event payload
     */
    KTDatepicker.prototype._dispatchEvent = function (eventName, payload) {
        this._eventManager.dispatchEvent(eventName, payload);
    };
    /**
     * Create instances for all datepicker elements on the page
     */
    KTDatepicker.createInstances = function () {
        var _this = this;
        var elements = document.querySelectorAll('[data-kt-datepicker]');
        elements.forEach(function (element) {
            if (element.hasAttribute('data-kt-datepicker') &&
                !element.getAttribute('data-kt-datepicker-initialized')) {
                // Create instance
                var instance = new KTDatepicker(element);
                _this._instances.set(element, instance);
            }
        });
    };
    /**
     * Initialize all datepickers on the page
     */
    KTDatepicker.init = function () {
        KTDatepicker.createInstances();
    };
    /**
     * ========================================================================
     * Static instances
     * ========================================================================
     */
    KTDatepicker._instances = new Map();
    return KTDatepicker;
}(component_1.default));
exports.KTDatepicker = KTDatepicker;
//# sourceMappingURL=datepicker.js.map