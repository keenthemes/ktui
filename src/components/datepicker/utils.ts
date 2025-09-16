/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTDatepickerConfigInterface, LocaleConfigInterface } from './types';

/**
 * Format a date according to the provided format string
 *
 * @param date - Date to format
 * @param format - Format string
 * @param config - Datepicker configuration
 * @returns Formatted date string
 */
export function formatDate(
	date: Date,
	format: string,
	config: KTDatepickerConfigInterface
): string {
	if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
		return '';
	}

	const locale = getLocaleConfig(config);
	const isLeadingZero = config.forceLeadingZero;

	// Replace year tokens
	const year = date.getFullYear();
	format = format.replace(/yyyy/g, year.toString());
	format = format.replace(/yy/g, year.toString().slice(-2));

	// Replace month tokens
	const month = date.getMonth();
	const monthNum = month + 1;
	format = format.replace(/MMMM/g, locale.monthNames[month]);
	format = format.replace(/MMM/g, locale.monthNamesShort[month]);
	format = format.replace(
		/MM/g,
		isLeadingZero ? padZero(monthNum) : monthNum.toString()
	);
	format = format.replace(/M/g, monthNum.toString());

	// Replace day tokens
	const day = date.getDate();
	format = format.replace(/dd/g, isLeadingZero ? padZero(day) : day.toString());
	format = format.replace(/d/g, day.toString());

	// Replace day of week tokens
	const dayOfWeek = date.getDay();
	format = format.replace(/EEEE/g, locale.dayNames[dayOfWeek]);
	format = format.replace(/EEE/g, locale.dayNamesShort[dayOfWeek]);
	format = format.replace(/E/g, locale.dayNamesMin[dayOfWeek]);

	// Replace time tokens if time is enabled
	if (config.enableTime) {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		// 24-hour format
		format = format.replace(
			/HH/g,
			isLeadingZero ? padZero(hours) : hours.toString()
		);
		format = format.replace(/H/g, hours.toString());

		// 12-hour format
		const hours12 = hours % 12 || 12;
		format = format.replace(
			/hh/g,
			isLeadingZero ? padZero(hours12) : hours12.toString()
		);
		format = format.replace(/h/g, hours12.toString());

		// Minutes and seconds
		format = format.replace(
			/mm/g,
			isLeadingZero ? padZero(minutes) : minutes.toString()
		);
		format = format.replace(/m/g, minutes.toString());
		format = format.replace(
			/ss/g,
			isLeadingZero ? padZero(seconds) : seconds.toString()
		);
		format = format.replace(/s/g, seconds.toString());

		// AM/PM
		const ampm = hours >= 12 ? config.pm : config.am;
		format = format.replace(/A/g, ampm);
		format = format.replace(/a/g, ampm.toLowerCase());

		// Timezone (simplified implementation)
		const timezoneOffset = date.getTimezoneOffset();
		const timezoneOffsetHours = Math.abs(Math.floor(timezoneOffset / 60));
		const timezoneOffsetMinutes = Math.abs(timezoneOffset % 60);
		const timezoneSign = timezoneOffset > 0 ? '-' : '+';

		const formattedTimezone = `${timezoneSign}${padZero(timezoneOffsetHours)}:${padZero(timezoneOffsetMinutes)}`;
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
export function parseDate(
	dateStr: string,
	format: string,
	config: KTDatepickerConfigInterface
): Date | null {
	if (!dateStr) return null;

	// Handle natural language dates if enabled
	if (config.enableNaturalLanguage) {
		const naturalDate = parseNaturalLanguageDate(dateStr);
		if (naturalDate) return naturalDate;
	}

	// Create a new date object to populate
	const date = new Date();
	date.setHours(0, 0, 0, 0);

	// Extract parts from the format
	const formatParts: { [key: string]: string } = {};

	let formatRegex = format
		.replace(/(\w)(\1*)/g, (_, p1, p2) => {
			const length = p1.length + p2.length;
			let token = '';

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
			return `(\\d+|[a-zA-Z]+)`;
		})
		.replace(/[^\w\s]/g, '\\$&');

	const match = new RegExp(formatRegex).exec(dateStr);
	if (!match) return null;

	// Map format tokens to their extracted values
	let i = 1;
	for (const token in formatParts) {
		formatParts[token] = match[i++];
	}

	// Extract year
	if (formatParts.yyyy) {
		date.setFullYear(parseInt(formatParts.yyyy));
	} else if (formatParts.yy) {
		const year = parseInt(formatParts.yy);
		const century = Math.floor(new Date().getFullYear() / 100) * 100;
		date.setFullYear(century + year);
	}

	// Extract month
	if (formatParts.MM || formatParts.M) {
		const month = parseInt(formatParts.MM || formatParts.M) - 1;
		if (month >= 0 && month <= 11) {
			date.setMonth(month);
		}
	} else if (formatParts.MMM || formatParts.MMMM) {
		const monthName = formatParts.MMMM || formatParts.MMM;
		const locale = getLocaleConfig(config);
		const monthIndex = locale.monthNames.findIndex(
			(m) => m.toLowerCase() === monthName.toLowerCase()
		);
		if (monthIndex === -1) {
			const shortMonthIndex = locale.monthNamesShort.findIndex(
				(m) => m.toLowerCase() === monthName.toLowerCase()
			);
			if (shortMonthIndex !== -1) {
				date.setMonth(shortMonthIndex);
			}
		} else {
			date.setMonth(monthIndex);
		}
	}

	// Extract day
	if (formatParts.dd || formatParts.d) {
		const day = parseInt(formatParts.dd || formatParts.d);
		if (day >= 1 && day <= 31) {
			date.setDate(day);
		}
	}

	// Extract time if needed
	if (config.enableTime) {
		// Hours (24-hour format)
		if (formatParts.HH || formatParts.H) {
			const hours = parseInt(formatParts.HH || formatParts.H);
			if (hours >= 0 && hours <= 23) {
				date.setHours(hours);
			}
		}
		// Hours (12-hour format)
		else if (formatParts.hh || formatParts.h) {
			let hours = parseInt(formatParts.hh || formatParts.h);

			// Adjust for AM/PM
			if (formatParts.A) {
				const isPM = formatParts.A.toUpperCase() === config.pm;
				if (isPM && hours < 12) {
					hours += 12;
				} else if (!isPM && hours === 12) {
					hours = 0;
				}
			}

			if (hours >= 0 && hours <= 23) {
				date.setHours(hours);
			}
		}

		// Minutes
		if (formatParts.mm || formatParts.m) {
			const minutes = parseInt(formatParts.mm || formatParts.m);
			if (minutes >= 0 && minutes <= 59) {
				date.setMinutes(minutes);
			}
		}

		// Seconds
		if (formatParts.ss || formatParts.s) {
			const seconds = parseInt(formatParts.ss || formatParts.s);
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
function parseNaturalLanguageDate(input: string): Date | null {
	const normalized = input.trim().toLowerCase();
	const now = new Date();

	// Handle common natural language inputs
	switch (normalized) {
		case 'today':
			return new Date(now.setHours(0, 0, 0, 0));

		case 'yesterday': {
			const yesterday = new Date(now);
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(0, 0, 0, 0);
			return yesterday;
		}

		case 'tomorrow': {
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);
			return tomorrow;
		}

		default: {
			// Handle relative dates like "next week", "last month", etc.
			const relativeMatch = normalized.match(
				/^(next|last|this)\s+(day|week|month|year)$/
			);
			if (relativeMatch) {
				const [_, direction, unit] = relativeMatch;
				const result = new Date(now);
				result.setHours(0, 0, 0, 0);

				switch (unit) {
					case 'day':
						result.setDate(
							result.getDate() +
								(direction === 'next' ? 1 : direction === 'last' ? -1 : 0)
						);
						break;

					case 'week':
						result.setDate(
							result.getDate() +
								(direction === 'next' ? 7 : direction === 'last' ? -7 : 0)
						);
						break;

					case 'month':
						result.setMonth(
							result.getMonth() +
								(direction === 'next' ? 1 : direction === 'last' ? -1 : 0)
						);
						break;

					case 'year':
						result.setFullYear(
							result.getFullYear() +
								(direction === 'next' ? 1 : direction === 'last' ? -1 : 0)
						);
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
export function isValidDate(date: any): boolean {
	return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get the number of days in a month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the first day of the month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Day of week for the first day (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

/**
 * Pad a number with a leading zero if needed
 *
 * @param num - Number to pad
 * @returns Padded number string
 */
export function padZero(num: number): string {
	return num < 10 ? `0${num}` : num.toString();
}

/**
 * Get locale configuration for the datepicker
 *
 * @param config - Datepicker configuration
 * @returns Locale configuration
 */
export function getLocaleConfig(
	config: KTDatepickerConfigInterface
): LocaleConfigInterface {
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
export function isDateBetween(date: Date, start: Date, end: Date): boolean {
	const dateTime = date.getTime();
	return dateTime >= start.getTime() && dateTime <= end.getTime();
}

/**
 * Compare two dates for equality (ignoring time)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Whether the dates are equal
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 *
 * @param date - Date to check
 * @returns Whether the date is a weekend
 */
export function isWeekend(date: Date): boolean {
	const day = date.getDay();
	return day === 0 || day === 6;
}

/**
 * Check if a date is disabled (outside min/max range or explicitly disabled)
 *
 * @param date - Date to check
 * @param config - Datepicker configuration
 * @returns Whether the date is disabled
 */
export function isDateDisabled(
	date: Date,
	config: KTDatepickerConfigInterface
): boolean {
	if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
		return true;
	}

	// Set the time to noon for consistent comparison
	const normalizedDate = new Date(date);
	normalizedDate.setHours(12, 0, 0, 0);

	// Check min date
	if (config.minDate) {
		let minDate: Date | null = null;

		if (config.minDate instanceof Date) {
			minDate = new Date(config.minDate);
			minDate.setHours(0, 0, 0, 0);
		} else {
			// Try parsing with the configured format
			minDate = parseDate(config.minDate.toString(), config.format, config);

			// If that fails, try parsing with other common formats
			if (!minDate) {
				// Try DD/MM/YYYY format
				const parts = config.minDate.toString().split('/');
				if (parts.length === 3) {
					const day = parseInt(parts[0], 10);
					const month = parseInt(parts[1], 10) - 1;
					const year = parseInt(parts[2], 10);

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
		let maxDate: Date | null = null;

		if (config.maxDate instanceof Date) {
			maxDate = new Date(config.maxDate);
			maxDate.setHours(23, 59, 59, 999);
		} else {
			// Try parsing with the configured format
			maxDate = parseDate(config.maxDate.toString(), config.format, config);

			// If that fails, try parsing with other common formats
			if (!maxDate) {
				// Try DD/MM/YYYY format
				const parts = config.maxDate.toString().split('/');
				if (parts.length === 3) {
					const day = parseInt(parts[0], 10);
					const month = parseInt(parts[1], 10) - 1;
					const year = parseInt(parts[2], 10);

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
		for (const disabledDate of config.disabledDates) {
			const disabled =
				disabledDate instanceof Date
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
export function generateCalendarMonth(
	year: number,
	month: number,
	config: KTDatepickerConfigInterface
): Date[][] {
	const daysInMonth = getDaysInMonth(year, month);
	const firstDayOfMonth = getFirstDayOfMonth(year, month);
	const locale = getLocaleConfig(config);
	const firstDayOfWeek = locale.firstDayOfWeek;

	// Calculate the offset from the first day of the month to the first day of the calendar
	let startOffset = (firstDayOfMonth - firstDayOfWeek + 7) % 7;

	// Create a 6x7 matrix for the calendar
	const calendar: Date[][] = [];
	let day = 1 - startOffset;

	for (let week = 0; week < 6; week++) {
		const weekDays: Date[] = [];

		for (let i = 0; i < 7; i++) {
			const date = new Date(year, month, day);
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
export function isDateEqual(date1: Date, date2: Date): boolean {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

/**
 * Check if a date is within a range (inclusive)
 *
 * @param date - Date to check
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns True if date is within the range
 */
export function isDateInRange(
	date: Date,
	startDate: Date,
	endDate: Date
): boolean {
	const time = date.getTime();
	const startTime = startDate.getTime();
	const endTime = endDate.getTime();

	return time >= startTime && time <= endTime;
}
