/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTAccordionConfigInterface {
	hiddenClass: string;
	activeClass: string;
	expandAll: boolean;
}

export interface KTAccordionInterface {
	show(accordionElement: HTMLElement): void;
	hide(accordionElement: HTMLElement): void;
	toggle(accordionElement: HTMLElement): void;
}
