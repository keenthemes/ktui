/*
 * datepicker-helpers.ts - Modular helpers for KTDatepicker input rendering and state
 */
import { KTDatepickerConfig, KTDatepickerState } from '../config/types';
import { renderTemplateToDOM } from '../templates/templates';
import { SegmentedInput } from '../ui/input/segmented-input';
import { getTimeSegments } from '../utils/time-utils';
import { getSegmentOrderFromFormat } from '../utils/date-utils';

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
  console.log('[instantiateSingleSegmentedInput] Starting with container:', container);
  console.log('[instantiateSingleSegmentedInput] Container HTML before:', container.innerHTML);

  // Determine segments based on format and time configuration
  let segments: Array<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm'>;

  if (config.format && typeof config.format === 'string') {
    // Use format-derived segment order for date parts
    segments = getSegmentOrderFromFormat(config.format);
    console.log('[instantiateSingleSegmentedInput] Using format-derived segments:', segments);
  } else {
    // Default fallback
    segments = ['month', 'day', 'year'];
    console.log('[instantiateSingleSegmentedInput] Using default segments:', segments);
  }

  if (config.enableTime) {
    const timeSegments = getTimeSegments(config.timeGranularity || 'minute');
    segments = [...segments, ...timeSegments];
    console.log('[instantiateSingleSegmentedInput] Added time segments:', timeSegments);

    // Add AM/PM for 12-hour format
    if (config.timeFormat === '12h') {
      segments.push('ampm');
      console.log('[instantiateSingleSegmentedInput] Added AM/PM segment');
    }
  }

  console.log('[instantiateSingleSegmentedInput] Final segments:', segments);
  console.log('[instantiateSingleSegmentedInput] Calling SegmentedInput with options:', {
    value: state.selectedDate || state.currentDate || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale
  });

  SegmentedInput(container, {
    value: state.selectedDate || state.currentDate || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
    onChange,
  });

  console.log('[instantiateSingleSegmentedInput] SegmentedInput called, container HTML after:', container.innerHTML);
}

export function instantiateRangeSegmentedInputs(
  startContainer: HTMLElement,
  endContainer: HTMLElement,
  state: KTDatepickerState,
  config: KTDatepickerConfig,
  onStartChange: (date: Date) => void,
  onEndChange: (date: Date) => void
): void {
  // Determine segments based on format
  let segments: Array<'day' | 'month' | 'year'>;

  if (config.format && typeof config.format === 'string') {
    // Use format-derived segment order for date parts
    segments = getSegmentOrderFromFormat(config.format);
  } else {
    // Default fallback
    segments = ['month', 'day', 'year'];
  }

  SegmentedInput(startContainer, {
    value: state.selectedRange?.start || new Date(),
    format: config.format,
    segments,
    disabled: !!config.disabled,
    required: !!config.required,
    readOnly: !!config.readOnly,
    locale: config.locale,
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