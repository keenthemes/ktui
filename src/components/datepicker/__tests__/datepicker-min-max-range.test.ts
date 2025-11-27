/**
 * datepicker-min-max-range.test.ts - Tests for min/max date range constraint enforcement
 * Tests the data-out-of-range attribute is correctly set on calendar day cells
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { KTDatepickerConfig } from '../config/types';

describe('Datepicker Min/Max Date Range Constraints', () => {
	let element: HTMLElement;
	let datepicker: KTDatepicker;

	beforeEach(() => {
		// Create a fresh element for each test
		element = document.createElement('div');
		element.innerHTML = `
			<div class="kt-datepicker" data-kt-datepicker-segmented>
				<input type="text" data-kt-datepicker-input placeholder="Select date">
			</div>
		`;

		// Clear any existing content and add our test element
		document.body.innerHTML = '';
		document.body.appendChild(element);
	});

	afterEach(() => {
		if (datepicker) {
			datepicker.destroy();
		}
		document.body.innerHTML = '';
	});

	/**
	 * Helper function to get all day cells from the calendar
	 */
	function getDayCells(container: HTMLElement): HTMLElement[] {
		const calendar = container.querySelector('[data-kt-datepicker-calendar-table]');
		if (!calendar) return [];
		return Array.from(calendar.querySelectorAll('td[data-kt-datepicker-day]')) as HTMLElement[];
	}

	/**
	 * Helper function to get date from a day cell's data-date attribute
	 */
	function getDateFromCell(cell: HTMLElement): Date | null {
		const dateISO = cell.getAttribute('data-date');
		if (!dateISO) return null;
		return new Date(dateISO);
	}

	/**
	 * Helper function to check if a date is before another date (date-only comparison)
	 */
	function isBefore(date1: Date, date2: Date): boolean {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		d1.setHours(0, 0, 0, 0);
		d2.setHours(0, 0, 0, 0);
		return d1 < d2;
	}

	/**
	 * Helper function to check if a date is after another date (date-only comparison)
	 */
	function isAfter(date1: Date, date2: Date): boolean {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		d1.setHours(0, 0, 0, 0);
		d2.setHours(0, 0, 0, 0);
		return d1 > d2;
	}

	describe('MinDate Constraint Enforcement', () => {
		it('should set data-out-of-range on dates before minDate', () => {
			const minDate = new Date(2024, 0, 15); // Jan 15, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				value: new Date(2024, 0, 20) // Jan 20, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			// Wait for DOM to be fully rendered
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);
					let hasOutOfRangeCells = false;

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isBefore(cellDate, minDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							hasOutOfRangeCells = true;
							expect(hasAttribute).toBe(true);
							expect(cell.getAttribute('data-out-of-range')).toBe('true');
						} else {
							// Dates on or after minDate should not have the attribute
							if (hasAttribute && !isOutOfRange) {
								// Skip cells outside current month if they're not marked
								if (!cell.hasAttribute('data-outside')) {
									expect(hasAttribute).toBe(false);
								}
							}
						}
					});

					expect(hasOutOfRangeCells).toBe(true);
					resolve();
				}, 100);
			});
		});

		it('should disable buttons for dates before minDate', () => {
			const minDate = new Date(2024, 0, 15); // Jan 15, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				value: new Date(2024, 0, 20)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const button = cell.querySelector('button[data-day]') as HTMLButtonElement;
						if (!button) return;

						const isOutOfRange = isBefore(cellDate, minDate);

						if (isOutOfRange) {
							expect(button.hasAttribute('disabled')).toBe(true);
							expect(cell.hasAttribute('data-out-of-range')).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('MaxDate Constraint Enforcement', () => {
		it('should set data-out-of-range on dates after maxDate', () => {
			const maxDate = new Date(2024, 0, 20); // Jan 20, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				maxDate: maxDate,
				value: new Date(2024, 0, 15) // Jan 15, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);
					let hasOutOfRangeCells = false;

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							hasOutOfRangeCells = true;
							expect(hasAttribute).toBe(true);
							expect(cell.getAttribute('data-out-of-range')).toBe('true');
						}
					});

					expect(hasOutOfRangeCells).toBe(true);
					resolve();
				}, 100);
			});
		});

		it('should disable buttons for dates after maxDate', () => {
			const maxDate = new Date(2024, 0, 20); // Jan 20, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				maxDate: maxDate,
				value: new Date(2024, 0, 15)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const button = cell.querySelector('button[data-day]') as HTMLButtonElement;
						if (!button) return;

						const isOutOfRange = isAfter(cellDate, maxDate);

						if (isOutOfRange) {
							expect(button.hasAttribute('disabled')).toBe(true);
							expect(cell.hasAttribute('data-out-of-range')).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('Both MinDate and MaxDate Constraints', () => {
		it('should enforce both minDate and maxDate correctly', () => {
			const minDate = new Date(2024, 0, 10); // Jan 10, 2024
			const maxDate = new Date(2024, 0, 25); // Jan 25, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15) // Jan 15, 2024 (within range)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);
					let hasBeforeMinCells = false;
					let hasAfterMaxCells = false;
					let hasInRangeCells = false;

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isBeforeMin = isBefore(cellDate, minDate);
						const isAfterMax = isAfter(cellDate, maxDate);
						const isInRange = !isBeforeMin && !isAfterMax;
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isBeforeMin) {
							hasBeforeMinCells = true;
							expect(hasAttribute).toBe(true);
						} else if (isAfterMax) {
							hasAfterMaxCells = true;
							expect(hasAttribute).toBe(true);
						} else if (isInRange) {
							hasInRangeCells = true;
							// Dates in range should not have the attribute
							if (!cell.hasAttribute('data-outside')) {
								expect(hasAttribute).toBe(false);
							}
						}
					});

					expect(hasBeforeMinCells).toBe(true);
					expect(hasAfterMaxCells).toBe(true);
					expect(hasInRangeCells).toBe(true);
					resolve();
				}, 100);
			});
		});

		it('should handle dates at the boundary correctly', () => {
			const minDate = new Date(2024, 0, 15); // Jan 15, 2024
			const maxDate = new Date(2024, 0, 15); // Same date - single day range
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: minDate
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
						} else {
							// The boundary date itself should not be out of range
							const sameDay = cellDate.getTime() === minDate.getTime();
							if (sameDay) {
								expect(hasAttribute).toBe(false);
							}
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('Month Navigation', () => {
		it('should correctly apply constraints after navigating to different month', () => {
			const minDate = new Date(2024, 0, 15); // Jan 15, 2024
			const maxDate = new Date(2024, 2, 15); // Mar 15, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 1, 15) // Feb 15, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					// Navigate to next month (March)
					const nextButton = element.querySelector('[data-kt-datepicker-next]') as HTMLElement;
					expect(nextButton).toBeTruthy();

					nextButton.click();

					setTimeout(() => {
						const dayCells = getDayCells(element);

						dayCells.forEach((cell) => {
							const cellDate = getDateFromCell(cell);
							if (!cellDate) return;

							const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
							const hasAttribute = cell.hasAttribute('data-out-of-range');

							if (isOutOfRange) {
								expect(hasAttribute).toBe(true);
							}
						});

						resolve();
					}, 200);
				}, 100);
			});
		});

		it('should correctly apply constraints after navigating to previous month', () => {
			const minDate = new Date(2024, 0, 15); // Jan 15, 2024
			const maxDate = new Date(2024, 2, 15); // Mar 15, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 1, 15) // Feb 15, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					// Navigate to previous month (January)
					const prevButton = element.querySelector('[data-kt-datepicker-prev]') as HTMLElement;
					expect(prevButton).toBeTruthy();

					prevButton.click();

					setTimeout(() => {
						const dayCells = getDayCells(element);

						dayCells.forEach((cell) => {
							const cellDate = getDateFromCell(cell);
							if (!cellDate) return;

							const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
							const hasAttribute = cell.hasAttribute('data-out-of-range');

							if (isOutOfRange) {
								expect(hasAttribute).toBe(true);
							}
						});

						resolve();
					}, 200);
				}, 100);
			});
		});
	});

	describe('Dates Outside Current Month', () => {
		it('should correctly identify out-of-range dates from adjacent months', () => {
			const minDate = new Date(2024, 0, 10); // Jan 10, 2024
			const maxDate = new Date(2024, 0, 25); // Jan 25, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15) // Jan 15, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					// Check leading/trailing days from adjacent months
					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutsideMonth = cell.hasAttribute('data-outside');
						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						// Even dates from adjacent months should be correctly marked
						if (isOutsideMonth && isOutOfRange) {
							expect(hasAttribute).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});

		it('should handle dates from previous month correctly', () => {
			const minDate = new Date(2024, 0, 10); // Jan 10, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				value: new Date(2024, 0, 15) // Jan 15, 2024
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutsideMonth = cell.hasAttribute('data-outside');
						const isBeforeMin = isBefore(cellDate, minDate);

						if (isOutsideMonth && isBeforeMin) {
							expect(cell.hasAttribute('data-out-of-range')).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('Year Boundary Crossings', () => {
		it('should correctly handle dates spanning year boundaries', () => {
			const minDate = new Date(2023, 11, 20); // Dec 20, 2023
			const maxDate = new Date(2024, 0, 10); // Jan 10, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 1) // Jan 1, 2024 (within range)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});

		it('should correctly compare dates across year boundary with normalization', () => {
			const minDate = new Date(2023, 11, 31); // Dec 31, 2023
			const maxDate = new Date(2024, 0, 31); // Jan 31, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						// Normalized dates should compare correctly across years
						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('Disabled Button Functionality', () => {
		it('should disable buttons for out-of-range dates', () => {
			const minDate = new Date(2024, 0, 10);
			const maxDate = new Date(2024, 0, 20);
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const button = cell.querySelector('button[data-day]') as HTMLButtonElement;
						if (!button) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
							expect(button.hasAttribute('disabled')).toBe(true);
							expect(button.getAttribute('disabled')).toBe('true');
						}
					});

					resolve();
				}, 100);
			});
		});

		it('should enable buttons for in-range dates', () => {
			const minDate = new Date(2024, 0, 10);
			const maxDate = new Date(2024, 0, 20);
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15)
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const button = cell.querySelector('button[data-day]') as HTMLButtonElement;
						if (!button) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const isOutsideMonth = cell.hasAttribute('data-outside');

						// In-range dates (excluding adjacent month cells that may have other constraints)
						if (!isOutOfRange && !isOutsideMonth) {
							expect(cell.hasAttribute('data-out-of-range')).toBe(false);
							// Buttons should not be disabled unless they're out of range
							if (!isOutOfRange) {
								expect(button.hasAttribute('disabled')).toBe(false);
							}
						}
					});

					resolve();
				}, 100);
			});
		});
	});

	describe('Multi-Month Display', () => {
		it('should correctly apply constraints to all visible months', () => {
			const minDate = new Date(2024, 0, 10); // Jan 10, 2024
			const maxDate = new Date(2024, 1, 20); // Feb 20, 2024
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 15),
				visibleMonths: 2 // Display 2 months side-by-side
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
						}
					});

					resolve();
				}, 150);
			});
		});

		it('should update constraints when navigating in multi-month view', () => {
			const minDate = new Date(2024, 0, 10);
			const maxDate = new Date(2024, 2, 20);
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 1, 15),
				visibleMonths: 2
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					// Navigate to next month
					const nextButton = element.querySelector('[data-kt-datepicker-next]') as HTMLElement;
					if (nextButton) {
						nextButton.click();

						setTimeout(() => {
							const dayCells = getDayCells(element);

							dayCells.forEach((cell) => {
								const cellDate = getDateFromCell(cell);
								if (!cellDate) return;

								const isOutOfRange = isBefore(cellDate, minDate) || isAfter(cellDate, maxDate);
								const hasAttribute = cell.hasAttribute('data-out-of-range');

								if (isOutOfRange) {
									expect(hasAttribute).toBe(true);
								}
							});

							resolve();
						}, 200);
					} else {
						resolve();
					}
				}, 150);
			});
		});
	});

	describe('Date Normalization', () => {
		it('should normalize dates to midnight for accurate comparison', () => {
			// Create dates with different times to ensure normalization works
			const minDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024 12:30:45
			const maxDate = new Date(2024, 0, 20, 8, 15, 30); // Jan 20, 2024 08:15:30
			const config: KTDatepickerConfig = {
				format: 'MM/DD/YYYY',
				minDate: minDate,
				maxDate: maxDate,
				value: new Date(2024, 0, 17, 15, 0, 0) // Jan 17, 2024 15:00:00
			};

			datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
			datepicker.open();

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					const dayCells = getDayCells(element);

					// The normalization should make comparisons based on date only, not time
					dayCells.forEach((cell) => {
						const cellDate = getDateFromCell(cell);
						if (!cellDate) return;

						// Normalize for comparison
						const normalizedCellDate = new Date(cellDate);
						normalizedCellDate.setHours(0, 0, 0, 0);

						const normalizedMinDate = new Date(minDate);
						normalizedMinDate.setHours(0, 0, 0, 0);

						const normalizedMaxDate = new Date(maxDate);
						normalizedMaxDate.setHours(0, 0, 0, 0);

						const isOutOfRange = normalizedCellDate < normalizedMinDate || normalizedCellDate > normalizedMaxDate;
						const hasAttribute = cell.hasAttribute('data-out-of-range');

						if (isOutOfRange) {
							expect(hasAttribute).toBe(true);
						}
					});

					resolve();
				}, 100);
			});
		});
	});
});

