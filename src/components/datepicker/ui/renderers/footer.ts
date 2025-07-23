/*
 * footer.ts - Footer renderer for KTDatepicker
 * Renders the calendar footer (today, clear, apply buttons) using provided template and data.
 */

import { isTemplateFunction, renderTemplateString, renderTemplateToDOM } from '../../utils/template-utils';
import { defaultTemplates } from '../../templates/templates';

/**
 * Renders the datepicker footer and returns an HTMLElement.
 * @param tpl - The template string or function for the footer
 * @param data - Data for the template (todayButton, clearButton, applyButton, etc.)
 * @param onToday - Callback for today button
 * @param onClear - Callback for clear button
 * @param onApply - Callback for apply button
 */
export function renderFooter(
  tpl: string | ((data: any) => string),
  data: any,
  onToday?: (e: Event) => void,
  onClear?: (e: Event) => void,
  onApply?: (e: Event) => void
): HTMLElement {
  const footerHtml = isTemplateFunction(tpl)
    ? tpl(data)
    : renderTemplateString(typeof tpl === 'string' ? tpl : (typeof defaultTemplates.footer === 'string' ? defaultTemplates.footer : ''), data);
  const footerFrag = renderTemplateToDOM(footerHtml);
  const footer = footerFrag.firstElementChild as HTMLElement;
  // Add button event listeners if present
  if (onToday) {
    const todayBtn = footer.querySelector('[data-kt-datepicker-today]');
    if (todayBtn) todayBtn.addEventListener('click', onToday);
  }
  if (onClear) {
    const clearBtn = footer.querySelector('[data-kt-datepicker-clear]');
    if (clearBtn) clearBtn.addEventListener('click', onClear);
  }
  if (onApply) {
    const applyBtn = footer.querySelector('[data-kt-datepicker-apply]');
    if (applyBtn) applyBtn.addEventListener('click', onApply);
  }
  return footer;
}