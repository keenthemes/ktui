/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTTabsInterface, KTTabsConfigInterface } from './types';
declare global {
    interface Window {
        KT_TABS_INITIALIZED: boolean;
        KTTabs: typeof KTTabs;
    }
}
export declare class KTTabs extends KTComponent implements KTTabsInterface {
    protected _name: string;
    protected _defaultConfig: KTTabsConfigInterface;
    protected _config: KTTabsConfigInterface;
    protected _currentTabElement: HTMLElement | null;
    protected _currentContentElement: HTMLElement | null;
    protected _lastTabElement: HTMLElement | null;
    protected _lastContentElement: HTMLElement | null;
    protected _tabElements: NodeListOf<HTMLElement> | null;
    protected _isTransitioning: boolean;
    constructor(element: HTMLElement, config?: KTTabsConfigInterface);
    protected _handlers(): void;
    protected _show(tabElement: HTMLElement): void;
    protected _getDropdownToggleElement(element: HTMLElement): HTMLElement;
    protected _isShown(tabElement: HTMLElement): boolean;
    isShown(tabElement: HTMLElement): boolean;
    show(tabElement: HTMLElement): void;
    static keyboardArrow(): void;
    static keyboardJump(): void;
    static handleAccessibility(): void;
    static getInstance(element: HTMLElement): KTTabs;
    static getOrCreateInstance(element: HTMLElement, config?: KTTabsConfigInterface): KTTabs;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=tabs.d.ts.map