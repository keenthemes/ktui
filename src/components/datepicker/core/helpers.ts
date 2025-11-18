/*
 * datepicker-helpers.ts - Modular helpers for KTDatepicker input rendering and state
 */
import { KTDatepickerConfig, KTDatepickerState } from '../config/types';
import { renderTemplateToDOM, createTemplateRenderer, getTemplateStrings } from '../templates/templates';
import { SegmentedInput } from '../ui/input/segmented-input';
import { getTimeSegments } from '../utils/time-utils';
import { getSegmentOrderFromFormat } from '../utils/date-utils';

/**
 * Get segments array based on configuration (date + optional time)
 * @param config Datepicker configuration
 * @returns Array of segment types
 */
export function getSegmentsForConfig(config: KTDatepickerConfig): Array<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm'> {
  // Determine date segments based on format
  let segments: Array<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm'>;

  if (config.format && typeof config.format === 'string') {
    // Use format-derived segment order for date parts
    segments = getSegmentOrderFromFormat(config.format);
  } else {
    // Default fallback
    segments = ['month', 'day', 'year'];
  }

  // Add time segments if time is enabled
  if (config.enableTime) {
    const timeSegments = getTimeSegments(config.timeGranularity || 'minute');
    segments = [...segments, ...timeSegments];

    // Add AM/PM for 12-hour format
    if (config.timeFormat === '12h') {
      segments.push('ampm');
    }
  }

  return segments;
}

export {};

export function renderSingleSegmentedInputUI(
  inputWrapperTpl: string | ((data: any) => string),
  calendarButtonHtml: string,
  config?: KTDatepickerConfig
): HTMLElement {
  // Get template renderer with proper configuration
  const templates = getTemplateStrings(config);
  const templateRenderer = createTemplateRenderer(templates);

  // Create the segmented input container using the template system
  const segmentedInputEl = templateRenderer.renderTemplateToElement({
    templateKey: 'segmentedDateInput',
    data: { segments: '' }, // Empty segments initially, will be populated by SegmentedInput
    configClasses: config?.classes // Pass config classes for proper styling
  });

  let inputWrapperHtml: string;
  if (typeof inputWrapperTpl === 'function') {
    inputWrapperHtml = inputWrapperTpl({ input: segmentedInputEl.outerHTML, icon: calendarButtonHtml });
  } else {
    inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, segmentedInputEl.outerHTML);
  }
  const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
  return inputWrapperFrag.firstElementChild as HTMLElement;
}

export function renderRangeSegmentedInputUI(
  inputWrapperTpl: string | ((data: any) => string),
  rangeTpl: string | ((data: any) => string),
  calendarButtonHtml: string,
  config?: KTDatepickerConfig
): { inputWrapperEl: HTMLElement; startContainer: HTMLElement; endContainer: HTMLElement } {
  // Get template renderer with proper configuration
  const templates = getTemplateStrings(config);
  const templateRenderer = createTemplateRenderer(templates);

  let inputWrapperHtml: string;
  if (typeof inputWrapperTpl === 'function') {
    inputWrapperHtml = inputWrapperTpl({ input: '', icon: calendarButtonHtml });
  } else {
    inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, '');
  }
  const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
  const inputWrapperEl = inputWrapperFrag.firstElementChild as HTMLElement;

  // Create containers for start and end segmented inputs using template system
  const startContainer = templateRenderer.renderTemplateToElement({
    templateKey: 'segmentedDateInput',
    data: { segments: '' },
    configClasses: { ...config?.classes, segmentedDateInput: 'kt-segmented-input-start' }
  });
  startContainer.setAttribute('aria-label', 'Start date');

  const endContainer = templateRenderer.renderTemplateToElement({
    templateKey: 'segmentedDateInput',
    data: { segments: '' },
    configClasses: { ...config?.classes, segmentedDateInput: 'kt-segmented-input-end' }
  });
  endContainer.setAttribute('aria-label', 'End date');
  // Render template with placeholders
  const separator = '–';
  let rangeHtml: string;
  if (typeof rangeTpl === 'function') {
    rangeHtml = rangeTpl({
      start: '<div data-kt-datepicker-segmented-start></div>',
      separator,
      end: '<div data-kt-datepicker-segmented-end></div>',
    });
  } else {
    rangeHtml = rangeTpl
      .replace(/{{start}}/g, '<div data-kt-datepicker-segmented-start></div>')
      .replace(/{{separator}}/g, separator)
      .replace(/{{end}}/g, '<div data-kt-datepicker-segmented-end></div>');
  }
  const rangeFrag = renderTemplateToDOM(rangeHtml);
  // Find mount points
  const startMount = rangeFrag.querySelector('[data-kt-datepicker-segmented-start]') as HTMLElement;
  const endMount = rangeFrag.querySelector('[data-kt-datepicker-segmented-end]') as HTMLElement;
  if (startMount) startMount.replaceWith(startContainer);
  if (endMount) endMount.replaceWith(endContainer);
  // Insert the range input UI at the start of the wrapper
  inputWrapperEl.insertBefore(rangeFrag.firstElementChild!, inputWrapperEl.firstChild);
  return { inputWrapperEl, startContainer, endContainer };
}

export function instantiateSingleSegmentedInput(
  container: HTMLElement,
  state: KTDatepickerState,
  config: KTDatepickerConfig,
  onChange: (date: Date) => void
): void {
  // Use shared utility to determine segments
  const segments = getSegmentsForConfig(config);

  SegmentedInput(container, {
    value: state.selectedDate || state.currentDate || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
    timeFormat: config.timeFormat,
    onChange,
  });
}

export function instantiateRangeSegmentedInputs(
  startContainer: HTMLElement,
  endContainer: HTMLElement,
  state: KTDatepickerState,
  config: KTDatepickerConfig,
  onStartChange: (date: Date) => void,
  onEndChange: (date: Date) => void
): void {
  // Use shared utility to determine segments (includes time if enabled)
  const segments = getSegmentsForConfig(config);

  SegmentedInput(startContainer, {
    value: state.selectedRange?.start || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
    timeFormat: config.timeFormat,
    onChange: onStartChange,
  });
  SegmentedInput(endContainer, {
    value: state.selectedRange?.end || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
    timeFormat: config.timeFormat,
    onChange: onEndChange,
  });
}

export function updateRangeSelection(
  selectedRange: { start: Date | null; end: Date | null } | null,
  date: Date
): { start: Date | null; end: Date | null } {
  if (!selectedRange || (!selectedRange.start && !selectedRange.end)) {
    return { start: date, end: null };
  } else if (selectedRange.start && !selectedRange.end) {
    if (date >= selectedRange.start) {
      return { start: selectedRange.start, end: date };
    } else {
      return { start: date, end: null };
    }
  } else {
    return { start: date, end: null };
  }
}