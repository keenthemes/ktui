/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTToastOptions, KTToastConfig, KTToastInstance } from './types';
import type { KTToastConfigInterface, KTToastInterface } from './types';
export declare class KTToast extends KTComponent implements KTToastInterface {
    protected _name: string;
    protected _defaultConfig: KTToastConfigInterface;
    protected _config: KTToastConfigInterface;
    protected _defaultToastOptions: KTToastOptions;
    private static containerMap;
    private static toasts;
    private static globalConfig;
    /**
     * Creates a new KTToast instance for a specific element (not commonly used; most use static API).
     * @param element The target HTML element.
     * @param config Optional toast config for this instance.
     */
    constructor(element: HTMLElement, config?: Partial<KTToastConfigInterface>);
    /**
     * Generates the HTML content for a toast based on the provided options.
     * @param options Toast options (message, icon, actions, etc).
     * @returns The toast's HTML markup as a string.
     */
    static getContent(options?: KTToastOptions): string;
    /**
     * Update all toasts in the container with smooth animation.
     *
     * @param container The toast container element.
     * @param offset Optional offset from the edge.
     */
    static update(container: HTMLElement | null, offset?: number): void;
    /**
     * Set global toast configuration options.
     * @param options Partial toast config to merge with global config.
     */
    static config(options: Partial<KTToastConfig>): void;
    /**
     * Show a toast notification.
     * @param inputOptions Toast options (message, duration, variant, etc).
     * @returns Toast instance with dismiss method, or undefined if invalid input.
     */
    static show(inputOptions?: KTToastOptions): (KTToastInstance & {
        dismiss: () => void;
    }) | undefined;
    /**
     * Close and remove all active toasts.
     */
    static clearAll(clearContainers?: boolean): void;
    /**
     * Close a toast by ID or instance.
     * @param idOrInstance Toast ID string or KTToastInstance.
     */
    static close(idOrInstance?: string | KTToastInstance): void;
    /**
     * Dispatches a custom 'kt.toast.{eventType}' event on the given element.
     * @param element The toast element.
     * @param eventType The event type (e.g. 'show', 'hide').
     * @param payload Optional event detail payload.
     */
    private static _fireEventOnElement;
    /**
     * Dispatches a custom event (not namespaced) on the given element.
     * @param element The toast element.
     * @param eventType The event type.
     * @param payload Optional event detail payload.
     */
    private static _dispatchEventOnElement;
    /**
     * Initialize toast system (placeholder for future use).
     */
    static init(): void;
}
//# sourceMappingURL=toast.d.ts.map