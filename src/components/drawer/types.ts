/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTDrawerConfigInterface {
	enable?: boolean;
	class: string;
	zindex?: string;
	shownClass: string;
	hiddenClass: string;
	backdrop: boolean;
	backdropClass: string;
	backdropStatic: boolean;
	keyboard: boolean;
	disableScroll: boolean;
	persistent: boolean;
	focus: boolean;
	container: string;
	/** When set, drawer is not moved to body when inside an element matching this selector (e.g. for SPA/persisted layouts). Comma-separated for multiple selectors. */
	keepInPlaceWithin?: string;
}
export interface KTDrawerInterface {
	show(): void;
	hide(): void;
	toggle(): void;
}
