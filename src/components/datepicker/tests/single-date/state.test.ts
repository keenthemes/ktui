/*
 * state.test.ts - Unit tests for state management (KTDatepicker)
 * Uses Vitest for type-safe testing of state helpers.
 */

import { describe, it, expect } from 'vitest';
import { getInitialState } from '../../state';

describe('getInitialState', () => {
  it('returns the correct initial state shape and values', () => {
    const state = getInitialState();
    expect(state).toMatchObject({
      currentDate: expect.any(Date),
      selectedDate: null,
      selectedRange: null,
      selectedDates: [],
      viewMode: 'days',
      isOpen: false,
      isFocused: false,
    });
  });
});