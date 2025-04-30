import { LocaleConfigInterface } from './types';

/**
 * Main container template for the datepicker dropdown
 */
export const datepickerContainerTemplate = `
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
    <div class="border-b border-gray-200 pb-3 mb-3">
      <div class="flex items-center justify-between px-3 pt-3">
        <button type="button" class="p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Previous Month">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="flex items-center justify-center">
          <select class="bg-transparent border border-gray-200 rounded px-2 py-1 mr-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Month"></select>
          <select class="bg-transparent border border-gray-200 rounded px-2 py-1 ml-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select Year"></select>
          <span class="font-medium px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"></span>
        </div>
        <button type="button" class="p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Next Month">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
    <div class="flex flex-wrap gap-4"></div>
    <div class="py-3 border-t border-gray-200 mt-3 hidden">
      <div class="text-sm font-medium text-gray-600 mb-2 text-center">Time</div>
      <div class="flex items-center justify-center gap-2">
        <div class="relative w-12">
          <input type="text" class="w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="23" aria-label="Hour">
        </div>
        <span class="text-xl font-medium text-gray-500 leading-none">:</span>
        <div class="relative w-12">
          <input type="text" class="w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="59" aria-label="Minute">
        </div>
        <span class="text-xl font-medium text-gray-500 leading-none">:</span>
        <div class="relative w-12">
          <input type="text" class="w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" max="59" aria-label="Second">
        </div>
        <div class="flex flex-col gap-1">
          <button type="button" class="px-2 py-1 text-xs border border-gray-300 rounded-t bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" aria-label="AM"></button>
          <button type="button" class="px-2 py-1 text-xs border border-gray-300 rounded-b bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" aria-label="PM"></button>
        </div>
      </div>
    </div>
    <div class="flex justify-between pt-3 border-t border-gray-200 mt-3 px-3 pb-3">
      <button type="button" class="px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">Today</button>
      <button type="button" class="px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">Clear</button>
      <button type="button" class="px-3 py-1.5 text-sm border border-blue-500 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Apply</button>
    </div>
  </div>
`;

/**
 * Input wrapper template with calendar icon
 */
export const inputWrapperTemplate = `
  <div class="relative flex items-center">
    <div class="flex-grow segmented-input-container"></div>
    <button type="button" class="absolute right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 calendar-toggle-btn" aria-label="Toggle Calendar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </button>
  </div>
`;

/**
 * Template for segmented date input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @returns HTML for segmented input
 */
export function segmentedDateInputTemplate(format: string): string {
	// Parse the format to determine the order of segments and separators
	const formatSegments = parseFormatString(format);
	const segments = [];
	const separators = [];

	// Extract segments and separators
	for (let i = 0; i < formatSegments.length; i++) {
		const seg = formatSegments[i];
		if (seg.type === 'separator') {
			separators.push(seg.value);
		} else {
			segments.push(seg);
		}
	}

	// Ensure we have exactly 3 segments (day, month, year) and 2 separators
	if (segments.length !== 3 || separators.length !== 2) {
		console.warn('Invalid date format for segmented input:', format);
		// Fall back to default MM/dd/yyyy
		return getDefaultSegmentedTemplate();
	}

	// Create the template based on the parsed format
	return `
    <div class="flex items-center bg-transparent text-sm">
      <div
        class="${getSegmentWidthClass(
					segments[0].type
				)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="${getSegmentName(segments[0].type)}"
        tabindex="0"
        role="button"
        aria-label="${getSegmentLabel(segments[0].type)}">${
		segments[0].placeholder
	}</div>
      <span class="text-gray-500 mx-0.5">${separators[0]}</span>
      <div
        class="${getSegmentWidthClass(
					segments[1].type
				)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="${getSegmentName(segments[1].type)}"
        tabindex="0"
        role="button"
        aria-label="${getSegmentLabel(segments[1].type)}">${
		segments[1].placeholder
	}</div>
      <span class="text-gray-500 mx-0.5">${separators[1]}</span>
      <div
        class="${getSegmentWidthClass(
					segments[2].type
				)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="${getSegmentName(segments[2].type)}"
        tabindex="0"
        role="button"
        aria-label="${getSegmentLabel(segments[2].type)}">${
		segments[2].placeholder
	}</div>
    </div>
  `;
}

/**
 * Template for segmented date range input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @param rangeSeparator - Separator between start and end dates
 * @returns HTML for segmented range input
 */
export function segmentedDateRangeInputTemplate(
	format: string,
	rangeSeparator: string = ' - '
): string {
	// Parse the format to determine the order of segments and separators
	const formatSegments = parseFormatString(format);
	const segments = [];
	const separators = [];

	// Extract segments and separators
	for (let i = 0; i < formatSegments.length; i++) {
		const seg = formatSegments[i];
		if (seg.type === 'separator') {
			separators.push(seg.value);
		} else {
			segments.push(seg);
		}
	}

	// Ensure we have exactly 3 segments (day, month, year) and 2 separators
	if (segments.length !== 3 || separators.length !== 2) {
		console.warn('Invalid date format for segmented range input:', format);
		// Fall back to default MM/dd/yyyy
		return getDefaultSegmentedRangeTemplate(rangeSeparator);
	}

	// Create the template based on the parsed format
	return `
    <div class="flex items-center w-full">
      <div class="flex items-center bg-transparent text-sm">
        <div
          class="${getSegmentWidthClass(
						segments[0].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-${getSegmentName(segments[0].type)}"
          tabindex="0"
          role="button"
          aria-label="Start ${getSegmentLabel(segments[0].type)}">${
		segments[0].placeholder
	}</div>
        <span class="text-gray-500 mx-0.5">${separators[0]}</span>
        <div
          class="${getSegmentWidthClass(
						segments[1].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-${getSegmentName(segments[1].type)}"
          tabindex="0"
          role="button"
          aria-label="Start ${getSegmentLabel(segments[1].type)}">${
		segments[1].placeholder
	}</div>
        <span class="text-gray-500 mx-0.5">${separators[1]}</span>
        <div
          class="${getSegmentWidthClass(
						segments[2].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-${getSegmentName(segments[2].type)}"
          tabindex="0"
          role="button"
          aria-label="Start ${getSegmentLabel(segments[2].type)}">${
		segments[2].placeholder
	}</div>
      </div>
      <span class="mx-1 text-gray-500">${rangeSeparator}</span>
      <div class="flex items-center bg-transparent text-sm">
        <div
          class="${getSegmentWidthClass(
						segments[0].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-${getSegmentName(segments[0].type)}"
          tabindex="0"
          role="button"
          aria-label="End ${getSegmentLabel(segments[0].type)}">${
		segments[0].placeholder
	}</div>
        <span class="text-gray-500 mx-0.5">${separators[0]}</span>
        <div
          class="${getSegmentWidthClass(
						segments[1].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-${getSegmentName(segments[1].type)}"
          tabindex="0"
          role="button"
          aria-label="End ${getSegmentLabel(segments[1].type)}">${
		segments[1].placeholder
	}</div>
        <span class="text-gray-500 mx-0.5">${separators[1]}</span>
        <div
          class="${getSegmentWidthClass(
						segments[2].type
					)} bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-${getSegmentName(segments[2].type)}"
          tabindex="0"
          role="button"
          aria-label="End ${getSegmentLabel(segments[2].type)}">${
		segments[2].placeholder
	}</div>
      </div>
    </div>
  `;
}

/**
 * Parse a date format string into segments and separators
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @returns Array of parsed segments with type, placeholder and value
 */
function parseFormatString(
	format: string
): Array<{ type: string; value?: string; placeholder?: string }> {
	const result: Array<{ type: string; value?: string; placeholder?: string }> =
		[];
	let currentType = '';
	let currentValue = '';

	// Helper to add a segment to the result
	const addSegment = () => {
		if (!currentValue) return;

		if (/^d+$/.test(currentValue)) {
			result.push({
				type: 'day',
				value: currentValue,
				placeholder: currentValue.length === 1 ? 'd' : 'dd',
			});
		} else if (/^M+$/.test(currentValue)) {
			result.push({
				type: 'month',
				value: currentValue,
				placeholder: currentValue.length === 1 ? 'M' : 'MM',
			});
		} else if (/^y+$/.test(currentValue)) {
			result.push({
				type: 'year',
				value: currentValue,
				placeholder: currentValue.length <= 2 ? 'yy' : 'yyyy',
			});
		} else {
			// This is a separator
			result.push({
				type: 'separator',
				value: currentValue,
			});
		}

		currentValue = '';
	};

	// Process each character in the format string
	for (let i = 0; i < format.length; i++) {
		const char = format[i];

		if (/[dMy]/.test(char)) {
			// Date part characters
			if (currentType === char) {
				// Continue the current segment
				currentValue += char;
			} else {
				// Start a new segment
				addSegment();
				currentType = char;
				currentValue = char;
			}
		} else {
			// Separator character
			if (currentValue) {
				addSegment();
			}
			currentType = '';
			currentValue = char;
			addSegment();
		}
	}

	// Add the last segment
	addSegment();

	return result;
}

/**
 * Get a suitable CSS width class based on segment type
 *
 * @param type - Segment type (day, month, year)
 * @returns CSS class for width
 */
function getSegmentWidthClass(type: string): string {
	switch (type) {
		case 'day':
			return 'w-7';
		case 'month':
			return 'w-7';
		case 'year':
			return 'w-12';
		default:
			return 'w-7';
	}
}

/**
 * Get the segment name to be used in data-segment attribute
 *
 * @param type - Segment type (day, month, year)
 * @returns Segment name
 */
function getSegmentName(type: string): string {
	return type;
}

/**
 * Get a human-readable label for the segment
 *
 * @param type - Segment type (day, month, year)
 * @returns Human-readable label
 */
function getSegmentLabel(type: string): string {
	return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get the default segmented date input template (MM/dd/yyyy)
 *
 * @returns Default template HTML
 */
function getDefaultSegmentedTemplate(): string {
	return `
    <div class="flex items-center bg-transparent text-sm">
      <div
        class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="month"
        tabindex="0"
        role="button"
        aria-label="Month">MM</div>
      <span class="text-gray-500 mx-0.5">/</span>
      <div
        class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="day"
        tabindex="0"
        role="button"
        aria-label="Day">dd</div>
      <span class="text-gray-500 mx-0.5">/</span>
      <div
        class="w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
        data-segment="year"
        tabindex="0"
        role="button"
        aria-label="Year">yyyy</div>
    </div>
  `;
}

/**
 * Get the default segmented date range input template (MM/dd/yyyy)
 *
 * @param rangeSeparator - Separator between start and end dates
 * @returns Default range template HTML
 */
function getDefaultSegmentedRangeTemplate(
	rangeSeparator: string = ' - '
): string {
	return `
    <div class="flex items-center w-full">
      <div class="flex items-center bg-transparent text-sm">
        <div
          class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-month"
          tabindex="0"
          role="button"
          aria-label="Start Month">MM</div>
        <span class="text-gray-500 mx-0.5">/</span>
        <div
          class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-day"
          tabindex="0"
          role="button"
          aria-label="Start Day">dd</div>
        <span class="text-gray-500 mx-0.5">/</span>
        <div
          class="w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="start-year"
          tabindex="0"
          role="button"
          aria-label="Start Year">yyyy</div>
      </div>
      <span class="mx-1 text-gray-500">${rangeSeparator}</span>
      <div class="flex items-center bg-transparent text-sm">
        <div
          class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-month"
          tabindex="0"
          role="button"
          aria-label="End Month">MM</div>
        <span class="text-gray-500 mx-0.5">/</span>
        <div
          class="w-7 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-day"
          tabindex="0"
          role="button"
          aria-label="End Day">dd</div>
        <span class="text-gray-500 mx-0.5">/</span>
        <div
          class="w-12 bg-transparent text-center text-gray-900 cursor-pointer segment-part hover:bg-gray-100 rounded-sm px-1 py-0.5"
          data-segment="end-year"
          tabindex="0"
          role="button"
          aria-label="End Year">yyyy</div>
      </div>
    </div>
  `;
}

/**
 * Get an array of day names based on locale and format
 *
 * @param locale - Locale configuration
 * @param format - Format for day names ('long', 'short', or 'min')
 * @returns Array of day names
 */
function getDayNames(
	locale: LocaleConfigInterface,
	format: 'long' | 'short' | 'min'
): string[] {
	if (format === 'long') {
		return locale.dayNames;
	} else if (format === 'short') {
		return locale.dayNamesShort;
	} else {
		return locale.dayNamesMin;
	}
}

/**
 * Calendar grid template
 *
 * @param locale - Locale configuration for the datepicker
 * @param weekDayFormat - Format for the week day names ('long', 'short', or 'min')
 * @returns Calendar grid template HTML
 */
export function calendarGridTemplate(
	locale: LocaleConfigInterface,
	weekDayFormat: 'long' | 'short' | 'min'
): string {
	// Get the day names based on the locale and format
	const dayNames = getDayNames(locale, weekDayFormat);

	// Start from the first day of the week based on locale
	const firstDay = locale.firstDayOfWeek;
	const orderedDayNames = [
		...dayNames.slice(firstDay),
		...dayNames.slice(0, firstDay),
	];

	// Create the header with day names
	const headerCells = orderedDayNames
		.map(
			(day) =>
				`<th class="py-2 text-center text-xs font-medium text-gray-500 uppercase w-10">${day}</th>`
		)
		.join('');

	return `
    <div class="calendar-month-container">
      <table class="w-full border-collapse calendar-grid" role="grid" aria-labelledby="datepicker-month">
        <thead>
          <tr class="border-b border-gray-200">
            ${headerCells}
          </tr>
        </thead>
        <tbody class="border-none"></tbody>
      </table>
    </div>
  `;
}

/**
 * Calendar day cell template
 *
 * @param day - Day number
 * @param month - Month number (0-11)
 * @param year - Year (4 digits)
 * @param isCurrentMonth - Whether the day is in the current month
 * @param isToday - Whether the day is today
 * @param isSelected - Whether the day is selected
 * @param isDisabled - Whether the day is disabled
 * @param isRangeStart - Whether the day is the start of a range
 * @param isRangeEnd - Whether the day is the end of a range
 * @param isInRange - Whether the day is within a selected range
 * @param isWeekend - Whether the day is a weekend
 * @returns Day cell HTML
 */
export function dayTemplate(
	day: number,
	month: number = 0,
	year: number = 0,
	isCurrentMonth: boolean = true,
	isToday: boolean = false,
	isSelected: boolean = false,
	isDisabled: boolean = false,
	isRangeStart: boolean = false,
	isRangeEnd: boolean = false,
	isInRange: boolean = false,
	isWeekend: boolean = false
): string {
	// Base classes for day button
	let classes =
		'w-full h-8 rounded-full flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ';

	// Apply conditional classes
	if (!isCurrentMonth) {
		classes += 'current';
	} else if (isDisabled) {
		classes += 'text-gray-300 cursor-not-allowed ';
	} else if (isSelected || isRangeStart || isRangeEnd) {
		classes += 'bg-blue-600 text-white hover:bg-blue-700 ';
	} else if (isInRange) {
		classes += 'bg-blue-100 text-blue-800 hover:bg-blue-200 ';
	} else if (isToday) {
		classes += 'border border-blue-500 text-blue-600 hover:bg-blue-50 ';
	} else {
		classes +=
			'text-gray-700 hover:bg-gray-100 hover:bg-blue-50 hover:text-blue-600 ';
	}

	// Add weekend-specific styling
	if (isWeekend && !isSelected && !isRangeStart && !isRangeEnd && !isInRange) {
		classes += 'text-gray-500 ';
	}

	// Add attributes for hover states in range selection
	const hoverAttributes =
		isCurrentMonth && !isDisabled ? 'data-hover-date="true"' : '';

	// Create a date ID if month and year are provided
	let dateIdAttr = '';
	if (year > 0) {
		// Format: YYYY-MM-DD (ensures leading zeros for month and day)
		const monthStr = String(month + 1).padStart(2, '0'); // Add 1 since month is 0-indexed
		const dayStr = String(day).padStart(2, '0');
		const dateId = `${year}-${monthStr}-${dayStr}`;
		dateIdAttr = `data-date-id="${dateId}"`;
	}

	return `
    <td class="p-0.5">
      <button
        type="button"
        class="${classes.trim()}"
        data-date="${day}"
        ${dateIdAttr}
        ${isDisabled ? 'disabled' : ''}
        ${!isCurrentMonth ? 'tabindex="-1"' : ''}
        ${hoverAttributes}
        aria-selected="${isSelected}"
        aria-current="${isToday ? 'date' : 'false'}"
      >
        ${day}
      </button>
    </td>
  `;
}

/**
 * Month and year header template with buttons for toggling month/year view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current month (0-11)
 * @param currentYear - Current year
 * @returns Month and year header HTML
 */
export function monthYearSelectTemplate(
	locale: LocaleConfigInterface,
	currentMonth: number,
	currentYear: number
): string {
	return `
    <div class="flex items-center justify-center space-x-2">
      <button type="button"
        class="month-selector px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
        aria-label="Select Month">
        ${locale.monthNames[currentMonth]}
      </button>
      <button type="button"
        class="year-selector px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
        aria-label="Select Year">
        ${currentYear}
      </button>
    </div>
  `;
}

/**
 * Template for month selection view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current selected month (0-11)
 * @returns Month selection HTML
 */
export function monthSelectionTemplate(
	locale: LocaleConfigInterface,
	currentMonth: number
): string {
	const months = locale.monthNamesShort.map((month, idx) => {
		const isCurrentMonth = idx === currentMonth;
		const buttonClass = isCurrentMonth
			? 'py-3 px-2 text-sm rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
			: 'py-3 px-2 text-sm rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800';

		return `
      <button
        type="button"
        class="${buttonClass}"
        data-month="${idx}"
        aria-selected="${isCurrentMonth}"
        aria-label="${locale.monthNames[idx]}"
      >
        ${month}
      </button>
    `;
	});

	return `
    <div class="month-grid grid grid-cols-3 gap-2 p-2">
      ${months.join('')}
    </div>
  `;
}

/**
 * Template for year selection view
 *
 * @param startYear - Start year
 * @param endYear - End year
 * @param currentYear - Current selected year
 * @returns Year selection HTML
 */
export function yearSelectionTemplate(
	startYear: number,
	endYear: number,
	currentYear: number
): string {
	const years = [];

	for (let year = startYear; year <= endYear; year++) {
		const isCurrentYear = year === currentYear;
		const yearClass = isCurrentYear
			? 'py-3 px-2 text-center text-sm rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
			: 'py-3 px-2 text-center text-sm rounded-md bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800';

		years.push(`
      <button
        type="button"
        class="${yearClass}"
        data-year="${year}"
        aria-selected="${isCurrentYear}"
      >
        ${year}
      </button>
    `);
	}

	// Navigation to previous/next year ranges
	const prevYearsBtn = `
    <button
      type="button"
      class="py-2 px-2 text-center text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      data-year-nav="prev"
      aria-label="Previous years"
    >
      ${startYear - 1}...
    </button>
  `;

	const nextYearsBtn = `
    <button
      type="button"
      class="py-2 px-2 text-center text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      data-year-nav="next"
      aria-label="Next years"
    >
      ...${endYear + 1}
    </button>
  `;

	return `
    <div class="year-selection">
      <div class="year-navigation flex justify-between mb-2 px-2">
        ${prevYearsBtn}
        <span class="text-gray-700 font-medium">${startYear}-${endYear}</span>
        ${nextYearsBtn}
      </div>
      <div class="year-grid grid grid-cols-4 gap-2 p-2">
        ${years.join('')}
      </div>
    </div>
  `;
}

/**
 * Create placeholder template with placeholder text
 *
 * @param placeholder - Placeholder text to display
 * @returns HTML string for the placeholder
 */
export const placeholderTemplate = (placeholder: string): string => {
	return `<span class="text-gray-500">${placeholder}</span>`;
};

/**
 * Create a template for the display wrapper
 */
export function displayWrapperTemplate(classes: string = ''): string {
	return `
    <div class="kt-datepicker-display-wrapper relative w-full ${classes}"
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded="false"
    >
    </div>
  `;
}

/**
 * Create a template for the display element
 */
export function displayElementTemplate(
	placeholder: string,
	classes: string = ''
): string {
	return `
    <div class="kt-datepicker-display-element py-2 px-3 border rounded cursor-pointer ${classes}"
      tabindex="0"
      role="textbox"
      aria-label="${placeholder}"
      data-placeholder="${placeholder}"
    >
      <span class="kt-datepicker-display-text"></span>
    </div>
  `;
}
