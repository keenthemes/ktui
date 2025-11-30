/*
 * date-formatters.test.ts - Unit tests for date formatting utilities
 */

import { describe, it, expect } from 'vitest';
import { formatDate, isSameDay, normalizeDateToMidnight } from '../date-formatters';

describe('formatDate', () => {
	it('should format date with yyyy-MM-dd format', () => {
		const date = new Date(2024, 0, 15); // January 15, 2024
		expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
	});

	it('should format date with dd/MM/yyyy format', () => {
		const date = new Date(2024, 0, 15);
		expect(formatDate(date, 'dd/MM/yyyy')).toBe('15/01/2024');
	});

	it('should format date with time components', () => {
		const date = new Date(2024, 0, 15, 14, 30, 45);
		expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45');
	});

	it('should format date with AM/PM indicator', () => {
		const date = new Date(2024, 0, 15, 14, 30); // 2:30 PM
		expect(formatDate(date, 'HH:mm a')).toBe('14:30 PM');
		const morningDate = new Date(2024, 0, 15, 9, 30); // 9:30 AM
		expect(formatDate(morningDate, 'HH:mm a')).toBe('09:30 AM');
		const midnightDate = new Date(2024, 0, 15, 0, 0); // Midnight
		expect(formatDate(midnightDate, 'HH:mm a')).toBe('00:00 AM');
	});

	it('should handle single digit months and days', () => {
		const date = new Date(2024, 0, 5); // January 5, 2024
		expect(formatDate(date, 'M/d/yyyy')).toBe('1/5/2024');
		expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/05/2024');
	});

	it('should handle 2-digit year format', () => {
		const date = new Date(2024, 0, 15);
		expect(formatDate(date, 'yy-MM-dd')).toBe('24-01-15');
	});

	it('should return empty string for invalid date', () => {
		const invalidDate = new Date('invalid');
		expect(formatDate(invalidDate, 'yyyy-MM-dd')).toBe('');
	});

	it('should return empty string for non-Date object', () => {
		expect(formatDate(null as any, 'yyyy-MM-dd')).toBe('');
		expect(formatDate(undefined as any, 'yyyy-MM-dd')).toBe('');
	});

	it('should handle complex format strings', () => {
		const date = new Date(2024, 0, 15, 14, 30, 45);
		expect(formatDate(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 14:30:45');
	});
});

describe('isSameDay', () => {
	it('should return true for same day with different times', () => {
		const date1 = new Date(2024, 0, 15, 10, 30);
		const date2 = new Date(2024, 0, 15, 14, 45);
		expect(isSameDay(date1, date2)).toBe(true);
	});

	it('should return false for different days', () => {
		const date1 = new Date(2024, 0, 15);
		const date2 = new Date(2024, 0, 16);
		expect(isSameDay(date1, date2)).toBe(false);
	});

	it('should return false for different months', () => {
		const date1 = new Date(2024, 0, 15);
		const date2 = new Date(2024, 1, 15);
		expect(isSameDay(date1, date2)).toBe(false);
	});

	it('should return false for different years', () => {
		const date1 = new Date(2024, 0, 15);
		const date2 = new Date(2025, 0, 15);
		expect(isSameDay(date1, date2)).toBe(false);
	});

	it('should return true for same date at midnight', () => {
		const date1 = new Date(2024, 0, 15, 0, 0, 0);
		const date2 = new Date(2024, 0, 15, 0, 0, 0);
		expect(isSameDay(date1, date2)).toBe(true);
	});

	it('should handle edge case: last day of month', () => {
		const date1 = new Date(2024, 0, 31, 10, 0);
		const date2 = new Date(2024, 0, 31, 20, 0);
		expect(isSameDay(date1, date2)).toBe(true);
	});

	it('should handle edge case: first day of month', () => {
		const date1 = new Date(2024, 0, 1, 0, 0);
		const date2 = new Date(2024, 0, 1, 23, 59);
		expect(isSameDay(date1, date2)).toBe(true);
	});
});

describe('normalizeDateToMidnight', () => {
	it('should set time to 00:00:00', () => {
		const date = new Date(2024, 0, 15, 14, 30, 45);
		const normalized = normalizeDateToMidnight(date);
		expect(normalized.getHours()).toBe(0);
		expect(normalized.getMinutes()).toBe(0);
		expect(normalized.getSeconds()).toBe(0);
		expect(normalized.getMilliseconds()).toBe(0);
	});

	it('should preserve date components', () => {
		const date = new Date(2024, 0, 15, 14, 30, 45);
		const normalized = normalizeDateToMidnight(date);
		expect(normalized.getFullYear()).toBe(2024);
		expect(normalized.getMonth()).toBe(0);
		expect(normalized.getDate()).toBe(15);
	});

	it('should return a new Date object', () => {
		const date = new Date(2024, 0, 15, 14, 30, 45);
		const normalized = normalizeDateToMidnight(date);
		expect(normalized).not.toBe(date);
		expect(date.getHours()).toBe(14); // Original date unchanged
	});

	it('should handle date already at midnight', () => {
		const date = new Date(2024, 0, 15, 0, 0, 0);
		const normalized = normalizeDateToMidnight(date);
		expect(normalized.getHours()).toBe(0);
		expect(normalized.getMinutes()).toBe(0);
		expect(normalized.getSeconds()).toBe(0);
	});

	it('should handle date at end of day', () => {
		const date = new Date(2024, 0, 15, 23, 59, 59);
		const normalized = normalizeDateToMidnight(date);
		expect(normalized.getHours()).toBe(0);
		expect(normalized.getDate()).toBe(15); // Same day
	});

	it('should work with dates at different times', () => {
		const times = [
			new Date(2024, 0, 15, 0, 0, 0),
			new Date(2024, 0, 15, 12, 0, 0),
			new Date(2024, 0, 15, 23, 59, 59)
		];

		times.forEach(date => {
			const normalized = normalizeDateToMidnight(date);
			expect(normalized.getHours()).toBe(0);
			expect(normalized.getMinutes()).toBe(0);
			expect(normalized.getSeconds()).toBe(0);
			expect(normalized.getDate()).toBe(15);
		});
	});
});

