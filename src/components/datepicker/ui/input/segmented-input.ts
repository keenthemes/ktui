/*
 * segmented-input.ts - Modular segmented input for KTDatepicker (2025+)
 * Each date/time part is rendered as a focusable, editable segment.
 *
 * Features:
 * - Segments: day, month, year, (optionally hour, minute, second, AM/PM)
 * - Keyboard navigation: Tab, Shift+Tab, arrow keys, Enter
 * - Direct typing/editing of segments with focus preservation
 * - ARIA roles and accessibility for all segments
 * - Emits change events on value update (debounced)
 * - Integrates with KTDatepicker for value sync
 *
 * Keyboard Navigation:
 * - Tab/Shift+Tab: Move between segments
 * - Arrow Left/Right: Move between segments
 * - Arrow Up/Down: Increment/decrement segment value
 * - Enter: Move to next segment (wraps from last to first)
 * - Number keys: Direct input with validation (optimized for performance)
 *
 * Performance Optimizations:
 * - No DOM re-rendering during number typing
 * - Focus preserved during rapid input
 * - Debounced onChange events (150ms delay)
 * - Caret position maintained during editing
 */

import { parseDateFromFormat } from '../../utils/date-utils';
import { getTemplateStrings } from '../../templates/templates';
import { KTDatepickerConfig } from '../../config/types';

/**
 * SegmentedInputOptions defines the configuration for the segmented input.
 */
export interface SegmentedInputOptions {
  value: Date;
  format?: string; // e.g. 'MM/DD/YYYY', 'YYYY-MM-DD', etc.
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  locale?: string;
  onChange?: (value: Date) => void;
  segments?: Array<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm'>;
  timeFormat?: '12h' | '24h'; // Time format for display
}

/**
 * SegmentedInput - renders a segmented date/time input.
 * @param container - HTMLElement to render into
 * @param options - SegmentedInputOptions
 * @returns cleanup function
 */
export function SegmentedInput(container: HTMLElement, options: SegmentedInputOptions) {
  // --- Internal state ---
  let currentValue = new Date(options.value);
  const segments = options.segments || ['month', 'day', 'year'];
  const locale = options.locale || 'default';

  // Global flag to track arrow navigation across all segmented inputs
  if (!(window as any).__ktui_segmented_input_arrow_navigation) {
    (window as any).__ktui_segmented_input_arrow_navigation = false;
  }

  // --- Get templates ---
  // Use a minimal config to get templates; in real usage, pass full config if available
  const templates = getTemplateStrings({} as KTDatepickerConfig);
  const segmentTpl = templates.dateSegment as string | ((data: any) => string) | undefined;
  const separatorTpl = templates.segmentSeparator as string | ((data: any) => string) | undefined;

  // --- Utility: get separator between segments ---
  function getSeparatorBetweenSegments(segment1: string, segment2: string, format: string | undefined): string {
    // Time segments use ":" as separator
    const timeSegments = ['hour', 'minute', 'second'];
    if (timeSegments.includes(segment1) && timeSegments.includes(segment2)) {
      return ':';
    }

    // Space between date and time
    const dateSegments = ['day', 'month', 'year'];
    if (dateSegments.includes(segment1) && timeSegments.includes(segment2)) {
      return ' ';
    }

    // AM/PM has space before it
    if (segment2 === 'ampm') {
      return ' ';
    }

    // Second to AM/PM has space
    if (segment1 === 'second' && segment2 === 'ampm') {
      return ' ';
    }

    // Date segments use separator from format
    if (dateSegments.includes(segment1) && dateSegments.includes(segment2)) {
      return getSeparatorFromFormat(format);
    }

    // Default fallback
    return '';
  }

  // --- Utility: get separator from format ---
  function getSeparatorFromFormat(format: string | undefined): string {
    if (!format) return '/'; // Default fallback

    // Find the first non-date token character to use as separator
    const tokenRegex = /(yyyy|yy|MM|M|dd|d)/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(format)) !== null) {
      if (match.index > lastIndex) {
        // Found a separator character
        const separator = format.slice(lastIndex, match.index);
        if (separator && separator.length > 0) {
          return separator;
        }
      }
      lastIndex = match.index + match[0].length;
    }

    // Check for separator after the last token
    if (lastIndex < format.length) {
      const separator = format.slice(lastIndex);
      if (separator && separator.length > 0) {
        return separator;
      }
    }

    return '/'; // Default fallback
  }

  // --- Utility: check if segment should be padded based on format ---
  function shouldPadSegment(segment: string, format: string | undefined): boolean {
    if (!format) return true; // Default to padded for backward compatibility

    const tokenRegex = /(yyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s)/g;
    let match;

    while ((match = tokenRegex.exec(format)) !== null) {
      switch (match[0]) {
        case 'dd': if (segment === 'day') return true; break;
        case 'd': if (segment === 'day') return false; break;
        case 'MM': if (segment === 'month') return true; break;
        case 'M': if (segment === 'month') return false; break;
        case 'yyyy': if (segment === 'year') return true; break; // 4-digit year
        case 'yy': if (segment === 'year') return false; break; // 2-digit year
        case 'HH':
        case 'H': if (segment === 'hour') return match[0] === 'HH'; break;
        case 'mm':
        case 'm': if (segment === 'minute') return match[0] === 'mm'; break;
        case 'ss':
        case 's': if (segment === 'second') return match[0] === 'ss'; break;
      }
    }

    return true; // Default fallback
  }

  // --- Utility: get segment value as string ---
  function getSegmentValue(segment: string, date: Date): string {
    const shouldPad = shouldPadSegment(segment, options.format);

    switch (segment) {
      case 'day':
        const day = date.getDate();
        return shouldPad ? day.toString().padStart(2, '0') : day.toString();
      case 'month':
        const month = date.getMonth() + 1;
        return shouldPad ? month.toString().padStart(2, '0') : month.toString();
      case 'year':
        const year = date.getFullYear();
        return shouldPad ? year.toString() : year.toString().slice(-2); // yy format shows last 2 digits
      case 'hour':
        // For 12-hour format, convert to 1-12 range
        let hourValue: number;
        if (options.timeFormat === '12h') {
          const hour24 = date.getHours();
          hourValue = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        } else {
          hourValue = date.getHours();
        }
        return shouldPad ? hourValue.toString().padStart(2, '0') : hourValue.toString();
      case 'minute':
        const minute = date.getMinutes();
        return shouldPad ? minute.toString().padStart(2, '0') : minute.toString();
      case 'second':
        const second = date.getSeconds();
        return shouldPad ? second.toString().padStart(2, '0') : second.toString();
      case 'ampm': return date.getHours() < 12 ? 'AM' : 'PM';
      default: return '';
    }
  }

  // --- Utility: set segment value ---
  function setSegmentValue(segment: string, value: string, date: Date): Date {
    const d = new Date(date);
    switch (segment) {
      case 'day': d.setDate(Number(value)); break;
      case 'month': d.setMonth(Number(value) - 1); break;
      case 'year': d.setFullYear(Number(value)); break;
      case 'hour':
        // Handle 12-hour vs 24-hour format
        let hourValue = Number(value);
        if (options.timeFormat === '12h') {
          // In 12-hour mode, convert 12-hour input to 24-hour
          const currentHour = d.getHours();
          const isPM = currentHour >= 12;
          if (hourValue === 12) {
            hourValue = isPM ? 12 : 0; // 12 AM = 0, 12 PM = 12
          } else if (isPM) {
            hourValue += 12; // PM hours: add 12
          }
        }
        // Preserve existing minutes and seconds when setting hour
        const currentMinutes = d.getMinutes();
        const currentSecondsForHour = d.getSeconds();
        d.setHours(hourValue, currentMinutes, currentSecondsForHour);
        break;
      case 'minute':
        // Preserve existing seconds when setting minute
        const currentSecondsForMinute = d.getSeconds();
        d.setMinutes(Number(value), currentSecondsForMinute);
        break;
      case 'second': d.setSeconds(Number(value)); break;
      case 'ampm':
        if (value === 'AM' && d.getHours() >= 12) {
          d.setHours(d.getHours() - 12);
        } else if (value === 'PM' && d.getHours() < 12) {
          d.setHours(d.getHours() + 12);
        }
        break;
    }
    return d;
  }

  // --- Utility: get min/max for a segment ---
  function getSegmentMin(segment: string, date: Date): number | undefined {
    switch (segment) {
      case 'day':
        // Use actual month/year for max days
        return 1;
      case 'month':
        return 1;
      case 'year':
        return options.min ? options.min.getFullYear() : undefined;
      case 'hour':
        return 0;
      case 'minute':
      case 'second':
        return 0;
      case 'ampm':
        return 0; // 0 = AM, 1 = PM
      default:
        return undefined;
    }
  }
  function getSegmentMax(segment: string, date: Date): number | undefined {
    switch (segment) {
      case 'day':
        // Use actual month/year for max days
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      case 'month':
        return 12;
      case 'year':
        return options.max ? options.max.getFullYear() : undefined;
      case 'hour':
        return 23;
      case 'minute':
      case 'second':
        return 59;
      case 'ampm':
        return 1; // 0 = AM, 1 = PM
      default:
        return undefined;
    }
  }

  // --- Track focused segment index ---
  let focusedIdx = 0;
  // --- Track caret position (offset) ---
  let caretOffset: number | null = null;
  // --- Track if this is the first render ---
  let isInitialRender = true;
  // --- Track if we're in the middle of Arrow Up/Down navigation ---
  let isArrowNavigation = false;

  // --- Focus a segment by index and restore caret position ---
  /**
   * Restores focus to the segment at the given index and restores caret position if available.
   * @param idx - Index of the segment to focus
   * @param caret - Caret offset to restore (null for end)
   */
  function restoreFocus(idx: number, caret: number | null = null) {
    try {
      const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
      if (segs[idx] && segs[idx].offsetParent !== null) { // Check if element is in DOM
        segs.forEach((el, i) => el.setAttribute('tabindex', i === idx ? '0' : '-1'));
        segs[idx].focus();
        // Restore caret position (at end if null)
        if (segs[idx].isContentEditable) {
          const range = document.createRange();
          range.selectNodeContents(segs[idx]);
          range.collapse(false); // place at end
          if (caret !== null && segs[idx].firstChild) {
            range.setStart(segs[idx].firstChild, Math.min(caret, segs[idx].textContent?.length || 0));
            range.collapse(true);
          }
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    } catch (error) {
      // Fallback: focus first available segment
      const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
      if (segs[0]) segs[0].focus();
    }
  }

  // --- Render segments using templates ---
  function render() {
    // Capture caret position before DOM update
    const prevSegs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
    if (prevSegs[focusedIdx] && document.activeElement === prevSegs[focusedIdx]) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode === prevSegs[focusedIdx].firstChild) {
        caretOffset = sel.anchorOffset;
      } else {
        caretOffset = null;
      }
    } else {
      caretOffset = null;
    }
    container.innerHTML = '';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Date input');
    container.tabIndex = -1;

    // Build segments HTML using templates
    let segmentsHtml = '';
    segments.forEach((segment, idx) => {
      const segmentValue = getSegmentValue(segment, currentValue);
      const segmentData = {
        segmentType: segment,
        segmentValue,
        ariaLabel: segment.charAt(0).toUpperCase() + segment.slice(1),
        ariaValueNow: segmentValue,
        ariaValueText: segmentValue,
        ariaValueMin: getSegmentMin(segment, currentValue)?.toString() ?? '',
        ariaValueMax: getSegmentMax(segment, currentValue)?.toString() ?? '',
        tabindex: idx === focusedIdx ? '0' : '-1',
        contenteditable: (!options.disabled && !options.readOnly).toString(),
      };

      let segmentHtml = '';
      if (typeof segmentTpl === 'function') {
        segmentHtml = segmentTpl(segmentData);
      } else if (typeof segmentTpl === 'string') {
        segmentHtml = segmentTpl
          .replace(/{{segmentType}}/g, segmentData.segmentType)
          .replace(/{{segmentValue}}/g, segmentData.segmentValue)
          .replace(/{{ariaLabel}}/g, segmentData.ariaLabel)
          .replace(/{{ariaValueNow}}/g, segmentData.ariaValueNow)
          .replace(/{{ariaValueText}}/g, segmentData.ariaValueText)
          .replace(/{{ariaValueMin}}/g, segmentData.ariaValueMin)
          .replace(/{{ariaValueMax}}/g, segmentData.ariaValueMax)
          .replace(/{{tabindex}}/g, segmentData.tabindex)
          .replace(/{{contenteditable}}/g, segmentData.contenteditable);
      } else {
        segmentHtml = '';
      }

      segmentsHtml += segmentHtml;

      if (idx < segments.length - 1) {
        // Get appropriate separator between these segments
        const nextSegment = segments[idx + 1];
        const separator = getSeparatorBetweenSegments(segment, nextSegment, options.format);

        let sepHtml = '';
        if (typeof separatorTpl === 'function') {
          sepHtml = separatorTpl({ separator });
        } else if (typeof separatorTpl === 'string') {
          sepHtml = separatorTpl.replace(/{{separator}}/g, separator);
        } else {
          sepHtml = '';
        }
        segmentsHtml += sepHtml;
      }
    });

    // Wrap in segmentedDateInput template
    let segmentedInputHtml = segmentsHtml;
    const segmentedDateInputTpl = templates.segmentedDateInput as string | ((data: any) => string) | undefined;
    if (segmentedDateInputTpl) {
      if (typeof segmentedDateInputTpl === 'function') {
        segmentedInputHtml = segmentedDateInputTpl({ segments: segmentsHtml });
      } else if (typeof segmentedDateInputTpl === 'string') {
        segmentedInputHtml = segmentedDateInputTpl.replace(/{{segments}}/g, segmentsHtml);
      } else {
        segmentedInputHtml = segmentsHtml;
      }
    }

    container.innerHTML = segmentedInputHtml;

    // Verify template rendering was successful
    const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];

    if (segs.length === 0) {
      throw new Error('Segmented input template rendering failed');
    }

    // Re-bind events to all segments

    segs.forEach((span, idx) => {
      span.addEventListener('keydown', (e) => {
        if (options.disabled || options.readOnly) return;
        // Wrapping navigation
        if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
          e.preventDefault();
          isArrowNavigation = true; // Set flag to prevent blur onChange
          focusedIdx = (idx + 1) % segments.length;
          caretOffset = null;
          // Update tabindex directly instead of full re-render
          const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
          segs.forEach((el, i) => el.setAttribute('tabindex', i === focusedIdx ? '0' : '-1'));
          restoreFocus(focusedIdx, caretOffset);
          // Reset flag after a short delay to allow focus to be restored
          setTimeout(() => {
            isArrowNavigation = false;
          }, 10);
        } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
          e.preventDefault();
          isArrowNavigation = true; // Set flag to prevent blur onChange
          focusedIdx = (idx - 1 + segments.length) % segments.length;
          caretOffset = null;
          // Update tabindex directly instead of full re-render
          const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
          segs.forEach((el, i) => el.setAttribute('tabindex', i === focusedIdx ? '0' : '-1'));
          restoreFocus(focusedIdx, caretOffset);
          // Reset flag after a short delay to allow focus to be restored
          setTimeout(() => {
            isArrowNavigation = false;
          }, 10);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          // Increment/decrement value
          e.preventDefault();
          e.stopPropagation(); // Prevent bubbling to main datepicker
          isArrowNavigation = true; // Set flag to prevent blur onChange

          let newValue: string;

          if (segments[idx] === 'ampm') {
            // Handle AM/PM toggle
            const currentAmPm = span.textContent || 'AM';
            if (e.key === 'ArrowUp') {
              newValue = currentAmPm === 'AM' ? 'PM' : 'AM';
            } else {
              newValue = currentAmPm === 'AM' ? 'PM' : 'AM';
            }
          } else {
            // Handle numeric segments
            const min = getSegmentMin(segments[idx], currentValue) ?? 0;
            const max = getSegmentMax(segments[idx], currentValue) ?? 9999;
            let current = Number(getSegmentValue(segments[idx], currentValue)) || min;
            if (e.key === 'ArrowUp') {
              current = Math.min(max, current + 1);
            } else if (e.key === 'ArrowDown') {
              current = Math.max(min, current - 1);
            }
            newValue = current.toString();
            const shouldPad = shouldPadSegment(segments[idx], options.format);
            if (segments[idx] === 'year') {
              if (shouldPad) {
                newValue = newValue.padStart(4, '0');
              }
            } else if (shouldPad) {
              newValue = newValue.padStart(2, '0');
            }
          }

          span.textContent = newValue;
          currentValue = setSegmentValue(segments[idx], newValue, currentValue);

          // Set global flag to prevent unified observer from overriding UI
          (window as any).__ktui_segmented_input_arrow_navigation = true;

          // Call onChange immediately for Arrow Up/Down to update the main datepicker
          if (options.onChange) {
            options.onChange(currentValue);
          }

          // Clear flag after onChange callback
          setTimeout(() => {
            (window as any).__ktui_segmented_input_arrow_navigation = false;
          }, 50);
          // Preserve caret position at end of content
          if (span.isContentEditable) {
            const range = document.createRange();
            range.selectNodeContents(span);
            range.collapse(false); // place at end
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          // Reset flag after a short delay to allow focus to be restored
          setTimeout(() => {
            isArrowNavigation = false;
          }, 10);
        } else if (e.key === 'Enter') {
          // Move to next segment on Enter
          e.preventDefault();
          e.stopPropagation(); // Prevent bubbling to main datepicker
          isArrowNavigation = true; // Set flag to prevent blur onChange
          focusedIdx = (idx + 1) % segments.length;
          caretOffset = null;
          // Update tabindex directly instead of full re-render
          const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
          segs.forEach((el, i) => el.setAttribute('tabindex', i === focusedIdx ? '0' : '-1'));
          restoreFocus(focusedIdx, caretOffset);
          // Reset flag after a short delay to allow focus to be restored
          setTimeout(() => {
            isArrowNavigation = false;
          }, 10);
        } else if (/^[0-9]$/.test(e.key)) {
          // Direct typing, enforce min/max - optimized to avoid focus loss
          e.preventDefault();
          let newValue;
          if (segments[idx] === 'year') {
            newValue = (span.textContent?.length === 4 ? e.key : (span.textContent || '') + e.key).slice(-4);
          } else {
            newValue = (span.textContent?.length === 2 ? e.key : (span.textContent || '') + e.key).slice(-2);
          }
          const min = getSegmentMin(segments[idx], currentValue) ?? 0;
          const max = getSegmentMax(segments[idx], currentValue) ?? (segments[idx] === 'year' ? 9999 : 99);
          let num = Math.max(min, Math.min(max, Number(newValue)));
          if (isNaN(num)) num = min;

          // Update content directly without re-rendering to preserve focus
          const oldText = span.textContent;
          const shouldPad = shouldPadSegment(segments[idx], options.format);
          if (segments[idx] === 'year') {
            span.textContent = shouldPad ? num.toString().padStart(4, '0') : num.toString();
          } else {
            span.textContent = shouldPad ? num.toString().padStart(2, '0') : num.toString();
          }

          // Update internal value
          currentValue = setSegmentValue(segments[idx], span.textContent || '', currentValue);

          // Debounce onChange to avoid excessive updates during rapid typing
          if (options.onChange) {
            clearTimeout((span as any)._onChangeTimeout);
            (span as any)._onChangeTimeout = setTimeout(() => {
              options.onChange!(currentValue);
            }, 150); // 150ms debounce
          }

          // Preserve caret position at end of content
          if (span.isContentEditable) {
            const range = document.createRange();
            range.selectNodeContents(span);
            range.collapse(false); // place at end
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }
      });
      // Focus/blur styling (no classes, just ARIA/tabindex)
      span.addEventListener('focus', () => {
        span.setAttribute('tabindex', '0');
        focusedIdx = idx;
      });
      span.addEventListener('blur', () => {
        span.setAttribute('tabindex', '-1');
        // Clear any pending debounced onChange calls
        if ((span as any)._onChangeTimeout) {
          clearTimeout((span as any)._onChangeTimeout);
          (span as any)._onChangeTimeout = null;
        }
        // Call onChange when user finishes editing to update the main datepicker
        // But not during Arrow Up/Down navigation and only if value actually changed
        if (options.onChange && !isArrowNavigation) {
          const updatedValue = setSegmentValue(segments[idx], span.textContent || '', currentValue);
          // Only call onChange if the value has actually changed
          if (updatedValue.getTime() !== currentValue.getTime()) {
            options.onChange(updatedValue);
          }
        }
      });
      // Mouse click focuses segment (optimized to avoid unnecessary re-rendering)
      span.addEventListener('mousedown', (e) => {
        e.preventDefault();
        focusedIdx = idx;
        caretOffset = null;
        // Only update tabindex and focus, no full re-render
        const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
        segs.forEach((el, i) => el.setAttribute('tabindex', i === focusedIdx ? '0' : '-1'));
        restoreFocus(focusedIdx, caretOffset);
      });
    });
    // After rendering, restore focus to the correct segment and caret (skip on initial render)
    if (!isInitialRender) {
    restoreFocus(focusedIdx, caretOffset);
    }
    isInitialRender = false;
  }

  // --- Initial render ---
  render();

  // --- Cleanup function ---
  return () => {
    // Clear any pending debounced onChange calls
    const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
    segs.forEach(span => {
      if ((span as any)._onChangeTimeout) {
        clearTimeout((span as any)._onChangeTimeout);
      }
    });
    container.innerHTML = '';
  };
}