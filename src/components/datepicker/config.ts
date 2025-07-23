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
  closeOnSelect: false, // Default: don't close dropdown by default
  // Number of calendar months to display side-by-side (horizontal). Default: 1.
  visibleMonths: 1,
  // Time-related defaults
  enableTime: false,
  timeGranularity: 'minute',
  timeFormat: '24h',
  minTime: undefined,
  maxTime: undefined,
  timeStep: 1,
  // Dropdown defaults
  dropdownPlacement: 'bottom-start',
  dropdownOffset: '0,8',
  dropdownBoundary: 'clippingParents',
  dropdownWidth: 'auto',
  dropdownZindex: undefined,
  dropdownContainer: undefined,
  // Custom classes for template elements
  classes: {},
};