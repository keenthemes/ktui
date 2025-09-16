/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/**
 * Event names used by the datepicker component
 */
export declare enum KTDatepickerEventName {
    DATE_CHANGE = "date-change",
    STATE_CHANGE = "stateChange",
    OPEN = "open",
    CLOSE = "close",
    UPDATE = "update",
    KEYBOARD_OPEN = "keyboard-open",
    VIEW_CHANGE = "view-change",
    TIME_CHANGE = "time-change"
}
/**
 * Centralized event manager for the datepicker component
 * Handles all event dispatching and listening
 */
export declare class KTDatepickerEventManager {
    private _element;
    /**
     * Constructor
     *
     * @param element - The root element to attach events to
     */
    constructor(element: HTMLElement);
    /**
     * Dispatch a custom event on the datepicker element
     *
     * @param eventName - Name of the event to dispatch
     * @param payload - Optional payload data
     */
    dispatchEvent(eventName: KTDatepickerEventName | string, payload?: any): void;
    /**
     * Add an event listener to the datepicker element
     *
     * @param eventName - Name of the event to listen for
     * @param listener - Callback function
     * @param options - Event listener options
     */
    addEventListener(eventName: KTDatepickerEventName | string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    /**
     * Remove an event listener from the datepicker element
     *
     * @param eventName - Name of the event to remove listener for
     * @param listener - Callback function to remove
     * @param options - Event listener options
     */
    removeEventListener(eventName: KTDatepickerEventName | string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    /**
     * Dispatch the date change event with the current selection
     *
     * @param payload - Object containing date selection information
     */
    dispatchDateChangeEvent(payload: any): void;
    /**
     * Dispatch the open event when the datepicker opens
     */
    dispatchOpenEvent(): void;
    /**
     * Dispatch the close event when the datepicker closes
     */
    dispatchCloseEvent(): void;
    /**
     * Dispatch the update event to refresh the datepicker
     */
    dispatchUpdateEvent(): void;
    /**
     * Dispatch the keyboard open event when datepicker is opened via keyboard
     */
    dispatchKeyboardOpenEvent(): void;
    /**
     * Dispatch the view change event when the datepicker view changes
     *
     * @param viewMode - The new view mode (days, months, years)
     */
    dispatchViewChangeEvent(viewMode: string): void;
    /**
     * Dispatch the time change event when the time selection changes
     *
     * @param timeData - Object containing time selection information
     */
    dispatchTimeChangeEvent(timeData: any): void;
    /**
     * Dispatch a change event on the given input element
     *
     * @param inputElement - The input element to dispatch change event on
     */
    dispatchInputChangeEvent(inputElement: HTMLInputElement): void;
}
//# sourceMappingURL=events.d.ts.map