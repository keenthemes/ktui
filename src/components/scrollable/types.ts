/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTScrollableConfigInterface {
	save: boolean;
	dependencies: string;
	wrappers: string;
	offset: string;
}

export interface KTScrollableInterface {
	update(): void;
	getHeight(): string;
}
