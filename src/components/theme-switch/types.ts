/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export declare type KTThemeSwitchModeType = 'light' | 'dark' | 'system';

export interface KTThemeSwitchConfigInterface {
	mode: KTThemeSwitchModeType;
}

export interface KTThemeSwitchInterface {
	setMode(mode: KTThemeSwitchModeType): void;
	getMode(): KTThemeSwitchModeType;
}
