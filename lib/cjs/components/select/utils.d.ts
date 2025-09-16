/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelectConfigInterface } from './config';
/**
 * Format a number as a currency string
 */
export declare function formatCurrency(value: number): string;
/**
 * Filter options based on a search query
 */
export declare function filterOptions(options: HTMLElement[], query: string, config: KTSelectConfigInterface, dropdownElement: HTMLElement, onVisibleCount?: (count: number) => void): number;
/**
 * Focus manager for keyboard navigation
 * Consolidates redundant focus management logic into shared functions
 */
export declare class FocusManager {
    private _element;
    private _optionsSelector;
    private _focusedOptionIndex;
    private _focusClass;
    private _hoverClass;
    private _eventManager;
    private _onFocusChange;
    constructor(element: HTMLElement, optionsSelector?: string, config?: KTSelectConfigInterface);
    /**
     * Set up click handlers for all options to update focus state
     */
    private _setupOptionClickHandlers;
    /**
     * Get all visible options
     */
    getVisibleOptions(): HTMLElement[];
    /**
     * Focus the first visible option
     */
    focusFirst(): HTMLElement | null;
    /**
     * Focus the last visible option
     */
    focusLast(): HTMLElement | null;
    /**
     * Focus the next visible option that matches the search string
     */
    focusByString(str: string): HTMLElement | null;
    /**
     * Focus the next visible option
     */
    focusNext(): HTMLElement | null;
    /**
     * Focus the previous visible option
     */
    focusPrevious(): HTMLElement | null;
    /**
     * Apply focus to a specific option
     */
    applyFocus(option: HTMLElement): void;
    /**
     * Reset focus on all options
     */
    resetFocus(): void;
    /**
     * Ensure the focused option is visible in the scrollable container
     */
    scrollIntoView(option: HTMLElement): void;
    /**
     * Focus a specific option by its value
     */
    focusOptionByValue(value: string): boolean;
    /**
     * Get the currently focused option
     */
    getFocusedOption(): HTMLElement | null;
    /**
     * Get the index of the currently focused option
     */
    getFocusedIndex(): number | null;
    /**
     * Set the focused option index directly
     */
    setFocusedIndex(index: number | null): void;
    /**
     * Set a callback to be called when focus changes
     */
    setOnFocusChange(cb: (option: HTMLElement | null, index: number | null) => void): void;
    private _triggerFocusChange;
    /**
     * Clean up event listeners
     */
    dispose(): void;
}
/**
 * Centralized event listener management
 */
export declare class EventManager {
    private _boundHandlers;
    /**
     * Add an event listener with a bound context
     */
    addListener(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject, context?: any): void;
    /**
     * Remove an event listener
     */
    removeListener(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject): void;
    /**
     * Remove all event listeners
     */
    removeAllListeners(element: HTMLElement): void;
}
/**
 * Debounce function to limit how often a function can be called
 */
export declare function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void;
/**
 * Replaces all {{key}} in the template with the corresponding value from the data object.
 * If a key is missing in data, replaces with an empty string.
 */
export declare function renderTemplateString(template: string, data: Record<string, any>): string;
export declare class TypeToSearchBuffer {
    private buffer;
    private lastTime;
    private timeout;
    constructor(timeout?: number);
    push(char: string): void;
    getBuffer(): string;
    clear(): void;
}
export declare function stringToElement(html: string): HTMLElement;
//# sourceMappingURL=utils.d.ts.map