/*
 * unified-observer.ts - Unified observer for KTDatepicker state management
 * Consolidates all UI update logic from specialized observers into a single,
 * simpler implementation that handles all datepicker UI updates.
 */

import { StateObserver } from '../../core/unified-state-manager';
import { KTDatepickerState, TimeState } from '../../config/types';

/**
 * Unified observer configuration
 */
export interface UnifiedObserverConfig {
  enableDebugging: boolean;
  enableValidation: boolean;
  enableSmoothTransitions: boolean;
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
 * UI element references
 */
export interface UIElements {
  input?: HTMLInputElement | null;
  segmentedInputContainer?: HTMLElement | null; // Single date mode
  startContainer?: HTMLElement | null;           // Range mode - start date
  endContainer?: HTMLElement | null;             // Range mode - end date
  calendarElement?: HTMLElement | null;
  timePickerElement?: HTMLElement | null;
}

/**
 * Update options for targeted UI updates
 */
export interface UpdateOptions {
  updateInput: boolean;
  updateSegmentedInput: boolean;
  updateCalendar: boolean;
  updateTimePicker: boolean;
}

/**
 * Segment types for segmented input
 */
export type SegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'ampm';

/**
 * UnifiedObserver
 *
 * Single observer that handles all datepicker UI updates based on state changes.
 * Consolidates functionality from InputObserver, SegmentedInputObserver,
 * CalendarObserver, and TimePickerObserver into a simpler, unified implementation.
 */
export class UnifiedObserver implements StateObserver {
  private _elements: UIElements = {};
  private _config: UnifiedObserverConfig;
  private _updateTimeout: number | null = null;
  private _lastState: Partial<KTDatepickerState> = {};
  private _isUpdating: boolean = false;
  private _customFormatter?: (state: KTDatepickerState) => string;

  constructor(elements: UIElements, config?: Partial<UnifiedObserverConfig>) {
    this._elements = elements;
    this._config = {
      enableDebugging: false,
      enableValidation: true,
      enableSmoothTransitions: true,
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

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Initialized with elements:', elements);
    }
  }

  /**
   * Get update priority (high priority for unified updates)
   */
  public getUpdatePriority(): number {
    return 1; // High priority - unified observer handles all updates
  }

  /**
   * Handle state changes
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    if (this._isUpdating) {
      if (this._config.enableDebugging) {
        console.log('[UnifiedObserver] Update already in progress, skipping');
      }
      return;
    }

    // Determine what needs to be updated
    const updateOptions = this._determineUpdateOptions(newState, oldState);

    // Schedule update with optional delay
    this._scheduleUpdate(newState, updateOptions);
  }

  /**
   * Determine what UI elements need updating
   */
  private _determineUpdateOptions(newState: KTDatepickerState, oldState: KTDatepickerState): UpdateOptions {
    return {
      updateInput: this._shouldUpdateInput(newState, oldState),
      updateSegmentedInput: this._shouldUpdateSegmentedInput(newState, oldState),
      updateCalendar: this._shouldUpdateCalendar(newState, oldState),
      updateTimePicker: this._shouldUpdateTimePicker(newState, oldState)
    };
  }

  /**
   * Check if input should be updated
   */
  private _shouldUpdateInput(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedTime !== oldState.selectedTime ||
      newState.selectedRange !== oldState.selectedRange ||
      newState.selectedDates !== oldState.selectedDates ||
      newState.isDisabled !== oldState.isDisabled
    );
  }

  /**
   * Check if segmented input should be updated
   */
  private _shouldUpdateSegmentedInput(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedTime !== oldState.selectedTime ||
      newState.currentDate !== oldState.currentDate ||
      newState.selectedRange !== oldState.selectedRange
    );
  }

  /**
   * Check if calendar should be updated
   */
  private _shouldUpdateCalendar(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.currentDate.getTime() !== oldState.currentDate.getTime() ||
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedRange !== oldState.selectedRange ||
      newState.selectedDates !== oldState.selectedDates ||
      newState.viewMode !== oldState.viewMode
    );
  }

  /**
   * Check if time picker should be updated
   */
  private _shouldUpdateTimePicker(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    if (!newState.selectedTime || !oldState.selectedTime) {
      return newState.selectedTime !== oldState.selectedTime;
    }

    return (
      newState.selectedTime.hour !== oldState.selectedTime.hour ||
      newState.selectedTime.minute !== oldState.selectedTime.minute ||
      newState.selectedTime.second !== oldState.selectedTime.second
    );
  }

  /**
   * Schedule UI update with optional delay
   */
  private _scheduleUpdate(state: KTDatepickerState, options: UpdateOptions): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    if (this._config.updateDelay > 0) {
      this._updateTimeout = window.setTimeout(() => {
        this._updateUI(state, options);
      }, this._config.updateDelay);
    } else {
      this._updateUI(state, options);
    }
  }

  /**
   * Update all UI elements based on state
   */
  private _updateUI(state: KTDatepickerState, options: UpdateOptions): void {
    try {
      this._isUpdating = true;

      if (this._config.enableDebugging) {
        console.log('[UnifiedObserver] Updating UI with options:', options);
      }

      // Update input field
      if (options.updateInput && this._elements.input) {
        this._updateInput(state);
      }

      // Update segmented input
      if (options.updateSegmentedInput && (this._elements.segmentedInputContainer || this._isRangeMode())) {
        this._updateSegmentedInput(state);
      }

      // Update calendar
      if (options.updateCalendar && this._elements.calendarElement) {
        this._updateCalendar(state);
      }

      // Update time picker
      if (options.updateTimePicker && this._elements.timePickerElement) {
        this._updateTimePicker(state);
      }

      // Store last state for comparison
      this._lastState = { ...state };

    } catch (error) {
      console.error('[UnifiedObserver] Error updating UI:', error);
    } finally {
      this._isUpdating = false;
    }
  }

  /**
   * Update hidden input field
   */
  private _updateInput(state: KTDatepickerState): void {
    if (!this._elements.input) return;

    // Update input value
    const value = this._formatValueForSubmission(state);
    if (this._elements.input.value !== value) {
      this._elements.input.value = value;
    }

    // Update disabled state
    if (state.isDisabled) {
      this._elements.input.setAttribute('disabled', 'true');
    } else {
      this._elements.input.removeAttribute('disabled');
    }

    // Update placeholder
    this._updatePlaceholder(state);

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Input updated:', { value, disabled: state.isDisabled });
    }
  }

  /**
   * Format value for form submission
   */
  private _formatValueForSubmission(state: KTDatepickerState): string {
    if (this._customFormatter) {
      return this._customFormatter(state);
    }

    if (state.selectedDate) {
      return state.selectedDate.toISOString().split('T')[0];
    }

    if (state.selectedRange && state.selectedRange.start) {
      return `${state.selectedRange.start.toISOString().split('T')[0]} - ${state.selectedRange.end?.toISOString().split('T')[0] || ''}`;
    }

    if (state.selectedDates.length > 0) {
      return state.selectedDates.map(d => d.toISOString().split('T')[0]).join(', ');
    }

    return '';
  }

  /**
   * Update placeholder based on state
   */
  private _updatePlaceholder(state: KTDatepickerState): void {
    if (!this._elements.input) return;

    if (state.selectedDate ||
        (state.selectedRange && state.selectedRange.start) ||
        state.selectedDates.length > 0) {
      this._elements.input.removeAttribute('placeholder');
    } else {
      this._elements.input.setAttribute('placeholder', 'Select date...');
    }
  }

  /**
   * Update segmented input components
   */
  private _updateSegmentedInput(state: KTDatepickerState): void {
    // Handle range mode
    if (this._isRangeMode()) {
      this._updateRangeSegmentedInput(state);
    } else {
      this._updateSingleSegmentedInput(state);
    }
  }

  /**
   * Check if this is range mode
   */
  private _isRangeMode(): boolean {
    return !!(this._elements.startContainer && this._elements.endContainer);
  }

  /**
   * Update single date segmented input
   */
  private _updateSingleSegmentedInput(state: KTDatepickerState): void {
    if (!this._elements.segmentedInputContainer) return;

    // Check if arrow navigation is in progress - skip update if so
    if ((window as any).__ktui_segmented_input_arrow_navigation) {
      if (this._config.enableDebugging) {
        console.log('[UnifiedObserver] Skipping segmented input update - arrow navigation in progress');
      }
      return;
    }

    // Update date segments
    const dateToUse = state.selectedDate || state.currentDate;
    if (dateToUse) {
      this._updateDateSegments(dateToUse);
    }

    // Update time segments if time is enabled
    if (state.selectedTime) {
      this._updateTimeSegments(state.selectedTime);
    }

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Single segmented input updated');
    }
  }

  /**
   * Update range mode segmented inputs (start and end)
   */
  private _updateRangeSegmentedInput(state: KTDatepickerState): void {
    if (!this._elements.startContainer || !this._elements.endContainer) {
      if (this._config.enableDebugging) {
        console.warn('[UnifiedObserver] Range mode detected but containers missing');
      }
      return;
    }

    // Update start container (date + time if enabled)
    if (state.selectedRange?.start) {
      this._updateDateSegmentsInContainer(state.selectedRange.start, this._elements.startContainer);

      // Update time segments if time is enabled
      if (this._config.formatOptions.timeFormat) {
        const timeState = {
          hour: state.selectedRange.start.getHours(),
          minute: state.selectedRange.start.getMinutes(),
          second: state.selectedRange.start.getSeconds()
        };
        this._updateTimeSegmentsInContainer(timeState, this._elements.startContainer);
      }
    }

    // Update end container (date + time if enabled)
    if (state.selectedRange?.end) {
      this._updateDateSegmentsInContainer(state.selectedRange.end, this._elements.endContainer);

      // Update time segments if time is enabled
      if (this._config.formatOptions.timeFormat) {
        const timeState = {
          hour: state.selectedRange.end.getHours(),
          minute: state.selectedRange.end.getMinutes(),
          second: state.selectedRange.end.getSeconds()
        };
        this._updateTimeSegmentsInContainer(timeState, this._elements.endContainer);
      }
    }

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Range segmented inputs updated:', {
        start: state.selectedRange?.start,
        end: state.selectedRange?.end
      });
    }
  }

  /**
   * Update date segments (year, month, day)
   */
  private _updateDateSegments(date: Date): void {
    if (!this._elements.segmentedInputContainer) return;
    this._updateDateSegmentsInContainer(date, this._elements.segmentedInputContainer);
  }

  /**
   * Update date segments in a specific container
   */
  private _updateDateSegmentsInContainer(date: Date, container: HTMLElement): void {
    const yearElement = container.querySelector('[data-segment="year"]') as HTMLElement;
    const monthElement = container.querySelector('[data-segment="month"]') as HTMLElement;
    const dayElement = container.querySelector('[data-segment="day"]') as HTMLElement;

    if (yearElement) {
      yearElement.textContent = this._formatYear(date.getFullYear());
    }
    if (monthElement) {
      monthElement.textContent = this._formatMonth(date.getMonth());
    }
    if (dayElement) {
      dayElement.textContent = this._formatDay(date.getDate());
    }
  }

  /**
   * Update time segments (hour, minute, second, ampm)
   */
  private _updateTimeSegments(time: TimeState): void {
    if (!this._elements.segmentedInputContainer) return;
    this._updateTimeSegmentsInContainer(time, this._elements.segmentedInputContainer);
  }

  /**
   * Update time segments in a specific container
   */
  private _updateTimeSegmentsInContainer(time: TimeState, container: HTMLElement): void {
    const hourElement = container.querySelector('[data-segment="hour"]') as HTMLElement;
    const minuteElement = container.querySelector('[data-segment="minute"]') as HTMLElement;
    const secondElement = container.querySelector('[data-segment="second"]') as HTMLElement;
    const ampmElement = container.querySelector('[data-segment="ampm"]') as HTMLElement;

    if (hourElement) {
      hourElement.textContent = this._formatHour(time.hour);
    }
    if (minuteElement) {
      minuteElement.textContent = this._formatMinute(time.minute);
    }
    if (secondElement) {
      secondElement.textContent = this._formatSecond(time.second);
    }
    if (ampmElement) {
      ampmElement.textContent = this._formatAmPm(time.hour);
    }
  }

  /**
   * Update calendar display
   */
  private _updateCalendar(state: KTDatepickerState): void {
    if (!this._elements.calendarElement) return;

    // Update date selection highlighting
    this._updateDateSelection(state);

    // Update navigation (month/year display)
    this._updateNavigation(state);

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Calendar updated');
    }
  }

  /**
   * Update date selection highlighting
   */
  private _updateDateSelection(state: KTDatepickerState): void {
    // Clear previous selections
    const selectedCells = this._elements.calendarElement?.querySelectorAll('[data-selected]');
    selectedCells?.forEach(cell => cell.removeAttribute('data-selected'));

    // Highlight selected date(s)
    if (state.selectedDate) {
      this._highlightDate(state.selectedDate);
    } else if (state.selectedRange) {
      this._highlightDateRange(state.selectedRange);
    } else if (state.selectedDates.length > 0) {
      state.selectedDates.forEach(date => this._highlightDate(date));
    }
  }

  /**
   * Highlight a specific date
   */
  private _highlightDate(date: Date): void {
    const cell = this._findDayCell(date);
    if (cell) {
      cell.setAttribute('data-selected', 'true');
    }
  }

  /**
   * Highlight a date range
   */
  private _highlightDateRange(range: { start: Date | null; end: Date | null }): void {
    if (range.start) {
      this._highlightDate(range.start);
    }
    if (range.end) {
      this._highlightDate(range.end);
    }
  }

  /**
   * Find day cell for a specific date
   */
  private _findDayCell(date: Date): HTMLElement | null {
    const day = date.getDate();
    const cells = this._elements.calendarElement?.querySelectorAll('td[data-kt-datepicker-day]');

    for (const cell of Array.from(cells || [])) {
      const button = cell.querySelector('button');
      if (button && button.getAttribute('data-day') === day.toString()) {
        return cell as HTMLElement;
      }
    }

    return null;
  }

  /**
   * Update navigation display
   */
  private _updateNavigation(state: KTDatepickerState): void {
    const monthYearElement = this._elements.calendarElement?.querySelector('[data-kt-datepicker-month-year]') as HTMLElement;
    if (monthYearElement) {
      const monthYear = this._formatMonthYear(state.currentDate, state.viewMode);
      monthYearElement.textContent = monthYear;
    }
  }

  /**
   * Update time picker display
   */
  private _updateTimePicker(state: KTDatepickerState): void {
    if (!this._elements.timePickerElement || !state.selectedTime) return;

    // Update time display
    const timeDisplay = this._elements.timePickerElement.querySelector('[data-kt-datepicker-time-value]') as HTMLElement;
    if (timeDisplay) {
      const timeString = this._formatTimeDisplay(state.selectedTime);
      timeDisplay.textContent = timeString;
    }

    if (this._config.enableDebugging) {
      console.log('[UnifiedObserver] Time picker updated');
    }
  }

  /**
   * Format helpers
   */
  private _formatYear(year: number): string {
    return this._config.formatOptions.yearFormat === '2-digit'
      ? year.toString().slice(-2)
      : year.toString();
  }

  private _formatMonth(month: number): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    switch (this._config.formatOptions.monthFormat) {
      case 'numeric':
        return (month + 1).toString();
      case '2-digit':
        return (month + 1).toString().padStart(2, '0');
      case 'short':
        return monthNames[month];
      case 'long':
        return monthNamesLong[month];
      default:
        return (month + 1).toString();
    }
  }

  private _formatDay(day: number): string {
    return this._config.formatOptions.dayFormat === '2-digit'
      ? day.toString().padStart(2, '0')
      : day.toString();
  }

  private _formatHour(hour: number): string {
    return this._config.formatOptions.hourFormat === '2-digit'
      ? hour.toString().padStart(2, '0')
      : hour.toString();
  }

  private _formatMinute(minute: number): string {
    return this._config.formatOptions.minuteFormat === '2-digit'
      ? minute.toString().padStart(2, '0')
      : minute.toString();
  }

  private _formatSecond(second: number): string {
    return this._config.formatOptions.secondFormat === '2-digit'
      ? second.toString().padStart(2, '0')
      : second.toString();
  }

  private _formatAmPm(hour: number): string {
    return hour >= 12 ? 'PM' : 'AM';
  }

  private _formatMonthYear(date: Date, viewMode: string): string {
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  }

  private _formatTimeDisplay(time: TimeState): string {
    const hour = this._formatHour(time.hour);
    const minute = this._formatMinute(time.minute);
    const second = this._formatSecond(time.second);
    return `${hour}:${minute}:${second}`;
  }

  /**
   * Public API methods
   */
  public setFormatter(formatter: (state: KTDatepickerState) => string): void {
    this._customFormatter = formatter;
  }

  public setElements(elements: UIElements): void {
    this._elements = { ...this._elements, ...elements };
  }

  public getElements(): UIElements {
    return { ...this._elements };
  }

  public updateConfig(config: Partial<UnifiedObserverConfig>): void {
    this._config = { ...this._config, ...config };
  }

  public dispose(): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }
    this._elements = {};
    this._lastState = {};
    this._isUpdating = false;
    this._customFormatter = undefined;
  }
}