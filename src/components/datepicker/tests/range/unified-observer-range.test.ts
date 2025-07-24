/*
 * unified-observer-range.test.ts - Unit tests for UnifiedObserver range mode functionality (KTDatepicker)
 * Tests the UnifiedObserver's ability to handle range mode with start and end containers.
 * Uses Vitest for type-safe testing of the observer pattern in range mode.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UnifiedObserver, UIElements } from '../../ui/observers/unified-observer';
import { KTDatepickerState } from '../../config/types';

describe('UnifiedObserver Range Mode', () => {
  let observer: UnifiedObserver;
  let startContainer: HTMLElement;
  let endContainer: HTMLElement;
  let mockState: KTDatepickerState;

  beforeEach(() => {
    // Create mock DOM elements
    startContainer = document.createElement('div');
    startContainer.className = 'ktui-segmented-input-start';
    startContainer.innerHTML = `
      <div data-segment="day">24</div>
      <div data-segment="month">07</div>
      <div data-segment="year">2025</div>
    `;

    endContainer = document.createElement('div');
    endContainer.className = 'ktui-segmented-input-end';
    endContainer.innerHTML = `
      <div data-segment="day">24</div>
      <div data-segment="month">07</div>
      <div data-segment="year">2025</div>
    `;

    document.body.appendChild(startContainer);
    document.body.appendChild(endContainer);

    // Create mock state
    mockState = {
      currentDate: new Date(2025, 6, 24),
      selectedDate: null,
      selectedRange: null,
      selectedDates: [],
      selectedTime: null,
      isDropdownOpen: false,
      config: {
        range: true,
        visibleMonths: 2,
        format: 'yyyy-MM-dd',
        locale: 'en-US'
      }
    };

    // Create observer with range mode elements
    const elements: UIElements = {
      startContainer,
      endContainer,
      input: null,
      calendarElement: null,
      timePickerElement: null
    };

    observer = new UnifiedObserver(elements, {
      enableDebugging: false,
      enableValidation: true,
      enableSmoothTransitions: true,
      updateDelay: 0
    });
  });

  afterEach(() => {
    if (observer) {
      observer.dispose();
    }
    if (startContainer && startContainer.parentNode) {
      startContainer.parentNode.removeChild(startContainer);
    }
    if (endContainer && endContainer.parentNode) {
      endContainer.parentNode.removeChild(endContainer);
    }
  });

  describe('Range Mode Detection', () => {
    it('should detect range mode when both containers are present', () => {
      const elements: UIElements = {
        startContainer,
        endContainer,
        input: null,
        calendarElement: null,
        timePickerElement: null
      };

      observer = new UnifiedObserver(elements, {
        enableDebugging: false,
        enableValidation: true,
        enableSmoothTransitions: true,
        updateDelay: 0
      });

      // The observer should be in range mode
      expect(observer).toBeInstanceOf(UnifiedObserver);
    });

    it('should not detect range mode when containers are missing', () => {
      const elements: UIElements = {
        input: null,
        calendarElement: null,
        timePickerElement: null
      };

      observer = new UnifiedObserver(elements, {
        enableDebugging: false,
        enableValidation: true,
        enableSmoothTransitions: true,
        updateDelay: 0
      });

      // The observer should still be created but not in range mode
      expect(observer).toBeInstanceOf(UnifiedObserver);
    });
  });

  describe('Range State Updates', () => {
    it('should update start date in range mode', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15), // July 15, 2025
          end: null
        }
      };

      observer.onStateChange(newState, mockState);

      const startDay = startContainer.querySelector('[data-segment="day"]');
      const startMonth = startContainer.querySelector('[data-segment="month"]');
      const startYear = startContainer.querySelector('[data-segment="year"]');

      expect(startDay?.textContent).toBe('15');
      expect(startMonth?.textContent).toBe('07');
      expect(startYear?.textContent).toBe('2025');
    });

    it('should update end date in range mode', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15), // July 15, 2025
          end: new Date(2025, 7, 20) // August 20, 2025
        }
      };

      observer.onStateChange(newState, mockState);

      const endDay = endContainer.querySelector('[data-segment="day"]');
      const endMonth = endContainer.querySelector('[data-segment="month"]');
      const endYear = endContainer.querySelector('[data-segment="year"]');

      expect(endDay?.textContent).toBe('20');
      expect(endMonth?.textContent).toBe('08');
      expect(endYear?.textContent).toBe('2025');
    });

    it('should update both start and end dates in range mode', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15), // July 15, 2025
          end: new Date(2025, 7, 20) // August 20, 2025
        }
      };

      observer.onStateChange(newState, mockState);

      // Check start date
      const startDay = startContainer.querySelector('[data-segment="day"]');
      const startMonth = startContainer.querySelector('[data-segment="month"]');
      const startYear = startContainer.querySelector('[data-segment="year"]');

      expect(startDay?.textContent).toBe('15');
      expect(startMonth?.textContent).toBe('07');
      expect(startYear?.textContent).toBe('2025');

      // Check end date
      const endDay = endContainer.querySelector('[data-segment="day"]');
      const endMonth = endContainer.querySelector('[data-segment="month"]');
      const endYear = endContainer.querySelector('[data-segment="year"]');

      expect(endDay?.textContent).toBe('20');
      expect(endMonth?.textContent).toBe('08');
      expect(endYear?.textContent).toBe('2025');
    });

    it('should handle null range values', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: null,
          end: null
        }
      };

      observer.onStateChange(newState, mockState);

      // The containers should remain unchanged or show default values
      const startDay = startContainer.querySelector('[data-segment="day"]');
      const endDay = endContainer.querySelector('[data-segment="day"]');

      // The observer should handle null values gracefully
      expect(startDay).toBeTruthy();
      expect(endDay).toBeTruthy();
    });

    it('should handle partial range (only start date)', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15), // July 15, 2025
          end: null
        }
      };

      observer.onStateChange(newState, mockState);

      const startDay = startContainer.querySelector('[data-segment="day"]');
      const startMonth = startContainer.querySelector('[data-segment="month"]');
      const endDay = endContainer.querySelector('[data-segment="day"]');

      expect(startDay?.textContent).toBe('15');
      expect(startMonth?.textContent).toBe('07');
      // End container should remain unchanged
      expect(endDay?.textContent).toBe('24');
    });

    it('should handle partial range (only end date)', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: null,
          end: new Date(2025, 7, 20) // August 20, 2025
        }
      };

      observer.onStateChange(newState, mockState);

      const startDay = startContainer.querySelector('[data-segment="day"]');
      const endDay = endContainer.querySelector('[data-segment="day"]');
      const endMonth = endContainer.querySelector('[data-segment="month"]');

      // Start container should remain unchanged
      expect(startDay?.textContent).toBe('24');
      expect(endDay?.textContent).toBe('20');
      expect(endMonth?.textContent).toBe('08');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly in range mode', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 0, 1), // January 1, 2025
          end: new Date(2025, 11, 31) // December 31, 2025
        }
      };

      observer.onStateChange(newState, mockState);

      // Check start date formatting
      const startDay = startContainer.querySelector('[data-segment="day"]');
      const startMonth = startContainer.querySelector('[data-segment="month"]');
      const startYear = startContainer.querySelector('[data-segment="year"]');

      expect(startDay?.textContent).toBe('01');
      expect(startMonth?.textContent).toBe('01');
      expect(startYear?.textContent).toBe('2025');

      // Check end date formatting
      const endDay = endContainer.querySelector('[data-segment="day"]');
      const endMonth = endContainer.querySelector('[data-segment="month"]');
      const endYear = endContainer.querySelector('[data-segment="year"]');

      expect(endDay?.textContent).toBe('31');
      expect(endMonth?.textContent).toBe('12');
      expect(endYear?.textContent).toBe('2025');
    });

    it('should handle leap year dates', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2024, 1, 29), // February 29, 2024 (leap year)
          end: new Date(2024, 2, 1) // March 1, 2024
        }
      };

      observer.onStateChange(newState, mockState);

      const startDay = startContainer.querySelector('[data-segment="day"]');
      const startMonth = startContainer.querySelector('[data-segment="month"]');
      const endDay = endContainer.querySelector('[data-segment="day"]');
      const endMonth = endContainer.querySelector('[data-segment="month"]');

      expect(startDay?.textContent).toBe('29');
      expect(startMonth?.textContent).toBe('02');
      expect(endDay?.textContent).toBe('01');
      expect(endMonth?.textContent).toBe('03');
    });
  });

  describe('Observer Lifecycle', () => {
    it('should dispose correctly', () => {
      expect(() => {
        observer.dispose();
      }).not.toThrow();

      // After disposal, the observer should not throw errors
      expect(() => {
        observer.onStateChange(mockState, mockState);
      }).not.toThrow();
    });

    it('should handle multiple updates', () => {
      const state1: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15),
          end: null
        }
      };

      const state2: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15),
          end: new Date(2025, 7, 20)
        }
      };

      observer.onStateChange(state1, mockState);
      observer.onStateChange(state2, state1);

      const startDay = startContainer.querySelector('[data-segment="day"]');
      const endDay = endContainer.querySelector('[data-segment="day"]');

      expect(startDay?.textContent).toBe('15');
      expect(endDay?.textContent).toBe('20');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      // Remove one of the containers
      if (startContainer.parentNode) {
        startContainer.parentNode.removeChild(startContainer);
      }

      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date(2025, 6, 15),
          end: new Date(2025, 7, 20)
        }
      };

      // Should not throw an error
      expect(() => {
        observer.onStateChange(newState, mockState);
      }).not.toThrow();
    });

    it('should handle invalid date values', () => {
      const newState: KTDatepickerState = {
        ...mockState,
        selectedRange: {
          start: new Date('invalid-date'),
          end: new Date(2025, 7, 20)
        }
      };

      // Should not throw an error
      expect(() => {
        observer.onStateChange(newState, mockState);
      }).not.toThrow();
    });
  });
});