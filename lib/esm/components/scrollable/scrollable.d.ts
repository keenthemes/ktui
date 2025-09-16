/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTScrollableInterface, KTScrollableConfigInterface } from './types';
declare global {
    interface Window {
        KT_SCROLLABLE_INITIALIZED: boolean;
        KTScrollable: typeof KTScrollable;
    }
}
export declare class KTScrollable extends KTComponent implements KTScrollableInterface {
    protected _name: string;
    protected _defaultConfig: KTScrollableConfigInterface;
    protected _config: KTScrollableConfigInterface;
    protected _elementId: string | null;
    constructor(element: HTMLElement, config?: KTScrollableConfigInterface);
    protected _handlers(): void;
    protected _update(): void;
    protected _setupHeight(): void;
    protected _setupState(): void;
    protected _getHeight(): string;
    protected _getAutoHeight(): string;
    protected _getElementHeight(element: HTMLElement): number;
    protected _getElementSpacing(element: HTMLElement): number;
    protected _getHeightType(): string;
    protected _getHeightOption(): string;
    update(): void;
    getHeight(): string;
    static getInstance(element: HTMLElement): KTScrollable;
    static getOrCreateInstance(element: HTMLElement, config?: KTScrollableConfigInterface): KTScrollable;
    static createInstances(): void;
    static handleResize(): void;
    static init(): void;
}
//# sourceMappingURL=scrollable.d.ts.map