/*
 * datepicker-helpers.ts - Modular helpers for KTDatepicker input rendering and state
 */
import { KTDatepickerConfig, KTDatepickerState } from './types';
import { renderTemplateToDOM } from './utils/template';
import { SegmentedInput } from './segmented-input';
import { getTimeSegments } from './time-utils';

export {};

export function renderSingleSegmentedInputUI(
  inputWrapperTpl: string | ((data: any) => string),
  calendarButtonHtml: string
): HTMLElement {
  let inputWrapperHtml: string;
  if (typeof inputWrapperTpl === 'function') {
    inputWrapperHtml = inputWrapperTpl({ input: '', icon: calendarButtonHtml });
  } else {
    inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, '');
  }
  const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
  return inputWrapperFrag.firstElementChild as HTMLElement;
}

export function renderRangeSegmentedInputUI(
  inputWrapperTpl: string | ((data: any) => string),
  rangeTpl: string | ((data: any) => string),
  calendarButtonHtml: string
): { inputWrapperEl: HTMLElement; startContainer: HTMLElement; endContainer: HTMLElement } {
  let inputWrapperHtml: string;
  if (typeof inputWrapperTpl === 'function') {
    inputWrapperHtml = inputWrapperTpl({ input: '', icon: calendarButtonHtml });
  } else {
    inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, '');
  }
  const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
  const inputWrapperEl = inputWrapperFrag.firstElementChild as HTMLElement;
  // Create containers for start and end segmented inputs
  const startContainer = document.createElement('div');
  startContainer.className = 'ktui-segmented-input-start flex items-center gap-1';
  startContainer.setAttribute('aria-label', 'Start date');
  const endContainer = document.createElement('div');
  endContainer.className = 'ktui-segmented-input-end flex items-center gap-1';
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
  // Determine segments based on time configuration
  let segments: Array<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm'> = ['month', 'day', 'year'];

  if (config.enableTime) {
    const timeSegments = getTimeSegments(config.timeGranularity || 'minute');
    segments = [...segments, ...timeSegments];

    // Add AM/PM for 12-hour format
    if (config.timeFormat === '12h') {
      segments.push('ampm');
    }
  }

  SegmentedInput(container, {
    value: state.selectedDate || state.currentDate || new Date(),
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
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
  SegmentedInput(startContainer, {
    value: state.selectedRange?.start || new Date(),
    segments: ['month', 'day', 'year'],
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
    onChange: onStartChange,
  });
  SegmentedInput(endContainer, {
    value: state.selectedRange?.end || new Date(),
    segments: ['month', 'day', 'year'],
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
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