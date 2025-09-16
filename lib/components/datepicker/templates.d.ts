/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { LocaleConfigInterface } from './types';
/**
 * Main container template for the datepicker dropdown
 */
export declare const datepickerContainerTemplate = "\n  <div class=\"bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden\">\n    <div class=\"border-b border-gray-200 pb-3 mb-3\">\n      <div class=\"flex items-center justify-between px-3 pt-3\">\n        <button type=\"button\" class=\"p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Previous Month\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <polyline points=\"15 18 9 12 15 6\"></polyline>\n          </svg>\n        </button>\n        <div class=\"flex items-center justify-center\">\n          <select class=\"bg-transparent border border-gray-200 rounded px-2 py-1 mr-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Select Month\"></select>\n          <select class=\"bg-transparent border border-gray-200 rounded px-2 py-1 ml-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Select Year\"></select>\n          <span class=\"font-medium px-2 py-1 rounded hover:bg-gray-100 cursor-pointer\"></span>\n        </div>\n        <button type=\"button\" class=\"p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500\" aria-label=\"Next Month\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n            <polyline points=\"9 18 15 12 9 6\"></polyline>\n          </svg>\n        </button>\n      </div>\n    </div>\n    <div class=\"flex flex-wrap gap-4\"></div>\n    <div class=\"py-3 border-t border-gray-200 mt-3 hidden\">\n      <div class=\"text-sm font-medium text-gray-600 mb-2 text-center\">Time</div>\n      <div class=\"flex items-center justify-center gap-2\">\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"23\" aria-label=\"Hour\">\n        </div>\n        <span class=\"text-xl font-medium text-gray-500 leading-none\">:</span>\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"59\" aria-label=\"Minute\">\n        </div>\n        <span class=\"text-xl font-medium text-gray-500 leading-none\">:</span>\n        <div class=\"relative w-12\">\n          <input type=\"text\" class=\"w-full py-1.5 px-1.5 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\" min=\"0\" max=\"59\" aria-label=\"Second\">\n        </div>\n        <div class=\"flex flex-col gap-1\">\n          <button type=\"button\" class=\"px-2 py-1 text-xs border border-gray-300 rounded-t bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center\" aria-label=\"AM\"></button>\n          <button type=\"button\" class=\"px-2 py-1 text-xs border border-gray-300 rounded-b bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center\" aria-label=\"PM\"></button>\n        </div>\n      </div>\n    </div>\n    <div class=\"flex justify-between pt-3 border-t border-gray-200 mt-3 px-3 pb-3\">\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500\">Today</button>\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500\">Clear</button>\n      <button type=\"button\" class=\"px-3 py-1.5 text-sm border border-blue-500 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500\">Apply</button>\n    </div>\n  </div>\n";
/**
 * Input wrapper template with calendar icon
 */
export declare const inputWrapperTemplate = "\n  <div class=\"relative flex items-center\">\n    <div class=\"flex-grow segmented-input-container\"></div>\n    <button type=\"button\" class=\"absolute right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 calendar-toggle-btn\" aria-label=\"Toggle Calendar\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect>\n        <line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line>\n        <line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line>\n        <line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line>\n      </svg>\n    </button>\n  </div>\n";
/**
 * Template for segmented date input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @returns HTML for segmented input
 */
export declare function segmentedDateInputTemplate(format: string): string;
/**
 * Template for segmented date range input
 *
 * @param format - Date format string (e.g., 'dd/MM/yyyy')
 * @param rangeSeparator - Separator between start and end dates
 * @returns HTML for segmented range input
 */
export declare function segmentedDateRangeInputTemplate(format: string, rangeSeparator?: string): string;
/**
 * Calendar grid template
 *
 * @param locale - Locale configuration for the datepicker
 * @param weekDayFormat - Format for the week day names ('long', 'short', or 'min')
 * @returns Calendar grid template HTML
 */
export declare function calendarGridTemplate(locale: LocaleConfigInterface, weekDayFormat: 'long' | 'short' | 'min'): string;
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
export declare function dayTemplate(day: number, month?: number, year?: number, isCurrentMonth?: boolean, isToday?: boolean, isSelected?: boolean, isDisabled?: boolean, isRangeStart?: boolean, isRangeEnd?: boolean, isInRange?: boolean, isWeekend?: boolean): string;
/**
 * Month and year header template with buttons for toggling month/year view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current month (0-11)
 * @param currentYear - Current year
 * @returns Month and year header HTML
 */
export declare function monthYearSelectTemplate(locale: LocaleConfigInterface, currentMonth: number, currentYear: number): string;
/**
 * Template for month selection view
 *
 * @param locale - Locale configuration
 * @param currentMonth - Current selected month (0-11)
 * @returns Month selection HTML
 */
export declare function monthSelectionTemplate(locale: LocaleConfigInterface, currentMonth: number): string;
/**
 * Template for year selection view
 *
 * @param startYear - Start year
 * @param endYear - End year
 * @param currentYear - Current selected year
 * @returns Year selection HTML
 */
export declare function yearSelectionTemplate(startYear: number, endYear: number, currentYear: number): string;
/**
 * Create placeholder template with placeholder text
 *
 * @param placeholder - Placeholder text to display
 * @returns HTML string for the placeholder
 */
export declare const placeholderTemplate: (placeholder: string) => string;
/**
 * Create a template for the display wrapper
 */
export declare function displayWrapperTemplate(classes?: string): string;
/**
 * Create a template for the display element
 */
export declare function displayElementTemplate(placeholder: string, classes?: string): string;
//# sourceMappingURL=templates.d.ts.map