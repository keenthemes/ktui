/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export type KTRatingSymbolType = 'star' | 'heart';

export interface KTRatingConfigInterface {
	/** Current rating value (1 to max). Omit or 0 for no selection. */
	value?: number;
	/** Maximum rating (default 5). */
	max?: number;
	/** If true, only display the rating; no user input. */
	readonly?: boolean;
	/** Form field name for interactive mode (for form submission). */
	name?: string;
	/** Symbol to display: 'star' (default) or 'heart'. */
	symbol?: KTRatingSymbolType;
	/** If true, do not auto-initialize; init() must be called programmatically. */
	lazy?: boolean;
}

export interface KTRatingInterface {
	getValue(): number | null;
	setValue(value: number | null): void;
	dispose(): void;
}
