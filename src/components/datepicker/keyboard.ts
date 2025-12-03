/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTDatepickerStateManager } from './config';
import { KTDatepickerEventManager, KTDatepickerEventName } from './events';

/**
 * Keyboard navigation handler for KTDatepicker
 */
export class KTDatepickerKeyboard {
	private _element: HTMLElement;
	private _stateManager: KTDatepickerStateManager;
	private _eventManager: KTDatepickerEventManager;
	private _focusedDay: number | null = null;
	private _isListening = false;

	/**
	 * Constructor for the KTDatepickerKeyboard class
	 *
	 * @param element - The datepicker element
	 * @param stateManager - State manager for the datepicker
	 */
	constructor(element: HTMLElement, stateManager: KTDatepickerStateManager) {
		this._element = element;
		this._stateManager = stateManager;
		this._eventManager = stateManager.getEventManager();

		// Set up listeners
		this._setupEventListeners();
	}

	/**
	 * Set up event listeners for keyboard navigation
	 */
	private _setupEventListeners(): void {
		// Listen for open/close events to activate/deactivate keyboard navigation
		this._eventManager.addEventListener(KTDatepickerEventName.OPEN, () =>
			this._activateKeyboardNavigation(),
		);
		this._eventManager.addEventListener(KTDatepickerEventName.CLOSE, () =>
			this._deactivateKeyboardNavigation(),
		);

		// Listen for custom keyboard-open event
		this._eventManager.addEventListener(
			KTDatepickerEventName.KEYBOARD_OPEN,
			() => {
				// Ensure we activate keyboard navigation
				this._activateKeyboardNavigation();

				// Set initial focus day with a slight delay to allow the dropdown to render
				setTimeout(() => {
					// Initialize focused day if needed
					if (this._focusedDay === null) {
						const state = this._stateManager.getState();
						if (state.selectedDate) {
							this._focusedDay = state.selectedDate.getDate();
						} else {
							this._focusedDay = new Date().getDate();
						}
					}

					// Focus the day
					this._focusDay();
				}, 150);
			},
		);

		// Handle focus events
		this._element.addEventListener('focusin', (e) => {
			if (this._stateManager.getState().isOpen && !this._isListening) {
				this._activateKeyboardNavigation();
			}
		});

		// Add keydown event to the element itself to open dropdown with Enter key
		this._element.addEventListener('keydown', (e) => {
			const state = this._stateManager.getState();

			// If not open yet, handle keys that should open the dropdown
			if (!state.isOpen) {
				if (
					e.key === 'Enter' ||
					e.key === ' ' ||
					e.key === 'ArrowDown' ||
					e.key === 'ArrowUp'
				) {
					e.preventDefault();
					e.stopPropagation(); // Prevent other handlers from capturing this event
					this._stateManager.setOpen(true);

					// Set initial focus day if none
					if (this._focusedDay === null) {
						if (state.selectedDate) {
							this._focusedDay = state.selectedDate.getDate();
						} else {
							this._focusedDay = new Date().getDate();
						}
						// Focus the day after dropdown opens
						setTimeout(() => this._focusDay(), 150);
					}
				}
			}
		});

		// Add an additional event listener to the input field specifically
		const inputs = this._element.querySelectorAll('input');
		inputs.forEach((input) => {
			input.addEventListener('keydown', (e) => {
				const state = this._stateManager.getState();
				if (!state.isOpen) {
					if (
						e.key === 'Enter' ||
						e.key === ' ' ||
						e.key === 'ArrowDown' ||
						e.key === 'ArrowUp'
					) {
						e.preventDefault();
						e.stopPropagation();
						this._stateManager.setOpen(true);

						// Set initial focus day
						if (this._focusedDay === null) {
							if (state.selectedDate) {
								this._focusedDay = state.selectedDate.getDate();
							} else {
								this._focusedDay = new Date().getDate();
							}
							// Focus the day after dropdown opens
							setTimeout(() => this._focusDay(), 150);
						}
					}
				}
			});
		});

		// Add an even more specific listener for Enter key on the display element
		const displayElement = this._element.querySelector(
			'[data-kt-datepicker-display]',
		);
		if (displayElement) {
			displayElement.addEventListener(
				'keydown',
				(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						e.stopPropagation();

						const state = this._stateManager.getState();
						if (!state.isOpen) {
							this._stateManager.setOpen(true);

							// Focus the current day with a slightly longer delay
							setTimeout(() => {
								if (this._focusedDay === null) {
									if (state.selectedDate) {
										this._focusedDay = state.selectedDate.getDate();
									} else {
										this._focusedDay = new Date().getDate();
									}
								}
								this._focusDay();
							}, 200);
						}
					}
				},
				true,
			); // Use capture phase to ensure this runs first
		}
	}

	/**
	 * Activate keyboard navigation
	 */
	private _activateKeyboardNavigation(): void {
		if (this._isListening) return;

		// Add global keydown listener
		document.addEventListener('keydown', this._handleKeyDown);
		this._isListening = true;

		// Set initial focus day if none
		if (this._focusedDay === null) {
			const state = this._stateManager.getState();
			if (state.selectedDate) {
				this._focusedDay = state.selectedDate.getDate();
			} else {
				this._focusedDay = new Date().getDate();
			}

			// Focus the day
			setTimeout(() => this._focusDay(), 100);
		}
	}

	/**
	 * Deactivate keyboard navigation
	 */
	private _deactivateKeyboardNavigation(): void {
		if (!this._isListening) return;

		// Remove global keydown listener
		document.removeEventListener('keydown', this._handleKeyDown);
		this._isListening = false;
	}

	/**
	 * Handle keydown events
	 */
	private _handleKeyDown = (e: KeyboardEvent): void => {
		const state = this._stateManager.getState();
		const viewMode = state.viewMode;

		// ESC key closes the dropdown
		if (e.key === 'Escape') {
			e.preventDefault();
			this._stateManager.setOpen(false);
			return;
		}

		// Handle different view modes differently
		switch (viewMode) {
			case 'days':
				this._handleDaysViewKeyNavigation(e);
				break;
			case 'months':
				this._handleMonthsViewKeyNavigation(e);
				break;
			case 'years':
				this._handleYearsViewKeyNavigation(e);
				break;
		}
	};

	/**
	 * Handle key navigation in days view
	 */
	private _handleDaysViewKeyNavigation(e: KeyboardEvent): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const currentDate = new Date(state.currentDate);
		const daysInMonth = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			0,
		).getDate();

		// Get the day of week for the first day of the month to calculate grid positions
		const firstDayOfMonth = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			1,
		).getDay();
		// Adjust for first day of week setting
		const firstDayOffset =
			(firstDayOfMonth - config.locales[config.locale].firstDayOfWeek + 7) % 7;

		// Ensure we have a focused day
		if (this._focusedDay === null) {
			if (state.selectedDate) {
				this._focusedDay = state.selectedDate.getDate();
			} else {
				this._focusedDay = new Date().getDate();
			}
		}

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				e.stopPropagation(); // Stop event propagation
				if (this._focusedDay === 1) {
					// Move to previous month
					const newDate = new Date(currentDate);
					newDate.setMonth(newDate.getMonth() - 1);
					this._stateManager.setCurrentDate(newDate);

					// Set focus to last day of previous month
					const lastDayPrevMonth = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						0,
					).getDate();
					this._focusedDay = lastDayPrevMonth;
				} else {
					this._focusedDay = Math.max(1, (this._focusedDay || 1) - 1);
				}
				this._focusDay();
				break;

			case 'ArrowRight':
				e.preventDefault();
				e.stopPropagation(); // Stop event propagation
				if (this._focusedDay === daysInMonth) {
					// Move to next month
					const newDate = new Date(currentDate);
					newDate.setMonth(newDate.getMonth() + 1);
					this._stateManager.setCurrentDate(newDate);

					// Set focus to first day of next month
					this._focusedDay = 1;
				} else {
					this._focusedDay = Math.min(daysInMonth, (this._focusedDay || 1) + 1);
				}
				this._focusDay();
				break;

			case 'ArrowUp':
				e.preventDefault();
				e.stopPropagation(); // Stop event propagation
				if (this._focusedDay && this._focusedDay <= 7) {
					// We're in the first row of the current month
					// Calculate the row position in the grid
					const dayPosition = (this._focusedDay - 1 + firstDayOffset) % 7;

					// Move to previous month
					const newDate = new Date(currentDate);
					newDate.setMonth(newDate.getMonth() - 1);
					this._stateManager.setCurrentDate(newDate);

					// Get days in previous month
					const lastDayPrevMonth = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						0,
					).getDate();

					// Calculate the corresponding day in the previous month's last row
					// Start with the last day of previous month
					this._focusedDay = lastDayPrevMonth - (6 - dayPosition);
				} else {
					// Move up one week (7 days)
					this._focusedDay = (this._focusedDay || 1) - 7;
				}
				this._focusDay();
				break;

			case 'ArrowDown':
				e.preventDefault();
				e.stopPropagation(); // Stop event propagation
				const lastRowStart = daysInMonth - ((daysInMonth + firstDayOffset) % 7);

				if (this._focusedDay && this._focusedDay > lastRowStart) {
					// We're in the last row of the current month
					// Calculate position in last row (0-6)
					const dayPosition = (this._focusedDay - 1 + firstDayOffset) % 7;

					// Move to next month
					const newDate = new Date(currentDate);
					newDate.setMonth(newDate.getMonth() + 1);
					this._stateManager.setCurrentDate(newDate);

					// Calculate the corresponding day in next month's first row
					this._focusedDay =
						dayPosition + 1 - ((dayPosition + firstDayOffset) % 7);
					// Ensure we're in bounds for next month
					const nextMonthDays = new Date(
						newDate.getFullYear(),
						newDate.getMonth() + 1,
						0,
					).getDate();
					this._focusedDay = Math.min(this._focusedDay, nextMonthDays);
				} else {
					// Move down one week (7 days)
					this._focusedDay = Math.min(daysInMonth, (this._focusedDay || 1) + 7);
				}
				this._focusDay();
				break;

			case 'Home':
				e.preventDefault();
				// Move to first day of the month
				this._focusedDay = 1;
				this._focusDay();
				break;

			case 'End':
				e.preventDefault();
				// Move to last day of the month
				this._focusedDay = daysInMonth;
				this._focusDay();
				break;

			case 'PageUp':
				e.preventDefault();
				// Move to previous month
				const prevMonthDate = new Date(currentDate);
				prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
				this._stateManager.setCurrentDate(prevMonthDate);

				// Adjust focused day if needed
				const prevMonthDays = new Date(
					prevMonthDate.getFullYear(),
					prevMonthDate.getMonth() + 1,
					0,
				).getDate();
				if (this._focusedDay > prevMonthDays) {
					this._focusedDay = prevMonthDays;
				}
				this._focusDay();
				break;

			case 'PageDown':
				e.preventDefault();
				// Move to next month
				const nextMonthDate = new Date(currentDate);
				nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
				this._stateManager.setCurrentDate(nextMonthDate);

				// Adjust focused day if needed
				const nextMonthDays = new Date(
					nextMonthDate.getFullYear(),
					nextMonthDate.getMonth() + 1,
					0,
				).getDate();
				if (this._focusedDay > nextMonthDays) {
					this._focusedDay = nextMonthDays;
				}
				this._focusDay();
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				if (this._focusedDay) {
					// Select the focused day
					const selectedDate = new Date(currentDate);
					selectedDate.setDate(this._focusedDay);

					if (config.enableTime && state.selectedTime) {
						selectedDate.setHours(
							state.selectedTime.hours,
							state.selectedTime.minutes,
							state.selectedTime.seconds,
						);
					} else {
						selectedDate.setHours(0, 0, 0, 0);
					}

					this._stateManager.setSelectedDate(selectedDate);

					// Close the dropdown if not range selection or if range is complete
					if (
						!config.range ||
						(state.selectedDateRange &&
							state.selectedDateRange.startDate &&
							state.selectedDateRange.endDate)
					) {
						this._stateManager.setOpen(false);
					}
				}
				break;
		}
	}

	/**
	 * Handle key navigation in months view
	 */
	private _handleMonthsViewKeyNavigation(e: KeyboardEvent): void {
		const state = this._stateManager.getState();
		const currentDate = new Date(state.currentDate);
		const currentMonth = currentDate.getMonth();

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				currentDate.setMonth((currentMonth - 1 + 12) % 12);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowRight':
				e.preventDefault();
				currentDate.setMonth((currentMonth + 1) % 12);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowUp':
				e.preventDefault();
				currentDate.setMonth((currentMonth - 3 + 12) % 12);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowDown':
				e.preventDefault();
				currentDate.setMonth((currentMonth + 3) % 12);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'Home':
				e.preventDefault();
				currentDate.setMonth(0);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'End':
				e.preventDefault();
				currentDate.setMonth(11);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				this._stateManager.setViewMode('days');
				break;
		}
	}

	/**
	 * Handle key navigation in years view
	 */
	private _handleYearsViewKeyNavigation(e: KeyboardEvent): void {
		const state = this._stateManager.getState();
		const currentDate = new Date(state.currentDate);
		const currentYear = currentDate.getFullYear();

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				currentDate.setFullYear(currentYear - 1);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowRight':
				e.preventDefault();
				currentDate.setFullYear(currentYear + 1);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowUp':
				e.preventDefault();
				currentDate.setFullYear(currentYear - 4);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'ArrowDown':
				e.preventDefault();
				currentDate.setFullYear(currentYear + 4);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'Home':
				e.preventDefault();
				const yearsPerView = this._stateManager.getConfig().visibleYears;
				const startYear = currentYear - (currentYear % yearsPerView);
				currentDate.setFullYear(startYear);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'End':
				e.preventDefault();
				const yearsPerPage = this._stateManager.getConfig().visibleYears;
				const startYearEnd = currentYear - (currentYear % yearsPerPage);
				const endYear = startYearEnd + yearsPerPage - 1;
				currentDate.setFullYear(endYear);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'PageUp':
				e.preventDefault();
				const yearsPerPageUp = this._stateManager.getConfig().visibleYears;
				currentDate.setFullYear(currentYear - yearsPerPageUp);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'PageDown':
				e.preventDefault();
				const yearsPerPageDown = this._stateManager.getConfig().visibleYears;
				currentDate.setFullYear(currentYear + yearsPerPageDown);
				this._stateManager.setCurrentDate(currentDate);
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				this._stateManager.setViewMode('months');
				break;
		}
	}

	/**
	 * Focus the currently focused day in the calendar
	 */
	private _focusDay(): void {
		if (!this._focusedDay) return;

		const state = this._stateManager.getState();

		// Try different selectors for the dropdown
		const selectors = [
			'.absolute.bg-white.shadow-lg.rounded-lg',
			'.kt-datepicker-dropdown',
			'.calendar-container',
		];

		let dropdown = null;
		for (const selector of selectors) {
			dropdown = this._element.querySelector(selector);
			if (dropdown) break;
		}

		if (!dropdown) {
			// If no dropdown found, try getting any element with calendar buttons
			dropdown =
				this._element.querySelector('.multiple-months') ||
				this._element.querySelector('[data-kt-datepicker-container]') ||
				this._element;
		}

		const currentDay = this._focusedDay;
		const currentMonth = state.currentDate.getMonth();
		const currentYear = state.currentDate.getFullYear();

		// First try to find the day in the current month
		let dayButton = dropdown.querySelector(
			`button[data-date="${currentDay}"]:not(.text-gray-400)`,
		);

		// If not found, try to find any button with the day number
		if (!dayButton) {
			dayButton = dropdown.querySelector(`button[data-date="${currentDay}"]`);
		}

		// If still not found, try to find by date-id
		if (!dayButton) {
			const dateId = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
			dayButton = dropdown.querySelector(`button[data-date-id="${dateId}"]`);
		}

		// As a last resort, find any day button
		if (!dayButton) {
			dayButton = dropdown.querySelector('button[data-date]');
		}

		// Focus the day button if found
		if (dayButton) {
			(dayButton as HTMLElement).focus();

			// Scroll into view if needed
			if (dayButton.scrollIntoView) {
				dayButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		}
	}
}
