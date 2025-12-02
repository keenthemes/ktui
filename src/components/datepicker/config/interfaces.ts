/*
 * interfaces.ts - Interfaces for KTDatepicker components
 * Defines contracts between components to reduce coupling and improve testability.
 */

import { KTDatepickerConfig, KTDatepickerState, KTDatepickerTemplateStrings } from './types';

/**
 * Interface for UI rendering operations
 */
export interface IUIRenderer {
  renderContainer(): HTMLElement;
  renderInputWrapper(calendarButtonHtml: string): HTMLElement;
  renderDropdown(): HTMLElement;
  renderDropdownContent(dropdownEl: HTMLElement): void;
  renderCalendarButton(): string;
  updateState(newState: KTDatepickerState): void;
  updateConfig(newConfig: KTDatepickerConfig): void;
}

/**
 * Interface for state management operations
 */
export interface IStateManager {
  isOpen(): boolean;
  isTransitioning(): boolean;
  isDisabled(): boolean;
  open(source?: string): boolean;
  close(source?: string): boolean;
  toggle(source?: string): boolean;
  enable(source?: string): boolean;
  disable(source?: string): boolean;
  setFocus(focused: boolean, source?: string): boolean;
  getState(): any;
  subscribe(observer: (event: any) => void): () => void;
  dispose(): void;
}

/**
 * Interface for event management operations
 */
export interface IEventManager {
  addListener(element: HTMLElement, event: string, handler: (e: Event) => void): void;
  removeListener(element: HTMLElement, event: string, handler: (e: Event) => void): void;
  removeAllListeners(element: HTMLElement): void;
}

/**
 * Interface for dropdown positioning operations
 */
export interface IDropdownManager {
  open(): void;
  close(): void;
  isOpen(): boolean;
  updatePosition(): void;
  dispose(): void;
}

/**
 * Interface for date selection operations
 */
export interface IDateSelector {
  selectDate(date: Date): void;
  selectRange(start: Date, end: Date): void;
  selectMultipleDates(dates: Date[]): void;
  clearSelection(): void;
  getSelectedDate(): Date | null;
  getSelectedRange(): { start: Date | null; end: Date | null } | null;
  getSelectedDates(): Date[];
}

/**
 * Interface for input management operations
 */
export interface IInputManager {
  setValue(value: string): void;
  getValue(): string;
  setPlaceholder(placeholder: string): void;
  setDisabled(disabled: boolean): void;
  focus(): void;
  blur(): void;
}