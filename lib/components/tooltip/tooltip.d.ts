/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTTooltipInterface, KTTooltipConfigInterface } from './types';
import { Instance } from '@popperjs/core';
import { KTTooltipTriggerType } from './types';
declare global {
    interface Window {
        KT_TOOLTIP_INITIALIZED: boolean;
        KTTooltip: typeof KTTooltip;
    }
}
export declare class KTTooltip extends KTComponent implements KTTooltipInterface {
    protected _name: string;
    protected _defaultConfig: KTTooltipConfigInterface;
    protected _config: KTTooltipConfigInterface;
    protected _isOpen: boolean;
    protected _targetElement: HTMLElement;
    protected _popper: Instance;
    protected _transitioning: boolean;
    protected _timeout: ReturnType<typeof setTimeout>;
    constructor(element: HTMLElement, config?: KTTooltipConfigInterface | null);
    private _getTargetElement;
    protected _handlers(): void;
    protected _show(): void;
    protected _hide(): void;
    protected _toggle(): void;
    protected _createPopper(): void;
    protected _handleContainer(): void;
    protected _setZindex(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    getContentElement(): HTMLElement | null;
    isOpen(): boolean;
    getTriggerOption(): KTTooltipTriggerType;
    isPermanent(): boolean;
    static initHandlers(): void;
    static getInstance(element: HTMLElement): KTTooltip;
    static getOrCreateInstance(element: HTMLElement, config?: KTTooltipConfigInterface): KTTooltip;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=tooltip.d.ts.map