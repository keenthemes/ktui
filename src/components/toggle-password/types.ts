/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTTogglePasswordConfigInterface {
	permanent?: boolean;
}

export interface KTTogglePasswordInterface {
	toggle(): void;
	isVisible(): boolean;
}
