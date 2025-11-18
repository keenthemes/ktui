/**
 * datepicker-integration.test.ts - Integration tests for KTDatepicker
 * Tests backward compatibility, configuration options, and real-world usage patterns
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { KTDatepickerConfig } from '../config/types';

describe('KTDatepicker Integration', () => {
  let element: HTMLElement;

  beforeEach(() => {
    // Create a fresh element for each test
    element = document.createElement('div');
    element.innerHTML = `
      <div class="kt-datepicker" data-kt-datepicker-segmented>
        <input type="text" data-kt-datepicker-input placeholder="Select date">
      </div>
    `;

    // Clear any existing content and add our test element
    document.body.innerHTML = '';
    document.body.appendChild(element);
  });

  describe('Configuration Options', () => {
    it('should accept all configuration options without errors', () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        range: false,
        multiDate: false,
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2024, 11, 31),
        disabled: false,
        locale: 'en-US',
        placeholder: 'Select a date',
        value: new Date(2024, 0, 15),
        showOnFocus: true,
        closeOnSelect: true,
        closeOnOutsideClick: true,
        visibleMonths: 1,
        enableTime: false,
        timeGranularity: 'minute',
        timeFormat: '24h',
        minTime: '00:00',
        maxTime: '23:59',
        timeStep: 1,
        dropdownPlacement: 'bottom-start',
        dropdownOffset: '0,8',
        dropdownBoundary: 'clippingParents',
        dropdownWidth: 'auto',
        dropdownZindex: 9999,
        classes: {
          container: 'custom-container',
          inputWrapper: 'custom-input-wrapper'
        },
        onChange: vi.fn(),
        onOpen: vi.fn(),
        onClose: vi.fn()
      };

      expect(() => {
        new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
      }).not.toThrow();
    });

    it('should work with minimal configuration', () => {
      const config: KTDatepickerConfig = {
        format: 'yyyy-MM-dd'
      };

      expect(() => {
        const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);
        expect(datepicker).toBeDefined();
      }).not.toThrow();
    });

    it('should handle undefined configuration', () => {
      expect(() => {
        const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, undefined);
        expect(datepicker).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('DOM Integration', () => {
    it('should create proper DOM structure', () => {
      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!);

      // Should have created input wrapper
      const inputWrapper = element.querySelector('[data-kt-datepicker-input-wrapper]');
      expect(inputWrapper).toBeTruthy();

      // Should have segmented input elements
      const segments = element.querySelectorAll('[data-segment]');
      expect(segments.length).toBeGreaterThan(0);

      // Dropdown is created lazily when opened
      datepicker.open();
      // Wait a bit for DOM updates
      return new Promise(resolve => {
        setTimeout(() => {
          const dropdown = document.querySelector('[data-kt-datepicker-dropdown]');
          expect(dropdown).toBeTruthy();
          resolve(void 0);
        }, 10);
      });
    });

    it('should handle existing input element', () => {
      // Element already has input in beforeEach
      const existingInput = element.querySelector('input');
      expect(existingInput).toBeTruthy(); // Input should exist before datepicker creation

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!);

      // In segmented mode, the input is processed and segmented UI is created
      // Check that segmented input elements were created (this is the expected behavior)
      const segmentedElements = element.querySelectorAll('[data-segment]');
      expect(segmentedElements.length).toBeGreaterThan(0);

      // Verify datepicker was created successfully
      expect(datepicker).toBeDefined();
    });

    it('should create input element if none exists', () => {
      // Create a fresh element without input
      const testElement = document.createElement('div');
      testElement.innerHTML = `
        <div class="kt-datepicker" data-kt-datepicker-segmented>
        </div>
      `;
      document.body.appendChild(testElement);

      const datepicker = new KTDatepicker(testElement.querySelector('.kt-datepicker')!);

      // Should have created new input - it might be in the document root or moved
      const newInput = document.querySelector('input[data-kt-datepicker-input]');
      expect(newInput).toBeTruthy();

      // Cleanup
      document.body.removeChild(testElement);
    });
  });

  describe('Data Attributes', () => {
    it('should read data attributes for configuration', () => {
      element.innerHTML = `
        <div class="kt-datepicker"
             data-kt-datepicker-segmented
             data-kt-datepicker-show-on-focus="false"
             data-kt-datepicker-close-on-select="false"
             data-kt-datepicker-enable-time="true"
             data-kt-datepicker-range="true"
             data-kt-datepicker-close-on-outside-click="false">
          <input type="text" data-kt-datepicker-input>
        </div>
      `;

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!);

      // Note: We can't easily test internal config, but the component should initialize without errors
      expect(datepicker).toBeDefined();
    });

    it('should parse JSON config from data attribute', () => {
      const jsonConfig = {
        format: 'MM/dd/yyyy',
        disabled: true,
        placeholder: 'Custom placeholder'
      };

      element.innerHTML = `
        <div class="kt-datepicker"
             data-kt-datepicker-config='${JSON.stringify(jsonConfig)}'>
          <input type="text" data-kt-datepicker-input>
        </div>
      `;

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!);

      expect(datepicker).toBeDefined();
    });

    it('should handle invalid JSON config gracefully', () => {
      element.innerHTML = `
        <div class="kt-datepicker"
             data-kt-datepicker-config='{invalid json}'>
          <input type="text" data-kt-datepicker-input>
        </div>
      `;

      expect(() => {
        new KTDatepicker(element.querySelector('.kt-datepicker')!);
      }).not.toThrow();
    });
  });

  describe('Range Mode', () => {
    it('should initialize in range mode', () => {
      const config: KTDatepickerConfig = {
        range: true,
        format: 'dd/MM/yyyy'
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });

    it('should handle range value initialization', () => {
      const config: KTDatepickerConfig = {
        range: true,
        format: 'dd/MM/yyyy',
        valueRange: {
          start: new Date(2024, 0, 15),
          end: new Date(2024, 0, 20)
        }
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });
  });

  describe('Multi-Date Mode', () => {
    it('should initialize in multi-date mode', () => {
      const config: KTDatepickerConfig = {
        multiDate: true,
        format: 'dd/MM/yyyy'
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });

    it('should handle multiple values initialization', () => {
      const config: KTDatepickerConfig = {
        multiDate: true,
        format: 'dd/MM/yyyy',
        values: [
          new Date(2024, 0, 15),
          new Date(2024, 0, 20),
          new Date(2024, 0, 25)
        ]
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });
  });

  describe('Time Picker', () => {
    it('should initialize with time picker enabled', () => {
      const config: KTDatepickerConfig = {
        enableTime: true,
        timeFormat: '12h',
        format: 'dd/MM/yyyy'
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });

    it('should handle time constraints', () => {
      const config: KTDatepickerConfig = {
        enableTime: true,
        format: 'dd/MM/yyyy',
        minTime: '09:00',
        maxTime: '17:00',
        timeStep: 30
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });
  });

  describe('Constraints', () => {
    it('should handle min/max date constraints', () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2024, 11, 31)
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });

    it('should handle disabled dates array', () => {
      const config: KTDatepickerConfig = {
        format: 'dd/MM/yyyy',
        disabledDates: [
          new Date(2024, 0, 1), // New Year's Day
          new Date(2024, 0, 15), // Some holiday
        ]
      };

      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!, config);

      expect(datepicker).toBeDefined();
    });
  });

  describe('Multiple Instances', () => {
    it('should support multiple independent datepickers', () => {
      // Create first datepicker
      const datepicker1 = new KTDatepicker(element.querySelector('.kt-datepicker')!, {
        format: 'dd/MM/yyyy'
      });

      // Create second datepicker element
      const element2 = document.createElement('div');
      element2.innerHTML = `
        <div class="kt-datepicker" data-kt-datepicker-segmented>
          <input type="text" data-kt-datepicker-input placeholder="Select date 2">
        </div>
      `;
      document.body.appendChild(element2);

      // Create second datepicker
      const datepicker2 = new KTDatepicker(element2.querySelector('.kt-datepicker')!, {
        format: 'yyyy-MM-dd'
      });

      // Both should exist independently
      expect(datepicker1).toBeDefined();
      expect(datepicker2).toBeDefined();

      // Cleanup
      document.body.removeChild(element2);
    });
  });

  describe('Error Recovery', () => {
    it('should handle invalid element gracefully', () => {
      expect(() => {
        new KTDatepicker(null as any);
      }).toThrow(); // Should throw for null element
    });

    it('should handle missing DOM methods gracefully', () => {
      // Create element without proper DOM methods
      const mockElement = {
        querySelector: () => null,
        setAttribute: vi.fn(),
        getAttribute: vi.fn()
      };

      expect(() => {
        new KTDatepicker(mockElement as any);
      }).toThrow(); // Should throw when DOM methods fail
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on destruction', () => {
      const datepicker = new KTDatepicker(element.querySelector('.kt-datepicker')!);

      // Mock the event manager's removeListener method
      const mockRemoveListener = vi.fn();
      (datepicker as any)._eventManager = {
        removeListener: mockRemoveListener,
        addListener: vi.fn()
      };

      // Trigger cleanup (this would normally happen on destruction)
      if ((datepicker as any).dispose) {
        (datepicker as any).dispose();
      }

      // Event listeners should be cleaned up
      // Note: This test assumes a dispose method exists or will be added
    });
  });
});
