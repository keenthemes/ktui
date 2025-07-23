/*
 * time-picker-observer.ts - Time picker observer for KTDatepicker unified state management
 * Automatically updates time picker UI based on state changes.
 */

import { StateObserver } from '../../core/unified-state-manager';
import { KTDatepickerState, TimeState } from '../../config/types';

/**
 * Time picker observer configuration
 */
export interface TimePickerObserverConfig {
  enableDebugging: boolean;
  enableSmoothTransitions: boolean;
  updateDelay: number; // milliseconds
}

/**
 * Time picker update options
 */
export interface TimePickerUpdateOptions {
  updateTimeDisplay: boolean;
  updateTimeFormat: boolean;
  updateTimeConstraints: boolean;
  updateVisibility: boolean;
}

/**
 * TimePickerObserver
 *
 * Observer for time picker that automatically updates based on state changes.
 * Handles time display updates, format changes, and time constraints.
 */
export class TimePickerObserver implements StateObserver {
  private _timePickerElement: HTMLElement | null = null;
  private _config: TimePickerObserverConfig;
  private _updateTimeout: number | null = null;
  private _lastTime: TimeState | null = null;
  private _lastFormat: string = '';

  constructor(timePickerElement: HTMLElement | null, config?: Partial<TimePickerObserverConfig>) {
    this._timePickerElement = timePickerElement;
    this._config = {
      enableDebugging: false,
      enableSmoothTransitions: true,
      updateDelay: 0,
      ...config
    };
  }

  /**
   * Get update priority (medium priority for time picker updates)
   */
  public getUpdatePriority(): number {
    return 2; // Medium priority - after input updates
  }

  /**
   * Handle state changes
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    if (!this._timePickerElement) return;

    // Determine what needs to be updated
    const updateOptions = this._determineUpdateOptions(newState, oldState);

    // Schedule update with optional delay
    this._scheduleTimePickerUpdate(newState, updateOptions);
  }

  /**
   * Determine what time picker elements need updating
   */
  private _determineUpdateOptions(newState: KTDatepickerState, oldState: KTDatepickerState): TimePickerUpdateOptions {
    return {
      updateTimeDisplay: this._shouldUpdateTimeDisplay(newState, oldState),
      updateTimeFormat: this._shouldUpdateTimeFormat(newState, oldState),
      updateTimeConstraints: this._shouldUpdateTimeConstraints(newState, oldState),
      updateVisibility: this._shouldUpdateVisibility(newState, oldState)
    };
  }

  /**
   * Check if time display should be updated
   */
  private _shouldUpdateTimeDisplay(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    if (!newState.selectedTime || !oldState.selectedTime) {
      return newState.selectedTime !== oldState.selectedTime;
    }

    return (
      newState.selectedTime.hour !== oldState.selectedTime.hour ||
      newState.selectedTime.minute !== oldState.selectedTime.minute ||
      newState.selectedTime.second !== oldState.selectedTime.second
    );
  }

  /**
   * Check if time format should be updated
   */
  private _shouldUpdateTimeFormat(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    // This would be based on configuration changes
    return false; // Placeholder
  }

  /**
   * Check if time constraints should be updated
   */
  private _shouldUpdateTimeConstraints(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    // This would be based on configuration changes
    return false; // Placeholder
  }

  /**
   * Check if visibility should be updated
   */
  private _shouldUpdateVisibility(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    // Time picker visibility is typically controlled by configuration
    return false; // Placeholder
  }

  /**
   * Schedule time picker update with optional delay
   */
  private _scheduleTimePickerUpdate(state: KTDatepickerState, options: TimePickerUpdateOptions): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    if (this._config.updateDelay > 0) {
      this._updateTimeout = window.setTimeout(() => {
        this._updateTimePicker(state, options);
      }, this._config.updateDelay);
    } else {
      this._updateTimePicker(state, options);
    }
  }

  /**
   * Update time picker based on state changes
   */
  private _updateTimePicker(state: KTDatepickerState, options: TimePickerUpdateOptions): void {
    if (!this._timePickerElement) return;

    try {
      // Update time display if needed
      if (options.updateTimeDisplay) {
        this._updateTimeDisplay(state.selectedTime);
      }

      // Update time format if needed
      if (options.updateTimeFormat) {
        this._updateTimeFormat(state);
      }

      // Update time constraints if needed
      if (options.updateTimeConstraints) {
        this._updateTimeConstraints(state);
      }

      // Update visibility if needed
      if (options.updateVisibility) {
        this._updateVisibility(state);
      }

      // Store last state for comparison
      this._lastTime = state.selectedTime ? { ...state.selectedTime } : null;

      if (this._config.enableDebugging) {
        console.log('[TimePickerObserver] Time picker updated with options:', options);
      }
    } catch (error) {
      console.error('[TimePickerObserver] Error updating time picker:', error);
    }
  }

  /**
   * Update time display
   */
  private _updateTimeDisplay(time: TimeState | null): void {
    if (!this._timePickerElement || !time) return;

    // Update hour display
    const hourElement = this._timePickerElement.querySelector('[data-kt-datepicker-hour]');
    if (hourElement) {
      hourElement.textContent = time.hour.toString().padStart(2, '0');
    }

    // Update minute display
    const minuteElement = this._timePickerElement.querySelector('[data-kt-datepicker-minute]');
    if (minuteElement) {
      minuteElement.textContent = time.minute.toString().padStart(2, '0');
    }

    // Update second display if present
    const secondElement = this._timePickerElement.querySelector('[data-kt-datepicker-second]');
    if (secondElement) {
      secondElement.textContent = time.second.toString().padStart(2, '0');
    }

    // Update AM/PM display if in 12-hour format
    const ampmElement = this._timePickerElement.querySelector('[data-kt-datepicker-ampm]');
    if (ampmElement) {
      ampmElement.textContent = time.hour >= 12 ? 'PM' : 'AM';
    }

    if (this._config.enableDebugging) {
      console.log('[TimePickerObserver] Time display updated:', time);
    }
  }

  /**
   * Update time format
   */
  private _updateTimeFormat(state: KTDatepickerState): void {
    if (!this._timePickerElement) return;

    // This would update the time picker format (12h/24h)
    // Implementation depends on the specific time picker renderer
    const format = this._getTimeFormat(state);

    if (format !== this._lastFormat) {
      this._timePickerElement.setAttribute('data-format', format);
      this._lastFormat = format;

      if (this._config.enableDebugging) {
        console.log('[TimePickerObserver] Time format updated:', format);
      }
    }
  }

  /**
   * Get time format based on state
   */
  private _getTimeFormat(state: KTDatepickerState): string {
    // This would be determined by configuration
    return '24h'; // Placeholder
  }

  /**
   * Update time constraints
   */
  private _updateTimeConstraints(state: KTDatepickerState): void {
    if (!this._timePickerElement) return;

    // This would update min/max time constraints
    // Implementation depends on the specific time picker renderer
    if (this._config.enableDebugging) {
      console.log('[TimePickerObserver] Time constraints updated');
    }
  }

  /**
   * Update visibility
   */
  private _updateVisibility(state: KTDatepickerState): void {
    if (!this._timePickerElement) return;

    // This would show/hide the time picker based on configuration
    // Implementation depends on the specific time picker renderer
    if (this._config.enableDebugging) {
      console.log('[TimePickerObserver] Visibility updated');
    }
  }

  /**
   * Set time picker element reference
   */
  public setTimePickerElement(element: HTMLElement | null): void {
    this._timePickerElement = element;
  }

  /**
   * Get current time picker element
   */
  public getTimePickerElement(): HTMLElement | null {
    return this._timePickerElement;
  }

  /**
   * Update time value programmatically
   */
  public updateTime(time: TimeState): void {
    if (!this._timePickerElement) return;

    this._updateTimeDisplay(time);
    this._lastTime = { ...time };
  }

  /**
   * Get current time value
   */
  public getCurrentTime(): TimeState | null {
    return this._lastTime;
  }

  /**
   * Clean up observer
   */
  public dispose(): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }
    this._timePickerElement = null;
    this._lastTime = null;
  }
}