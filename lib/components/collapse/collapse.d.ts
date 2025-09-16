/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTCollapseInterface, KTCollapseConfigInterface } from './types';
export declare class KTCollapse extends KTComponent implements KTCollapseInterface {
    protected _name: string;
    protected _defaultConfig: KTCollapseConfigInterface;
    protected _config: KTCollapseConfigInterface;
    protected _isAnimating: boolean;
    protected _targetElement: HTMLElement;
    constructor(element: HTMLElement, config?: KTCollapseConfigInterface);
    private _getTargetElement;
    protected _isOpen(): boolean;
    protected _handlers(): void;
    protected _expand(): void;
    protected _collapse(): void;
    protected _toggle(): void;
    expand(): void;
    collapse(): void;
    isOpen(): boolean;
    static getInstance(element: HTMLElement): KTCollapse;
    static getOrCreateInstance(element: HTMLElement, config?: KTCollapseConfigInterface): KTCollapse;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=collapse.d.ts.map