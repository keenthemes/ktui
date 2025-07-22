/*
 * time-utils.ts - Time utilities for KTDatepicker
 * Provides time parsing, formatting, validation, and granularity handling.
 * Follows HeroUI best practices for time picker functionality.
 */

import { TimeState } from './types';

/**
 * Parse time string to TimeState object
 * @param timeStr Time string in format 'HH:MM' or 'HH:MM:SS'
 * @returns TimeState object or null if invalid
 */
export function parseTimeString(timeStr: string): TimeState | null {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = timeStr.match(timeRegex);

  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = match[3] ? parseInt(match[3], 10) : 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  return { hour, minute, second };
}

/**
 * Format TimeState to string
 * @param time TimeState object
 * @param granularity Granularity level
 * @param format Time format ('12h' or '24h')
 * @returns Formatted time string
 */
export function formatTime(time: TimeState, granularity: 'second' | 'minute' | 'hour' = 'minute', format: '12h' | '24h' = '24h'): string {
  if (!time) return '';

  let { hour, minute, second } = time;
  let ampm = '';

  // Handle 12-hour format
  if (format === '12h') {
    ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;
  }

  // Format based on granularity
  switch (granularity) {
    case 'hour':
      return format === '12h' ? `${hour} ${ampm}` : `${hour.toString().padStart(2, '0')}`;
    case 'minute':
      return format === '12h'
        ? `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
        : `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    case 'second':
      return format === '12h'
        ? `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm}`
        : `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    default:
      return format === '12h'
        ? `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
        : `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}

/**
 * Validate time against constraints
 * @param time TimeState to validate
 * @param minTime Minimum time constraint
 * @param maxTime Maximum time constraint
 * @returns Validation result
 */
export function validateTime(time: TimeState, minTime?: string, maxTime?: string): { isValid: boolean; error?: string } {
  if (!time) {
    return { isValid: false, error: 'Time is required' };
  }

  const { hour, minute, second } = time;

  // Basic range validation
  if (hour < 0 || hour > 23) {
    return { isValid: false, error: 'Hour must be between 0 and 23' };
  }
  if (minute < 0 || minute > 59) {
    return { isValid: false, error: 'Minute must be between 0 and 59' };
  }
  if (second < 0 || second > 59) {
    return { isValid: false, error: 'Second must be between 0 and 59' };
  }

  // Min/Max time validation
  if (minTime) {
    const minTimeState = parseTimeString(minTime);
    if (minTimeState && isTimeBefore(time, minTimeState)) {
      return { isValid: false, error: `Time must be after ${minTime}` };
    }
  }

  if (maxTime) {
    const maxTimeState = parseTimeString(maxTime);
    if (maxTimeState && isTimeAfter(time, maxTimeState)) {
      return { isValid: false, error: `Time must be before ${maxTime}` };
    }
  }

  return { isValid: true };
}

/**
 * Check if time1 is before time2
 * @param time1 First time
 * @param time2 Second time
 * @returns True if time1 is before time2
 */
export function isTimeBefore(time1: TimeState, time2: TimeState): boolean {
  const totalSeconds1 = time1.hour * 3600 + time1.minute * 60 + time1.second;
  const totalSeconds2 = time2.hour * 3600 + time2.minute * 60 + time2.second;
  return totalSeconds1 < totalSeconds2;
}

/**
 * Check if time1 is after time2
 * @param time1 First time
 * @param time2 Second time
 * @returns True if time1 is after time2
 */
export function isTimeAfter(time1: TimeState, time2: TimeState): boolean {
  const totalSeconds1 = time1.hour * 3600 + time1.minute * 60 + time1.second;
  const totalSeconds2 = time2.hour * 3600 + time2.minute * 60 + time2.second;
  return totalSeconds1 > totalSeconds2;
}

/**
 * Get time segments based on granularity
 * @param granularity Time granularity
 * @returns Array of segment types
 */
export function getTimeSegments(granularity: 'second' | 'minute' | 'hour'): Array<'hour' | 'minute' | 'second' | 'ampm'> {
  switch (granularity) {
    case 'hour':
      return ['hour'];
    case 'minute':
      return ['hour', 'minute'];
    case 'second':
      return ['hour', 'minute', 'second'];
    default:
      return ['hour', 'minute'];
  }
}

/**
 * Convert Date object to TimeState
 * @param date Date object
 * @returns TimeState object
 */
export function dateToTimeState(date: Date): TimeState {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  };
}

/**
 * Convert TimeState to Date object (using current date)
 * @param time TimeState object
 * @returns Date object with time applied
 */
export function timeStateToDate(time: TimeState): Date {
  const date = new Date();
  date.setHours(time.hour, time.minute, time.second, 0);
  return date;
}

/**
 * Apply time to existing date
 * @param date Date object
 * @param time TimeState object
 * @returns New Date object with time applied
 */
export function applyTimeToDate(date: Date, time: TimeState): Date {
  const newDate = new Date(date);
  newDate.setHours(time.hour, time.minute, time.second, 0);
  return newDate;
}

/**
 * Get time step options based on granularity and step
 * @param granularity Time granularity
 * @param step Step increment in minutes
 * @returns Array of available time values
 */
export function getTimeStepOptions(granularity: 'second' | 'minute' | 'hour', step: number = 1): number[] {
  const options: number[] = [];

  switch (granularity) {
    case 'hour':
      for (let i = 0; i < 24; i += Math.max(1, Math.floor(step / 60))) {
        options.push(i);
      }
      break;
    case 'minute':
      for (let i = 0; i < 60; i += step) {
        options.push(i);
      }
      break;
    case 'second':
      for (let i = 0; i < 60; i += Math.max(1, Math.floor(step * 60))) {
        options.push(i);
      }
      break;
  }

  return options;
}