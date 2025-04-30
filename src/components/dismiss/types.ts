/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export declare type KTDismissModeType = 'remove' | 'hide';

export interface KTDismissConfigInterface {
	hiddenClass: string;
	target: string;
	interrupt: boolean;
	mode?: KTDismissModeType;
}

export interface KTDismissInterface {
	dismiss(): void;
}
