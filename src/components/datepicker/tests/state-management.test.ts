/*
 * state-management.test.ts - Tests for centralized dropdown state management
 * Validates the state manager, validator, and event manager functionality.
 */

import { KTDropdownStateManager } from '../state-manager';
import { KTDropdownStateValidator } from '../state-validator';
import { KTDropdownEventManager } from '../event-manager';
import { KTDropdownDebugManager } from '../debug-manager';

describe('KTDropdownStateManager', () => {
  let stateManager: KTDropdownStateManager;

  beforeEach(() => {
    stateManager = new KTDropdownStateManager({
      enableValidation: true,
      enableHistory: true,
      enableDebugging: false
    });
  });

  afterEach(() => {
    stateManager.dispose();
  });

  test('should initialize with closed state', () => {
    const state = stateManager.getState();
    expect(state.isOpen).toBe(false);
    expect(state.isTransitioning).toBe(false);
    expect(state.isDisabled).toBe(false);
    expect(state.isFocused).toBe(false);
  });

  test('should open dropdown successfully', () => {
    const success = stateManager.open('test');
    expect(success).toBe(true);

    const state = stateManager.getState();
    expect(state.isOpen).toBe(true);
    expect(state.isTransitioning).toBe(true);
    expect(state.openCount).toBe(1);
  });

  test('should close dropdown successfully', () => {
    stateManager.open('test');
    const success = stateManager.close('test');
    expect(success).toBe(true);

    const state = stateManager.getState();
    expect(state.isOpen).toBe(false);
    expect(state.isTransitioning).toBe(true);
    expect(state.closeCount).toBe(1);
  });

  test('should complete transition', () => {
    stateManager.open('test');
    const success = stateManager.completeTransition('transition');
    expect(success).toBe(true);

    const state = stateManager.getState();
    expect(state.isOpen).toBe(true);
    expect(state.isTransitioning).toBe(false);
  });

  test('should toggle dropdown state', () => {
    // Toggle from closed to open
    const openSuccess = stateManager.toggle('test');
    expect(openSuccess).toBe(true);
    expect(stateManager.isOpen()).toBe(true);

    // Toggle from open to closed
    const closeSuccess = stateManager.toggle('test');
    expect(closeSuccess).toBe(true);
    expect(stateManager.isOpen()).toBe(false);
  });

  test('should prevent opening when disabled', () => {
    stateManager.disable('test');
    const success = stateManager.open('test');
    expect(success).toBe(false);
    expect(stateManager.isOpen()).toBe(false);
  });

  test('should maintain state history', () => {
    stateManager.open('test');
    stateManager.close('test');

    const history = stateManager.getStateHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  test('should notify state change observers', () => {
    const observer = jest.fn();
    const unsubscribe = stateManager.subscribe(observer);

    stateManager.open('test');

    expect(observer).toHaveBeenCalledWith(expect.objectContaining({
      newState: expect.objectContaining({ isOpen: true }),
      source: 'test'
    }));

    unsubscribe();
  });
});

describe('KTDropdownStateValidator', () => {
  let validator: KTDropdownStateValidator;

  beforeEach(() => {
    validator = new KTDropdownStateValidator();
  });

  test('should validate valid state transitions', () => {
    const oldState = {
      isOpen: false,
      isTransitioning: false,
      isDisabled: false,
      isFocused: false,
      lastOpenedAt: null,
      lastClosedAt: null,
      openCount: 0,
      closeCount: 0
    };

    const newState = {
      ...oldState,
      isOpen: true,
      isTransitioning: true
    };

    const result = validator.validateTransition(oldState, newState, 'test');
    expect(result.isValid).toBe(true);
  });

  test('should reject invalid state transitions', () => {
    const oldState = {
      isOpen: false,
      isTransitioning: false,
      isDisabled: false,
      isFocused: false,
      lastOpenedAt: null,
      lastClosedAt: null,
      openCount: 0,
      closeCount: 0
    };

    const newState = {
      ...oldState,
      isOpen: true,
      isTransitioning: true,
      isDisabled: true // Invalid: cannot be open and disabled
    };

    const result = validator.validateTransition(oldState, newState, 'test');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should add custom validation rules', () => {
    const customRule = {
      name: 'custom-rule',
      priority: 100,
      validate: () => false,
      validateWithContext: () => ({
        isValid: false,
        errors: ['Custom validation failed'],
        warnings: []
      }),
      message: 'Custom validation failed'
    };

    validator.addRule(customRule);

    const oldState = {
      isOpen: false,
      isTransitioning: false,
      isDisabled: false,
      isFocused: false,
      lastOpenedAt: null,
      lastClosedAt: null,
      openCount: 0,
      closeCount: 0
    };

    const newState = { ...oldState, isOpen: true };

    const result = validator.validateTransition(oldState, newState, 'test');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Custom validation failed');
  });
});

describe('KTDropdownEventManager', () => {
  let stateManager: KTDropdownStateManager;
  let eventManager: KTDropdownEventManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    stateManager = new KTDropdownStateManager();
    mockElement = document.createElement('div');
    eventManager = new KTDropdownEventManager(mockElement, stateManager, {
      enableCustomEvents: true,
      enableDebugging: false
    });
  });

  afterEach(() => {
    eventManager.dispose();
    stateManager.dispose();
  });

  test('should handle state changes and emit events', () => {
    const eventListener = jest.fn();
    eventManager.addEventListener('dropdown:open' as any, eventListener);

    stateManager.open('test');

    expect(eventListener).toHaveBeenCalled();
  });

  test('should provide access to state manager', () => {
    const retrievedStateManager = eventManager.getStateManager();
    expect(retrievedStateManager).toBe(stateManager);
  });

  test('should provide access to validator', () => {
    const validator = eventManager.getValidator();
    expect(validator).toBeInstanceOf(KTDropdownStateValidator);
  });
});

describe('KTDropdownDebugManager', () => {
  let stateManager: KTDropdownStateManager;
  let validator: KTDropdownStateValidator;
  let debugManager: KTDropdownDebugManager;

  beforeEach(() => {
    stateManager = new KTDropdownStateManager();
    validator = new KTDropdownStateValidator();
    debugManager = new KTDropdownDebugManager(stateManager, validator, {
      enableLogging: true,
      enableStateTracking: true,
      enablePerformanceMonitoring: true
    });
  });

  afterEach(() => {
    debugManager.dispose();
    stateManager.dispose();
  });

  test('should track state changes', () => {
    stateManager.open('test');
    stateManager.close('test');

    const analysis = debugManager.getStateAnalysis();
    expect(analysis.stateHistory.length).toBeGreaterThan(0);
    expect(analysis.performanceMetrics.stateChanges).toBeGreaterThan(0);
  });

  test('should provide performance metrics', () => {
    stateManager.open('test');
    stateManager.close('test');

    const report = debugManager.getPerformanceReport();
    expect(report.metrics.stateChanges).toBeGreaterThan(0);
    expect(report.metrics.averageStateChangeTime).toBeGreaterThan(0);
  });

  test('should log debug messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    debugManager.log('info', 'test', 'Test message');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[KTDatepicker Debug] [TEST]',
      'Test message'
    );

    consoleSpy.mockRestore();
  });

  test('should export debug data', () => {
    stateManager.open('test');

    const debugData = debugManager.exportDebugData();
    expect(debugData.config).toBeDefined();
    expect(debugData.stateAnalysis).toBeDefined();
    expect(debugData.performanceReport).toBeDefined();
    expect(debugData.logs).toBeDefined();
  });
});