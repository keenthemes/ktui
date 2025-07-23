/*
 * state-validator.ts - State validation engine for KTDatepicker dropdown
 * Provides comprehensive validation rules for dropdown state transitions.
 * Ensures state consistency and prevents invalid state combinations.
 */

import { DropdownState, StateValidationRule } from './state-manager';

/**
 * Validation context for additional validation data
 */
export interface ValidationContext {
  config?: any;
  element?: HTMLElement;
  timestamp?: number;
  userAction?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Advanced validation rule with context
 */
export interface AdvancedValidationRule extends StateValidationRule {
  validateWithContext: (
    oldState: DropdownState,
    newState: DropdownState,
    source: string,
    context?: ValidationContext
  ) => ValidationResult;
  priority: number; // Higher priority rules run first
}

/**
 * KTDropdownStateValidator
 *
 * Comprehensive state validation engine for dropdown state transitions.
 * Provides built-in validation rules and supports custom rule addition.
 */
export class KTDropdownStateValidator {
  private _rules: AdvancedValidationRule[] = [];
  private _customRules: AdvancedValidationRule[] = [];

  constructor() {
    this._setupDefaultRules();
  }

  /**
   * Setup default validation rules
   */
  private _setupDefaultRules(): void {
    this._rules = [
      // High priority rules
      {
        name: 'state-consistency',
        priority: 100,
        validate: (oldState, newState, source) => {
          return this._validateStateConsistency(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validateStateConsistency(oldState, newState, source);
        },
        message: 'State consistency validation failed'
      },
      {
        name: 'transition-logic',
        priority: 90,
        validate: (oldState, newState, source) => {
          return this._validateTransitionLogic(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validateTransitionLogic(oldState, newState, source);
        },
        message: 'Transition logic validation failed'
      },
      {
        name: 'disabled-state',
        priority: 80,
        validate: (oldState, newState, source) => {
          return this._validateDisabledState(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validateDisabledState(oldState, newState, source);
        },
        message: 'Disabled state validation failed'
      },
      {
        name: 'focus-consistency',
        priority: 70,
        validate: (oldState, newState, source) => {
          return this._validateFocusConsistency(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validateFocusConsistency(oldState, newState, source);
        },
        message: 'Focus consistency validation failed'
      },
      {
        name: 'timing-validation',
        priority: 60,
        validate: (oldState, newState, source) => {
          return this._validateTiming(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validateTiming(oldState, newState, source, context);
        },
        message: 'Timing validation failed'
      },
      {
        name: 'performance-validation',
        priority: 50,
        validate: (oldState, newState, source) => {
          return this._validatePerformance(oldState, newState, source).isValid;
        },
        validateWithContext: (oldState, newState, source, context) => {
          return this._validatePerformance(oldState, newState, source, context);
        },
        message: 'Performance validation failed'
      }
    ];
  }

  /**
   * Validate state consistency
   */
  private _validateStateConsistency(oldState: DropdownState, newState: DropdownState, source: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Cannot be open and closed at the same time
    if (newState.isOpen && newState.isTransitioning) {
      errors.push('Dropdown cannot be open while transitioning');
    }

    // Cannot be transitioning without state change
    if (newState.isTransitioning && oldState.isOpen === newState.isOpen) {
      errors.push('Transition state must accompany open state change');
    }

    // Focus should be consistent with open state
    if (newState.isOpen && !newState.isFocused && source !== 'blur') {
      warnings.push('Open dropdown should typically be focused');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate transition logic
   */
  private _validateTransitionLogic(oldState: DropdownState, newState: DropdownState, source: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Transition should be temporary
    if (newState.isTransitioning && oldState.isTransitioning) {
      errors.push('Already transitioning, cannot start new transition');
    }

    // Open state should not change during transition
    if (oldState.isTransitioning && oldState.isOpen !== newState.isOpen) {
      errors.push('Open state should not change during transition');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate disabled state
   */
  private _validateDisabledState(oldState: DropdownState, newState: DropdownState, source: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Cannot open if disabled
    if (newState.isDisabled && newState.isOpen) {
      errors.push('Disabled dropdown cannot be open');
    }

    // Cannot transition if disabled
    if (oldState.isDisabled && newState.isTransitioning) {
      errors.push('Disabled dropdown cannot transition');
    }

    // Should close when disabled
    if (oldState.isOpen && newState.isDisabled) {
      warnings.push('Consider closing dropdown when disabling');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate focus consistency
   */
  private _validateFocusConsistency(oldState: DropdownState, newState: DropdownState, source: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Focus should be lost when closing
    if (!oldState.isOpen && newState.isOpen && !newState.isFocused) {
      warnings.push('Consider focusing dropdown when opening');
    }

    // Focus should be maintained during transition
    if (oldState.isTransitioning && oldState.isFocused && !newState.isFocused) {
      warnings.push('Focus should be maintained during transition');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate timing
   */
  private _validateTiming(oldState: DropdownState, newState: DropdownState, source: string, context?: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for rapid state changes
    if (context?.timestamp && oldState.lastOpenedAt) {
      const timeSinceLastOpen = context.timestamp - oldState.lastOpenedAt;
      if (timeSinceLastOpen < 100) { // Less than 100ms
        warnings.push('Rapid state changes detected');
      }
    }

    // Check for rapid open/close cycles
    if (oldState.openCount > 0 && oldState.closeCount > 0) {
      const ratio = oldState.openCount / oldState.closeCount;
      if (ratio > 10) { // More than 10 opens per close
        warnings.push('High open/close ratio detected');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate performance
   */
  private _validatePerformance(oldState: DropdownState, newState: DropdownState, source: string, context?: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for excessive transitions
    if (oldState.openCount > 1000) {
      warnings.push('High number of state changes detected');
    }

    // Check for memory leaks (if context provides element)
    if (context?.element) {
      // This would require additional memory tracking
      // For now, just a placeholder for future implementation
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate state transition with all rules
   */
  public validateTransition(
    oldState: DropdownState,
    newState: DropdownState,
    source: string,
    context?: ValidationContext
  ): ValidationResult {
    const allRules = [...this._rules, ...this._customRules]
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of allRules) {
      try {
        const result = rule.validateWithContext(oldState, newState, source, context);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } catch (error) {
        console.error(`Error in validation rule '${rule.name}':`, error);
        errors.push(`Validation rule '${rule.name}' failed: ${error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Add custom validation rule
   */
  public addRule(rule: AdvancedValidationRule): void {
    this._customRules.push(rule);
  }

  /**
   * Remove custom validation rule
   */
  public removeRule(ruleName: string): void {
    this._customRules = this._customRules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Get all validation rules
   */
  public getRules(): AdvancedValidationRule[] {
    return [...this._rules, ...this._customRules];
  }

  /**
   * Clear all custom rules
   */
  public clearCustomRules(): void {
    this._customRules = [];
  }

  /**
   * Create a simple validation rule
   */
  public static createRule(
    name: string,
    validator: (oldState: DropdownState, newState: DropdownState, source: string) => boolean,
    message: string,
    priority: number = 50
  ): AdvancedValidationRule {
    return {
      name,
      priority,
      validate: validator,
      validateWithContext: (oldState, newState, source) => ({
        isValid: validator(oldState, newState, source),
        errors: validator(oldState, newState, source) ? [] : [message],
        warnings: []
      }),
      message
    };
  }
}