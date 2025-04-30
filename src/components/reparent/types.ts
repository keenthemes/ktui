/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export declare type KTOverlayModeType = 'drawer' | 'modal' | 'popover';

export interface KTReparentConfigInterface {
	mode: string;
	target: string;
}

export interface KTReparentInterface {
	update(): void;
}
