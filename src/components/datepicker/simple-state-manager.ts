/*
 * simple-state-manager.ts - Simplified state management for KTDatepicker
 * Consolidates all state logic into a single, focused file with essential functionality only.
 * Replaces the complex state-manager.ts, state-validator.ts, and state.ts files.
 */

import { KTDatepickerState } from './types';

/**
 * Dropdown state interface - simplified version
 */
export interface DropdownState {
  isOpen: boolean;
  isTransitioning: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

/**
 * State change event - simplified version
 */
export interface StateChangeEvent {
  oldState: DropdownState;
  newState: DropdownState;
  source: string;
  timestamp: number;
}

/**
 * Simplified state manager configuration
 */
export interface StateManagerConfig {
  enableValidation: boolean;
  enableDebugging: boolean;
}

/**
 * KTDatepickerSimpleStateManager
 *
 * Simplified state management for datepicker dropdown.
 * Handles only essential state transitions with minimal complexity.
 */
export class KTDatepickerSimpleStateManager {
  private _state: DropdownState;
  private _config: StateManagerConfig;
  private _observers: Set<(event: StateChangeEvent) => void> = new Set();

  constructor(config?: Partial<StateManagerConfig>) {
    this._config = {
      enableValidation: true,
      enableDebugging: false,
      ...config
    };

    this._state = this._getInitialState();
  }

  /**
   * Get initial dropdown state
   */
  private _getInitialState(): DropdownState {
    return {
      isOpen: false,
      isTransitioning: false,
      isDisabled: false,
      isFocused: false
    };
  }

  /**
   * Get initial datepicker state
   */
  public getInitialDatepickerState(): KTDatepickerState {
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
    };
  }

  /**
   * Static method to get initial datepicker state
   */
  public static getInitialDatepickerState(): KTDatepickerState {
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
    };
  }

  /**
   * Validate state transition - simplified validation
   */
  private _validateStateTransition(oldState: DropdownState, newState: DropdownState, source: string): boolean {
    if (!this._config.enableValidation) {
      return true;
    }

    // Cannot open if disabled
    if (newState.isDisabled && newState.isOpen) {
      return false;
    }

    // Cannot transition if disabled
    if (newState.isDisabled && newState.isTransitioning) {
      return false;
    }

    return true;
  }

  /**
   * Update state with validation
   */
  public updateState(updates: Partial<DropdownState>, source: string): boolean {
    const oldState = { ...this._state };
    const newState = { ...this._state, ...updates };

    // Validate state transition
    if (!this._validateStateTransition(oldState, newState, source)) {
      return false;
    }

    // Update state
    this._state = newState;

    // Notify observers
    this._notifyStateChange(oldState, newState, source);

    return true;
  }

  /**
   * Notify state change observers
   */
  private _notifyStateChange(oldState: DropdownState, newState: DropdownState, source: string): void {
    const event: StateChangeEvent = {
      oldState,
      newState,
      source,
      timestamp: Date.now()
    };

    this._observers.forEach(observer => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in state change observer:', error);
      }
    });
  }

  /**
   * Get current state
   */
  public getState(): DropdownState {
    return { ...this._state };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(observer: (event: StateChangeEvent) => void): () => void {
    this._observers.add(observer);

    // Return unsubscribe function
    return () => {
      this._observers.delete(observer);
    };
  }

  /**
   * Check if dropdown is open
   */
  public isOpen(): boolean {
    return this._state.isOpen;
  }

  /**
   * Check if dropdown is transitioning
   */
  public isTransitioning(): boolean {
    return this._state.isTransitioning;
  }

  /**
   * Check if dropdown is disabled
   */
  public isDisabled(): boolean {
    return this._state.isDisabled;
  }

  /**
   * Open dropdown
   */
  public open(source: string = 'manual'): boolean {
    if (this._state.isDisabled) {
      return false;
    }

    return this.updateState({
      isOpen: true,
      isTransitioning: true
    }, source);
  }

  /**
   * Close dropdown
   */
  public close(source: string = 'manual'): boolean {
    return this.updateState({
      isOpen: false,
      isTransitioning: true
    }, source);
  }

  /**
   * Complete transition
   */
  public completeTransition(source: string = 'transition'): boolean {
    return this.updateState({
      isTransitioning: false
    }, source);
  }

  /**
   * Toggle dropdown
   */
  public toggle(source: string = 'manual'): boolean {
    return this._state.isOpen ? this.close(source) : this.open(source);
  }

  /**
   * Enable dropdown
   */
  public enable(source: string = 'manual'): boolean {
    return this.updateState({
      isDisabled: false
    }, source);
  }

  /**
   * Disable dropdown
   */
  public disable(source: string = 'manual'): boolean {
    return this.updateState({
      isDisabled: true,
      isOpen: false,
      isTransitioning: false
    }, source);
  }

  /**
   * Set focus state
   */
  public setFocus(focused: boolean, source: string = 'manual'): boolean {
    return this.updateState({
      isFocused: focused
    }, source);
  }

  /**
   * Reset state to initial values
   */
  public reset(): void {
    const oldState = { ...this._state };
    this._state = this._getInitialState();
    this._notifyStateChange(oldState, this._state, 'reset');
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this._observers.clear();
  }
}