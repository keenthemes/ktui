/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTModalInterface, KTModalConfigInterface } from './types';
declare global {
    interface Window {
        KT_MODAL_INITIALIZED: boolean;
        KTModal: typeof KTModal;
    }
}
export declare class KTModal extends KTComponent implements KTModalInterface {
    protected _name: string;
    protected _defaultConfig: KTModalConfigInterface;
    protected _config: KTModalConfigInterface;
    protected _isOpen: boolean;
    protected _isTransitioning: boolean;
    protected _backdropElement: HTMLElement | null;
    protected _targetElement: HTMLElement | null;
    constructor(element: HTMLElement, config?: KTModalConfigInterface);
    protected _handlers(): void;
    protected _toggle(targetElement?: HTMLElement): void;
    protected _show(targetElement?: HTMLElement): void;
    protected _hide(): void;
    protected _setZindex(): void;
    protected _autoFocus(): void;
    protected _createBackdrop(): void;
    protected _deleteBackdrop(): void;
    toggle(targetElement?: HTMLElement): void;
    show(targetElement?: HTMLElement): void;
    hide(): void;
    getTargetElement(): HTMLElement | null;
    isOpen(): boolean;
    static getInstance(element: HTMLElement): KTModal;
    static getOrCreateInstance(element: HTMLElement, config?: KTModalConfigInterface): KTModal;
    static hide(): void;
    static handleToggle(): void;
    static handleDismiss(): void;
    static handleClickAway(): void;
    static handleKeyword(): void;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=modal.d.ts.map