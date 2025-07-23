/*
 * time-picker.ts - Time picker renderer for KTDatepicker
 * Provides time picker UI components with increment/decrement controls.
 * Follows HeroUI best practices for time picker functionality.
 */

import { TimeState } from '../../config/types';
import { formatTime, getTimeStepOptions, validateTime } from '../../utils/time-utils';
import { KTDatepickerConfig } from '../../config/types';

/**
 * Options for rendering time picker
 */
export interface TimePickerOptions {
  time: TimeState;
  granularity: 'second' | 'minute' | 'hour';
  format: '12h' | '24h';
  minTime?: string;
  maxTime?: string;
  timeStep?: number;
  disabled?: boolean;
  onChange?: (time: TimeState) => void;
  templates?: any;
}

/**
 * Render time picker component
 * @param container Container element
 * @param options Time picker options
 * @returns Cleanup function
 */
export function renderTimePicker(container: HTMLElement, options: TimePickerOptions): () => void {
  const { time, granularity, format, minTime, maxTime, timeStep = 1, disabled = false, onChange, templates } = options;

  // Clear container
  container.innerHTML = '';

  // Create time picker wrapper
  const timePickerWrapper = document.createElement('div');
  timePickerWrapper.className = 'kt-datepicker-time-picker';
  timePickerWrapper.setAttribute('data-kt-datepicker-time-picker', '');

  // Create time display
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'kt-datepicker-time-display';
  timeDisplay.setAttribute('data-kt-datepicker-time-display', '');
  timeDisplay.textContent = formatTime(time, granularity, format);

  // Create time controls
  const timeControls = document.createElement('div');
  timeControls.className = 'kt-datepicker-time-controls';
  timeControls.setAttribute('data-kt-datepicker-time-controls', '');

  // Create increment/decrement buttons for each time unit
  const timeUnits = getTimeUnits(granularity);

  timeUnits.forEach((unit, index) => {
    const unitContainer = document.createElement('div');
    unitContainer.className = 'kt-datepicker-time-unit';
    unitContainer.setAttribute('data-kt-datepicker-time-unit', unit);

    // Up button
    const upButton = document.createElement('button');
    upButton.className = 'kt-datepicker-time-up';
    upButton.setAttribute('data-kt-datepicker-time-up', '');
    upButton.setAttribute('aria-label', `Increment ${unit}`);
    upButton.innerHTML = '▲';
    upButton.disabled = disabled;

    // Value display
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'kt-datepicker-time-value';
    valueDisplay.setAttribute('data-kt-datepicker-time-value', '');
    valueDisplay.textContent = getTimeUnitValue(time, unit, format);

    // Down button
    const downButton = document.createElement('button');
    downButton.className = 'kt-datepicker-time-down';
    downButton.setAttribute('data-kt-datepicker-time-down', '');
    downButton.setAttribute('aria-label', `Decrement ${unit}`);
    downButton.innerHTML = '▼';
    downButton.disabled = disabled;

    // Add event listeners
    upButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = incrementTimeUnit(time, unit, timeStep, format);
        if (validateTime(newTime, minTime, maxTime).isValid) {
          onChange(newTime);
        }
      }
    });

    downButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = decrementTimeUnit(time, unit, timeStep, format);
        if (validateTime(newTime, minTime, maxTime).isValid) {
          onChange(newTime);
        }
      }
    });

    // Assemble unit container
    unitContainer.appendChild(upButton);
    unitContainer.appendChild(valueDisplay);
    unitContainer.appendChild(downButton);

    // Add separator if not last unit
    if (index < timeUnits.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'kt-datepicker-time-separator';
      separator.textContent = ':';
      timeControls.appendChild(separator);
    }

    timeControls.appendChild(unitContainer);
  });

  // Add AM/PM toggle for 12-hour format
  if (format === '12h') {
    const ampmContainer = document.createElement('div');
    ampmContainer.className = 'kt-datepicker-time-ampm';
    ampmContainer.setAttribute('data-kt-datepicker-time-ampm', '');

    const ampmButton = document.createElement('button');
    ampmButton.className = 'kt-datepicker-time-ampm-button';
    ampmButton.setAttribute('data-kt-datepicker-time-ampm-button', '');
    ampmButton.textContent = time.hour >= 12 ? 'PM' : 'AM';
    ampmButton.disabled = disabled;

    ampmButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = { ...time };
        if (newTime.hour >= 12) {
          newTime.hour = newTime.hour - 12;
        } else {
          newTime.hour = newTime.hour + 12;
        }
        if (validateTime(newTime, minTime, maxTime).isValid) {
          onChange(newTime);
        }
      }
    });

    ampmContainer.appendChild(ampmButton);
    timeControls.appendChild(ampmContainer);
  }

  // Assemble time picker
  timePickerWrapper.appendChild(timeDisplay);
  timePickerWrapper.appendChild(timeControls);
  container.appendChild(timePickerWrapper);

  // Return cleanup function
  return () => {
    container.innerHTML = '';
  };
}

/**
 * Get time units based on granularity
 * @param granularity Time granularity
 * @returns Array of time unit names
 */
function getTimeUnits(granularity: 'second' | 'minute' | 'hour'): string[] {
  switch (granularity) {
    case 'hour':
      return ['hour'];
    case 'minute':
      return ['hour', 'minute'];
    case 'second':
      return ['hour', 'minute', 'second'];
    default:
      return ['hour', 'minute'];
  }
}

/**
 * Get display value for time unit
 * @param time TimeState object
 * @param unit Time unit
 * @param format Time format
 * @returns Formatted unit value
 */
function getTimeUnitValue(time: TimeState, unit: string, format: '12h' | '24h'): string {
  switch (unit) {
    case 'hour':
      let hour = time.hour;
      if (format === '12h') {
        hour = hour % 12;
        hour = hour === 0 ? 12 : hour;
      }
      return hour.toString().padStart(2, '0');
    case 'minute':
      return time.minute.toString().padStart(2, '0');
    case 'second':
      return time.second.toString().padStart(2, '0');
    default:
      return '';
  }
}

/**
 * Increment time unit
 * @param time Current time
 * @param unit Time unit to increment
 * @param step Step increment
 * @param format Time format
 * @returns New time state
 */
function incrementTimeUnit(time: TimeState, unit: string, step: number, format: '12h' | '24h'): TimeState {
  const newTime = { ...time };

  switch (unit) {
    case 'hour':
      newTime.hour = (newTime.hour + step) % 24;
      break;
    case 'minute':
      newTime.minute = (newTime.minute + step) % 60;
      break;
    case 'second':
      newTime.second = (newTime.second + step) % 60;
      break;
  }

  return newTime;
}

/**
 * Decrement time unit
 * @param time Current time
 * @param unit Time unit to decrement
 * @param step Step increment
 * @param format Time format
 * @returns New time state
 */
function decrementTimeUnit(time: TimeState, unit: string, step: number, format: '12h' | '24h'): TimeState {
  const newTime = { ...time };

  switch (unit) {
    case 'hour':
      newTime.hour = (newTime.hour - step + 24) % 24;
      break;
    case 'minute':
      newTime.minute = (newTime.minute - step + 60) % 60;
      break;
    case 'second':
      newTime.second = (newTime.second - step + 60) % 60;
      break;
  }

  return newTime;
}