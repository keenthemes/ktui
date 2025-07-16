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
import { SegmentManager } from './segment-manager';
import { renderHeader } from './renderers/header';
import { renderCalendar } from './renderers/calendar';
import { renderFooter } from './renderers/footer';
import { getInitialState } from './state';

/**
 * KTDatepicker - Template-driven, modular datepicker component
 * Extends KTComponent, supports full template customization
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
  private _segmentManager: SegmentManager | null = null;

  /**
   * Constructor: Initializes the datepicker component
   */
  constructor(element: HTMLElement, config?: KTDatepickerConfig) {
    super();
    console.log('🗓️ [KTDatepicker] Constructor: element:', element);
    this._init(element);
    console.log('🗓️ [KTDatepicker] After _init, this._input:', this._input);
    this._buildConfig(config);
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
    // Initialize SegmentManager with format and initial value
    const format = (this._config.format && typeof this._config.format === 'string') ? this._config.format : 'MM/DD/YYYY';
    const initialValue = this._input ? this._input.value : '';
    this._segmentManager = new SegmentManager(format, initialValue);
    (element as any).instance = this;
    this._render();
  }

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
    this._config = {
      ...defaultDatepickerConfig,
      ...(config || {}),
      templates: mergedTemplates,
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
   */
  private _renderInputWrapper(calendarButtonHtml: string): HTMLElement {
    const inputWrapperTpl = this._templateSet.inputWrapper || defaultTemplates.inputWrapper;
    let inputWrapperHtml: string;
    if (typeof inputWrapperTpl === 'function') {
      inputWrapperHtml = inputWrapperTpl({ input: this._input ? this._input.outerHTML : '', icon: calendarButtonHtml });
    } else {
      inputWrapperHtml = inputWrapperTpl.replace(/{{icon}}/g, calendarButtonHtml).replace(/{{input}}/g, this._input ? this._input.outerHTML : '');
    }
    const inputWrapperFrag = renderTemplateToDOM(inputWrapperHtml);
    const inputWrapperEl = inputWrapperFrag.firstElementChild as HTMLElement;
    // Move or create input (do not create input in code, just move existing)
    if (this._input && inputWrapperEl) {
      const inputEl = inputWrapperEl.querySelector('input[data-kt-datepicker-input]');
      if (inputEl && this._input !== inputEl) {
        inputEl.replaceWith(this._input);
      } else if (!inputEl) {
        inputWrapperEl.appendChild(this._input);
      }
    }
    return inputWrapperEl;
  }

  /**
   * Bind event listener to the calendar button in the input wrapper
   */
  private _bindCalendarButtonEvent(inputWrapperEl: HTMLElement) {
    const buttonEl = inputWrapperEl.querySelector('button[data-kt-datepicker-calendar-btn]');
    if (buttonEl && buttonEl instanceof HTMLButtonElement) {
      buttonEl.type = 'button';
      buttonEl.tabIndex = 0;
      buttonEl.setAttribute('aria-label', this._config.calendarButtonAriaLabel || 'Open calendar');
      buttonEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
    return dropdownEl;
  }

  /**
   * Render header, calendar, and footer into the dropdown element
   */
  private _renderDropdownContent(dropdownEl: HTMLElement) {
    // Use template-driven navigation buttons
    let prevButtonHtml: string;
    let nextButtonHtml: string;
    const prevButtonTpl = this._templateSet.prevButton || defaultTemplates.prevButton;
    const nextButtonTpl = this._templateSet.nextButton || defaultTemplates.nextButton;
    if (typeof prevButtonTpl === 'function') {
      prevButtonHtml = prevButtonTpl({});
    } else {
      prevButtonHtml = prevButtonTpl;
    }
    if (typeof nextButtonTpl === 'function') {
      nextButtonHtml = nextButtonTpl({});
    } else {
      nextButtonHtml = nextButtonTpl;
    }
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

    const calendar = renderCalendar(
      this._templateSet.dayCell,
      this._getCalendarDays(this._state.currentDate),
      this._state.currentDate,
      this._state.selectedDate,
      (day) => { this.setDate(day); this.close(); },
      this._config.range ? this._state.selectedRange : undefined
    );
    dropdownEl.appendChild(calendar);

    // Render footer using template-driven buttons
    let todayButtonHtml: string;
    let clearButtonHtml: string;
    let applyButtonHtml: string;
    const todayButtonTpl = this._templateSet.todayButton || defaultTemplates.todayButton;
    const clearButtonTpl = this._templateSet.clearButton || defaultTemplates.clearButton;
    const applyButtonTpl = this._templateSet.applyButton || defaultTemplates.applyButton;
    todayButtonHtml = typeof todayButtonTpl === 'function' ? todayButtonTpl({}) : todayButtonTpl;
    clearButtonHtml = typeof clearButtonTpl === 'function' ? clearButtonTpl({}) : clearButtonTpl;
    applyButtonHtml = typeof applyButtonTpl === 'function' ? applyButtonTpl({}) : applyButtonTpl;
    const footer = renderFooter(
      this._templateSet.footer,
      { todayButton: todayButtonHtml, clearButton: clearButtonHtml, applyButton: applyButtonHtml }
      // Callbacks for today, clear, apply can be added here if needed
    );
    dropdownEl.appendChild(footer);
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
   * Set the selected date
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
    if (this._config.range) {
      // Range selection logic
      if (!this._state.selectedRange || (!this._state.selectedRange.start && !this._state.selectedRange.end)) {
        this._state.selectedRange = { start: date, end: null };
      } else if (this._state.selectedRange.start && !this._state.selectedRange.end) {
        if (date >= this._state.selectedRange.start) {
          this._state.selectedRange.end = date;
        } else {
          // If clicked before start, treat as new start
          this._state.selectedRange = { start: date, end: null };
        }
      } else {
        // Reset range
        this._state.selectedRange = { start: date, end: null };
      }
      // Update input value for range
      if (this._input) {
        let value = '';
        const { start, end } = this._state.selectedRange;
        if (start && end) {
          if (this._config.format && typeof this._config.format === 'string') {
            value = `${this._formatDate(start, this._config.format)} – ${this._formatDate(end, this._config.format)}`;
          } else if (this._config.locale) {
            value = `${start.toLocaleDateString(this._config.locale)} – ${end.toLocaleDateString(this._config.locale)}`;
          } else {
            value = `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
          }
        } else if (start) {
          if (this._config.format && typeof this._config.format === 'string') {
            value = this._formatDate(start, this._config.format);
          } else if (this._config.locale) {
            value = start.toLocaleDateString(this._config.locale);
          } else {
            value = start.toLocaleDateString();
          }
        }
        this._input.value = value;
        console.log('🗓️ [KTDatepicker] Input value set to (range):', value);
        const evt = new Event('change', { bubbles: true });
        this._input.dispatchEvent(evt);
      }
      this._render();
      return;
    }
    this._state.selectedDate = date;
    this._state.currentDate = date;
    // Update input value using locale if provided
    if (this._input) {
      let value = '';
      if (this._config.format && typeof this._config.format === 'string') {
        value = this._formatDate(date, this._config.format);
      } else if (this._config.locale) {
        value = date.toLocaleDateString(this._config.locale);
      } else {
        value = date.toLocaleDateString();
      }
      this._input.value = value;
      console.log('🗓️ [KTDatepicker] Input value set to:', value);
      const evt = new Event('change', { bubbles: true });
      this._input.dispatchEvent(evt);
    }
    this._render();
  }

  private _formatDate(date: Date, format: string): string {
    // Very basic formatter: supports yyyy, mm, dd
    return format
      .replace(/yyyy/g, date.getFullYear().toString())
      .replace(/mm/g, String(date.getMonth() + 1).padStart(2, '0'))
      .replace(/dd/g, String(date.getDate()).padStart(2, '0'));
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
   * Destroy the datepicker instance
   */
  public destroy() {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    if (this._input) {
      this._input.removeEventListener('focus', () => this.open());
    }
    (this._element as any).instance = null;
  }

  private _updateInputValue() {
    if (this._input && this._segmentManager) {
      this._input.value = this._segmentManager.formatValue();
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

  // Ensure open() and close() methods are present and correct
  public open() {
    if (this._isOpen) return;
    if (this._config.disabled) {
      console.log('🗓️ [KTDatepicker] open() blocked: datepicker is disabled');
      return;
    }
    this._isOpen = true;
    this._render();
  }

  public close() {
    if (!this._isOpen) return;
    this._isOpen = false;
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