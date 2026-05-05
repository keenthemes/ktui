/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { Placement } from '@popperjs/core';

export interface KTContextMenuConfigInterface {
	zindex: number;
	keyboard: boolean;
	permanent: boolean;
	dismiss: boolean;
	placement: Placement;
	placementRtl: Placement;
	offset: string;
	offsetRtl: string;
	hiddenClass: string;
	container: string;
	preventNativeMenu: boolean;
	flip: boolean;
	overflow: boolean;
}

export interface KTContextMenuInterface {
	showAt(x: number, y: number): void;
	showAtEvent(event: MouseEvent): void;
	hide(): void;
	toggleAtEvent(event: MouseEvent): void;
	isOpen(): boolean;
	getMenuElement(): HTMLElement;
	getTargetElement(): HTMLElement;
}
