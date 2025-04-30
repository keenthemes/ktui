/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTScrollspyConfigInterface {
	target: string;
	smooth: boolean;
	offset: number;
}

export interface KTScrollspyInterface {
	update(anchorElement: HTMLElement, event: Event): void;
	scrollTo(anchorElement: HTMLElement): void;
}
