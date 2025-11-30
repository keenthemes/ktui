/**
 * state-manager.test.ts - Test suite for KTDatepickerUnifiedStateManager
 * Tests the immediate vs batched update functionality and observer patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDatepickerUnifiedStateManager } from '../core/unified-state-manager';
import { KTDatepickerState } from '../config/types';

describe('KTDatepickerUnifiedStateManager', () => {
  let stateManager: KTDatepickerUnifiedStateManager;
  let mockObserver: any;

  beforeEach(() => {
    // Create a new state manager for each test
    stateManager = new KTDatepickerUnifiedStateManager({
      enableValidation: true,
      enableDebugging: false,
      enableUpdateBatching: true,
      batchDelay: 16
    });

    // Create a mock observer
    mockObserver = {
      onStateChange: vi.fn(),
      getUpdatePriority: vi.fn().mockReturnValue(1)
    };
  });

  describe('Immediate Updates', () => {
    it('should apply immediate updates without batching delay', async () => {
      const observer = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      const success = stateManager.updateState({ selectedDate: testDate }, 'test', true); // immediate = true

      expect(success).toBe(true);
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      const [newState, oldState] = mockObserver.onStateChange.mock.calls[0];
      expect(newState.selectedDate).toEqual(testDate);

      observer(); // unsubscribe
    });

    it('should apply batched updates with delay when immediate is false', async () => {
      const observer = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      const success = stateManager.updateState({ selectedDate: testDate }, 'test', false); // immediate = false

      expect(success).toBe(true);

      // Should not have been called immediately
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      // Wait for batch timeout (using a longer timeout for test reliability)
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      observer(); // unsubscribe
    });

    it('should default to batched updates when immediate is not specified', async () => {
      const observer = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      const success = stateManager.updateState({ selectedDate: testDate }, 'test'); // no immediate parameter

      expect(success).toBe(true);
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      // Wait for batch timeout
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      observer(); // unsubscribe
    });
  });

  describe('Convenience Methods', () => {
    it('should use immediate updates for critical user interaction methods', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Test setSelectedDate (should be immediate)
      const testDate = new Date(2024, 0, 15);
      stateManager.setSelectedDate(testDate, 'test');

      // Should be called immediately, not batched
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      const [newState] = mockObserver.onStateChange.mock.calls[0];
      expect(newState.selectedDate).toEqual(testDate);

      observer(); // unsubscribe
    });

    it('should use immediate updates for setDropdownOpen', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Test setDropdownOpen (should be immediate)
      stateManager.setDropdownOpen(true, 'test');

      // Should be called immediately
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      const [newState] = mockObserver.onStateChange.mock.calls[0];
      expect(newState.dropdownState.isOpen).toBe(true);
      expect(newState.isOpen).toBe(true); // Also updates legacy field

      observer(); // unsubscribe
    });

    it('should use batched updates for non-critical methods', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Test setCurrentDate (should be batched)
      const testDate = new Date(2024, 0, 15);
      stateManager.setCurrentDate(testDate, 'test');

      // Should not be called immediately
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      // Wait for batch timeout
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      observer(); // unsubscribe
    });
  });

  describe('Observer Pattern', () => {
    it('should notify all subscribed observers', async () => {
      const observer2 = {
        onStateChange: vi.fn(),
        getUpdatePriority: vi.fn().mockReturnValue(1)
      };

      const unsub1 = stateManager.subscribe(mockObserver);
      const unsub2 = stateManager.subscribe(observer2);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true); // immediate

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);
      expect(observer2.onStateChange).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it('should respect observer priority ordering', async () => {
      const highPriorityObserver = {
        onStateChange: vi.fn(),
        getUpdatePriority: vi.fn().mockReturnValue(0) // Higher priority (lower number)
      };

      const lowPriorityObserver = {
        onStateChange: vi.fn(),
        getUpdatePriority: vi.fn().mockReturnValue(2) // Lower priority (higher number)
      };

      const unsub1 = stateManager.subscribe(highPriorityObserver);
      const unsub2 = stateManager.subscribe(lowPriorityObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true); // immediate

      // Both should be called
      expect(highPriorityObserver.onStateChange).toHaveBeenCalledTimes(1);
      expect(lowPriorityObserver.onStateChange).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it('should handle observer errors gracefully', async () => {
      const errorObserver = {
        onStateChange: vi.fn().mockImplementation(() => {
          throw new Error('Observer error');
        }),
        getUpdatePriority: vi.fn().mockReturnValue(1)
      };

      const normalObserver = {
        onStateChange: vi.fn(),
        getUpdatePriority: vi.fn().mockReturnValue(1)
      };

      const unsub1 = stateManager.subscribe(errorObserver);
      const unsub2 = stateManager.subscribe(normalObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true); // immediate

      // Normal observer should still be called despite error in first observer
      expect(errorObserver.onStateChange).toHaveBeenCalledTimes(1);
      expect(normalObserver.onStateChange).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });

    it('should allow unsubscribing from updates', async () => {
      const unsub = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true); // immediate

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsub();

      // This update should not notify the unsubscribed observer
      stateManager.updateState({ selectedDate: new Date(2024, 1, 20) }, 'test2', true);

      // Should still be 1 call (not 2)
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Validation', () => {
    it('should validate state before applying updates', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Try to set an invalid date (NaN)
      const invalidDate = new Date(NaN);
      const success = stateManager.updateState({ selectedDate: invalidDate }, 'test', true);

      expect(success).toBe(false);
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      observer(); // unsubscribe
    });

    it('should validate range constraints', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Set start date after end date (invalid range)
      const startDate = new Date(2024, 1, 15);
      const endDate = new Date(2024, 0, 15);
      const success = stateManager.updateState({
        selectedRange: { start: startDate, end: endDate }
      }, 'test', true);

      expect(success).toBe(false);
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      observer(); // unsubscribe
    });

    it('should allow valid state updates', async () => {
      const observer = stateManager.subscribe(mockObserver);

      const validDate = new Date(2024, 0, 15);
      const success = stateManager.updateState({ selectedDate: validDate }, 'test', true);

      expect(success).toBe(true);
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      observer(); // unsubscribe
    });
  });

  describe('Batching Behavior', () => {
    it('should batch multiple rapid updates', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // Multiple rapid updates
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test1', false);
      stateManager.updateState({ currentDate: new Date(2024, 1, 20) }, 'test2', false);
      stateManager.updateState({ viewMode: 'months' }, 'test3', false);

      // Should not have been called yet
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      // Wait for batch timeout
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should be called once with merged updates
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      const [newState] = mockObserver.onStateChange.mock.calls[0];
      expect(newState.selectedDate).toEqual(new Date(2024, 0, 15));
      expect(newState.currentDate).toEqual(new Date(2024, 1, 20));
      expect(newState.viewMode).toBe('months');

      observer(); // unsubscribe
    });

    it('should reset batch timeout on new batched updates', async () => {
      const observer = stateManager.subscribe(mockObserver);

      // First update
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test1', false);

      // Wait partial time
      await new Promise(resolve => setTimeout(resolve, 5));

      // Second update (should reset timeout)
      stateManager.updateState({ currentDate: new Date(2024, 1, 20) }, 'test2', false);

      // Wait another partial time
      await new Promise(resolve => setTimeout(resolve, 5));

      // Should still not have been called
      expect(mockObserver.onStateChange).not.toHaveBeenCalled();

      // Wait for full timeout from second update
      await new Promise(resolve => setTimeout(resolve, 12));

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      observer(); // unsubscribe
    });
  });

  describe('Change Tracking', () => {
    it('should provide access to changed properties after state update', () => {
      const observer = stateManager.subscribe(mockObserver);

      stateManager.updateState({ isOpen: true }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties).toBeInstanceOf(Set);
      expect(changedProperties.has('isOpen')).toBe(true);

      observer(); // unsubscribe
    });

    it('should track multiple changed properties', () => {
      const observer = stateManager.subscribe(mockObserver);

      stateManager.updateState({
        selectedDate: new Date(2024, 0, 15),
        isOpen: true,
        currentDate: new Date(2024, 1, 1)
      }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);
      expect(changedProperties.has('isOpen')).toBe(true);
      expect(changedProperties.has('currentDate')).toBe(true);

      observer(); // unsubscribe
    });

    it('should return empty set when no changes occurred', () => {
      // Initially, no changes
      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.size).toBe(0);
    });

    it('should update changed properties for each state update', () => {
      const observer = stateManager.subscribe(mockObserver);

      // First update
      stateManager.updateState({ isOpen: true }, 'test1', true);
      let changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('isOpen')).toBe(true);
      expect(changedProperties.has('selectedDate')).toBe(false);

      // Second update
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test2', true);
      changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('isOpen')).toBe(false); // Previous update
      expect(changedProperties.has('selectedDate')).toBe(true); // Current update

      observer(); // unsubscribe
    });

    it('should track nested properties in selectedRange', () => {
      const observer = stateManager.subscribe(mockObserver);

      // First, set an initial range
      const initialRange = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 20)
      };
      stateManager.updateState({ selectedRange: initialRange }, 'test', true);
      mockObserver.onStateChange.mockClear();

      // Then update the range (now both old and new are objects, so nested tracking applies)
      const updatedRange = {
        start: new Date(2024, 0, 16), // Changed
        end: new Date(2024, 0, 20) // Same
      };
      stateManager.updateState({ selectedRange: updatedRange }, 'test2', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedRange')).toBe(true);
      // Nested properties should be tracked when both old and new are objects
      expect(changedProperties.has('selectedRange.start')).toBe(true); // Changed
      expect(changedProperties.has('selectedRange.end')).toBe(false); // Not changed

      observer(); // unsubscribe
    });

    it('should maintain backward compatibility with existing observer pattern', () => {
      const observer = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true);

      // Existing behavior should still work
      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);
      const [newState, oldState] = mockObserver.onStateChange.mock.calls[0];
      expect(newState.selectedDate).toEqual(testDate);

      // New functionality should also work
      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);

      observer(); // unsubscribe
    });
  });
});
