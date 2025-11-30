/*
 * date-utils.ts - Shared date parsing/formatting utilities for KTDatepicker
 * Exports parseDateFromFormat for use in datepicker and segmented input.
 */

/**
 * Parses a date string according to a format string (supports yyyy, yy, MM, M, dd, d).
 * @param str Date string
 * @param format Format string
 * @returns Date object or null if parsing fails
 */
export function parseDateFromFormat(str: string, format: string): Date | null {
  if (!str || !format) return null;
  // Supported tokens: yyyy, yy, MM, M, dd, d
  const tokenRegex = /(yyyy|yy|MM|M|dd|d)/g;
  const tokens: string[] = [];
  let regexStr = '';
  let lastIndex = 0;
  let match;
  while ((match = tokenRegex.exec(format)) !== null) {
    // Add any literal text between tokens
    if (match.index > lastIndex) {
      regexStr += format.slice(lastIndex, match.index).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    tokens.push(match[0]);
    switch (match[0]) {
      case 'yyyy': regexStr += '(\\d{4})'; break;
      case 'yy': regexStr += '(\\d{2})'; break;
      case 'MM': regexStr += '(\\d{2})'; break;
      case 'M': regexStr += '(\\d{1,2})'; break;
      case 'dd': regexStr += '(\\d{2})'; break;
      case 'd': regexStr += '(\\d{1,2})'; break;
    }
    lastIndex = match.index + match[0].length;
  }
  // Add any trailing literal text
  if (lastIndex < format.length) {
    regexStr += format.slice(lastIndex).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  const regex = new RegExp('^' + regexStr + '$');
  const matchResult = regex.exec(str);
  if (!matchResult) return null;
  let year = 1970, month = 1, day = 1;
  let matchIdx = 1;
  for (const token of tokens) {
    const val = matchResult[matchIdx++] || '';
    switch (token) {
      case 'yyyy': year = parseInt(val, 10); break;
      case 'yy': year = 2000 + parseInt(val, 10); break;
      case 'MM':
      case 'M': month = parseInt(val, 10); break;
      case 'dd':
      case 'd': day = parseInt(val, 10); break;
    }
  }
  return new Date(year, month - 1, day);
}

/**
 * Extracts segment order from a format string for use in segmented input.
 * @param format Format string (e.g., 'dd/MM/yyyy', 'yyyy-MM-dd')
 * @returns Array of segment types in the order they appear in the format
 */
export function getSegmentOrderFromFormat(format: string): Array<'day' | 'month' | 'year'> {
  if (!format) return ['month', 'day', 'year']; // Default fallback

  const segments: Array<'day' | 'month' | 'year'> = [];
  const tokenRegex = /(yyyy|yy|MM|M|dd|d)/g;
  let match;

  while ((match = tokenRegex.exec(format)) !== null) {
    switch (match[0]) {
      case 'yyyy':
      case 'yy':
        segments.push('year');
        break;
      case 'MM':
      case 'M':
        segments.push('month');
        break;
      case 'dd':
      case 'd':
        segments.push('day');
        break;
    }
  }

  // Remove duplicates while preserving order
  const uniqueSegments = segments.filter((segment, index) => segments.indexOf(segment) === index);

  // Ensure we have all required segments, add missing ones at the end
  const requiredSegments: Array<'day' | 'month' | 'year'> = ['day', 'month', 'year'];
  requiredSegments.forEach(segment => {
    if (!uniqueSegments.includes(segment)) {
      uniqueSegments.push(segment);
    }
  });

  return uniqueSegments;
}

/**
 * Formats a date to a local timezone string in YYYY-MM-DD format.
 * Uses local timezone components to prevent date shifts from UTC conversion.
 * @param date Date object to format
 * @returns Date string in YYYY-MM-DD format using local timezone
 */
export function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes a date to local midnight (00:00:00) in the local timezone.
 * Useful for date-only comparisons where time components should be ignored.
 * @param date Date object to normalize
 * @returns New Date object set to local midnight
 */
export function normalizeDateToLocalMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Checks if two dates represent the same calendar day in local timezone.
 * Compares year, month, and day components, ignoring time.
 * @param a First date
 * @param b Second date
 * @returns True if both dates represent the same day in local timezone
 */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

/**
 * Parses a date string (YYYY-MM-DD format) into a Date object at local midnight.
 * Creates a local timezone date to avoid timezone-related date shifts.
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Date object representing the date at local midnight
 */
export function parseLocalDate(dateStr: string): Date {
  // Parse YYYY-MM-DD string and create local date at midnight
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Converts a date to a numeric key for O(1) date comparisons.
 * Format: year * 10000 + month * 100 + day
 * This enables efficient Set/Map lookups for date matching.
 * @param date Date object to convert
 * @returns Numeric key representing the date (e.g., 20241225 for Dec 25, 2024)
 */
export function getDateKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Checks if two dates have the same date key (same calendar day).
 * Optimized version using numeric keys for O(1) comparison.
 * @param a First date
 * @param b Second date
 * @returns True if both dates have the same date key
 */
export function isSameDayByKey(a: Date, b: Date): boolean {
  return getDateKey(a) === getDateKey(b);
}