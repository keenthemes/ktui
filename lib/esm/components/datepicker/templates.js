/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Main container template for the datepicker dropdown
 */
export var datepickerContainerTemplate = "\n  <div class=\"bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden\">\n    <div class=\"border-b border-gray-200 pb-3 mb-3\">\n      <div class=\"flex items-center justify-between px-3 pt-3\">\n        <button type=\"button\" class=\"p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Previous Month\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <polyline points=\"15 18 9 12 15 6\"></polyline>\n          </svg>\n        </button>\n        <div class=\"flex items-center justify-center\">\n          <select class=\"bg-transparent border border-gray-200 rounded px-2 py-1 mr-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Select Month\"></select>\n          <select class=\"bg-transparent border border-gray-200 rounded px-2 py-1 ml-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Select Year\"></select>\n          <span class=\"font-medium px-2 py-1 rounded hover:bg-gray-100 cursor-pointer\"></span>\n        </div>\n        <button type=\"button\" class=\"p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Next Month\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <polyline points=\"9 18 15 12 9 6\"></polyline>\n          </svg>\n        </button>\n      </div>\n    </div>\n    <div class=\"flex flex-wrap gap-4\"></div>\n    <div class=\"py-3 border-t border-gray-200 mt-3 hidden\">\n      <div class=\"text-sm font-medium text-gray-600 mb-2 text-center\">Time</div>\n      <div class=\"flex items-center justify-center gap-2\">\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"23\" aria-label=\"Hour\">\n        </div>\n        <span class=\"text-xl font-medium text-gray-500 leading-none\">:</span>\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"59\" aria-label=\"Minute\">\n        </div>\n        <span class=\"text-xl font-medium text-gray-500 leading-none\">:</span>\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"59\" aria-label=\"Second\">\n        </div>\n        <div class=\"flex flex-col gap-1\">\n          <button type=\"button\" class=\"px-2 py-1 text-xs border border-gray-300 rounded-t bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center\" aria-label=\"AM\"></button>\n          <button type=\"button\" class=\"px-2 py-1 text-xs border border-gray-300 rounded-b bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center\" aria-label=\"PM\"></button>\n        </div>\n      </div>\n    </div>\n    <div class=\"flex justify-between pt-3 border-t border-gray-200 mt-3 px-3 pb-3\">\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500\">Today</button>\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500\">Clear</button>\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-blue-500 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500\">Apply</button>\n    </div>\n  </div>\n";
/**
 * Input wrapper template with calendar icon
 */
export var inputWrapperTemplate = "\n  <div class=\"relative flex items-center\">\n    <div class=\"flex-grow segmented-input-container\"></div>\n    <button type=\"button\" class=\"absolute right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 calendar-toggle-btn\" aria-label=\"Toggle Calendar\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect>\n        <line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line>\n        <line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line>\n        <line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line>\n      </svg>\n    </button>\n  </div>\n";
/**
 * Template for segmented date input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @returns HTML for segmented input
 */
export function segmentedDateInputTemplate(format) {
    // Parse the format to determine the order of segments and separators
    var formatSegments = parseFormatString(format);
    var segments = [];
    var separators = [];
    // Extract segments and separators
    for (var i = 0; i < formatSegments.length; i++) {
        var seg = formatSegments[i];
        if (seg.type === 'separator') {
            separators.push(seg.value);
        }
        else {
            segments.push(seg);
        }
    }
    // Ensure we have exactly 3 segments (day, month, year) and 2 separators
    if (segments.length !== 3 || separators.length !== 2) {
        console.warn('Invalid date format for segmented input:', format);
        // Fall back to default MM/dd/yyyy
        return getDefaultSegmentedTemplate();
    }
    // Create the template based on the parsed format
    return "\n    <div class=\"flex items-center bg-transparent text-sm\">\n      <div\n        class=\"".concat(getSegmentWidthClass(segments[0].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"").concat(getSegmentName(segments[0].type), "\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"").concat(getSegmentLabel(segments[0].type), "\">").concat(segments[0].placeholder, "</div>\n      <span class=\"text-gray-500 mx-0.5\">").concat(separators[0], "</span>\n      <div\n        class=\"").concat(getSegmentWidthClass(segments[1].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"").concat(getSegmentName(segments[1].type), "\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"").concat(getSegmentLabel(segments[1].type), "\">").concat(segments[1].placeholder, "</div>\n      <span class=\"text-gray-500 mx-0.5\">").concat(separators[1], "</span>\n      <div\n        class=\"").concat(getSegmentWidthClass(segments[2].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"").concat(getSegmentName(segments[2].type), "\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"").concat(getSegmentLabel(segments[2].type), "\">").concat(segments[2].placeholder, "</div>\n    </div>\n  ");
}
/**
 * Template for segmented date range input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @param rangeSeparator - Separator between start and end dates
 * @returns HTML for segmented range input
 */
export function segmentedDateRangeInputTemplate(format, rangeSeparator) {
    if (rangeSeparator === void 0) { rangeSeparator = ' - '; }
    // Parse the format to determine the order of segments and separators
    var formatSegments = parseFormatString(format);
    var segments = [];
    var separators = [];
    // Extract segments and separators
    for (var i = 0; i < formatSegments.length; i++) {
        var seg = formatSegments[i];
        if (seg.type === 'separator') {
            separators.push(seg.value);
        }
        else {
            segments.push(seg);
        }
    }
    // Ensure we have exactly 3 segments (day, month, year) and 2 separators
    if (segments.length !== 3 || separators.length !== 2) {
        console.warn('Invalid date format for segmented range input:', format);
        // Fall back to default MM/dd/yyyy
        return getDefaultSegmentedRangeTemplate(rangeSeparator);
    }
    // Create the template based on the parsed format
    return "\n    <div class=\"flex items-center w-full\">\n      <div class=\"flex items-center bg-transparent text-sm\">\n        <div\n          class=\"".concat(getSegmentWidthClass(segments[0].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-").concat(getSegmentName(segments[0].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start ").concat(getSegmentLabel(segments[0].type), "\">").concat(segments[0].placeholder, "</div>\n        <span class=\"text-gray-500 mx-0.5\">").concat(separators[0], "</span>\n        <div\n          class=\"").concat(getSegmentWidthClass(segments[1].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-").concat(getSegmentName(segments[1].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start ").concat(getSegmentLabel(segments[1].type), "\">").concat(segments[1].placeholder, "</div>\n        <span class=\"text-gray-500 mx-0.5\">").concat(separators[1], "</span>\n        <div\n          class=\"").concat(getSegmentWidthClass(segments[2].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-").concat(getSegmentName(segments[2].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start ").concat(getSegmentLabel(segments[2].type), "\">").concat(segments[2].placeholder, "</div>\n      </div>\n      <span class=\"mx-1 text-gray-500\">").concat(rangeSeparator, "</span>\n      <div class=\"flex items-center bg-transparent text-sm\">\n        <div\n          class=\"").concat(getSegmentWidthClass(segments[0].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-").concat(getSegmentName(segments[0].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End ").concat(getSegmentLabel(segments[0].type), "\">").concat(segments[0].placeholder, "</div>\n        <span class=\"text-gray-500 mx-0.5\">").concat(separators[0], "</span>\n        <div\n          class=\"").concat(getSegmentWidthClass(segments[1].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-").concat(getSegmentName(segments[1].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End ").concat(getSegmentLabel(segments[1].type), "\">").concat(segments[1].placeholder, "</div>\n        <span class=\"text-gray-500 mx-0.5\">").concat(separators[1], "</span>\n        <div\n          class=\"").concat(getSegmentWidthClass(segments[2].type), " bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-").concat(getSegmentName(segments[2].type), "\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End ").concat(getSegmentLabel(segments[2].type), "\">").concat(segments[2].placeholder, "</div>\n      </div>\n    </div>\n  ");
}
/**
 * Parse a date format string into segments and separators
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @returns Array of parsed segments with type, placeholder and value
 */
function parseFormatString(format) {
    var result = [];
    var currentType = '';
    var currentValue = '';
    // Helper to add a segment to the result
    var addSegment = function () {
        if (!currentValue)
            return;
        if (/^d+$/.test(currentValue)) {
            result.push({
                type: 'day',
                value: currentValue,
                placeholder: currentValue.length === 1 ? 'd' : 'dd',
            });
        }
        else if (/^M+$/.test(currentValue)) {
            result.push({
                type: 'month',
                value: currentValue,
                placeholder: currentValue.length === 1 ? 'M' : 'MM',
            });
        }
        else if (/^y+$/.test(currentValue)) {
            result.push({
                type: 'year',
                value: currentValue,
                placeholder: currentValue.length <= 2 ? 'yy' : 'yyyy',
            });
        }
        else {
            // This is a separator
            result.push({
                type: 'separator',
                value: currentValue,
            });
        }
        currentValue = '';
    };
    // Process each character in the format string
    for (var i = 0; i < format.length; i++) {
        var char = format[i];
        if (/[dMy]/.test(char)) {
            // Date part characters
            if (currentType === char) {
                // Continue the current segment
                currentValue += char;
            }
            else {
                // Start a new segment
                addSegment();
                currentType = char;
                currentValue = char;
            }
        }
        else {
            // Separator character
            if (currentValue) {
                addSegment();
            }
            currentType = '';
            currentValue = char;
            addSegment();
        }
    }
    // Add the last segment
    addSegment();
    return result;
}
/**
 * Get a suitable CSS width class based on segment type
 *
 * @param type - Segment type (day, month, year)
 * @returns CSS class for width
 */
function getSegmentWidthClass(type) {
    switch (type) {
        case 'day':
            return 'w-7';
        case 'month':
            return 'w-7';
        case 'year':
            return 'w-12';
        default:
            return 'w-7';
    }
}
/**
 * Get the segment name to be used in data-segment attribute
 *
 * @param type - Segment type (day, month, year)
 * @returns Segment name
 */
function getSegmentName(type) {
    return type;
}
/**
 * Get a human-readable label for the segment
 *
 * @param type - Segment type (day, month, year)
 * @returns Human-readable label
 */
function getSegmentLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}
/**
 * Get the default segmented date input template (MM/dd/yyyy)
 *
 * @returns Default template HTML
 */
function getDefaultSegmentedTemplate() {
    return "\n    <div class=\"flex items-center bg-transparent text-sm\">\n      <div\n        class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"month\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"Month\">MM</div>\n      <span class=\"text-gray-500 mx-0.5\">/</span>\n      <div\n        class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"day\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"Day\">dd</div>\n      <span class=\"text-gray-500 mx-0.5\">/</span>\n      <div\n        class=\"w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n        data-segment=\"year\"\n        tabindex=\"0\"\n        role=\"button\"\n        aria-label=\"Year\">yyyy</div>\n    </div>\n  ";
}
/**
 * Get the default segmented date range input template (MM/dd/yyyy)
 *
 * @param rangeSeparator - Separator between start and end dates
 * @returns Default range template HTML
 */
function getDefaultSegmentedRangeTemplate(rangeSeparator) {
    if (rangeSeparator === void 0) { rangeSeparator = ' - '; }
    return "\n    <div class=\"flex items-center w-full\">\n      <div class=\"flex items-center bg-transparent text-sm\">\n        <div\n          class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-month\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start Month\">MM</div>\n        <span class=\"text-gray-500 mx-0.5\">/</span>\n        <div\n          class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-day\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start Day\">dd</div>\n        <span class=\"text-gray-500 mx-0.5\">/</span>\n        <div\n          class=\"w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"start-year\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"Start Year\">yyyy</div>\n      </div>\n      <span class=\"mx-1 text-gray-500\">".concat(rangeSeparator, "</span>\n      <div class=\"flex items-center bg-transparent text-sm\">\n        <div\n          class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-month\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End Month\">MM</div>\n        <span class=\"text-gray-500 mx-0.5\">/</span>\n        <div\n          class=\"w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-day\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End Day\">dd</div>\n        <span class=\"text-gray-500 mx-0.5\">/</span>\n        <div\n          class=\"w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5\"\n          data-segment=\"end-year\"\n          tabindex=\"0\"\n          role=\"button\"\n          aria-label=\"End Year\">yyyy</div>\n      </div>\n    </div>\n  ");
}
/**
 * Get an array of day names based on locale and format
 *
 * @param locale - Locale configuration
 * @param format - Format for day names ('long', 'short', or 'min')
 * @returns Array of day names
 */
function getDayNames(locale, format) {
    if (format === 'long') {
        return locale.dayNames;
    }
    else if (format === 'short') {
        return locale.dayNamesShort;
    }
    else {
        return locale.dayNamesMin;
    }
}
/**
 * Calendar grid template
 *
 * @param locale - Locale configuration for the datepicker
 * @param weekDayFormat - Format for the week day names ('long', 'short', or 'min')
 * @returns Calendar grid template HTML
 */
export function calendarGridTemplate(locale, weekDayFormat) {
    // Get the day names based on the locale and format
    var dayNames = getDayNames(locale, weekDayFormat);
    // Start from the first day of the week based on locale
    var firstDay = locale.firstDayOfWeek;
    var orderedDayNames = __spreadArray(__spreadArray([], dayNames.slice(firstDay), true), dayNames.slice(0, firstDay), true);
    // Create the header with day names
    var headerCells = orderedDayNames
        .map(function (day) {
        return "<th class=\"py-2 text-center text-xs font-medium text-gray-500 uppercase w-10\">".concat(day, "</th>");
    })
        .join('');
    return "\n    <div class=\"calendar-month-container\">\n      <table class=\"w-full border-collapse calendar-grid\" role=\"grid\" aria-labelledby=\"datepicker-month\">\n        <thead>\n          <tr class=\"border-b border-gray-200\">\n            ".concat(headerCells, "\n          </tr>\n        </thead>\n        <tbody class=\"border-none\"></tbody>\n      </table>\n    </div>\n  ");
}
/**
 * Calendar day cell template
 *
 * @param day - Day number
 * @param month - Month number (0-11)
 * @param year - Year (4 digits)
 * @param isCurrentMonth - Whether the day is in the current month
 * @param isToday - Whether the day is today
 * @param isSelected - Whether the day is selected
 * @param isDisabled - Whether the day is disabled
 * @param isRangeStart - Whether the day is the start of a range
 * @param isRangeEnd - Whether the day is the end of a range
 * @param isInRange - Whether the day is within a selected range
 * @param isWeekend - Whether the day is a weekend
 * @returns Day cell HTML
 */
export function dayTemplate(day, month, year, isCurrentMonth, isToday, isSelected, isDisabled, isRangeStart, isRangeEnd, isInRange, isWeekend) {
    if (month === void 0) { month = 0; }
    if (year === void 0) { year = 0; }
    if (isCurrentMonth === void 0) { isCurrentMonth = true; }
    if (isToday === void 0) { isToday = false; }
    if (isSelected === void 0) { isSelected = false; }
    if (isDisabled === void 0) { isDisabled = false; }
    if (isRangeStart === void 0) { isRangeStart = false; }
    if (isRangeEnd === void 0) { isRangeEnd = false; }
    if (isInRange === void 0) { isInRange = false; }
    if (isWeekend === void 0) { isWeekend = false; }
    // Base classes for day button
    var classes = 'w-full h-8 rounded-full flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ';
    // Apply conditional classes
    if (!isCurrentMonth) {
        classes += 'current';
    }
    else if (isDisabled) {
        classes += 'text-gray-300 cursor-not-allowed ';
    }
    else if (isSelected || isRangeStart || isRangeEnd) {
        classes += 'bg-blue-600 text-white hover:bg-blue-700 ';
    }
    else if (isInRange) {
        classes += 'bg-blue-100 text-blue-800 hover:bg-blue-200 ';
    }
    else if (isToday) {
        classes += 'border border-blue-500 text-blue-600 hover:bg-blue-50 ';
    }
    else {
        classes +=
            'text-gray-700 hover:bg-gray-100 hover:bg-blue-50 hover:text-blue-600 ';
    }
    // Add weekend-specific styling
    if (isWeekend && !isSelected && !isRangeStart && !isRangeEnd && !isInRange) {
        classes += 'text-gray-500 ';
    }
    // Add attributes for hover states in range selection
    var hoverAttributes = isCurrentMonth && !isDisabled ? 'data-hover-date="true"' : '';
    // Create a date ID if month and year are provided
    var dateIdAttr = '';
    if (year > 0) {
        // Format: YYYY-MM-DD (ensures leading zeros for month and day)
        var monthStr = String(month + 1).padStart(2, '0'); // Add 1 since month is 0-indexed
        var dayStr = String(day).padStart(2, '0');
        var dateId = "".concat(year, "-").concat(monthStr, "-").concat(dayStr);
        dateIdAttr = "data-date-id=\"".concat(dateId, "\"");
    }
    return "\n    <td class=\"p-0.5\">\n      <button\n        type=\"button\"\n        class=\"".concat(classes.trim(), "\"\n        data-date=\"").concat(day, "\"\n        ").concat(dateIdAttr, "\n        ").concat(isDisabled ? 'disabled' : '', "\n        ").concat(!isCurrentMonth ? 'tabindex="-1"' : '', "\n        ").concat(hoverAttributes, "\n        aria-selected=\"").concat(isSelected, "\"\n        aria-current=\"").concat(isToday ? 'date' : 'false', "\"\n      >\n        ").concat(day, "\n      </button>\n    </td>\n  ");
}
/**
 * Month and year header template with buttons for toggling month/year view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current month (0-11)
 * @param currentYear - Current year
 * @returns Month and year header HTML
 */
export function monthYearSelectTemplate(locale, currentMonth, currentYear) {
    return "\n    <div class=\"flex items-center justify-center space-x-2\">\n      <button type=\"button\"\n        class=\"month-selector px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium\"\n        aria-label=\"Select Month\">\n        ".concat(locale.monthNames[currentMonth], "\n      </button>\n      <button type=\"button\"\n        class=\"year-selector px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium\"\n        aria-label=\"Select Year\">\n        ").concat(currentYear, "\n      </button>\n    </div>\n  ");
}
/**
 * Template for month selection view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current selected month (0-11)
 * @returns Month selection HTML
 */
export function monthSelectionTemplate(locale, currentMonth) {
    var months = locale.monthNamesShort.map(function (month, idx) {
        var isCurrentMonth = idx === currentMonth;
        var buttonClass = isCurrentMonth
            ? 'py-3 px-2 text-sm rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            : 'py-3 px-2 text-sm rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800';
        return "\n      <button\n        type=\"button\"\n        class=\"".concat(buttonClass, "\"\n        data-month=\"").concat(idx, "\"\n        aria-selected=\"").concat(isCurrentMonth, "\"\n        aria-label=\"").concat(locale.monthNames[idx], "\"\n      >\n        ").concat(month, "\n      </button>\n    ");
    });
    return "\n    <div class=\"month-grid grid grid-cols-3 gap-2 p-2\">\n      ".concat(months.join(''), "\n    </div>\n  ");
}
/**
 * Template for year selection view
 *
 * @param startYear - Start year
 * @param endYear - End year
 * @param currentYear - Current selected year
 * @returns Year selection HTML
 */
export function yearSelectionTemplate(startYear, endYear, currentYear) {
    var years = [];
    for (var year = startYear; year <= endYear; year++) {
        var isCurrentYear = year === currentYear;
        var yearClass = isCurrentYear
            ? 'py-3 px-2 text-center text-sm rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            : 'py-3 px-2 text-center text-sm rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800';
        years.push("\n      <button\n        type=\"button\"\n        class=\"".concat(yearClass, "\"\n        data-year=\"").concat(year, "\"\n        aria-selected=\"").concat(isCurrentYear, "\"\n      >\n        ").concat(year, "\n      </button>\n    "));
    }
    // Navigation to previous/next year ranges
    var prevYearsBtn = "\n    <button\n      type=\"button\"\n      class=\"py-2 px-2 text-center text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500\"\n      data-year-nav=\"prev\"\n      aria-label=\"Previous years\"\n    >\n      ".concat(startYear - 1, "...\n    </button>\n  ");
    var nextYearsBtn = "\n    <button\n      type=\"button\"\n      class=\"py-2 px-2 text-center text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500\"\n      data-year-nav=\"next\"\n      aria-label=\"Next years\"\n    >\n      ...".concat(endYear + 1, "\n    </button>\n  ");
    return "\n    <div class=\"year-selection\">\n      <div class=\"year-navigation flex justify-between mb-2 px-2\">\n        ".concat(prevYearsBtn, "\n        <span class=\"text-gray-700 font-medium\">").concat(startYear, "-").concat(endYear, "</span>\n        ").concat(nextYearsBtn, "\n      </div>\n      <div class=\"year-grid grid grid-cols-4 gap-2 p-2\">\n        ").concat(years.join(''), "\n      </div>\n    </div>\n  ");
}
/**
 * Create placeholder template with placeholder text
 *
 * @param placeholder - Placeholder text to display
 * @returns HTML string for the placeholder
 */
export var placeholderTemplate = function (placeholder) {
    return "<span class=\"text-gray-500\">".concat(placeholder, "</span>");
};
/**
 * Create a template for the display wrapper
 */
export function displayWrapperTemplate(classes) {
    if (classes === void 0) { classes = ''; }
    return "\n    <div class=\"kt-datepicker-display-wrapper relative w-full ".concat(classes, "\"\n      role=\"combobox\"\n      aria-haspopup=\"dialog\"\n      aria-expanded=\"false\"\n    >\n    </div>\n  ");
}
/**
 * Create a template for the display element
 */
export function displayElementTemplate(placeholder, classes) {
    if (classes === void 0) { classes = ''; }
    return "\n    <div class=\"kt-datepicker-display-element py-2 px-3 border rounded cursor-pointer ".concat(classes, "\"\n      tabindex=\"0\"\n      role=\"textbox\"\n      aria-label=\"").concat(placeholder, "\"\n      data-placeholder=\"").concat(placeholder, "\"\n    >\n      <span class=\"kt-datepicker-display-text\"></span>\n    </div>\n  ");
}
//# sourceMappingURL=templates.js.map