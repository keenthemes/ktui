/*
 * segmented-input.ts - Modular segmented input for KTDatepicker (2025+)
 * Each date/time part is rendered as a focusable, editable segment.
 *
 * Features:
 * - Segments: day, month, year, (optionally hour, minute, second, AM/PM)
 * - Keyboard navigation: Tab, Shift+Tab, arrow keys
 * - Direct typing/editing of segments
 * - ARIA roles and accessibility for all segments
 * - Emits change events on value update
 * - Integrates with KTDatepicker for value sync
 */

import { parseDateFromFormat } from './date-utils';

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

  // --- Utility: get segment value as string ---
  function getSegmentValue(segment: string, date: Date): string {
    switch (segment) {
      case 'day': return date.getDate().toString().padStart(2, '0');
      case 'month': return (date.getMonth() + 1).toString().padStart(2, '0');
      case 'year': return date.getFullYear().toString();
      case 'hour': return date.getHours().toString().padStart(2, '0');
      case 'minute': return date.getMinutes().toString().padStart(2, '0');
      case 'second': return date.getSeconds().toString().padStart(2, '0');
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
      case 'hour': d.setHours(Number(value)); break;
      case 'minute': d.setMinutes(Number(value)); break;
      case 'second': d.setSeconds(Number(value)); break;
      case 'ampm':
        if (value === 'AM' && d.getHours() >= 12) d.setHours(d.getHours() - 12);
        if (value === 'PM' && d.getHours() < 12) d.setHours(d.getHours() + 12);
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
      default:
        return undefined;
    }
  }

  // --- Track focused segment index ---
  let focusedIdx = 0;
  // --- Track caret position (offset) ---
  let caretOffset: number | null = null;

  // --- Render segments ---
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
    segments.forEach((segment, idx) => {
      const span = document.createElement('span');
      span.setAttribute('data-segment', segment);
      span.setAttribute('tabindex', idx === focusedIdx ? '0' : '-1');
      span.setAttribute('role', 'spinbutton');
      span.setAttribute('aria-label', segment.charAt(0).toUpperCase() + segment.slice(1));
      span.setAttribute('aria-valuenow', getSegmentValue(segment, currentValue));
      span.setAttribute('aria-valuetext', getSegmentValue(segment, currentValue));
      span.setAttribute('aria-valuemin', getSegmentMin(segment, currentValue)?.toString() ?? '');
      span.setAttribute('aria-valuemax', getSegmentMax(segment, currentValue)?.toString() ?? '');
      span.setAttribute('contenteditable', (!options.disabled && !options.readOnly).toString());
      span.className = 'ktui-segmented-input-segment px-1 outline-none focus:ring-2 focus:ring-primary-500 rounded';
      span.textContent = getSegmentValue(segment, currentValue);
      // Keyboard navigation
      span.addEventListener('keydown', (e) => {
        if (options.disabled || options.readOnly) return;
        // Wrapping navigation
        if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
          e.preventDefault();
          focusedIdx = (idx + 1) % segments.length;
          caretOffset = null;
          render();
        } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
          e.preventDefault();
          focusedIdx = (idx - 1 + segments.length) % segments.length;
          caretOffset = null;
          render();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          // Increment/decrement value
          e.preventDefault();
          const min = getSegmentMin(segment, currentValue) ?? 0;
          const max = getSegmentMax(segment, currentValue) ?? 9999;
          let current = Number(span.textContent) || min;
          if (e.key === 'ArrowUp') {
            current = Math.min(max, current + 1);
          } else if (e.key === 'ArrowDown') {
            current = Math.max(min, current - 1);
          }
          if (segment === 'year') {
            span.textContent = current.toString().padStart(4, '0');
          } else {
            span.textContent = current.toString().padStart(2, '0');
          }
          currentValue = setSegmentValue(segment, span.textContent || '', currentValue);
          if (options.onChange) options.onChange(currentValue);
          caretOffset = null;
          render();
        } else if (/^[0-9]$/.test(e.key)) {
          // Direct typing, enforce min/max
          let newValue;
          if (segment === 'year') {
            newValue = (span.textContent?.length === 4 ? e.key : (span.textContent || '') + e.key).slice(-4);
          } else {
            newValue = (span.textContent?.length === 2 ? e.key : (span.textContent || '') + e.key).slice(-2);
          }
          const min = getSegmentMin(segment, currentValue) ?? 0;
          const max = getSegmentMax(segment, currentValue) ?? (segment === 'year' ? 9999 : 99);
          let num = Math.max(min, Math.min(max, Number(newValue)));
          if (isNaN(num)) num = min;
          if (segment === 'year') {
            span.textContent = num.toString().padStart(4, '0');
          } else {
            span.textContent = num.toString().padStart(2, '0');
          }
          currentValue = setSegmentValue(segment, span.textContent || '', currentValue);
          if (options.onChange) options.onChange(currentValue);
          // Place caret at end after typing
          caretOffset = null;
          render();
        }
      });
      // Focus/blur styling
      span.addEventListener('focus', () => {
        span.classList.add('ring', 'ring-primary-500');
        span.setAttribute('tabindex', '0');
        focusedIdx = idx;
      });
      span.addEventListener('blur', () => {
        span.classList.remove('ring', 'ring-primary-500');
        span.setAttribute('tabindex', '-1');
      });
      // Mouse click focuses segment
      span.addEventListener('mousedown', (e) => {
        e.preventDefault();
        focusedIdx = idx;
        caretOffset = null;
        render();
      });
      container.appendChild(span);
      // Add separator if needed
      if (idx < segments.length - 1) {
        const sep = document.createElement('span');
        sep.textContent = segment === 'year' ? ' ' : '/';
        sep.className = 'ktui-segmented-input-separator';
        container.appendChild(sep);
      }
    });
    // After rendering, focus the correct segment and restore caret
    const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
    if (segs[focusedIdx]) {
      segs[focusedIdx].focus();
      // Restore caret position (at end if null)
      if (segs[focusedIdx].isContentEditable) {
        const range = document.createRange();
        range.selectNodeContents(segs[focusedIdx]);
        range.collapse(false); // place at end
        if (caretOffset !== null && segs[focusedIdx].firstChild) {
          range.setStart(segs[focusedIdx].firstChild, Math.min(caretOffset, segs[focusedIdx].textContent?.length || 0));
          range.collapse(true);
        }
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }

  // --- Focus a segment by index ---
  function focusSegment(idx: number) {
    const segs = Array.from(container.querySelectorAll('[data-segment]')) as HTMLElement[];
    if (idx >= 0 && idx < segs.length) {
      segs.forEach((el, i) => el.setAttribute('tabindex', i === idx ? '0' : '-1'));
      segs[idx].focus();
    }
  }

  // --- Initial render ---
  render();

  // --- Cleanup function ---
  return () => {
    container.innerHTML = '';
  };
}