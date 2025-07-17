/*
 * templates.ts - Default templates and merging logic for KTDatepicker (revamp)
 * Defines all default template strings and provides merged template set.
 */

import { KTDatepickerConfig, KTDatepickerTemplateStrings } from './types';
import { mergeTemplates } from './utils/template';

// Default template strings for all UI fragments
export const defaultTemplates: KTDatepickerTemplateStrings = {
  container: `<div data-kt-datepicker-container></div>`,
  header: `<div data-kt-datepicker-header>{{prevButton}}{{month}} {{year}}{{nextButton}}</div>`,
  footer: `<div data-kt-datepicker-footer>{{todayButton}} {{clearButton}} {{applyButton}}</div>`,
  calendarGrid: `<table data-kt-datepicker-calendar-grid>{{calendar}}</table>`,
  dayCell: `<td data-kt-datepicker-day {{attributes}}><button type="button" data-day="{{day}}" aria-label="Select {{day}}" tabindex="-1">{{day}}</button></td>`,
  monthYearSelect: `<div data-kt-datepicker-monthyear-select>{{monthSelect}} {{yearSelect}}</div>`,
  monthSelection: `<div data-kt-datepicker-month-selection>{{months}}</div>`,
  yearSelection: `<div data-kt-datepicker-year-selection>{{years}}</div>`,
  inputWrapper: `<div data-kt-datepicker-input-wrapper>{{input}} {{icon}}</div>`,
  segmentedDateInput: `<div data-kt-datepicker-segmented-input>{{segments}}</div>`,
  segmentedDateRangeInput: `<div data-kt-datepicker-segmented-range-input>{{start}} {{separator}} {{end}}</div>`,
  placeholder: `<span data-kt-datepicker-placeholder>{{placeholder}}</span>`,
  displayWrapper: `<div data-kt-datepicker-display-wrapper>{{value}}</div>`,
  displayElement: `<span data-kt-datepicker-display-element>{{value}}</span>`,
  timePanel: `<div data-kt-datepicker-time-panel>{{hours}}:{{minutes}}:{{seconds}} {{amPm}}</div>`,
  multiDateTag: `<span data-kt-datepicker-multidate-tag>{{date}} <button>{{removeButton}}</button></span>`,
  emptyState: `<div data-kt-datepicker-empty>{{message}}</div>`,
  calendarButton: `<button type="button" data-kt-datepicker-calendar-btn aria-label="Open calendar">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  </button>`,
  dropdown: `<div data-kt-datepicker-dropdown></div>`,
  prevButton: `<button type="button" data-kt-datepicker-prev aria-label="Previous month">&lt;</button>`,
  nextButton: `<button type="button" data-kt-datepicker-next aria-label="Next month">&gt;</button>`,
  calendarTable: `<table data-kt-datepicker-calendar-table>{{body}}</table>`,
  calendarBody: `<tbody>{{rows}}</tbody>`,
  calendarRow: `<tr>{{cells}}</tr>`,
  todayButton: `<button type="button" data-kt-datepicker-today>Today</button>`,
  clearButton: `<button type="button" data-kt-datepicker-clear>Clear</button>`,
  applyButton: `<button type="button" data-kt-datepicker-apply>Apply</button>`,
  /**
   * Container for multiple calendar months (horizontal multi-month view)
   */
  multiMonthContainer: `<div data-kt-datepicker-multimonth-container class="flex flex-row gap-4">{{calendars}}</div>`,
};

/**
 * Returns the merged template set for a given config.
 */
export function getTemplateStrings(config?: KTDatepickerConfig): KTDatepickerTemplateStrings {
  return mergeTemplates(defaultTemplates, config?.templates);
}