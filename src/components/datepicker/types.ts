/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
/**
 * Interface for locale configuration
 */
export interface LocaleConfigInterface {
	monthNames: string[];
	monthNamesShort: string[];
	dayNames: string[];
	dayNamesShort: string[];
	dayNamesMin: string[];
	firstDayOfWeek: number;
}

/**
 * Interface for date range selection
 */
export interface DateRangeInterface {
	startDate: Date | null;
	endDate: Date | null;
}

/**
 * Interface for time configuration
 */
export interface TimeConfigInterface {
	hours: number;
	minutes: number;
	seconds: number;
	ampm?: 'AM' | 'PM';
}

/**
 * Datepicker configuration interface
 */
export interface KTDatepickerConfigInterface {
	// Locale settings
	locale: string;
	locales: { [key: string]: LocaleConfigInterface };

	// Calendar display
	weekDays: 'long' | 'short' | 'min';
	forceLeadingZero: boolean;

	// Date boundaries
	minDate?: Date | string;
	maxDate?: Date | string;

	// Calendar options
	visibleMonths: number;
	visibleYears: number;
	keepViewModeOnSelection?: boolean; // If true, don't automatically switch view modes when selecting month/year

	// Date formatting
	format: string;

	// Time options
	enableTime: boolean;
	timeFormat: string;
	am: string;
	pm: string;
	hourStep: number;
	minuteStep?: number;
	secondStep?: number;
	disabledHours?: number[];
	disabledMinutes?: number[];

	// Date range options
	range: boolean;
	rangeSeparator: string;

	// Multi-date selection
	multiDateSelection: boolean;
	maxDates: number;

	// Date constraints
	disabledDates: (Date | string)[];
	enableNaturalLanguage: boolean;

	// Animation settings
	animationDuration: number;
	animationEasing: string;
	animationEnterClass: string;
	animationExitClass: string;

	// Custom callbacks
	onOpen?: () => void;
	onClose?: () => void;
	onChange?: (date: Date | null | DateRangeInterface) => void;
	onMonthChange?: (month: number, year: number) => void;
	onYearChange?: (year: number) => void;
}

/**
 * Datepicker state interface
 */
export interface KTDatepickerStateInterface {
	currentDate: Date;
	selectedDate: Date | null;
	selectedDateRange: DateRangeInterface | null;
	selectedDates: Date[];
	viewMode: 'days' | 'months' | 'years';
	isOpen: boolean;
	isFocused: boolean;
	isRangeSelectionStart: boolean;
	isRangeSelectionInProgress: boolean;
	selectedTime: TimeConfigInterface | null;
	prevIsOpen?: boolean; // Used to track previous open state
}

/**
 * Calendar day cell interface
 */
export interface CalendarDayCellInterface {
	date: Date;
	dayNumber: number;
	isCurrentMonth: boolean;
	isPreviousMonth: boolean;
	isNextMonth: boolean;
	isToday: boolean;
	isSelected: boolean;
	isDisabled: boolean;
	isRangeStart: boolean;
	isRangeEnd: boolean;
	isInRange: boolean;
	isWeekend: boolean;
}

/**
 * Calendar month interface
 */
export interface CalendarMonthInterface {
	month: number;
	year: number;
	days: CalendarDayCellInterface[][];
}

/**
 * KTDatepicker events enum
 */
export enum KTDatepickerEvents {
	CALENDAR_UPDATE = 'kt.datepicker.calendar.update',
	DAY_SELECT = 'kt.datepicker.day.select',
	MONTH_CHANGE = 'kt.datepicker.month.change',
	DROPDOWN_SHOW = 'kt.datepicker.dropdown.show',
	DROPDOWN_HIDE = 'kt.datepicker.dropdown.hide',
	CHANGE = 'kt.datepicker.change',
	OPEN = 'kt.datepicker.open',
	CLOSE = 'kt.datepicker.close',
	GET_RANGE = 'kt.datepicker.getRange',
}
