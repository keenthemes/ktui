/*
 * calendar.ts - Calendar renderer for KTDatepicker
 * Renders the calendar grid (days) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../../templates/templates';
import { defaultTemplates } from '../../templates/templates';
import { formatDateToLocalString, parseLocalDate, isSameLocalDay } from '../../utils/date-utils';

/**
 * Renders the datepicker calendar and returns an HTMLElement.
 * @param tpl - The template string or function for the day cell
 * @param days - Array of Date objects for the calendar grid
 * @param currentDate - The current month being viewed
 * @param selectedDate - The currently selected date
 * @param onDayClick - Callback for day cell click, receives the Date
 * @param locale - Locale string for day name localization
 * @param selectedRange - Optional range selection
 * @param selectedDates - Optional array of selected dates for multi-date mode
 */
export function renderCalendar(
  tpl: string | ((data: any) => string),
  days: Date[],
  currentDate: Date,
  selectedDate: Date | null,
  onDayClick: (date: Date) => void,
  locale?: string,
  selectedRange?: { start: Date | null; end: Date | null },
  selectedDates?: Date[]
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
  if (tabbableIndex === -1 && selectedDates && selectedDates.length > 0) {
    tabbableIndex = days.findIndex(d => selectedDates.some(date => isSameDay(d, date)));
  }
  if (tabbableIndex === -1 && selectedRange && selectedRange.start) {
    tabbableIndex = days.findIndex(d => isSameDay(d, selectedRange.start!));
  }
  if (tabbableIndex === -1) {
    const today = new Date();
    tabbableIndex = days.findIndex(d => isSameDay(d, today));
  }
  // Helper function to check if a date is selected
  const checkIsSelected = (day: Date): boolean => {
    // Check single date selection
    if (selectedDate && isSameDay(day, selectedDate)) {
      return true;
    }
    // Check multi-date selection
    if (selectedDates && selectedDates.length > 0) {
      return selectedDates.some(date => isSameDay(day, date));
    }
    // Check range selection start/end dates
    if (selectedRange) {
      if (selectedRange.start && isSameDay(day, selectedRange.start)) {
        return true;
      }
      if (selectedRange.end && isSameDay(day, selectedRange.end)) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const tds = week.map((day, j) => {
      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
      const isToday = isSameDay(day, new Date());
      const isSelected = checkIsSelected(day);
      let inRange = false;
      if (selectedRange && selectedRange.start && selectedRange.end) {
        // Normalize dates to midnight for accurate date-only comparison
        const normalizedDay = new Date(day);
        normalizedDay.setHours(0, 0, 0, 0);
        const normalizedStart = new Date(selectedRange.start);
        normalizedStart.setHours(0, 0, 0, 0);
        const normalizedEnd = new Date(selectedRange.end);
        normalizedEnd.setHours(0, 0, 0, 0);
        inRange = normalizedDay >= normalizedStart && normalizedDay <= normalizedEnd;
      }
      const dayIndex = i + j;
      const dateLocal = formatDateToLocalString(day); // Store date as local timezone string for accurate matching
      const attributes = [
        isSelected ? 'data-kt-selected="true" aria-selected="true" class="active"' : '',
        isToday ? 'data-today="true"' : '',
        isCurrentMonth ? '' : 'data-outside="true"',
        inRange ? 'data-in-range="true"' : '',
        `data-date="${dateLocal}"`,
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

  // Store selectedRange state on the calendar element so hover handlers can access current state
  // This allows the state to be updated without re-rendering the entire calendar
  // The _updateCalendar() method will update these attributes when the state changes
  if (selectedRange) {
    if (selectedRange.start) {
      calendar.setAttribute('data-kt-range-start', formatDateToLocalString(selectedRange.start));
    }
    if (selectedRange.end) {
      calendar.setAttribute('data-kt-range-end', formatDateToLocalString(selectedRange.end));
    }
  }

  // Helper function to parse ISO date string (YYYY-MM-DD) as local date to avoid timezone issues
  const parseLocalDateFromAttr = (dateStr: string): Date => {
    // Parse YYYY-MM-DD string and create local date at midnight
    return parseLocalDate(dateStr);
  };

  // Helper function to get current selectedRange from calendar element data attributes
  const getCurrentSelectedRange = (): { start: Date | null; end: Date | null } | null => {
    const startAttr = calendar.getAttribute('data-kt-range-start');
    const endAttr = calendar.getAttribute('data-kt-range-end');

    if (!startAttr && !endAttr) {
      return null;
    }

    return {
      start: startAttr ? parseLocalDateFromAttr(startAttr) : null,
      end: endAttr ? parseLocalDateFromAttr(endAttr) : null
    };
  };

  // Helper function to check if we're in range preview mode (checked dynamically)
  const isRangePreviewMode = (): boolean => {
    const currentRange = getCurrentSelectedRange();
    return !!(currentRange && currentRange.start && !currentRange.end);
  };

  // Helper function to clear all hover range attributes
  const clearHoverRange = () => {
    calendar.querySelectorAll('[data-kt-hover-range]').forEach((cell) => {
      (cell as HTMLElement).removeAttribute('data-kt-hover-range');
    });
  };

  // Helper function to get all dates in a range (inclusive)
  const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize dates to midnight for accurate comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Determine the actual start and end (handles reverse ranges)
    const actualStart = start <= end ? start : end;
    const actualEnd = start <= end ? end : start;

    // Generate all dates in the range
    const current = new Date(actualStart);
    while (current <= actualEnd) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Helper function to find a date cell by date
  const findDateCell = (targetDate: Date): HTMLElement | null => {
    const targetLocal = formatDateToLocalString(targetDate);
    const cell = calendar.querySelector(`[data-kt-datepicker-day][data-date="${targetLocal}"]`) as HTMLElement;
    return cell;
  };

  // Helper function to update hover range preview
  const updateHoverRange = (hoveredDate: Date) => {
    if (!isRangePreviewMode()) {
      return;
    }

    // Get current range state from calendar element (reads dynamically)
    const currentRange = getCurrentSelectedRange();
    if (!currentRange?.start) {
      return;
    }

    // Normalize hovered date
    const normalizedHovered = new Date(hoveredDate);
    normalizedHovered.setHours(0, 0, 0, 0);

    // Normalize start date
    const normalizedStart = new Date(currentRange.start);
    normalizedStart.setHours(0, 0, 0, 0);

    // Clear previous hover range
    clearHoverRange();

    // Calculate range between start date and hovered date
    const rangeDates = getDatesInRange(normalizedStart, normalizedHovered);

    // Add data-kt-hover-range to all dates in the range
    rangeDates.forEach((date) => {
      const cell = findDateCell(date);
      if (cell) {
        cell.setAttribute('data-kt-hover-range', '');
      }
    });
  };  // Add day cell click and hover listeners (attach to button for accessibility)
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

      // Add hover event listeners
      const cell = td as HTMLElement;
      const dayObj = days[i];

      button.addEventListener('mouseenter', () => {
        // Always set single date hover
        cell.setAttribute('data-kt-hover', '');

        // If in range preview mode, update hover range
        if (isRangePreviewMode()) {
          updateHoverRange(dayObj);
        }
      });

      button.addEventListener('mouseleave', () => {
        // Always remove single date hover
        cell.removeAttribute('data-kt-hover');

        // Note: Hover range clearing is handled at calendar level to prevent flickering
      });
    }
  });

  // Track hover state to prevent flickering when moving between dates
  let hoverRangeClearTimeout: number | null = null;

  // Handle calendar-level mouseleave to clear hover range when mouse leaves calendar entirely
  calendar.addEventListener('mouseleave', (e) => {
    if (!isRangePreviewMode()) return;

    // Check if we're moving to another button within the calendar
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
    if (relatedTarget && calendar.contains(relatedTarget)) {
      // Mouse is moving to another element within the calendar, don't clear
      return;
    }

    // Clear hover range with a small delay to allow smooth transitions
    if (hoverRangeClearTimeout) {
      clearTimeout(hoverRangeClearTimeout);
    }
    hoverRangeClearTimeout = window.setTimeout(() => {
      clearHoverRange();
      hoverRangeClearTimeout = null;
    }, 50);
  });

  // Clear timeout if mouse re-enters calendar
  calendar.addEventListener('mouseenter', () => {
    if (hoverRangeClearTimeout) {
      clearTimeout(hoverRangeClearTimeout);
      hoverRangeClearTimeout = null;
    }
  });

  return calendar;
}

function isSameDay(a: Date, b: Date): boolean {
  // Use the utility function for consistent local timezone comparison
  return isSameLocalDay(a, b);
}