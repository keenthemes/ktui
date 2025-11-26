import { KTDatepickerConfig } from './types';

/**
 * Default configuration for KTDatepicker
 */
export const defaultDatepickerConfig: KTDatepickerConfig = {
  templates: {},
  format: 'yyyy-MM-dd',
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
  closeOnOutsideClick: true, // Default: close dropdown when clicking outside
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
  dropdownOffset: '0, 5',
  dropdownBoundary: 'clippingParents',
  dropdownWidth: undefined, // null/undefined to match toggle element width (like ktselect)
  dropdownZindex: undefined,
  dropdownContainer: undefined,
  // Custom classes for template elements
  classes: {},
};