import { KTDatepickerConfig } from './types';

/**
 * Default configuration for KTDatepicker
 */
export const defaultDatepickerConfig: KTDatepickerConfig = {
  templates: {},
  format: 'yyyy-mm-dd',
  range: false,
  multiDate: false,
  minDate: undefined,
  maxDate: undefined,
  disabled: false,
  locale: 'en-US',
  placeholder: '',
  value: undefined,
  valueRange: undefined,
  values: undefined,
  showOnFocus: true,
  closeOnSelect: true,
  // Number of calendar months to display side-by-side (horizontal). Default: 1.
  visibleMonths: 1,
};