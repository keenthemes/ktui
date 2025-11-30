/*
 * calendar.ts - Calendar renderer for KTDatepicker
 * Renders the calendar grid (days) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../templates/templates';
import { defaultTemplates } from '../templates/templates';
import { formatDateToLocalString, parseLocalDate, getDateKey } from '../../utils/date-utils';

// Cache for localized day names to avoid regeneration on every render
const dayNameCache = new Map<string, string[]>();

/**
 * Gets localized day names for a given locale, using cache to avoid regeneration.
 * @param locale Locale string (e.g., 'en-US', 'de-DE')
 * @returns Array of 7 day names starting with Sunday
 */
function getDayNames(locale: string): string[] {
  if (dayNameCache.has(locale)) {
    return dayNameCache.get(locale)!;
  }

  const dayNames: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2023, 0, i + 1); // Use January 1st, 2023 as reference (Sunday = 0)
    const dayName = date.toLocaleDateString(locale, { weekday: 'short' });
    dayNames.push(dayName);
  }

  dayNameCache.set(locale, dayNames);
  return dayNames;
}

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
  // Get localized day names from cache
  const localeToUse = locale || 'en-US';
  const dayNames = getDayNames(localeToUse);

  // Cache "today" date object to avoid creating it multiple times
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = getDateKey(today);

  // Pre-compute date keys for selected dates for O(1) lookups
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedDatesKeys = selectedDates && selectedDates.length > 0
    ? new Set(selectedDates.map(d => getDateKey(d)))
    : null;
  const selectedRangeStartKey = selectedRange?.start ? getDateKey(selectedRange.start) : null;
  const selectedRangeEndKey = selectedRange?.end ? getDateKey(selectedRange.end) : null;

  // Use template system for table, tbody, tr, td
  const tableTpl = defaultTemplates.calendarTable;
  const bodyTpl = defaultTemplates.calendarBody;
  const rowTpl = defaultTemplates.calendarRow;
  const rows = [];
  // Determine which day should be tabbable (selected, or today if none) using date keys
  let tabbableIndex = -1;
  if (selectedDateKey !== null) {
    tabbableIndex = days.findIndex(d => getDateKey(d) === selectedDateKey);
  }
  if (tabbableIndex === -1 && selectedDatesKeys) {
    tabbableIndex = days.findIndex(d => selectedDatesKeys.has(getDateKey(d)));
  }
  if (tabbableIndex === -1 && selectedRangeStartKey !== null) {
    tabbableIndex = days.findIndex(d => getDateKey(d) === selectedRangeStartKey);
  }
  if (tabbableIndex === -1) {
    tabbableIndex = days.findIndex(d => getDateKey(d) === todayKey);
  }

  // Helper function to check if a date is selected using date keys for O(1) lookups
  const checkIsSelected = (day: Date): boolean => {
    const dayKey = getDateKey(day);
    // Check single date selection
    if (selectedDateKey !== null && dayKey === selectedDateKey) {
      return true;
    }
    // Check multi-date selection
    if (selectedDatesKeys && selectedDatesKeys.has(dayKey)) {
      return true;
    }
    // Check range selection start/end dates
    if (selectedRangeStartKey !== null && dayKey === selectedRangeStartKey) {
      return true;
    }
    if (selectedRangeEndKey !== null && dayKey === selectedRangeEndKey) {
      return true;
    }
    return false;
  };

  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const tds = week.map((day, j) => {
      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
      const isToday = getDateKey(day) === todayKey; // Use cached today key
      const isSelected = checkIsSelected(day);
      let inRange = false;
      if (selectedRange && selectedRange.start && selectedRange.end) {
        // Use date keys for efficient range comparison (no Date object creation needed)
        const dayKey = getDateKey(day);
        const startKey = getDateKey(selectedRange.start);
        const endKey = getDateKey(selectedRange.end);
        inRange = dayKey >= startKey && dayKey <= endKey;
      }
      const dayIndex = i + j;
      const dateLocal = formatDateToLocalString(day); // Store date as local timezone string for accurate matching
      const attributes = [
        isSelected ? 'data-kt-selected="true" aria-selected="true" class="active"' : '',
        isToday ? 'data-today="true"' : '',
        isCurrentMonth ? '' : 'data-outside="true"',
        // Use data-kt-hover-range for completed ranges too (consolidated with hover preview)
        inRange ? 'data-kt-hover-range="true"' : '',
        `data-date="${dateLocal}"`,
        `data-day-index="${dayIndex}"`, // Store day index for event delegation
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

  // Build cell reference cache for O(1) lookups during hover range updates
  // Map<dateKey, HTMLElement> for efficient cell lookups
  const cellCache = new Map<number, HTMLElement>();
  const allCells = calendar.querySelectorAll('td[data-kt-datepicker-day]');
  allCells.forEach((cell) => {
    const dateAttr = cell.getAttribute('data-date');
    if (dateAttr) {
      const cellDate = parseLocalDate(dateAttr);
      const dateKey = getDateKey(cellDate);
      cellCache.set(dateKey, cell as HTMLElement);
    }
  });

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

  // Helper function to find a date cell by date using cached cell references
  const findDateCell = (targetDate: Date): HTMLElement | null => {
    const targetKey = getDateKey(targetDate);
    return cellCache.get(targetKey) || null;
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

    // Add data-kt-hover-range to all dates in the range that are visible in the current calendar
    // Only apply to cells that exist in the current calendar view to prevent issues when range spans months
    rangeDates.forEach((date) => {
      const cell = findDateCell(date);
      if (cell && calendar.contains(cell)) {
        // Only set attribute if cell is actually in the current calendar view
        cell.setAttribute('data-kt-hover-range', '');
      }
    });
  };

  // Event delegation: attach single listeners to calendar table instead of individual cell listeners
  // This reduces memory footprint from 42+ listeners to 2-3 listeners
  calendar.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // Check if click is on a button or inside a button within a calendar cell
    const button = target.closest('button[data-day]') as HTMLButtonElement;
    if (!button) return;

    const cell = button.closest('td[data-kt-datepicker-day]') as HTMLElement;
    if (!cell) return;

    const dateAttr = cell.getAttribute('data-date');
    if (!dateAttr) return;

    const dayObj = parseLocalDate(dateAttr);
    if (dayObj.getMonth() === currentDate.getMonth()) {
      e.stopPropagation();
      onDayClick(dayObj);
    }
  });

  // Track currently hovered cell to prevent race conditions during fast mouse movement
  let currentHoveredCell: HTMLElement | null = null;
  let hoverTimeout: number | null = null;

  // Delegated hover handlers for single date hover and range preview
  // Use mouseover/mouseout on calendar with relatedTarget check for proper delegation
  calendar.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    // Check if mouseover is on a button or inside a button within a calendar cell
    const button = target.closest('button[data-day]') as HTMLButtonElement;
    if (!button) return;

    const cell = button.closest('td[data-kt-datepicker-day]') as HTMLElement;
    if (!cell) return;

    const dateAttr = cell.getAttribute('data-date');
    if (!dateAttr) return;

    // Clear any pending hover removal timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    // Clear previous hovered cell if different
    if (currentHoveredCell && currentHoveredCell !== cell) {
      currentHoveredCell.removeAttribute('data-kt-hover');
    }

    // Set new hovered cell
    currentHoveredCell = cell;
    cell.setAttribute('data-kt-hover', '');

    // If in range preview mode, update hover range
    if (isRangePreviewMode()) {
      const dayObj = parseLocalDate(dateAttr);
      updateHoverRange(dayObj);
    }
  });

  calendar.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;

    // Check if mouseout is leaving a button
    const button = target.closest('button[data-day]') as HTMLButtonElement;
    if (!button) return;

    // If moving to another element within the same calendar, don't remove hover
    if (relatedTarget && calendar.contains(relatedTarget)) {
      const relatedButton = relatedTarget.closest('button[data-day]');
      if (relatedButton) {
        // Moving to another button - mouseover will handle the transition
        return;
      }
    }

    const cell = button.closest('td[data-kt-datepicker-day]') as HTMLElement;
    if (!cell) return;

    // Clear any pending hover removal timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    // Use a small delay to prevent flickering when moving fast between cells
    // This allows mouseover on the next cell to fire first
    hoverTimeout = window.setTimeout(() => {
      // Only remove if this is still the current hovered cell
      if (currentHoveredCell === cell) {
        cell.removeAttribute('data-kt-hover');
        currentHoveredCell = null;
      }
      hoverTimeout = null;
    }, 50);

    // Note: Hover range clearing is handled at calendar level to prevent flickering
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

// Note: isSameDay function removed - all date comparisons now use date keys for better performance
// If needed elsewhere, use isSameLocalDay or isSameDayByKey from date-utils