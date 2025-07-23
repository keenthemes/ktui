/*
 * observer-factory.ts - Simplified observer factory for KTDatepicker unified state management
 * Creates and manages the unified observer with configurable defaults and error handling.
 */

import { UnifiedObserver, UnifiedObserverConfig, UIElements } from './unified-observer';

/**
 * Unified observer configuration
 */
export interface ObserverConfig {
  enableDebugging: boolean;
  enableValidation: boolean;
  enableSmoothTransitions: boolean;
  updateDelay: number;
  formatOptions: {
    yearFormat: 'numeric' | '2-digit';
    monthFormat: 'numeric' | '2-digit' | 'short' | 'long';
    dayFormat: 'numeric' | '2-digit';
    hourFormat: 'numeric' | '2-digit';
    minuteFormat: 'numeric' | '2-digit';
    secondFormat: 'numeric' | '2-digit';
    timeFormat: '12h' | '24h';
  };
}

/**
 * Observer creation options
 */
export interface ObserverCreationOptions {
  enableDebugging?: boolean;
  enableValidation?: boolean;
  enableSmoothTransitions?: boolean;
  updateDelay?: number;
  customConfig?: Partial<ObserverConfig>;
}

/**
 * ObserverFactory
 *
 * Simplified factory for creating and managing the unified datepicker observer.
 * Provides a centralized approach to observer creation and management.
 */
export class ObserverFactory {
  private _defaultConfig: ObserverConfig;

  constructor(defaultConfig?: Partial<ObserverConfig>) {
    this._defaultConfig = {
      enableDebugging: false,
      enableValidation: true,
      enableSmoothTransitions: true,
      updateDelay: 0,
      formatOptions: {
        yearFormat: 'numeric',
        monthFormat: '2-digit',
        dayFormat: '2-digit',
        hourFormat: '2-digit',
        minuteFormat: '2-digit',
        secondFormat: '2-digit',
        timeFormat: '24h'
      },
      ...defaultConfig
    };
  }

  /**
   * Create unified observer for all datepicker UI components
   */
  public createUnifiedObserver(
    elements: UIElements,
    options?: ObserverCreationOptions
  ): UnifiedObserver {
    try {
      const config = this._mergeConfig(options);
      const observer = new UnifiedObserver(elements, config);

      if (options?.enableDebugging) {
        console.log('[ObserverFactory] UnifiedObserver created successfully');
      }

      return observer;
    } catch (error) {
      console.error('[ObserverFactory] Error creating UnifiedObserver:', error);
      throw new Error('Failed to create UnifiedObserver');
    }
  }

  /**
   * Set default configuration
   */
  public setDefaultConfig(config: Partial<ObserverConfig>): void {
    this._defaultConfig = { ...this._defaultConfig, ...config };
  }

  /**
   * Get default configuration
   */
  public getDefaultConfig(): ObserverConfig {
    return { ...this._defaultConfig };
  }

  /**
   * Merge configuration with defaults
   */
  private _mergeConfig(options?: ObserverCreationOptions): UnifiedObserverConfig {
    const baseConfig = this._defaultConfig;
    const customConfig = options?.customConfig || {};

    return {
      ...baseConfig,
      ...customConfig,
      enableDebugging: options?.enableDebugging ?? baseConfig.enableDebugging,
      enableValidation: options?.enableValidation ?? baseConfig.enableValidation,
      enableSmoothTransitions: options?.enableSmoothTransitions ?? baseConfig.enableSmoothTransitions,
      updateDelay: options?.updateDelay ?? baseConfig.updateDelay
    };
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: Partial<ObserverConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (typeof config.enableDebugging !== 'boolean' && config.enableDebugging !== undefined) {
      errors.push('enableDebugging must be a boolean');
    }

    if (typeof config.enableValidation !== 'boolean' && config.enableValidation !== undefined) {
      errors.push('enableValidation must be a boolean');
    }

    if (typeof config.enableSmoothTransitions !== 'boolean' && config.enableSmoothTransitions !== undefined) {
      errors.push('enableSmoothTransitions must be a boolean');
    }

    if (typeof config.updateDelay !== 'number' && config.updateDelay !== undefined) {
      errors.push('updateDelay must be a number');
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
      version: '3.0.0',
      supportedObservers: ['unified'],
      defaultConfig: this.getDefaultConfig()
    };
  }
}