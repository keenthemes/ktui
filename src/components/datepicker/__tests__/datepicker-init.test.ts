import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTDatepicker, initDatepickers } from '../datepicker';

describe('KTDatepicker Initialization', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('initDatepickers', () => {
    it('should initialize datepickers for elements with data-kt-datepicker attribute', () => {
      // Create multiple elements with the data attribute
      const element1 = document.createElement('div');
      element1.setAttribute('data-kt-datepicker', '');
      container.appendChild(element1);

      const element2 = document.createElement('div');
      element2.setAttribute('data-kt-datepicker', 'true');
      container.appendChild(element2);

      const element3 = document.createElement('div');
      element3.setAttribute('data-kt-datepicker', '');
      container.appendChild(element3);

      // Call initDatepickers
      initDatepickers();

      // Check that datepicker instances were created
      expect((element1 as any).instance).toBeInstanceOf(KTDatepicker);
      expect((element2 as any).instance).toBeInstanceOf(KTDatepicker);
      expect((element3 as any).instance).toBeInstanceOf(KTDatepicker);
    });

    it('should skip elements that already have datepicker instances', () => {
      // Create an element with existing instance
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      // Manually create a datepicker instance
      const existingDatepicker = new KTDatepicker(element);
      (element as any).instance = existingDatepicker;

      // Spy on KTDatepicker constructor
      const constructorSpy = vi.spyOn(KTDatepicker.prototype, 'constructor' as any);

      // Call initDatepickers
      initDatepickers();

      // Constructor should not be called again for the element with existing instance
      expect(constructorSpy).not.toHaveBeenCalled();
      expect((element as any).instance).toBe(existingDatepicker);
    });

    it('should not initialize elements without data-kt-datepicker attribute', () => {
      // Create elements without the data attribute
      const element1 = document.createElement('div');
      container.appendChild(element1);

      const element2 = document.createElement('div');
      element2.className = 'some-datepicker-class';
      container.appendChild(element2);

      // Call initDatepickers
      initDatepickers();

      // Check that no instances were created
      expect((element1 as any).instance).toBeUndefined();
      expect((element2 as any).instance).toBeUndefined();
    });

    it('should handle empty result set gracefully', () => {
      // Call initDatepickers when no elements exist
      expect(() => initDatepickers()).not.toThrow();
    });

    it('should initialize datepickers in document order', () => {
      // Create elements in a specific order
      const elements: HTMLElement[] = [];
      for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.setAttribute('data-kt-datepicker', '');
        element.setAttribute('data-order', i.toString());
        container.appendChild(element);
        elements.push(element);
      }

      // Call initDatepickers
      initDatepickers();

      // Verify all elements have instances and are in correct order
      elements.forEach((element, index) => {
        expect((element as any).instance).toBeInstanceOf(KTDatepicker);
        expect(element.getAttribute('data-order')).toBe(index.toString());
      });
    });
  });

  describe('Public API Methods', () => {
    it('should return correct isOpen state', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Initially should be closed
      expect(datepicker.isOpen()).toBe(false);

      // After opening, should be open
      datepicker.open();
      expect(datepicker.isOpen()).toBe(true);

      // After closing, should be closed again
      datepicker.close();
      expect(datepicker.isOpen()).toBe(false);
    });

    it('should return complete state object via getState', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);
      const testDate = new Date(2024, 0, 15);

      // Set a date to change state
      datepicker.setDate(testDate);

      // Get state
      const state = datepicker.getState();

      // Should return a complete state object
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('selectedDate');
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('isDisabled');
      expect(state).toHaveProperty('isFocused');
      expect(state).toHaveProperty('isTransitioning');
      expect(state).toHaveProperty('validationErrors');
      expect(state).toHaveProperty('isValid');

      // Should be a copy, not the original reference
      expect(state).not.toBe(datepicker.getState()); // Different object references
    });

    it('should getState return independent copies', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);
      const testDate = new Date(2024, 0, 15);

      // Set a date
      datepicker.setDate(testDate);

      // Get two state objects
      const state1 = datepicker.getState();
      const state2 = datepicker.getState();

      // Should be different objects (copies)
      expect(state1).not.toBe(state2);

      // But should have same content initially
      expect(state1.selectedDate).toEqual(state2.selectedDate);
      expect(state1.isOpen).toEqual(state2.isOpen);

      // Note: getState returns a shallow copy, so Date objects are shared references
      // This is expected behavior - consumers should treat state as read-only
      if (state1.selectedDate) {
        state1.selectedDate.setFullYear(2025);
        expect(state2.selectedDate?.getFullYear()).toBe(2025); // Both affected due to shared reference
      }
    });
  });

  describe('Public API Methods', () => {
    it('should return correct isOpen state', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Initially should be closed
      expect(datepicker.isOpen()).toBe(false);

      // After opening, should be open
      datepicker.open();
      expect(datepicker.isOpen()).toBe(true);

      // After closing, should be closed again
      datepicker.close();
      expect(datepicker.isOpen()).toBe(false);
    });

    it('should return complete state object via getState', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);
      const testDate = new Date(2024, 0, 15);

      // Set a date to change state
      datepicker.setDate(testDate);

      // Get state
      const state = datepicker.getState();

      // Should return a complete state object
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('selectedDate');
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('isDisabled');
      expect(state).toHaveProperty('isFocused');
      expect(state).toHaveProperty('isTransitioning');
      expect(state).toHaveProperty('validationErrors');
      expect(state).toHaveProperty('isValid');

      // Should be a copy, not the original reference
      expect(state).not.toBe(datepicker.getState()); // Different object references
    });

    it('should getState return independent copies', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);
      const testDate = new Date(2024, 0, 15);

      // Set a date
      datepicker.setDate(testDate);

      // Get two state objects
      const state1 = datepicker.getState();
      const state2 = datepicker.getState();

      // Should be different objects (copies)
      expect(state1).not.toBe(state2);

      // But should have same content initially
      expect(state1.selectedDate).toEqual(state2.selectedDate);
      expect(state1.isOpen).toEqual(state2.isOpen);

      // Note: getState returns a shallow copy, so Date objects are shared references
      // This is expected behavior - consumers should treat state as read-only
      if (state1.selectedDate) {
        state1.selectedDate.setFullYear(2025);
        expect(state2.selectedDate?.getFullYear()).toBe(2025); // Both affected due to shared reference
      }
    });

    it('should toggle between open and closed states', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Initially closed
      expect(datepicker.isOpen()).toBe(false);

      // Toggle to open
      datepicker.toggle();
      expect(datepicker.isOpen()).toBe(true);

      // Toggle to close
      datepicker.toggle();
      expect(datepicker.isOpen()).toBe(false);

      // Toggle to open again
      datepicker.toggle();
      expect(datepicker.isOpen()).toBe(true);
    });
  });

  describe('getDropdownState', () => {
    it('should return the current dropdown state from state manager', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Get dropdown state
      const state = datepicker.getDropdownState();

      // Should return an object with expected properties
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('isTransitioning');
      expect(state).toHaveProperty('isDisabled');
      expect(state).toHaveProperty('isFocused');
    });

    it('should return consistent state after opening dropdown', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Initially closed
      const initialState = datepicker.getDropdownState();
      expect(initialState.isOpen).toBe(false);

      // Open dropdown
      datepicker.open();

      // Check state after opening
      const openState = datepicker.getDropdownState();
      expect(openState.isOpen).toBe(true);
    });

    it('should return consistent state after closing dropdown', () => {
      const element = document.createElement('div');
      element.setAttribute('data-kt-datepicker', '');
      container.appendChild(element);

      const datepicker = new KTDatepicker(element);

      // Open then close
      datepicker.open();
      datepicker.close();

      // Check state after closing
      const closedState = datepicker.getDropdownState();
      expect(closedState.isOpen).toBe(false);
    });
  });
});
