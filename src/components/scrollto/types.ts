/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTScrolltoConfigInterface {
	smooth: boolean;
	parent: string;
	target: string;
	offset: number;
}

export interface KTScrolltoInterface {
	scroll(): void;
}
