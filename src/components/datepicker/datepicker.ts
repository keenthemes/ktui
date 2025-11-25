/*
 * datepicker.ts - Main implementation for KTDatepicker component
 * Provides single, range, and multi-date selection with segmented input UI.
 * Modular rendering and state helpers are imported from datepicker-helpers.ts.
 */

import KTComponent from '../component';
import KTData from '../../helpers/data';
import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './config/types';
import {
  getTemplateStrings,
  defaultTemplates,
  createTemplateRenderer,
  TemplateRenderer,
  renderTemplateString,
  mergeClassData,
  isTemplateFunction,
  renderTemplateToDOM
} from './templates/templates';
import { defaultDatepickerConfig } from './config/config';
import { renderHeader } from './ui/renderers/header';
import { renderCalendar } from './ui/renderers/calendar';
import { renderFooter } from './ui/renderers/footer';
import { renderTimePicker } from './ui/renderers/time-picker';
import { EventManager } from './core/event-manager';
import { FocusManager } from './core/focus-manager';
import { KTDatepickerDropdown } from './ui/input/dropdown';

import { KTDatepickerUnifiedStateManager, StateObserver } from './core/unified-state-manager';
import { DropdownState } from './config/types';
import { SegmentedInput, SegmentedInputOptions } from './ui/input/segmented-input';
import { parseDateFromFormat } from './utils/date-utils';
import { dateToTimeState, applyTimeToDate, validateTime } from './utils/time-utils';
import { TimeState } from './config/types';
import {
  renderSingleSegmentedInputUI,
  renderRangeSegmentedInputUI,
  instantiateSingleSegmentedInput,
  instantiateRangeSegmentedInputs,
  updateRangeSelection
} from './core/helpers';

/**
 * KTDatepicker
 *
 * Datepicker component for selecting single, range, or multiple dates.
 *
 * Features:
 * - Opens on input focus or calendar button click (configurable)
 * - Supports single, range, and multi-date modes
 * - Customizable via templates and data attributes
 * - Keyboard navigation and accessibility support
 */
export class KTDatepicker extends KTComponent implements StateObserver {
  protected override readonly _name: string = 'datepicker';
  protected override _defaultConfig: KTDatepickerConfig = defaultDatepickerConfig;
  protected override _config: KTDatepickerConfig = defaultDatepickerConfig;

  /**
   * Initialize the datepicker components after configuration is set
   */
  private _initializeDatepicker(): void {
    // Set up templates
    this._templateSet = getTemplateStrings(this._config);
    this._templateRenderer = createTemplateRenderer(this._templateSet);

    // Initialize state manager
    this._unifiedStateManager = new KTDatepickerUnifiedStateManager({
      enableValidation: true,
      enableDebugging: this._config.debug || false,
      enableUpdateBatching: true,
      batchDelay: 16
    });

    // Set initial state
    this._unifiedStateManager.updateState(this._getInitialState(), 'initialization', true);

    // Subscribe to state changes
    this._unsubscribeFromState = this._unifiedStateManager.subscribe(this);

    // Initialize event manager
    this._eventManager = new EventManager();

    // Set up instance ID for debugging
    this._instanceId = `datepicker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this._element.setAttribute('data-kt-datepicker-instance-id', this._instanceId);

    // Set placeholder from config if available
    if (this._input && this._config.placeholder) {
      this._input.setAttribute('placeholder', this._config.placeholder);
    }

    // Set disabled state from config if available
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');
      // Also set disabled state in unified state manager
      this._unifiedStateManager.setDropdownDisabled(true, 'config');
    }

    // --- Time initialization ---
    if (this._config.enableTime) {
      this._unifiedStateManager.updateState({
        timeGranularity: this._config.timeGranularity || 'minute'
      }, 'config');

      // Initialize time from selected date or current time
      const baseDate = this._unifiedStateManager.getState().selectedDate || this._unifiedStateManager.getState().currentDate || new Date();
      this._unifiedStateManager.setSelectedTime(dateToTimeState(baseDate), 'config');
    }

    // --- Mode-specific initialization ---
    if (this._config.range && this._config.valueRange) {
      this._initRangeFromConfig();
    } else if (this._config.multiDate && Array.isArray(this._config.values)) {
      this._initMultiDateFromConfig();
    } else if (this._config.value) {
      this._initSingleDateFromConfig();
    }

    // --- Input focus event for showOnFocus ---
    if (this._input) {
      this._eventManager.addListener(this._input, 'focus', this._onInputFocus);
    }

    // --- Document click event for outside click detection ---
    this._eventManager.addListener(
      document as unknown as HTMLElement,
      'click',
      this._handleDocumentClick
    );

    (this._element as any).instance = this;

    // Initial render
    this._render();
  }

  /**
   * Get the initial state for the datepicker
   */
  private _getInitialState(): KTDatepickerState {
    const now = new Date();
    const selectedDate = this._config.value ? new Date(this._config.value) : null;
    const selectedTime = selectedDate && this._config.enableTime ? dateToTimeState(selectedDate) : null;

    return {
      currentDate: selectedDate || now,
      selectedDate,
      selectedRange: null,
      selectedDates: [],
      selectedTime,
      timeGranularity: this._config.timeGranularity || 'minute',
      viewMode: 'days',
      isOpen: false,
      isFocused: false,
      isTransitioning: false,
      isDisabled: !!this._config.disabled,
      validationErrors: [],
      isValid: true,
      dropdownState: {
        isOpen: false,
        isTransitioning: false,
        isDisabled: !!this._config.disabled,
        isFocused: false,
      },
    };
  }

  protected _templateSet: ReturnType<typeof getTemplateStrings>;
  private _userTemplates: Record<string, string | ((data: any) => string)> = {};
  private _templateRenderer: TemplateRenderer;

  private _container: HTMLElement;
  private _input: HTMLInputElement | null = null;
  private _eventManager: EventManager;
  private _focusManager: FocusManager | null = null;
  private _dropdownModule: KTDatepickerDropdown | null = null;
  private _timePickerRenderer: { cleanup: () => void; update: (newTime: TimeState) => void } | null = null;

  // Unified state manager
  private _unifiedStateManager: KTDatepickerUnifiedStateManager;
  private _unsubscribeFromState: (() => void) | null = null;


  // Dynamic element detection
  private _elementObserver: MutationObserver | null = null;
  private _instanceId: string;

  // DOM element cache for performance optimization
  private _cachedElements: {
    calendarElement: HTMLElement | null;
    timePickerElement: HTMLElement | null;
    startContainer: HTMLElement | null;
    endContainer: HTMLElement | null;
    yearElement: HTMLElement | null;
    monthElement: HTMLElement | null;
    dayElement: HTMLElement | null;
    hourElement: HTMLElement | null;
    minuteElement: HTMLElement | null;
    secondElement: HTMLElement | null;
    ampmElement: HTMLElement | null;
    monthYearElement: HTMLElement | null;
    timeDisplay: HTMLElement | null;
  } = {
    calendarElement: null,
    timePickerElement: null,
    startContainer: null,
    endContainer: null,
    yearElement: null,
    monthElement: null,
    dayElement: null,
    hourElement: null,
    minuteElement: null,
    secondElement: null,
    ampmElement: null,
    monthYearElement: null,
    timeDisplay: null
  };


  /**
   * Initialize DOM element cache for performance optimization
   */
  private _initializeElementCache(): void {
    // Cache main container elements
    this._cachedElements.calendarElement = this._element.querySelector('[data-kt-datepicker-calendar-table]') as HTMLElement;
    this._cachedElements.timePickerElement = this._element.querySelector('[data-kt-datepicker-time-container]') as HTMLElement;

    // Cache range mode containers
    this._cachedElements.startContainer = this._element.querySelector('[data-kt-datepicker-start-container]') as HTMLElement;
    this._cachedElements.endContainer = this._element.querySelector('[data-kt-datepicker-end-container]') as HTMLElement;

    // Cache segmented input elements
    this._cachedElements.yearElement = this._element.querySelector('[data-segment="year"]') as HTMLElement;
    this._cachedElements.monthElement = this._element.querySelector('[data-segment="month"]') as HTMLElement;
    this._cachedElements.dayElement = this._element.querySelector('[data-segment="day"]') as HTMLElement;
    this._cachedElements.hourElement = this._element.querySelector('[data-segment="hour"]') as HTMLElement;
    this._cachedElements.minuteElement = this._element.querySelector('[data-segment="minute"]') as HTMLElement;
    this._cachedElements.secondElement = this._element.querySelector('[data-segment="second"]') as HTMLElement;
    this._cachedElements.ampmElement = this._element.querySelector('[data-segment="ampm"]') as HTMLElement;

    // Cache navigation and display elements
    this._cachedElements.monthYearElement = this._cachedElements.calendarElement?.querySelector('[data-kt-datepicker-month-year]') as HTMLElement;
    this._cachedElements.timeDisplay = this._cachedElements.timePickerElement?.querySelector('[data-kt-datepicker-time-value]') as HTMLElement;
  }

  /**
   * Refresh DOM element cache when structure changes
   */
  private _refreshElementCache(): void {
    this._initializeElementCache();
  }

  /**
   * Update input field with current state
   */
  private _updateInput(state: KTDatepickerState): void {
    if (!this._input) return;

    // Update input value
    let value = '';
        if (this._config.range && state.selectedRange) {
      value = this._formatRange(state.selectedRange.start, state.selectedRange.end);
        } else if (this._config.multiDate && state.selectedDates.length > 0) {
      value = this._formatMultiDate(state.selectedDates);
        } else if (state.selectedDate) {
      value = this._formatSingleDate(state.selectedDate);
    }

    if (this._input.value !== value) {
      this._input.value = value;
    }

    // Update disabled state
    if (state.isDisabled) {
      this._input.setAttribute('disabled', 'true');
    } else {
      this._input.removeAttribute('disabled');
    }

    // Update placeholder
    if (value) {
      this._input.removeAttribute('placeholder');
    } else {
      this._input.setAttribute('placeholder', 'Select date...');
    }
  }


  /**
   * Update single date segmented input
   */
  private _updateSingleSegmentedInput(state: KTDatepickerState): void {
    const dateToUse = state.selectedDate || state.currentDate;
    if (dateToUse) {
      this._updateDateSegments(dateToUse);
    }

    // Update time segments if time is enabled
    if (state.selectedTime) {
      this._updateTimeSegments(state.selectedTime);
    }
  }

  /**
   * Update range mode segmented inputs
   */
  private _updateRangeSegmentedInput(state: KTDatepickerState): void {
    if (this._cachedElements.startContainer && state.selectedRange?.start) {
      this._updateDateSegmentsInContainer(state.selectedRange.start, this._cachedElements.startContainer);
    }

    if (this._cachedElements.endContainer && state.selectedRange?.end) {
      this._updateDateSegmentsInContainer(state.selectedRange.end, this._cachedElements.endContainer);
    }
  }

  /**
   * Update date segments in a specific container
   */
  private _updateDateSegmentsInContainer(date: Date, container: HTMLElement): void {
    // For range mode, we need to query within the specific container
    const yearElement = container.querySelector('[data-segment="year"]') as HTMLElement;
    const monthElement = container.querySelector('[data-segment="month"]') as HTMLElement;
    const dayElement = container.querySelector('[data-segment="day"]') as HTMLElement;

    if (yearElement) {
      yearElement.textContent = date.getFullYear().toString();
    }
    if (monthElement) {
      monthElement.textContent = (date.getMonth() + 1).toString().padStart(2, '0');
    }
    if (dayElement) {
      dayElement.textContent = date.getDate().toString().padStart(2, '0');
    }
  }

  /**
   * Update date segments (year, month, day)
   */
  private _updateDateSegments(date: Date): void {
    this._updateDateSegmentsInContainer(date, this._element);
  }

  /**
   * Update time segments
   */
  private _updateTimeSegments(time: TimeState): void {
    if (this._cachedElements.hourElement) {
      this._cachedElements.hourElement.textContent = time.hour.toString().padStart(2, '0');
    }
    if (this._cachedElements.minuteElement) {
      this._cachedElements.minuteElement.textContent = time.minute.toString().padStart(2, '0');
    }
    if (this._cachedElements.secondElement) {
      this._cachedElements.secondElement.textContent = time.second.toString().padStart(2, '0');
    }
    if (this._cachedElements.ampmElement) {
      this._cachedElements.ampmElement.textContent = time.hour >= 12 ? 'PM' : 'AM';
    }
  }

  /**
   * Update calendar display
   */
  private _updateCalendar(state: KTDatepickerState): void {
    if (!this._cachedElements.calendarElement) return;

    // Update date selection highlighting
    this._updateDateSelection(state, this._cachedElements.calendarElement);

    // Update navigation (month/year display)
    this._updateNavigation(state, this._cachedElements.calendarElement);
  }

  /**
   * Update date selection highlighting
   */
  private _updateDateSelection(state: KTDatepickerState, calendarElement: HTMLElement): void {
    // Clear previous selections
    const selectedCells = calendarElement.querySelectorAll('[data-selected]');
    selectedCells.forEach(cell => cell.removeAttribute('data-selected'));

    // Highlight selected date(s)
    if (state.selectedDate) {
      this._highlightDate(state.selectedDate, calendarElement);
    } else if (state.selectedRange) {
      this._highlightDateRange(state.selectedRange, calendarElement);
    } else if (state.selectedDates.length > 0) {
      state.selectedDates.forEach(date => this._highlightDate(date, calendarElement));
    }
  }

  /**
   * Highlight a specific date
   */
  private _highlightDate(date: Date, calendarElement: HTMLElement): void {
    const cell = this._findDayCell(date, calendarElement);
    if (cell) {
      cell.setAttribute('data-selected', 'true');
    }
  }

  /**
   * Highlight a date range
   */
  private _highlightDateRange(range: { start: Date | null; end: Date | null }, calendarElement: HTMLElement): void {
    if (range.start) {
      this._highlightDate(range.start, calendarElement);
    }
    if (range.end) {
      this._highlightDate(range.end, calendarElement);
    }
  }

  /**
   * Find day cell for a specific date
   */
  private _findDayCell(date: Date, calendarElement: HTMLElement): HTMLElement | null {
    const day = date.getDate();
    const cells = calendarElement.querySelectorAll('td[data-kt-datepicker-day]');

    for (const cell of Array.from(cells)) {
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
  private _updateNavigation(state: KTDatepickerState, calendarElement: HTMLElement): void {
    if (this._cachedElements.monthYearElement) {
      const month = state.currentDate.toLocaleDateString('en-US', { month: 'long' });
      const year = state.currentDate.getFullYear();
      this._cachedElements.monthYearElement.textContent = `${month} ${year}`;
    }
  }

  /**
   * Update time picker display
   */
  private _updateTimePicker(state: KTDatepickerState): void {
    if (!this._cachedElements.timePickerElement || !state.selectedTime) return;

    if (this._cachedElements.timeDisplay) {
      const timeString = `${state.selectedTime.hour.toString().padStart(2, '0')}:${state.selectedTime.minute.toString().padStart(2, '0')}:${state.selectedTime.second.toString().padStart(2, '0')}`;
      this._cachedElements.timeDisplay.textContent = timeString;
    }
  }


  /**
   * Fire events based on state changes using the centralized event system
   */
  private _fireEvents(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    // Fire onChange when selected date changes
    if (newState.selectedDate !== oldState.selectedDate ||
        newState.selectedRange?.start !== oldState.selectedRange?.start ||
        newState.selectedRange?.end !== oldState.selectedRange?.end ||
        JSON.stringify(newState.selectedDates) !== JSON.stringify(oldState.selectedDates)) {

      let selectedValue: Date | null = null;

      if (this._config.range && newState.selectedRange) {
        // For range mode, pass the end date if both are selected, otherwise null
        selectedValue = newState.selectedRange.end || newState.selectedRange.start;
      } else if (this._config.multiDate && newState.selectedDates.length > 0) {
        // For multi-date mode, pass the last selected date
        selectedValue = newState.selectedDates[newState.selectedDates.length - 1];
      } else {
        // For single date mode
        selectedValue = newState.selectedDate;
      }

      this._fireDatepickerEvent('onChange', selectedValue, this);
    }

    // Fire onOpen when dropdown opens
    if (newState.isOpen && !oldState.isOpen) {
      this._fireDatepickerEvent('onOpen', this);
    }

    // Fire onClose when dropdown closes
    if (!newState.isOpen && oldState.isOpen) {
      this._fireDatepickerEvent('onClose', this);
    }
  }

  /**
   * Centralized event firing system - safely dispatches events with error handling
   */
  private _fireDatepickerEvent(eventName: keyof KTDatepickerConfig, ...args: any[]): void {
    try {
      const eventHandler = this._config[eventName] as Function;
      if (typeof eventHandler === 'function') {
        eventHandler(...args);
      }
    } catch (error) {
      // Don't let event handler errors break the datepicker
    }
  }

  // --- Mode-specific helpers ---
  /** Initialize single date from config */
  private _initSingleDateFromConfig() {
    if (this._config.value) {
      const date = new Date(this._config.value);
      this._unifiedStateManager.setSelectedDate(date, 'config');
      this._unifiedStateManager.setCurrentDate(date, 'config');
    }
  }

  /** Initialize range from config */
  private _initRangeFromConfig() {
    if (this._config.valueRange) {
      const start = this._config.valueRange.start ? new Date(this._config.valueRange.start) : null;
      const end = this._config.valueRange.end ? new Date(this._config.valueRange.end) : null;
      this._unifiedStateManager.setSelectedRange({ start, end }, 'config');
    }
  }

  /** Initialize multi-date from config */
  private _initMultiDateFromConfig() {
    if (Array.isArray(this._config.values)) {
      const dates = this._config.values.map((v: any) => new Date(v));
      this._unifiedStateManager.setSelectedDates(dates, 'config');
    }
  }

  /** Format single date for input */
  private _formatSingleDate(date: Date): string {
    if (!date) return '';

    // If time is enabled, include time in the format
    if (this._config.enableTime) {
      if (this._config.format && typeof this._config.format === 'string') {
        // Check if format already includes time tokens
        const hasTimeTokens = /[Hhms]/.test(this._config.format);
        if (hasTimeTokens) {
          return this._formatDate(date, this._config.format);
        } else {
          // Add time format based on granularity and format
          const timeFormat = this._getTimeFormat();
          const dateFormat = this._config.format;
          return this._formatDate(date, `${dateFormat} ${timeFormat}`);
        }
      } else {
        // Default format with time
        const timeFormat = this._getTimeFormat();
        return `${date.toLocaleDateString(this._config.locale || 'en-US')} ${this._formatDate(date, timeFormat)}`;
      }
    } else {
      // Time not enabled, use original logic
      if (this._config.format && typeof this._config.format === 'string') {
        return this._formatDate(date, this._config.format);
      } else if (this._config.locale) {
        return date.toLocaleDateString(this._config.locale);
      } else {
        return date.toLocaleDateString();
      }
    }
  }

  /**
   * Get time format string based on granularity and time format
   * @returns Time format string
   */
  private _getTimeFormat(): string {
    const granularity = this._unifiedStateManager.getState().timeGranularity || 'minute';
    const timeFormat = this._config.timeFormat || '24h';

    switch (granularity) {
      case 'hour':
        return timeFormat === '12h' ? 'HH a' : 'HH';
      case 'minute':
        return timeFormat === '12h' ? 'HH:mm a' : 'HH:mm';
      case 'second':
        return timeFormat === '12h' ? 'HH:mm:ss a' : 'HH:mm:ss';
      default:
        return timeFormat === '12h' ? 'HH:mm a' : 'HH:mm';
    }
  }

  /** Format range for input */
  private _formatRange(start: Date | null, end: Date | null): string {
    if (start && end) {
      return `${this._formatSingleDate(start)} – ${this._formatSingleDate(end)}`;
    } else if (start) {
      return this._formatSingleDate(start);
    }
    return '';
  }

  /** Format multi-date for input */
  private _formatMultiDate(dates: Date[]): string {
    return dates.map((d) => this._formatSingleDate(d)).join(', ');
  }



  /** Select a single date */
  private _selectSingleDate(date: Date) {
    // Preserve time if time is enabled and we have a selected time
    if (this._config.enableTime && this._unifiedStateManager.getState().selectedTime) {
      const dateWithTime = applyTimeToDate(date, this._unifiedStateManager.getState().selectedTime);
      this._unifiedStateManager.setSelectedDate(dateWithTime, 'calendar');
    } else {
      this._unifiedStateManager.setSelectedDate(date, 'calendar');
    }

    // Dispatch change event
    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
  }

  /**
   * Select a range date (calendar click or segmented input change)
   * Updates both segmented inputs and internal state.
   */
  private _selectRangeDate(date: Date) {
    const currentState = this._unifiedStateManager.getState();
    const newRange = updateRangeSelection(currentState.selectedRange, date);
    this._unifiedStateManager.setSelectedRange(newRange, 'calendar');

    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
  }

  /** Select a multi-date */
  private _selectMultiDate(date: Date) {
    const currentState = this._unifiedStateManager.getState();
    const currentDates = currentState.selectedDates || [];
    const exists = currentDates.some((d) => d.getTime() === date.getTime());
    let newDates: Date[];

    if (exists) {
      newDates = currentDates.filter((d) => d.getTime() !== date.getTime());
    } else {
      newDates = [...currentDates, date];
    }

    this._unifiedStateManager.setSelectedDates(newDates, 'calendar');

    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
  }

  /** Handler for Apply button in multi-date mode */
  private _onApplyMultiDate = (e: Event) => {
    // Apply button clicked in multi-date mode
  };

  private _onToday = (e: Event) => {
    e.preventDefault();
    const today = new Date();
    this.setDate(today);
  };

  // Stub for _onClear (to be implemented next)
  private _onClear = (e: Event) => {
    e.preventDefault();
    // Clear all selection states using unified state manager
    this._unifiedStateManager.updateState({
      selectedDate: null,
      selectedRange: { start: null, end: null },
      selectedDates: [],
      selectedTime: null
    }, 'clear');

    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
  };

  // Stub for _onApply (to be implemented next)
  private _onApply = (e: Event) => {
    e.preventDefault();
    // For multi-date, update input value (already handled by selection logic)
  };

  /**
   * Centralized keyboard event handler for all datepicker keyboard interactions.
   * Handles navigation, selection, and closing for input, calendar, and popover.
   * Covers: Tab, Shift+Tab, Arrow keys, Enter, Space, Escape, Home, End, PageUp, PageDown.
   */
  private _onKeyDown = (e: KeyboardEvent) => {
    if (!this._unifiedStateManager.isDropdownOpen()) return;
    const target = e.target as HTMLElement;

    // Check if segmented input is focused - let it handle its own keyboard events
    if (target.closest('[data-segment]')) {
      return; // Let segmented input handle its own keyboard events
    }

    // Handle Escape key
    if (e.key === 'Escape') {
      e.preventDefault();
      return;
    }
    // Handle Tab/Shift+Tab: allow normal tabbing, but trap focus within dropdown if needed
    if (e.key === 'Tab') {
      // Optionally implement focus trap if required
      return;
    }
    // Handle Arrow keys, Home/End, PageUp/PageDown for calendar grid navigation
    const isCalendarGrid = target.closest('[data-kt-datepicker-calendar-grid]');
    if (isCalendarGrid) {
      // Find all day buttons
      const dayButtons = Array.from(isCalendarGrid.querySelectorAll('button[data-day]')) as HTMLButtonElement[];
      const currentIndex = dayButtons.findIndex(btn => btn === target);
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight') nextIndex = Math.min(dayButtons.length - 1, currentIndex + 1);
      if (e.key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1);
      if (e.key === 'ArrowDown') nextIndex = Math.min(dayButtons.length - 1, currentIndex + 7);
      if (e.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 7);
      if (e.key === 'Home') nextIndex = Math.floor(currentIndex / 7) * 7;
      if (e.key === 'End') nextIndex = Math.min(dayButtons.length - 1, Math.floor(currentIndex / 7) * 7 + 6);
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        // Change month and focus first day
        this._changeMonth(e.key === 'PageUp' ? -1 : 1);
        setTimeout(() => {
          const newGrid = this._element.querySelector('[data-kt-datepicker-calendar-grid]');
          if (newGrid) {
            const newButtons = Array.from(newGrid.querySelectorAll('button[data-day]')) as HTMLButtonElement[];
            if (newButtons.length > 0) {
              // Set roving tabindex
              newButtons.forEach((btn, idx) => btn.tabIndex = idx === 0 ? 0 : -1);
              newButtons[0].focus();
            }
          }
        }, 0);
        e.preventDefault();
        return;
      }
      if (nextIndex !== currentIndex && dayButtons[nextIndex]) {
        // Set roving tabindex
        dayButtons.forEach((btn, idx) => btn.tabIndex = idx === nextIndex ? 0 : -1);
        dayButtons[nextIndex].focus();
        e.preventDefault();
        return;
      }
      // Enter/Space: select date
      if (e.key === 'Enter' || e.key === ' ') {
        dayButtons[currentIndex]?.click();
        // Optionally announce selection to screen reader
        const liveRegion = this._element.querySelector('[data-kt-datepicker-live]');
        if (liveRegion && dayButtons[currentIndex]) {
          liveRegion.textContent = `Selected ${dayButtons[currentIndex].getAttribute('aria-label')}`;
        }
        e.preventDefault();
        return;
      }
    }
    // Handle navigation for header buttons (prev/next month)
    if (target.hasAttribute('data-kt-datepicker-prev') || target.hasAttribute('data-kt-datepicker-next')) {
      if (e.key === 'Enter' || e.key === ' ') {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        // Optionally announce navigation to screen reader
        const liveRegion = this._element.querySelector('[data-kt-datepicker-live]');
        if (liveRegion) {
          liveRegion.textContent = target.hasAttribute('data-kt-datepicker-prev') ? 'Previous month' : 'Next month';
        }
        e.preventDefault();
        return;
      }
    }
    // Handle footer buttons (today, clear, apply)
    if (target.hasAttribute('data-kt-datepicker-today') || target.hasAttribute('data-kt-datepicker-clear') || target.hasAttribute('data-kt-datepicker-apply')) {
      if (e.key === 'Enter' || e.key === ' ') {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        // Optionally announce action to screen reader
        const liveRegion = this._element.querySelector('[data-kt-datepicker-live]');
        if (liveRegion) {
          if (target.hasAttribute('data-kt-datepicker-today')) liveRegion.textContent = 'Today selected';
          if (target.hasAttribute('data-kt-datepicker-clear')) liveRegion.textContent = 'Selection cleared';
          if (target.hasAttribute('data-kt-datepicker-apply')) liveRegion.textContent = 'Selection applied';
        }
        e.preventDefault();
        return;
      }
    }
  };

  /**
   * Constructor: Initializes the datepicker component
   */
  constructor(element: HTMLElement, config?: KTDatepickerConfig) {
    super();

    // Generate unique instance ID
    this._instanceId = `datepicker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add instance ID to element for debugging
    element.setAttribute('data-kt-datepicker-instance-id', this._instanceId);

    this._init(element);

    // Build config using the standard KTComponent approach
    this._buildConfig(config);
    this._templateSet = getTemplateStrings(this._config);
    this._templateRenderer = createTemplateRenderer(this._templateSet);

    // Initialize unified state manager
    this._unifiedStateManager = new KTDatepickerUnifiedStateManager({
      enableValidation: true,
      enableDebugging: this._config.debug || false,
      enableUpdateBatching: true,
      batchDelay: 16
    });

        // Subscribe to state changes
    this._unsubscribeFromState = this._unifiedStateManager.subscribe(this);





    // Set placeholder from config if available
    if (this._input && this._config.placeholder) {
      this._input.setAttribute('placeholder', this._config.placeholder);
    }
    // Set disabled state from config if available
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');

      // Also set disabled state in unified state manager
      this._unifiedStateManager.setDropdownDisabled(true, 'config');
    }
    // --- Time initialization ---
    if (this._config.enableTime) {
      this._unifiedStateManager.updateState({
        timeGranularity: this._config.timeGranularity || 'minute'
      }, 'config');

      // Initialize time from selected date or current time
      const baseDate = this._unifiedStateManager.getState().selectedDate || this._unifiedStateManager.getState().currentDate || new Date();
      this._unifiedStateManager.setSelectedTime(dateToTimeState(baseDate), 'config');
    }

    // --- Mode-specific initialization ---
    if (this._config.range && this._config.valueRange) {
      this._initRangeFromConfig();
    } else if (this._config.multiDate && Array.isArray(this._config.values)) {
      this._initMultiDateFromConfig();
    } else if (this._config.value) {
      this._initSingleDateFromConfig();
    }
    // --- Input focus event for showOnFocus ---
    if (this._input) {
      this._eventManager.addListener(this._input, 'focus', this._onInputFocus);
    }

    // --- Document click event for outside click detection ---
    this._eventManager.addListener(
      document as unknown as HTMLElement,
      'click',
      this._handleDocumentClick
    );

    (element as any).instance = this;
    this._render();
  }

  /**
   * Handler for input focus event, opens the datepicker if showOnFocus is true and input is not disabled/readonly
   */
  private _onInputFocus = (e: FocusEvent) => {
    if (!this._input) return;
    if (this._input.hasAttribute('disabled') || this._input.hasAttribute('readonly')) return;
    if (this._config.showOnFocus) {
      this.open();
    }
  };

  /**
   * Handler for document click event, closes the datepicker if click is outside the component
   */
  private _handleDocumentClick = (e: MouseEvent): void => {
    // Skip if click-outside is disabled
    if (!this._config.closeOnOutsideClick) return;

    // Skip if dropdown is not open
    if (!this._unifiedStateManager.isDropdownOpen()) return;

    const targetElement = e.target as HTMLElement;

    // Check if click is outside the datepicker element
    if (!this._element.contains(targetElement)) {
      this.close();
    }
  };

  protected _init(element: HTMLElement) {
    this._element = element;
    // Find or assign the input
    this._input = this._element.querySelector('input[data-kt-datepicker-input]');
    if (!this._input) {
      // Fallback: find the first input and add the attribute
      const firstInput = this._element.querySelector('input');
      if (firstInput) {
        firstInput.setAttribute('data-kt-datepicker-input', '');
        this._input = firstInput;
      } else {
        // If no input exists, create one and append
        const newInput = document.createElement('input');
        newInput.setAttribute('data-kt-datepicker-input', '');
        this._element.appendChild(newInput);
        this._input = newInput;
      }
    }
  }

  /**
   * Build config by merging defaults and user config
   */
  protected override _buildConfig(config?: KTDatepickerConfig) {
    // First call parent to read data attributes
    super._buildConfig(config);

    // Merge templates separately to ensure correct type
    const mergedTemplates = {
      ...defaultTemplates,
      ...(this._config.templates || {}),
      ...(this._userTemplates || {})
    };
    // Determine closeOnSelect default based on mode and requirements
    let closeOnSelect: boolean;
    if (typeof this._config.closeOnSelect !== 'undefined') {
      // User explicitly set closeOnSelect, respect their choice
      closeOnSelect = this._config.closeOnSelect!;
    } else if (this._config.enableTime) {
      // Time-enabled: never close on date selection
      closeOnSelect = false;
    } else if (this._config.range) {
      // Range mode: handle clicks inside dropdown
      closeOnSelect = false;
    } else if (this._config.multiDate) {
      // Multi-date mode: don't close on individual selections
      closeOnSelect = false;
    } else {
      // Single date only: close on date click
      closeOnSelect = true;
    }

    // Merge with data attributes and passed config
    // Important: data attributes (this._config) must come after defaults to override them
    this._config = {
      ...defaultDatepickerConfig,
      ...this._config,  // Data attributes override defaults
      ...(config || {}),
      templates: mergedTemplates,
      closeOnSelect,
    };

    // Initialize event manager
    this._eventManager = new EventManager();

    // Initialize focus manager for keyboard navigation
    this._focusManager = new FocusManager({
      enableFocusTrapping: true,
      enableFocusRestoration: true,
      enableKeyboardNavigation: true,
      enableDebugging: this._config.debug || false
    });
  }

  /**
   * Public method to set/override templates at runtime (supports string or function)
   */
  public setTemplates(templates: Record<string, string | ((data: any) => string)>) {
    this._userTemplates = { ...this._userTemplates, ...templates };
    this._templateSet = getTemplateStrings(this._config);
    this._templateRenderer.updateTemplates(this._templateSet);
    this._render();
  }

  /**
   * Render the main container and set this._container
   */
  private _renderContainer(): HTMLElement {
    const containerEl = this._templateRenderer.renderTemplateToElement({
      templateKey: 'container',
      data: {},
      configClasses: this._config.classes
    });
    this._container = containerEl;
    return containerEl;
  }

  /**
   * Render the input wrapper and calendar button, move/create input element
   * In range mode, renders two segmented inputs (start/end) using the segmentedDateRangeInput template.
   */
  private _renderInputWrapper(calendarButtonHtml: string): HTMLElement {
    const inputWrapperTpl = this._templateSet.inputWrapper || defaultTemplates.inputWrapper;
    if (this._input && this._input.parentNode) {
      this._input.parentNode.removeChild(this._input);
    }
    if (this._config.range) {
      const rangeTpl = this._templateSet.segmentedDateRangeInput || defaultTemplates.segmentedDateRangeInput;
      const { inputWrapperEl, startContainer, endContainer } = renderRangeSegmentedInputUI(inputWrapperTpl, rangeTpl, calendarButtonHtml, this._config);
      instantiateRangeSegmentedInputs(
        startContainer,
        endContainer,
        this._unifiedStateManager.getState(),
        this._config,
        (date: Date) => {
          const end = this._unifiedStateManager.getState().selectedRange?.end || null;
          let newEnd = end;
          if (end && date > end) newEnd = null;
          this._unifiedStateManager.updateState({ selectedRange: { start: date, end: newEnd } }, 'range-selection');
          this._render();
        },
        (date: Date) => {
          const start = this._unifiedStateManager.getState().selectedRange?.start || null;
          let newStart = start;
          if (start && date < start) newStart = null;
          this._unifiedStateManager.updateState({ selectedRange: { start: newStart, end: date } }, 'range-selection');
          this._render();
        }
      );
      return inputWrapperEl;
    }
    // Single-date mode
    const inputWrapperEl = renderSingleSegmentedInputUI(inputWrapperTpl, calendarButtonHtml, this._config);

    // Find the segmented input container that was rendered by the template system
    const segmentedInputContainer = inputWrapperEl.querySelector('[data-kt-datepicker-segmented-input]') as HTMLElement;

    instantiateSingleSegmentedInput(segmentedInputContainer as HTMLElement, this._unifiedStateManager.getState(), this._config, (date: Date) => {
      this.setDate(date);
    });
    return inputWrapperEl;
  }

  /**
   * Bind event listener to the calendar button in the input wrapper
   */
  private _bindCalendarButtonEvent(inputWrapperEl: HTMLElement) {
    const buttonEl = inputWrapperEl.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (buttonEl && buttonEl instanceof HTMLButtonElement) {
      buttonEl.type = 'button';
      buttonEl.setAttribute('aria-label', this._config.calendarButtonAriaLabel || 'Open calendar');
      buttonEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this._config.disabled || buttonEl.hasAttribute('disabled')) {
          return;
        }
        this.toggle();
      });
    }
  }

  /**
   * Render the dropdown container from template
   */
  private _renderDropdown(): HTMLElement {
    const dropdownEl = this._templateRenderer.renderTemplateToElement({
      templateKey: 'dropdown',
      data: {},
      configClasses: this._config.classes
    });
    dropdownEl.setAttribute('data-kt-datepicker-dropdown', '');

    // Add instance association for better identification
    if (this._instanceId) {
      dropdownEl.setAttribute('data-kt-datepicker-instance-id', this._instanceId);
    }

    if (!this._unifiedStateManager.isDropdownOpen()) {
      dropdownEl.classList.add('hidden');
    }
    return dropdownEl;
  }

  /**
   * Render header, calendar, and footer into the dropdown element
   */
  private _renderDropdownContent(dropdownEl: HTMLElement) {
    const visibleMonths = this._config.visibleMonths ?? 1;

    if (visibleMonths === 1) {
      this._renderSingleMonth(dropdownEl);
    } else {
      this._renderMultiMonth(dropdownEl, visibleMonths);
    }

    // --- Render footer using template-driven buttons (conditional by mode) ---
    const isRange = !!this._config.range;
    const isMultiDate = !!this._config.multiDate;
    const showFooter = isRange || isMultiDate;
    if (showFooter) {
      let todayButtonHtml: string | undefined = undefined;
      let clearButtonHtml: string | undefined = undefined;
      let applyButtonHtml: string | undefined = undefined;
      const todayButtonTpl = this._templateSet.todayButton || defaultTemplates.todayButton;
      const clearButtonTpl = this._templateSet.clearButton || defaultTemplates.clearButton;
      const applyButtonTpl = this._templateSet.applyButton || defaultTemplates.applyButton;
      // Only show Today/Clear if explicitly enabled in config/templates
      if (this._config.showTodayButton) {
        todayButtonHtml = typeof todayButtonTpl === 'function' ? todayButtonTpl({}) : todayButtonTpl;
      }
      if (this._config.showClearButton) {
        clearButtonHtml = typeof clearButtonTpl === 'function' ? clearButtonTpl({}) : clearButtonTpl;
      }
      // Always show Apply in range/multi-date mode
      applyButtonHtml = typeof applyButtonTpl === 'function' ? applyButtonTpl({}) : applyButtonTpl;
      const footer = renderFooter(
        this._templateSet.footer,
        { todayButton: todayButtonHtml, clearButton: clearButtonHtml, applyButton: applyButtonHtml },
        this._onToday,
        this._onClear,
        this._onApply
      );
      dropdownEl.appendChild(footer);
    }

    // --- Render time picker if enabled ---
    const currentState = this._unifiedStateManager.getState();
    if (this._config.enableTime && currentState.selectedTime) {
      const timePickerContainer = this._templateRenderer.renderTemplateToElement({
        templateKey: 'timePickerWrapper',
        data: {},
        configClasses: this._config.classes
      });
      timePickerContainer.setAttribute('data-kt-datepicker-time-container', '');

      // Store the time picker renderer result
      this._timePickerRenderer = renderTimePicker(timePickerContainer, {
        time: currentState.selectedTime,
        granularity: currentState.timeGranularity,
        format: this._config.timeFormat || '24h',
        minTime: this._config.minTime,
        maxTime: this._config.maxTime,
        timeStep: this._config.timeStep || 1,
        disabled: !!this._config.disabled,
        onChange: (newTime: any) => {
          // Update unified state manager
          this._unifiedStateManager.updateState({
            selectedTime: newTime
          }, 'time-picker');

          // Apply time to selected date if exists
          const updatedState = this._unifiedStateManager.getState();
          if (updatedState.selectedDate) {
            const dateWithTime = applyTimeToDate(updatedState.selectedDate, newTime);
            this._unifiedStateManager.updateState({
              selectedDate: dateWithTime
            }, 'time-picker');
          }

          // Update the time picker renderer with the new state
          if (this._timePickerRenderer) {
            this._timePickerRenderer.update(newTime);
          }
        },
        templates: this._templateSet
      });

      dropdownEl.appendChild(timePickerContainer);
    }
  }

  /**
   * Render single month calendar
   */
  private _renderSingleMonth(dropdownEl: HTMLElement) {
    let prevButtonHtml: string;
    let nextButtonHtml: string;
    const prevButtonTpl = this._templateSet.prevButton || defaultTemplates.prevButton;
    const nextButtonTpl = this._templateSet.nextButton || defaultTemplates.nextButton;
    prevButtonHtml = typeof prevButtonTpl === 'function' ? prevButtonTpl({}) : prevButtonTpl;
    nextButtonHtml = typeof nextButtonTpl === 'function' ? nextButtonTpl({}) : nextButtonTpl;

    const currentState = this._unifiedStateManager.getState();
    const header = renderHeader(
      this._templateSet.header,
      {
        month: currentState.currentDate.toLocaleString(this._config.locale, { month: 'long' }),
        year: currentState.currentDate.getFullYear(),
        prevButton: prevButtonHtml,
        nextButton: nextButtonHtml,
      },
      (e) => { e.stopPropagation(); this._changeMonth(-1); },
      (e) => { e.stopPropagation(); this._changeMonth(1); }
    );
    dropdownEl.appendChild(header);

    const dayClickHandler = (day: Date) => {
      this.setDate(day);

    };

    const calendar = renderCalendar(
      this._templateSet.dayCell,
      this._getCalendarDays(currentState.currentDate),
      currentState.currentDate,
      currentState.selectedDate,
      dayClickHandler,
      this._config.locale,
      this._config.range ? currentState.selectedRange : undefined
    );
    dropdownEl.appendChild(calendar);
  }

  /**
   * Get array of dates for multi-month display
   * @param baseDate - The base date to calculate months from
   * @param count - Number of months to generate
   * @returns Array of dates representing the first day of each month
   */
  private _getMultiMonthDates(baseDate: Date, count: number): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
      const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      dates.push(monthDate);
    }
    return dates;
  }

  /**
   * Render a single calendar month for multi-month display
   * @param monthDate - The date representing the month to render
   * @param index - Index of this month in the multi-month display
   * @param totalMonths - Total number of months being displayed
   * @returns HTMLElement containing the rendered month
   */
  private _renderMultiMonthCalendar(monthDate: Date, index: number, totalMonths: number): HTMLElement {
    // Navigation buttons: only first gets prev, only last gets next
    let prevButtonHtml = '';
    let nextButtonHtml = '';
    if (index === 0) {
      const prevButtonTpl = this._templateSet.prevButton || defaultTemplates.prevButton;
      prevButtonHtml = typeof prevButtonTpl === 'function' ? prevButtonTpl({}) : prevButtonTpl;
    }
    if (index === totalMonths - 1) {
      const nextButtonTpl = this._templateSet.nextButton || defaultTemplates.nextButton;
      nextButtonHtml = typeof nextButtonTpl === 'function' ? nextButtonTpl({}) : nextButtonTpl;
    }

    const header = renderHeader(
      this._templateSet.header,
      {
        month: monthDate.toLocaleString(this._config.locale, { month: 'long' }),
        year: monthDate.getFullYear(),
        prevButton: prevButtonHtml,
        nextButton: nextButtonHtml,
      },
      (e) => { e.stopPropagation(); this._changeMonth(-1); },
      (e) => { e.stopPropagation(); this._changeMonth(1); }
    );

    const calendar = renderCalendar(
      this._templateSet.dayCell,
      this._getCalendarDays(monthDate),
      monthDate,
      this._unifiedStateManager.getState().selectedDate,
      (day) => { this.setDate(day); },
      this._config.locale,
      this._config.range ? this._unifiedStateManager.getState().selectedRange : undefined
    );

    // Wrap header + calendar in a styled panel div using template
    const panel = this._templateRenderer.renderTemplateToElement({
      templateKey: 'panel',
      data: {
        header: header.outerHTML,
        calendar: calendar.outerHTML
      },
      configClasses: this._config.classes
    });

    return panel;
  }

  /**
   * Render multi-month calendar
   */
  private _renderMultiMonth(dropdownEl: HTMLElement, visibleMonths: number) {
    const currentState = this._unifiedStateManager.getState();
    const baseDate = new Date(currentState.currentDate);

    // Get all month dates for multi-month display
    const monthDates = this._getMultiMonthDates(baseDate, visibleMonths);

    // Render each month using the helper method and collect HTML
    const calendarsHtml = monthDates.map((monthDate, index) => {
      const panel = this._renderMultiMonthCalendar(monthDate, index, visibleMonths);
      return panel.outerHTML;
    }).join('');

    // Create multi-month container using template
    const multiMonthContainer = this._templateRenderer.renderTemplateToElement({
      templateKey: 'multiMonthContainer',
      data: {
        calendars: calendarsHtml
      },
      configClasses: this._config.classes
    });

    dropdownEl.appendChild(multiMonthContainer);
  }

  /**
   * Render the datepicker UI using templates
   */
  private _render() {
            // Store current state before rendering
    const wasOpen = this._unifiedStateManager.isDropdownOpen();
    const selectedDate = this._unifiedStateManager.getState().selectedDate;
    const selectedRange = this._unifiedStateManager.getState().selectedRange;
    const selectedDates = this._unifiedStateManager.getState().selectedDates;

    // Remove any previous container
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    // Render main container from template
    const containerEl = this._renderContainer();
    // Remove any previous input wrapper
    const existingWrapper = this._element.querySelector('[data-kt-datepicker-input-wrapper]');
    if (existingWrapper && existingWrapper.parentNode) {
      existingWrapper.parentNode.removeChild(existingWrapper);
    }
    // Render calendar button from template
    const calendarButtonTpl = this._templateSet.calendarButton || defaultTemplates.calendarButton;
    let calendarButtonHtml: string;
    if (typeof calendarButtonTpl === 'function') {
      const classData = mergeClassData('calendarButton', { ariaLabel: this._config.calendarButtonAriaLabel || 'Open calendar' }, this._config.classes);
      calendarButtonHtml = calendarButtonTpl(classData);
    } else {
      const classData = mergeClassData('calendarButton', { ariaLabel: this._config.calendarButtonAriaLabel || 'Open calendar' }, this._config.classes);
      calendarButtonHtml = renderTemplateString(calendarButtonTpl, classData);
    }
    // Render input wrapper and calendar button from template
    const inputWrapperEl = this._renderInputWrapper(calendarButtonHtml);
    // Attach calendar button event listener
    this._bindCalendarButtonEvent(inputWrapperEl);
    // Insert wrapper at the start of the element
    this._element.insertBefore(inputWrapperEl, this._element.firstChild);
    // --- Dropdown rendering and attachment ---
    // Remove any previous dropdown
    const existingDropdown = this._element.querySelector('[data-kt-datepicker-dropdown]');
    if (existingDropdown && existingDropdown.parentNode) {
      existingDropdown.parentNode.removeChild(existingDropdown);
    }
    // Render dropdown from template system (never inline)
    const dropdownEl = this._renderDropdown();
    this._renderDropdownContent(dropdownEl);
    this._attachDropdown(inputWrapperEl, dropdownEl);

    // Restore state
    this._unifiedStateManager.updateState({
      selectedDate,
      selectedRange,
      selectedDates
    }, 'render-restore');

    // Restore open state
    if (wasOpen) {
      this._unifiedStateManager.setDropdownOpen(true, 'render-restore');
      // The dropdown module will automatically open via observer pattern
    }


    this._updatePlaceholder();
    this._updateDisabledState();
    this._enforceMinMaxDates();
    // Attach keyboard event listeners
    if (this._input) {
      this._eventManager.removeListener(this._input, 'keydown', this._onKeyDown);
      this._eventManager.addListener(this._input, 'keydown', this._onKeyDown);
    }
    if (dropdownEl) {
      this._eventManager.removeListener(dropdownEl, 'keydown', this._onKeyDown);
      this._eventManager.addListener(dropdownEl, 'keydown', this._onKeyDown);
    }
    // Ensure live region exists
    let liveRegion = this._element.querySelector('[data-kt-datepicker-live]');
    if (!liveRegion) {
      liveRegion = this._templateRenderer.renderTemplateToElement({
        templateKey: 'liveRegion',
        data: {},
        configClasses: this._config.classes
      });
      this._element.appendChild(liveRegion);
    }

    // Initialize DOM element cache after rendering
    this._initializeElementCache();
  }

  /**
   * Attach the dropdown after the input wrapper
   */
  private _attachDropdown(inputWrapperEl: HTMLElement, dropdownEl: HTMLElement) {
    // Clean up existing dropdown module
    if (this._dropdownModule) {
      this._dropdownModule.dispose();
    }

    // Always attach dropdown element to DOM first
    if (inputWrapperEl.nextSibling) {
      this._element.insertBefore(dropdownEl, inputWrapperEl.nextSibling);
    } else {
      this._element.appendChild(dropdownEl);
    }

    // Find the toggle element (calendar button)
    const toggleElement = this._element.querySelector('button[data-kt-datepicker-calendar-btn]') as HTMLElement;

    if (toggleElement) {
      // Create new dropdown module
      this._dropdownModule = new KTDatepickerDropdown(
        this._element,
        toggleElement,
        dropdownEl,
        this._config
      );

      // Connect dropdown module to unified state manager
      if (this._dropdownModule) {
        this._dropdownModule.setUnifiedStateManager(this._unifiedStateManager);
        this._unifiedStateManager.subscribe(this._dropdownModule);
      }
    }
  }

  private _getCalendarDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    // Start from Sunday of the first week
    let start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    // End at Saturday of the last week
    let end = new Date(lastDay);
    end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  private _isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

      private _changeMonth(offset: number) {
    const currentState = this._unifiedStateManager.getState();
    const d = new Date(currentState.currentDate);
    d.setMonth(d.getMonth() + offset);

    // Update the unified state manager and wait for state to propagate
    this._unifiedStateManager.updateState({
      currentDate: d
    }, 'month-navigation');

    // Ensure state is fully updated before proceeding
    setTimeout(() => {
      // Force a state refresh to ensure we have the latest state
      const updatedState = this._unifiedStateManager.getState();

      // Check if the state actually changed
      if (updatedState.currentDate.getMonth() === d.getMonth()) {
        // Use multi-month update if multiple months are visible
        if (this._config.visibleMonths && this._config.visibleMonths > 1) {
          this._updateMultiMonthCalendarContent();
        } else {
          this._updateCalendarContent();
        }
      } else {
        // Wait a bit more for state to propagate
        setTimeout(() => {
          if (this._config.visibleMonths && this._config.visibleMonths > 1) {
            this._updateMultiMonthCalendarContent();
          } else {
            this._updateCalendarContent();
          }
        }, 50);
      }
    }, 10);
  }

      /**
   * Update only the calendar content without recreating the dropdown
   * This preserves the dropdown state while updating the month view
   */
  private _updateCalendarContent() {
    // Instance-scoped dropdown element selection strategy
    let dropdownEl: HTMLElement | null = null;

    // First priority: find dropdown within current datepicker instance
    dropdownEl = this._element.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;

    // Second priority: if instance ID is available, find by instance ID
    if (!dropdownEl && this._instanceId) {
      dropdownEl = document.querySelector(`[data-kt-datepicker-dropdown][data-kt-datepicker-instance-id="${this._instanceId}"]`) as HTMLElement;
    }

    // Third priority: check dropdown module reference
    if (!dropdownEl && this._dropdownModule) {
      const dropdownModuleElement = (this._dropdownModule as any)._dropdownElement;
      if (dropdownModuleElement) {
        dropdownEl = dropdownModuleElement;
      }
    }

    // Final fallback: global search with warnings (only if no other instances exist)
    if (!dropdownEl) {
      const allDropdowns = document.querySelectorAll('[data-kt-datepicker-dropdown]');
      if (allDropdowns.length === 1) {
        // Only one dropdown exists globally, safe to use
        dropdownEl = allDropdowns[0] as HTMLElement;
      } else if (allDropdowns.length > 1) {
        // Multiple dropdowns exist - this could cause cross-instance issues
        this._render();
        return;
      } else {
        this._render();
        return;
      }
    }

    if (!dropdownEl) {
      // Fallback to full render if dropdown doesn't exist (should be rare)
      console.warn('[KTDatepicker] Dropdown element not found, falling back to full render');
      this._render();
      return;
    }

        // Clear existing calendar content and update only the calendar
    const calendarEl = dropdownEl.querySelector('[data-kt-datepicker-calendar-table]');
    if (calendarEl) {
      // Remove the old calendar
      calendarEl.remove();

      // Get current state - ensure we have the most up-to-date state
      const currentState = this._unifiedStateManager.getState();

            // Update the month/year display in the header with multiple selector strategies
      let monthYearEl = dropdownEl.querySelector('[data-kt-datepicker-month-year]');

      // Fallback selectors if primary selector fails
      if (!monthYearEl) {
        monthYearEl = dropdownEl.querySelector('[data-kt-datepicker-month]');
      }

      // Additional fallback: look for span containing month and year
      if (!monthYearEl) {
        const spans = dropdownEl.querySelectorAll('span');
        monthYearEl = Array.from(spans).find(span =>
          span.textContent && span.textContent.match(/[A-Za-z]+ \d{4}/)
        ) as HTMLElement;
      }

      // Final fallback: any span in header
      if (!monthYearEl) {
        const headerEl = dropdownEl.querySelector('[data-kt-datepicker-header]');
        if (headerEl) {
          monthYearEl = headerEl.querySelector('span') as HTMLElement;
        }
      }

      if (monthYearEl) {
        const newMonthYear = `${currentState.currentDate.toLocaleString(this._config.locale, { month: 'long' })} ${currentState.currentDate.getFullYear()}`;
        monthYearEl.textContent = newMonthYear;
      }

      // Render only the new calendar
      const dayClickHandler = (day: Date) => {
        this.setDate(day);
      };

      const newCalendar = renderCalendar(
        this._templateSet.dayCell,
        this._getCalendarDays(currentState.currentDate),
        currentState.currentDate,
        currentState.selectedDate,
        dayClickHandler,
        this._config.locale,
        this._config.range ? currentState.selectedRange : undefined
      );

      // Insert the new calendar after the header
      const headerEl = dropdownEl.querySelector('[data-kt-datepicker-header]');
      if (headerEl) {
        headerEl.insertAdjacentElement('afterend', newCalendar);
      } else {
        // Fallback: append to dropdown
        dropdownEl.appendChild(newCalendar);
      }
    } else {
      // If calendar element not found, fallback to full render
      console.warn('[KTDatepicker] Calendar element not found, falling back to full render');
      this._render();
    }
  }

  /**
   * Update multi-month calendar content without recreating the dropdown
   * This preserves the dropdown state while updating all visible months
   */
  private _updateMultiMonthCalendarContent() {
    // Instance-scoped dropdown element selection strategy
    let dropdownEl: HTMLElement | null = null;

    // First priority: find dropdown within current datepicker instance
    dropdownEl = this._element.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;

    // Second priority: if instance ID is available, find by instance ID
    if (!dropdownEl && this._instanceId) {
      dropdownEl = document.querySelector(`[data-kt-datepicker-dropdown][data-kt-datepicker-instance-id="${this._instanceId}"]`) as HTMLElement;
    }

    // Third priority: check dropdown module reference
    if (!dropdownEl && this._dropdownModule) {
      const dropdownModuleElement = (this._dropdownModule as any)._dropdownElement;
      if (dropdownModuleElement) {
        dropdownEl = dropdownModuleElement;
      }
    }

    // Final fallback: global search with warnings (only if no other instances exist)
    if (!dropdownEl) {
      const allDropdowns = document.querySelectorAll('[data-kt-datepicker-dropdown]');
      if (allDropdowns.length === 1) {
        // Only one dropdown exists globally, safe to use
        dropdownEl = allDropdowns[0] as HTMLElement;
      } else if (allDropdowns.length > 1) {
        // Multiple dropdowns exist - this could cause cross-instance issues
        this._render();
        return;
      } else {
        this._render();
        return;
      }
    }

    if (!dropdownEl) {
      // Fallback to full render if dropdown doesn't exist (should be rare)
      console.warn('[KTDatepicker] Dropdown element not found, falling back to full render');
      this._render();
      return;
    }

    // Get current state - ensure we have the most up-to-date state
    const currentState = this._unifiedStateManager.getState();
    const visibleMonths = this._config.visibleMonths || 1;

    // Find the multi-month container
    const multiMonthContainer = dropdownEl.querySelector('[data-kt-datepicker-multimonth-container]');
    if (!multiMonthContainer) {
      console.warn('[KTDatepicker] Multi-month container not found, falling back to full render');
      this._render();
      return;
    }

    // Clear existing multi-month content
    multiMonthContainer.innerHTML = '';

    // Get all month dates for multi-month display
    const monthDates = this._getMultiMonthDates(currentState.currentDate, visibleMonths);

    // Re-render each month using the helper method
    monthDates.forEach((monthDate, index) => {
      const panel = this._renderMultiMonthCalendar(monthDate, index, visibleMonths);
      multiMonthContainer.appendChild(panel);
    });

    console.log('[KTDatepicker] Multi-month calendar content updated successfully');
  }

  /**
   * Set the selected date (single, range, or multi-date)
   * @param date - The date to select
   */
  public setDate(date: Date) {
    console.log('🗓️ [KTDatepicker] setDate called with:', date);
    // Prevent selection if date is outside min/max
    if (this._config.minDate && date < new Date(this._config.minDate)) {
      console.log('🗓️ [KTDatepicker] setDate blocked: date is before minDate');
      return;
    }
    if (this._config.maxDate && date > new Date(this._config.maxDate)) {
      console.log('🗓️ [KTDatepicker] setDate blocked: date is after maxDate');
      return;
    }
    // Validate time constraints if time is enabled
    if (this._config.enableTime) {
      const timeState = dateToTimeState(date);
      const validation = validateTime(timeState, this._config.minTime, this._config.maxTime);
      if (!validation.isValid) {
        console.log('🗓️ [KTDatepicker] setDate blocked: time validation failed:', validation.error);
        return;
      }
    }
    if (this._config.multiDate) {
      this._selectMultiDate(date);
      return;
    }
    if (this._config.range) {
      this._selectRangeDate(date);
      return;
    }
    this._selectSingleDate(date);
  }

  private _formatDate(date: Date, format: string): string {
    /**
     * Formats a Date object according to the provided format string.
     * Supported tokens:
     *   yyyy - 4-digit year
     *   yy   - 2-digit year
     *   MM   - 2-digit month (01-12)
     *   M    - 1/2-digit month (1-12)
     *   dd   - 2-digit day (01-31)
     *   d    - 1/2-digit day (1-31)
     *   HH   - 2-digit hour (00-23)
     *   H    - 1/2-digit hour (0-23)
     *   mm   - 2-digit minute (00-59)
     *   m    - 1/2-digit minute (0-59)
     *   ss   - 2-digit second (00-59)
     *   s    - 1/2-digit second (0-59)
     * @param date Date to format
     * @param format Format string
     * @returns Formatted date string
     */
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return format
      .replace(/yyyy/g, date.getFullYear().toString())
      .replace(/yy/g, date.getFullYear().toString().slice(-2))
      .replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
      .replace(/M(?![a-zA-Z])/g, String(date.getMonth() + 1))
      .replace(/dd/g, String(date.getDate()).padStart(2, '0'))
      .replace(/d(?![a-zA-Z])/g, String(date.getDate()))
      .replace(/HH/g, String(date.getHours()).padStart(2, '0'))
      .replace(/H(?![a-zA-Z])/g, String(date.getHours()))
      .replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
      .replace(/m(?![a-zA-Z])/g, String(date.getMinutes()))
      .replace(/ss/g, String(date.getSeconds()).padStart(2, '0'))
      .replace(/s(?![a-zA-Z])/g, String(date.getSeconds()))
      .replace(/a/g, date.getHours() >= 12 ? 'PM' : 'AM');
  }

  /**
   * Get the selected date
   */
  public getDate(): Date | null {
    return this._unifiedStateManager.getState().selectedDate;
  }

  /**
   * Update the datepicker (re-render)
   */
  public update() {
    this._render();
  }

  /**
   * Clean up event listeners and DOM on destroy
   */
  public destroy() {
    console.log('🗓️ [KTDatepicker] destroy() called');

    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }

    // Clean up event manager
    this._eventManager.removeListener(
      document as unknown as HTMLElement,
      'click',
      this._handleDocumentClick
    );
    if (this._input) {
      this._eventManager.removeAllListeners(this._input);
    }

    // Clean up focus manager
    if (this._focusManager) {
      this._focusManager.dispose();
    }

    // Clean up dropdown module
    if (this._dropdownModule) {
      this._dropdownModule.dispose();
    }




    // Clean up unified state manager
    if (this._unsubscribeFromState) {
      this._unsubscribeFromState();
      this._unsubscribeFromState = null;
    }
    if (this._unifiedStateManager) {
      this._unifiedStateManager.dispose();
    }

    // Clean up element observer
    if (this._elementObserver) {
      this._elementObserver.disconnect();
      this._elementObserver = null;
    }

    // Clean up time picker renderer
    if (this._timePickerRenderer) {
      this._timePickerRenderer.cleanup();
      this._timePickerRenderer = null;
    }

    // Clear DOM element cache
    this._cachedElements = {
      calendarElement: null,
      timePickerElement: null,
      startContainer: null,
      endContainer: null,
      yearElement: null,
      monthElement: null,
      dayElement: null,
      hourElement: null,
      minuteElement: null,
      secondElement: null,
      ampmElement: null,
      monthYearElement: null,
      timeDisplay: null
    };

    (this._element as any).instance = null;
    console.log('🗓️ [KTDatepicker] destroy() completed');
  }

  /**
   * Start observing for dynamic element creation
   */
  private _startElementObservation(): void {
    if (this._elementObserver) {
      this._elementObserver.disconnect();
    }

    this._elementObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Segmented input elements are now handled by direct UI updates
            }
          });
        }
      });
    });

    this._elementObserver.observe(this._element, {
      childList: true,
      subtree: true
    });
  }


  /**
   * Update the input placeholder if no date is selected
   */
  private _updatePlaceholder() {
    const currentState = this._unifiedStateManager.getState();
    if (this._input && !currentState.selectedDate && this._config.placeholder) {
      this._input.setAttribute('placeholder', this._config.placeholder);
      console.log('🗓️ [KTDatepicker] _render: Placeholder set to:', this._config.placeholder);
    }
  }

  /**
   * Update the disabled state of the input and calendar button
   *
   * Accessibility rationale:
   * - When disabling the calendar button, set:
   *   - disabled attribute (removes from tab order, blocks interaction)
   *   - aria-disabled="true" (announces as disabled to screen readers)
   *   - tabindex="-1" (removes from tab order for extra safety)
   * - When enabling, remove these attributes.
   * This matches accessibility best practices and ensures the button is properly announced and not focusable when disabled.
   */
  private _updateDisabledState() {
    const calendarButton = this._element.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');
      if (calendarButton) {
        // Set disabled attribute
        calendarButton.setAttribute('disabled', 'true');
        // Set aria-disabled for screen readers
        calendarButton.setAttribute('aria-disabled', 'true');
        // Remove from tab order
        calendarButton.setAttribute('tabindex', '-1');
      }
      console.log('🗓️ [KTDatepicker] _render: Input and calendar button disabled');
    } else if (this._input) {
      this._input.removeAttribute('disabled');
      if (calendarButton) {
        // Remove disabled attribute
        calendarButton.removeAttribute('disabled');
        // Remove aria-disabled attribute
        calendarButton.removeAttribute('aria-disabled');
        // Restore tab order (remove tabindex)
        calendarButton.removeAttribute('tabindex');
      }
    }
  }

  /**
   * Update the segmented input UI to reflect current state
   */
  private _updateSegmentedInput(state: KTDatepickerState): void {
    const segmentedContainer = this._element.querySelector('[data-kt-datepicker-segmented-input]');
    if (!segmentedContainer) return;

    // Re-instantiate the segmented input with the current state
    // This will update the display without recreating the entire UI
    instantiateSingleSegmentedInput(
      segmentedContainer as HTMLElement,
      state,
      this._config,
      (date) => this._handleSegmentedInputChange(date)
    );
  }

  /**
   * Handle changes from the segmented input
   */
  private _handleSegmentedInputChange(date: Date): void {
    console.log('🗓️ [KTDatepicker] Segmented input change:', date);

    // When date changes from segmented input, also update the calendar view to show the selected date's month/year
    const currentState = this._unifiedStateManager.getState();
    const newCurrentDate = new Date(date.getFullYear(), date.getMonth(), 1); // First day of selected date's month

    // Prepare state updates
    const stateUpdates: Partial<KTDatepickerState> = {
      selectedDate: date,
      currentDate: newCurrentDate
    };

    // Update selectedTime if time is enabled
    if (this._config.enableTime) {
      stateUpdates.selectedTime = dateToTimeState(date);
    }

    // Update both selectedDate and currentDate to sync the calendar view
    // Use immediate update to ensure events fire synchronously
    this._unifiedStateManager.updateState(stateUpdates, 'segmented-input', true);

    // Update calendar content to sync dropdown even when closed
    this._updateCalendarContent();

    // Fire onChange event
    this._fireDatepickerEvent('onChange', date, this);
  }

  /**
   * Disable day buttons outside min/max date range
   */
  private _enforceMinMaxDates() {
    if (this._config.minDate || this._config.maxDate) {
      const minDate = this._config.minDate ? new Date(this._config.minDate) : null;
      const maxDate = this._config.maxDate ? new Date(this._config.maxDate) : null;
      const dayButtons = this._element.querySelectorAll('button[data-day]');
      dayButtons.forEach((btn) => {
        const day = parseInt(btn.getAttribute('data-day'), 10);
        const td = btn.closest('td[data-kt-datepicker-day]');
        if (!td) return;
        // Get the date for this cell
        const year = this._unifiedStateManager.getState().currentDate.getFullYear();
        const month = this._unifiedStateManager.getState().currentDate.getMonth();
        const date = new Date(year, month, day);
        let disabled = false;
        if (minDate && date < minDate) disabled = true;
        if (maxDate && date > maxDate) disabled = true;
        if (disabled) {
          btn.setAttribute('disabled', 'true');
          td.setAttribute('data-out-of-range', 'true');
        } else {
          btn.removeAttribute('disabled');
          td.removeAttribute('data-out-of-range');
        }
      });
    }
  }



  /**
   * Opens the datepicker dropdown.
   */
  public open() {
    if (this._unifiedStateManager.isDropdownOpen()) {
      console.log('🗓️ [KTDatepicker] open() skipped: already open');
      return;
    }
    if (this._config.disabled) {
      console.log('🗓️ [KTDatepicker] open() blocked: datepicker is disabled');
      return;
    }

    console.log('🗓️ [KTDatepicker] open() called, attempting to open dropdown');

    // Use unified state management
    const success = this._unifiedStateManager.setDropdownOpen(true, 'datepicker-open');
    if (!success) {
      console.log('🗓️ [KTDatepicker] open() blocked by state validation');
      return;
    }

    console.log('🗓️ [KTDatepicker] State manager open() successful, dropdown module:', this._dropdownModule);

    // Ensure dropdown content is rendered before opening
    const dropdownEl = this._element.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
    if (dropdownEl) {
      // Always render dropdown content to ensure it's up to date
      console.log('🗓️ [KTDatepicker] Rendering dropdown content before opening');
      this._renderDropdownContent(dropdownEl);
    }

    // Use dropdown module if available
    if (this._dropdownModule) {
      console.log('🗓️ [KTDatepicker] Dropdown module available, state change will trigger open');
      // The dropdown module will automatically open via observer pattern
    } else {
      console.log('🗓️ [KTDatepicker] No dropdown module, using fallback');
    }

    // Don't call _render() here as it recreates the dropdown module
    // The dropdown module handles its own visibility
  }

  /**
   * Closes the datepicker dropdown.
   */
      public close() {
    console.log('🗓️ [KTDatepicker] close() called, current state:', {
      stateManagerOpen: this._unifiedStateManager.isDropdownOpen(),
      dropdownModuleOpen: this._dropdownModule?.isOpen(),
      stateManagerState: this._unifiedStateManager.getDropdownState()
    });

    if (!this._unifiedStateManager.isDropdownOpen()) {
      console.log('🗓️ [KTDatepicker] close() skipped: already closed');
      return;
    }
    // Debug log with stack trace
    console.log('[KTDatepicker] close() called. Dropdown will close. Stack trace:', new Error().stack);

    // Use unified state management
    const success = this._unifiedStateManager.setDropdownOpen(false, 'datepicker-close');
    if (!success) {
      console.log('🗓️ [KTDatepicker] close() blocked by state validation');
      return;
    }

    console.log('🗓️ [KTDatepicker] State manager close() successful');

    // Use dropdown module if available
    if (this._dropdownModule) {
      console.log('🗓️ [KTDatepicker] Dropdown module available, state change will trigger close');
      // The dropdown module will automatically close via observer pattern
    } else {
      console.log('🗓️ [KTDatepicker] No dropdown module, using fallback');
    }

    // Don't call _render() here as it recreates the dropdown module
    // The dropdown module handles its own visibility
  }

  public toggle() {
    if (this._unifiedStateManager.isDropdownOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether the datepicker dropdown is currently open.
   */
  public isOpen(): boolean {
    return this._unifiedStateManager.isDropdownOpen();
  }

  /**
   * Returns the current state of the datepicker component.
   */
  public getState(): KTDatepickerState {
    return { ...this._unifiedStateManager.getState() };
  }

  /**
   * Returns the current dropdown state.
   */
  public getDropdownState(): DropdownState {
    return this._unifiedStateManager.getDropdownState();
  }

  /**
   * StateObserver implementation: Called when state changes
   */
  onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    this._handleStateChange(newState, oldState);
  }

  /**
   * StateObserver implementation: Returns update priority (lower = higher priority)
   */
  getUpdatePriority(): number {
    return 10; // Medium priority
  }

  /**
   * Handle state changes from the unified state manager
   */
  private _handleStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    console.log('🗓️ [KTDatepicker] _handleStateChange called:', { newState, oldState });

    // Skip UI updates if this is from segmented input arrow navigation
    if (typeof window !== 'undefined' && (window as any).__ktui_segmented_input_arrow_navigation) {
      console.log('🗓️ [KTDatepicker] Skipping UI update due to segmented input navigation');
      return;
    }

    // Update dropdown state if open/closed changed
    if (newState.isOpen !== oldState.isOpen) {
      if (this._dropdownModule) {
        console.log('🗓️ [KTDatepicker] Dropdown module available, state change will trigger open');
        // The dropdown module will automatically open via observer pattern
      } else {
        console.log('🗓️ [KTDatepicker] No dropdown module, using fallback');
      }

      // Don't call _render() here as it recreates the dropdown module
      // The dropdown module handles its own visibility
    }

    // Update disabled state
    if (newState.isDisabled !== oldState.isDisabled) {
      this._updateDisabledState();
    }

    // Update UI elements directly
    this._updateInput(newState);
    if (this._config.range) {
      this._updateRangeSegmentedInput(newState);
    } else {
    this._updateSegmentedInput(newState);
    }
    this._updateCalendar(newState);
    this._updateTimePicker(newState);

    // Fire events based on state changes
    this._fireEvents(newState, oldState);

    // Start observing for dynamic element creation
    this._startElementObservation();
  }

  // Static init method for auto-initialization
  public static init(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-kt-datepicker]');
    elements.forEach((el) => {
      if (!(el as any).instance) {
        new KTDatepicker(el);
      }
    });
  }
}

// Optionally, export a static init method for auto-initialization
export function initDatepickers() {
  const elements = document.querySelectorAll<HTMLElement>('[data-kt-datepicker]');
  elements.forEach((el) => {
    if (!(el as any).instance) {
      new KTDatepicker(el);
    }
  });
}