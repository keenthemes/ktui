/*
 * debug-manager.ts - Debugging and monitoring for KTDatepicker dropdown state
 * Provides enhanced debugging capabilities, state monitoring, and performance tracking.
 * Helps developers understand dropdown behavior and troubleshoot issues.
 */

import { KTDropdownStateManager, DropdownState, StateChangeEvent } from './state-manager';
import { KTDropdownStateValidator, ValidationResult } from './state-validator';

/**
 * Debug configuration
 */
export interface DebugConfig {
  enableLogging: boolean;
  enableStateTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableValidationLogging: boolean;
  enableEventLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLogEntries: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  stateChanges: number;
  averageStateChangeTime: number;
  totalStateChangeTime: number;
  validationTime: number;
  eventProcessingTime: number;
  memoryUsage?: number;
}

/**
 * Debug log entry
 */
export interface DebugLogEntry {
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
}

/**
 * KTDropdownDebugManager
 *
 * Comprehensive debugging and monitoring system for dropdown state management.
 * Provides detailed logging, performance tracking, and state analysis.
 */
export class KTDropdownDebugManager {
  private _stateManager: KTDropdownStateManager;
  private _validator: KTDropdownStateValidator;
  private _config: DebugConfig;
  private _logs: DebugLogEntry[] = [];
  private _performanceMetrics: PerformanceMetrics;
  private _stateHistory: DropdownState[] = [];
  private _unsubscribeState: (() => void) | null = null;

  constructor(
    stateManager: KTDropdownStateManager,
    validator: KTDropdownStateValidator,
    config?: Partial<DebugConfig>
  ) {
    this._stateManager = stateManager;
    this._validator = validator;

    this._config = {
      enableLogging: true,
      enableStateTracking: true,
      enablePerformanceMonitoring: true,
      enableValidationLogging: true,
      enableEventLogging: true,
      logLevel: 'info',
      maxLogEntries: 1000,
      ...config
    };

    this._performanceMetrics = {
      stateChanges: 0,
      averageStateChangeTime: 0,
      totalStateChangeTime: 0,
      validationTime: 0,
      eventProcessingTime: 0
    };

    this._setupStateSubscription();
  }

  /**
   * Setup subscription to state changes for monitoring
   */
  private _setupStateSubscription(): void {
    if (!this._config.enableStateTracking) return;

    this._unsubscribeState = this._stateManager.subscribe((event: StateChangeEvent) => {
      this._handleStateChange(event);
    });
  }

  /**
   * Handle state change for monitoring
   */
  private _handleStateChange(event: StateChangeEvent): void {
    const startTime = performance.now();

    // Track state history
    if (this._config.enableStateTracking) {
      this._stateHistory.push({ ...event.newState });
      if (this._stateHistory.length > this._config.maxLogEntries) {
        this._stateHistory.shift();
      }
    }

    // Update performance metrics
    if (this._config.enablePerformanceMonitoring) {
      this._performanceMetrics.stateChanges++;
      const changeTime = performance.now() - startTime;
      this._performanceMetrics.totalStateChangeTime += changeTime;
      this._performanceMetrics.averageStateChangeTime =
        this._performanceMetrics.totalStateChangeTime / this._performanceMetrics.stateChanges;
    }

    // Log state change
    if (this._config.enableLogging) {
      this.log('info', 'state-change', `State changed from ${event.source}`, {
        oldState: event.oldState,
        newState: event.newState,
        source: event.source,
        timestamp: event.timestamp
      });
    }
  }

  /**
   * Log a debug message
   */
  public log(level: 'error' | 'warn' | 'info' | 'debug', category: string, message: string, data?: any): void {
    if (!this._config.enableLogging) return;

    // Check log level
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    if (levels[level] > levels[this._config.logLevel]) return;

    const entry: DebugLogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stackTrace: level === 'error' ? new Error().stack : undefined
    };

    this._logs.push(entry);

    // Limit log entries
    if (this._logs.length > this._config.maxLogEntries) {
      this._logs.shift();
    }

    // Console output
    const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    const prefix = `[KTDatepicker Debug] [${category.toUpperCase()}]`;

    if (data) {
      console[logMethod](prefix, message, data);
    } else {
      console[logMethod](prefix, message);
    }
  }

  /**
   * Validate state transition with detailed logging
   */
  public validateStateTransition(
    oldState: DropdownState,
    newState: DropdownState,
    source: string
  ): ValidationResult {
    const startTime = performance.now();

    const result = this._validator.validateTransition(oldState, newState, source);

    const validationTime = performance.now() - startTime;
    this._performanceMetrics.validationTime += validationTime;

    if (this._config.enableValidationLogging) {
      if (!result.isValid) {
        this.log('error', 'validation', 'State transition validation failed', {
          oldState,
          newState,
          source,
          errors: result.errors,
          warnings: result.warnings,
          validationTime
        });
      } else if (result.warnings.length > 0) {
        this.log('warn', 'validation', 'State transition validation warnings', {
          oldState,
          newState,
          source,
          warnings: result.warnings,
          validationTime
        });
      } else {
        this.log('debug', 'validation', 'State transition validation passed', {
          oldState,
          newState,
          source,
          validationTime
        });
      }
    }

    return result;
  }

  /**
   * Get current state analysis
   */
  public getStateAnalysis(): {
    currentState: DropdownState;
    stateHistory: DropdownState[];
    performanceMetrics: PerformanceMetrics;
    recentLogs: DebugLogEntry[];
    stateConsistency: boolean;
  } {
    const currentState = this._stateManager.getState();

    // Check state consistency
    const stateConsistency = this._checkStateConsistency(currentState);

    return {
      currentState,
      stateHistory: [...this._stateHistory],
      performanceMetrics: { ...this._performanceMetrics },
      recentLogs: [...this._logs].slice(-50), // Last 50 logs
      stateConsistency
    };
  }

  /**
   * Check state consistency
   */
  private _checkStateConsistency(state: DropdownState): boolean {
    // Basic consistency checks
    if (state.isOpen && state.isTransitioning) return false;
    if (state.isDisabled && state.isOpen) return false;
    if (state.isDisabled && state.isTransitioning) return false;

    return true;
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const metrics = { ...this._performanceMetrics };
    const recommendations: string[] = [];

    // Analyze performance and provide recommendations
    if (metrics.averageStateChangeTime > 10) {
      recommendations.push('State changes are taking longer than expected. Consider optimizing state update logic.');
    }

    if (metrics.stateChanges > 1000) {
      recommendations.push('High number of state changes detected. Consider debouncing or reducing unnecessary updates.');
    }

    if (metrics.validationTime > metrics.totalStateChangeTime * 0.5) {
      recommendations.push('Validation is taking significant time. Consider optimizing validation rules.');
    }

    return { metrics, recommendations };
  }

  /**
   * Export debug data
   */
  public exportDebugData(): {
    config: DebugConfig;
    stateAnalysis: ReturnType<typeof this.getStateAnalysis>;
    performanceReport: ReturnType<typeof this.getPerformanceReport>;
    logs: DebugLogEntry[];
  } {
    return {
      config: { ...this._config },
      stateAnalysis: this.getStateAnalysis(),
      performanceReport: this.getPerformanceReport(),
      logs: [...this._logs]
    };
  }

  /**
   * Clear logs and reset metrics
   */
  public clear(): void {
    this._logs = [];
    this._stateHistory = [];
    this._performanceMetrics = {
      stateChanges: 0,
      averageStateChangeTime: 0,
      totalStateChangeTime: 0,
      validationTime: 0,
      eventProcessingTime: 0
    };
  }

  /**
   * Update debug configuration
   */
  public updateConfig(config: Partial<DebugConfig>): void {
    this._config = { ...this._config, ...config };

    // Re-setup state subscription if needed
    if (config.enableStateTracking !== undefined) {
      if (this._unsubscribeState) {
        this._unsubscribeState();
        this._unsubscribeState = null;
      }
      this._setupStateSubscription();
    }
  }

  /**
   * Get debug configuration
   */
  public getConfig(): DebugConfig {
    return { ...this._config };
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this._unsubscribeState) {
      this._unsubscribeState();
      this._unsubscribeState = null;
    }

    this._logs = [];
    this._stateHistory = [];
  }
}