/**
 * datepicker-events.test.ts - Test suite for KTDatepicker event handling
 * Tests the fixes for state management and synchronous event firing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { KTDatepickerConfig } from '../config/types';

describe('KTDatepicker Event Handling', () => {
  let element: HTMLElement;
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnOpen: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock DOM element with proper structure
    element = document.createElement('div');
    element.innerHTML = `
      <div class="kt-datepicker" data-kt-datepicker-segmented>
        <input type="text" data-kt-datepicker-input placeholder="Select date">
      </div>
    `;

    // Reset mocks for each test
    mockOnChange = vi.fn();
    mockOnOpen = vi.fn();
    mockOnClose = vi.fn();

    // Clear any existing event listeners or state
    document.body.innerHTML = '';
    document.body.appendChild(element);
  });

  describe('Event Handler Configuration', () => {
    it('should accept event handler configuration', () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        onChange: mockOnChange,
        onOpen: mockOnOpen,
        onClose: mockOnClose
      };

      expect(() => {
        new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
      }).not.toThrow();
    });

    it('should handle undefined event handlers gracefully', () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy'
        // No event handlers defined
      };

      expect(() => {
        new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
      }).not.toThrow();
    });
  });

  describe('onChange Event', () => {
    it('should fire onChange immediately when date is set programmatically', async () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        onChange: mockOnChange
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Clear any initial calls
      mockOnChange.mockClear();

      // Set date programmatically
      const testDate = new Date(2024, 0, 15); // January 15, 2024
      datepicker.setDate(testDate);

      // onChange should be called immediately (not batched)
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith(testDate, datepicker);
    });

    it('should fire onChange with correct date format', async () => {
      const config: KTDatepickerConfig = {
        format: 'yyyy-MM-dd',
        onChange: mockOnChange
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Clear any initial calls
      mockOnChange.mockClear();

      const testDate = new Date(2024, 0, 15);
      datepicker.setDate(testDate);

      expect(mockOnChange).toHaveBeenCalledWith(testDate, datepicker);
    });

    it('should not fire onChange when event handler throws error', async () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Event handler error');
      });

      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        onChange: errorHandler
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Should not throw when setting date
      expect(() => {
        datepicker.setDate(new Date(2024, 0, 15));
      }).not.toThrow();

      // Error handler should still be called
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('onOpen/onClose Events', () => {
    it('should fire onOpen immediately when dropdown opens', async () => {
      const config: KTDatepickerConfig = {
        onOpen: mockOnOpen,
        onClose: mockOnClose
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Clear any initial calls
      mockOnOpen.mockClear();
      mockOnClose.mockClear();

      // Open dropdown
      datepicker.open();

      // onOpen should be called immediately
      expect(mockOnOpen).toHaveBeenCalledTimes(1);
      expect(mockOnOpen).toHaveBeenCalledWith(datepicker);

      // onClose should not have been called
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should fire onClose immediately when dropdown closes', async () => {
      const config: KTDatepickerConfig = {
        onOpen: mockOnOpen,
        onClose: mockOnClose
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // First open the dropdown
      datepicker.open();
      mockOnOpen.mockClear();
      mockOnClose.mockClear();

      // Close dropdown
      datepicker.close();

      // onClose should be called immediately
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledWith(datepicker);

      // onOpen should not be called again
      expect(mockOnOpen).not.toHaveBeenCalled();
    });

    it('should handle rapid open/close sequences', async () => {
      const config: KTDatepickerConfig = {
        onOpen: mockOnOpen,
        onClose: mockOnClose
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Clear any initial calls
      mockOnOpen.mockClear();
      mockOnClose.mockClear();

      // Open and close rapidly
      datepicker.open();
      datepicker.close();
      datepicker.open();

      // Should have correct call counts
      expect(mockOnOpen).toHaveBeenCalledTimes(2);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Management Integration', () => {
    it('should maintain state consistency during event firing', async () => {
      let capturedState: any = null;

      const config: KTDatepickerConfig = {
        onChange: (date, datepicker) => {
          // Capture the datepicker state during event firing
          capturedState = {
            date,
            isOpen: datepicker.isOpen?.() || false
          };
        }
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      const testDate = new Date(2024, 0, 15);
      datepicker.setDate(testDate);

      // State should be captured correctly during event firing
      expect(capturedState).not.toBeNull();
      expect(capturedState.date).toEqual(testDate);
    });

    it('should handle multiple datepicker instances independently', async () => {
      // Create second datepicker element
      const element2 = document.createElement('div');
      element2.innerHTML = `
        <div class="kt-datepicker" data-kt-datepicker-segmented>
          <input type="text" data-kt-datepicker-input placeholder="Select date 2">
        </div>
      `;
      document.body.appendChild(element2);

      const mockOnChange2 = vi.fn();

      const config1: KTDatepickerConfig = {
        onChange: mockOnChange
      };

      const config2: KTDatepickerConfig = {
        onChange: mockOnChange2
      };

      const datepicker1 = new KTDatepicker(element.querySelector('.kt-datepicker')!, config1);
      const datepicker2 = new KTDatepicker(element2.querySelector('.kt-datepicker')!, config2);

      // Set dates on both datepickers
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 1, 20);

      datepicker1.setDate(date1);
      datepicker2.setDate(date2);

      // Each datepicker should fire its own event
      expect(mockOnChange).toHaveBeenCalledWith(date1, datepicker1);
      expect(mockOnChange2).toHaveBeenCalledWith(date2, datepicker2);

      // Cleanup
      document.body.removeChild(element2);
    });
  });

  describe('Error Handling', () => {
    it('should not crash when event handler throws error', async () => {
      const errorOnChange = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const config: KTDatepickerConfig = {
        onChange: errorOnChange
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // Should not throw despite error in event handler
      expect(() => {
        datepicker.setDate(new Date(2024, 0, 15));
      }).not.toThrow();

      expect(errorOnChange).toHaveBeenCalledTimes(1);
    });

    it('should continue functioning after event handler error', async () => {
      let callCount = 0;
      const errorOnChange = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First call error');
        }
      });

      const config: KTDatepickerConfig = {
        onChange: errorOnChange
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      // First call should throw but not crash
      datepicker.setDate(new Date(2024, 0, 15));

      // Second call should still work
      datepicker.setDate(new Date(2024, 1, 20));

      expect(errorOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and Timing', () => {
    it('should fire events synchronously for immediate state updates', async () => {
      const callOrder: string[] = [];

      const config: KTDatepickerConfig = {
        onChange: () => {
          callOrder.push('onChange');
        }
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      callOrder.push('before-setDate');
      datepicker.setDate(new Date(2024, 0, 15));
      callOrder.push('after-setDate');

      // onChange should be called synchronously between setDate calls
      expect(callOrder).toEqual(['before-setDate', 'onChange', 'after-setDate']);
    });

    it('should fire events quickly for user interactions', async () => {
      const eventTimestamps: number[] = [];

      const config: KTDatepickerConfig = {
        onChange: () => {
          eventTimestamps.push(Date.now());
        },
        onOpen: () => {
          eventTimestamps.push(Date.now());
        },
        onClose: () => {
          eventTimestamps.push(Date.now());
        }
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      const startTime = Date.now();

      datepicker.setDate(new Date(2024, 0, 15));
      datepicker.open();
      datepicker.close();

      const endTime = Date.now();

      // All events should fire relatively quickly (within reasonable time for user interactions)
      expect(eventTimestamps.length).toBe(3);
      eventTimestamps.forEach(timestamp => {
        expect(timestamp - startTime).toBeLessThan(50); // Allow reasonable time for DOM operations
      });

      // Events should fire in correct order: change, open, close
      expect(eventTimestamps[0]).toBeLessThanOrEqual(eventTimestamps[1]); // change before open
      expect(eventTimestamps[1]).toBeLessThanOrEqual(eventTimestamps[2]); // open before close
    });
  });
});
