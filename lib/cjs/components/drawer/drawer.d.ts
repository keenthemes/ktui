/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTDrawerInterface, KTDrawerConfigInterface } from './types';
declare global {
    interface Window {
        KT_DRAWER_INITIALIZED: boolean;
        KTDrawer: typeof KTDrawer;
    }
}
export declare class KTDrawer extends KTComponent implements KTDrawerInterface {
    protected _name: string;
    protected _defaultConfig: KTDrawerConfigInterface;
    protected _config: KTDrawerConfigInterface;
    protected _isOpen: boolean;
    protected _isTransitioning: boolean;
    protected _backdropElement: HTMLElement | null;
    protected _relatedTarget: HTMLElement | null;
    constructor(element: HTMLElement, config?: KTDrawerConfigInterface);
    protected _handleClose(): void;
    protected _toggle(relatedTarget?: HTMLElement): void;
    protected _show(relatedTarget?: HTMLElement): void;
    protected _hide(): void;
    protected _update(): void;
    protected _handleContainer(): void;
    protected _autoFocus(): void;
    protected _createBackdrop(): void;
    protected _deleteBackdrop(): void;
    protected _isEnabled(): boolean;
    toggle(): void;
    show(relatedTarget?: HTMLElement): void;
    hide(): void;
    update(): void;
    getRelatedTarget(): HTMLElement | null;
    isOpen(): boolean;
    isEnabled(): boolean;
    static getInstance(element: HTMLElement): KTDrawer;
    static getOrCreateInstance(element: HTMLElement, config?: KTDrawerConfigInterface): KTDrawer;
    static hide(): void;
    static handleResize(): void;
    static handleToggle(): void;
    static handleDismiss(): void;
    static handleClickAway(): void;
    static handleKeyword(): void;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=drawer.d.ts.map