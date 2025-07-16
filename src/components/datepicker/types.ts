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
  | 'applyButton';

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
  /** Any additional custom config options */
  [key: string]: any;
}

// State interface for KTDatepicker
export interface KTDatepickerState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedRange: { start: Date | null; end: Date | null } | null;
  selectedDates: Date[];
  viewMode: 'days' | 'months' | 'years';
  isOpen: boolean;
  isFocused: boolean;
}