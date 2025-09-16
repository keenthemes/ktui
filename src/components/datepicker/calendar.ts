/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTDatepickerStateManager } from './config';
import {
	calendarGridTemplate,
	dayTemplate,
	datepickerContainerTemplate,
	monthYearSelectTemplate,
	monthSelectionTemplate,
	yearSelectionTemplate,
} from './templates';
import {
	generateCalendarMonth,
	getLocaleConfig,
	isSameDay,
	isDateDisabled,
	isDateBetween,
	isWeekend,
	formatDate,
	parseDate,
	isValidDate,
	getDaysInMonth,
	isDateEqual,
	isDateInRange,
} from './utils';
import {
	CalendarDayCellInterface,
	DateRangeInterface,
	KTDatepickerEvents,
} from './types';
import { KTDatepickerDropdown } from './dropdown';
import { KTDatepickerEventManager, KTDatepickerEventName } from './events';

/**
 * Calendar component for the KTDatepicker
 * Handles rendering and interactions with the calendar
 */
export class KTDatepickerCalendar {
	private _element: HTMLElement;
	private _stateManager: KTDatepickerStateManager;
	private _eventManager: KTDatepickerEventManager;
	private _calendarContainer: HTMLElement | null = null;
	private _dropdownElement: HTMLElement | null = null;
	private _dropdownManager: KTDatepickerDropdown | null = null;
	private _isVisible: boolean = false;
	private _currentViewMonth: number;
	private _currentViewYear: number;

	/**
	 * Constructor for the KTDatepickerCalendar class
	 *
	 * @param element - The datepicker element
	 * @param stateManager - State manager for the datepicker
	 */
	constructor(element: HTMLElement, stateManager: KTDatepickerStateManager) {
		this._element = element;
		this._stateManager = stateManager;
		this._eventManager = stateManager.getEventManager();

		// Get current date/time
		const now = new Date();
		this._currentViewMonth = now.getMonth();
		this._currentViewYear = now.getFullYear();

		this._initializeCalendar();
		this._setupEventListeners();
	}

	/**
	 * Initialize the calendar
	 */
	private _initializeCalendar(): void {
		const config = this._stateManager.getConfig();
		const locale = getLocaleConfig(config);

		// Create calendar container
		this._dropdownElement = document.createElement('div');
		this._dropdownElement.className = 'kt-datepicker-dropdown';
		this._dropdownElement.setAttribute('role', 'dialog');
		this._dropdownElement.setAttribute('aria-modal', 'true');
		this._dropdownElement.setAttribute('aria-label', 'Calendar');

		// Hidden by default
		this._dropdownElement.classList.add('hidden');
		this._dropdownElement.setAttribute('aria-hidden', 'true');

		// Create header for navigation
		const headerElement = document.createElement('div');
		headerElement.className = 'kt-datepicker-calendar-header';

		// Left navigation button
		const leftNavButton = document.createElement('button');
		leftNavButton.type = 'button';
		leftNavButton.className = 'kt-datepicker-calendar-left-nav-btn';
		leftNavButton.setAttribute('aria-label', 'Previous month');
		leftNavButton.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
		leftNavButton.addEventListener('click', () => this._navigateMonth(-1));

		// Month and Year selector (center)
		const headerCenter = document.createElement('div');
		headerCenter.className = 'kt-datepicker-datepicker-header-middle';

		// Right navigation button
		const rightNavButton = document.createElement('button');
		rightNavButton.type = 'button';
		rightNavButton.className = 'kt-dropdown-calendar-right-nav-btn';
		rightNavButton.setAttribute('aria-label', 'Next month');
		rightNavButton.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>';
		rightNavButton.addEventListener('click', () => this._navigateMonth(1));

		// Assemble header
		headerElement.appendChild(leftNavButton);
		headerElement.appendChild(headerCenter);
		headerElement.appendChild(rightNavButton);
		this._dropdownElement.appendChild(headerElement);

		// Create calendar content container
		this._calendarContainer = document.createElement('div');
		this._calendarContainer.className = 'kt-datepicker-calendar-container';
		this._dropdownElement.appendChild(this._calendarContainer);

		// Add calendar footer with action buttons
		const footerElement = document.createElement('div');
		footerElement.className = 'kt-datepicker-calendar-footer';

		// Today button
		const todayButton = document.createElement('button');
		todayButton.type = 'button';
		todayButton.className = 'kt-datepicker-calendar-today-btn';
		todayButton.textContent = 'Today';
		todayButton.addEventListener('click', () => this._goToToday());

		// Clear button
		const clearButton = document.createElement('button');
		clearButton.type = 'button';
		clearButton.className = 'kt-datepicker-calendar-clear-btn';
		clearButton.textContent = 'Clear';
		clearButton.addEventListener('click', () => this._clearSelection());

		// Apply button
		const applyButton = document.createElement('button');
		applyButton.type = 'button';
		applyButton.className = 'kt-datepicker-calendar-clear-btn';
		applyButton.textContent = 'Apply';
		applyButton.addEventListener('click', () => this._applySelection());

		// Assemble footer
		footerElement.appendChild(todayButton);

		const rightFooter = document.createElement('div');
		rightFooter.className = 'kt-datepicker-calendar-footer-right';
		rightFooter.appendChild(clearButton);
		rightFooter.appendChild(applyButton);
		footerElement.appendChild(rightFooter);

		this._dropdownElement.appendChild(footerElement);

		// Add to document
		this._element.appendChild(this._dropdownElement);

		// Initialize dropdown manager
		this._initDropdownManager();

		// Initialize calendar view
		this._renderCalendarView();
	}

	/**
	 * Initialize the dropdown manager
	 */
	private _initDropdownManager(): void {
		const config = this._stateManager.getConfig();

		// Use the display element rather than the input element
		const displayElement = this._element.querySelector(
			'[data-kt-datepicker-display]'
		) as HTMLElement;
		const inputElement = this._element.querySelector(
			'[data-kt-datepicker-input]'
		) as HTMLElement;
		const triggerElement = displayElement || inputElement;

		if (triggerElement && this._dropdownElement) {
			this._dropdownManager = new KTDatepickerDropdown(
				this._element,
				triggerElement,
				this._dropdownElement,
				config
			);

			// Add keyboard event listener to the trigger element
			triggerElement.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
					e.preventDefault();
					if (!this._isVisible) {
						// Open the dropdown
						this._stateManager.setOpen(true);
					}
				}
			});
		}
	}

	/**
	 * Set up event listeners for calendar interactions
	 */
	private _setupEventListeners(): void {
		if (!this._dropdownElement) return;

		// Get elements
		const prevMonthBtn = this._dropdownElement.querySelector(
			'button[aria-label="Previous Month"]'
		);
		const nextMonthBtn = this._dropdownElement.querySelector(
			'button[aria-label="Next Month"]'
		);

		// Find buttons by text content instead of using jQuery-style selectors
		const buttons = this._dropdownElement.querySelectorAll('button');
		let todayBtn: HTMLButtonElement | null = null;
		let clearBtn: HTMLButtonElement | null = null;
		let applyBtn: HTMLButtonElement | null = null;

		buttons.forEach((btn) => {
			const btnText = btn.textContent?.trim();
			if (btnText === 'Today') todayBtn = btn as HTMLButtonElement;
			else if (btnText === 'Clear') clearBtn = btn as HTMLButtonElement;
			else if (btnText === 'Apply') applyBtn = btn as HTMLButtonElement;
		});

		const monthYearText = this._dropdownElement.querySelector(
			'.kt-datepicker-calendar-monthyear-text'
		);

		// Month navigation
		if (prevMonthBtn) {
			prevMonthBtn.addEventListener('click', () => this._navigateMonth(-1));
		}

		if (nextMonthBtn) {
			nextMonthBtn.addEventListener('click', () => this._navigateMonth(1));
		}

		// Month/year view toggle
		if (monthYearText) {
			monthYearText.addEventListener('click', () =>
				this._toggleMonthYearView()
			);
		}

		// Today, Clear, Apply buttons
		if (todayBtn) {
			todayBtn.addEventListener('click', () => this._goToToday());
		}

		if (clearBtn) {
			clearBtn.addEventListener('click', () => this._clearSelection());
		}

		if (applyBtn) {
			applyBtn.addEventListener('click', () => this._applySelection());
		}

		// Handle day selection through event delegation
		if (this._calendarContainer) {
			this._calendarContainer.addEventListener('click', (e) => {
				const target = e.target as HTMLElement;
				const dayButton = target.closest('button[data-date]') as HTMLElement;

				if (dayButton && !dayButton.hasAttribute('disabled')) {
					// Get the date ID directly from the clicked button (YYYY-MM-DD format)
					const dateIdAttr = dayButton.getAttribute('data-date-id');

					if (dateIdAttr) {
						// Parse the ISO date string to get exact year, month, day
						const [year, month, day] = dateIdAttr
							.split('-')
							.map((part) => parseInt(part, 10));

						// Create the date object from the parsed components
						const clickedDate = new Date(year, month - 1, day); // Month is 0-indexed in JS
						clickedDate.setHours(0, 0, 0, 0); // Set to midnight

						// Handle this date directly instead of using day number
						this._handleDateSelection(clickedDate, dayButton);
					} else {
						// Fallback to old method using day number if date-id is not present
						const dateAttr = dayButton.getAttribute('data-date');
						if (dateAttr) {
							const day = parseInt(dateAttr, 10);
							this._handleDaySelection(day);
						}
					}
				}
			});

			// Add hover effect for range selection
			this._calendarContainer.addEventListener('mouseover', (e) => {
				const state = this._stateManager.getState();
				const config = this._stateManager.getConfig();

				// Only apply hover effect in range mode when start date is selected but end date is not
				if (
					!config.range ||
					!state.selectedDateRange ||
					!state.selectedDateRange.startDate ||
					state.selectedDateRange.endDate
				) {
					return;
				}

				const target = e.target as HTMLElement;
				const dayButton = target.closest('button[data-date]');

				if (dayButton && !dayButton.hasAttribute('disabled')) {
					// Clear any existing hover classes
					this._clearRangeHoverClasses();

					// Get the proper date from the data-date-id attribute
					const dateIdAttr = dayButton.getAttribute('data-date-id');

					if (dateIdAttr) {
						// Parse the ISO date string (YYYY-MM-DD)
						const [year, month, day] = dateIdAttr
							.split('-')
							.map((part) => parseInt(part, 10));
						const hoverDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

						// Apply hover effect between start date and current hover date
						this._applyRangeHoverEffect(
							state.selectedDateRange.startDate,
							hoverDate
						);
					} else {
						// Fallback to old method if data-date-id is not present
						const dateAttr = dayButton.getAttribute('data-date');
						if (dateAttr) {
							const day = parseInt(dateAttr, 10);
							const hoverDate = new Date(state.currentDate);
							hoverDate.setDate(day);

							// Apply hover effect between start date and current hover date
							this._applyRangeHoverEffect(
								state.selectedDateRange.startDate,
								hoverDate
							);
						}
					}
				}
			});

			// Clear hover effect when mouse leaves the calendar
			this._calendarContainer.addEventListener('mouseleave', () => {
				this._clearRangeHoverClasses();
			});
		}

		// Listen for state changes
		this._eventManager.addEventListener(
			KTDatepickerEventName.STATE_CHANGE,
			(e: CustomEvent) => {
				const detail = e.detail?.payload;
				const config = this._stateManager.getConfig();

				// For range selection, check if we need to keep the dropdown open
				if (config.range && detail && detail.selectedDateRange) {
					const { startDate, endDate } = detail.selectedDateRange;

					// If start date is set but no end date, keep dropdown open
					if (startDate && !endDate) {
						this._stateManager.getState().isRangeSelectionInProgress = true;
					} else if (startDate && endDate) {
						this._stateManager.getState().isRangeSelectionInProgress = false;
					}
				}

				// Update calendar view
				this._updateCalendarView();
			}
		);

		// Listen for other state changes
		this._eventManager.addEventListener(KTDatepickerEventName.VIEW_CHANGE, () =>
			this._updateViewMode()
		);
		this._eventManager.addEventListener(KTDatepickerEventName.OPEN, () =>
			this.show()
		);
		this._eventManager.addEventListener(KTDatepickerEventName.CLOSE, () =>
			this.hide()
		);
		this._eventManager.addEventListener(KTDatepickerEventName.UPDATE, () =>
			this._updateCalendarView()
		);

		// Time inputs
		const timeContainer = this._dropdownElement.querySelector(
			'.kt-datepicker-calendar-time-container'
		);
		if (timeContainer) {
			const hourInput = timeContainer.querySelector(
				'input[aria-label="Hour"]'
			) as HTMLInputElement;
			const minuteInput = timeContainer.querySelector(
				'input[aria-label="Minute"]'
			) as HTMLInputElement;
			const secondInput = timeContainer.querySelector(
				'input[aria-label="Second"]'
			) as HTMLInputElement;
			const amButton = timeContainer.querySelector(
				'button[aria-label="AM"]'
			) as HTMLButtonElement;
			const pmButton = timeContainer.querySelector(
				'button[aria-label="PM"]'
			) as HTMLButtonElement;

			// Update AM/PM button texts
			const config = this._stateManager.getConfig();
			if (amButton) amButton.textContent = config.am;
			if (pmButton) pmButton.textContent = config.pm;

			// Time input listeners
			if (hourInput) {
				hourInput.addEventListener('change', () => this._handleTimeChange());
			}

			if (minuteInput) {
				minuteInput.addEventListener('change', () => this._handleTimeChange());
			}

			if (secondInput) {
				secondInput.addEventListener('change', () => this._handleTimeChange());
			}

			// AM/PM selection
			if (amButton) {
				amButton.addEventListener('click', () => this._setAmPm('AM'));
			}

			if (pmButton) {
				pmButton.addEventListener('click', () => this._setAmPm('PM'));
			}
		}
	}

	/**
	 * Render the calendar view based on current state
	 */
	private _renderCalendarView(): void {
		if (!this._calendarContainer) return;

		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const locale = getLocaleConfig(config);

		// Clear existing content
		this._calendarContainer.innerHTML = '';

		// Set up proper container classes for multiple months view
		if (config.visibleMonths > 1) {
			// For multiple months, use a flex container with no wrapping
			this._calendarContainer.className = 'kt-datepicker-calendar-container-mt';
		} else {
			this._calendarContainer.className = 'kt-datepicker-calendar-container';
		}

		// Render based on view mode
		switch (state.viewMode) {
			case 'days':
				// For each visible month, create a calendar
				for (let i = 0; i < config.visibleMonths; i++) {
					// Calculate the month to display
					const tempDate = new Date(state.currentDate);
					tempDate.setMonth(state.currentDate.getMonth() + i);

					const month = tempDate.getMonth();
					const year = tempDate.getFullYear();

					// Create month container
					const monthContainer = document.createElement('div');

					// Set appropriate class based on number of months
					if (config.visibleMonths > 1) {
						// For multiple months, use fixed width and properly spaced
						monthContainer.className = 'kt-datepicker-calendar-month-mt';
						monthContainer.setAttribute('data-month-id', `${month}-${year}`);
					} else {
						monthContainer.className = 'kt-datepicker-calendar-month';
					}

					// Add month header
					const monthHeader = document.createElement('div');
					monthHeader.className = 'kt-datepicker-calendar-month-header';
					monthHeader.textContent = `${locale.monthNames[month]} ${year}`;
					monthContainer.appendChild(monthHeader);

					// Generate calendar grid
					monthContainer.innerHTML += calendarGridTemplate(
						locale,
						config.weekDays
					);

					// Get days for the month
					const calendarMatrix = generateCalendarMonth(year, month, config);

					// Render days
					const daysBody = monthContainer.querySelector('tbody');
					if (daysBody) {
						daysBody.innerHTML = this._renderDays(calendarMatrix, month, year);
					}

					// Add to container
					this._calendarContainer.appendChild(monthContainer);
				}

				// Update the month/year display in header
				this._updateMonthYearDisplay();
				break;

			case 'months':
				// Render month selection view with current month
				const currentMonth = state.currentDate.getMonth();
				this._calendarContainer.innerHTML = monthSelectionTemplate(
					locale,
					currentMonth
				);

				// Add click events to month buttons
				const monthButtons =
					this._calendarContainer.querySelectorAll('button[data-month]');
				monthButtons.forEach((btn) => {
					btn.addEventListener('click', (e) => {
						const target = e.target as HTMLElement;
						const monthIdx = target.getAttribute('data-month');
						if (monthIdx) {
							this._selectMonth(parseInt(monthIdx, 10));
						}
					});
				});
				break;

			case 'years':
				// Get current year and calculate year range
				const currentYear = state.currentDate.getFullYear();
				const startYear = currentYear - Math.floor(config.visibleYears / 2);
				const endYear = startYear + config.visibleYears - 1;

				// Render year selection view
				this._calendarContainer.innerHTML = yearSelectionTemplate(
					startYear,
					endYear,
					currentYear
				);

				// Add click events to year buttons
				const yearButtons =
					this._calendarContainer.querySelectorAll('button[data-year]');
				yearButtons.forEach((btn) => {
					btn.addEventListener('click', (e) => {
						const target = e.target as HTMLElement;
						const year = target.getAttribute('data-year');
						if (year) {
							this._selectYear(parseInt(year, 10));
						}
					});
				});

				// Add navigation for year ranges
				const prevYearsBtn = this._calendarContainer.querySelector(
					'button[data-year-nav="prev"]'
				);
				if (prevYearsBtn) {
					prevYearsBtn.addEventListener('click', () => {
						const newYear = startYear - config.visibleYears;
						const newDate = new Date(state.currentDate);
						newDate.setFullYear(newYear);
						this._stateManager.setCurrentDate(newDate);
						this._renderCalendarView();
					});
				}

				const nextYearsBtn = this._calendarContainer.querySelector(
					'button[data-year-nav="next"]'
				);
				if (nextYearsBtn) {
					nextYearsBtn.addEventListener('click', () => {
						const newYear = endYear + 1;
						const newDate = new Date(state.currentDate);
						newDate.setFullYear(newYear);
						this._stateManager.setCurrentDate(newDate);
						this._renderCalendarView();
					});
				}
				break;
		}
	}

	/**
	 * Render days for a calendar month
	 *
	 * @param calendarMatrix - Matrix of dates for the month
	 * @param currentMonth - Current month
	 * @param currentYear - Current year
	 * @returns HTML string for the days
	 */
	private _renderDays(
		calendarMatrix: Date[][],
		currentMonth: number,
		currentYear: number
	): string {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		let html = '';

		// Loop through each week
		for (const week of calendarMatrix) {
			html += '<tr>';

			// Loop through each day in the week
			for (const date of week) {
				// Determine cell properties
				const isCurrentMonth = date.getMonth() === currentMonth;
				const isToday = isSameDay(date, today);
				let isSelected = false;
				let isRangeStart = false;
				let isRangeEnd = false;
				let isInRange = false;

				// Check if date is selected
				if (state.selectedDate && isSameDay(date, state.selectedDate)) {
					isSelected = true;
				}

				// Check if date is in range for range selection
				if (config.range && state.selectedDateRange) {
					const { startDate, endDate } = state.selectedDateRange;

					if (startDate && isSameDay(date, startDate)) {
						isRangeStart = true;
						isSelected = true;
					}

					if (endDate && isSameDay(date, endDate)) {
						isRangeEnd = true;
						isSelected = true;
					}

					if (startDate && endDate && isDateBetween(date, startDate, endDate)) {
						isInRange = true;
					}
				}

				// Check if date is in multi-date selection
				if (config.multiDateSelection && state.selectedDates.length > 0) {
					isSelected = state.selectedDates.some((d) => isSameDay(date, d));
				}

				// Check if date is disabled
				const isDisabled = isDateDisabled(date, config);

				// Check if weekend
				const isWeekendDay = isWeekend(date);

				// Get the actual month and year of this date (may differ from currentMonth/currentYear for adjacent months)
				const actualMonth = date.getMonth();
				const actualYear = date.getFullYear();

				// Generate day cell
				html += dayTemplate(
					date.getDate(),
					actualMonth,
					actualYear,
					isCurrentMonth,
					isToday,
					isSelected,
					isDisabled,
					isRangeStart,
					isRangeEnd,
					isInRange,
					isWeekendDay
				);
			}

			html += '</tr>';
		}

		return html;
	}

	/**
	 * Update the month and year display in the header
	 */
	private _updateMonthYearDisplay(): void {
		if (!this._dropdownElement) return;

		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const locale = getLocaleConfig(config);

		// Find the calendar header
		const calendarHeader = this._dropdownElement.querySelector(
			'.kt-datepicker-calendar-header'
		);
		if (!calendarHeader) return;

		const currentMonth = state.currentDate.getMonth();
		const currentYear = state.currentDate.getFullYear();

		// Update the header with month/year selectors
		calendarHeader.innerHTML = monthYearSelectTemplate(
			locale,
			currentMonth,
			currentYear
		);

		// Add event listeners to the month and year selectors
		const monthSelector = calendarHeader.querySelector(
			'.kt-datepicker-calendar-month-selector'
		);
		const yearSelector = calendarHeader.querySelector(
			'.kt-datepicker-calendar-year-selector'
		);

		if (monthSelector) {
			monthSelector.addEventListener('click', () => {
				// Switch to months view
				this._stateManager.setViewMode('months');
				this._renderCalendarView();
			});
		}

		if (yearSelector) {
			yearSelector.addEventListener('click', () => {
				// Switch to years view
				this._stateManager.setViewMode('years');
				this._renderCalendarView();
			});
		}
	}

	/**
	 * Navigate to a different month
	 *
	 * @param offset - Number of months to offset by
	 */
	private _navigateMonth(offset: number): void {
		const state = this._stateManager.getState();
		const newDate = new Date(state.currentDate);
		newDate.setMonth(newDate.getMonth() + offset);

		this._stateManager.setCurrentDate(newDate);
		this._renderCalendarView();
	}

	/**
	 * Handle direct date selection (new method that takes the actual date object)
	 *
	 * @param selectedDate - The exact date that was selected
	 * @param clickedButton - The button element that was clicked
	 */
	private _handleDateSelection(
		selectedDate: Date,
		clickedButton: HTMLElement
	): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();

		// Check if the date is disabled (outside min/max range or explicitly disabled)
		if (isDateDisabled(selectedDate, config)) {
			console.log(
				'Date is disabled, ignoring selection:',
				selectedDate.toISOString()
			);
			return;
		}

		// Create a new date object set to noon of the selected date in local timezone
		// This prevents timezone shifts causing the wrong date to be selected
		const localSelectedDate = new Date(selectedDate);
		localSelectedDate.setHours(12, 0, 0, 0);

		// Set time if enabled
		if (config.enableTime && state.selectedTime) {
			localSelectedDate.setHours(
				state.selectedTime.hours,
				state.selectedTime.minutes,
				state.selectedTime.seconds,
				0
			);
		}

		// Get the current range state before updating
		const currentRange = state.selectedDateRange;
		const isStartingNewRange =
			!currentRange ||
			!currentRange.startDate ||
			(currentRange.startDate && currentRange.endDate);

		// Determine if we're in a month different from the currently displayed one
		const selectedMonth = localSelectedDate.getMonth();
		const currentViewMonth = state.currentDate.getMonth();
		const isInDifferentMonth = selectedMonth !== currentViewMonth;

		console.log(
			'Selected date:',
			localSelectedDate.toISOString(),
			'Month:',
			selectedMonth,
			'Current view month:',
			currentViewMonth,
			'Day of month:',
			localSelectedDate.getDate()
		);

		// Call the state manager's setSelectedDate method
		this._stateManager.setSelectedDate(localSelectedDate);

		// After setting the date, get the updated range state
		const updatedRange = state.selectedDateRange;

		// If we're in range mode, handle specific range selection behavior
		if (config.range) {
			if (isStartingNewRange) {
				console.log(
					'Starting new range selection with date:',
					localSelectedDate.toISOString()
				);

				// If starting a range with a date in a different month, update the view
				if (isInDifferentMonth) {
					this._stateManager.setCurrentDate(localSelectedDate);
				}

				// Explicitly clear any hover effects when starting a new range
				this._clearRangeHoverClasses();
			} else {
				// This is the second click to complete a range
				console.log(
					'Completing range selection with date:',
					localSelectedDate.toISOString()
				);

				// If the selected range spans different months and we have multiple visible months
				if (
					updatedRange &&
					updatedRange.startDate &&
					updatedRange.endDate &&
					config.visibleMonths > 1
				) {
					// Determine range start and end months
					const startMonth = updatedRange.startDate.getMonth();
					const endMonth = updatedRange.endDate.getMonth();

					// If range spans multiple months, update view to show the earlier month
					if (startMonth !== endMonth) {
						// Show the earlier month as the first visible month
						const earlierDate =
							updatedRange.startDate < updatedRange.endDate
								? updatedRange.startDate
								: updatedRange.endDate;
						this._stateManager.setCurrentDate(earlierDate);
					}
				}
			}

			// Close dropdown only if range selection is complete
			if (updatedRange && updatedRange.startDate && updatedRange.endDate) {
				this._stateManager.setOpen(false);
			}
		} else {
			// For single date selection, close the dropdown
			this._stateManager.setOpen(false);
		}

		// Update calendar view to reflect changes
		this._updateCalendarView();
	}

	/**
	 * Handle day selection (legacy method, kept for backward compatibility)
	 *
	 * @param day - Day number
	 */
	private _handleDaySelection(day: number): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();

		// Find the clicked button element using data-date attribute
		const dayButtons = this._calendarContainer?.querySelectorAll(
			`button[data-date="${day}"]`
		);
		if (!dayButtons || dayButtons.length === 0) return;

		// First look for the button that matches the clicked target in the current month
		let clickedButton: HTMLElement | null = null;

		// Find the actual button that was likely clicked (prefer current month days)
		for (let i = 0; i < dayButtons.length; i++) {
			const button = dayButtons[i] as HTMLElement;
			const parentCell = button.closest('td');

			// Check if the day is in the current month (not faded)
			const isCurrentMonth =
				!button.classList.contains('current') &&
				(!parentCell || !parentCell.classList.contains('current'));

			if (isCurrentMonth) {
				clickedButton = button;
				break;
			}
		}

		// If no current month button found, use the first one
		if (!clickedButton && dayButtons.length > 0) {
			clickedButton = dayButtons[0] as HTMLElement;
		}

		if (!clickedButton) return;

		// Get the proper date from the data-date-id attribute which contains YYYY-MM-DD
		const dateIdAttr = clickedButton.getAttribute('data-date-id');
		if (!dateIdAttr) return;

		// Parse the ISO date string
		const [year, month, dayOfMonth] = dateIdAttr
			.split('-')
			.map((part) => parseInt(part, 10));

		// Create the date object with the proper timezone handling
		// We'll set it to noon in local time to avoid timezone issues
		const selectedDate = new Date(year, month - 1, dayOfMonth, 12, 0, 0, 0); // Month is 0-indexed in JS Date, and setting time to noon

		// First check if this date is disabled (outside min/max range)
		if (isDateDisabled(selectedDate, config)) {
			console.log(
				'Date is disabled, ignoring selection:',
				selectedDate.toISOString()
			);
			return;
		}

		// Use the new direct date selection method
		this._handleDateSelection(selectedDate, clickedButton);
	}

	/**
	 * Toggle between days, months, and years view
	 */
	private _toggleMonthYearView(): void {
		const state = this._stateManager.getState();
		let newMode: 'days' | 'months' | 'years';

		switch (state.viewMode) {
			case 'days':
				newMode = 'months';
				break;
			case 'months':
				newMode = 'years';
				break;
			case 'years':
				newMode = 'days';
				break;
			default:
				newMode = 'days';
		}

		this._stateManager.setViewMode(newMode);
		this._renderCalendarView();
	}

	/**
	 * Update view mode based on state change
	 */
	private _updateViewMode(): void {
		this._renderCalendarView();
	}

	/**
	 * Go to today's date
	 */
	private _goToToday(): void {
		const today = new Date();
		this._stateManager.setCurrentDate(today);
		this._renderCalendarView();
	}

	/**
	 * Clear date selection
	 */
	private _clearSelection(): void {
		this._stateManager.setSelectedDate(null);
		this._updateCalendarView();
	}

	/**
	 * Apply current selection and close dropdown
	 */
	private _applySelection(): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();

		// For range selection, check if range selection is in progress
		if (config.range && state.isRangeSelectionInProgress) {
			console.log(
				'Apply button clicked, but range selection in progress - keeping dropdown open'
			);
			// Don't close when range selection is in progress
			return;
		}

		// Close dropdown for other cases
		this._stateManager.setOpen(false);
	}

	/**
	 * Handle time input changes
	 */
	private _handleTimeChange(): void {
		if (!this._dropdownElement) return;

		const timeContainer = this._dropdownElement.querySelector(
			'.kt-datepicker-calendar-time-container'
		);
		if (!timeContainer) return;

		const hourInput = timeContainer.querySelector(
			'input[aria-label="Hour"]'
		) as HTMLInputElement;
		const minuteInput = timeContainer.querySelector(
			'input[aria-label="Minute"]'
		) as HTMLInputElement;
		const secondInput = timeContainer.querySelector(
			'input[aria-label="Second"]'
		) as HTMLInputElement;
		const amButton = timeContainer.querySelector(
			'button[aria-label="AM"]'
		) as HTMLButtonElement;
		const pmButton = timeContainer.querySelector(
			'button[aria-label="PM"]'
		) as HTMLButtonElement;

		if (!hourInput || !minuteInput || !secondInput) return;

		// Get input values
		let hours = parseInt(hourInput.value, 10);
		const minutes = parseInt(minuteInput.value, 10);
		const seconds = parseInt(secondInput.value, 10);

		// Validate values
		const isValidHours = !isNaN(hours) && hours >= 0 && hours <= 23;
		const isValidMinutes = !isNaN(minutes) && minutes >= 0 && minutes <= 59;
		const isValidSeconds = !isNaN(seconds) && seconds >= 0 && seconds <= 59;

		if (!isValidHours || !isValidMinutes || !isValidSeconds) return;

		// Check if using 12-hour format and adjust for AM/PM
		const isPM = amButton && amButton.classList.contains('bg-blue-500');
		if (isPM && hours < 12) {
			hours += 12;
		} else if (!isPM && hours === 12) {
			hours = 0;
		}

		// Update time in state
		this._stateManager.setSelectedTime({
			hours,
			minutes,
			seconds,
			ampm: isPM ? 'PM' : 'AM',
		});

		// Update selected date with new time if a date is selected
		const state = this._stateManager.getState();
		if (state.selectedDate) {
			const updatedDate = new Date(state.selectedDate);
			updatedDate.setHours(hours, minutes, seconds, 0);
			this._stateManager.setSelectedDate(updatedDate);
		}
	}

	/**
	 * Set AM/PM selection
	 *
	 * @param period - 'AM' or 'PM'
	 */
	private _setAmPm(period: 'AM' | 'PM'): void {
		if (!this._dropdownElement) return;

		const timeContainer = this._dropdownElement.querySelector('.py-3.border-t');
		if (!timeContainer) return;

		const amButton = timeContainer.querySelector(
			'button[aria-label="AM"]'
		) as HTMLButtonElement;
		const pmButton = timeContainer.querySelector(
			'button[aria-label="PM"]'
		) as HTMLButtonElement;

		if (!amButton || !pmButton) return;

		// Update button states
		if (period === 'AM') {
			amButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
			amButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
			pmButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
			pmButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
		} else {
			amButton.classList.remove('bg-blue-500', 'text-white', 'border-blue-500');
			amButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
			pmButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
			pmButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
		}

		// Update time
		this._handleTimeChange();
	}

	/**
	 * Select a month
	 *
	 * @param month - Month index (0-11)
	 */
	private _selectMonth(month: number): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const newDate = new Date(state.currentDate);
		newDate.setMonth(month);

		this._stateManager.setCurrentDate(newDate);

		// Only change view mode if keepViewModeOnSelection is false
		if (!config.keepViewModeOnSelection) {
			this._stateManager.setViewMode('days');
		}

		this._renderCalendarView();
	}

	/**
	 * Select a year
	 *
	 * @param year - Year value
	 */
	private _selectYear(year: number): void {
		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();
		const newDate = new Date(state.currentDate);
		newDate.setFullYear(year);

		this._stateManager.setCurrentDate(newDate);

		// Only change view mode if keepViewModeOnSelection is false
		if (!config.keepViewModeOnSelection) {
			this._stateManager.setViewMode('months');
		}

		this._renderCalendarView();
	}

	/**
	 * Update calendar view to reflect state changes
	 */
	private _updateCalendarView(): void {
		this._renderCalendarView();
		this._updateTimeDisplay();
	}

	/**
	 * Update time inputs to reflect current time selection
	 */
	private _updateTimeDisplay(): void {
		if (!this._dropdownElement) return;

		const state = this._stateManager.getState();
		const config = this._stateManager.getConfig();

		// Skip if time is not enabled
		if (!config.enableTime) return;

		const timeContainer = this._dropdownElement.querySelector('.py-3.border-t');
		if (!timeContainer) return;

		const hourInput = timeContainer.querySelector(
			'input[aria-label="Hour"]'
		) as HTMLInputElement;
		const minuteInput = timeContainer.querySelector(
			'input[aria-label="Minute"]'
		) as HTMLInputElement;
		const secondInput = timeContainer.querySelector(
			'input[aria-label="Second"]'
		) as HTMLInputElement;
		const amButton = timeContainer.querySelector(
			'button[aria-label="AM"]'
		) as HTMLButtonElement;
		const pmButton = timeContainer.querySelector(
			'button[aria-label="PM"]'
		) as HTMLButtonElement;

		// Get time from selected date or default to current time
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		let isAM = true;

		if (state.selectedTime) {
			hours = state.selectedTime.hours;
			minutes = state.selectedTime.minutes;
			seconds = state.selectedTime.seconds;
			isAM = state.selectedTime.ampm === 'AM';
		} else if (state.selectedDate) {
			hours = state.selectedDate.getHours();
			minutes = state.selectedDate.getMinutes();
			seconds = state.selectedDate.getSeconds();
			isAM = hours < 12;
		} else {
			const now = new Date();
			hours = now.getHours();
			minutes = now.getMinutes();
			seconds = now.getSeconds();
			isAM = hours < 12;
		}

		// Adjust for 12-hour display if needed
		let displayHours = hours;
		if (hourInput && config.timeFormat.includes('h')) {
			displayHours = hours % 12;
			if (displayHours === 0) displayHours = 12;
		}

		// Update input values
		if (hourInput)
			hourInput.value =
				config.forceLeadingZero && displayHours < 10
					? `0${displayHours}`
					: `${displayHours}`;
		if (minuteInput)
			minuteInput.value =
				config.forceLeadingZero && minutes < 10 ? `0${minutes}` : `${minutes}`;
		if (secondInput)
			secondInput.value =
				config.forceLeadingZero && seconds < 10 ? `0${seconds}` : `${seconds}`;

		// Update AM/PM buttons
		if (amButton && pmButton) {
			if (isAM) {
				amButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
				amButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
				pmButton.classList.remove(
					'bg-blue-500',
					'text-white',
					'border-blue-500'
				);
				pmButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
			} else {
				amButton.classList.remove(
					'bg-blue-500',
					'text-white',
					'border-blue-500'
				);
				amButton.classList.add('bg-gray-50', 'hover:bg-gray-100');
				pmButton.classList.add('bg-blue-500', 'text-white', 'border-blue-500');
				pmButton.classList.remove('bg-gray-50', 'hover:bg-gray-100');
			}
		}
	}

	/**
	 * Show the calendar dropdown
	 */
	public show(): void {
		if (!this._dropdownElement || this._isVisible) return;

		// Ensure we're in days view
		const state = this._stateManager.getState();
		if (state.viewMode !== 'days') {
			this._stateManager.setViewMode('days');
		}

		// Render calendar before showing
		this._renderCalendarView();
		this._updateTimeDisplay();

		// Show dropdown using dropdown manager
		if (this._dropdownManager) {
			this._dropdownManager.open();
			this._isVisible = true;
		}
	}

	/**
	 * Hide the calendar dropdown
	 */
	public hide(): void {
		if (!this._dropdownElement || !this._isVisible) return;

		// Hide dropdown using dropdown manager
		if (this._dropdownManager) {
			this._dropdownManager.close();
			this._isVisible = false;
		}
	}

	/**
	 * Update dropdown position
	 */
	public updatePosition(): void {
		if (this._dropdownManager) {
			this._dropdownManager.updatePosition();
		}
	}

	/**
	 * Clear range hover classes from all day cells
	 */
	private _clearRangeHoverClasses(): void {
		if (!this._calendarContainer) return;

		// Find all day cells with hover classes across all month containers
		const hoverCells = this._calendarContainer.querySelectorAll(
			'.bg-blue-50, .text-blue-600, button[data-hover-date="true"]'
		);

		hoverCells.forEach((cell) => {
			cell.classList.remove('bg-blue-50', 'text-blue-600');
		});
	}

	/**
	 * Apply hover effect to show potential range selection
	 *
	 * @param startDate - Start date of the range
	 * @param hoverDate - Current date being hovered
	 */
	private _applyRangeHoverEffect(startDate: Date, hoverDate: Date): void {
		if (!this._calendarContainer) return;

		// Clear any existing hover effects first
		this._clearRangeHoverClasses();

		// Normalize dates to midnight for comparison
		const startDateMidnight = new Date(startDate);
		startDateMidnight.setHours(0, 0, 0, 0);

		const hoverDateMidnight = new Date(hoverDate);
		hoverDateMidnight.setHours(0, 0, 0, 0);

		// Ensure proper order for comparison (start date <= end date)
		const rangeStart =
			startDateMidnight <= hoverDateMidnight
				? startDateMidnight
				: hoverDateMidnight;
		const rangeEnd =
			startDateMidnight <= hoverDateMidnight
				? hoverDateMidnight
				: startDateMidnight;

		// Generate all dates in the range as ISO strings (YYYY-MM-DD)
		const dateRangeISOStrings: string[] = [];
		const currentDate = new Date(rangeStart);

		while (currentDate <= rangeEnd) {
			// Format as YYYY-MM-DD
			const year = currentDate.getFullYear();
			const month = String(currentDate.getMonth() + 1).padStart(2, '0');
			const day = String(currentDate.getDate()).padStart(2, '0');

			dateRangeISOStrings.push(`${year}-${month}-${day}`);

			// Move to the next day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Apply hover effect to all day cells in the range using the date-id attribute
		dateRangeISOStrings.forEach((dateStr) => {
			// Find the day cell with matching date-id
			const dayCells = this._calendarContainer.querySelectorAll(
				`button[data-date-id="${dateStr}"]`
			);

			dayCells.forEach((cell) => {
				// Skip if this is already a selected date (has blue background)
				if (cell.classList.contains('bg-blue-600')) return;

				// Apply hover effect
				cell.classList.add('bg-blue-50', 'text-blue-600');
			});
		});
	}
}
