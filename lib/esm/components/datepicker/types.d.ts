/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
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
    locale: string;
    locales: {
        [key: string]: LocaleConfigInterface;
    };
    weekDays: 'long' | 'short' | 'min';
    forceLeadingZero: boolean;
    minDate?: Date | string;
    maxDate?: Date | string;
    visibleMonths: number;
    visibleYears: number;
    keepViewModeOnSelection?: boolean;
    format: string;
    enableTime: boolean;
    timeFormat: string;
    am: string;
    pm: string;
    hourStep: number;
    minuteStep?: number;
    secondStep?: number;
    disabledHours?: number[];
    disabledMinutes?: number[];
    range: boolean;
    rangeSeparator: string;
    multiDateSelection: boolean;
    maxDates: number;
    disabledDates: (Date | string)[];
    enableNaturalLanguage: boolean;
    animationDuration: number;
    animationEasing: string;
    animationEnterClass: string;
    animationExitClass: string;
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
    prevIsOpen?: boolean;
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
export declare enum KTDatepickerEvents {
    CALENDAR_UPDATE = "kt.datepicker.calendar.update",
    DAY_SELECT = "kt.datepicker.day.select",
    MONTH_CHANGE = "kt.datepicker.month.change",
    DROPDOWN_SHOW = "kt.datepicker.dropdown.show",
    DROPDOWN_HIDE = "kt.datepicker.dropdown.hide",
    CHANGE = "kt.datepicker.change",
    OPEN = "kt.datepicker.open",
    CLOSE = "kt.datepicker.close",
    GET_RANGE = "kt.datepicker.getRange"
}
//# sourceMappingURL=types.d.ts.map