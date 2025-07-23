/**
 * Unit tests for KTDatepicker._shouldCloseDropdown method
 * Tests all dropdown closing logic scenarios across different modes and configurations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTDatepicker } from '../datepicker';
import { KTDatepickerConfig } from '../types';

describe('KTDatepicker._shouldCloseDropdown', () => {
  let container: HTMLElement;
  let datepicker: KTDatepicker;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('data-kt-datepicker', 'true');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (datepicker) {
      datepicker.destroy();
    }
    document.body.removeChild(container);
  });

  // Helper function to create datepicker with specific config
  const createDatepicker = (config: Partial<KTDatepickerConfig> = {}) => {
    datepicker = new KTDatepicker(container, config);
    return datepicker;
  };

  // Helper function to access private method for testing
  const shouldCloseDropdown = (action: 'date-selection' | 'outside-click' | 'escape-key' | 'button-click' | 'time-change') => {
    return (datepicker as any)._shouldCloseDropdown(action);
  };

  // Helper function to set range state
  const setRangeState = (start: Date | null, end: Date | null) => {
    (datepicker as any)._state.selectedRange = { start, end };
  };

  describe('Outside click and Escape key', () => {
    it('should always close dropdown on outside click', () => {
      createDatepicker();
      expect(shouldCloseDropdown('outside-click')).toBe(true);
    });

    it('should always close dropdown on escape key', () => {
      createDatepicker();
      expect(shouldCloseDropdown('escape-key')).toBe(true);
    });

    it('should close on outside click regardless of mode', () => {
      createDatepicker({ range: true, multiDate: true, enableTime: true });
      expect(shouldCloseDropdown('outside-click')).toBe(true);
    });

    it('should close on escape key regardless of mode', () => {
      createDatepicker({ range: true, multiDate: true, enableTime: true });
      expect(shouldCloseDropdown('escape-key')).toBe(true);
    });
  });

  describe('Time change', () => {
    it('should never close dropdown on time change', () => {
      createDatepicker();
      expect(shouldCloseDropdown('time-change')).toBe(false);
    });

    it('should not close on time change regardless of mode', () => {
      createDatepicker({ range: true, multiDate: true, enableTime: true });
      expect(shouldCloseDropdown('time-change')).toBe(false);
    });
  });

  describe('Single date mode', () => {
    it('should close on date selection when closeOnSelect is true (default)', () => {
      createDatepicker();
      expect(shouldCloseDropdown('date-selection')).toBe(true);
    });

    it('should not close on date selection when closeOnSelect is false', () => {
      createDatepicker({ closeOnSelect: false });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should close on button click when closeOnSelect is true (default)', () => {
      createDatepicker();
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should not close on button click when closeOnSelect is false', () => {
      createDatepicker({ closeOnSelect: false });
      expect(shouldCloseDropdown('button-click')).toBe(false);
    });

    it('should not close on date selection when time is enabled', () => {
      createDatepicker({ enableTime: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when time is enabled even if closeOnSelect is true', () => {
      createDatepicker({ enableTime: true, closeOnSelect: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });
  });

  describe('Range mode', () => {
    it('should not close on date selection when no dates are selected', () => {
      createDatepicker({ range: true });
      setRangeState(null, null);
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when only start date is selected', () => {
      createDatepicker({ range: true });
      setRangeState(new Date('2025-01-15'), null);
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when only end date is selected', () => {
      createDatepicker({ range: true });
      setRangeState(null, new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should close on date selection when both dates are selected and closeOnSelect is true', () => {
      createDatepicker({ range: true, closeOnSelect: true });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(true);
    });

    it('should not close on date selection when both dates are selected but closeOnSelect is false', () => {
      createDatepicker({ range: true, closeOnSelect: false });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should close on button click when closeOnSelect is true', () => {
      createDatepicker({ range: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should not close on button click when closeOnSelect is false', () => {
      createDatepicker({ range: true, closeOnSelect: false });
      expect(shouldCloseDropdown('button-click')).toBe(false);
    });

    it('should not close on date selection when time is enabled', () => {
      createDatepicker({ range: true, enableTime: true });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });
  });

  describe('Multi-date mode', () => {
    it('should not close on date selection', () => {
      createDatepicker({ multiDate: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection even when closeOnSelect is true', () => {
      createDatepicker({ multiDate: true, closeOnSelect: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should close on button click when closeOnSelect is true', () => {
      createDatepicker({ multiDate: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should not close on button click when closeOnSelect is false', () => {
      createDatepicker({ multiDate: true, closeOnSelect: false });
      expect(shouldCloseDropdown('button-click')).toBe(false);
    });

    it('should not close on date selection when time is enabled', () => {
      createDatepicker({ multiDate: true, enableTime: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });
  });

  describe('Time-enabled mode', () => {
    it('should not close on date selection when time is enabled', () => {
      createDatepicker({ enableTime: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when time is enabled in single date mode', () => {
      createDatepicker({ enableTime: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when time is enabled in range mode', () => {
      createDatepicker({ enableTime: true, range: true });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should not close on date selection when time is enabled in multi-date mode', () => {
      createDatepicker({ enableTime: true, multiDate: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });

    it('should close on button click when closeOnSelect is true', () => {
      createDatepicker({ enableTime: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should not close on button click when closeOnSelect is false', () => {
      createDatepicker({ enableTime: true, closeOnSelect: false });
      expect(shouldCloseDropdown('button-click')).toBe(false);
    });
  });

  describe('Button click scenarios', () => {
    it('should close on button click when closeOnSelect is true (default)', () => {
      createDatepicker();
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should not close on button click when closeOnSelect is false', () => {
      createDatepicker({ closeOnSelect: false });
      expect(shouldCloseDropdown('button-click')).toBe(false);
    });

    it('should close on button click in range mode when closeOnSelect is true', () => {
      createDatepicker({ range: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should close on button click in multi-date mode when closeOnSelect is true', () => {
      createDatepicker({ multiDate: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });

    it('should close on button click in time-enabled mode when closeOnSelect is true', () => {
      createDatepicker({ enableTime: true, closeOnSelect: true });
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });
  });

  describe('Edge cases and combinations', () => {
    it('should handle range + multi-date combination (range takes precedence)', () => {
      createDatepicker({ range: true, multiDate: true });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false); // Range mode behavior
    });

    it('should handle time-enabled + range combination (time takes precedence)', () => {
      createDatepicker({ enableTime: true, range: true });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false); // Time-enabled behavior
    });

    it('should handle time-enabled + multi-date combination (time takes precedence)', () => {
      createDatepicker({ enableTime: true, multiDate: true });
      expect(shouldCloseDropdown('date-selection')).toBe(false); // Time-enabled behavior
    });

    it('should handle all modes disabled (single date behavior)', () => {
      createDatepicker({ range: false, multiDate: false, enableTime: false });
      expect(shouldCloseDropdown('date-selection')).toBe(true); // Single date default
    });

    it('should handle explicit closeOnSelect override in all modes', () => {
      // Single date
      createDatepicker({ closeOnSelect: false });
      expect(shouldCloseDropdown('date-selection')).toBe(false);

      // Range
      createDatepicker({ range: true, closeOnSelect: false });
      setRangeState(new Date('2025-01-15'), new Date('2025-01-20'));
      expect(shouldCloseDropdown('date-selection')).toBe(false);

      // Multi-date
      createDatepicker({ multiDate: true, closeOnSelect: false });
      expect(shouldCloseDropdown('date-selection')).toBe(false);
    });
  });

  describe('Default behavior', () => {
    it('should not close for unknown actions', () => {
      createDatepicker();
      // @ts-ignore - Testing invalid action
      expect(shouldCloseDropdown('unknown-action')).toBe(false);
    });

    it('should have sensible defaults for new datepicker', () => {
      createDatepicker();
      expect(shouldCloseDropdown('outside-click')).toBe(true);
      expect(shouldCloseDropdown('escape-key')).toBe(true);
      expect(shouldCloseDropdown('time-change')).toBe(false);
      expect(shouldCloseDropdown('date-selection')).toBe(true);
      expect(shouldCloseDropdown('button-click')).toBe(true);
    });
  });
});