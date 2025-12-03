/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Event names used by the datepicker component
 */
export enum KTDatepickerEventName {
	DATE_CHANGE = 'date-change',
	STATE_CHANGE = 'stateChange',
	OPEN = 'open',
	CLOSE = 'close',
	UPDATE = 'update',
	KEYBOARD_OPEN = 'keyboard-open',
	VIEW_CHANGE = 'view-change',
	TIME_CHANGE = 'time-change',
}

/**
 * Centralized event manager for the datepicker component
 * Handles all event dispatching and listening
 */
export class KTDatepickerEventManager {
	private _element: HTMLElement;

	/**
	 * Constructor
	 *
	 * @param element - The root element to attach events to
	 */
	constructor(element: HTMLElement) {
		this._element = element;
	}

	/**
	 * Dispatch a custom event on the datepicker element
	 *
	 * @param eventName - Name of the event to dispatch
	 * @param payload - Optional payload data
	 */
	public dispatchEvent(
		eventName: KTDatepickerEventName | string,
		payload?: any,
	): void {
		const event = new CustomEvent(eventName, {
			bubbles: true,
			detail: { payload },
		});

		this._element.dispatchEvent(event);
	}

	/**
	 * Add an event listener to the datepicker element
	 *
	 * @param eventName - Name of the event to listen for
	 * @param listener - Callback function
	 * @param options - Event listener options
	 */
	public addEventListener(
		eventName: KTDatepickerEventName | string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): void {
		this._element.addEventListener(eventName, listener, options);
	}

	/**
	 * Remove an event listener from the datepicker element
	 *
	 * @param eventName - Name of the event to remove listener for
	 * @param listener - Callback function to remove
	 * @param options - Event listener options
	 */
	public removeEventListener(
		eventName: KTDatepickerEventName | string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions,
	): void {
		this._element.removeEventListener(eventName, listener, options);
	}

	/**
	 * Dispatch the date change event with the current selection
	 *
	 * @param payload - Object containing date selection information
	 */
	public dispatchDateChangeEvent(payload: any): void {
		this.dispatchEvent(KTDatepickerEventName.DATE_CHANGE, payload);
	}

	/**
	 * Dispatch the open event when the datepicker opens
	 */
	public dispatchOpenEvent(): void {
		this.dispatchEvent(KTDatepickerEventName.OPEN);
	}

	/**
	 * Dispatch the close event when the datepicker closes
	 */
	public dispatchCloseEvent(): void {
		this.dispatchEvent(KTDatepickerEventName.CLOSE);
	}

	/**
	 * Dispatch the update event to refresh the datepicker
	 */
	public dispatchUpdateEvent(): void {
		this.dispatchEvent(KTDatepickerEventName.UPDATE);
	}

	/**
	 * Dispatch the keyboard open event when datepicker is opened via keyboard
	 */
	public dispatchKeyboardOpenEvent(): void {
		this.dispatchEvent(KTDatepickerEventName.KEYBOARD_OPEN);
	}

	/**
	 * Dispatch the view change event when the datepicker view changes
	 *
	 * @param viewMode - The new view mode (days, months, years)
	 */
	public dispatchViewChangeEvent(viewMode: string): void {
		this.dispatchEvent(KTDatepickerEventName.VIEW_CHANGE, { viewMode });
	}

	/**
	 * Dispatch the time change event when the time selection changes
	 *
	 * @param timeData - Object containing time selection information
	 */
	public dispatchTimeChangeEvent(timeData: any): void {
		this.dispatchEvent(KTDatepickerEventName.TIME_CHANGE, timeData);
	}

	/**
	 * Dispatch a change event on the given input element
	 *
	 * @param inputElement - The input element to dispatch change event on
	 */
	public dispatchInputChangeEvent(inputElement: HTMLInputElement): void {
		if (inputElement) {
			inputElement.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}
}
