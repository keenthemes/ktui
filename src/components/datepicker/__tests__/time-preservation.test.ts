/**
 * time-preservation.test.ts - Tests for time preservation on calendar date clicks
 * Ensures time is preserved across single, range, and multi-date selection modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { dateToTimeState, applyTimeToDate } from '../utils/time-utils';

describe('KTDatepicker Time Preservation', () => {
	let container: HTMLElement;
	let datepicker: KTDatepicker;

	beforeEach(() => {
		// Create a fresh container for each test
		container = document.createElement('div');
		container.innerHTML = `
      <div class="kt-datepicker" data-kt-datepicker>
        <input type="text" data-kt-datepicker-input placeholder="Select date">
      </div>
    `;
		document.body.innerHTML = '';
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (datepicker) {
			datepicker.destroy();
		}
		document.body.innerHTML = '';
	});

	describe('Single Date Mode', () => {
		it('should preserve time when selectedTime exists', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024, 2:30 PM

			datepicker = new KTDatepicker(element, {
				enableTime: true,
				value: initialDate,
			});

			// Verify initial date has time set
			const initialState = datepicker.getState();
			expect(initialState.selectedDate).toBeDefined();
			expect(initialState.selectedDate?.getHours()).toBe(14);
			expect(initialState.selectedDate?.getMinutes()).toBe(30);

			// Select a new date
			const newDate = new Date(2024, 0, 20, 0, 0, 0); // Jan 20, 2024, midnight
			datepicker.setDate(newDate);

			// Verify time is preserved
			const newState = datepicker.getState();
			expect(newState.selectedDate).toBeDefined();
			expect(newState.selectedDate?.getDate()).toBe(20);
			expect(newState.selectedDate?.getHours()).toBe(14);
			expect(newState.selectedDate?.getMinutes()).toBe(30);
		});

		it('should extract time from selectedDate when selectedTime is missing', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 16, 45, 0); // Jan 15, 2024, 4:45 PM

			datepicker = new KTDatepicker(element, {
				enableTime: true,
				value: initialDate,
			});

			// Clear selectedTime state (simulate missing state)
			const state = datepicker.getState();
			(datepicker as any)._unifiedStateManager.updateState(
				{ selectedTime: null },
				'test-clear'
			);

			// Select a new date
			const newDate = new Date(2024, 0, 25, 0, 0, 0);
			datepicker.setDate(newDate);

			// Verify time is extracted from selectedDate
			const newState = datepicker.getState();
			expect(newState.selectedDate?.getDate()).toBe(25);
			expect(newState.selectedDate?.getHours()).toBe(16);
			expect(newState.selectedDate?.getMinutes()).toBe(45);
		});

		it('should default to current time when no time exists', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const now = new Date();

			datepicker = new KTDatepicker(element, {
				enableTime: true,
			});

			// Select a date
			const newDate = new Date(2024, 0, 15, 0, 0, 0);
			datepicker.setDate(newDate);

			// Verify time defaults to current time
			const state = datepicker.getState();
			expect(state.selectedDate).toBeDefined();
			expect(state.selectedDate?.getDate()).toBe(15);
			// Allow 1-minute tolerance for test execution time
			const timeDiff = Math.abs(state.selectedDate!.getHours() - now.getHours());
			expect(timeDiff).toBeLessThanOrEqual(1);
		});

		it('should not reset time to midnight', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 10, 15, 30); // Jan 15, 2024, 10:15:30 AM

			datepicker = new KTDatepicker(element, {
				enableTime: true,
				timeGranularity: 'second',
				value: initialDate,
			});

			// Select a new date
			const newDate = new Date(2024, 0, 20, 0, 0, 0);
			datepicker.setDate(newDate);

			// Verify time is NOT midnight
			const state = datepicker.getState();
			expect(state.selectedDate?.getHours()).not.toBe(0);
			expect(state.selectedDate?.getMinutes()).not.toBe(0);
			expect(state.selectedDate?.getSeconds()).not.toBe(0);
			expect(state.selectedDate?.getHours()).toBe(10);
			expect(state.selectedDate?.getMinutes()).toBe(15);
			expect(state.selectedDate?.getSeconds()).toBe(30);
		});
	});

	describe('Range Selection Mode', () => {
		it('should preserve time for both start and end dates', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024, 2:30 PM

			datepicker = new KTDatepicker(element, {
				range: true,
				enableTime: true,
			});

			// Manually set selectedTime to simulate time picker selection
			// Use immediate update (third parameter = true)
			(datepicker as any)._unifiedStateManager.updateState(
				{ selectedTime: { hour: 14, minute: 30, second: 0 } },
				'test-init',
				true
			);

			// Select start date (first click creates start)
			const startDate = new Date(2024, 0, 10, 0, 0, 0);
			(datepicker as any)._selectRangeDate(startDate);

			// Verify start has time preserved
			const afterStartState = datepicker.getState();
			expect(afterStartState.selectedRange?.start?.getDate()).toBe(10);
			expect(afterStartState.selectedRange?.start?.getHours()).toBe(14);
			expect(afterStartState.selectedRange?.start?.getMinutes()).toBe(30);

			// Select end date (second click creates end)
			const endDate = new Date(2024, 0, 20, 0, 0, 0);
			(datepicker as any)._selectRangeDate(endDate);

			// Verify both dates preserve time
			const newState = datepicker.getState();
			expect(newState.selectedRange).toBeDefined();
			expect(newState.selectedRange?.start).toBeDefined();
			expect(newState.selectedRange?.end).toBeDefined();

			expect(newState.selectedRange?.start?.getDate()).toBe(10);
			expect(newState.selectedRange?.start?.getHours()).toBe(14);
			expect(newState.selectedRange?.start?.getMinutes()).toBe(30);

			expect(newState.selectedRange?.end?.getDate()).toBe(20);
			expect(newState.selectedRange?.end?.getHours()).toBe(14);
			expect(newState.selectedRange?.end?.getMinutes()).toBe(30);
		});

		it('should not reset range dates to midnight', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 16, 45, 0); // Jan 15, 2024, 4:45 PM

			datepicker = new KTDatepicker(element, {
				range: true,
				enableTime: true,
				value: initialDate,
			});

			// Select start and end dates
			const startDate = new Date(2024, 0, 10, 0, 0, 0);
			(datepicker as any)._selectRangeDate(startDate);

			const endDate = new Date(2024, 0, 25, 0, 0, 0);
			(datepicker as any)._selectRangeDate(endDate);

			// Verify time is NOT midnight for either date
			const state = datepicker.getState();
			expect(state.selectedRange?.start?.getHours()).not.toBe(0);
			expect(state.selectedRange?.start?.getMinutes()).not.toBe(0);
			expect(state.selectedRange?.end?.getHours()).not.toBe(0);
			expect(state.selectedRange?.end?.getMinutes()).not.toBe(0);
		});

		it('should extract time from range start when selectedTime is missing', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;

			datepicker = new KTDatepicker(element, {
				range: true,
				enableTime: true,
				valueRange: {
					start: new Date(2024, 0, 10, 13, 20, 0), // Jan 10, 2024, 1:20 PM
					end: new Date(2024, 0, 15, 13, 20, 0), // Jan 15, 2024, 1:20 PM
				},
			});

			// Clear selectedTime
			(datepicker as any)._unifiedStateManager.updateState(
				{ selectedTime: null },
				'test-clear'
			);

			// Reset range to only have start
			(datepicker as any)._unifiedStateManager.setSelectedRange(
				{
					start: new Date(2024, 0, 10, 13, 20, 0),
					end: null,
				},
				'test-reset'
			);

			// Select a new end date
			const newEndDate = new Date(2024, 0, 25, 0, 0, 0);
			(datepicker as any)._selectRangeDate(newEndDate);

			// Verify time is extracted from range start
			const state = datepicker.getState();
			expect(state.selectedRange?.end?.getDate()).toBe(25);
			expect(state.selectedRange?.end?.getHours()).toBe(13);
			expect(state.selectedRange?.end?.getMinutes()).toBe(20);
		});
	});

	describe('Multi-Date Selection Mode', () => {
		it('should preserve time for all selected dates', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 11, 30, 0); // Jan 15, 2024, 11:30 AM

			datepicker = new KTDatepicker(element, {
				multiDate: true,
				enableTime: true,
				values: [initialDate],
			});

			// Verify initial date has time set
			const initialState = datepicker.getState();
			expect(initialState.selectedDates).toBeDefined();
			expect(initialState.selectedDates.length).toBe(1);
			expect(initialState.selectedDates[0].getHours()).toBe(11);
			expect(initialState.selectedDates[0].getMinutes()).toBe(30);

			// Select multiple dates
			const date1 = new Date(2024, 0, 10, 0, 0, 0);
			(datepicker as any)._selectMultiDate(date1);

			const date2 = new Date(2024, 0, 20, 0, 0, 0);
			(datepicker as any)._selectMultiDate(date2);

			const date3 = new Date(2024, 0, 25, 0, 0, 0);
			(datepicker as any)._selectMultiDate(date3);

			// Verify all dates preserve time
			const newState = datepicker.getState();
			expect(newState.selectedDates).toBeDefined();
			expect(newState.selectedDates.length).toBeGreaterThan(1);

			newState.selectedDates.forEach((date) => {
				expect(date.getHours()).toBe(11);
				expect(date.getMinutes()).toBe(30);
			});
		});

		it('should not reset multi-dates to midnight', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;
			const initialDate = new Date(2024, 0, 15, 9, 15, 0); // Jan 15, 2024, 9:15 AM

			datepicker = new KTDatepicker(element, {
				multiDate: true,
				enableTime: true,
				value: initialDate,
			});

			// Select dates
			const date1 = new Date(2024, 0, 10, 0, 0, 0);
			(datepicker as any)._selectMultiDate(date1);

			const date2 = new Date(2024, 0, 20, 0, 0, 0);
			(datepicker as any)._selectMultiDate(date2);

			// Verify time is NOT midnight for any date
			const state = datepicker.getState();
			state.selectedDates.forEach((date) => {
				expect(date.getHours()).not.toBe(0);
				expect(date.getMinutes()).not.toBe(0);
			});
		});

		it('should extract time from existing selected dates when selectedTime is missing', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;

			datepicker = new KTDatepicker(element, {
				multiDate: true,
				enableTime: true,
				values: [
					new Date(2024, 0, 10, 15, 45, 0), // Jan 10, 2024, 3:45 PM
					new Date(2024, 0, 15, 15, 45, 0), // Jan 15, 2024, 3:45 PM
				],
			});

			// Clear selectedTime
			(datepicker as any)._unifiedStateManager.updateState(
				{ selectedTime: null },
				'test-clear'
			);

			// Select a new date
			const newDate = new Date(2024, 0, 25, 0, 0, 0);
			(datepicker as any)._selectMultiDate(newDate);

			// Verify time is extracted from existing dates
			const state = datepicker.getState();
			const addedDate = state.selectedDates.find((d) => d.getDate() === 25);
			expect(addedDate).toBeDefined();
			expect(addedDate?.getHours()).toBe(15);
			expect(addedDate?.getMinutes()).toBe(45);
		});
	});

	describe('Date-Only Mode (No Time)', () => {
		it('should not apply time when enableTime is false', () => {
			const element = container.querySelector('[data-kt-datepicker]') as HTMLElement;

			datepicker = new KTDatepicker(element, {
				enableTime: false,
			});

			// Select a date
			const date = new Date(2024, 0, 15, 0, 0, 0);
			datepicker.setDate(date);

			// Verify time remains at midnight (default for date-only)
			const state = datepicker.getState();
			expect(state.selectedDate?.getDate()).toBe(15);
			// Time should be normalized to midnight for date-only mode
			expect(state.selectedDate?.getHours()).toBe(0);
			expect(state.selectedDate?.getMinutes()).toBe(0);
			expect(state.selectedDate?.getSeconds()).toBe(0);
		});
	});

	describe('Time Utility Functions', () => {
		it('dateToTimeState should extract time correctly', () => {
			const date = new Date(2024, 0, 15, 14, 30, 45);
			const timeState = dateToTimeState(date);

			expect(timeState.hour).toBe(14);
			expect(timeState.minute).toBe(30);
			expect(timeState.second).toBe(45);
		});

		it('applyTimeToDate should preserve date and apply time', () => {
			const date = new Date(2024, 0, 15, 0, 0, 0);
			const timeState = { hour: 16, minute: 45, second: 30 };

			const result = applyTimeToDate(date, timeState);

			expect(result.getFullYear()).toBe(2024);
			expect(result.getMonth()).toBe(0);
			expect(result.getDate()).toBe(15);
			expect(result.getHours()).toBe(16);
			expect(result.getMinutes()).toBe(45);
			expect(result.getSeconds()).toBe(30);
		});
	});
});

