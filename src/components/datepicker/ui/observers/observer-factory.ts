/*
 * observer-factory.ts - Observer factory for KTDatepicker unified state management
 * Provides unified creation and management of all datepicker observers with configurable
 * defaults and error handling.
 */

import { InputObserver, InputObserverConfig } from './input-observer';
import { SegmentedInputObserver, SegmentedInputObserverConfig } from './segmented-input-observer';
import { CalendarObserver, CalendarObserverConfig } from './calendar-observer';
import { TimePickerObserver, TimePickerObserverConfig } from './time-picker-observer';

/**
 * Unified observer configuration
 */
export interface ObserverConfig {
  input: Partial<InputObserverConfig>;
  segmentedInput: Partial<SegmentedInputObserverConfig>;
  calendar: Partial<CalendarObserverConfig>;
  timePicker: Partial<TimePickerObserverConfig>;
}

/**
 * Observer creation options
 */
export interface ObserverCreationOptions {
  enableDebugging?: boolean;
  enableValidation?: boolean;
  updateDelay?: number;
  customConfig?: Partial<ObserverConfig>;
}

/**
 * ObserverFactory
 *
 * Factory for creating and managing all datepicker observers with unified configuration
 * and error handling. Provides a centralized approach to observer creation and management.
 */
export class ObserverFactory {
  private _defaultConfig: ObserverConfig;

  constructor(defaultConfig?: Partial<ObserverConfig>) {
    this._defaultConfig = {
      input: {
        enableDebugging: false,
        enableFormatValidation: true,
        updateDelay: 0
      },
      segmentedInput: {
        enableDebugging: false,
        enableValidation: true,
        updateDelay: 0,
        formatOptions: {
          yearFormat: 'numeric',
          monthFormat: '2-digit',
          dayFormat: '2-digit',
          hourFormat: '2-digit',
          minuteFormat: '2-digit',
          secondFormat: '2-digit',
          timeFormat: '24h'
        }
      },
      calendar: {
        enableDebugging: false,
        enableSmoothTransitions: true,
        updateDelay: 0
      },
      timePicker: {
        enableDebugging: false,
        enableSmoothTransitions: true,
        updateDelay: 0
      },
      ...defaultConfig
    };
  }

  /**
   * Create InputObserver for hidden input field
   */
  public createInputObserver(
    input: HTMLInputElement | null,
    options?: ObserverCreationOptions
  ): InputObserver {
    try {
      const config = this._mergeConfig('input', options);
      const observer = new InputObserver(input, config);

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] InputObserver created successfully');
      }

      return observer;
    } catch (error) {
      console.error('[ObserverFactory] Error creating InputObserver:', error);
      throw new Error('Failed to create InputObserver');
    }
  }

  /**
   * Create SegmentedInputObserver for segmented input components
   */
  public createSegmentedInputObserver(
    container: HTMLElement | null,
    options?: ObserverCreationOptions
  ): SegmentedInputObserver {
    try {
      console.log('[ObserverFactory] Creating SegmentedInputObserver with container:', container);
      console.log('[ObserverFactory] Options:', options);

      const config = this._mergeConfig('segmentedInput', options);
      console.log('[ObserverFactory] Merged config:', config);

      const observer = new SegmentedInputObserver(container, config);
      console.log('[ObserverFactory] SegmentedInputObserver created successfully:', observer);

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] Debug mode enabled for SegmentedInputObserver');
      }

      return observer;
    } catch (error) {
      console.error('[ObserverFactory] Error creating SegmentedInputObserver:', error);
      throw new Error('Failed to create SegmentedInputObserver');
    }
  }

  /**
   * Create CalendarObserver for calendar UI
   */
  public createCalendarObserver(
    element: HTMLElement | null,
    options?: ObserverCreationOptions
  ): CalendarObserver {
    try {
      const config = this._mergeConfig('calendar', options);
      const observer = new CalendarObserver(element, config);

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] CalendarObserver created successfully');
      }

      return observer;
    } catch (error) {
      console.error('[ObserverFactory] Error creating CalendarObserver:', error);
      throw new Error('Failed to create CalendarObserver');
    }
  }

  /**
   * Create TimePickerObserver for time picker UI
   */
  public createTimePickerObserver(
    element: HTMLElement | null,
    options?: ObserverCreationOptions
  ): TimePickerObserver {
    try {
      const config = this._mergeConfig('timePicker', options);
      const observer = new TimePickerObserver(element, config);

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] TimePickerObserver created successfully');
      }

      return observer;
    } catch (error) {
      console.error('[ObserverFactory] Error creating TimePickerObserver:', error);
      throw new Error('Failed to create TimePickerObserver');
    }
  }

  /**
   * Create all observers for a complete datepicker setup
   */
  public createAllObservers(
    elements: {
      input?: HTMLInputElement | null;
      segmentedInputContainer?: HTMLElement | null;
      calendarElement?: HTMLElement | null;
      timePickerElement?: HTMLElement | null;
    },
    options?: ObserverCreationOptions
  ): {
    inputObserver?: InputObserver;
    segmentedInputObserver?: SegmentedInputObserver;
    calendarObserver?: CalendarObserver;
    timePickerObserver?: TimePickerObserver;
  } {
    const observers: any = {};

    try {
      // Create input observer if input element is provided
      if (elements.input) {
        observers.inputObserver = this.createInputObserver(elements.input, options);
      }

      // Create segmented input observer if container is provided
      if (elements.segmentedInputContainer) {
        observers.segmentedInputObserver = this.createSegmentedInputObserver(
          elements.segmentedInputContainer,
          options
        );
      }

      // Create calendar observer if element is provided
      if (elements.calendarElement) {
        observers.calendarObserver = this.createCalendarObserver(
          elements.calendarElement,
          options
        );
      }

      // Create time picker observer if element is provided
      if (elements.timePickerElement) {
        observers.timePickerObserver = this.createTimePickerObserver(
          elements.timePickerElement,
          options
        );
      }

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] All observers created successfully:', Object.keys(observers));
      }

      return observers;
    } catch (error) {
      console.error('[ObserverFactory] Error creating observers:', error);

      // Clean up any created observers on error
      this._disposeObservers(observers);
      throw new Error('Failed to create observers');
    }
  }

  /**
   * Set default configuration
   */
  public setDefaultConfig(config: Partial<ObserverConfig>): void {
    this._defaultConfig = { ...this._defaultConfig, ...config };
  }

  /**
   * Get current default configuration
   */
  public getDefaultConfig(): ObserverConfig {
    return { ...this._defaultConfig };
  }

  /**
   * Update specific observer configuration
   */
  public updateObserverConfig(
    observerType: keyof ObserverConfig,
    config: Partial<ObserverConfig[keyof ObserverConfig]>
  ): void {
    if (this._defaultConfig[observerType]) {
      this._defaultConfig[observerType] = {
        ...this._defaultConfig[observerType],
        ...config
      };
    }
  }

  /**
   * Merge configuration with options
   */
  private _mergeConfig(
    observerType: keyof ObserverConfig,
    options?: ObserverCreationOptions
  ): any {
    const baseConfig = this._defaultConfig[observerType];
    const customConfig = options?.customConfig?.[observerType] || {};

    // Apply global options
    const mergedConfig = {
      ...baseConfig,
      ...customConfig
    };

        // Override with global options if provided
    if (options?.enableDebugging !== undefined) {
      mergedConfig.enableDebugging = options.enableDebugging;
    }

    if (options?.enableValidation !== undefined) {
      // Handle different property names for different observers
      if ('enableValidation' in mergedConfig) {
        mergedConfig.enableValidation = options.enableValidation;
      } else if ('enableFormatValidation' in mergedConfig) {
        mergedConfig.enableFormatValidation = options.enableValidation;
      }
    }

    if (options?.updateDelay !== undefined) {
      mergedConfig.updateDelay = options.updateDelay;
    }

    return mergedConfig;
  }

  /**
   * Dispose all observers in a collection
   */
  private _disposeObservers(observers: Record<string, any>): void {
    for (const [name, observer] of Object.entries(observers)) {
      if (observer && typeof observer.dispose === 'function') {
        try {
          observer.dispose();
        } catch (error) {
          console.warn(`[ObserverFactory] Error disposing ${name}:`, error);
        }
      }
    }
  }

  /**
   * Validate observer configuration
   */
  public validateConfig(config: Partial<ObserverConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate input observer config
    if (config.input) {
      if (config.input.updateDelay && config.input.updateDelay < 0) {
        errors.push('Input observer updateDelay must be non-negative');
      }
    }

    // Validate segmented input observer config
    if (config.segmentedInput) {
      if (config.segmentedInput.updateDelay && config.segmentedInput.updateDelay < 0) {
        errors.push('Segmented input observer updateDelay must be non-negative');
      }

      if (config.segmentedInput.formatOptions) {
        const formatOptions = config.segmentedInput.formatOptions;
        if (formatOptions.timeFormat && !['12h', '24h'].includes(formatOptions.timeFormat)) {
          errors.push('Time format must be either "12h" or "24h"');
        }
      }
    }

    // Validate calendar observer config
    if (config.calendar) {
      if (config.calendar.updateDelay && config.calendar.updateDelay < 0) {
        errors.push('Calendar observer updateDelay must be non-negative');
      }
    }

    // Validate time picker observer config
    if (config.timePicker) {
      if (config.timePicker.updateDelay && config.timePicker.updateDelay < 0) {
        errors.push('Time picker observer updateDelay must be non-negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get factory information
   */
  public getFactoryInfo(): {
    version: string;
    supportedObservers: string[];
    defaultConfig: ObserverConfig;
  } {
    return {
      version: '1.0.0',
      supportedObservers: ['InputObserver', 'SegmentedInputObserver', 'CalendarObserver', 'TimePickerObserver'],
      defaultConfig: this.getDefaultConfig()
    };
  }
}