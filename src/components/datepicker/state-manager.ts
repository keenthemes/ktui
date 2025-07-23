/*
 * state-manager.ts - Centralized state management for KTDatepicker dropdown
 * Provides hybrid event-driven state management with validation and performance optimization.
 * Follows the successful patterns from the select component while adding modern state management features.
 */

import { EventManager } from '../select/utils';
import { KTDatepickerConfig } from './types';

/**
 * Dropdown state interface
 */
export interface DropdownState {
  isOpen: boolean;
  isTransitioning: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  lastOpenedAt: number | null;
  lastClosedAt: number | null;
  openCount: number;
  closeCount: number;
}

/**
 * State transition validation rule
 */
export interface StateValidationRule {
  name: string;
  validate: (oldState: DropdownState, newState: DropdownState, source: string) => boolean;
  message: string;
}

/**
 * State change event
 */
export interface StateChangeEvent {
  oldState: DropdownState;
  newState: DropdownState;
  source: string;
  timestamp: number;
}

/**
 * State manager configuration
 */
export interface StateManagerConfig {
  enableValidation: boolean;
  enableHistory: boolean;
  enableDebugging: boolean;
  maxHistorySize: number;
  validationRules: StateValidationRule[];
}

/**
 * KTDropdownStateManager
 *
 * Centralized state management for datepicker dropdown with validation,
 * event-driven architecture, and performance optimization.
 */
export class KTDropdownStateManager {
  private _state: DropdownState;
  private _eventManager: EventManager;
  private _config: StateManagerConfig;
  private _stateHistory: DropdownState[] = [];
  private _observers: Set<(event: StateChangeEvent) => void> = new Set();
  private _validationRules: StateValidationRule[] = [];

  constructor(config?: Partial<StateManagerConfig>) {
    this._config = {
      enableValidation: true,
      enableHistory: true,
      enableDebugging: true, // Enable debugging by default for better visibility
      maxHistorySize: 50,
      validationRules: [],
      ...config
    };

    this._state = this._getInitialState();
    this._eventManager = new EventManager();
    this._setupDefaultValidationRules();
  }

  /**
   * Get initial state
   */
  private _getInitialState(): DropdownState {
    return {
      isOpen: false,
      isTransitioning: false,
      isDisabled: false,
      isFocused: false,
      lastOpenedAt: null,
      lastClosedAt: null,
      openCount: 0,
      closeCount: 0
    };
  }

  /**
   * Setup default validation rules
   */
  private _setupDefaultValidationRules(): void {
    this._validationRules = [
      {
        name: 'disabled-state',
        validate: (oldState, newState, source) => {
          // Cannot open if disabled
          if (newState.isDisabled && newState.isOpen) {
            return false;
          }
          // Cannot transition if disabled
          if (oldState.isDisabled && newState.isTransitioning) {
            return false;
          }
          return true;
        },
        message: 'Disabled dropdown cannot be open or transitioning'
      },
      {
        name: 'transition-logic',
        validate: (oldState, newState, source) => {
          // Allow any state transition that makes logical sense
          // Opening: closed -> open (with or without transition)
          if (!oldState.isOpen && newState.isOpen) {
            return true;
          }
          // Closing: open -> closed (with or without transition)
          if (oldState.isOpen && !newState.isOpen) {
            return true;
          }
          // Transition completion: transitioning -> not transitioning
          if (oldState.isTransitioning && !newState.isTransitioning) {
            return true;
          }
          // Starting transition: not transitioning -> transitioning
          if (!oldState.isTransitioning && newState.isTransitioning) {
            return true;
          }
          // No state change (should be allowed)
          if (oldState.isOpen === newState.isOpen && oldState.isTransitioning === newState.isTransitioning) {
            return true;
          }
          return false;
        },
        message: 'Invalid transition state change'
      },
      {
        name: 'state-consistency',
        validate: (oldState, newState, source) => {
          // Cannot be disabled and open simultaneously
          if (newState.isDisabled && newState.isOpen) {
            return false;
          }
          // Cannot be disabled and transitioning simultaneously
          if (newState.isDisabled && newState.isTransitioning) {
            return false;
          }
          return true;
        },
        message: 'Invalid state combination detected'
      }
    ];
  }

  /**
   * Update state with validation
   */
  public updateState(updates: Partial<DropdownState>, source: string): boolean {
    try {
      const oldState = { ...this._state };
      const newState = { ...this._state, ...updates };

      // Debug logging
      if (this._config.enableDebugging) {
        console.log(`[StateManager] Attempting state update from ${source}:`, { oldState, newState, updates });
      }

      // Validate state transition
      if (this._config.enableValidation && !this._validateStateTransition(oldState, newState, source)) {
        if (this._config.enableDebugging) {
          console.warn(`[StateManager] State update rejected from ${source}:`, { oldState, newState });
        }
        return false;
      }

      // Update state
      this._state = newState;

      // Add to history
      if (this._config.enableHistory) {
        this._addToHistory(oldState);
      }

      // Notify observers
      this._notifyStateChange(oldState, newState, source);

      // Debug logging
      if (this._config.enableDebugging) {
        console.log(`[StateManager] State updated successfully from ${source}:`, { oldState, newState });
      }

      return true;
    } catch (error) {
      console.error(`[StateManager] Error updating state from ${source}:`, error);
      return false;
    }
  }

  /**
   * Validate state transition
   */
  private _validateStateTransition(oldState: DropdownState, newState: DropdownState, source: string): boolean {
    try {
      return this._validationRules.every(rule => {
        const isValid = rule.validate(oldState, newState, source);
        if (!isValid && this._config.enableDebugging) {
          console.warn(`[StateManager] Validation rule '${rule.name}' failed: ${rule.message}`, {
            oldState,
            newState,
            source,
            rule: rule.name
          });
        }
        return isValid;
      });
    } catch (error) {
      console.error(`[StateManager] Error during state validation:`, error);
      return false;
    }
  }

  /**
   * Add state to history
   */
  private _addToHistory(state: DropdownState): void {
    this._stateHistory.push({ ...state });
    if (this._stateHistory.length > this._config.maxHistorySize) {
      this._stateHistory.shift();
    }
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
   * Add custom validation rule
   */
  public addValidationRule(rule: StateValidationRule): void {
    this._validationRules.push(rule);
  }

  /**
   * Get state history
   */
  public getStateHistory(): DropdownState[] {
    return [...this._stateHistory];
  }

  /**
   * Clear state history
   */
  public clearHistory(): void {
    this._stateHistory = [];
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
      isTransitioning: true,
      lastOpenedAt: Date.now(),
      openCount: this._state.openCount + 1
    }, source);
  }

  /**
   * Close dropdown
   */
  public close(source: string = 'manual'): boolean {
    return this.updateState({
      isOpen: false,
      isTransitioning: true,
      lastClosedAt: Date.now(),
      closeCount: this._state.closeCount + 1
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
   * Get event manager
   */
  public getEventManager(): EventManager {
    return this._eventManager;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this._observers.clear();
    this._stateHistory = [];
    this._eventManager.removeAllListeners(document as unknown as HTMLElement);
  }
}