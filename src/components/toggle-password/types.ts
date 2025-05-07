/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTTogglePasswordConfigInterface {
	permanent?: boolean;
}

export interface KTTogglePasswordInterface {
	toggle(): void;
	isVisible(): boolean;
}
