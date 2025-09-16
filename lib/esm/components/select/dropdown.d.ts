/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
/**
 * KTSelectDropdown
 *
 * A specialized dropdown implementation for the KTSelect component.
 * This module handles the dropdown functionality for the select component,
 * including positioning and showing/hiding.
 */
export declare class KTSelectDropdown extends KTComponent {
    protected readonly _name: string;
    protected readonly _config: KTSelectConfigInterface;
    protected _element: HTMLElement;
    private _toggleElement;
    private _dropdownElement;
    private _isOpen;
    private _isTransitioning;
    private _popperInstance;
    private _eventManager;
    private _focusManager;
    private _ktSelectInstance;
    /**
     * Constructor
     * @param element The parent element (select wrapper)
     * @param toggleElement The element that triggers the dropdown
     * @param dropdownElement The dropdown content element
     * @param config The configuration options
     */
    constructor(element: HTMLElement, toggleElement: HTMLElement, dropdownElement: HTMLElement, config: KTSelectConfigInterface, ktSelectInstance: KTSelect);
    /**
     * Set up event listeners for the dropdown
     */
    private _setupEventListeners;
    /**
     * Handle toggle element click
     */
    private _handleToggleClick;
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
     * Open the dropdown
     */
    open(): void;
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
    private _resolveDropdownContainer;
}
//# sourceMappingURL=dropdown.d.ts.map