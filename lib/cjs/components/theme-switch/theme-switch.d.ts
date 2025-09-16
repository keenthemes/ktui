/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTThemeSwitchInterface, KTThemeSwitchConfigInterface } from './types';
import { KTThemeSwitchModeType } from './types';
declare global {
    interface Window {
        KT_STICKY_INITIALIZED: boolean;
        KTThemeSwitch: typeof KTThemeSwitch;
    }
}
export declare class KTThemeSwitch extends KTComponent implements KTThemeSwitchInterface {
    protected _name: string;
    protected _defaultConfig: KTThemeSwitchConfigInterface;
    protected _mode: KTThemeSwitchModeType | null;
    protected _currentMode: KTThemeSwitchModeType | null;
    constructor(element: HTMLElement | HTMLHtmlElement, config?: KTThemeSwitchConfigInterface | null);
    protected _handlers(): void;
    protected _toggle(): void;
    protected _setMode(mode: KTThemeSwitchModeType): void;
    protected _getMode(): KTThemeSwitchModeType;
    protected _getSystemMode(): KTThemeSwitchModeType;
    protected _bindMode(): void;
    protected _updateState(): void;
    getMode(): KTThemeSwitchModeType;
    setMode(mode: KTThemeSwitchModeType): void;
    static getInstance(): KTThemeSwitch;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=theme-switch.d.ts.map