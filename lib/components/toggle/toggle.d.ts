/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTToggleConfigInterface, KTToggleInterface } from './types';
declare global {
    interface Window {
        KTToggle: typeof KTToggle;
    }
}
export declare class KTToggle extends KTComponent implements KTToggleInterface {
    protected _name: string;
    protected _defaultConfig: KTToggleConfigInterface;
    protected _config: KTToggleConfigInterface;
    protected _targetElement: HTMLElement;
    constructor(element: HTMLElement, config?: KTToggleConfigInterface | null);
    protected _handlers(): void;
    private _getTargetElement;
    protected _toggle(): void;
    protected _update(): void;
    _isActive(): boolean;
    toggle(): void;
    update(): void;
    isActive(): boolean;
    static getInstance(element: HTMLElement): KTToggle;
    static getOrCreateInstance(element: HTMLElement, config?: KTToggleConfigInterface): KTToggle;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=toggle.d.ts.map