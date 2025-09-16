/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDatepickerConfigInterface, KTDatepickerStateInterface, TimeConfigInterface } from './types';
import { KTDatepickerEventManager } from './events';
export declare const DefaultConfig: KTDatepickerConfigInterface;
/**
 * State manager class for KTDatepicker
 * Handles state management and configuration
 */
export declare class KTDatepickerStateManager {
    private _element;
    private _config;
    private _state;
    private _events;
    /**
     * Constructor for the KTDatepickerStateManager class
     *
     * @param element - The datepicker element
     * @param config - Configuration object
     */
    constructor(element: HTMLElement, config?: Partial<KTDatepickerConfigInterface>);
    /**
     * Merge provided configuration with default configuration
     *
     * @param config - User provided configuration
     * @returns Merged configuration
     */
    private _mergeConfig;
    /**
     * Initialize the state object with default values
     */
    private _initializeState;
    /**
     * Get the current configuration
     *
     * @returns Current configuration
     */
    getConfig(): KTDatepickerConfigInterface;
    /**
     * Get the current state
     *
     * @returns Current state
     */
    getState(): KTDatepickerStateInterface;
    /**
     * Set the selected date
     *
     * @param date - Date to select
     */
    setSelectedDate(date: Date | null): void;
    /**
     * Set the current view date (month/year being viewed)
     *
     * @param date - Date to set as current view
     */
    setCurrentDate(date: Date): void;
    /**
     * Set the selected time
     *
     * @param time - Time configuration to set
     */
    setSelectedTime(time: TimeConfigInterface | null): void;
    /**
     * Set the view mode (days, months, years)
     *
     * @param mode - View mode to set
     */
    setViewMode(mode: 'days' | 'months' | 'years'): void;
    /**
     * Set the open state of the datepicker
     *
     * @param isOpen - Whether the datepicker is open
     */
    setOpen(isOpen: boolean): void;
    /**
     * Set the focus state of the datepicker
     *
     * @param isFocused - Whether the datepicker is focused
     */
    setFocused(isFocused: boolean): void;
    /**
     * Reset the state to initial values
     */
    resetState(): void;
    /**
     * Dispatch change event with current date/time selection
     */
    private _dispatchChangeEvent;
    /**
     * Dispatch custom event
     *
     * @param eventName - Name of the event
     * @param payload - Optional payload data
     */
    private _dispatchEvent;
    /**
     * Get the event manager instance
     */
    getEventManager(): KTDatepickerEventManager;
}
//# sourceMappingURL=config.d.ts.map