/*
 * datepicker.ts - Main implementation for KTDatepicker component
 * Provides single, range, and multi-date selection with segmented input UI.
 * Modular rendering and state helpers are imported from datepicker-helpers.ts.
 */

import KTComponent from '../component';
import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './types';
import { getTemplateStrings, defaultTemplates } from './templates';
import { getMergedTemplates } from './template-manager';
import { renderTemplateString, isTemplateFunction, renderTemplateToDOM, mergeClassData } from './utils/template';
import { defaultDatepickerConfig } from './config';
import { renderHeader } from './renderers/header';
import { renderCalendar } from './renderers/calendar';
import { renderFooter } from './renderers/footer';
import { renderTimePicker } from './renderers/time-picker';
import { EventManager, FocusManager } from '../select/utils';
import { KTDatepickerDropdown } from './dropdown';
// getInitialState moved to simple-state-manager
import { KTDatepickerSimpleStateManager as KTDropdownStateManager, DropdownState } from './simple-state-manager';
import { KTDropdownEventManager } from './event-manager';
import { SegmentedInput, SegmentedInputOptions } from './segmented-input';
import { parseDateFromFormat } from './date-utils';
import { dateToTimeState, applyTimeToDate, validateTime } from './time-utils';
import {
  renderSingleSegmentedInputUI,
  renderRangeSegmentedInputUI,
  instantiateSingleSegmentedInput,
  instantiateRangeSegmentedInputs,
  updateRangeSelection
} from './datepicker-helpers';

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
export class KTDatepicker extends KTComponent {
  protected override readonly _name: string = 'datepicker';
  protected override _config: KTDatepickerConfig;
  protected _state: KTDatepickerState;
  protected _templateSet: ReturnType<typeof getTemplateStrings>;
  private _userTemplates: Record<string, string | ((data: any) => string)> = {};

  private _container: HTMLElement;
  private _input: HTMLInputElement | null = null;
  private _eventManager: EventManager;
  private _focusManager: FocusManager | null = null;
  private _dropdownModule: KTDatepickerDropdown | null = null;
  private _dropdownStateManager: KTDropdownStateManager;
  private _dropdownEventManager: KTDropdownEventManager;

  // --- Mode-specific helpers ---
  /** Initialize single date from config */
  private _initSingleDateFromConfig() {
    if (this._config.value) {
      const date = new Date(this._config.value);
      this._state.selectedDate = date;
      this._state.currentDate = date;
      if (this._input) {
        this._input.value = this._formatSingleDate(date);
      }
    }
  }

  /** Initialize range from config */
  private _initRangeFromConfig() {
    if (this._config.valueRange) {
      const start = this._config.valueRange.start ? new Date(this._config.valueRange.start) : null;
      const end = this._config.valueRange.end ? new Date(this._config.valueRange.end) : null;
      this._state.selectedRange = { start, end };
      if (this._input) {
        this._input.value = this._formatRange(start, end);
      }
    }
  }

  /** Initialize multi-date from config */
  private _initMultiDateFromConfig() {
    if (Array.isArray(this._config.values)) {
      this._state.selectedDates = this._config.values.map((v: any) => new Date(v));
      if (this._input) {
        this._input.value = this._formatMultiDate(this._state.selectedDates);
      }
    }
  }

  /** Format single date for input */
  private _formatSingleDate(date: Date): string {
    if (!date) return '';
    if (this._config.format && typeof this._config.format === 'string') {
      return this._formatDate(date, this._config.format);
    } else if (this._config.locale) {
      return date.toLocaleDateString(this._config.locale);
    } else {
      return date.toLocaleDateString();
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
    if (this._config.enableTime && this._state.selectedTime) {
      const dateWithTime = applyTimeToDate(date, this._state.selectedTime);
      this._state.selectedDate = dateWithTime;
    } else {
      this._state.selectedDate = date;
    }
    this._state.currentDate = date;
    if (this._input) {
      this._input.value = this._formatSingleDate(this._state.selectedDate!);
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    console.log('[KTDatepicker] Single date selected:', date);
    this._render();
  }

  /**
   * Select a range date (calendar click or segmented input change)
   * Updates both segmented inputs and internal state.
   */
  private _selectRangeDate(date: Date) {
    this._state.selectedRange = updateRangeSelection(this._state.selectedRange, date);
    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    console.log('[KTDatepicker] Range date selected:', this._state.selectedRange);
    this._render();
  }

  /** Select a multi-date */
  private _selectMultiDate(date: Date) {
    if (!this._state.selectedDates) this._state.selectedDates = [];
    const exists = this._state.selectedDates.some((d) => d.getTime() === date.getTime());
    if (exists) {
      this._state.selectedDates = this._state.selectedDates.filter((d) => d.getTime() !== date.getTime());
    } else {
      this._state.selectedDates.push(date);
    }
    if (this._input) {
      this._input.value = this._formatMultiDate(this._state.selectedDates);
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    console.log('[KTDatepicker] Multi-date selected:', this._state.selectedDates);
    this._render();
  }

  /** Handler for Apply button in multi-date mode */
  private _onApplyMultiDate = (e: Event) => {
    console.log('[KTDatepicker] Apply button clicked in multi-date mode');
  };

  private _onToday = (e: Event) => {
    e.preventDefault();
    const today = new Date();
    this.setDate(today);
    console.log('[KTDatepicker] Today button clicked');
  };

  // Stub for _onClear (to be implemented next)
  private _onClear = (e: Event) => {
    e.preventDefault();
    // Clear all selection states
    this._state.selectedDate = null;
    this._state.selectedRange = { start: null, end: null };
    this._state.selectedDates = [];
    this._state.selectedTime = null;
    if (this._input) {
      this._input.value = '';
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    this._render();
    console.log('[KTDatepicker] Clear button clicked');
  };

  // Stub for _onApply (to be implemented next)
  private _onApply = (e: Event) => {
    e.preventDefault();
    // For multi-date, update input value (already handled by selection logic)
    console.log('[KTDatepicker] Apply button clicked');
  };

  /**
   * Centralized keyboard event handler for all datepicker keyboard interactions.
   * Handles navigation, selection, and closing for input, calendar, and popover.
   * Covers: Tab, Shift+Tab, Arrow keys, Enter, Space, Escape, Home, End, PageUp, PageDown.
   */
  private _onKeyDown = (e: KeyboardEvent) => {
    if (!this._dropdownStateManager.isOpen()) return;
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
    console.log('🗓️ [KTDatepicker] Constructor: element:', element);
    this._init(element);
    console.log('🗓️ [KTDatepicker] After _init, this._input:', this._input);
    // --- Data attribute config parsing ---
    let configFromAttr: Partial<KTDatepickerConfig> = {};
    const configAttr = element.getAttribute('data-kt-datepicker-config');
    if (configAttr) {
      try {
        configFromAttr = JSON.parse(configAttr);
      } catch (err) {
        console.warn('[KTDatepicker] Failed to parse data-kt-datepicker-config:', err);
      }
    }
    // --- Data attribute overrides for showOnFocus, closeOnSelect, enableTime, and range ---
    const showOnFocusAttr = element.getAttribute('data-kt-datepicker-show-on-focus');
    const closeOnSelectAttr = element.getAttribute('data-kt-datepicker-close-on-select');
    const enableTimeAttr = element.getAttribute('data-kt-datepicker-enable-time');
    const rangeAttr = element.getAttribute('data-kt-datepicker-range');
    let configWithAttrs = { ...configFromAttr, ...(config || {}) };
    if (showOnFocusAttr !== null) {
      configWithAttrs.showOnFocus = showOnFocusAttr === 'true' || showOnFocusAttr === '';
    }
    if (closeOnSelectAttr !== null) {
      configWithAttrs.closeOnSelect = closeOnSelectAttr === 'true' || closeOnSelectAttr === '';
    }
    if (enableTimeAttr !== null) {
      configWithAttrs.enableTime = enableTimeAttr === 'true' || enableTimeAttr === '';
    }
    if (rangeAttr !== null) {
      configWithAttrs.range = rangeAttr === 'true' || rangeAttr === '';
      console.log('[KTDatepicker] Range attribute processed:', rangeAttr, 'configWithAttrs.range:', configWithAttrs.range);
    }
    this._buildConfig(configWithAttrs);
    this._templateSet = getTemplateStrings(this._config);
    this._state = KTDropdownStateManager.getInitialDatepickerState();

    // Initialize centralized state management
    this._dropdownStateManager = new KTDropdownStateManager({
      enableValidation: true, // Re-enable validation with fixed rules
      enableDebugging: this._config.debug || false
    });

    this._dropdownEventManager = new KTDropdownEventManager(
      this._element,
      this._dropdownStateManager,
      {
        enableEventBubbling: true,
        enableCustomEvents: false, // Disable custom events to avoid conflicts
        enableValidation: true,
        enableDebugging: this._config.debug || false
      }
    );
    // Set placeholder from config if available
    if (this._input && this._config.placeholder) {
      this._input.setAttribute('placeholder', this._config.placeholder);
      console.log('🗓️ [KTDatepicker] Placeholder set to:', this._config.placeholder);
    }
    // Set disabled state from config if available
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');
      console.log('🗓️ [KTDatepicker] Input disabled from config');

      // Also set disabled state in state manager
      this._dropdownStateManager.disable('config');
    }
    // --- Time initialization ---
    if (this._config.enableTime) {
      this._state.timeGranularity = this._config.timeGranularity || 'minute';
      // Initialize time from selected date or current time
      const baseDate = this._state.selectedDate || this._state.currentDate || new Date();
      this._state.selectedTime = dateToTimeState(baseDate);
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
        console.log('🗓️ [KTDatepicker] Auto-added data-kt-datepicker-input to input:', this._input);
      } else {
        // If no input exists, create one and append
        const newInput = document.createElement('input');
        newInput.setAttribute('data-kt-datepicker-input', '');
        this._element.appendChild(newInput);
        this._input = newInput;
        console.log('🗓️ [KTDatepicker] Created and appended new input:', this._input);
      }
    }
  }

  /**
   * Build config by merging defaults and user config
   */
  protected override _buildConfig(config?: KTDatepickerConfig) {
    // Merge templates separately to ensure correct type
    const mergedTemplates = getMergedTemplates(
      (config && config.templates) || {},
      this._userTemplates || {}
    );
    // Determine closeOnSelect default based on mode and requirements
    let closeOnSelect: boolean;
    if (typeof (config && config.closeOnSelect) !== 'undefined') {
      // User explicitly set closeOnSelect, respect their choice
      closeOnSelect = config!.closeOnSelect!;
    } else if (config?.enableTime) {
      // Time-enabled: never close on date selection
      closeOnSelect = false;
    } else if (config?.range) {
      // Range mode: handle clicks inside dropdown
      closeOnSelect = false;
      console.log('[KTDatepicker] Range mode detected, setting closeOnSelect to false');
    } else if (config?.multiDate) {
      // Multi-date mode: don't close on individual selections
      closeOnSelect = false;
    } else {
      // Single date only: close on date click
      closeOnSelect = true;
    }
    this._config = {
      ...defaultDatepickerConfig,
      ...(config || {}),
      templates: mergedTemplates,
      closeOnSelect,
    };

    // Initialize event manager
    this._eventManager = new EventManager();

    // Initialize focus manager for keyboard navigation
    this._focusManager = new FocusManager(
      this._element,
      '[data-kt-datepicker-day] button, [data-kt-datepicker-today], [data-kt-datepicker-clear], [data-kt-datepicker-apply]'
    );
  }

  /**
   * Public method to set/override templates at runtime (supports string or function)
   */
  public setTemplates(templates: Record<string, string | ((data: any) => string)>) {
    this._userTemplates = { ...this._userTemplates, ...templates };
    this._templateSet = getTemplateStrings(this._config);
    this._render();
  }

  /**
   * Render the main container and set this._container
   */
  private _renderContainer(): HTMLElement {
    const tpl = this._templateSet.container || defaultTemplates.container;
    let html: string;
    if (isTemplateFunction(tpl)) {
      const classData = mergeClassData('container', {}, this._config.classes);
      html = tpl(classData);
    } else {
      const classData = mergeClassData('container', {}, this._config.classes);
      html = renderTemplateString(tpl as string, classData);
    }
    const containerFrag = renderTemplateToDOM(html);
    const containerEl = (containerFrag.firstElementChild || containerFrag.firstChild) as HTMLElement;
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
      const { inputWrapperEl, startContainer, endContainer } = renderRangeSegmentedInputUI(inputWrapperTpl, rangeTpl, calendarButtonHtml);
      instantiateRangeSegmentedInputs(
        startContainer,
        endContainer,
        this._state,
        this._config,
        (date: Date) => {
          const end = this._state.selectedRange?.end || null;
          let newEnd = end;
          if (end && date > end) newEnd = null;
          this._state.selectedRange = { start: date, end: newEnd };
          this._render();
        },
        (date: Date) => {
          const start = this._state.selectedRange?.start || null;
          let newStart = start;
          if (start && date < start) newStart = null;
          this._state.selectedRange = { start: newStart, end: date };
          this._render();
        }
      );
      return inputWrapperEl;
    }
    // Single-date mode
    const inputWrapperEl = renderSingleSegmentedInputUI(inputWrapperTpl, calendarButtonHtml);
    let segmentedInputContainer = inputWrapperEl.querySelector('.ktui-segmented-input');
    if (!segmentedInputContainer) {
      segmentedInputContainer = document.createElement('div');
      segmentedInputContainer.className = 'ktui-segmented-input flex items-center gap-1';
      inputWrapperEl.insertBefore(segmentedInputContainer, inputWrapperEl.firstChild);
    }
    instantiateSingleSegmentedInput(segmentedInputContainer as HTMLElement, this._state, this._config, (date: Date) => {
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
          console.log('🗓️ [KTDatepicker] Calendar button click blocked: disabled');
          return;
        }
        console.log('🗓️ [KTDatepicker] Calendar button clicked, calling toggle()');
        this.toggle();
      });
    }
  }

  /**
   * Render the dropdown container from template
   */
  private _renderDropdown(): HTMLElement {
    const dropdownTpl = this._templateSet.dropdown || defaultTemplates.dropdown;
    let dropdownHtml: string;
    if (typeof dropdownTpl === 'function') {
      const classData = mergeClassData('dropdown', {}, this._config.classes);
      dropdownHtml = dropdownTpl(classData);
    } else {
      const classData = mergeClassData('dropdown', {}, this._config.classes);
      dropdownHtml = renderTemplateString(dropdownTpl, classData);
    }
    const dropdownFrag = renderTemplateToDOM(dropdownHtml);
    const dropdownEl = dropdownFrag.firstElementChild as HTMLElement;
    dropdownEl.setAttribute('data-kt-datepicker-dropdown', '');
    if (!this._dropdownStateManager.isOpen()) {
      dropdownEl.classList.add('hidden');
    }
    // --- Debug event listeners for close tracing ---
    ['focusout', 'blur', 'mousedown'].forEach((evt) => {
      dropdownEl.addEventListener(evt, (e) => {
        console.log(`[KTDatepicker] Dropdown event: ${evt}`, {
          event: e,
          target: e.target,
          currentTarget: e.currentTarget,
          stack: new Error().stack
        });
      });
    });
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
    if (this._config.enableTime && this._state.selectedTime) {
      const timePickerContainer = document.createElement('div');
      timePickerContainer.className = 'kt-datepicker-time-container';
      timePickerContainer.setAttribute('data-kt-datepicker-time-container', '');

      renderTimePicker(timePickerContainer, {
        time: this._state.selectedTime,
        granularity: this._state.timeGranularity,
        format: this._config.timeFormat || '24h',
        minTime: this._config.minTime,
        maxTime: this._config.maxTime,
        timeStep: this._config.timeStep || 1,
        disabled: !!this._config.disabled,
        onChange: (newTime: any) => {
          this._state.selectedTime = newTime;
          // Apply time to selected date
          if (this._state.selectedDate) {
            const dateWithTime = applyTimeToDate(this._state.selectedDate, newTime);
            this._state.selectedDate = dateWithTime;
            this._updateInputValue();
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

    const header = renderHeader(
      this._templateSet.header,
      {
        month: this._state.currentDate.toLocaleString(this._config.locale, { month: 'long' }),
        year: this._state.currentDate.getFullYear(),
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
      this._getCalendarDays(this._state.currentDate),
      this._state.currentDate,
      this._state.selectedDate,
      dayClickHandler,
      this._config.range ? this._state.selectedRange : undefined
    );
    dropdownEl.appendChild(calendar);
  }

  /**
   * Render multi-month calendar
   */
  private _renderMultiMonth(dropdownEl: HTMLElement, visibleMonths: number) {
    const baseDate = new Date(this._state.currentDate);
    const multiMonthContainer = document.createElement('div');
    multiMonthContainer.setAttribute('data-kt-datepicker-multimonth-container', '');
    multiMonthContainer.className = 'flex flex-row gap-4';

    for (let i = 0; i < visibleMonths; i++) {
      const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);

      // Navigation buttons: only first gets prev, only last gets next
      let prevButtonHtml = '';
      let nextButtonHtml = '';
      if (i === 0) {
        const prevButtonTpl = this._templateSet.prevButton || defaultTemplates.prevButton;
        prevButtonHtml = typeof prevButtonTpl === 'function' ? prevButtonTpl({}) : prevButtonTpl;
      }
      if (i === visibleMonths - 1) {
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
        this._state.selectedDate,
        (day) => { this.setDate(day); },
        this._config.range ? this._state.selectedRange : undefined
      );

      // Wrap header + calendar in a styled panel div
      const panel = document.createElement('div');
      panel.className = 'bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[260px]';
      panel.appendChild(header);
      panel.appendChild(calendar);
      multiMonthContainer.appendChild(panel);
    }

    dropdownEl.appendChild(multiMonthContainer);
  }

  /**
   * Render the datepicker UI using templates
   */
  private _render() {
            // Store current state before rendering
    const wasOpen = this._dropdownStateManager.isOpen();
    const selectedDate = this._state.selectedDate;
    const selectedRange = this._state.selectedRange;
    const selectedDates = this._state.selectedDates;

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
    this._state.selectedDate = selectedDate;
    this._state.selectedRange = selectedRange;
    this._state.selectedDates = selectedDates;

    // Restore open state
    if (wasOpen) {
      this._dropdownStateManager.open('render-restore');
      // Re-open dropdown if it was open
      if (this._dropdownModule) {
        this._dropdownModule.open();
      }
    }

    this._updatePlaceholder();
    this._updateDisabledState();
    this._enforceMinMaxDates();
    console.log('🗓️ [KTDatepicker] _render: this._input:', this._input);
    console.log('🗓️ [KTDatepicker] _render complete. isOpen:', this._dropdownStateManager.isOpen(), 'selectedDate:', this._state.selectedDate);
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
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('data-kt-datepicker-live', '');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('style', 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;');
      this._element.appendChild(liveRegion);
    }
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
    const d = new Date(this._state.currentDate);
    d.setMonth(d.getMonth() + offset);
    this._state.currentDate = d;

    // Update only the calendar content without recreating the entire dropdown
    this._updateCalendarContent();
  }

      /**
   * Update only the calendar content without recreating the dropdown
   * This preserves the dropdown state while updating the month view
   */
  private _updateCalendarContent() {
    // More robust dropdown element selection strategy
    // First try to find the dropdown by its unique identifier (if available)
    let dropdownEl = document.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;

    // If not found, try to find it by looking for the most recently created dropdown
    if (!dropdownEl) {
      const allDropdowns = document.querySelectorAll('[data-kt-datepicker-dropdown]');
      if (allDropdowns.length > 0) {
        // Use the last one (most recently created)
        dropdownEl = allDropdowns[allDropdowns.length - 1] as HTMLElement;
      }
    }

    // Final fallback: look within this._element
    if (!dropdownEl) {
      dropdownEl = this._element.querySelector('[data-kt-datepicker-dropdown]') as HTMLElement;
    }

    if (!dropdownEl) {
      // Fallback to full render if dropdown doesn't exist (should be rare)
      console.warn('[KTDatepicker] Dropdown element not found, falling back to full render');
      this._render();
      return;
    }

    // Clear existing calendar content
    const calendarEl = dropdownEl.querySelector('[data-kt-datepicker-calendar]');
    if (calendarEl) {
      calendarEl.innerHTML = '';
      this._renderDropdownContent(dropdownEl);
    } else {
      // If calendar element not found, fallback to full render
      console.warn('[KTDatepicker] Calendar element not found, falling back to full render');
      this._render();
    }
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
     *   (Extendable for more tokens)
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
      .replace(/d(?![a-zA-Z])/g, String(date.getDate()));
  }

  /**
   * Get the selected date
   */
  public getDate(): Date | null {
    return this._state.selectedDate;
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
    this._eventManager.removeAllListeners(document as unknown as HTMLElement);
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

    // Clean up state managers
    if (this._dropdownEventManager) {
      this._dropdownEventManager.dispose();
    }
    if (this._dropdownStateManager) {
      this._dropdownStateManager.dispose();
    }

    (this._element as any).instance = null;
    console.log('🗓️ [KTDatepicker] destroy() completed');
  }

  private _updateInputValue() {
    if (this._input) {
      this._input.value = this._state.selectedDate ? this._formatSingleDate(this._state.selectedDate) : '';
    }
  }

  /**
   * Update the input placeholder if no date is selected
   */
  private _updatePlaceholder() {
    if (this._input && !this._state.selectedDate && this._config.placeholder) {
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
        const year = this._state.currentDate.getFullYear();
        const month = this._state.currentDate.getMonth();
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
    if (this._dropdownStateManager.isOpen()) {
      console.log('🗓️ [KTDatepicker] open() skipped: already open');
      return;
    }
    if (this._config.disabled) {
      console.log('🗓️ [KTDatepicker] open() blocked: datepicker is disabled');
      return;
    }

    console.log('🗓️ [KTDatepicker] open() called, attempting to open dropdown');

    // Use centralized state management
    const success = this._dropdownStateManager.open('datepicker-open');
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
      console.log('🗓️ [KTDatepicker] Calling dropdown module open()');
      this._dropdownModule.open();
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
      stateManagerOpen: this._dropdownStateManager.isOpen(),
      dropdownModuleOpen: this._dropdownModule?.isOpen(),
      stateManagerState: this._dropdownStateManager.getState()
    });

    if (!this._dropdownStateManager.isOpen()) {
      console.log('🗓️ [KTDatepicker] close() skipped: already closed');
      return;
    }
    // Debug log with stack trace
    console.log('[KTDatepicker] close() called. Dropdown will close. Stack trace:', new Error().stack);

    // Use centralized state management
    const success = this._dropdownStateManager.close('datepicker-close');
    if (!success) {
      console.log('🗓️ [KTDatepicker] close() blocked by state validation');
      return;
    }

    console.log('🗓️ [KTDatepicker] State manager close() successful');

    // Use dropdown module if available
    if (this._dropdownModule) {
      this._dropdownModule.close();
    } else {
      console.log('🗓️ [KTDatepicker] No dropdown module, using fallback');
    }

    // Don't call _render() here as it recreates the dropdown module
    // The dropdown module handles its own visibility
  }

  public toggle() {
    if (this._dropdownStateManager.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether the datepicker dropdown is currently open.
   */
  public isOpen(): boolean {
    return this._dropdownStateManager.isOpen();
  }

  /**
   * Returns the current state of the datepicker component.
   */
  public getState(): KTDatepickerState {
    return { ...this._state };
  }

  /**
   * Returns the current dropdown state.
   */
  public getDropdownState(): DropdownState {
    return this._dropdownStateManager.getState();
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