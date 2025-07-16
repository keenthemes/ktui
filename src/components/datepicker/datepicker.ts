/*
 * datepicker.ts - Main entry point for KTDatepicker (revamp)
 * Follows KTSelect pattern: extends KTComponent, uses template system, modular, extensible.
 */

import KTComponent from '../component';
import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './types';
import { getTemplateStrings, defaultTemplates } from './templates';
import { renderTemplateString, isTemplateFunction, renderTemplateToDOM } from './template-utils';
import { defaultDatepickerConfig } from './config';
import { SegmentManager } from './segment-manager';

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
    console.log('KTDatepicker initialized', element); // DEBUG
    this._init(element);
    this._buildConfig(config);
    this._templateSet = getTemplateStrings(this._config);
    this._state = this._getInitialState();
    // Initialize SegmentManager with format and initial value
    const format = (this._config.format && typeof this._config.format === 'string') ? this._config.format : 'MM/DD/YYYY';
    const initialValue = this._input ? this._input.value : '';
    this._segmentManager = new SegmentManager(format, initialValue);
    (element as any).instance = this;
    this._render();
  }

  /**
   * Build config by merging defaults and user config
   */
  protected override _buildConfig(config?: KTDatepickerConfig) {
    // Merge templates separately to ensure correct type
    const mergedTemplates = Object.assign(
      {},
      (defaultDatepickerConfig.templates || {}),
      (config && config.templates) || {},
      this._userTemplates || {}
    ) as Record<string, string | ((data: any) => string)>;
    this._config = {
      ...defaultDatepickerConfig,
      ...(config || {}),
      templates: mergedTemplates,
    };
  }

  /**
   * Get initial state for the datepicker
   */
  private _getInitialState(): KTDatepickerState {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedRange: null,
      selectedDates: [],
      viewMode: 'days',
      isOpen: false,
      isFocused: false,
    };
  }

  /**
   * Public method to set/override templates at runtime (supports string or function)
   */
  public setTemplates(templates: Record<string, string | ((data: any) => string)>) {
    this._userTemplates = { ...this._userTemplates, ...templates };
    this._templateSet = this._getMergedTemplates();
    this._render();
  }

  /**
   * Merge default, config, and user templates (string or function)
   */
  private _getMergedTemplates(): Record<string, string | ((data: any) => string)> {
    return {
      ...(defaultTemplates as Record<string, string | ((data: any) => string)>),
      ...(this._config.templates || {}),
      ...this._userTemplates,
    };
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
    const tpl = this._templateSet.container || defaultTemplates.container;
    let html: string;
    if (isTemplateFunction(tpl)) {
      html = tpl({});
    } else {
      html = tpl as string;
    }
    // Use template utility to create DOM
    const containerFrag = renderTemplateToDOM(html);
    // Find the root container element
    const containerEl = (containerFrag.firstElementChild || containerFrag.firstChild) as HTMLElement;
    this._container = containerEl;
    // Remove any previous input wrapper
    const existingWrapper = this._element.querySelector('[data-kt-datepicker-input-wrapper]');
    if (existingWrapper && existingWrapper.parentNode) {
      existingWrapper.parentNode.removeChild(existingWrapper);
    }
    // Render input wrapper and calendar button from template
    const inputWrapperTpl = this._templateSet.inputWrapper || defaultTemplates.inputWrapper;
    let inputWrapperHtml: string;
    if (typeof inputWrapperTpl === 'function') {
      inputWrapperHtml = inputWrapperTpl({ input: this._input ? this._input.outerHTML : '', icon: '' });
    } else {
      inputWrapperHtml = inputWrapperTpl;
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
    // Attach calendar button event listener
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
    // Insert wrapper at the start of the element
    this._element.insertBefore(inputWrapperEl, this._element.firstChild);
    // --- Dropdown rendering and attachment ---
    // Remove any previous dropdown
    const existingDropdown = this._element.querySelector('[data-kt-datepicker-dropdown]');
    if (existingDropdown && existingDropdown.parentNode) {
      existingDropdown.parentNode.removeChild(existingDropdown);
    }
    // Render dropdown from template
    let dropdownHtml: string;
    // There is no 'dropdown' key in the template set, so use a local default
    const defaultDropdownTpl = '<div data-kt-datepicker-dropdown></div>';
    // If a user adds a dropdown template in the future, support it as a string or function
    const dropdownTpl = (this._templateSet as any).dropdown || defaultDropdownTpl;
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
    // Render header, calendar, footer into dropdown
    this._renderHeaderTo(dropdownEl);
    this._renderCalendarTo(dropdownEl);
    this._renderFooterTo(dropdownEl);
    // Attach dropdown after the input wrapper
    if (inputWrapperEl.nextSibling) {
      this._element.insertBefore(dropdownEl, inputWrapperEl.nextSibling);
    } else {
      this._element.appendChild(dropdownEl);
    }
  }

  private _renderHeaderTo(target: HTMLElement) {
    const tpl = this._templateSet.header;
    const data = {
      month: this._state.currentDate.toLocaleString('default', { month: 'long' }),
      year: this._state.currentDate.getFullYear(),
      prevButton: '<button type="button" data-kt-datepicker-prev>&lt;</button>',
      nextButton: '<button type="button" data-kt-datepicker-next>&gt;</button>',
    };
    const headerHtml = isTemplateFunction(tpl)
      ? tpl(data)
      : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.header === 'string' ? defaultTemplates.header : ''), data);
    const headerFrag = renderTemplateToDOM(headerHtml);
    const header = headerFrag.firstElementChild as HTMLElement;
    target.appendChild(header);
    // Add navigation event listeners
    const prevBtn = header.querySelector('[data-kt-datepicker-prev]');
    const nextBtn = header.querySelector('[data-kt-datepicker-next]');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this._changeMonth(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this._changeMonth(1); });
  }

  private _renderCalendarTo(target: HTMLElement) {
    const days = this._getCalendarDays(this._state.currentDate);
    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      const tds = week.map(day => {
        const isCurrentMonth = day.getMonth() === this._state.currentDate.getMonth();
        const isToday = this._isSameDay(day, new Date());
        const isSelected = this._state.selectedDate && this._isSameDay(day, this._state.selectedDate);
        const tpl = this._templateSet.dayCell;
        const data = { day: day.getDate(), date: day, isCurrentMonth, isToday, isSelected };
        return isTemplateFunction(tpl)
          ? tpl(data)
          : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.dayCell === 'string' ? defaultTemplates.dayCell : ''), data);
      }).join('');
      rows.push(`<tr>${tds}</tr>`);
    }
    const calendarHtml = `<table data-kt-datepicker-calendar-table><tbody>${rows.join('')}</tbody></table>`;
    const calendarFrag = renderTemplateToDOM(calendarHtml);
    const calendar = calendarFrag.firstElementChild as HTMLElement;
    target.appendChild(calendar);
    // Add day cell click listeners
    calendar.querySelectorAll('td[data-kt-datepicker-day]').forEach((td, i) => {
      td.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = days[i];
        if (day.getMonth() === this._state.currentDate.getMonth()) {
          this.setDate(day);
          this.close();
        }
      });
    });
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

  private _renderFooterTo(target: HTMLElement) {
    const tpl = this._templateSet.footer;
    const data = { todayButton: 'Today', clearButton: 'Clear', applyButton: 'Apply' };
    const footerHtml = isTemplateFunction(tpl)
      ? tpl(data)
      : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.footer === 'string' ? defaultTemplates.footer : ''), data);
    const footerFrag = renderTemplateToDOM(footerHtml);
    const footer = footerFrag.firstElementChild as HTMLElement;
    target.appendChild(footer);
  }

  /**
   * Set the selected date
   */
  public setDate(date: Date) {
    this._state.selectedDate = date;
    this._state.currentDate = date;
    // Update input value using SegmentManager if available
    if (this._input) {
      let value = '';
      if (this._config.format && typeof this._config.format === 'string') {
        // Use SegmentManager to format value
        if (this._segmentManager) {
          // Optionally: update segments from date
          // (not implemented in this MVP step)
          value = this._segmentManager.formatValue();
        } else {
          value = this._formatDate(date, this._config.format);
        }
      } else {
        value = date.toLocaleDateString();
      }
      this._input.value = value;
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

  // Ensure open() and close() methods are present and correct
  public open() {
    if (this._isOpen) return;
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