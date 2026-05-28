/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Strip HTML tags and &nbsp; entities from a value, returning plain text.
 * Used by sort, search, and filter pipelines.
 */
export function stripHtml(value: unknown): string {
	return String(value).replace(/<[^>]*>|&nbsp;/g, '');
}
