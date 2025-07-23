/*
 * input-observer.ts - Hidden input field observer for KTDatepicker unified state management
 * Focuses specifically on hidden input field management for form submission.
 * Works alongside SegmentedInputObserver for segmented input components.
 */

import { StateObserver } from '../../core/unified-state-manager';
import { KTDatepickerState } from '../../config/types';

/**
 * Input observer configuration
 */
export interface InputObserverConfig {
  enableDebugging: boolean;
  enableFormatValidation: boolean;
  updateDelay: number; // milliseconds
}

/**
 * InputObserver
 *
 * Observer for hidden input field that automatically updates based on state changes.
 * Focuses specifically on hidden input field management for form submission.
 * Works alongside SegmentedInputObserver for segmented input components.
 */
export class InputObserver implements StateObserver {
  private _input: HTMLInputElement | null = null;
  private _config: InputObserverConfig;
  private _updateTimeout: number | null = null;
  private _lastValue: string = '';

  constructor(input: HTMLInputElement | null, config?: Partial<InputObserverConfig>) {
    this._input = input;
    this._config = {
      enableDebugging: false,
      enableFormatValidation: true,
      updateDelay: 0,
      ...config
    };
  }

  /**
   * Get update priority (medium priority for hidden input updates)
   */
  public getUpdatePriority(): number {
    return 2; // Medium priority - after segmented input updates
  }

  /**
   * Handle state changes
   */
  public onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void {
    if (!this._input) return;

    // Check if hidden input value needs updating
    if (this._shouldUpdateHiddenInput(newState, oldState)) {
      this._scheduleHiddenInputUpdate(newState);
    }

    // Check if disabled state needs updating
    if (newState.isDisabled !== oldState.isDisabled) {
      this._updateDisabledState(newState.isDisabled);
    }

    // Check if placeholder needs updating
    if (this._shouldUpdatePlaceholder(newState, oldState)) {
      this._updatePlaceholder(newState);
    }
  }

  /**
   * Determine if hidden input value should be updated
   */
  private _shouldUpdateHiddenInput(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedTime !== oldState.selectedTime ||
      newState.selectedRange !== oldState.selectedRange ||
      newState.selectedDates !== oldState.selectedDates
    );
  }

  /**
   * Determine if placeholder should be updated
   */
  private _shouldUpdatePlaceholder(newState: KTDatepickerState, oldState: KTDatepickerState): boolean {
    return (
      newState.selectedDate !== oldState.selectedDate ||
      newState.selectedRange !== oldState.selectedRange ||
      newState.selectedDates !== oldState.selectedDates
    );
  }

  /**
   * Schedule hidden input update with optional delay
   */
  private _scheduleHiddenInputUpdate(state: KTDatepickerState): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    if (this._config.updateDelay > 0) {
      this._updateTimeout = window.setTimeout(() => {
        this._updateHiddenInputValue(state);
      }, this._config.updateDelay);
    } else {
      this._updateHiddenInputValue(state);
    }
  }

    /**
   * Update hidden input value based on state
   */
  private _updateHiddenInputValue(state: KTDatepickerState): void {
    if (!this._input) return;

    const newValue = this._formatValueForSubmission(state);

    // Only update if value has changed
    if (newValue !== this._lastValue) {
      this._input.value = newValue;
      this._lastValue = newValue;

      // Dispatch change event
      const event = new Event('change', { bubbles: true });
      this._input.dispatchEvent(event);

      if (this._config.enableDebugging) {
        console.log('[InputObserver] Hidden input value updated:', newValue);
      }
    }
  }

    /**
   * Format value for form submission
   */
  private _formatValueForSubmission(state: KTDatepickerState): string {
    // This is a placeholder - actual formatting logic will be injected
    // from the main component based on configuration
    if (state.selectedDate) {
      return state.selectedDate.toISOString().split('T')[0];
    }

    if (state.selectedRange && state.selectedRange.start) {
      return `${state.selectedRange.start.toISOString().split('T')[0]} - ${state.selectedRange.end?.toISOString().split('T')[0] || ''}`;
    }

    if (state.selectedDates.length > 0) {
      return state.selectedDates.map(d => d.toISOString().split('T')[0]).join(', ');
    }

    return '';
  }

  /**
   * Update disabled state
   */
  private _updateDisabledState(isDisabled: boolean): void {
    if (!this._input) return;

    if (isDisabled) {
      this._input.setAttribute('disabled', 'true');
      this._input.setAttribute('aria-disabled', 'true');
    } else {
      this._input.removeAttribute('disabled');
      this._input.removeAttribute('aria-disabled');
    }

    if (this._config.enableDebugging) {
      console.log('[InputObserver] Disabled state updated:', isDisabled);
    }
  }

  /**
   * Update placeholder
   */
  private _updatePlaceholder(state: KTDatepickerState): void {
    if (!this._input) return;

    // Remove placeholder if date is selected
    if (state.selectedDate ||
        (state.selectedRange && state.selectedRange.start) ||
        state.selectedDates.length > 0) {
      this._input.removeAttribute('placeholder');
    }

    if (this._config.enableDebugging) {
      console.log('[InputObserver] Placeholder updated');
    }
  }

  /**
   * Set custom formatter function for form submission
   */
  public setFormatter(formatter: (state: KTDatepickerState) => string): void {
    this._formatValueForSubmission = formatter;
  }

  /**
   * Update input element reference
   */
  public setInput(input: HTMLInputElement | null): void {
    this._input = input;
    this._lastValue = '';
  }

  /**
   * Get current input element
   */
  public getInput(): HTMLInputElement | null {
    return this._input;
  }

  /**
   * Clean up observer
   */
  public dispose(): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }
    this._input = null;
  }
}