/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTCollapseConfigInterface {
	hiddenClass: string;
	activeClass: string;
	target: string;
}

export interface KTCollapseInterface {
	collapse(): void;
	expand(): void;
	isOpen(): boolean;
}
