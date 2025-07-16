/*
 * header.ts - Header renderer for KTDatepicker
 * Renders the calendar header (month, year, navigation buttons) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../utils/template';
import { defaultTemplates } from '../templates';

/**
 * Renders the datepicker header and returns an HTMLElement.
 * @param tpl - The template string or function for the header
 * @param data - Data for the template (month, year, prevButton, nextButton)
 * @param onPrev - Callback for previous month button
 * @param onNext - Callback for next month button
 */
export function renderHeader(
  tpl: string | ((data: any) => string),
  data: any,
  onPrev: (e: Event) => void,
  onNext: (e: Event) => void
): HTMLElement {
  const headerHtml = isTemplateFunction(tpl)
    ? tpl(data)
    : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.header === 'string' ? defaultTemplates.header : ''), data);
  const headerFrag = renderTemplateToDOM(headerHtml);
  const header = headerFrag.firstElementChild as HTMLElement;
  // Add navigation event listeners
  const prevBtn = header.querySelector('[data-kt-datepicker-prev]');
  const nextBtn = header.querySelector('[data-kt-datepicker-next]');
  if (prevBtn) prevBtn.addEventListener('click', onPrev);
  if (nextBtn) nextBtn.addEventListener('click', onNext);
  return header;
}