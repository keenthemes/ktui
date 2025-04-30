/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
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
