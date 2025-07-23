/*
 * unified-state-manager.ts - Centralized state management for KTDatepicker
 * Provides single source of truth for all datepicker state with observer pattern
 * for automatic UI synchronization across all components.
 */

import { KTDatepickerState, TimeState, DropdownState } from '../config/types';

/**
 * State observer interface for UI components
 */
export interface StateObserver {
  onStateChange(newState: KTDatepickerState, oldState: KTDatepickerState): void;
  getUpdatePriority(): number; // For update ordering (lower = higher priority)
}

/**
 * State validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * State manager configuration
 */
export interface StateManagerConfig {
  enableValidation: boolean;
  enableDebugging: boolean;
  enableUpdateBatching: boolean;
  batchDelay: number; // milliseconds
}

/**
 * State change event
 */
export interface StateChangeEvent {
  oldState: KTDatepickerState;
  newState: KTDatepickerState;
  source: string;
  timestamp: number;
  changes: Partial<KTDatepickerState>;
}

/**
 * KTDatepickerUnifiedStateManager
 *
 * Centralized state management for datepicker with observer pattern.
 * Ensures all UI components automatically sync to state changes.
 */
export class KTDatepickerUnifiedStateManager {
  private _state: KTDatepickerState;
  private _observers: Set<StateObserver> = new Set();
  private _config: StateManagerConfig;
  private _batchTimeout: number | null = null;
  private _pendingUpdates: Partial<KTDatepickerState> = {};
  private _isUpdating = false;

  constructor(config?: Partial<StateManagerConfig>) {
    this._config = {
      enableValidation: true,
      enableDebugging: false,
      enableUpdateBatching: true,
      batchDelay: 16, // ~60fps
      ...config
    };

    this._state = this._getInitialState();
  }

  /**
   * Get initial state
   */
  private _getInitialState(): KTDatepickerState {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedRange: null,
      selectedDates: [],
      selectedTime: null,
      timeGranularity: 'minute',
      viewMode: 'days',
      isOpen: false,
      isFocused: false,
      isTransitioning: false,
      isDisabled: false,
      validationErrors: [],
      isValid: true,
      dropdownState: {
        isOpen: false,
        isTransitioning: false,
        isDisabled: false,
        isFocused: false
      }
    };
  }

  /**
   * Get current state (immutable)
   */
  public getState(): Readonly<KTDatepickerState> {
    return { ...this._state };
  }

  /**
   * Update state with validation and observer notification
   */
  public updateState(updates: Partial<KTDatepickerState>, source: string = 'unknown'): boolean {
    if (this._isUpdating) {
      console.warn('[KTDatepicker] State update blocked - already updating');
      return false;
    }

    // Merge updates with pending updates if batching is enabled
    if (this._config.enableUpdateBatching) {
      this._pendingUpdates = { ...this._pendingUpdates, ...updates };

      if (this._batchTimeout) {
        clearTimeout(this._batchTimeout);
      }

      this._batchTimeout = window.setTimeout(() => {
        this._applyUpdates(source);
      }, this._config.batchDelay);

      return true;
    }

    return this._applyUpdates(source, updates);
  }

  /**
   * Apply updates to state
   */
  private _applyUpdates(source: string, updates?: Partial<KTDatepickerState>): boolean {
    const changes = updates || this._pendingUpdates;
    const oldState = { ...this._state };

    // Create new state with updates
    const newState = { ...this._state, ...changes };

    // Validate state if enabled
    if (this._config.enableValidation) {
      const validation = this._validateState(newState);
      if (!validation.isValid) {
        console.error('[KTDatepicker] State validation failed:', validation.errors);
        return false;
      }
      newState.validationErrors = validation.errors;
      newState.isValid = validation.isValid;
    }

    // Update state
    this._state = newState;
    this._pendingUpdates = {};

    // Notify observers
    this._notifyObservers(oldState, newState, source, changes);

    if (this._config.enableDebugging) {
      console.log(`[KTDatepicker] State updated by ${source}:`, changes);
    }

    return true;
  }

  /**
   * Validate state
   */
  private _validateState(state: KTDatepickerState): ValidationResult {
    const errors: string[] = [];

    // Validate dates
    if (state.selectedDate && isNaN(state.selectedDate.getTime())) {
      errors.push('Invalid selectedDate');
    }

    if (state.currentDate && isNaN(state.currentDate.getTime())) {
      errors.push('Invalid currentDate');
    }

    // Validate range
    if (state.selectedRange) {
      if (state.selectedRange.start && isNaN(state.selectedRange.start.getTime())) {
        errors.push('Invalid range start date');
      }
      if (state.selectedRange.end && isNaN(state.selectedRange.end.getTime())) {
        errors.push('Invalid range end date');
      }
      if (state.selectedRange.start && state.selectedRange.end &&
          state.selectedRange.start > state.selectedRange.end) {
        errors.push('Range start date cannot be after end date');
      }
    }

    // Validate time
    if (state.selectedTime) {
      if (state.selectedTime.hour < 0 || state.selectedTime.hour > 23) {
        errors.push('Invalid hour value');
      }
      if (state.selectedTime.minute < 0 || state.selectedTime.minute > 59) {
        errors.push('Invalid minute value');
      }
      if (state.selectedTime.second < 0 || state.selectedTime.second > 59) {
        errors.push('Invalid second value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(observer: StateObserver): () => void {
    this._observers.add(observer);

    // Return unsubscribe function
    return () => {
      this._observers.delete(observer);
    };
  }

  /**
   * Notify all observers of state change
   */
  private _notifyObservers(oldState: KTDatepickerState, newState: KTDatepickerState, source: string, changes: Partial<KTDatepickerState>): void {
    if (this._observers.size === 0) return;

    // Sort observers by priority
    const sortedObservers = Array.from(this._observers).sort((a, b) =>
      a.getUpdatePriority() - b.getUpdatePriority()
    );

    const event: StateChangeEvent = {
      oldState,
      newState,
      source,
      timestamp: Date.now(),
      changes
    };

    // Notify observers in priority order
    for (const observer of sortedObservers) {
      try {
        observer.onStateChange(newState, oldState);
      } catch (error) {
        console.error('[KTDatepicker] Observer error:', error);
      }
    }
  }

  /**
   * Convenience methods for common state updates
   */

  public setSelectedDate(date: Date | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedDate: date }, source);
  }

  public setSelectedTime(time: TimeState | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedTime: time }, source);
  }

  public setCurrentDate(date: Date, source: string = 'manual'): boolean {
    return this.updateState({ currentDate: date }, source);
  }

  public setSelectedRange(range: { start: Date | null; end: Date | null } | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedRange: range }, source);
  }

  public setSelectedDates(dates: Date[], source: string = 'manual'): boolean {
    return this.updateState({ selectedDates: dates }, source);
  }

  public setViewMode(mode: 'days' | 'months' | 'years', source: string = 'manual'): boolean {
    return this.updateState({ viewMode: mode }, source);
  }

  public setOpen(isOpen: boolean, source: string = 'manual'): boolean {
    return this.updateState({ isOpen }, source);
  }

  public setFocused(isFocused: boolean, source: string = 'manual'): boolean {
    return this.updateState({ isFocused }, source);
  }

  public setDisabled(isDisabled: boolean, source: string = 'manual'): boolean {
    return this.updateState({ isDisabled }, source);
  }

  public setTransitioning(isTransitioning: boolean, source: string = 'manual'): boolean {
    return this.updateState({ isTransitioning }, source);
  }

  // Dropdown state methods (consolidated from legacy state manager)
  public setDropdownOpen(isOpen: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      dropdownState: { ...this._state.dropdownState, isOpen }
    }, source);
  }

  public setDropdownTransitioning(isTransitioning: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      dropdownState: { ...this._state.dropdownState, isTransitioning }
    }, source);
  }

  public setDropdownDisabled(isDisabled: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      dropdownState: { ...this._state.dropdownState, isDisabled }
    }, source);
  }

  public setDropdownFocused(isFocused: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      dropdownState: { ...this._state.dropdownState, isFocused }
    }, source);
  }

  public getDropdownState(): Readonly<DropdownState> {
    return { ...this._state.dropdownState };
  }

  public isDropdownOpen(): boolean {
    return this._state.dropdownState.isOpen;
  }

  public isDropdownTransitioning(): boolean {
    return this._state.dropdownState.isTransitioning;
  }

  public isDropdownDisabled(): boolean {
    return this._state.dropdownState.isDisabled;
  }

  public isDropdownFocused(): boolean {
    return this._state.dropdownState.isFocused;
  }

  /**
   * Reset state to initial values
   */
  public reset(source: string = 'manual'): void {
    const oldState = { ...this._state };
    this._state = this._getInitialState();
    this._notifyObservers(oldState, this._state, source, this._state);
  }

  /**
   * Dispose of state manager
   */
  public dispose(): void {
    this._observers.clear();
    if (this._batchTimeout) {
      clearTimeout(this._batchTimeout);
      this._batchTimeout = null;
    }
  }
}