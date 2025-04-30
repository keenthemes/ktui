/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
export interface KTToggleConfigInterface {
	target?: string;
	activeClass?: string;
	class?: string;
	removeClass?: string;
	attribute?: string;
}

export interface KTToggleInterface {
	toggle(): void;
	update(): void;
	isActive(): boolean;
}
