/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/**
 * Event names used by the datepicker component
 */
export var KTDatepickerEventName;
(function (KTDatepickerEventName) {
    KTDatepickerEventName["DATE_CHANGE"] = "date-change";
    KTDatepickerEventName["STATE_CHANGE"] = "stateChange";
    KTDatepickerEventName["OPEN"] = "open";
    KTDatepickerEventName["CLOSE"] = "close";
    KTDatepickerEventName["UPDATE"] = "update";
    KTDatepickerEventName["KEYBOARD_OPEN"] = "keyboard-open";
    KTDatepickerEventName["VIEW_CHANGE"] = "view-change";
    KTDatepickerEventName["TIME_CHANGE"] = "time-change";
})(KTDatepickerEventName || (KTDatepickerEventName = {}));
/**
 * Centralized event manager for the datepicker component
 * Handles all event dispatching and listening
 */
var KTDatepickerEventManager = /** @class */ (function () {
    /**
     * Constructor
     *
     * @param element - The root element to attach events to
     */
    function KTDatepickerEventManager(element) {
        this._element = element;
    }
    /**
     * Dispatch a custom event on the datepicker element
     *
     * @param eventName - Name of the event to dispatch
     * @param payload - Optional payload data
     */
    KTDatepickerEventManager.prototype.dispatchEvent = function (eventName, payload) {
        var event = new CustomEvent(eventName, {
            bubbles: true,
            detail: { payload: payload },
        });
        this._element.dispatchEvent(event);
    };
    /**
     * Add an event listener to the datepicker element
     *
     * @param eventName - Name of the event to listen for
     * @param listener - Callback function
     * @param options - Event listener options
     */
    KTDatepickerEventManager.prototype.addEventListener = function (eventName, listener, options) {
        this._element.addEventListener(eventName, listener, options);
    };
    /**
     * Remove an event listener from the datepicker element
     *
     * @param eventName - Name of the event to remove listener for
     * @param listener - Callback function to remove
     * @param options - Event listener options
     */
    KTDatepickerEventManager.prototype.removeEventListener = function (eventName, listener, options) {
        this._element.removeEventListener(eventName, listener, options);
    };
    /**
     * Dispatch the date change event with the current selection
     *
     * @param payload - Object containing date selection information
     */
    KTDatepickerEventManager.prototype.dispatchDateChangeEvent = function (payload) {
        this.dispatchEvent(KTDatepickerEventName.DATE_CHANGE, payload);
    };
    /**
     * Dispatch the open event when the datepicker opens
     */
    KTDatepickerEventManager.prototype.dispatchOpenEvent = function () {
        this.dispatchEvent(KTDatepickerEventName.OPEN);
    };
    /**
     * Dispatch the close event when the datepicker closes
     */
    KTDatepickerEventManager.prototype.dispatchCloseEvent = function () {
        this.dispatchEvent(KTDatepickerEventName.CLOSE);
    };
    /**
     * Dispatch the update event to refresh the datepicker
     */
    KTDatepickerEventManager.prototype.dispatchUpdateEvent = function () {
        this.dispatchEvent(KTDatepickerEventName.UPDATE);
    };
    /**
     * Dispatch the keyboard open event when datepicker is opened via keyboard
     */
    KTDatepickerEventManager.prototype.dispatchKeyboardOpenEvent = function () {
        this.dispatchEvent(KTDatepickerEventName.KEYBOARD_OPEN);
    };
    /**
     * Dispatch the view change event when the datepicker view changes
     *
     * @param viewMode - The new view mode (days, months, years)
     */
    KTDatepickerEventManager.prototype.dispatchViewChangeEvent = function (viewMode) {
        this.dispatchEvent(KTDatepickerEventName.VIEW_CHANGE, { viewMode: viewMode });
    };
    /**
     * Dispatch the time change event when the time selection changes
     *
     * @param timeData - Object containing time selection information
     */
    KTDatepickerEventManager.prototype.dispatchTimeChangeEvent = function (timeData) {
        this.dispatchEvent(KTDatepickerEventName.TIME_CHANGE, timeData);
    };
    /**
     * Dispatch a change event on the given input element
     *
     * @param inputElement - The input element to dispatch change event on
     */
    KTDatepickerEventManager.prototype.dispatchInputChangeEvent = function (inputElement) {
        if (inputElement) {
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };
    return KTDatepickerEventManager;
}());
export { KTDatepickerEventManager };
//# sourceMappingURL=events.js.map