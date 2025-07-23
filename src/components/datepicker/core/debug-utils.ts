/*
 * debug-utils.ts - Debug utilities for KTDatepicker
 * Provides centralized debug logging with conditional output
 */

/**
 * Debug configuration
 */
export interface DebugConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug';
  prefix: string;
}

/**
 * Debug logger class
 */
export class DebugLogger {
  private _config: DebugConfig;

  constructor(config?: Partial<DebugConfig>) {
    this._config = {
      enabled: false,
      level: 'info',
      prefix: '[KTDatepicker]',
      ...config
    };
  }

  /**
   * Log error message
   */
  public error(message: string, ...args: any[]): void {
    if (this._config.enabled) {
      console.error(`${this._config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, ...args: any[]): void {
    if (this._config.enabled && this._shouldLog('warn')) {
      console.warn(`${this._config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, ...args: any[]): void {
    if (this._config.enabled && this._shouldLog('info')) {
      console.log(`${this._config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Log debug message
   */
  public debug(message: string, ...args: any[]): void {
    if (this._config.enabled && this._shouldLog('debug')) {
      console.log(`${this._config.prefix} [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Check if message should be logged based on level
   */
  private _shouldLog(level: string): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level as keyof typeof levels] <= levels[this._config.level];
  }

  /**
   * Update debug configuration
   */
  public updateConfig(config: Partial<DebugConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Enable debug logging
   */
  public enable(): void {
    this._config.enabled = true;
  }

  /**
   * Disable debug logging
   */
  public disable(): void {
    this._config.enabled = false;
  }
}

/**
 * Global debug logger instance
 */
export const debugLogger = new DebugLogger();

/**
 * Debug log function for backward compatibility
 */
export function debugLog(message: string, ...args: any[]): void {
  debugLogger.info(message, ...args);
}

/**
 * Debug error function for backward compatibility
 */
export function debugError(message: string, ...args: any[]): void {
  debugLogger.error(message, ...args);
}