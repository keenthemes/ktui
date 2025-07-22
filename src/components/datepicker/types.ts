/*
 * types.ts - Type definitions for KTDatepicker (revamp)
 * Defines config, template, and state interfaces for modular, extensible template customization.
 */

// Template keys for all customizable UI fragments
export type KTDatepickerTemplateKey =
  | 'container'
  | 'header'
  | 'footer'
  | 'calendarGrid'
  | 'dayCell'
  | 'monthYearSelect'
  | 'monthSelection'
  | 'yearSelection'
  | 'inputWrapper'
  | 'segmentedDateInput'
  | 'segmentedDateRangeInput'
  | 'placeholder'
  | 'displayWrapper'
  | 'displayElement'
  | 'timePanel'
  | 'multiDateTag'
  | 'emptyState'
  | 'calendarButton'
  | 'dropdown'
  | 'prevButton'
  | 'nextButton'
  | 'calendarTable'
  | 'calendarRow'
  | 'calendarBody'
  | 'todayButton'
  | 'clearButton'
  | 'applyButton'
  | 'multiMonthContainer'
  | 'dateSegment'
  | 'segmentSeparator';

// Template string map
export type KTDatepickerTemplateStrings = {
  [K in KTDatepickerTemplateKey]?: string | ((data: any) => string);
};

/**
 * Configuration options for KTDatepicker
 */
export interface KTDatepickerConfig {
  /** Custom templates for UI fragments */
  templates?: KTDatepickerTemplateStrings;
  /** Date format string (e.g. 'yyyy-mm-dd', 'dd/mm/yyyy') */
  format?: string;
  /** Enable date range selection */
  range?: boolean;
  /** Enable multi-date selection */
  multiDate?: boolean;
  /** Minimum selectable date */
  minDate?: Date | string;
  /** Maximum selectable date */
  maxDate?: Date | string;
  /** Disable the datepicker */
  disabled?: boolean;
  /** Locale for date formatting (e.g. 'en-US') */
  locale?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Initial selected date */
  value?: Date | string;
  /** Initial selected date range */
  valueRange?: { start: Date | string; end: Date | string };
  /** Initial selected dates (multi-date) */
  values?: (Date | string)[];
  /** Custom class for the root element */
  className?: string;
  /** Whether to show the calendar on input focus (default: true) */
  showOnFocus?: boolean;
  /** Whether to close the calendar on date selection (default: true) */
  closeOnSelect?: boolean;
  /**
   * Number of calendar months to display side-by-side (horizontal). Default: 1.
   */
  visibleMonths?: number;
  /** Enable time selection (default: false) */
  enableTime?: boolean;
  /** Time granularity - smallest unit to display (default: 'minute') */
  timeGranularity?: 'second' | 'minute' | 'hour';
  /** Time format - 12 or 24 hour (default: '24h') */
  timeFormat?: '12h' | '24h';
  /** Minimum time constraint (format: 'HH:MM' or 'HH:MM:SS') */
  minTime?: string;
  /** Maximum time constraint (format: 'HH:MM' or 'HH:MM:SS') */
  maxTime?: string;
  /** Time step increment in minutes (default: 1) */
  timeStep?: number;
  /** Custom classes for template elements */
  classes?: {
    container?: string;
    header?: string;
    footer?: string;
    calendarGrid?: string;
    dayCell?: string;
    monthYearSelect?: string;
    monthSelection?: string;
    yearSelection?: string;
    inputWrapper?: string;
    segmentedDateInput?: string;
    segmentedDateRangeInput?: string;
    dateSegment?: string;
    segmentSeparator?: string;
    placeholder?: string;
    displayWrapper?: string;
    displayElement?: string;
    timePanel?: string;
    multiDateTag?: string;
    emptyState?: string;
    calendarButton?: string;
    dropdown?: string;
    prevButton?: string;
    nextButton?: string;
    calendarTable?: string;
    calendarRow?: string;
    calendarBody?: string;
    todayButton?: string;
    clearButton?: string;
    applyButton?: string;
    multiMonthContainer?: string;
  };
  /** Any additional custom config options */
  [key: string]: any;
}

// Time state interface
export interface TimeState {
  hour: number;
  minute: number;
  second: number;
}

// State interface for KTDatepicker
export interface KTDatepickerState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedRange: { start: Date | null; end: Date | null } | null;
  selectedDates: Date[];
  selectedTime: TimeState | null;
  timeGranularity: 'second' | 'minute' | 'hour';
  viewMode: 'days' | 'months' | 'years';
  isOpen: boolean;
  isFocused: boolean;
}