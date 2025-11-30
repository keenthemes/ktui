import { describe, it, expect } from 'vitest';
import { getDateKey, isSameDayByKey } from '../date-utils';

describe('Date Utils - Date Key Functions', () => {
	describe('getDateKey', () => {
		it('should generate correct date key for a given date', () => {
			const date = new Date(2024, 0, 15); // Jan 15, 2024
			const key = getDateKey(date);
			expect(key).toBe(20240115); // year * 10000 + month * 100 + day
		});

		it('should handle single-digit months and days', () => {
			const date = new Date(2024, 0, 5); // Jan 5, 2024
			const key = getDateKey(date);
			expect(key).toBe(20240105);
		});

		it('should handle year boundaries correctly', () => {
			const date1 = new Date(2023, 11, 31); // Dec 31, 2023
			const date2 = new Date(2024, 0, 1); // Jan 1, 2024
			expect(getDateKey(date1)).toBe(20231231);
			expect(getDateKey(date2)).toBe(20240101);
		});

		it('should handle leap years correctly', () => {
			const date = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
			const key = getDateKey(date);
			expect(key).toBe(20240229);
		});

		it('should ignore time components', () => {
			const date1 = new Date(2024, 0, 15, 0, 0, 0); // Jan 15, 2024 00:00:00
			const date2 = new Date(2024, 0, 15, 23, 59, 59); // Jan 15, 2024 23:59:59
			expect(getDateKey(date1)).toBe(getDateKey(date2));
		});

		it('should generate unique keys for different dates', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 0, 16);
			const date3 = new Date(2024, 1, 15);
			const date4 = new Date(2025, 0, 15);

			const key1 = getDateKey(date1);
			const key2 = getDateKey(date2);
			const key3 = getDateKey(date3);
			const key4 = getDateKey(date4);

			expect(key1).not.toBe(key2);
			expect(key1).not.toBe(key3);
			expect(key1).not.toBe(key4);
		});
	});

	describe('isSameDayByKey', () => {
		it('should return true for same calendar day', () => {
			const date1 = new Date(2024, 0, 15, 10, 30, 0);
			const date2 = new Date(2024, 0, 15, 20, 45, 0);
			expect(isSameDayByKey(date1, date2)).toBe(true);
		});

		it('should return false for different days', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 0, 16);
			expect(isSameDayByKey(date1, date2)).toBe(false);
		});

		it('should return false for different months', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2024, 1, 15);
			expect(isSameDayByKey(date1, date2)).toBe(false);
		});

		it('should return false for different years', () => {
			const date1 = new Date(2024, 0, 15);
			const date2 = new Date(2025, 0, 15);
			expect(isSameDayByKey(date1, date2)).toBe(false);
		});

		it('should handle year boundaries correctly', () => {
			const date1 = new Date(2023, 11, 31);
			const date2 = new Date(2024, 0, 1);
			expect(isSameDayByKey(date1, date2)).toBe(false);
		});
	});
});

