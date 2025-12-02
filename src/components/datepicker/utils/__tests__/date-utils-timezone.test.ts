import { describe, it, expect } from 'vitest';
import {
	formatDateToLocalString,
	normalizeDateToLocalMidnight,
	isSameLocalDay,
	parseLocalDate
} from '../date-utils';

describe('Date Utils - Timezone Handling', () => {
	describe('formatDateToLocalString', () => {
		it('should format date as YYYY-MM-DD using local timezone', () => {
			const date = new Date(2024, 0, 15, 14, 30, 45); // Jan 15, 2024 2:30:45 PM
			const formatted = formatDateToLocalString(date);
			expect(formatted).toBe('2024-01-15');
		});

		it('should use local timezone components, not UTC', () => {
			// Create a date that would shift if converted to UTC
			// In PST (UTC-8), Jan 15 11:00 PM becomes Jan 16 7:00 AM UTC
			const date = new Date(2024, 0, 15, 23, 0, 0); // Jan 15, 2024 11:00 PM local
			const formatted = formatDateToLocalString(date);
			// Should still be Jan 15 in local timezone, not shifted to Jan 16
			expect(formatted).toBe('2024-01-15');
		});

		it('should pad single-digit months and days with zeros', () => {
			const date = new Date(2024, 0, 5); // Jan 5, 2024
			const formatted = formatDateToLocalString(date);
			expect(formatted).toBe('2024-01-05');
		});

		it('should handle year boundaries correctly', () => {
			const date1 = new Date(2023, 11, 31); // Dec 31, 2023
			const date2 = new Date(2024, 0, 1); // Jan 1, 2024
			expect(formatDateToLocalString(date1)).toBe('2023-12-31');
			expect(formatDateToLocalString(date2)).toBe('2024-01-01');
		});

		it('should handle leap years correctly', () => {
			const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
			const formatted = formatDateToLocalString(date);
			expect(formatted).toBe('2024-02-29');
		});
	});

	describe('normalizeDateToLocalMidnight', () => {
		it('should set time to local midnight (00:00:00)', () => {
			const date = new Date(2024, 0, 15, 14, 30, 45, 123);
			const normalized = normalizeDateToLocalMidnight(date);
			expect(normalized.getHours()).toBe(0);
			expect(normalized.getMinutes()).toBe(0);
			expect(normalized.getSeconds()).toBe(0);
			expect(normalized.getMilliseconds()).toBe(0);
		});

		it('should preserve date components (year, month, day)', () => {
			const date = new Date(2024, 0, 15, 14, 30, 45);
			const normalized = normalizeDateToLocalMidnight(date);
			expect(normalized.getFullYear()).toBe(2024);
			expect(normalized.getMonth()).toBe(0);
			expect(normalized.getDate()).toBe(15);
		});

		it('should return a new Date object, not modify the original', () => {
			const date = new Date(2024, 0, 15, 14, 30, 45);
			const normalized = normalizeDateToLocalMidnight(date);
			expect(normalized).not.toBe(date);
			expect(date.getHours()).toBe(14); // Original unchanged
			expect(normalized.getHours()).toBe(0); // New one normalized
		});

		it('should handle dates already at midnight', () => {
			const date = new Date(2024, 0, 15, 0, 0, 0, 0);
			const normalized = normalizeDateToLocalMidnight(date);
			expect(normalized.getHours()).toBe(0);
			expect(normalized.getDate()).toBe(15);
		});
	});

	describe('isSameLocalDay', () => {
		it('should return true for dates on the same calendar day', () => {
			const date1 = new Date(2024, 0, 15, 10, 0, 0);
			const date2 = new Date(2024, 0, 15, 20, 0, 0);
			expect(isSameLocalDay(date1, date2)).toBe(true);
		});

		it('should return false for dates on different days', () => {
			const date1 = new Date(2024, 0, 15, 10, 0, 0);
			const date2 = new Date(2024, 0, 16, 10, 0, 0);
			expect(isSameLocalDay(date1, date2)).toBe(false);
		});

		it('should return false for dates in different months', () => {
			const date1 = new Date(2024, 0, 15, 10, 0, 0);
			const date2 = new Date(2024, 1, 15, 10, 0, 0);
			expect(isSameLocalDay(date1, date2)).toBe(false);
		});

		it('should return false for dates in different years', () => {
			const date1 = new Date(2024, 0, 15, 10, 0, 0);
			const date2 = new Date(2025, 0, 15, 10, 0, 0);
			expect(isSameLocalDay(date1, date2)).toBe(false);
		});

		it('should ignore time components when comparing', () => {
			const date1 = new Date(2024, 0, 15, 0, 0, 0, 0);
			const date2 = new Date(2024, 0, 15, 23, 59, 59, 999);
			expect(isSameLocalDay(date1, date2)).toBe(true);
		});

		it('should use local timezone for comparison', () => {
			// Create dates that might differ in UTC but are same in local timezone
			const date1 = new Date(2024, 0, 15, 23, 0, 0); // Jan 15 11 PM local
			const date2 = new Date(2024, 0, 15, 0, 0, 0); // Jan 15 midnight local
			expect(isSameLocalDay(date1, date2)).toBe(true);
		});
	});

	describe('parseLocalDate', () => {
		it('should parse YYYY-MM-DD string to local date at midnight', () => {
			const parsed = parseLocalDate('2024-01-15');
			expect(parsed.getFullYear()).toBe(2024);
			expect(parsed.getMonth()).toBe(0); // January is 0
			expect(parsed.getDate()).toBe(15);
			expect(parsed.getHours()).toBe(0);
			expect(parsed.getMinutes()).toBe(0);
			expect(parsed.getSeconds()).toBe(0);
		});

		it('should create date in local timezone, not UTC', () => {
			const parsed = parseLocalDate('2024-01-15');
			// The date should represent Jan 15 at local midnight
			// Not Jan 15 at UTC midnight (which could be different day in some timezones)
			expect(parsed.getDate()).toBe(15);
			expect(parsed.getMonth()).toBe(0);
		});

		it('should handle single-digit months and days', () => {
			const parsed = parseLocalDate('2024-01-05');
			expect(parsed.getMonth()).toBe(0);
			expect(parsed.getDate()).toBe(5);
		});

		it('should handle year boundaries', () => {
			const date1 = parseLocalDate('2023-12-31');
			const date2 = parseLocalDate('2024-01-01');
			expect(date1.getFullYear()).toBe(2023);
			expect(date1.getMonth()).toBe(11);
			expect(date1.getDate()).toBe(31);
			expect(date2.getFullYear()).toBe(2024);
			expect(date2.getMonth()).toBe(0);
			expect(date2.getDate()).toBe(1);
		});

		it('should handle leap years', () => {
			const parsed = parseLocalDate('2024-02-29');
			expect(parsed.getFullYear()).toBe(2024);
			expect(parsed.getMonth()).toBe(1);
			expect(parsed.getDate()).toBe(29);
		});

		it('should round-trip correctly with formatDateToLocalString', () => {
			const originalDate = new Date(2024, 0, 15, 14, 30, 45);
			const formatted = formatDateToLocalString(originalDate);
			const parsed = parseLocalDate(formatted);
			expect(parsed.getFullYear()).toBe(originalDate.getFullYear());
			expect(parsed.getMonth()).toBe(originalDate.getMonth());
			expect(parsed.getDate()).toBe(originalDate.getDate());
		});
	});

	describe('Timezone Consistency', () => {
		it('should maintain date consistency across format and parse operations', () => {
			const testDates = [
				new Date(2024, 0, 1), // Jan 1
				new Date(2024, 5, 15), // Jun 15
				new Date(2024, 11, 31), // Dec 31
				new Date(2024, 1, 29), // Feb 29 (leap year)
			];

			testDates.forEach(date => {
				const formatted = formatDateToLocalString(date);
				const parsed = parseLocalDate(formatted);
				expect(parsed.getFullYear()).toBe(date.getFullYear());
				expect(parsed.getMonth()).toBe(date.getMonth());
				expect(parsed.getDate()).toBe(date.getDate());
			});
		});

		it('should prevent date shifts from UTC conversion', () => {
			// Create a date late in the day that could shift when converted to UTC
			const lateEvening = new Date(2024, 0, 15, 23, 30, 0);
			const formatted = formatDateToLocalString(lateEvening);

			// Should remain Jan 15, not shift to Jan 16
			expect(formatted).toBe('2024-01-15');

			// Parse it back and verify it's still the same day
			const parsed = parseLocalDate(formatted);
			expect(parsed.getDate()).toBe(15);
			expect(parsed.getMonth()).toBe(0);
		});

		it('should handle dates at midnight correctly', () => {
			const midnight = new Date(2024, 0, 15, 0, 0, 0, 0);
			const formatted = formatDateToLocalString(midnight);
			expect(formatted).toBe('2024-01-15');

			const parsed = parseLocalDate(formatted);
			expect(parsed.getDate()).toBe(15);
			expect(parsed.getHours()).toBe(0);
		});
	});
});

