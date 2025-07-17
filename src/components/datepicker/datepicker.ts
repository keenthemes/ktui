/*
 * datepicker.ts - Main entry point for KTDatepicker (revamp)
 * Follows KTSelect pattern: extends KTComponent, uses template system, modular, extensible.
 *
 * Modular Structure (2025+):
 * - All major UI fragments and state updates are handled by dedicated private methods:
 *   - _renderContainer(): Renders the main container
 *   - _renderInputWrapper(): Renders the input wrapper and calendar button
 *   - _bindCalendarButtonEvent(): Binds event to the calendar button
 *   - _renderDropdown(): Renders the dropdown container
 *   - _renderDropdownContent(): Renders header, calendar, and footer into the dropdown
 *   - _attachDropdown(): Attaches the dropdown to the DOM
 *   - _updatePlaceholder(): Updates the input placeholder
 *   - _updateDisabledState(): Updates the disabled state of input and button
 *   - _enforceMinMaxDates(): Disables day buttons outside min/max range
 *
 * This modular approach improves maintainability, readability, and testability.
 */

import KTComponent from '../component';
import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './types';
import { getTemplateStrings, defaultTemplates } from './templates';
import { getMergedTemplates } from './template-manager';
import { renderTemplateString, isTemplateFunction, renderTemplateToDOM } from './utils/template';
import { defaultDatepickerConfig } from './config';
import { renderHeader } from './renderers/header';
import { renderCalendar } from './renderers/calendar';
import { renderFooter } from './renderers/footer';
import { getInitialState } from './state';
import { SegmentedInput, SegmentedInputOptions } from './segmented-input';
import { parseDateFromFormat } from './date-utils';

/**
 * KTDatepicker
 *
 * Datepicker component for selecting single, range, or multiple dates.
 *
 * Features:
 * - Opens on input focus or calendar button click (configurable)
 * - Closes on selection (configurable) or when clicking outside the dropdown
 * - Supports single, range, and multi-date modes
 * - Customizable via templates and data attributes
 *
 * New in 2025:
 * - Dropdown closes automatically when clicking outside the datepicker, dropdown, input, or calendar button.
 * - Event listeners are cleaned up on close and destroy to prevent leaks.
 */
export class KTDatepicker extends KTComponent {
  protected override readonly _name: string = 'datepicker';
  protected override _config: KTDatepickerConfig;
  protected _state: KTDatepickerState;
  protected _templateSet: ReturnType<typeof getTemplateStrings>;
  private _userTemplates: Record<string, string | ((data: any) => string)> = {};

  private _container: HTMLElement;
  private _input: HTMLInputElement | null = null;
  private _isOpen: boolean = false;

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

  /**
   * Helper to decide if dropdown should close after selection
   */
  private _maybeCloseDropdownOnSelect(mode: 'single' | 'range' | 'multi' | 'other' = 'other') {
    if (mode === 'single') {
      if (this._config.closeOnSelect) {
        console.log('[KTDatepicker] Closing dropdown after single date select');
        this.close();
      } else {
        console.log('[KTDatepicker] Not closing dropdown after single date select (closeOnSelect is false)');
      }
    } else if (mode === 'range') {
      const { start, end } = this._state.selectedRange || {};
      console.log('[KTDatepicker] maybeCloseDropdownOnSelect (range): start:', start, 'end:', end, 'closeOnSelect:', this._config.closeOnSelect);
      if (this._config.closeOnSelect && start && end) {
        console.log('[KTDatepicker] Closing dropdown after range select (both dates selected)');
        this.close();
      } else {
        console.log('[KTDatepicker] Not closing dropdown after range select (waiting for both dates)');
      }
    } else if (mode === 'multi') {
      // Only close on Apply, not on each selection
      console.log('[KTDatepicker] Not closing dropdown after multi-date select (only closes on Apply)');
    } else {
      if (this._config.closeOnSelect) {
        console.log('[KTDatepicker] Closing dropdown (other action)');
        this.close();
      } else {
        console.log('[KTDatepicker] Not closing dropdown (other action, closeOnSelect is false)');
      }
    }
  }

  /** Select a single date */
  private _selectSingleDate(date: Date) {
    this._state.selectedDate = date;
    this._state.currentDate = date;
    if (this._input) {
      this._input.value = this._formatSingleDate(date);
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    console.log('[KTDatepicker] Single date selected:', date);
    this._maybeCloseDropdownOnSelect('single');
    this._render();
  }

  /**
   * Select a range date (calendar click or segmented input change)
   * Updates both segmented inputs and internal state.
   */
  private _selectRangeDate(date: Date) {
    // If neither start nor end is set, set start
    if (!this._state.selectedRange || (!this._state.selectedRange.start && !this._state.selectedRange.end)) {
      this._state.selectedRange = { start: date, end: null };
    } else if (this._state.selectedRange.start && !this._state.selectedRange.end) {
      // If start is set and end is not, set end (if after start), else reset start
      if (date >= this._state.selectedRange.start) {
        this._state.selectedRange.end = date;
      } else {
        this._state.selectedRange = { start: date, end: null };
      }
    } else {
      // If both are set, start a new range
      this._state.selectedRange = { start: date, end: null };
    }
    // No direct input.value update here; _render will update segmented inputs
    // Dispatch change event for integration
    if (this._input) {
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    console.log('[KTDatepicker] Range date selected:', this._state.selectedRange);
    this._maybeCloseDropdownOnSelect('range');
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
    this._maybeCloseDropdownOnSelect('multi');
    this._render();
  }

  /** Handler for Apply button in multi-date mode */
  private _onApplyMultiDate = (e: Event) => {
    console.log('[KTDatepicker] Apply button clicked in multi-date mode (should close if closeOnSelect is true)');
    this._maybeCloseDropdownOnSelect('other');
  };

  private _onToday = (e: Event) => {
    e.preventDefault();
    const today = new Date();
    this.setDate(today);
    console.log('[KTDatepicker] Today button clicked');
    this._maybeCloseDropdownOnSelect('other');
  };

  // Stub for _onClear (to be implemented next)
  private _onClear = (e: Event) => {
    e.preventDefault();
    // Clear all selection states
    this._state.selectedDate = null;
    this._state.selectedRange = { start: null, end: null };
    this._state.selectedDates = [];
    if (this._input) {
      this._input.value = '';
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    this._render();
    console.log('[KTDatepicker] Clear button clicked');
    this._maybeCloseDropdownOnSelect('other');
  };

  // Stub for _onApply (to be implemented next)
  private _onApply = (e: Event) => {
    e.preventDefault();
    // For multi-date, update input value (already handled by selection logic)
    console.log('[KTDatepicker] Apply button clicked');
    this._maybeCloseDropdownOnSelect('other');
  };

  /**
   * Centralized keyboard event handler for all datepicker keyboard interactions.
   * Handles navigation, selection, and closing for input, calendar, and popover.
   * Covers: Tab, Shift+Tab, Arrow keys, Enter, Space, Escape, Home, End, PageUp, PageDown.
   */
  private _onKeyDown = (e: KeyboardEvent) => {
    if (!this._isOpen) return;
    const target = e.target as HTMLElement;
    // Handle Escape: close dropdown
    if (e.key === 'Escape') {
      this.close();
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
    // --- Data attribute overrides for showOnFocus and closeOnSelect ---
    const showOnFocusAttr = element.getAttribute('data-kt-datepicker-show-on-focus');
    const closeOnSelectAttr = element.getAttribute('data-kt-datepicker-close-on-select');
    let configWithAttrs = { ...configFromAttr, ...(config || {}) };
    if (showOnFocusAttr !== null) {
      configWithAttrs.showOnFocus = showOnFocusAttr === 'true' || showOnFocusAttr === '';
    }
    if (closeOnSelectAttr !== null) {
      configWithAttrs.closeOnSelect = closeOnSelectAttr === 'true' || closeOnSelectAttr === '';
    }
    this._buildConfig(configWithAttrs);
    this._templateSet = getTemplateStrings(this._config);
    this._state = getInitialState();
    // Set placeholder from config if available
    if (this._input && this._config.placeholder) {
      this._input.setAttribute('placeholder', this._config.placeholder);
      console.log('🗓️ [KTDatepicker] Placeholder set to:', this._config.placeholder);
    }
    // Set disabled state from config if available
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');
      console.log('🗓️ [KTDatepicker] Input disabled from config');
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
      this._input.addEventListener('focus', this._onInputFocus);
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
    // Determine closeOnSelect default based on mode if not explicitly set
    let closeOnSelect: boolean;
    if (typeof (config && config.closeOnSelect) !== 'undefined') {
      closeOnSelect = config!.closeOnSelect!;
    } else if (config?.range) {
      closeOnSelect = true; // changed from false to true for range mode
    } else if (config?.multiDate) {
      closeOnSelect = false;
    } else {
      closeOnSelect = true;
    }
    this._config = {
      ...defaultDatepickerConfig,
      ...(config || {}),
      templates: mergedTemplates,
      closeOnSelect,
    };
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
      html = tpl({});
    } else {
      html = tpl as string;
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
    let inputWrapperHtml: string;
    if (typeof inputWrapperTpl === 'function') {
      inputWrapperHtml = inputWrapperTpl({ input: '', icon: calendarButtonHtml });
    } else {
      inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, '');
    }
    const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
    const inputWrapperEl = inputWrapperFrag.firstElementChild as HTMLElement;
    // Remove old input if present
    if (this._input && this._input.parentNode) {
      this._input.parentNode.removeChild(this._input);
    }
    // --- Range mode: render two segmented inputs ---
    if (this._config.range) {
      // Use segmentedDateRangeInput template
      const rangeTpl = this._templateSet.segmentedDateRangeInput || defaultTemplates.segmentedDateRangeInput;
      // Create containers for start and end segmented inputs
      const startContainer = document.createElement('div');
      startContainer.className = 'ktui-segmented-input-start flex items-center gap-1';
      startContainer.setAttribute('aria-label', 'Start date');
      startContainer.setAttribute('role', 'group');
      const endContainer = document.createElement('div');
      endContainer.className = 'ktui-segmented-input-end flex items-center gap-1';
      endContainer.setAttribute('aria-label', 'End date');
      endContainer.setAttribute('role', 'group');
      // Optionally, add visually hidden labels for screen readers
      const startLabel = document.createElement('span');
      startLabel.textContent = 'Start date';
      startLabel.id = 'ktui-datepicker-start-label';
      startLabel.className = 'sr-only';
      startContainer.prepend(startLabel);
      startContainer.setAttribute('aria-labelledby', 'ktui-datepicker-start-label');
      const endLabel = document.createElement('span');
      endLabel.textContent = 'End date';
      endLabel.id = 'ktui-datepicker-end-label';
      endLabel.className = 'sr-only';
      endContainer.prepend(endLabel);
      endContainer.setAttribute('aria-labelledby', 'ktui-datepicker-end-label');
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
      // Instantiate SegmentedInput for start
      SegmentedInput(startContainer, {
        value: this._state.selectedRange?.start || new Date(),
        segments: ['month', 'day', 'year'],
        disabled: !!this._config.disabled,
        required: !!this._config.required,
        readOnly: !!this._config.readOnly,
        locale: this._config.locale,
        onChange: (date) => {
          const end = this._state.selectedRange?.end || null;
          // If end is set and new start is after end, reset end
          let newEnd = end;
          if (end && date > end) newEnd = null;
          this._state.selectedRange = {
            start: date,
            end: newEnd,
          };
          this._render();
        },
      });
      // Instantiate SegmentedInput for end
      SegmentedInput(endContainer, {
        value: this._state.selectedRange?.end || new Date(),
        segments: ['month', 'day', 'year'],
        disabled: !!this._config.disabled,
        required: !!this._config.required,
        readOnly: !!this._config.readOnly,
        locale: this._config.locale,
        onChange: (date) => {
          const start = this._state.selectedRange?.start || null;
          // If start is set and new end is before start, reset start
          let newStart = start;
          if (start && date < start) newStart = null;
          this._state.selectedRange = {
            start: newStart,
            end: date,
          };
          this._render();
        },
      });
      return inputWrapperEl;
    }
    // --- Single-date mode: render single segmented input ---
    let segmentedInputContainer = inputWrapperEl.querySelector('.ktui-segmented-input');
    if (!segmentedInputContainer) {
      segmentedInputContainer = document.createElement('div');
      segmentedInputContainer.className = 'ktui-segmented-input flex items-center gap-1';
      inputWrapperEl.insertBefore(segmentedInputContainer, inputWrapperEl.firstChild);
    }
    SegmentedInput(segmentedInputContainer as HTMLElement, {
      value: this._state.selectedDate || this._state.currentDate || new Date(),
      segments: ['month', 'day', 'year'],
      disabled: !!this._config.disabled,
      required: !!this._config.required,
      readOnly: !!this._config.readOnly,
      locale: this._config.locale,
      onChange: (date) => {
        this.setDate(date);
      },
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
        if (this._config.disabled || buttonEl.hasAttribute('disabled')) return;
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
      dropdownHtml = dropdownTpl({});
    } else {
      dropdownHtml = dropdownTpl;
    }
    const dropdownFrag = renderTemplateToDOM(dropdownHtml);
    const dropdownEl = dropdownFrag.firstElementChild as HTMLElement;
    dropdownEl.setAttribute('data-kt-datepicker-dropdown', '');
    if (!this._isOpen) {
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
      // Single month (existing logic)
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
      // --- FIX: Only close dropdown after day click in single mode ---
      const dayClickHandler = (day: Date) => {
        this.setDate(day);
        if (!this._config.range && !this._config.multiDate) {
          this.close();
        }
        // In range mode, dropdown remains open until both dates are selected (handled by _maybeCloseDropdownOnSelect)
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
    } else {
      // Multi-month rendering (DOM node-based)
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
        console.log(`[KTDatepicker] Rendering month ${i + 1}/${visibleMonths}:`, monthDate.toLocaleString(this._config.locale, { month: 'long', year: 'numeric' }));
        const header = renderHeader(
          this._templateSet.header,
          {
            month: monthDate.toLocaleString(this._config.locale, { month: 'long' }),
            year: monthDate.getFullYear(),
            prevButton: prevButtonHtml,
            nextButton: nextButtonHtml,
          },
          (e) => { console.log('[KTDatepicker] Prev button clicked for', monthDate); e.stopPropagation(); this._changeMonth(-1); },
          (e) => { console.log('[KTDatepicker] Next button clicked for', monthDate); e.stopPropagation(); this._changeMonth(1); }
        );
        console.log('[KTDatepicker] Header DOM:', header);
        const calendar = renderCalendar(
          this._templateSet.dayCell,
          this._getCalendarDays(monthDate),
          monthDate,
          this._state.selectedDate,
          (day) => { console.log('[KTDatepicker] Day clicked:', day); this.setDate(day); },
          this._config.range ? this._state.selectedRange : undefined
        );
        console.log('[KTDatepicker] Calendar DOM:', calendar);
        // --- Wrap header + calendar in a styled panel div ---
        const panel = document.createElement('div');
        panel.className = 'bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[260px]';
        panel.appendChild(header);
        panel.appendChild(calendar);
        multiMonthContainer.appendChild(panel);
      }
      console.log('[KTDatepicker] Multi-month container structure:', multiMonthContainer);
      dropdownEl.appendChild(multiMonthContainer);
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
  }

  /**
   * Render the datepicker UI using templates
   */
  private _render() {
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
      calendarButtonHtml = calendarButtonTpl({ ariaLabel: this._config.calendarButtonAriaLabel || 'Open calendar' });
    } else {
      calendarButtonHtml = calendarButtonTpl.replace(/{{ariaLabel}}/g, this._config.calendarButtonAriaLabel || 'Open calendar');
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
    this._updatePlaceholder();
    this._updateDisabledState();
    this._enforceMinMaxDates();
    console.log('🗓️ [KTDatepicker] _render: this._input:', this._input);
    console.log('🗓️ [KTDatepicker] _render complete. isOpen:', this._isOpen, 'selectedDate:', this._state.selectedDate);
    // Attach keyboard event listeners
    if (this._input) {
      this._input.removeEventListener('keydown', this._onKeyDown);
      this._input.addEventListener('keydown', this._onKeyDown);
    }
    if (dropdownEl) {
      dropdownEl.removeEventListener('keydown', this._onKeyDown);
      dropdownEl.addEventListener('keydown', this._onKeyDown);
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
    if (inputWrapperEl.nextSibling) {
      this._element.insertBefore(dropdownEl, inputWrapperEl.nextSibling);
    } else {
      this._element.appendChild(dropdownEl);
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
    this._render();
  }

  /**
   * Set the selected date (single, range, or multi-date)
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
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    if (this._input) {
      this._input.removeEventListener('focus', this._onInputFocus);
    }
    (this._element as any).instance = null;
    // Always unbind outside click listener to prevent leaks
    document.removeEventListener('mousedown', this._onDocumentClick, true);
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
   */
  private _updateDisabledState() {
    const calendarButton = this._element.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (this._input && this._config.disabled) {
      this._input.setAttribute('disabled', 'true');
      if (calendarButton) calendarButton.setAttribute('disabled', 'true');
      console.log('🗓️ [KTDatepicker] _render: Input and calendar button disabled');
    } else if (this._input) {
      this._input.removeAttribute('disabled');
      if (calendarButton) calendarButton.removeAttribute('disabled');
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
   * Handler for outside click to close the dropdown
   */
  private _onDocumentClick = (e: MouseEvent) => {
    if (!this._isOpen) return;
    const target = e.target as Node;
    // Elements considered inside: root, dropdown, input, calendar button
    const dropdown = this._element.querySelector('[data-kt-datepicker-dropdown]');
    const input = this._input;
    const calendarBtn = this._element.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (
      this._element.contains(target) ||
      (dropdown && dropdown.contains(target)) ||
      (input && input.contains(target)) ||
      (calendarBtn && calendarBtn.contains(target))
    ) {
      return; // Click inside, do nothing
    }
    this.close();
  };

  /**
   * Opens the datepicker dropdown.
   * Binds a global outside click listener to close the dropdown when clicking outside.
   */
  public open() {
    if (this._isOpen) return;
    if (this._config.disabled) {
      console.log('🗓️ [KTDatepicker] open() blocked: datepicker is disabled');
      return;
    }
    this._isOpen = true;
    // Bind outside click listener
    document.addEventListener('mousedown', this._onDocumentClick, true);
    this._render();
  }

  /**
   * Closes the datepicker dropdown.
   * Unbinds the global outside click listener.
   */
  public close() {
    if (!this._isOpen) return;
    // Debug log with stack trace
    console.log('[KTDatepicker] close() called. Dropdown will close. Stack trace:', new Error().stack);
    this._isOpen = false;
    // Unbind outside click listener
    document.removeEventListener('mousedown', this._onDocumentClick, true);
    this._render();
  }

  public toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
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