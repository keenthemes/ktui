/*
 * calendar.ts - Calendar renderer for KTDatepicker
 * Renders the calendar grid (days) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../../templates/templates';
import { defaultTemplates } from '../../templates/templates';

/**
 * Renders the datepicker calendar and returns an HTMLElement.
 * @param tpl - The template string or function for the day cell
 * @param days - Array of Date objects for the calendar grid
 * @param currentDate - The current month being viewed
 * @param selectedDate - The currently selected date
 * @param onDayClick - Callback for day cell click, receives the Date
 * @param locale - Locale string for day name localization
 * @param selectedRange - Optional range selection
 */
export function renderCalendar(
  tpl: string | ((data: any) => string),
  days: Date[],
  currentDate: Date,
  selectedDate: Date | null,
  onDayClick: (date: Date) => void,
  locale?: string,
  selectedRange?: { start: Date | null; end: Date | null }
): HTMLElement {
  // Generate localized day names for the header
  const dayNames = [];
  const localeToUse = locale || 'en-US';
  for (let i = 0; i < 7; i++) {
    const date = new Date(2023, 0, i + 1); // Use January 1st, 2023 as reference (Sunday = 0)
    const dayName = date.toLocaleDateString(localeToUse, { weekday: 'short' });
    dayNames.push(dayName);
  }

  // Use template system for table, tbody, tr, td
  const tableTpl = defaultTemplates.calendarTable;
  const bodyTpl = defaultTemplates.calendarBody;
  const rowTpl = defaultTemplates.calendarRow;
  const rows = [];
  // Determine which day should be tabbable (selected, or today if none)
  let tabbableIndex = -1;
  if (selectedDate) {
    tabbableIndex = days.findIndex(d => isSameDay(d, selectedDate));
  }
  if (tabbableIndex === -1) {
    const today = new Date();
    tabbableIndex = days.findIndex(d => isSameDay(d, today));
  }
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const tds = week.map((day, j) => {
      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      let inRange = false;
      if (selectedRange && selectedRange.start && selectedRange.end) {
        inRange = day >= selectedRange.start && day <= selectedRange.end;
      }
      const dayIndex = i + j;
      const attributes = [
        isSelected ? 'data-selected="true" aria-selected="true" class="active"' : '',
        isToday ? 'data-today="true"' : '',
        isCurrentMonth ? '' : 'data-outside="true"',
        inRange ? 'data-in-range="true"' : '',
        `tabindex=\"${dayIndex === tabbableIndex ? '0' : '-1'}\"`
      ].filter(Boolean).join(' ');
      const data = { day: day.getDate(), date: day, isCurrentMonth, isToday, isSelected, inRange, attributes };
      return isTemplateFunction(tpl)
        ? tpl(data)
        : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.dayCell === 'string' ? defaultTemplates.dayCell : ''), data);
    }).join('');
    // Use row template
    const rowHtml = isTemplateFunction(rowTpl)
      ? rowTpl({ cells: tds })
      : (rowTpl as string).replace(/{{cells}}/g, tds);
    rows.push(rowHtml);
  }
  // Use body template
  const bodyHtml = isTemplateFunction(bodyTpl)
    ? bodyTpl({ rows: rows.join('') })
    : (bodyTpl as string).replace(/{{rows}}/g, rows.join(''));
  // Use table template with localized day names
  const tableHtml = isTemplateFunction(tableTpl)
    ? tableTpl({
        body: bodyHtml,
        sunday: dayNames[0],
        monday: dayNames[1],
        tuesday: dayNames[2],
        wednesday: dayNames[3],
        thursday: dayNames[4],
        friday: dayNames[5],
        saturday: dayNames[6]
      })
    : (tableTpl as string)
        .replace(/{{body}}/g, bodyHtml)
        .replace(/{{sunday}}/g, dayNames[0])
        .replace(/{{monday}}/g, dayNames[1])
        .replace(/{{tuesday}}/g, dayNames[2])
        .replace(/{{wednesday}}/g, dayNames[3])
        .replace(/{{thursday}}/g, dayNames[4])
        .replace(/{{friday}}/g, dayNames[5])
        .replace(/{{saturday}}/g, dayNames[6]);
  const calendarFrag = renderTemplateToDOM(tableHtml);
  const calendar = calendarFrag.firstElementChild as HTMLElement;
  // Add day cell click listeners (attach to button for accessibility)
  calendar.querySelectorAll('td[data-kt-datepicker-day]').forEach((td, i) => {
    const button = td.querySelector('button[data-day]');
    if (button) {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayObj = days[i];
        if (dayObj.getMonth() === currentDate.getMonth()) {
          onDayClick(dayObj);
        }
      });
    }
  });
  return calendar;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}