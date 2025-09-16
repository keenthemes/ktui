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
export declare function formatDate(date: Date, format: string, config: KTDatepickerConfigInterface): string;
/**
 * Parse a date string according to the provided format
 *
 * @param dateStr - Date string to parse
 * @param format - Format string
 * @param config - Datepicker configuration
 * @returns Parsed date or null if invalid
 */
export declare function parseDate(dateStr: string, format: string, config: KTDatepickerConfigInterface): Date | null;
/**
 * Check if a date is valid
 *
 * @param date - Date to check
 * @returns Whether the date is valid
 */
export declare function isValidDate(date: any): boolean;
/**
 * Get the number of days in a month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Number of days in the month
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * Get the first day of the month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @returns Day of week for the first day (0 = Sunday, 6 = Saturday)
 */
export declare function getFirstDayOfMonth(year: number, month: number): number;
/**
 * Pad a number with a leading zero if needed
 *
 * @param num - Number to pad
 * @returns Padded number string
 */
export declare function padZero(num: number): string;
/**
 * Get locale configuration for the datepicker
 *
 * @param config - Datepicker configuration
 * @returns Locale configuration
 */
export declare function getLocaleConfig(config: KTDatepickerConfigInterface): LocaleConfigInterface;
/**
 * Check if a date is between two other dates (inclusive)
 *
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns Whether the date is between start and end
 */
export declare function isDateBetween(date: Date, start: Date, end: Date): boolean;
/**
 * Compare two dates for equality (ignoring time)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Whether the dates are equal
 */
export declare function isSameDay(date1: Date, date2: Date): boolean;
/**
 * Check if a date is a weekend (Saturday or Sunday)
 *
 * @param date - Date to check
 * @returns Whether the date is a weekend
 */
export declare function isWeekend(date: Date): boolean;
/**
 * Check if a date is disabled (outside min/max range or explicitly disabled)
 *
 * @param date - Date to check
 * @param config - Datepicker configuration
 * @returns Whether the date is disabled
 */
export declare function isDateDisabled(date: Date, config: KTDatepickerConfigInterface): boolean;
/**
 * Generate a calender for the specified month
 *
 * @param year - Year
 * @param month - Month (0-indexed)
 * @param config - Datepicker configuration
 * @returns Calendar days matrix
 */
export declare function generateCalendarMonth(year: number, month: number, config: KTDatepickerConfigInterface): Date[][];
/**
 * Check if two dates are the same day
 * (ignoring time part)
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are the same day
 */
export declare function isDateEqual(date1: Date, date2: Date): boolean;
/**
 * Check if a date is within a range (inclusive)
 *
 * @param date - Date to check
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns True if date is within the range
 */
export declare function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean;
//# sourceMappingURL=utils.d.ts.map