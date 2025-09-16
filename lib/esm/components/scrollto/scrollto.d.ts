/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTScrolltoInterface, KTScrolltoConfigInterface } from './types';
declare global {
    interface Window {
        KT_SCROLLTO_INITIALIZED: boolean;
        KTScrollto: typeof KTScrollto;
    }
}
export declare class KTScrollto extends KTComponent implements KTScrolltoInterface {
    protected _name: string;
    protected _defaultConfig: KTScrolltoConfigInterface;
    protected _config: KTScrolltoConfigInterface;
    protected _targetElement: HTMLElement;
    constructor(element: HTMLElement, config?: KTScrolltoConfigInterface);
    private _getTargetElement;
    protected _handlers(): void;
    protected _scroll(): void;
    scroll(): void;
    static getInstance(element: HTMLElement): KTScrollto;
    static getOrCreateInstance(element: HTMLElement, config?: KTScrolltoConfigInterface): KTScrollto;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=scrollto.d.ts.map