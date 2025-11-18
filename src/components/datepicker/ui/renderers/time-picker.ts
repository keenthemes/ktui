/*
 * time-picker.ts - Time picker renderer for KTDatepicker
 * Provides time picker UI components with increment/decrement controls.
 * Uses unified template system for consistent rendering.
 */

import { TimeState } from '../../config/types';
import { formatTime, getTimeStepOptions, validateTime } from '../../utils/time-utils';
import { KTDatepickerConfig } from '../../config/types';
import { createTemplateRenderer, TemplateRenderer } from '../../templates/templates';
import { KTDatepickerTemplateStrings } from '../../config/types';

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
  templates?: KTDatepickerTemplateStrings;
}

/**
 * Render time picker component
 * @param container Container element
 * @param options Time picker options
 * @returns Object with cleanup function and update function
 */
export function renderTimePicker(container: HTMLElement, options: TimePickerOptions): { cleanup: () => void; update: (newTime: TimeState) => void } {
  const { time, granularity, format, minTime, maxTime, timeStep = 1, disabled = false, onChange, templates } = options;

  // Initialize template renderer
  const templateRenderer = createTemplateRenderer(templates || {});

  // Clear container
  container.innerHTML = '';

  // Current time state (will be updated)
  let currentTime = { ...time };

  // Store references to updateable elements
  const updateableElements: { [key: string]: HTMLElement } = {};

  // Create increment/decrement buttons for each time unit
  const timeUnits = getTimeUnits(granularity);

  // Build time units HTML using templates
  let timeUnitsHtml = '';
  timeUnits.forEach((unit, index) => {
    // Render time unit using template
    const unitHtml = templateRenderer.renderTemplateString({
      templateKey: 'timeUnit',
      data: {
        unitType: unit,
        upButton: templateRenderer.renderTemplateString({
          templateKey: 'timeUpButton',
          data: {
            unitType: unit,
            disabled: disabled ? 'disabled' : ''
          }
        }),
        valueDisplay: templateRenderer.renderTemplateString({
          templateKey: 'timeValue',
          data: {
            value: getTimeUnitValue(currentTime, unit, format)
          }
        }),
        downButton: templateRenderer.renderTemplateString({
          templateKey: 'timeDownButton',
          data: {
            unitType: unit,
            disabled: disabled ? 'disabled' : ''
          }
        })
      }
    });

    timeUnitsHtml += unitHtml;

    // Add separator between units (except after last unit)
    if (index < timeUnits.length - 1) {
      timeUnitsHtml += templateRenderer.renderTemplateString({
        templateKey: 'timeSeparator',
        data: { separator: ':' }
      });
    }
  });

  // Render time controls with units
  const timeControlsHtml = templateRenderer.renderTemplateString({
    templateKey: 'timeControls',
    data: {
      timeUnits: timeUnitsHtml,
      ampmControl: format === '12h' ? templateRenderer.renderTemplateString({
        templateKey: 'ampmControl',
        data: {
          ampmButton: templateRenderer.renderTemplateString({
            templateKey: 'ampmButton',
            data: {
              ampmValue: currentTime.hour >= 12 ? 'PM' : 'AM',
              disabled: disabled ? 'disabled' : ''
            }
          })
        }
      }) : ''
    }
  });

  // Render time display
  const timeDisplayHtml = templateRenderer.renderTemplateString({
    templateKey: 'timeDisplay',
    data: {
      timeValue: formatTime(currentTime, granularity, format)
    }
  });

  // Render complete time picker wrapper
  const timePickerHtml = templateRenderer.renderTemplateString({
    templateKey: 'timePickerWrapper',
    data: {
      timeDisplay: timeDisplayHtml,
      timeControls: timeControlsHtml
    }
  });

    // Insert rendered HTML into container
  container.innerHTML = timePickerHtml;

  // Get references to elements for event handling
  const timeDisplay = container.querySelector('[data-kt-datepicker-time-display]') as HTMLElement;

    // Add event listeners to time unit buttons
  timeUnits.forEach((unit) => {
    const upButton = container.querySelector(`[data-kt-datepicker-time-up][aria-label="Increment ${unit}"]`) as HTMLButtonElement;
    const downButton = container.querySelector(`[data-kt-datepicker-time-down][aria-label="Decrement ${unit}"]`) as HTMLButtonElement;
    const valueDisplay = container.querySelector(`[data-kt-datepicker-time-unit="${unit}"] [data-kt-datepicker-time-value]`) as HTMLElement;

    // Store reference for updates
    updateableElements[`${unit}Value`] = valueDisplay;

    // Add event listeners with UI update
    upButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = incrementTimeUnit(currentTime, unit, timeStep, format);

        const validation = validateTime(newTime, minTime, maxTime);

        if (validation.isValid) {
          // Update current time state
          currentTime = newTime;
          // Update UI immediately
          updateTimeDisplay(currentTime, updateableElements, timeDisplay, granularity, format);
          // Call onChange callback
          onChange(currentTime);
        }
      }
    });

    downButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = decrementTimeUnit(currentTime, unit, timeStep, format);

        const validation = validateTime(newTime, minTime, maxTime);

        if (validation.isValid) {
          // Update current time state
          currentTime = newTime;
          // Update UI immediately
          updateTimeDisplay(currentTime, updateableElements, timeDisplay, granularity, format);
          // Call onChange callback
          onChange(currentTime);
        }
      }
    });
  });

  // Add AM/PM toggle for 12-hour format
  if (format === '12h') {
    const ampmButton = container.querySelector('[data-kt-datepicker-ampm-button]') as HTMLButtonElement;

    ampmButton.addEventListener('click', () => {
      if (!disabled && onChange) {
        const newTime = { ...currentTime };
        if (newTime.hour >= 12) {
          newTime.hour = newTime.hour - 12;
        } else {
          newTime.hour = newTime.hour + 12;
        }
        if (validateTime(newTime, minTime, maxTime).isValid) {
          // Update current time state
          currentTime = newTime;
          // Update UI immediately
          updateTimeDisplay(currentTime, updateableElements, timeDisplay, granularity, format);
          // Update AM/PM button text
          ampmButton.textContent = currentTime.hour >= 12 ? 'PM' : 'AM';
          // Call onChange callback
          onChange(currentTime);
        }
      }
    });
  }

  // Add keyboard navigation for time picker
  container.addEventListener('keydown', (e) => {
    if (disabled) return;

    // Handle arrow up/down for time units
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();

      // Find the currently focused time unit
      const focusedElement = document.activeElement;
      if (!focusedElement || !container.contains(focusedElement)) return;

      // Determine which time unit is focused
      let focusedUnit: string | null = null;
      timeUnits.forEach(unit => {
        const unitElement = container.querySelector(`[data-kt-datepicker-time-unit="${unit}"]`);
        if (unitElement && unitElement.contains(focusedElement)) {
          focusedUnit = unit;
        }
      });

      // If no specific unit is focused, focus the first one
      if (!focusedUnit && timeUnits.length > 0) {
        focusedUnit = timeUnits[0];
      }

      if (focusedUnit && onChange) {
        let newTime: TimeState;
        if (e.key === 'ArrowUp') {
          newTime = incrementTimeUnit(currentTime, focusedUnit, timeStep, format);
        } else {
          newTime = decrementTimeUnit(currentTime, focusedUnit, timeStep, format);
        }

        const validation = validateTime(newTime, minTime, maxTime);
        if (validation.isValid) {
          // Update current time state
          currentTime = newTime;
          // Update UI immediately
          updateTimeDisplay(currentTime, updateableElements, timeDisplay, granularity, format);
          // Call onChange callback
          onChange(currentTime);
        }
      }
    }

    // Handle Tab navigation between time units
    if (e.key === 'Tab') {
      const timeUnitElements = timeUnits.map(unit =>
        container.querySelector(`[data-kt-datepicker-time-unit="${unit}"]`)
      ).filter(Boolean) as HTMLElement[];

      if (timeUnitElements.length > 0) {
        const currentIndex = timeUnitElements.findIndex(el => el.contains(document.activeElement));
        let nextIndex = currentIndex;

        if (e.shiftKey) {
          // Shift+Tab: move to previous
          nextIndex = currentIndex > 0 ? currentIndex - 1 : timeUnitElements.length - 1;
        } else {
          // Tab: move to next
          nextIndex = currentIndex < timeUnitElements.length - 1 ? currentIndex + 1 : 0;
        }

        if (nextIndex >= 0 && nextIndex < timeUnitElements.length) {
          timeUnitElements[nextIndex].focus();
          e.preventDefault();
        }
      }
    }
  });

  // Make time units focusable
  timeUnits.forEach(unit => {
    const unitElement = container.querySelector(`[data-kt-datepicker-time-unit="${unit}"]`) as HTMLElement;
    if (unitElement) {
      unitElement.tabIndex = 0;
      unitElement.setAttribute('role', 'spinbutton');
      unitElement.setAttribute('aria-label', `${unit} value`);
    }
  });

  // Update function to sync with external state changes
  const update = (newTime: TimeState) => {
    currentTime = { ...newTime };
    updateTimeDisplay(currentTime, updateableElements, timeDisplay, granularity, format);

    // Update AM/PM button if it exists
    if (format === '12h') {
      const ampmButton = container.querySelector('.kt-datepicker-time-ampm-button') as HTMLButtonElement;
      if (ampmButton) {
        ampmButton.textContent = currentTime.hour >= 12 ? 'PM' : 'AM';
      }
    }
  };

  // Return cleanup function and update function
  return {
    cleanup: () => {
      container.innerHTML = '';
    },
    update
  };
}

/**
 * Update time picker display elements with new time values
 * @param time New time state
 * @param updateableElements Object containing references to updateable DOM elements
 * @param timeDisplay Main time display element
 * @param granularity Time granularity
 * @param format Time format
 */
function updateTimeDisplay(
  time: TimeState,
  updateableElements: { [key: string]: HTMLElement },
  timeDisplay: HTMLElement,
  granularity: 'second' | 'minute' | 'hour',
  format: '12h' | '24h'
): void {
  // Update main time display
  const mainDisplayText = formatTime(time, granularity, format);
  timeDisplay.textContent = mainDisplayText;

  // Update individual time unit displays
  const timeUnits = getTimeUnits(granularity);

  timeUnits.forEach(unit => {
    const elementKey = `${unit}Value`;
    const element = updateableElements[elementKey];
    if (element) {
      const unitValue = getTimeUnitValue(time, unit, format);
      element.textContent = unitValue;
    }
  });
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