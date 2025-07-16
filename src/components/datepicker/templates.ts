/*
 * templates.ts - Default templates and merging logic for KTDatepicker (revamp)
 * Defines all default template strings and provides merged template set.
 */

import { KTDatepickerConfig, KTDatepickerTemplateStrings } from './types';
import { mergeTemplates } from './template-utils';

// Default template strings for all UI fragments
export const defaultTemplates: KTDatepickerTemplateStrings = {
  container: `<div class="kt-datepicker-container"></div>`,
  header: `<div class="kt-datepicker-header">{{month}} {{year}}</div>`,
  footer: `<div class="kt-datepicker-footer">{{todayButton}} {{clearButton}} {{applyButton}}</div>`,
  calendarGrid: `<table class="kt-datepicker-calendar-grid">{{calendar}}</table>`,
  dayCell: `<td class="kt-datepicker-day {{classes}}">{{day}}</td>`,
  monthYearSelect: `<div class="kt-datepicker-monthyear-select">{{monthSelect}} {{yearSelect}}</div>`,
  monthSelection: `<div class="kt-datepicker-month-selection">{{months}}</div>`,
  yearSelection: `<div class="kt-datepicker-year-selection">{{years}}</div>`,
  inputWrapper: `<div class="kt-datepicker-input-wrapper">{{input}} {{icon}}</div>`,
  segmentedDateInput: `<div class="kt-datepicker-segmented-input">{{segments}}</div>`,
  segmentedDateRangeInput: `<div class="kt-datepicker-segmented-range-input">{{start}} {{separator}} {{end}}</div>`,
  placeholder: `<span class="kt-datepicker-placeholder">{{placeholder}}</span>`,
  displayWrapper: `<div class="kt-datepicker-display-wrapper">{{value}}</div>`,
  displayElement: `<span class="kt-datepicker-display-element">{{value}}</span>`,
  timePanel: `<div class="kt-datepicker-time-panel">{{hours}}:{{minutes}}:{{seconds}} {{amPm}}</div>`,
  multiDateTag: `<span class="kt-datepicker-multidate-tag">{{date}} <button>{{removeButton}}</button></span>`,
  emptyState: `<div class="kt-datepicker-empty">{{message}}</div>`,
};

/**
 * Returns the merged template set for a given config.
 */
export function getTemplateStrings(config?: KTDatepickerConfig): KTDatepickerTemplateStrings {
  return mergeTemplates(defaultTemplates, config?.templates);
}