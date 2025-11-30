/*
 * templates.ts - Unified template system for KTDatepicker
 * Consolidates all template functionality including default templates, merging logic,
 * rendering utilities, and template management into a single, unified system.
 */

import { KTDatepickerConfig, KTDatepickerTemplateStrings } from '../config/types';

// Default template strings for all UI fragments
export const defaultTemplates: KTDatepickerTemplateStrings = {
  // Add role="dialog" and aria-modal to the dropdown container
  container: `<div data-kt-datepicker-container {{class}}></div>`,
  header: `<div data-kt-datepicker-header {{class}}">{{prevButton}}<span data-kt-datepicker-month-year>{{month}} {{year}}</span>{{nextButton}}</div>`,
  footer: `<div data-kt-datepicker-footer {{class}}">{{todayButton}} {{clearButton}} {{applyButton}}</div>`,
  // Add role="grid" and aria-label to the calendar grid
  calendarGrid: `<table data-kt-datepicker-calendar-grid role="grid" aria-label="Calendar" aria-readonly="true" {{class}}>{{calendar}}</table>`,
  // Add role="gridcell" to dayCell, aria-selected, and tabindex for keyboard nav
  dayCell: `<td data-kt-datepicker-day role="gridcell" {{attributes}} {{class}}><button type="button" data-day="{{day}}" aria-label="Select {{day}}" tabindex="-1">{{day}}</button></td>`,
  // Month/year selectors (add aria-live for dynamic updates)
  monthYearSelect: `<div data-kt-datepicker-monthyear-select aria-live="polite" {{class}}>{{monthSelect}} {{yearSelect}}</div>`,
  monthSelection: `<div data-kt-datepicker-month-selection {{class}}>{{months}}</div>`,
  yearSelection: `<div data-kt-datepicker-year-selection {{class}}>{{years}}</div>`,
  inputWrapper: `<div data-kt-datepicker-input-wrapper class="flex items-center {{class}}">{{input}} {{icon}}</div>`,
  segmentedDateInput: `<div data-kt-datepicker-segmented-input class="flex items-center {{class}}">{{segments}}</div>`,
  segmentedDateRangeInput: `<div data-kt-datepicker-segmented-range-input class="flex items-center {{class}}">{{start}}{{separator}}{{end}}</div>`,
  /**
   * Template for a single date segment (e.g., day, month, year)
   * Placeholders: segmentType, segmentValue, ariaLabel, ariaValueNow, ariaValueText, ariaValueMin, ariaValueMax, tabindex, contenteditable
   */
  dateSegment: `<span data-segment="{{segmentType}}" role="spinbutton" aria-label="{{ariaLabel}}" aria-valuenow="{{ariaValueNow}}" aria-valuetext="{{ariaValueText}}" aria-valuemin="{{ariaValueMin}}" aria-valuemax="{{ariaValueMax}}" tabindex="{{tabindex}}" contenteditable="{{contenteditable}}" {{class}}>{{segmentValue}}</span>`,
  /**
   * Template for a segment separator (e.g., / or space)
   * Placeholders: separator
   */
  segmentSeparator: `<span data-segment-separator {{class}}>{{separator}}</span>`,
  placeholder: `<span data-kt-datepicker-placeholder {{class}}>{{placeholder}}</span>`,
  displayWrapper: `<div data-kt-datepicker-display-wrapper {{class}}>{{value}}</div>`,
  displayElement: `<span data-kt-datepicker-display-element {{class}}>{{value}}</span>`,
  timePanel: `<div data-kt-datepicker-time-panel {{class}}>{{hours}}:{{minutes}}:{{seconds}} {{amPm}}</div>`,
  multiDateTag: `<span data-kt-datepicker-multidate-tag {{class}}>{{date}} <button>{{removeButton}}</button></span>`,
  emptyState: `<div data-kt-datepicker-empty {{class}}>{{message}}</div>`,
  // Add aria-haspopup and aria-expanded to calendar button
  calendarButton: `<button type="button" data-kt-datepicker-calendar-btn aria-label="Open calendar" aria-haspopup="dialog" aria-expanded="false" {{class}}>
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  </button>`,
  // Add role="dialog" and aria-modal to dropdown
  dropdown: `<div data-kt-datepicker-dropdown role="dialog" aria-modal="true" aria-label="Date picker" class="hidden {{class}}"></div>`,
  prevButton: `<button type="button" data-kt-datepicker-prev aria-label="Previous month" {{class}}>
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  </button>`,
  nextButton: `<button type="button" data-kt-datepicker-next aria-label="Next month" {{class}}>
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  </button>`,
  // Add role="row" to calendar table rows
  calendarTable: `<table data-kt-datepicker-calendar-table role="grid" aria-label="Calendar" aria-readonly="true" {{class}}><thead><tr role="row">
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{sunday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{monday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{tuesday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{wednesday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{thursday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{friday}}</th>
    <th class="py-1 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{{saturday}}</th>
  </tr></thead>{{body}}</table>`,
  calendarBody: `<tbody data-kt-datepicker-calendar-body {{class}}>{{rows}}</tbody>`,
  calendarRow: `<tr data-kt-datepicker-calendar-row role="row" {{class}}>{{cells}}</tr>`,
  todayButton: `<button type="button" data-kt-datepicker-today {{class}}>Today</button>`,
  clearButton: `<button type="button" data-kt-datepicker-clear {{class}}>Clear</button>`,
  applyButton: `<button type="button" data-kt-datepicker-apply {{class}}>Apply</button>`,
  /**
   * Container for multiple calendar months (horizontal multi-month view)
   */
  multiMonthContainer: `<div data-kt-datepicker-multimonth-container class="flex flex-col md:flex-row gap-4 {{class}}">{{calendars}}</div>`,

  // Time picker templates
  timePickerWrapper: `<div data-kt-datepicker-time-picker {{class}}>{{timeDisplay}} {{timeControls}}</div>`,
  timeDisplay: `<div data-kt-datepicker-time-display {{class}}>{{timeValue}}</div>`,
  timeControls: `<div data-kt-datepicker-time-controls {{class}}>{{timeUnits}} {{ampmControl}}</div>`,
  timeUnit: `<div data-kt-datepicker-time-unit data-kt-datepicker-time-unit="{{unitType}}" {{class}}>{{upButton}} {{valueDisplay}} {{downButton}}</div>`,
  timeUpButton: `<button type="button" data-kt-datepicker-time-up aria-label="Increment {{unitType}}" {{class}} {{disabled}}>▲</button>`,
  timeDownButton: `<button type="button" data-kt-datepicker-time-down aria-label="Decrement {{unitType}}" {{class}} {{disabled}}>▼</button>`,
  timeValue: `<span data-kt-datepicker-time-value {{class}}>{{value}}</span>`,
  timeSeparator: `<span data-kt-datepicker-time-separator {{class}}>{{separator}}</span>`,
  ampmControl: `<div data-kt-datepicker-ampm-control {{class}}>{{ampmButton}}</div>`,
  ampmButton: `<button type="button" data-kt-datepicker-ampm-button aria-label="Toggle AM/PM" {{class}} {{disabled}}>{{ampmValue}}</button>`,
  /**
   * Panel wrapper for header + calendar
   */
  panel: `<div data-kt-datepicker-panel {{class}}>{{header}}{{calendar}}</div>`,
  /**
   * Live region for accessibility announcements
   */
  liveRegion: `<div data-kt-datepicker-live aria-live="polite" {{class}}></div>`,
  /**
   * Container for range input start date segment
   */
  rangeStartContainer: `<div data-kt-datepicker-segmented-start {{class}}></div>`,
  /**
   * Container for range input end date segment
   */
  rangeEndContainer: `<div data-kt-datepicker-segmented-end {{class}}></div>`,
};

/**
 * Template rendering options
 */
export interface TemplateRenderOptions {
  templateKey: keyof KTDatepickerTemplateStrings;
  data: Record<string, any>;
  configClasses?: Record<string, string>;
  fallbackTemplate?: string | ((data: any) => string);
}

/**
 * Merges default templates with user overrides.
 * User overrides take precedence.
 */
export function mergeTemplates(
  defaults: KTDatepickerTemplateStrings,
  overrides?: KTDatepickerTemplateStrings
): KTDatepickerTemplateStrings {
  return { ...defaults, ...(overrides || {}) };
}

/**
 * Merges default, config, and user templates (string or function)
 * Precedence: default < config < user
 */
export function getMergedTemplates(
  configTemplates?: Record<string, string | ((data: any) => string)>,
  userTemplates?: Record<string, string | ((data: any) => string)>
): Record<string, string | ((data: any) => string)> {
  return {
    ...(defaultTemplates as Record<string, string | ((data: any) => string)>),
    ...(configTemplates || {}),
    ...(userTemplates || {}),
  };
}

/**
 * Renders a template string with data using {{key}} placeholders.
 * Enhanced to handle class placeholders specifically.
 */
export function renderTemplateString(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    const value = data[key];
    if (value !== undefined) {
      return String(value);
    }
    return '';
  });
}

/**
 * Merges class data with template data for rendering.
 * Extracts class for specific template key from config classes object.
 */
export function mergeClassData(
  templateKey: string,
  templateData: Record<string, any>,
  configClasses?: Record<string, string>
): Record<string, any> {
  const classValue = configClasses?.[templateKey] || '';
  return {
    ...templateData,
    class: classValue
  };
}

/**
 * Checks if a template is a function.
 */
export function isTemplateFunction(tpl: unknown): tpl is (data: any) => string {
  return typeof tpl === 'function';
}

/**
 * Renders a template string with data and returns a DocumentFragment.
 * Usage: const frag = renderTemplateToDOM(template, data)
 */
export function renderTemplateToDOM(template: string, data: Record<string, any> = {}): DocumentFragment {
  const html = renderTemplateString(template, data);
  const frag = document.createDocumentFragment();
  const temp = document.createElement('div');
  temp.innerHTML = html;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}

/**
 * Unified template renderer for all datepicker UI components
 * Ensures consistent template usage and eliminates scattered rendering logic
 */
export class TemplateRenderer {
  private _templates: KTDatepickerTemplateStrings;

  constructor(templates: KTDatepickerTemplateStrings) {
    this._templates = templates;
  }

  /**
   * Render a template with data and return HTML string
   */
  renderTemplateString(options: TemplateRenderOptions): string {
    const { templateKey, data, configClasses, fallbackTemplate } = options;

    // Get template from template set
    let template = this._templates[templateKey];

    // Use fallback if template not found
    if (!template && fallbackTemplate) {
      template = fallbackTemplate;
    }

    // Validate template exists
    if (!template) {
      throw new Error(`Template not found for key: ${templateKey}`);
    }

    // Merge class data
    const mergedData = mergeClassData(templateKey, data, configClasses);

    // Render template
    if (isTemplateFunction(template)) {
      return template(mergedData);
    } else {
      return renderTemplateString(template as string, mergedData);
    }
  }

  /**
   * Render a template with data and return HTMLElement
   */
  renderTemplateToElement(options: TemplateRenderOptions): HTMLElement {
    const html = this.renderTemplateString(options);
    const fragment = renderTemplateToDOM(html);
    const element = fragment.firstElementChild as HTMLElement;

    if (!element) {
      throw new Error(`Failed to render template to element for key: ${options.templateKey}`);
    }

    return element;
  }

  /**
   * Render a template with data and return DocumentFragment
   */
  renderTemplateToFragment(options: TemplateRenderOptions): DocumentFragment {
    const html = this.renderTemplateString(options);
    return renderTemplateToDOM(html);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(templateKey: keyof KTDatepickerTemplateStrings): boolean {
    return !!this._templates[templateKey];
  }

  /**
   * Get template by key
   */
  getTemplate(templateKey: keyof KTDatepickerTemplateStrings): string | ((data: any) => string) | undefined {
    return this._templates[templateKey];
  }

  /**
   * Update templates
   */
  updateTemplates(templates: KTDatepickerTemplateStrings): void {
    this._templates = templates;
  }

  /**
   * Get all templates
   */
  getTemplates(): KTDatepickerTemplateStrings {
    return { ...this._templates };
  }
}

/**
 * Factory function to create a template renderer
 */
export function createTemplateRenderer(templates: KTDatepickerTemplateStrings): TemplateRenderer {
  return new TemplateRenderer(templates);
}

/**
 * Returns the merged template set for a given config.
 */
export function getTemplateStrings(config?: KTDatepickerConfig): KTDatepickerTemplateStrings {
  return mergeTemplates(defaultTemplates, config?.templates);
}