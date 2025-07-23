/*
 * event-manager.ts - Event-driven state architecture for KTDatepicker dropdown
 * Provides clean event handling and state synchronization for dropdown operations.
 * Extends the select component's EventManager with dropdown-specific functionality.
 */

import { EventManager } from '../../select/utils';
import { KTDatepickerSimpleStateManager as KTDropdownStateManager, DropdownState, StateChangeEvent } from './state-manager';
// State validator removed - using simplified validation in state manager

/**
 * Event types for dropdown state changes
 */
export enum DropdownEventType {
  OPEN = 'dropdown:open',
  CLOSE = 'dropdown:close',
  TOGGLE = 'dropdown:toggle',
  TRANSITION_START = 'dropdown:transition:start',
  TRANSITION_END = 'dropdown:transition:end',
  FOCUS = 'dropdown:focus',
  BLUR = 'dropdown:blur',
  ENABLE = 'dropdown:enable',
  DISABLE = 'dropdown:disable',
  STATE_CHANGE = 'dropdown:state:change'
}

/**
 * Event data for dropdown events
 */
export interface DropdownEventData {
  state: DropdownState;
  source: string;
  timestamp: number;
  element?: HTMLElement;
  config?: any;
}

/**
 * Event listener function signature
 */
export type DropdownEventListener = (event: CustomEvent<DropdownEventData>) => void;

/**
 * Event manager configuration
 */
export interface DropdownEventManagerConfig {
  enableEventBubbling: boolean;
  enableEventCapture: boolean;
  enableCustomEvents: boolean;
  enableValidation: boolean;
  enableDebugging: boolean;
}

/**
 * KTDropdownEventManager
 *
 * Specialized event manager for datepicker dropdown state synchronization.
 * Provides clean event handling and state management integration.
 */
export class KTDropdownEventManager {
  private _eventManager: EventManager;
  private _stateManager: KTDropdownStateManager;
  private _config: DropdownEventManagerConfig;
  private _element: HTMLElement;
  private _unsubscribeState: (() => void) | null = null;

  constructor(
    element: HTMLElement,
    stateManager: KTDropdownStateManager,
    config?: Partial<DropdownEventManagerConfig>
  ) {
    this._element = element;
    this._stateManager = stateManager;

    this._config = {
      enableEventBubbling: true,
      enableEventCapture: false,
      enableCustomEvents: true,
      enableValidation: true,
      enableDebugging: false,
      ...config
    };

    this._eventManager = new EventManager();
    this._setupStateSubscription();
    this._setupEventListeners();
  }

  /**
   * Setup subscription to state changes
   */
  private _setupStateSubscription(): void {
    this._unsubscribeState = this._stateManager.subscribe((event: StateChangeEvent) => {
      this._handleStateChange(event);
    });
  }

  /**
   * Setup event listeners for dropdown interactions
   */
  private _setupEventListeners(): void {
    // Focus events
    this._eventManager.addListener(this._element, 'focusin', this._handleFocusIn.bind(this));
    this._eventManager.addListener(this._element, 'focusout', this._handleFocusOut.bind(this));

    // Click events
    this._eventManager.addListener(this._element, 'click', this._handleClick.bind(this));

    // Keyboard events
    this._eventManager.addListener(this._element, 'keydown', this._handleKeyDown.bind(this));

    // Document events for outside clicks
    this._eventManager.addListener(
      document as unknown as HTMLElement,
      'click',
      this._handleDocumentClick.bind(this)
    );

    // Window events for escape key
    this._eventManager.addListener(
      window as unknown as HTMLElement,
      'keydown',
      this._handleWindowKeyDown.bind(this)
    );
  }

  /**
   * Handle state change events
   */
  private _handleStateChange(event: StateChangeEvent): void {
    const { oldState, newState, source } = event;

    // Emit custom events if enabled
    if (this._config.enableCustomEvents) {
      this._emitCustomEvent(DropdownEventType.STATE_CHANGE, {
        state: newState,
        source,
        timestamp: event.timestamp,
        element: this._element
      });
    }

    // Handle specific state transitions
    if (!oldState.isOpen && newState.isOpen) {
      this._handleOpenTransition(newState, source);
    } else if (oldState.isOpen && !newState.isOpen) {
      this._handleCloseTransition(newState, source);
    }

    if (oldState.isTransitioning && !newState.isTransitioning) {
      this._handleTransitionEnd(newState, source);
    }

    // Debug logging
    if (this._config.enableDebugging) {
      console.log(`State change: ${source}`, { oldState, newState });
    }
  }

  /**
   * Handle open transition
   */
  private _handleOpenTransition(state: DropdownState, source: string): void {
    if (this._config.enableCustomEvents) {
      this._emitCustomEvent(DropdownEventType.OPEN, {
        state,
        source,
        timestamp: Date.now(),
        element: this._element
      });
    }

    // Emit transition start event
    this._emitCustomEvent(DropdownEventType.TRANSITION_START, {
      state,
      source,
      timestamp: Date.now(),
      element: this._element
    });
  }

  /**
   * Handle close transition
   */
  private _handleCloseTransition(state: DropdownState, source: string): void {
    if (this._config.enableCustomEvents) {
      this._emitCustomEvent(DropdownEventType.CLOSE, {
        state,
        source,
        timestamp: Date.now(),
        element: this._element
      });
    }

    // Emit transition start event
    this._emitCustomEvent(DropdownEventType.TRANSITION_START, {
      state,
      source,
      timestamp: Date.now(),
      element: this._element
    });
  }

  /**
   * Handle transition end
   */
  private _handleTransitionEnd(state: DropdownState, source: string): void {
    this._emitCustomEvent(DropdownEventType.TRANSITION_END, {
      state,
      source,
      timestamp: Date.now(),
      element: this._element
    });
  }

  /**
   * Handle focus in
   */
  private _handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (this._element.contains(target)) {
      this._stateManager.setFocus(true, 'focusin');

      if (this._config.enableCustomEvents) {
        this._emitCustomEvent(DropdownEventType.FOCUS, {
          state: this._stateManager.getState(),
          source: 'focusin',
          timestamp: Date.now(),
          element: this._element
        });
      }
    }
  }

  /**
   * Handle focus out
   */
  private _handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (this._element.contains(target) && !this._element.contains(relatedTarget)) {
      this._stateManager.setFocus(false, 'focusout');

      if (this._config.enableCustomEvents) {
        this._emitCustomEvent(DropdownEventType.BLUR, {
          state: this._stateManager.getState(),
          source: 'focusout',
          timestamp: Date.now(),
          element: this._element
        });
      }
    }
  }

  /**
   * Handle click events
   */
  private _handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is on toggle element
    if (target.closest('[data-kt-datepicker-toggle]')) {
      event.preventDefault();
      event.stopPropagation();

      this._stateManager.toggle('click');

      if (this._config.enableCustomEvents) {
        this._emitCustomEvent(DropdownEventType.TOGGLE, {
          state: this._stateManager.getState(),
          source: 'click',
          timestamp: Date.now(),
          element: this._element
        });
      }
    }
  }

  /**
   * Handle document click for outside clicks
   */
  private _handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!this._element.contains(target) && this._stateManager.isOpen()) {
      this._stateManager.close('outside-click');
    }
  }

  /**
   * Handle keydown events
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this._stateManager.isOpen()) {
      event.preventDefault();
      this._stateManager.close('escape');
    } else if (event.key === 'Enter' && !this._stateManager.isOpen()) {
      event.preventDefault();
      this._stateManager.open('enter');
    }
  }

  /**
   * Handle window keydown events
   */
  private _handleWindowKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this._stateManager.isOpen()) {
      this._stateManager.close('escape');
    }
  }

  /**
   * Emit custom event
   */
  private _emitCustomEvent(type: DropdownEventType, data: DropdownEventData): void {
    if (!this._config.enableCustomEvents) return;

    const customEvent = new CustomEvent(type, {
      detail: data,
      bubbles: this._config.enableEventBubbling,
      cancelable: true
    });

    this._element.dispatchEvent(customEvent);
  }

  /**
   * Add event listener
   */
  public addEventListener(type: DropdownEventType, listener: DropdownEventListener): void {
    this._element.addEventListener(type, listener as EventListener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: DropdownEventType, listener: DropdownEventListener): void {
    this._element.removeEventListener(type, listener as EventListener);
  }

  /**
   * Get state manager
   */
  public getStateManager(): KTDropdownStateManager {
    return this._stateManager;
  }

  /**
   * Get validator - removed in simplified version
   */
  public getValidator(): null {
    return null;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<DropdownEventManagerConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this._unsubscribeState) {
      this._unsubscribeState();
      this._unsubscribeState = null;
    }

    this._eventManager.removeAllListeners(this._element);
    this._eventManager.removeAllListeners(document as unknown as HTMLElement);
    this._eventManager.removeAllListeners(window as unknown as HTMLElement);
  }
}