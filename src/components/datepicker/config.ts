/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { DefaultLocales } from './locales';
import {
	KTDatepickerConfigInterface,
	KTDatepickerStateInterface,
	DateRangeInterface,
	TimeConfigInterface,
} from './types';
import { isSameDay, isDateDisabled } from './utils';
import { KTDatepickerEventManager, KTDatepickerEventName } from './events';

export const DefaultConfig: KTDatepickerConfigInterface = {
	locale: 'en-US',
	locales: DefaultLocales, // all locales

	weekDays: 'min',
	forceLeadingZero: true,

	// 0-indexed month
	// minDate: new Date(2024, 7, 20),
	// maxDate: new Date(2024, 8, 10),

	// supported formats: refer to dateFormat
	// minDate: '20/08/2024',
	// maxDate: '10/09/2024',

	// Calendar
	visibleMonths: 1, // visible months calendar to show
	visibleYears: 10, // visible years span to show on year selection
	keepViewModeOnSelection: false, // automatically switch view modes when selecting month/year

	// Date
	format: 'dd/MM/yyyy',

	// Time
	enableTime: false,
	timeFormat: 'hh:mm:ss A ZZZ', // 12-hours time format
	// timeFormat: 'HH:mm:ss ZZZ', // 24-hours time format
	am: 'AM',
	pm: 'PM',
	hourStep: 1,
	// minuteStep: 5,
	// secondStep: 10,
	// disabledHours: [0, 1, 2, 3, 4, 5, 6, 22, 23],
	// disabledMinutes: [0, 1, 2, 3],

	// Date range
	range: false,
	rangeSeparator: ' - ',

	// Multi-date selection
	multiDateSelection: false,
	maxDates: 0, // 0 means unlimited

	// Date blocking patterns
	disabledDates: [],
	enableNaturalLanguage: true,

	// Animation settings
	animationDuration: 250,
	animationEasing: '',
	animationEnterClass: '',
	animationExitClass: '',
};

/**
 * State manager class for KTDatepicker
 * Handles state management and configuration
 */
export class KTDatepickerStateManager {
	private _element: HTMLElement;
	private _config: KTDatepickerConfigInterface;
	private _state: KTDatepickerStateInterface;
	private _events: KTDatepickerEventManager;

	/**
	 * Constructor for the KTDatepickerStateManager class
	 *
	 * @param element - The datepicker element
	 * @param config - Configuration object
	 */
	constructor(
		element: HTMLElement,
		config?: Partial<KTDatepickerConfigInterface>
	) {
		this._element = element;
		this._config = this._mergeConfig(config || {});
		this._state = this._initializeState();
		this._events = new KTDatepickerEventManager(element);
	}

	/**
	 * Merge provided configuration with default configuration
	 *
	 * @param config - User provided configuration
	 * @returns Merged configuration
	 */
	private _mergeConfig(
		config: Partial<KTDatepickerConfigInterface>
	): KTDatepickerConfigInterface {
		return { ...DefaultConfig, ...config };
	}

	/**
	 * Initialize the state object with default values
	 */
	private _initializeState(): KTDatepickerStateInterface {
		const now = new Date();
		const state: KTDatepickerStateInterface = {
			currentDate: now,
			selectedDate: null,
			selectedDateRange: null,
			selectedDates: [],
			viewMode: 'days',
			isOpen: false,
			isFocused: false,
			isRangeSelectionStart: true,
			isRangeSelectionInProgress: false,
			selectedTime: null,
			prevIsOpen: false,
		};

		return state;
	}

	/**
	 * Get the current configuration
	 *
	 * @returns Current configuration
	 */
	public getConfig(): KTDatepickerConfigInterface {
		return this._config;
	}

	/**
	 * Get the current state
	 *
	 * @returns Current state
	 */
	public getState(): KTDatepickerStateInterface {
		return this._state;
	}

	/**
	 * Set the selected date
	 *
	 * @param date - Date to select
	 */
	public setSelectedDate(date: Date | null): void {
		const state = this._state;
		const config = this._config;

		if (date === null) {
			// Clear selection
			state.selectedDate = null;
			state.selectedDateRange = null;
			state.isRangeSelectionInProgress = false;
			this._dispatchChangeEvent();
			return;
		}

		// Check if the date is disabled (outside min/max range or explicitly disabled)
		// We add this check here as a second defense layer beyond the UI checks
		if (isDateDisabled(date, config)) {
			console.log(
				'Date is disabled in setSelectedDate, ignoring selection:',
				date.toISOString()
			);
			return;
		}

		if (config.range) {
			// Handle range selection
			if (!state.selectedDateRange) {
				// Initialize range object if it doesn't exist
				state.selectedDateRange = { startDate: null, endDate: null };
			}

			// If start date isn't set or if we're resetting the range, set the start date
			if (
				!state.selectedDateRange.startDate ||
				state.isRangeSelectionStart ||
				state.selectedDateRange.endDate
			) {
				// Reset the range with a new start date
				state.selectedDateRange.startDate = date;
				state.selectedDateRange.endDate = null;
				state.isRangeSelectionStart = false; // We've selected the start, next will be end

				// Set the flag to keep dropdown open during range selection
				state.isRangeSelectionInProgress = true;
				console.log(
					'Range start selected - setting isRangeSelectionInProgress to true'
				);
			} else {
				// Set the end date if the start date is already set
				// Ensure that start is before end (swap if needed)
				if (date < state.selectedDateRange.startDate) {
					// Swap dates if the selected date is before the start date
					state.selectedDateRange.endDate = state.selectedDateRange.startDate;
					state.selectedDateRange.startDate = date;
				} else {
					state.selectedDateRange.endDate = date;
				}
				state.isRangeSelectionStart = true; // Reset for next range selection

				// Clear the flag as range selection is complete
				state.isRangeSelectionInProgress = false;
				console.log(
					'Range end selected - setting isRangeSelectionInProgress to false'
				);
			}

			// For date range, we still set selectedDate for current focus
			state.selectedDate = date;

			// Trigger event with range data
			this._dispatchChangeEvent();
		} else {
			// Single date selection
			state.selectedDate = date;

			// Multi-date selection
			if (config.multiDateSelection) {
				// Add or remove the date from the array
				const existingIndex = state.selectedDates.findIndex((d) =>
					isSameDay(d, date)
				);
				if (existingIndex !== -1) {
					// Remove if already selected
					state.selectedDates.splice(existingIndex, 1);
				} else if (state.selectedDates.length < config.maxDates) {
					// Add if not exceeding max
					state.selectedDates.push(date);
				}
			}

			// Trigger event with single date data
			this._dispatchChangeEvent();
		}
	}

	/**
	 * Set the current view date (month/year being viewed)
	 *
	 * @param date - Date to set as current view
	 */
	public setCurrentDate(date: Date): void {
		this._state.currentDate = date;
		this._dispatchEvent('month-change', {
			month: date.getMonth(),
			year: date.getFullYear(),
		});
	}

	/**
	 * Set the selected time
	 *
	 * @param time - Time configuration to set
	 */
	public setSelectedTime(time: TimeConfigInterface | null): void {
		this._state.selectedTime = time;
		this._dispatchChangeEvent();
	}

	/**
	 * Set the view mode (days, months, years)
	 *
	 * @param mode - View mode to set
	 */
	public setViewMode(mode: 'days' | 'months' | 'years'): void {
		this._state.viewMode = mode;
		this._dispatchEvent('view-mode-change', { mode });
	}

	/**
	 * Set the open state of the datepicker
	 *
	 * @param isOpen - Whether the datepicker is open
	 */
	public setOpen(isOpen: boolean): void {
		this._state.isOpen = isOpen;
		this._dispatchEvent(isOpen ? 'open' : 'close');

		// Call callback if defined
		if (isOpen && this._config.onOpen) {
			this._config.onOpen();
		} else if (!isOpen && this._config.onClose) {
			this._config.onClose();
		}
	}

	/**
	 * Set the focus state of the datepicker
	 *
	 * @param isFocused - Whether the datepicker is focused
	 */
	public setFocused(isFocused: boolean): void {
		this._state.isFocused = isFocused;
		this._dispatchEvent(isFocused ? 'focus' : 'blur');
	}

	/**
	 * Reset the state to initial values
	 */
	public resetState(): void {
		this._state = this._initializeState();
		this._dispatchEvent('reset');
	}

	/**
	 * Dispatch change event with current date/time selection
	 */
	private _dispatchChangeEvent(): void {
		let payload: any = {};

		if (this._config.range && this._state.selectedDateRange) {
			payload.selectedDateRange = this._state.selectedDateRange;
		} else if (this._config.multiDateSelection) {
			payload.selectedDates = [...this._state.selectedDates];
		} else {
			payload.selectedDate = this._state.selectedDate;
		}

		if (this._config.enableTime && this._state.selectedTime) {
			payload.selectedTime = { ...this._state.selectedTime };
		}

		this._events.dispatchDateChangeEvent(payload);

		// Call onChange callback if defined
		if (this._config.onChange) {
			let value: Date | null | DateRangeInterface;

			if (this._config.range) {
				value = this._state.selectedDateRange || {
					startDate: null,
					endDate: null,
				};
			} else {
				value = this._state.selectedDate;
			}

			this._config.onChange(value);
		}
	}

	/**
	 * Dispatch custom event
	 *
	 * @param eventName - Name of the event
	 * @param payload - Optional payload data
	 */
	private _dispatchEvent(eventName: string, payload?: any): void {
		this._events.dispatchEvent(eventName, payload);
	}

	/**
	 * Get the event manager instance
	 */
	public getEventManager(): KTDatepickerEventManager {
		return this._events;
	}
}
