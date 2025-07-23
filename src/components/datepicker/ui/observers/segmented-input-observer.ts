/*
 * segmented-input-observer.ts - Segmented input observer for KTDatepicker unified state management
 * Handles segmented input components (year, month, day, hour, minute, second, ampm) with specialized
 * validation and formatting logic. Works alongside InputObserver for hidden input field management.
 */

import { StateObserver } from '../../core/unified-state-manager';
import { KTDatepickerState, TimeState } from '../../config/types';

/**
 * Segmented input observer configuration
 */
export interface SegmentedInputObserverConfig {
  enableDebugging: boolean;
  enableValidation: boolean;
  updateDelay: number; // milliseconds
  formatOptions: {
    yearFormat: 'numeric' | '2-digit';
    monthFormat: 'numeric' | '2-digit' | 'short' | 'long';
    dayFormat: 'numeric' | '2-digit';
    hourFormat: 'numeric' | '2-digit';
    minuteFormat: 'numeric' | '2-digit';
    secondFormat: 'numeric' | '2-digit';
    timeFormat: '12h' | '24h';
  };
}

/**
 * Segment types supported by the observer
 */
export type SegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'ampm';

/**
 * Segment validation result
 */
export interface SegmentValidationResult {
  isValid: boolean;
  errors: string[];
  correctedValue?: number;
}

/**
 * SegmentedInputObserver
 *
 * Observer for segmented input components that automatically updates based on state changes.
 * Handles year, month, day, hour, minute, second, and ampm spinbuttons with specialized
 * validation and formatting logic.
 */
export class SegmentedInputObserver implements StateObserver {
  private _container: HTMLElement | null = null;
  private _config: SegmentedInputObserverConfig;
  private _updateTimeout: number | null = null;
  private _lastState: Partial<KTDatepickerState> = {};
  private _segmentElements: Map<SegmentType, HTMLElement> = new Map();
  private _isUpdating: boolean = false;

  constructor(container: HTMLElement | null, config?: Partial<SegmentedInputObserverConfig>) {
    this._container = container;
    this._config = {
      enableDebugging: false,
      enableValidation: true,
      updateDelay: 0,
      formatOptions: {
        yearFormat: 'numeric',
        monthFormat: '2-digit',
        dayFormat: '2-digit',
        hourFormat: '2-digit',
        minuteFormat: '2-digit',
        secondFormat: '2-digit',
        timeFormat: '24h'
      },
      ...config
    };

    console.log('[SegmentedInputObserver] Initializing with container:', container);
    console.log('[SegmentedInputObserver] Config:', this._config);
    console.log('[SegmentedInputObserver] Container element:', container?.tagName, container?.className);

    this._initializeSegmentElements();
  }

  /**
   * Get update priority (high priority for segmented input updates)
   */
  public getUpdatePriority(): number {
    return 1; // High priority - segmented inputs should update first
  }

  /**
   * Handle state changes
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    console.log('[SegmentedInputObserver] State change received:', {
      newState: {
        selectedDate: newState.selectedDate,
        selectedTime: newState.selectedTime
      },
      oldState: {
        selectedDate: oldState.selectedDate,
        selectedTime: oldState.selectedTime
      }
    });

    if (!this._container) {
      console.warn('[SegmentedInputObserver] No container available for state update');
      return;
    }

    if (this._isUpdating) {
      console.log('[SegmentedInputObserver] Update already in progress, skipping');
      return;
    }

    // Force reinitialization of segment elements if none found
    if (this._segmentElements.size === 0) {
      console.log('[SegmentedInputObserver] No segment elements found, forcing reinitialization');
      this._initializeSegmentElements();
    }

    // Check if segmented inputs need updating
    if (this._shouldUpdateSegmentedInputs(newState, oldState)) {
      console.log('[SegmentedInputObserver] Scheduling segmented input update');
      this._scheduleSegmentedInputUpdate(newState);
    } else {
      console.log('[SegmentedInputObserver] No update needed for segmented inputs');
    }
  }

  /**
   * Determine if segmented inputs should be updated
   */
  private _shouldUpdateSegmentedInputs(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedTime !== oldState.selectedTime ||
      newState.currentDate !== oldState.currentDate ||
      newState.selectedRange !== oldState.selectedRange
    );
  }

  /**
   * Schedule segmented input update with optional delay
   */
  private _scheduleSegmentedInputUpdate(state: KTDatepickerState): void {
    console.log('[SegmentedInputObserver] Scheduling update with delay:', this._config.updateDelay);

    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      console.log('[SegmentedInputObserver] Cleared previous update timeout');
    }

    if (this._config.updateDelay > 0) {
      this._updateTimeout = window.setTimeout(() => {
        console.log('[SegmentedInputObserver] Executing scheduled update');
        this._updateSegmentedInputs(state);
      }, this._config.updateDelay);
    } else {
      console.log('[SegmentedInputObserver] Executing immediate update');
      this._updateSegmentedInputs(state);
    }
  }

  /**
   * Update segmented inputs based on state
   */
  private _updateSegmentedInputs(state: KTDatepickerState): void {
    console.log('[SegmentedInputObserver] Starting segmented input update');

    if (!this._container) {
      console.warn('[SegmentedInputObserver] No container available for update');
      return;
    }

    try {
      this._isUpdating = true;
      console.log('[SegmentedInputObserver] Update in progress flag set');

      // Check if this is a range input
      const isRangeInput = (this as any)._rangeElements && (this as any)._rangeElements.start.length > 0;

      if (isRangeInput && state.selectedRange) {
        // For range inputs, update based on selectedRange
        console.log('[SegmentedInputObserver] Updating range segments with range:', state.selectedRange);

        // Update start date segments
        if (state.selectedRange.start) {
          console.log('[SegmentedInputObserver] Updating start date segments with date:', state.selectedRange.start);
          this._updateRangeDateSegments(state.selectedRange.start);
        }

        // Update end date segments if available
        if (state.selectedRange.end) {
          console.log('[SegmentedInputObserver] Updating end date segments with date:', state.selectedRange.end);
          this._updateRangeEndDateSegments(state.selectedRange.end);
        }
      } else {
        // For single inputs, use the original logic
        const dateToUse = state.selectedDate || state.currentDate;
        if (dateToUse) {
          console.log('[SegmentedInputObserver] Updating date segments with date:', dateToUse);
          this._updateDateSegments(dateToUse);
        } else {
          console.log('[SegmentedInputObserver] No date available for update');
        }
      }

      // Update time segments if time is enabled
      if (state.selectedTime) {
        console.log('[SegmentedInputObserver] Updating time segments with time:', state.selectedTime);
        this._updateTimeSegments(state.selectedTime);
      } else {
        console.log('[SegmentedInputObserver] No time available for update');
      }

      // Store last state for comparison
      this._lastState = { ...state };
      console.log('[SegmentedInputObserver] Last state updated');

      console.log('[SegmentedInputObserver] Segmented inputs update completed successfully');
    } catch (error) {
      console.error('[SegmentedInputObserver] Error updating segmented inputs:', error);
    } finally {
      this._isUpdating = false;
      console.log('[SegmentedInputObserver] Update in progress flag cleared');
    }
  }

  /**
   * Update date segments (year, month, day)
   */
  private _updateDateSegments(date: Date): void {
    console.log('[SegmentedInputObserver] Updating date segments for date:', date);
    console.log('[SegmentedInputObserver] Available elements:', Array.from(this._segmentElements.keys()));

    // Check if this is a range input
    const isRangeInput = (this as any)._rangeElements && (this as any)._rangeElements.start.length > 0;

    if (isRangeInput) {
      this._updateRangeDateSegments(date);
    } else {
      this._updateSingleDateSegments(date);
    }
  }

  /**
   * Update single date segments
   */
  private _updateSingleDateSegments(date: Date): void {
    // Update year
    const yearElement = this._segmentElements.get('year');
    if (yearElement) {
      const yearValue = this._formatYear(date.getFullYear());
      console.log('[SegmentedInputObserver] Updating year element with value:', yearValue);
      this._updateSegmentElement(yearElement, yearValue);
    } else {
      console.warn('[SegmentedInputObserver] Year element not found');
    }

    // Update month
    const monthElement = this._segmentElements.get('month');
    if (monthElement) {
      const monthValue = this._formatMonth(date.getMonth() + 1);
      console.log('[SegmentedInputObserver] Updating month element with value:', monthValue);
      this._updateSegmentElement(monthElement, monthValue);
    } else {
      console.warn('[SegmentedInputObserver] Month element not found');
    }

    // Update day
    const dayElement = this._segmentElements.get('day');
    if (dayElement) {
      const dayValue = this._formatDay(date.getDate());
      console.log('[SegmentedInputObserver] Updating day element with value:', dayValue);
      this._updateSegmentElement(dayElement, dayValue);
    } else {
      console.warn('[SegmentedInputObserver] Day element not found');
    }
  }

  /**
   * Update range date segments (start and end dates)
   */
  private _updateRangeDateSegments(date: Date): void {
    console.log('[SegmentedInputObserver] Updating range date segments for date:', date);

    const rangeElements = (this as any)._rangeElements;
    if (!rangeElements) {
      console.warn('[SegmentedInputObserver] No range elements found, falling back to single update');
      this._updateSingleDateSegments(date);
      return;
    }

    // For now, update the start date elements (the ones we're tracking)
    const startElements = rangeElements.start;

    const startYear = startElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'year');
    const startMonth = startElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'month');
    const startDay = startElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'day');

    if (startYear) {
      const yearValue = this._formatYear(date.getFullYear());
      console.log('[SegmentedInputObserver] Updating start year element with value:', yearValue);
      this._updateSegmentElement(startYear, yearValue);
    }

    if (startMonth) {
      const monthValue = this._formatMonth(date.getMonth() + 1);
      console.log('[SegmentedInputObserver] Updating start month element with value:', monthValue);
      this._updateSegmentElement(startMonth, monthValue);
    }

    if (startDay) {
      const dayValue = this._formatDay(date.getDate());
      console.log('[SegmentedInputObserver] Updating start day element with value:', dayValue);
      this._updateSegmentElement(startDay, dayValue);
    }

    // Note: End date elements would be updated through the range selection logic
    // when the user selects a range in the calendar
  }

  /**
   * Update range end date segments
   */
  private _updateRangeEndDateSegments(date: Date): void {
    console.log('[SegmentedInputObserver] Updating range end date segments for date:', date);

    const rangeElements = (this as any)._rangeElements;
    if (!rangeElements) {
      console.warn('[SegmentedInputObserver] No range elements found for end date update');
      return;
    }

    // Update the end date elements
    const endElements = rangeElements.end;

    const endYear = endElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'year');
    const endMonth = endElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'month');
    const endDay = endElements.find((el: HTMLElement) => el.getAttribute('data-segment') === 'day');

    if (endYear) {
      const yearValue = this._formatYear(date.getFullYear());
      console.log('[SegmentedInputObserver] Updating end year element with value:', yearValue);
      this._updateSegmentElement(endYear, yearValue);
    }

    if (endMonth) {
      const monthValue = this._formatMonth(date.getMonth() + 1);
      console.log('[SegmentedInputObserver] Updating end month element with value:', monthValue);
      this._updateSegmentElement(endMonth, monthValue);
    }

    if (endDay) {
      const dayValue = this._formatDay(date.getDate());
      console.log('[SegmentedInputObserver] Updating end day element with value:', dayValue);
      this._updateSegmentElement(endDay, dayValue);
    }
  }

  /**
   * Update time segments (hour, minute, second, ampm)
   */
  private _updateTimeSegments(time: TimeState): void {
    // Update hour
    const hourElement = this._segmentElements.get('hour');
    if (hourElement) {
      const hourValue = this._formatHour(time.hour);
      this._updateSegmentElement(hourElement, hourValue);
    }

    // Update minute
    const minuteElement = this._segmentElements.get('minute');
    if (minuteElement) {
      const minuteValue = this._formatMinute(time.minute);
      this._updateSegmentElement(minuteElement, minuteValue);
    }

    // Update second
    const secondElement = this._segmentElements.get('second');
    if (secondElement) {
      const secondValue = this._formatSecond(time.second);
      this._updateSegmentElement(secondElement, secondValue);
    }

    // Update AM/PM
    const ampmElement = this._segmentElements.get('ampm');
    if (ampmElement) {
      const ampmValue = this._formatAmPm(time.hour);
      this._updateSegmentElement(ampmElement, ampmValue);
    }
  }

  /**
   * Update individual segment element
   */
  private _updateSegmentElement(element: HTMLElement, value: string): void {
    console.log('[SegmentedInputObserver] Updating element:', element.tagName, element.className, 'with value:', value);

    // Update the element's text content or value
    if (element.tagName === 'INPUT') {
      const oldValue = (element as HTMLInputElement).value;
      (element as HTMLInputElement).value = value;
      console.log('[SegmentedInputObserver] Updated input element from', oldValue, 'to', value);
    } else {
      const oldValue = element.textContent;
      element.textContent = value;
      console.log('[SegmentedInputObserver] Updated text element from', oldValue, 'to', value);
    }

    // Dispatch change event
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
    console.log('[SegmentedInputObserver] Dispatched change event for element');
  }

  /**
   * Format year value
   */
  private _formatYear(year: number): string {
    if (this._config.formatOptions.yearFormat === '2-digit') {
      return (year % 100).toString().padStart(2, '0');
    }
    return year.toString();
  }

  /**
   * Format month value
   */
  private _formatMonth(month: number): string {
    switch (this._config.formatOptions.monthFormat) {
      case '2-digit':
        return month.toString().padStart(2, '0');
      case 'short':
        return new Date(2024, month - 1).toLocaleDateString(undefined, { month: 'short' });
      case 'long':
        return new Date(2024, month - 1).toLocaleDateString(undefined, { month: 'long' });
      default:
        return month.toString();
    }
  }

  /**
   * Format day value
   */
  private _formatDay(day: number): string {
    if (this._config.formatOptions.dayFormat === '2-digit') {
      return day.toString().padStart(2, '0');
    }
    return day.toString();
  }

  /**
   * Format hour value
   */
  private _formatHour(hour: number): string {
    if (this._config.formatOptions.timeFormat === '12h') {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      if (this._config.formatOptions.hourFormat === '2-digit') {
        return hour12.toString().padStart(2, '0');
      }
      return hour12.toString();
    } else {
      if (this._config.formatOptions.hourFormat === '2-digit') {
        return hour.toString().padStart(2, '0');
      }
      return hour.toString();
    }
  }

  /**
   * Format minute value
   */
  private _formatMinute(minute: number): string {
    if (this._config.formatOptions.minuteFormat === '2-digit') {
      return minute.toString().padStart(2, '0');
    }
    return minute.toString();
  }

  /**
   * Format second value
   */
  private _formatSecond(second: number): string {
    if (this._config.formatOptions.secondFormat === '2-digit') {
      return second.toString().padStart(2, '0');
    }
    return second.toString();
  }

  /**
   * Format AM/PM value
   */
  private _formatAmPm(hour: number): string {
    return hour >= 12 ? 'PM' : 'AM';
  }

  /**
   * Handle segment change from user input
   */
  public handleSegmentChange(segment: SegmentType, value: number): void {
    if (!this._config.enableValidation) return;

    const validation = this.validateSegmentValue(segment, value);
    if (!validation.isValid) {
      if (this._config.enableDebugging) {
        console.warn(`[SegmentedInputObserver] Invalid ${segment} value:`, validation.errors);
      }

      // Apply corrected value if available
      if (validation.correctedValue !== undefined) {
        const element = this._segmentElements.get(segment);
        if (element) {
          this._updateSegmentElement(element, validation.correctedValue.toString());
        }
      }
    }
  }

  /**
   * Validate segment value
   */
  public validateSegmentValue(segment: SegmentType, value: number): SegmentValidationResult {
    const errors: string[] = [];

    switch (segment) {
      case 'year':
        if (value < 1900 || value > 2100) {
          errors.push('Year must be between 1900 and 2100');
        }
        break;

      case 'month':
        if (value < 1 || value > 12) {
          errors.push('Month must be between 1 and 12');
        }
        break;

      case 'day':
        if (value < 1 || value > 31) {
          errors.push('Day must be between 1 and 31');
        }
        break;

      case 'hour':
        const maxHour = this._config.formatOptions.timeFormat === '12h' ? 12 : 23;
        if (value < 0 || value > maxHour) {
          errors.push(`Hour must be between 0 and ${maxHour}`);
        }
        break;

      case 'minute':
        if (value < 0 || value > 59) {
          errors.push('Minute must be between 0 and 59');
        }
        break;

      case 'second':
        if (value < 0 || value > 59) {
          errors.push('Second must be between 0 and 59');
        }
        break;

      case 'ampm':
        if (value !== 0 && value !== 1) {
          errors.push('AM/PM must be 0 (AM) or 1 (PM)');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      correctedValue: this._getCorrectedValue(segment, value)
    };
  }

  /**
   * Get corrected value for invalid input
   */
  private _getCorrectedValue(segment: SegmentType, value: number): number | undefined {
    switch (segment) {
      case 'year':
        return Math.max(1900, Math.min(2100, value));
      case 'month':
        return Math.max(1, Math.min(12, value));
      case 'day':
        return Math.max(1, Math.min(31, value));
      case 'hour':
        const maxHour = this._config.formatOptions.timeFormat === '12h' ? 12 : 23;
        return Math.max(0, Math.min(maxHour, value));
      case 'minute':
        return Math.max(0, Math.min(59, value));
      case 'second':
        return Math.max(0, Math.min(59, value));
      case 'ampm':
        return value === 0 ? 0 : 1;
      default:
        return undefined;
    }
  }

  /**
   * Initialize segment elements from container
   */
  private _initializeSegmentElements(): void {
    if (!this._container) {
      console.warn('[SegmentedInputObserver] No container provided for element initialization');
      return;
    }

    console.log('[SegmentedInputObserver] Initializing segment elements from container:', this._container);
    console.log('[SegmentedInputObserver] Container HTML:', this._container.innerHTML);

    const segmentSelectors: Record<SegmentType, string> = {
      year: '[data-segment="year"]',
      month: '[data-segment="month"]',
      day: '[data-segment="day"]',
      hour: '[data-segment="hour"]',
      minute: '[data-segment="minute"]',
      second: '[data-segment="second"]',
      ampm: '[data-segment="ampm"]'
    };

    // Try alternative selectors
    const alternativeSelectors = [
      '[data-segment]',
      '[role="spinbutton"]',
      'span[contenteditable]',
      '.kt-datepicker-date-segment'
    ];

    console.log('[SegmentedInputObserver] Trying alternative selectors:');
    for (const altSelector of alternativeSelectors) {
      const elements = this._container.querySelectorAll(altSelector);
      console.log(`[SegmentedInputObserver] Found ${elements.length} elements with selector "${altSelector}":`, elements);
    }

    // Check if this is a range input (has multiple sets of segments)
    const allSegmentElements = this._container.querySelectorAll('[data-segment]');
    const isRangeInput = allSegmentElements.length > 3; // More than 3 suggests range input (start + end dates)

    console.log('[SegmentedInputObserver] Detected range input:', isRangeInput);
    console.log('[SegmentedInputObserver] Total segment elements found:', allSegmentElements.length);

    if (isRangeInput) {
      // For range inputs, we need to handle multiple sets of segments
      this._initializeRangeSegmentElements(allSegmentElements);
    } else {
      // For single inputs, use the original logic
      for (const [segment, selector] of Object.entries(segmentSelectors)) {
        const element = this._container.querySelector(selector) as HTMLElement;
        if (element) {
          this._segmentElements.set(segment as SegmentType, element);
          console.log(`[SegmentedInputObserver] Found ${segment} element:`, element);

          // Add event listeners for user input
          this._addSegmentEventListener(element, segment as SegmentType);
        } else {
          console.warn(`[SegmentedInputObserver] ${segment} element not found with selector: ${selector}`);
        }
      }
    }

    console.log('[SegmentedInputObserver] Total elements found:', this._segmentElements.size);
    console.log('[SegmentedInputObserver] Initialized segments:', Array.from(this._segmentElements.keys()));

    // If no elements found, try to create them manually
    if (this._segmentElements.size === 0) {
      console.warn('[SegmentedInputObserver] No segment elements found, attempting manual creation');
      this._createSegmentElementsManually();
    }
  }

  /**
   * Initialize segment elements for range inputs (start and end dates)
   */
  private _initializeRangeSegmentElements(allSegmentElements: NodeListOf<Element>): void {
    console.log('[SegmentedInputObserver] Initializing range segment elements');

    // Convert to array for easier manipulation
    const elements = Array.from(allSegmentElements) as HTMLElement[];

    // Group elements by their container (start vs end)
    const startElements: HTMLElement[] = [];
    const endElements: HTMLElement[] = [];

    elements.forEach(element => {
      const container = element.closest('.ktui-segmented-input-start, .ktui-segmented-input-end');
      if (container?.classList.contains('ktui-segmented-input-start')) {
        startElements.push(element);
      } else if (container?.classList.contains('ktui-segmented-input-end')) {
        endElements.push(element);
      } else {
        // Fallback: assume first half are start, second half are end
        if (startElements.length < 3) {
          startElements.push(element);
        } else {
          endElements.push(element);
        }
      }
    });

    console.log('[SegmentedInputObserver] Grouped elements:', {
      start: startElements.length,
      end: endElements.length
    });

    // For range inputs, we'll focus on the start date elements for now
    // The end date will be updated through the range selection logic
    const startYear = startElements.find(el => el.getAttribute('data-segment') === 'year');
    const startMonth = startElements.find(el => el.getAttribute('data-segment') === 'month');
    const startDay = startElements.find(el => el.getAttribute('data-segment') === 'day');

    if (startYear) {
      this._segmentElements.set('year', startYear);
      this._addSegmentEventListener(startYear, 'year');
      console.log('[SegmentedInputObserver] Found start year element:', startYear);
    }

    if (startMonth) {
      this._segmentElements.set('month', startMonth);
      this._addSegmentEventListener(startMonth, 'month');
      console.log('[SegmentedInputObserver] Found start month element:', startMonth);
    }

    if (startDay) {
      this._segmentElements.set('day', startDay);
      this._addSegmentEventListener(startDay, 'day');
      console.log('[SegmentedInputObserver] Found start day element:', startDay);
    }

    // Store range elements for later use
    (this as any)._rangeElements = {
      start: startElements,
      end: endElements
    };
  }

  private _createSegmentElementsManually(): void {
    console.log('[SegmentedInputObserver] Creating segment elements manually');

    // Look for existing spinbutton elements that might be our segments
    const spinbuttons = this._container!.querySelectorAll('[role="spinbutton"]') as NodeListOf<HTMLElement>;
    console.log('[SegmentedInputObserver] Found spinbutton elements:', spinbuttons.length);

    if (spinbuttons.length >= 3) {
      // Assume first 3 are year, month, day
      const yearElement = spinbuttons[0];
      const monthElement = spinbuttons[1];
      const dayElement = spinbuttons[2];

      // Add data-segment attributes
      yearElement.setAttribute('data-segment', 'year');
      monthElement.setAttribute('data-segment', 'month');
      dayElement.setAttribute('data-segment', 'day');

      console.log('[SegmentedInputObserver] Added data-segment attributes to existing elements');

      // Add to segment elements map
      this._segmentElements.set('year', yearElement);
      this._segmentElements.set('month', monthElement);
      this._segmentElements.set('day', dayElement);

      // Add event listeners
      this._addSegmentEventListener(yearElement, 'year');
      this._addSegmentEventListener(monthElement, 'month');
      this._addSegmentEventListener(dayElement, 'day');

      // Check for time elements
      if (spinbuttons.length >= 5) {
        const hourElement = spinbuttons[3];
        const minuteElement = spinbuttons[4];

        hourElement.setAttribute('data-segment', 'hour');
        minuteElement.setAttribute('data-segment', 'minute');

        this._segmentElements.set('hour', hourElement);
        this._segmentElements.set('minute', minuteElement);

        this._addSegmentEventListener(hourElement, 'hour');
        this._addSegmentEventListener(minuteElement, 'minute');

        // Check for seconds
        if (spinbuttons.length >= 6) {
          const secondElement = spinbuttons[5];
          secondElement.setAttribute('data-segment', 'second');
          this._segmentElements.set('second', secondElement);
          this._addSegmentEventListener(secondElement, 'second');
        }

        // Check for AM/PM
        if (spinbuttons.length >= 7) {
          const ampmElement = spinbuttons[6];
          ampmElement.setAttribute('data-segment', 'ampm');
          this._segmentElements.set('ampm', ampmElement);
          this._addSegmentEventListener(ampmElement, 'ampm');
        }
      }

      console.log('[SegmentedInputObserver] Manual element creation completed:', this._segmentElements);
    } else {
      console.error('[SegmentedInputObserver] Not enough spinbutton elements found for manual creation');
    }
  }

  /**
   * Add event listener to segment element
   */
  private _addSegmentEventListener(element: HTMLElement, segment: SegmentType): void {
    element.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const value = parseInt(target.value, 10);

      if (!isNaN(value)) {
        this.handleSegmentChange(segment, value);
      }
    });
  }

  /**
   * Set container element reference
   */
  public setContainer(container: HTMLElement | null): void {
    this._container = container;
    this._segmentElements.clear();
    this._initializeSegmentElements();
  }

  /**
   * Get current container element
   */
  public getContainer(): HTMLElement | null {
    return this._container;
  }

  /**
   * Get segment element by type
   */
  public getSegmentElement(segment: SegmentType): HTMLElement | null {
    return this._segmentElements.get(segment) || null;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<SegmentedInputObserverConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Clean up observer
   */
  public dispose(): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }

    // Remove event listeners
    for (const [segment, element] of Array.from(this._segmentElements.entries())) {
      element.removeEventListener('change', () => {});
    }

    this._segmentElements.clear();
    this._container = null;
  }
}