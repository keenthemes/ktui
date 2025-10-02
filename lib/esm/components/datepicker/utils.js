/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/**
 * Format a date according to the provided format string
 *
 * @param date - Date to format
 * @param format - Format string
 * @param config - Datepicker configuration
 * @returns Formatted date string
 */
export function formatDate(date, format, config) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    var locale = getLocaleConfig(config);
    var isLeadingZero = config.forceLeadingZero;
    // Replace year tokens
    var year = date.getFullYear();
    format = format.replace(/yyyy/g, year.toString());
    format = format.replace(/yy/g, year.toString().slice(-2));
    // Replace month tokens
    var month = date.getMonth();
    var monthNum = month + 1;
    format = format.replace(/MMMM/g, locale.monthNames[month]);
    format = format.replace(/MMM/g, locale.monthNamesShort[month]);
    format = format.replace(/MM/g, isLeadingZero ? padZero(monthNum) : monthNum.toString());
    format = format.replace(/M/g, monthNum.toString());
    // Replace day tokens
    var day = date.getDate();
    format = format.replace(/dd/g, isLeadingZero ? padZero(day) : day.toString());
    format = format.replace(/d/g, day.toString());
    // Replace day of week tokens
    var dayOfWeek = date.getDay();
    format = format.replace(/EEEE/g, locale.dayNames[dayOfWeek]);
    format = format.replace(/EEE/g, locale.dayNamesShort[dayOfWeek]);
    format = format.replace(/E/g, locale.dayNamesMin[dayOfWeek]);
    // Replace time tokens if time is enabled
    if (config.enableTime) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        // 24-hour format
        format = format.replace(/HH/g, isLeadingZero ? padZero(hours) : hours.toString());
        format = format.replace(/H/g, hours.toString());
        // 12-hour format
        var hours12 = hours % 12 || 12;
        format = format.replace(/hh/g, isLeadingZero ? padZero(hours12) : hours12.toString());
        format = format.replace(/h/g, hours12.toString());
        // Minutes and seconds
        format = format.replace(/mm/g, isLeadingZero ? padZero(minutes) : minutes.toString());
        format = format.replace(/m/g, minutes.toString());
        format = format.replace(/ss/g, isLeadingZero ? padZero(seconds) : seconds.toString());
        format = format.replace(/s/g, seconds.toString());
        // AM/PM
        var ampm = hours >= 12 ? config.pm : config.am;
        format = format.replace(/A/g, ampm);
        format = format.replace(/a/g, ampm.toLowerCase());
        // Timezone (simplified implementation)
        var timezoneOffset = date.getTimezoneOffset();
        var timezoneOffsetHours = Math.abs(Math.floor(timezoneOffset / 60));
        var timezoneOffsetMinutes = Math.abs(timezoneOffset % 60);
        var timezoneSign = timezoneOffset > 0 ? '-' : '+';
        var formattedTimezone = "".concat(timezoneSign).concat(padZero(timezoneOffsetHours), ":").concat(padZero(timezoneOffsetMinutes));
        format = format.replace(/ZZZ/g, formattedTimezone);
    }
    return format;
}
/**
 * Parse a date string according to the provided format
 *
 * @param dateStr - Date string to parse
 * @param format - Format string
 * @param config - Datepicker configuration
 * @returns Parsed date or null if invalid
 */
export function parseDate(dateStr, format, config) {
    if (!dateStr)
        return null;
    // Handle natural language dates if enabled
    if (config.enableNaturalLanguage) {
        var naturalDate = parseNaturalLanguageDate(dateStr);
        if (naturalDate)
            return naturalDate;
    }
    // Create a new date object to populate
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    // Extract parts from the format
    var formatParts = {};
    var formatRegex = format
        .replace(/(\w)(\1*)/g, function (_, p1, p2) {
        var length = p1.length + p2.length;
        var token = '';
        switch (p1) {
            case 'y':
                token = length > 2 ? 'yyyy' : 'yy';
                break;
            case 'M':
                token = ['M', 'MM', 'MMM', 'MMMM'][Math.min(length - 1, 3)];
                break;
            case 'd':
                token = length > 1 ? 'dd' : 'd';
                break;
            case 'E':
                token = length > 3 ? 'EEEE' : length > 1 ? 'EEE' : 'E';
                break;
            case 'h':
            case 'H':
                token = length > 1 ? p1 + p1 : p1;
                break;
            case 'm':
                token = length > 1 ? 'mm' : 'm';
                break;
            case 's':
                token = length > 1 ? 'ss' : 's';
                break;
            case 'a':
            case 'A':
                token = p1;
                break;
            default:
                token = p1.repeat(length);
        }
        formatParts[token] = '';
        return "(\\d+|[a-zA-Z]+)";
    })
        .replace(/[^\w\s]/g, '\\$&');
    var match = new RegExp(formatRegex).exec(dateStr);
    if (!match)
        return null;
    // Map format tokens to their extracted values
    var i = 1;
    for (var token in formatParts) {
        formatParts[token] = match[i++];
    }
    // Extract year
    if (formatParts.yyyy) {
        date.setFullYear(parseInt(formatParts.yyyy));
    }
    else if (formatParts.yy) {
        var year = parseInt(formatParts.yy);
        var century = Math.floor(new Date().getFullYear() / 100) * 100;
        date.setFullYear(century + year);
    }
    // Extract month
    if (formatParts.MM || formatParts.M) {
        var month = parseInt(formatParts.MM || formatParts.M) - 1;
        if (month >= 0 && month <= 11) {
            date.setMonth(month);
        }
    }
    else if (formatParts.MMM || formatParts.MMMM) {
        var monthName_1 = formatParts.MMMM || formatParts.MMM;
        var locale = getLocaleConfig(config);
        var monthIndex = locale.monthNames.findIndex(function (m) { return m.toLowerCase() === monthName_1.toLowerCase(); });
        if (monthIndex === -1) {
            var shortMonthIndex = locale.monthNamesShort.findIndex(function (m) { return m.toLowerCase() === monthName_1.toLowerCase(); });
            if (shortMonthIndex !== -1) {
                date.setMonth(shortMonthIndex);
            }
        }
        else {
            date.setMonth(monthIndex);
        }
    }
    // Extract day
    if (formatParts.dd || formatParts.d) {
        var day = parseInt(formatParts.dd || formatParts.d);
        if (day >= 1 && day <= 31) {
            date.setDate(day);
        }
    }
    // Extract time if needed
    if (config.enableTime) {
        // Hours (24-hour format)
        if (formatParts.HH || formatParts.H) {
            var hours = parseInt(formatParts.HH || formatParts.H);
            if (hours >= 0 && hours <= 23) {
                date.setHours(hours);
            }
        }
        // Hours (12-hour format)
        else if (formatParts.hh || formatParts.h) {
            var hours = parseInt(formatParts.hh || formatParts.h);
            // Adjust for AM/PM
            if (formatParts.A) {
                var isPM = formatParts.A.toUpperCase() === config.pm;
                if (isPM && hours < 12) {
                    hours += 12;
                }
                else if (!isPM && hours === 12) {
                    hours = 0;
                }
            }
            if (hours >= 0 && hours <= 23) {
                date.setHours(hours);
            }
        }
        // Minutes
        if (formatParts.mm || formatParts.m) {
            var minutes = parseInt(formatParts.mm || formatParts.m);
            if (minutes >= 0 && minutes <= 59) {
                date.setMinutes(minutes);
            }
        }
        // Seconds
        if (formatParts.ss || formatParts.s) {
            var seconds = parseInt(formatParts.ss || formatParts.s);
            if (seconds >= 0 && seconds <= 59) {
                date.setSeconds(seconds);
            }
        }
    }
    // Validate the final date
    return isValidDate(date) ? date : null;
}
/**
 * Parse natural language date strings
 *
 * @param input - Natural language date string
 * @returns Parsed date or null if not recognized
 */
function parseNaturalLanguageDate(input) {
    var normalized = input.trim().toLowerCase();
    var now = new Date();
    // Handle common natural language inputs
    switch (normalized) {
        case 'today':
            return new Date(now.setHours(0, 0, 0, 0));
        case 'yesterday': {
            var yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            return yesterday;
        }
        case 'tomorrow': {
            var tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return tomorrow;
        }
        default: {
            // Handle relative dates like "next week", "last month", etc.
            var relativeMatch = normalized.match(/^(next|last|this)\s+(day|week|month|year)$/);
            if (relativeMatch) {
                var _ = relativeMatch[0], direction = relativeMatch[1], unit = relativeMatch[2];
                var result = new Date(now);
                result.setHours(0, 0, 0, 0);
                switch (unit) {
                    case 'day':
                        result.setDate(result.getDate() +
                            (direction === 'next' ? 1 : direction === 'last' ? -1 : 0));
                        break;
                    case 'week':
                        result.setDate(result.getDate() +
                            (direction === 'next' ? 7 : direction === 'last' ? -7 : 0));
                        break;
                    case 'month':
                        result.setMonth(result.getMonth() +
                            (direction === 'next' ? 1 : direction === 'last' ? -1 : 0));
                        break;
                    case 'year':
                        result.setFullYear(result.getFullYear() +
                            (direction === 'next' ? 1 : direction === 'last' ? -1 : 0));
                        break;
                }
                return result;
            }
            return null;
        }
    }
}
/**
 * Check if a date is valid
 *
 * @param date - Date to check
 * @returns Whether the date is valid
 */
export function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}
/**
 * Get the number of days in a month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
/**
 * Get the first day of the month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Day of week for the first day (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}
/**
 * Pad a number with a leading zero if needed
 *
 * @param num - Number to pad
 * @returns Padded number string
 */
export function padZero(num) {
    return num < 10 ? "0".concat(num) : num.toString();
}
/**
 * Get locale configuration for the datepicker
 *
 * @param config - Datepicker configuration
 * @returns Locale configuration
 */
export function getLocaleConfig(config) {
    return config.locales[config.locale] || config.locales['en-US'];
}
/**
 * Check if a date is between two other dates (inclusive)
 *
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns Whether the date is between start and end
 */
export function isDateBetween(date, start, end) {
    var dateTime = date.getTime();
    return dateTime >= start.getTime() && dateTime <= end.getTime();
}
/**
 * Compare two dates for equality (ignoring time)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Whether the dates are equal
 */
export function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
/**
 * Check if a date is a weekend (Saturday or Sunday)
 *
 * @param date - Date to check
 * @returns Whether the date is a weekend
 */
export function isWeekend(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
}
/**
 * Check if a date is disabled (outside min/max range or explicitly disabled)
 *
 * @param date - Date to check
 * @param config - Datepicker configuration
 * @returns Whether the date is disabled
 */
export function isDateDisabled(date, config) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return true;
    }
    // Set the time to noon for consistent comparison
    var normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);
    // Check min date
    if (config.minDate) {
        var minDate = null;
        if (config.minDate instanceof Date) {
            minDate = new Date(config.minDate);
            minDate.setHours(0, 0, 0, 0);
        }
        else {
            // Try parsing with the configured format
            minDate = parseDate(config.minDate.toString(), config.format, config);
            // If that fails, try parsing with other common formats
            if (!minDate) {
                // Try DD/MM/YYYY format
                var parts = config.minDate.toString().split('/');
                if (parts.length === 3) {
                    var day = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10) - 1;
                    var year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        minDate = new Date(year, month, day);
                    }
                }
            }
        }
        if (minDate) {
            // Ensure minDate has time set to beginning of day for accurate comparison
            minDate.setHours(0, 0, 0, 0);
            if (normalizedDate < minDate) {
                return true;
            }
        }
    }
    // Check max date
    if (config.maxDate) {
        var maxDate = null;
        if (config.maxDate instanceof Date) {
            maxDate = new Date(config.maxDate);
            maxDate.setHours(23, 59, 59, 999);
        }
        else {
            // Try parsing with the configured format
            maxDate = parseDate(config.maxDate.toString(), config.format, config);
            // If that fails, try parsing with other common formats
            if (!maxDate) {
                // Try DD/MM/YYYY format
                var parts = config.maxDate.toString().split('/');
                if (parts.length === 3) {
                    var day = parseInt(parts[0], 10);
                    var month = parseInt(parts[1], 10) - 1;
                    var year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        maxDate = new Date(year, month, day);
                    }
                }
            }
        }
        if (maxDate) {
            // Ensure maxDate has time set to end of day for accurate comparison
            maxDate.setHours(23, 59, 59, 999);
            if (normalizedDate > maxDate) {
                return true;
            }
        }
    }
    // Check explicitly disabled dates
    if (config.disabledDates && config.disabledDates.length > 0) {
        for (var _i = 0, _a = config.disabledDates; _i < _a.length; _i++) {
            var disabledDate = _a[_i];
            var disabled = disabledDate instanceof Date
                ? disabledDate
                : parseDate(disabledDate.toString(), config.format, config);
            if (disabled && isSameDay(normalizedDate, disabled)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Generate a calender for the specified month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @param config - Datepicker configuration
 * @returns Calendar days matrix
 */
export function generateCalendarMonth(year, month, config) {
    var daysInMonth = getDaysInMonth(year, month);
    var firstDayOfMonth = getFirstDayOfMonth(year, month);
    var locale = getLocaleConfig(config);
    var firstDayOfWeek = locale.firstDayOfWeek;
    // Calculate the offset from the first day of the month to the first day of the calendar
    var startOffset = (firstDayOfMonth - firstDayOfWeek + 7) % 7;
    // Create a 6x7 matrix for the calendar
    var calendar = [];
    var day = 1 - startOffset;
    for (var week = 0; week < 6; week++) {
        var weekDays = [];
        for (var i = 0; i < 7; i++) {
            var date = new Date(year, month, day);
            weekDays.push(date);
            day++;
        }
        calendar.push(weekDays);
        // If we've gone past the end of the month and it's a complete week, we can stop
        if (day > daysInMonth && week >= 4) {
            break;
        }
    }
    return calendar;
}
/**
 * Check if two dates are the same day
 * (ignoring time part)
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are the same day
 */
export function isDateEqual(date1, date2) {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
}
/**
 * Check if a date is within a range (inclusive)
 *
 * @param date - Date to check
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns True if date is within the range
 */
export function isDateInRange(date, startDate, endDate) {
    var time = date.getTime();
    var startTime = startDate.getTime();
    var endTime = endDate.getTime();
    return time >= startTime && time <= endTime;
}
//# sourceMappingURL=utils.js.map