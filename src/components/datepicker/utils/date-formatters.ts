/*
 * date-formatters.ts - Date formatting and comparison utilities for KTDatepicker
 * Provides pure utility functions for date formatting, comparison, and normalization.
 */

/**
 * Formats a Date object according to the provided format string.
 *
 * Supported tokens:
 *   yyyy - 4-digit year
 *   yy   - 2-digit year
 *   MM   - 2-digit month (01-12)
 *   M    - 1/2-digit month (1-12)
 *   dd   - 2-digit day (01-31)
 *   d    - 1/2-digit day (1-31)
 *   HH   - 2-digit hour (00-23)
 *   H    - 1/2-digit hour (0-23)
 *   mm   - 2-digit minute (00-59)
 *   m    - 1/2-digit minute (0-59)
 *   ss   - 2-digit second (00-59)
 *   s    - 1/2-digit second (0-59)
 *   a    - AM/PM indicator
 *
 * @param date Date object to format
 * @param format Format string with tokens
 * @returns Formatted date string, or empty string if date is invalid
 *
 * @example
 * formatDate(new Date(2024, 0, 15), 'yyyy-MM-dd') // Returns "2024-01-15"
 * formatDate(new Date(2024, 0, 15, 14, 30), 'HH:mm') // Returns "14:30"
 */
export function formatDate(date: Date, format: string): string {
	if (!(date instanceof Date) || isNaN(date.getTime())) return '';
	return format
		.replace(/yyyy/g, date.getFullYear().toString())
		.replace(/yy/g, date.getFullYear().toString().slice(-2))
		.replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
		.replace(/M(?![a-zA-Z])/g, String(date.getMonth() + 1))
		.replace(/dd/g, String(date.getDate()).padStart(2, '0'))
		.replace(/d(?![a-zA-Z])/g, String(date.getDate()))
		.replace(/HH/g, String(date.getHours()).padStart(2, '0'))
		.replace(/H(?![a-zA-Z])/g, String(date.getHours()))
		.replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
		.replace(/m(?![a-zA-Z])/g, String(date.getMinutes()))
		.replace(/ss/g, String(date.getSeconds()).padStart(2, '0'))
		.replace(/s(?![a-zA-Z])/g, String(date.getSeconds()))
		.replace(/a/g, date.getHours() >= 12 ? 'PM' : 'AM');
}

/**
 * Checks if two dates represent the same calendar day.
 * Compares year, month, and day components, ignoring time.
 *
 * @param a First date to compare
 * @param b Second date to compare
 * @returns True if both dates represent the same day, false otherwise
 *
 * @example
 * isSameDay(new Date(2024, 0, 15, 10, 30), new Date(2024, 0, 15, 14, 45)) // Returns true
 * isSameDay(new Date(2024, 0, 15), new Date(2024, 0, 16)) // Returns false
 */
export function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate();
}

/**
 * Normalizes a date to local midnight (00:00:00) in the local timezone.
 * Useful for date-only comparisons where time components should be ignored.
 *
 * @param date Date object to normalize
 * @returns New Date object set to local midnight (00:00:00)
 *
 * @example
 * const date = new Date(2024, 0, 15, 14, 30, 45);
 * const normalized = normalizeDateToMidnight(date);
 * // normalized represents 2024-01-15 00:00:00 in local timezone
 */
export function normalizeDateToMidnight(date: Date): Date {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
}

