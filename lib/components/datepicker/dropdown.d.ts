/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTDatepickerConfigInterface } from './types';
/**
 * KTDatepickerDropdown
 *
 * A specialized dropdown implementation for the KTDatepicker component.
 * This module handles the dropdown functionality for the datepicker component,
 * including positioning, showing/hiding, and keyboard navigation.
 */
export declare class KTDatepickerDropdown extends KTComponent {
    protected readonly _name: string;
    protected readonly _config: KTDatepickerConfigInterface;
    protected _element: HTMLElement;
    private _toggleElement;
    private _dropdownElement;
    private _isOpen;
    private _isTransitioning;
    private _popperInstance;
    private _eventManager;
    private _focusManager;
    private _focusTrap;
    private _activeElement;
    /**
     * Constructor
     * @param element The parent element (datepicker wrapper)
     * @param toggleElement The element that triggers the dropdown
     * @param dropdownElement The dropdown content element
     * @param config The configuration options
     */
    constructor(element: HTMLElement, toggleElement: HTMLElement, dropdownElement: HTMLElement, config: KTDatepickerConfigInterface);
    /**
     * Set up event listeners for the dropdown
     */
    private _setupEventListeners;
    /**
     * Handle toggle element click
     */
    private _handleToggleClick;
    /**
     * Handle keyboard events
     */
    private _handleKeyDown;
    /**
     * Handle clicks outside the dropdown
     */
    private _handleOutsideClick;
    /**
     * Set width of dropdown based on toggle element
     */
    private _setDropdownWidth;
    /**
     * Initialize the Popper instance for dropdown positioning
     */
    private _initPopper;
    /**
     * Parse offset string into an array of numbers
     */
    private _parseOffset;
    /**
     * Destroy the Popper instance
     */
    private _destroyPopper;
    /**
     * Update dropdown position
     */
    updatePosition(): void;
    /**
     * Toggle the dropdown
     */
    toggle(): void;
    /**
     * Open the dropdown
     */
    open(): void;
    /**
     * Focus the first interactive element in the dropdown
     */
    private _focusFirstInteractiveElement;
    /**
     * Close the dropdown
     */
    close(): void;
    /**
     * Check if dropdown is open
     */
    isOpen(): boolean;
    /**
     * Clean up component
     */
    dispose(): void;
}
//# sourceMappingURL=dropdown.d.ts.map