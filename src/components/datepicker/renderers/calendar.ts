/*
 * calendar.ts - Calendar renderer for KTDatepicker
 * Renders the calendar grid (days) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../utils/template';
import { defaultTemplates } from '../templates';

/**
 * Renders the datepicker calendar and returns an HTMLElement.
 * @param tpl - The template string or function for the day cell
 * @param days - Array of Date objects for the calendar grid
 * @param currentDate - The current month being viewed
 * @param selectedDate - The currently selected date
 * @param onDayClick - Callback for day cell click, receives the Date
 */
export function renderCalendar(
  tpl: string | ((data: any) => string),
  days: Date[],
  currentDate: Date,
  selectedDate: Date | null,
  onDayClick: (date: Date) => void,
  selectedRange?: { start: Date | null; end: Date | null }
): HTMLElement {
  // Use template system for table, tbody, tr, td
  const tableTpl = defaultTemplates.calendarTable;
  const bodyTpl = defaultTemplates.calendarBody;
  const rowTpl = defaultTemplates.calendarRow;
  const rows = [];
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
      const attributes = [
        isSelected ? 'class="active" aria-selected="true"' : '',
        isToday ? 'data-today="true"' : '',
        isCurrentMonth ? '' : 'data-outside="true"',
        inRange ? 'data-in-range="true"' : '',
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
  // Use table template
  const tableHtml = isTemplateFunction(tableTpl)
    ? tableTpl({ body: bodyHtml })
    : (tableTpl as string).replace(/{{body}}/g, bodyHtml);
  const calendarFrag = renderTemplateToDOM(tableHtml);
  const calendar = calendarFrag.firstElementChild as HTMLElement;
  // Add day cell click listeners (attach to button for accessibility)
  calendar.querySelectorAll('td[data-kt-datepicker-day]').forEach((td, i) => {
    const button = td.querySelector('button[data-day]');
    if (button) {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🗓️ [KTDatepicker] Day button clicked:', days[i]);
        const dayObj = days[i];
        if (dayObj.getMonth() === currentDate.getMonth()) {
          onDayClick(dayObj);
        }
      });
    }
  });
  console.log('🗓️ [KTDatepicker] Calendar rendered:', calendar);
  return calendar;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}