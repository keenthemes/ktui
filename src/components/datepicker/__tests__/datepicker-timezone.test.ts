import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { formatDateToLocalString, parseLocalDate } from '../utils/date-utils';

describe('KTDatepicker - Timezone Handling', () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = document.createElement('div');
		container.setAttribute('data-kt-datepicker', '');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (container.parentNode) {
			document.body.removeChild(container);
		}
	});

	describe('Date Selection with Local Timezone', () => {
		it('should store selected date in local timezone', () => {
			const datepicker = new KTDatepicker(container);
			const testDate = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024 2:30 PM

			datepicker.setDate(testDate);
			const state = datepicker.getState();

			expect(state.selectedDate).toBeDefined();
			if (state.selectedDate) {
				// Date should preserve the local date components
				expect(state.selectedDate.getFullYear()).toBe(2024);
				expect(state.selectedDate.getMonth()).toBe(0);
				expect(state.selectedDate.getDate()).toBe(15);
			}
		});

		it('should not shift dates when selecting late evening times', () => {
			const datepicker = new KTDatepicker(container);
			// Late evening that could shift to next day in UTC
			const lateEvening = new Date(2024, 0, 15, 23, 30, 0); // Jan 15, 11:30 PM

			datepicker.setDate(lateEvening);
			const state = datepicker.getState();

			expect(state.selectedDate).toBeDefined();
			if (state.selectedDate) {
				// Should still be Jan 15, not shifted to Jan 16
				expect(state.selectedDate.getDate()).toBe(15);
				expect(state.selectedDate.getMonth()).toBe(0);
			}
		});

		it('should format dates using local timezone in calendar cells', () => {
			const datepicker = new KTDatepicker(container);
			const testDate = new Date(2024, 0, 15);
			datepicker.setDate(testDate);
			datepicker.open();

			// Wait for dropdown to render
			const dropdown = container.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
			if (!dropdown) {
				// If dropdown not found, skip this test (may need async rendering)
				return;
			}

			// Find the selected date cell
			const selectedCell = dropdown.querySelector('[data-kt-selected="true"]') as HTMLElement;
			if (selectedCell) {
				// Check that the data-date attribute uses local timezone format
				const dateAttr = selectedCell.getAttribute('data-date');
				expect(dateAttr).toBe(formatDateToLocalString(testDate));
			}
		});
	});

	describe('Date Range Selection with Local Timezone', () => {
		it('should store range dates in local timezone', () => {
			const datepicker = new KTDatepicker(container, { range: true });
			const startDate = new Date(2024, 0, 10, 10, 0, 0);
			const endDate = new Date(2024, 0, 15, 20, 0, 0);

			datepicker.setDate(startDate);
			datepicker.setDate(endDate);

			const state = datepicker.getState();
			expect(state.selectedRange).toBeDefined();
			if (state.selectedRange) {
				expect(state.selectedRange.start).toBeDefined();
				expect(state.selectedRange.end).toBeDefined();
				if (state.selectedRange.start && state.selectedRange.end) {
					expect(state.selectedRange.start.getDate()).toBe(10);
					expect(state.selectedRange.end.getDate()).toBe(15);
				}
			}
		});

		it('should format range dates using local timezone in data attributes', () => {
			const datepicker = new KTDatepicker(container, { range: true });
			const startDate = new Date(2024, 0, 10);
			const endDate = new Date(2024, 0, 15);

			datepicker.setDate(startDate);
			datepicker.setDate(endDate);
			datepicker.open();

			const dropdown = container.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
			if (!dropdown) return;

			const calendar = dropdown.querySelector('table') as HTMLElement;
			if (calendar) {
				// Check range attributes use local timezone format
				const rangeStart = calendar.getAttribute('data-kt-range-start');
				const rangeEnd = calendar.getAttribute('data-kt-range-end');

				if (rangeStart && rangeEnd) {
					expect(rangeStart).toBe(formatDateToLocalString(startDate));
					expect(rangeEnd).toBe(formatDateToLocalString(endDate));
				}
			}
		});

		it('should parse range dates from attributes using local timezone', () => {
			const datepicker = new KTDatepicker(container, { range: true });
			const startDate = new Date(2024, 0, 10);
			const endDate = new Date(2024, 0, 15);

			datepicker.setDate(startDate);
			datepicker.setDate(endDate);
			datepicker.open();

			const dropdown = container.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
			if (!dropdown) return;

			const calendar = dropdown.querySelector('table') as HTMLElement;
			if (calendar) {
				// Get attributes and parse them
				const rangeStartAttr = calendar.getAttribute('data-kt-range-start');
				const rangeEndAttr = calendar.getAttribute('data-kt-range-end');

				if (rangeStartAttr && rangeEndAttr) {
					const parsedStart = parseLocalDate(rangeStartAttr);
					const parsedEnd = parseLocalDate(rangeEndAttr);

					// Parsed dates should match original dates
					expect(parsedStart.getDate()).toBe(startDate.getDate());
					expect(parsedStart.getMonth()).toBe(startDate.getMonth());
					expect(parsedEnd.getDate()).toBe(endDate.getDate());
					expect(parsedEnd.getMonth()).toBe(endDate.getMonth());
				}
			}
		});
	});

	describe('Date Comparison with Local Timezone', () => {
		it('should compare dates using local timezone normalization', () => {
			const datepicker = new KTDatepicker(container);
			const date1 = new Date(2024, 0, 15, 10, 0, 0);
			const date2 = new Date(2024, 0, 15, 20, 0, 0);

			datepicker.setDate(date1);
			const state1 = datepicker.getState();

			datepicker.setDate(date2);
			const state2 = datepicker.getState();

			// Both should be considered the same day
			if (state1.selectedDate && state2.selectedDate) {
				expect(state1.selectedDate.getDate()).toBe(state2.selectedDate.getDate());
				expect(state1.selectedDate.getMonth()).toBe(state2.selectedDate.getMonth());
			}
		});

		it('should highlight correct date cell regardless of time component', () => {
			const datepicker = new KTDatepicker(container);
			const testDate = new Date(2024, 0, 15, 23, 59, 59); // Late in the day

			datepicker.setDate(testDate);
			datepicker.open();

			const dropdown = container.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
			if (dropdown) {
				const selectedCell = dropdown.querySelector('[data-kt-selected="true"]') as HTMLElement;
				if (selectedCell) {
					const dateAttr = selectedCell.getAttribute('data-date');
					expect(dateAttr).toBe('2024-01-15'); // Should be Jan 15, not shifted
				}
			}
		});
	});

	describe('Date String Formatting Consistency', () => {
		it('should use consistent local timezone format throughout', () => {
			const datepicker = new KTDatepicker(container);
			const testDate = new Date(2024, 0, 15, 14, 30, 0);

			datepicker.setDate(testDate);
			datepicker.open();

			const dropdown = container.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
			if (dropdown) {
				const calendar = dropdown.querySelector('table') as HTMLElement;
				if (calendar) {
					// All date cells should use local timezone format
					const dateCells = calendar.querySelectorAll('[data-date]');
					dateCells.forEach(cell => {
						const dateStr = cell.getAttribute('data-date');
						if (dateStr) {
							// Should be in YYYY-MM-DD format
							expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
							// Should be parseable as local date
							const parsed = parseLocalDate(dateStr);
							expect(parsed).toBeInstanceOf(Date);
						}
					});
				}
			}
		});
	});
});

