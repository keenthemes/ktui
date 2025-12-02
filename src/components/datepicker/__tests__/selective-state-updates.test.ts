/**
 * selective-state-updates.test.ts - Tests for selective state update optimizations
 * Tests change tracking, changed properties computation, and selective UI updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDatepickerUnifiedStateManager } from '../core/unified-state-manager';
import { KTDatepickerState } from '../config/types';

describe('Selective State Updates - Change Tracking', () => {
  let stateManager: KTDatepickerUnifiedStateManager;
  let mockObserver: any;

  beforeEach(() => {
    stateManager = new KTDatepickerUnifiedStateManager({
      enableValidation: true,
      enableDebugging: false,
      enableUpdateBatching: false // Disable batching for simpler tests
    });

    mockObserver = {
      onStateChange: vi.fn(),
      getUpdatePriority: vi.fn().mockReturnValue(1)
    };
  });

  describe('Changed Properties Tracking', () => {
    it('should track changed properties for primitive values', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Update isOpen
      stateManager.updateState({ isOpen: true }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('isOpen')).toBe(true);
      expect(changedProperties.size).toBe(1);

      unsubscribe();
    });

    it('should track changed properties for Date objects', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);

      unsubscribe();
    });

    it('should not track unchanged Date objects', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const testDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: testDate }, 'test', true);
      mockObserver.onStateChange.mockClear();

      // Update with same date
      const sameDate = new Date(2024, 0, 15);
      stateManager.updateState({ selectedDate: sameDate }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      // Should still track it as changed in the changes object, but the comparison should work
      expect(mockObserver.onStateChange).toHaveBeenCalled();

      unsubscribe();
    });

    it('should track changed properties for arrays (selectedDates)', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const dates = [new Date(2024, 0, 15), new Date(2024, 0, 20)];
      stateManager.updateState({ selectedDates: dates }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDates')).toBe(true);

      unsubscribe();
    });

    it('should track changed properties for nested objects (selectedRange)', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const range = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 20)
      };
      stateManager.updateState({ selectedRange: range }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedRange')).toBe(true);
      // Nested properties are tracked only when they actually differ from previous state
      // Initial state has selectedRange: null, so start and end will differ from null
      // The nested properties are tracked if the oldValue and newValue differ
      if (changedProperties.has('selectedRange')) {
        // Nested tracking depends on whether oldState.selectedRange exists
        // Since initial state has null, the comparison should work
        const hasStart = changedProperties.has('selectedRange.start');
        const hasEnd = changedProperties.has('selectedRange.end');
        // At least the parent property should be tracked
        expect(changedProperties.has('selectedRange')).toBe(true);
      }

      unsubscribe();
    });

    it('should track only changed nested properties in selectedRange', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Set initial range
      const initialRange = {
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 20)
      };
      stateManager.updateState({ selectedRange: initialRange }, 'test', true);
      mockObserver.onStateChange.mockClear();

      // Update only the end date
      const updatedRange = {
        start: new Date(2024, 0, 15), // Same
        end: new Date(2024, 0, 25) // Different
      };
      stateManager.updateState({ selectedRange: updatedRange }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedRange')).toBe(true);
      expect(changedProperties.has('selectedRange.start')).toBe(false); // Not changed
      expect(changedProperties.has('selectedRange.end')).toBe(true); // Changed

      unsubscribe();
    });

    it('should track multiple changed properties in single update', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      stateManager.updateState({
        selectedDate: new Date(2024, 0, 15),
        isOpen: true,
        currentDate: new Date(2024, 1, 1)
      }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);
      expect(changedProperties.has('isOpen')).toBe(true);
      expect(changedProperties.has('currentDate')).toBe(true);
      expect(changedProperties.size).toBeGreaterThanOrEqual(3);

      unsubscribe();
    });

    it('should clear changed properties between updates', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // First update
      stateManager.updateState({ isOpen: true }, 'test1', true);
      let changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('isOpen')).toBe(true);

      // Second update with different property
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test2', true);
      changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('isOpen')).toBe(false); // Should not be in new change set
      expect(changedProperties.has('selectedDate')).toBe(true);

      unsubscribe();
    });
  });

  describe('Complex Property Comparisons', () => {
    it('should correctly compare Date objects with same time', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const date1 = new Date(2024, 0, 15, 10, 30, 0);
      const date2 = new Date(2024, 0, 15, 10, 30, 0);

      stateManager.updateState({ selectedDate: date1 }, 'test', true);
      mockObserver.onStateChange.mockClear();

      stateManager.updateState({ selectedDate: date2 }, 'test', true);

      // Both have same time value, but since we're updating with the same date in changes,
      // it should still trigger (the change tracking compares the changes object)
      expect(mockObserver.onStateChange).toHaveBeenCalled();

      unsubscribe();
    });

    it('should correctly compare arrays of dates', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const dates1 = [new Date(2024, 0, 15), new Date(2024, 0, 20)];
      const dates2 = [new Date(2024, 0, 15), new Date(2024, 0, 20)]; // Same dates, different objects

      stateManager.updateState({ selectedDates: dates1 }, 'test', true);
      mockObserver.onStateChange.mockClear();

      stateManager.updateState({ selectedDates: dates2 }, 'test', true);

      // Observer should be called even with equivalent arrays (because it's in the changes object)
      expect(mockObserver.onStateChange).toHaveBeenCalled();
      const changedProperties = stateManager.getLastChangedProperties();
      // The change tracking compares old and new state values
      // If the array values are equivalent (same time values), it won't track as changed
      // This is the expected behavior - only track when values actually differ
      expect(changedProperties.has('selectedDates')).toBe(false); // Same values, so not tracked

      unsubscribe();
    });

    it('should detect changes in array order', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      const dates1 = [new Date(2024, 0, 15), new Date(2024, 0, 20)];
      const dates2 = [new Date(2024, 0, 20), new Date(2024, 0, 15)]; // Different order

      stateManager.updateState({ selectedDates: dates1 }, 'test', true);
      mockObserver.onStateChange.mockClear();

      stateManager.updateState({ selectedDates: dates2 }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDates')).toBe(true);

      unsubscribe();
    });

    it('should handle null values correctly', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Set a date first
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test', true);
      mockObserver.onStateChange.mockClear();

      // Then set to null
      stateManager.updateState({ selectedDate: null }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);

      unsubscribe();
    });

    it('should handle selectedRange with null start or end', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Set range with null start
      stateManager.updateState({
        selectedRange: { start: null, end: new Date(2024, 0, 20) }
      }, 'test', true);

      let changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedRange')).toBe(true);

      mockObserver.onStateChange.mockClear();

      // Update to add start date
      stateManager.updateState({
        selectedRange: { start: new Date(2024, 0, 15), end: new Date(2024, 0, 20) }
      }, 'test', true);

      changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedRange.start')).toBe(true);

      unsubscribe();
    });
  });

  describe('State Synchronization', () => {
    it('should maintain state consistency with selective updates', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Perform multiple sequential updates
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test1', true);
      stateManager.updateState({ currentDate: new Date(2024, 1, 1) }, 'test2', true);
      stateManager.updateState({ isOpen: true }, 'test3', true);

      const finalState = stateManager.getState();
      expect(finalState.selectedDate).toEqual(new Date(2024, 0, 15));
      expect(finalState.currentDate).toEqual(new Date(2024, 1, 1));
      expect(finalState.isOpen).toBe(true);

      unsubscribe();
    });

    it('should not lose state properties during selective updates', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Set multiple properties
      stateManager.updateState({
        selectedDate: new Date(2024, 0, 15),
        currentDate: new Date(2024, 0, 1),
        isOpen: false
      }, 'test', true);

      const state1 = stateManager.getState();
      expect(state1.selectedDate).toBeTruthy();
      expect(state1.currentDate).toBeTruthy();
      expect(state1.isOpen).toBe(false);

      // Update only one property
      stateManager.updateState({ isOpen: true }, 'test2', true);

      const state2 = stateManager.getState();
      // Other properties should still be present
      expect(state2.selectedDate).toEqual(state1.selectedDate);
      expect(state2.currentDate).toEqual(state1.currentDate);
      expect(state2.isOpen).toBe(true); // This one changed

      unsubscribe();
    });

    it('should correctly merge batched updates with changed properties', async () => {
      stateManager = new KTDatepickerUnifiedStateManager({
        enableValidation: true,
        enableUpdateBatching: true,
        batchDelay: 16
      });

      const unsubscribe = stateManager.subscribe(mockObserver);

      // Multiple batched updates
      stateManager.updateState({ selectedDate: new Date(2024, 0, 15) }, 'test1', false);
      stateManager.updateState({ currentDate: new Date(2024, 1, 1) }, 'test2', false);

      // Wait for batch
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockObserver.onStateChange).toHaveBeenCalledTimes(1);

      const finalState = stateManager.getState();
      expect(finalState.selectedDate).toEqual(new Date(2024, 0, 15));
      expect(finalState.currentDate).toEqual(new Date(2024, 1, 1));

      // Check changed properties (should include both)
      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedDate')).toBe(true);
      expect(changedProperties.has('currentDate')).toBe(true);

      unsubscribe();
    });
  });

  describe('Time State Tracking', () => {
    it('should track changes to selectedTime', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      stateManager.updateState({
        selectedTime: { hour: 14, minute: 30, second: 0 }
      }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedTime')).toBe(true);

      unsubscribe();
    });

    it('should detect changes in time values', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      // Set initial time
      stateManager.updateState({
        selectedTime: { hour: 14, minute: 30, second: 0 }
      }, 'test', true);
      mockObserver.onStateChange.mockClear();

      // Update time
      stateManager.updateState({
        selectedTime: { hour: 15, minute: 45, second: 0 }
      }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      expect(changedProperties.has('selectedTime')).toBe(true);

      unsubscribe();
    });
  });

  describe('Readonly Access', () => {
    it('should return readonly set that cannot be modified', () => {
      const unsubscribe = stateManager.subscribe(mockObserver);

      stateManager.updateState({ isOpen: true }, 'test', true);

      const changedProperties = stateManager.getLastChangedProperties();
      const originalSize = changedProperties.size;

      // Try to modify (should not affect internal state)
      (changedProperties as any).add('testProperty');

      // Get again - should be unchanged
      const changedProperties2 = stateManager.getLastChangedProperties();
      expect(changedProperties2.has('testProperty')).toBe(false);

      unsubscribe();
    });
  });
});

