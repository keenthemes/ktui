/*
 * event-manager.ts - Internal event management for KTDatepicker
 * Replaces external dependency on select component's EventManager
 */

/**
 * Event listener function type
 */
export type EventListener = (event: Event) => void;

/**
 * Event manager configuration
 */
export interface EventManagerConfig {
  enableEventBubbling: boolean;
  enableCustomEvents: boolean;
  enableValidation: boolean;
  enableDebugging: boolean;
}

/**
 * Event manager for handling DOM events
 */
export class EventManager {
  // Alias for backward compatibility
  static KTDropdownEventManager = EventManager;
  private _listeners: Map<HTMLElement, Map<string, Set<EventListener>>> = new Map();
  private _config: EventManagerConfig;

  constructor(config?: Partial<EventManagerConfig>) {
    this._config = {
      enableEventBubbling: true,
      enableCustomEvents: false,
      enableValidation: true,
      enableDebugging: false,
      ...config
    };
  }

  /**
   * Add event listener to element
   */
  public addListener(element: HTMLElement, eventType: string, listener: EventListener): void {
    if (!this._listeners.has(element)) {
      this._listeners.set(element, new Map());
    }

    const elementListeners = this._listeners.get(element)!;
    if (!elementListeners.has(eventType)) {
      elementListeners.set(eventType, new Set());
    }

    const listeners = elementListeners.get(eventType)!;
    listeners.add(listener);

    element.addEventListener(eventType, listener, !this._config.enableEventBubbling);
  }

  /**
   * Remove event listener from element
   */
  public removeListener(element: HTMLElement, eventType: string, listener: EventListener): void {
    const elementListeners = this._listeners.get(element);
    if (!elementListeners) return;

    const listeners = elementListeners.get(eventType);
    if (!listeners) return;

    listeners.delete(listener);
    element.removeEventListener(eventType, listener, !this._config.enableEventBubbling);

    if (listeners.size === 0) {
      elementListeners.delete(eventType);
    }

    if (elementListeners.size === 0) {
      this._listeners.delete(element);
    }
  }

  /**
   * Remove all listeners from element
   */
  public removeAllListeners(element: HTMLElement): void {
    const elementListeners = this._listeners.get(element);
    if (!elementListeners) return;

    elementListeners.forEach((listeners, eventType) => {
      listeners.forEach(listener => {
        element.removeEventListener(eventType, listener, !this._config.enableEventBubbling);
      });
    });

    this._listeners.delete(element);
  }

  /**
   * Remove all listeners from all elements
   */
  public removeAllListenersFromAll(): void {
    this._listeners.forEach((elementListeners, element) => {
      elementListeners.forEach((listeners, eventType) => {
        listeners.forEach(listener => {
          element.removeEventListener(eventType, listener, !this._config.enableEventBubbling);
        });
      });
    });

    this._listeners.clear();
  }

  /**
   * Dispatch custom event
   */
  public dispatchEvent(element: HTMLElement, eventType: string, detail?: any): boolean {
    if (!this._config.enableCustomEvents) {
      return false;
    }

    const event = new CustomEvent(eventType, {
      detail,
      bubbles: this._config.enableEventBubbling,
      cancelable: true
    });

    const result = element.dispatchEvent(event);

    return result;
  }

  /**
   * Get listener count for element and event type
   */
  public getListenerCount(element: HTMLElement, eventType?: string): number {
    const elementListeners = this._listeners.get(element);
    if (!elementListeners) return 0;

    if (eventType) {
      return elementListeners.get(eventType)?.size || 0;
    }

    let total = 0;
    elementListeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }

  /**
   * Dispose of event manager
   */
  public dispose(): void {
    this.removeAllListenersFromAll();
    this._listeners.clear();
  }
}

// Export alias for backward compatibility
export { EventManager as KTDropdownEventManager };