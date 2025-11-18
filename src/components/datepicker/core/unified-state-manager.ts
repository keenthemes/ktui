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
 *
 * Immediate vs Batched Updates:
 * - Immediate updates: Use for user interactions requiring synchronous event firing
 *   (date selection, dropdown open/close). These bypass batching delays.
 * - Batched updates: Use for programmatic changes that don't require immediate
 *   user feedback (navigation, initialization). These are batched for performance.
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
   * @param updates - Partial state updates to apply
   * @param source - Source identifier for debugging
   * @param immediate - If true, bypass batching and apply updates immediately
   */
  public updateState(updates: Partial<KTDatepickerState>, source: string = 'unknown', immediate: boolean = false): boolean {
    if (this._isUpdating) {
      return false;
    }

    // If immediate is requested, or batching is disabled, apply updates immediately
    if (immediate || !this._config.enableUpdateBatching) {
      return this._applyUpdates(source, updates);
    }

    // Merge updates with pending updates for batched processing
    this._pendingUpdates = { ...this._pendingUpdates, ...updates };

    if (this._batchTimeout) {
      clearTimeout(this._batchTimeout);
    }

    this._batchTimeout = window.setTimeout(() => {
      this._applyUpdates(source);
    }, this._config.batchDelay);

    return true;
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

  /**
   * Set selected date - uses immediate update for synchronous event firing
   */
  public setSelectedDate(date: Date | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedDate: date }, source, true); // immediate
  }

  public setSelectedTime(time: TimeState | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedTime: time }, source);
  }

  public setCurrentDate(date: Date, source: string = 'manual'): boolean {
    return this.updateState({ currentDate: date }, source);
  }

  /**
   * Set selected range - uses immediate update for synchronous event firing
   */
  public setSelectedRange(range: { start: Date | null; end: Date | null } | null, source: string = 'manual'): boolean {
    return this.updateState({ selectedRange: range }, source, true); // immediate
  }

  /**
   * Set selected dates (multi-date) - uses immediate update for synchronous event firing
   */
  public setSelectedDates(dates: Date[], source: string = 'manual'): boolean {
    return this.updateState({ selectedDates: dates }, source, true); // immediate
  }

  public setViewMode(mode: 'days' | 'months' | 'years', source: string = 'manual'): boolean {
    return this.updateState({ viewMode: mode }, source);
  }

  /**
   * Set overall open state - uses immediate update for synchronous event firing
   */
  public setOpen(isOpen: boolean, source: string = 'manual'): boolean {
    return this.updateState({ isOpen }, source, true); // immediate
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
  /**
   * Set dropdown open state - uses immediate update for synchronous event firing
   */
  public setDropdownOpen(isOpen: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      dropdownState: { ...this._state.dropdownState, isOpen },
      isOpen // Also update the legacy isOpen field for compatibility
    }, source, true); // immediate
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