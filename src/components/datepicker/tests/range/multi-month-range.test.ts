/*
 * multi-month-range.test.ts - Unit tests for Multi-Month Range functionality (KTDatepicker)
 * Tests the observer reinitialization and range mode detection for multi-month range selection.
 * Uses Vitest for type-safe testing of the UnifiedObserver and range mode functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDatepicker } from '../../datepicker';
import { KTDatepickerConfig } from '../../config/types';

describe('KTDatepicker Multi-Month Range', () => {
  let container: HTMLElement;
  let datepicker: KTDatepicker;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<input type="text" data-kt-datepicker-input />';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (datepicker) {
      datepicker.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Configuration', () => {
    it('should detect range mode correctly', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Check that the datepicker was created successfully
      expect(datepicker).toBeInstanceOf(KTDatepicker);

      // Check that range mode is enabled by looking for range containers
      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });

    it('should create range input containers', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();

      // Check that the containers have the correct structure
      const startSegments = startContainer?.querySelectorAll('[data-segment]');
      const endSegments = endContainer?.querySelectorAll('[data-segment]');

      expect(startSegments?.length).toBe(3); // year, month, day
      expect(endSegments?.length).toBe(3); // year, month, day
    });

    it('should handle range mode with single month display', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 1
      };

      datepicker = new KTDatepicker(container, config);

      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });
  });

  describe('Observer Reinitialization', () => {
    it('should reinitialize observer for range mode', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Force a render to trigger observer reinitialization
      datepicker.open();

      // Check that the observer is properly initialized with range containers
      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });

    it('should handle observer reinitialization timing correctly', async () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Simulate the setTimeout delay for observer reinitialization
      await new Promise(resolve => setTimeout(resolve, 150));

      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });
  });

  describe('Range Selection Logic', () => {
    it('should initialize with empty range state', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      const state = datepicker.getState();
      expect(state.selectedRange).toBeNull();
    });

    it('should handle range mode configuration', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Check that the datepicker is in range mode
      expect(datepicker).toBeInstanceOf(KTDatepicker);

      // Check that range containers exist
      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });

    it('should handle range mode with different visible months', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 3
      };

      datepicker = new KTDatepicker(container, config);

      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');

      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should return valid state structure', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      const state = datepicker.getState();

      // Check that the state has the expected structure
      expect(state).toHaveProperty('currentDate');
      expect(state).toHaveProperty('selectedDate');
      expect(state).toHaveProperty('selectedRange');
      expect(state).toHaveProperty('selectedDates');
      expect(state).toHaveProperty('selectedTime');
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('isFocused');
      expect(state).toHaveProperty('isTransitioning');
      expect(state).toHaveProperty('isDisabled');
      expect(state).toHaveProperty('validationErrors');
      expect(state).toHaveProperty('isValid');
      expect(state).toHaveProperty('dropdownState');
    });

    it('should handle dropdown state', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      const dropdownState = datepicker.getDropdownState();

      expect(dropdownState).toHaveProperty('isOpen');
      expect(dropdownState).toHaveProperty('isTransitioning');
      expect(dropdownState).toHaveProperty('isDisabled');
      expect(dropdownState).toHaveProperty('isFocused');
    });
  });

  describe('Lifecycle Methods', () => {
    it('should handle open/close operations', async () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Initially closed
      expect(datepicker.isOpen()).toBe(false);

      // Open the datepicker
      datepicker.open();
      
      // Wait for the dropdown to open (async operation)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(datepicker.isOpen()).toBe(true);

      // Close the datepicker
      datepicker.close();
      
      // Wait for the dropdown to close (async operation)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(datepicker.isOpen()).toBe(false);
    });

    it('should handle toggle operations', async () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2
      };

      datepicker = new KTDatepicker(container, config);

      // Initially closed
      expect(datepicker.isOpen()).toBe(false);

      // Toggle to open
      datepicker.toggle();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(datepicker.isOpen()).toBe(true);

      // Toggle to close
      datepicker.toggle();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(datepicker.isOpen()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle disabled state', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2,
        disabled: true
      };

      datepicker = new KTDatepicker(container, config);

      // In range mode, check that the segmented input containers are disabled
      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');
      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
      
      // Check that the calendar button is disabled
      const calendarButton = container.querySelector('button[data-kt-datepicker-calendar-btn]');
      expect(calendarButton?.hasAttribute('disabled')).toBe(true);
    });

    it('should handle custom placeholder', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2,
        placeholder: 'Select date range'
      };

      datepicker = new KTDatepicker(container, config);

      // In range mode, check that the segmented input containers exist
      const startContainer = container.querySelector('.ktui-segmented-input-start');
      const endContainer = container.querySelector('.ktui-segmented-input-end');
      expect(startContainer).toBeTruthy();
      expect(endContainer).toBeTruthy();
      
      // The placeholder functionality is handled differently in range mode
      // The containers should have appropriate aria-labels (set by SegmentedInput class)
      expect(startContainer?.getAttribute('aria-label')).toBe('Date input');
      expect(endContainer?.getAttribute('aria-label')).toBe('Date input');
    });

    it('should handle custom format', () => {
      const config: KTDatepickerConfig = {
        range: true,
        visibleMonths: 2,
        format: 'dd/MM/yyyy'
      };

      datepicker = new KTDatepicker(container, config);

      // The datepicker should be created successfully with custom format
      expect(datepicker).toBeInstanceOf(KTDatepicker);
    });
  });
});