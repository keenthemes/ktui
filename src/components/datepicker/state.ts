/*
 * state.ts - State management for KTDatepicker
 * Provides initial state and state helpers for the datepicker component.
 */

import { KTDatepickerState } from './types';

/**
 * Returns the initial state for the datepicker.
 */
export function getInitialState(): KTDatepickerState {
  return {
    currentDate: new Date(),
    selectedDate: null,
    selectedRange: null,
    selectedDates: [],
    viewMode: 'days',
    isOpen: false,
    isFocused: false,
  };
}