/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTTabsConfigInterface {
	hiddenClass: string;
}

export interface KTTabsInterface {
	show(tabElement: HTMLElement): void;
	isShown(tabElement: HTMLElement): boolean;
}
