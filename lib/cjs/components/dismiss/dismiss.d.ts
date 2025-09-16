/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTDismissInterface, KTDismissConfigInterface } from './types';
declare global {
    interface Window {
        KT_DISMISS_INITIALIZED: boolean;
        KTDismiss: typeof KTDismiss;
    }
}
export declare class KTDismiss extends KTComponent implements KTDismissInterface {
    protected _name: string;
    protected _defaultConfig: KTDismissConfigInterface;
    protected _config: KTDismissConfigInterface;
    protected _isAnimating: boolean;
    protected _targetElement: HTMLElement | null;
    constructor(element: HTMLElement, config?: KTDismissConfigInterface);
    private _getTargetElement;
    protected _handlers(): void;
    protected _dismiss(): void;
    getTargetElement(): HTMLElement;
    dismiss(): void;
    static getInstance(element: HTMLElement): KTDismiss;
    static getOrCreateInstance(element: HTMLElement, config?: KTDismissConfigInterface): KTDismiss;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=dismiss.d.ts.map