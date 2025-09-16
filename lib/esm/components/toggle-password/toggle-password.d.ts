/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTTogglePasswordConfigInterface, KTTogglePasswordInterface } from './types';
declare global {
    interface Window {
        KTTogglePassword: typeof KTTogglePassword;
    }
}
export declare class KTTogglePassword extends KTComponent implements KTTogglePasswordInterface {
    protected _name: string;
    protected _defaultConfig: KTTogglePasswordConfigInterface;
    protected _config: KTTogglePasswordConfigInterface;
    protected _triggerElement: HTMLElement;
    protected _inputElement: HTMLInputElement;
    constructor(element: HTMLElement, config?: KTTogglePasswordConfigInterface | null);
    protected _handlers(): void;
    protected _toggle(): void;
    protected _update(): void;
    _isVisible(): boolean;
    _setVisible(flag: boolean): void;
    toggle(): void;
    setVisible(flag: boolean): void;
    isVisible(): boolean;
    static getInstance(element: HTMLElement): KTTogglePassword;
    static getOrCreateInstance(element: HTMLElement, config?: KTTogglePasswordConfigInterface): KTTogglePassword;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=toggle-password.d.ts.map