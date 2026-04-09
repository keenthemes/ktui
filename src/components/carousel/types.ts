/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTCarouselConfigInterface {
	autoplay: boolean;
	autoplayInterval: number;
	infiniteLoop: boolean;
	rtl: boolean;
	perView: number;
	centered: boolean;
	draggable: boolean;
	snap: boolean;
	autoHeight: boolean;
	lazy: boolean;
	pauseOnHover: boolean;
	changeEvent: string;
}

export interface KTCarouselChangePayloadInterface {
	index: number;
	prevIndex: number;
	userInitiated: boolean;
}

export interface KTCarouselInterface {
	goTo(index: number, userInitiated?: boolean): void;
	next(userInitiated?: boolean): void;
	prev(userInitiated?: boolean): void;
	getIndex(): number;
	getSlideCount(): number;
	dispose(): void;
	getElement(): HTMLElement;
	getOption(name: string): unknown;
}
