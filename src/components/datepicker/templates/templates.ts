/*
 * templates.ts - Default templates and merging logic for KTDatepicker (revamp)
 * Defines all default template strings and provides merged template set.
 */

import { KTDatepickerConfig, KTDatepickerTemplateStrings } from '../config/types';
import { mergeTemplates } from '../utils/template-utils';

// Default template strings for all UI fragments
export const defaultTemplates: KTDatepickerTemplateStrings = {
  // Add role="dialog" and aria-modal to the dropdown container
  container: `<div data-kt-datepicker-container class="kt-datepicker-container {{class}}"></div>`,
  header: `<div data-kt-datepicker-header class="kt-datepicker-header {{class}}">{{prevButton}}<span data-kt-datepicker-month-year>{{month}} {{year}}</span>{{nextButton}}</div>`,
  footer: `<div data-kt-datepicker-footer class="kt-datepicker-footer {{class}}">{{todayButton}} {{clearButton}} {{applyButton}}</div>`,
  // Add role="grid" and aria-label to the calendar grid
  calendarGrid: `<table data-kt-datepicker-calendar-grid role="grid" aria-label="Calendar" aria-readonly="true" class="kt-datepicker-calendar-grid {{class}}">{{calendar}}</table>`,
  // Add role="gridcell" to dayCell, aria-selected, and tabindex for keyboard nav
  dayCell: `<td data-kt-datepicker-day role="gridcell" {{attributes}} class="kt-datepicker-day-cell {{class}}"><button type="button" data-day="{{day}}" aria-label="Select {{day}}" tabindex="-1">{{day}}</button></td>`,
  // Month/year selectors (add aria-live for dynamic updates)
  monthYearSelect: `<div data-kt-datepicker-monthyear-select aria-live="polite" class="kt-datepicker-monthyear-select {{class}}">{{monthSelect}} {{yearSelect}}</div>`,
  monthSelection: `<div data-kt-datepicker-month-selection class="kt-datepicker-month-selection {{class}}">{{months}}</div>`,
  yearSelection: `<div data-kt-datepicker-year-selection class="kt-datepicker-year-selection {{class}}">{{years}}</div>`,
  inputWrapper: `<div data-kt-datepicker-input-wrapper class="kt-datepicker-input-wrapper {{class}}">{{input}} {{icon}}</div>`,
  segmentedDateInput: `<div data-kt-datepicker-segmented-input class="kt-datepicker-segmented-input {{class}}">{{segments}}</div>`,
  segmentedDateRangeInput: `<div data-kt-datepicker-segmented-range-input class="kt-datepicker-segmented-range-input {{class}}">{{start}} {{separator}} {{end}}</div>`,
  /**
   * Template for a single date segment (e.g., day, month, year)
   * Placeholders: segmentType, segmentValue, ariaLabel, ariaValueNow, ariaValueText, ariaValueMin, ariaValueMax, tabindex, contenteditable
   */
  dateSegment: `<span data-segment="{{segmentType}}" role="spinbutton" aria-label="{{ariaLabel}}" aria-valuenow="{{ariaValueNow}}" aria-valuetext="{{ariaValueText}}" aria-valuemin="{{ariaValueMin}}" aria-valuemax="{{ariaValueMax}}" tabindex="{{tabindex}}" contenteditable="{{contenteditable}}" class="kt-datepicker-date-segment {{class}}">{{segmentValue}}</span>`,
  /**
   * Template for a segment separator (e.g., / or space)
   * Placeholders: separator
   */
  segmentSeparator: `<span data-segment-separator class="kt-datepicker-segment-separator {{class}}">{{separator}}</span>`,
  placeholder: `<span data-kt-datepicker-placeholder class="kt-datepicker-placeholder {{class}}">{{placeholder}}</span>`,
  displayWrapper: `<div data-kt-datepicker-display-wrapper class="kt-datepicker-display-wrapper {{class}}">{{value}}</div>`,
  displayElement: `<span data-kt-datepicker-display-element class="kt-datepicker-display-element {{class}}">{{value}}</span>`,
  timePanel: `<div data-kt-datepicker-time-panel class="kt-datepicker-time-panel {{class}}">{{hours}}:{{minutes}}:{{seconds}} {{amPm}}</div>`,
  multiDateTag: `<span data-kt-datepicker-multidate-tag class="kt-datepicker-multidate-tag {{class}}">{{date}} <button>{{removeButton}}</button></span>`,
  emptyState: `<div data-kt-datepicker-empty class="kt-datepicker-empty-state {{class}}">{{message}}</div>`,
  // Add aria-haspopup and aria-expanded to calendar button
  calendarButton: `<button type="button" data-kt-datepicker-calendar-btn aria-label="Open calendar" aria-haspopup="dialog" aria-expanded="false" class="kt-datepicker-calendar-button {{class}}">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  </button>`,
  // Add role="dialog" and aria-modal to dropdown
  dropdown: `<div data-kt-datepicker-dropdown role="dialog" aria-modal="true" aria-label="Date picker" class="kt-datepicker-dropdown hidden {{class}}"></div>`,
  prevButton: `<button type="button" data-kt-datepicker-prev aria-label="Previous month" class="kt-datepicker-prev-button {{class}}">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  </button>`,
  nextButton: `<button type="button" data-kt-datepicker-next aria-label="Next month" class="kt-datepicker-next-button {{class}}">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  </button>`,
  // Add role="row" to calendar table rows
  calendarTable: `<table data-kt-datepicker-calendar-table role="grid" aria-label="Calendar" aria-readonly="true" class="kt-datepicker-calendar-table {{class}}"><thead><tr role="row">
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Sun</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Mon</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Tue</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Wed</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Thu</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Fri</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Sat</th>
  </tr></thead>{{body}}</table>`,
  calendarBody: `<tbody class="kt-datepicker-calendar-body {{class}}">{{rows}}</tbody>`,
  calendarRow: `<tr role="row" class="kt-datepicker-calendar-row {{class}}">{{cells}}</tr>`,
  todayButton: `<button type="button" data-kt-datepicker-today class="kt-datepicker-today-button {{class}}">Today</button>`,
  clearButton: `<button type="button" data-kt-datepicker-clear class="kt-datepicker-clear-button {{class}}">Clear</button>`,
  applyButton: `<button type="button" data-kt-datepicker-apply class="kt-datepicker-apply-button {{class}}">Apply</button>`,
  /**
   * Container for multiple calendar months (horizontal multi-month view)
   */
  multiMonthContainer: `<div data-kt-datepicker-multimonth-container class="kt-datepicker-multimonth-container flex flex-col md:flex-row gap-4 {{class}}">{{calendars}}</div>`,

  // Time picker templates
  timePickerWrapper: `<div data-kt-datepicker-time-picker class="kt-datepicker-time-picker {{class}}">{{timeDisplay}} {{timeControls}}</div>`,
  timeDisplay: `<div data-kt-datepicker-time-display class="kt-datepicker-time-display {{class}}">{{timeValue}}</div>`,
  timeControls: `<div data-kt-datepicker-time-controls class="kt-datepicker-time-controls {{class}}">{{timeUnits}} {{ampmControl}}</div>`,
  timeUnit: `<div data-kt-datepicker-time-unit data-kt-datepicker-time-unit="{{unitType}}" class="kt-datepicker-time-unit {{class}}">{{upButton}} {{valueDisplay}} {{downButton}}</div>`,
  timeUpButton: `<button type="button" data-kt-datepicker-time-up aria-label="Increment {{unitType}}" class="kt-datepicker-time-up {{class}}" {{disabled}}>▲</button>`,
  timeDownButton: `<button type="button" data-kt-datepicker-time-down aria-label="Decrement {{unitType}}" class="kt-datepicker-time-down {{class}}" {{disabled}}>▼</button>`,
  timeValue: `<span data-kt-datepicker-time-value class="kt-datepicker-time-value {{class}}">{{value}}</span>`,
  timeSeparator: `<span data-kt-datepicker-time-separator class="kt-datepicker-time-separator {{class}}">{{separator}}</span>`,
  ampmControl: `<div data-kt-datepicker-ampm-control class="kt-datepicker-ampm-control {{class}}">{{ampmButton}}</div>`,
  ampmButton: `<button type="button" data-kt-datepicker-ampm-button aria-label="Toggle AM/PM" class="kt-datepicker-ampm-button {{class}}" {{disabled}}>{{ampmValue}}</button>`,
};

/**
 * Returns the merged template set for a given config.
 */
export function getTemplateStrings(config?: KTDatepickerConfig): KTDatepickerTemplateStrings {
  return mergeTemplates(defaultTemplates, config?.templates);
}