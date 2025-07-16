/*
 * datepicker.ts - Main entry point for KTDatepicker (revamp)
 * Follows KTSelect pattern: extends KTComponent, uses template system, modular, extensible.
 */

import KTComponent from '../component';
import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './types';
import { getTemplateStrings, defaultTemplates } from './templates';
import { renderTemplateString, isTemplateFunction } from './template-utils';
import { KTDatepickerDropdown } from './dropdown';
import { defaultDatepickerConfig } from './config';

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
  private _dropdown: KTDatepickerDropdown | null = null;

  /**
   * Constructor: Initializes the datepicker component
   */
  constructor(element: HTMLElement, config?: KTDatepickerConfig) {
    super();
    this._init(element);
    this._buildConfig(config);
    this._templateSet = getTemplateStrings(this._config);
    this._state = this._getInitialState();
    (element as any).instance = this;
    this._render();
    this._attachEventListeners();
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
    // Render main container
    const tpl = this._templateSet.container || defaultTemplates.container;
    let html: string;
    if (isTemplateFunction(tpl)) {
      html = tpl({});
    } else {
      html = tpl as string;
    }
    this._container = document.createElement('div');
    this._container.innerHTML = html;
    this._container.classList.add('kt-datepicker-root');
    // Find or create input
    this._input = this._element.querySelector('input[data-kt-datepicker-input]') as HTMLInputElement;
    if (!this._input) {
      this._input = document.createElement('input');
      this._input.type = 'text';
      this._input.setAttribute('data-kt-datepicker-input', '');
      this._element.appendChild(this._input);
    }
    // Insert container after input
    this._input.after(this._container);
    // Create dropdown element for calendar UI
    let dropdownEl = this._container.querySelector('.kt-datepicker-dropdown') as HTMLElement;
    if (!dropdownEl) {
      dropdownEl = document.createElement('div');
      dropdownEl.className = 'kt-datepicker-dropdown hidden';
      this._container.appendChild(dropdownEl);
    } else {
      dropdownEl.innerHTML = '';
    }
    // Render header, calendar, footer inside dropdown
    this._renderHeaderTo(dropdownEl);
    this._renderCalendarTo(dropdownEl);
    this._renderFooterTo(dropdownEl);
    // Setup dropdown logic
    if (!this._dropdown) {
      this._dropdown = new KTDatepickerDropdown(this._container, this._input, dropdownEl, this._config);
    }
  }

  private _renderHeaderTo(target: HTMLElement) {
    const tpl = this._templateSet.header;
    const data = {
      month: this._state.currentDate.toLocaleString('default', { month: 'long' }),
      year: this._state.currentDate.getFullYear(),
      prevButton: '<button type="button" class="kt-datepicker-prev">&lt;</button>',
      nextButton: '<button type="button" class="kt-datepicker-next">&gt;</button>',
    };
    const headerHtml = isTemplateFunction(tpl)
      ? tpl(data)
      : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.header === 'string' ? defaultTemplates.header : ''), data);
    const header = document.createElement('div');
    header.innerHTML = headerHtml;
    header.classList.add('kt-datepicker-header');
    target.appendChild(header);
    // Add navigation event listeners
    const prevBtn = header.querySelector('.kt-datepicker-prev');
    const nextBtn = header.querySelector('.kt-datepicker-next');
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
    const calendarHtml = `<table class="kt-datepicker-calendar-table"><tbody>${rows.join('')}</tbody></table>`;
    const calendar = document.createElement('div');
    calendar.innerHTML = calendarHtml;
    calendar.classList.add('kt-datepicker-calendar');
    target.appendChild(calendar);
    // Add day cell click listeners
    calendar.querySelectorAll('td').forEach((td, i) => {
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
    const footer = document.createElement('div');
    footer.innerHTML = footerHtml;
    footer.classList.add('kt-datepicker-footer');
    target.appendChild(footer);
  }

  /**
   * Attach event listeners (MVP: open/close, input focus, etc.)
   */
  private _attachEventListeners() {
    if (this._input) {
      this._input.addEventListener('focus', () => this.open());
    }
    // Remove mousedown prevention (handled by dropdown)
  }

  /**
   * Open the datepicker
   */
  public open() {
    this._isOpen = true;
    if (this._dropdown) this._dropdown.open();
  }

  /**
   * Close the datepicker
   */
  public close() {
    this._isOpen = false;
    if (this._dropdown) this._dropdown.close();
  }

  /**
   * Set the selected date
   */
  public setDate(date: Date) {
    this._state.selectedDate = date;
    this._state.currentDate = date;
    // Update input value
    if (this._input) {
      // Use config.format or fallback to yyyy-mm-dd
      let value = '';
      if (this._config.format && typeof this._config.format === 'string') {
        // Simple format support: yyyy-mm-dd, dd/mm/yyyy, etc.
        value = this._formatDate(date, this._config.format);
      } else {
        value = date.toLocaleDateString();
      }
      this._input.value = value;
      // Fire change event
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