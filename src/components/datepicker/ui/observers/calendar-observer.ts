/*
 * calendar-observer.ts - Calendar observer for KTDatepicker unified state management
 * Automatically updates calendar UI based on state changes.
 */

import { StateObserver } from '../../core/unified-state-manager';
import { KTDatepickerState } from '../../config/types';

/**
 * Calendar observer configuration
 */
export interface CalendarObserverConfig {
  enableDebugging: boolean;
  enableSmoothTransitions: boolean;
  updateDelay: number; // milliseconds
}

/**
 * Calendar update options
 */
export interface CalendarUpdateOptions {
  updateGrid: boolean;
  updateSelection: boolean;
  updateNavigation: boolean;
  updateViewMode: boolean;
}

/**
 * CalendarObserver
 *
 * Observer for calendar that automatically updates based on state changes.
 * Handles calendar grid updates, date selection highlighting, and view mode changes.
 */
export class CalendarObserver implements StateObserver {
  private _calendarElement: HTMLElement | null = null;
  private _config: CalendarObserverConfig;
  private _updateTimeout: number | null = null;
  private _lastState: Partial<KTDatepickerState> = {};

  constructor(calendarElement: HTMLElement | null, config?: Partial<CalendarObserverConfig>) {
    this._calendarElement = calendarElement;
    this._config = {
      enableDebugging: false,
      enableSmoothTransitions: true,
      updateDelay: 0,
      ...config
    };
  }

  /**
   * Get update priority (medium priority for calendar updates)
   */
  public getUpdatePriority(): number {
    return 2; // Medium priority - after input updates
  }

  /**
   * Handle state changes
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Determine what needs to be updated
    const updateOptions = this._determineUpdateOptions(newState, oldState);

    // Schedule update with optional delay
    this._scheduleCalendarUpdate(newState, updateOptions);
  }

  /**
   * Determine what calendar elements need updating
   */
  private _determineUpdateOptions(newState: KTDatepickerState, oldState: KTDatepickerState): CalendarUpdateOptions {
    return {
      updateGrid: this._shouldUpdateGrid(newState, oldState),
      updateSelection: this._shouldUpdateSelection(newState, oldState),
      updateNavigation: this._shouldUpdateNavigation(newState, oldState),
      updateViewMode: this._shouldUpdateViewMode(newState, oldState)
    };
  }

  /**
   * Check if calendar grid should be updated
   */
  private _shouldUpdateGrid(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.currentDate.getTime() !== oldState.currentDate.getTime() ||
      newState.viewMode !== oldState.viewMode
    );
  }

  /**
   * Check if date selection should be updated
   */
  private _shouldUpdateSelection(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedRange !== oldState.selectedRange ||
      newState.selectedDates !== oldState.selectedDates
    );
  }

  /**
   * Check if navigation should be updated
   */
  private _shouldUpdateNavigation(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.currentDate.getTime() !== oldState.currentDate.getTime() ||
      newState.viewMode !== oldState.viewMode
    );
  }

  /**
   * Check if view mode should be updated
   */
  private _shouldUpdateViewMode(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return newState.viewMode !== oldState.viewMode;
  }

  /**
   * Schedule calendar update with optional delay
   */
  private _scheduleCalendarUpdate(state: KTDatepickerState, options: CalendarUpdateOptions): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    if (this._config.updateDelay > 0) {
      this._updateTimeout = window.setTimeout(() => {
        this._updateCalendar(state, options);
      }, this._config.updateDelay);
    } else {
      this._updateCalendar(state, options);
    }
  }

  /**
   * Update calendar based on state changes
   */
  private _updateCalendar(state: KTDatepickerState, options: CalendarUpdateOptions): void {
    if (!this._calendarElement) return;

    try {
      // Update calendar grid if needed
      if (options.updateGrid) {
        this._updateCalendarGrid(state);
      }

      // Update date selection highlighting
      if (options.updateSelection) {
        this._updateDateSelection(state);
      }

      // Update navigation elements
      if (options.updateNavigation) {
        this._updateNavigation(state);
      }

      // Update view mode
      if (options.updateViewMode) {
        this._updateViewMode(state);
      }

      // Store last state for comparison
      this._lastState = { ...state };

      if (this._config.enableDebugging) {
        console.log('[CalendarObserver] Calendar updated with options:', options);
      }
    } catch (error) {
      console.error('[CalendarObserver] Error updating calendar:', error);
    }
  }

  /**
   * Update calendar grid
   */
  private _updateCalendarGrid(state: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Find calendar table element
    const calendarTable = this._calendarElement.querySelector('[data-kt-datepicker-calendar-table]');
    if (!calendarTable) {
      console.warn('[CalendarObserver] Calendar table not found');
      return;
    }

    // This would typically call the calendar renderer to update the grid
    // For now, we'll just mark it as needing update
    calendarTable.setAttribute('data-needs-update', 'true');

    if (this._config.enableDebugging) {
      console.log('[CalendarObserver] Calendar grid marked for update');
    }
  }

  /**
   * Update date selection highlighting
   */
  private _updateDateSelection(state: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Clear existing selection classes
    const selectedCells = Array.from(this._calendarElement.querySelectorAll('.kt-datepicker-day-selected, .kt-datepicker-day-in-range, .kt-datepicker-day-range-start, .kt-datepicker-day-range-end')) as HTMLElement[];
    selectedCells.forEach(cell => {
      cell.classList.remove('kt-datepicker-day-selected', 'kt-datepicker-day-in-range', 'kt-datepicker-day-range-start', 'kt-datepicker-day-range-end');
    });

    // Add selection classes based on state
    if (state.selectedDate) {
      this._highlightSelectedDate(state.selectedDate);
    } else if (state.selectedRange) {
      this._highlightDateRange(state.selectedRange);
    } else if (state.selectedDates.length > 0) {
      this._highlightMultiDates(state.selectedDates);
    }

    if (this._config.enableDebugging) {
      console.log('[CalendarObserver] Date selection updated');
    }
  }

  /**
   * Highlight selected date
   */
  private _highlightSelectedDate(date: Date): void {
    if (!this._calendarElement) return;

    const dayCell = this._findDayCell(date);
    if (dayCell) {
      dayCell.classList.add('kt-datepicker-day-selected');
    }
  }

  /**
   * Highlight date range
   */
  private _highlightDateRange(range: { start: Date | null; end: Date | null }): void {
    if (!this._calendarElement || !range.start) return;

    // Highlight start date
    const startCell = this._findDayCell(range.start);
    if (startCell) {
      startCell.classList.add('kt-datepicker-day-range-start');
    }

    // Highlight end date if exists
    if (range.end) {
      const endCell = this._findDayCell(range.end);
      if (endCell) {
        endCell.classList.add('kt-datepicker-day-range-end');
      }

      // Highlight dates in between
      this._highlightRangeDates(range.start, range.end);
    }
  }

  /**
   * Highlight multi-dates
   */
  private _highlightMultiDates(dates: Date[]): void {
    dates.forEach(date => {
      this._highlightSelectedDate(date);
    });
  }

  /**
   * Highlight dates in range
   */
  private _highlightRangeDates(start: Date, end: Date): void {
    if (!this._calendarElement) return;

    const current = new Date(start);
    current.setDate(current.getDate() + 1);

    while (current < end) {
      const dayCell = this._findDayCell(current);
      if (dayCell) {
        dayCell.classList.add('kt-datepicker-day-in-range');
      }
      current.setDate(current.getDate() + 1);
    }
  }

  /**
   * Find day cell for given date
   */
  private _findDayCell(date: Date): HTMLElement | null {
    if (!this._calendarElement) return null;

    const dayButtons = Array.from(this._calendarElement.querySelectorAll('[data-kt-datepicker-day]')) as HTMLElement[];
    for (const button of dayButtons) {
      const buttonDate = new Date(button.getAttribute('data-kt-datepicker-day') || '');
      if (buttonDate.getTime() === date.getTime()) {
        return button;
      }
    }
    return null;
  }

  /**
   * Update navigation elements
   */
  private _updateNavigation(state: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Update month/year display
    const monthYearElement = this._calendarElement.querySelector('[data-kt-datepicker-month-year]');
    if (monthYearElement) {
      const monthYear = this._formatMonthYear(state.currentDate, state.viewMode);
      monthYearElement.textContent = monthYear;
    }

    // Update navigation button states
    this._updateNavigationButtons(state);
  }

  /**
   * Format month/year for display
   */
  private _formatMonthYear(date: Date, viewMode: string): string {
    const options: Intl.DateTimeFormatOptions = {};

    switch (viewMode) {
      case 'days':
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'months':
        options.year = 'numeric';
        break;
      case 'years':
        const year = date.getFullYear();
        return `${year - 5} - ${year + 5}`;
    }

    return date.toLocaleDateString(undefined, options);
  }

  /**
   * Update navigation buttons
   */
  private _updateNavigationButtons(state: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Update previous/next button states based on min/max dates
    // This would be implemented based on the specific datepicker configuration
    const prevButton = this._calendarElement.querySelector('[data-kt-datepicker-prev]');
    const nextButton = this._calendarElement.querySelector('[data-kt-datepicker-next]');

    if (prevButton) {
      // Check if previous navigation is allowed
      prevButton.removeAttribute('disabled');
    }

    if (nextButton) {
      // Check if next navigation is allowed
      nextButton.removeAttribute('disabled');
    }
  }

  /**
   * Update view mode
   */
  private _updateViewMode(state: KTDatepickerState): void {
    if (!this._calendarElement) return;

    // Update view mode classes
    this._calendarElement.classList.remove('kt-datepicker-view-days', 'kt-datepicker-view-months', 'kt-datepicker-view-years');
    this._calendarElement.classList.add(`kt-datepicker-view-${state.viewMode}`);

    if (this._config.enableDebugging) {
      console.log('[CalendarObserver] View mode updated:', state.viewMode);
    }
  }

  /**
   * Set calendar element reference
   */
  public setCalendarElement(element: HTMLElement | null): void {
    this._calendarElement = element;
  }

  /**
   * Get current calendar element
   */
  public getCalendarElement(): HTMLElement | null {
    return this._calendarElement;
  }

  /**
   * Clean up observer
   */
  public dispose(): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }
    this._calendarElement = null;
  }
}