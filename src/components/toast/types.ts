/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export type KTToastVariantType =
	| 'info'
	| 'success'
	| 'error'
	| 'warning'
	| 'primary'
	| 'secondary'
	| 'destructive'
	| 'mono';

export type KTToastAppearanceType = 'solid' | 'outline' | 'light';

export type KTToastSizeType = 'sm' | 'md' | 'lg';

export type KTToastPosition =
	| 'top-end'
	| 'top-center'
	| 'top-start'
	| 'bottom-end'
	| 'bottom-center'
	| 'bottom-start';

export interface KTToastAction {
	label?: string;
	onClick?: (toastId: string) => void;
	className?: string;
}

/**
 * Allows overriding all internal class names for headless usage.
 * Each property corresponds to a slot in the toast UI.
 */
export interface KTToastClassNames {
	container?: string; // Toast container (positioned wrapper)
	toast?: string; // Main toast element
	icon?: string; // Icon element
	message?: string; // Message element
	dismiss?: string; // Close button
	progress?: string; // Progress bar
	action?: string; // Action button
	cancel?: string; // Cancel button
}

/**
 * Toast configuration
 * @property offset - The vertical offset (in px) from the edge of the screen for stacking toasts.
 */
export interface KTToastConfigInterface {
	/** Override internal class names for headless usage */
	classNames?: Partial<KTToastClassNames>;

	position?: KTToastPosition;
	duration?: number;
	className?: string;
	maxToasts?: number;
	offset?: number; // NEW: global offset for toast stacking
	message?: string | HTMLElement | (() => HTMLElement);
	description?: string | HTMLElement | (() => HTMLElement);
	icon?: string | HTMLElement | (() => HTMLElement);
	action?: KTToastAction;
	cancel?: KTToastAction;
	dismiss?: boolean;
	variant?: KTToastVariantType;
	appearance?: KTToastAppearanceType;
	size?: KTToastSizeType;
	important?: boolean;
	onAutoClose?: (id: string) => void;
	onDismiss?: (id: string) => void;
	closeButton?: boolean;
	style?: Partial<CSSStyleDeclaration>;
	invert?: boolean;
	role?: string;
	id?: string;
	progress?: boolean; // NEW: enable/disable progress indicator
}

export interface KTToastInterface {
	show(
		options?: KTToastOptions,
	): (KTToastInstance & { dismiss: () => void }) | undefined;
	hide(idOrInstance?: string | KTToastInstance): void;
	toggle?(idOrInstance?: string | KTToastInstance): void;
	clearAll?(): void;
	getElement?(): HTMLElement;
	getConfig?(): KTToastConfigInterface;
}

export interface KTToastOptions {
	/** Custom content for the toast. HTMLElement, function returning HTMLElement, or string (DOM id). If set, replaces all default markup. */
	content?: HTMLElement | (() => HTMLElement) | string;
	/** Override internal class names for headless usage */
	classNames?: Partial<KTToastClassNames>;
	/** Show/hide progress indicator */
	progress?: boolean;
	/** Main content of the toast */
	message?: string | HTMLElement | (() => HTMLElement);
	/** Leading icon or visual */
	icon?: string | boolean;
	/** Primary action button */
	action?: KTToastAction | boolean;
	/** Cancel/secondary action button */
	cancel?: KTToastAction | boolean;
	/** Close button */
	dismiss?: KTToastAction | boolean;
	/** Toast variant */
	variant?: KTToastVariantType;
	/** Toast appearance */
	appearance?: KTToastAppearanceType;
	/** Toast size */
	size?: KTToastSizeType;
	/** Auto-dismiss duration (ms) */
	duration?: number;
	/** Prevents auto-dismiss if true */
	important?: boolean;
	/** Called when auto-dismiss fires */
	onAutoClose?: (id: string) => void;
	/** Called when toast is dismissed (manual or auto) */
	onDismiss?: (id: string) => void;
	/** Toast position */
	position?: KTToastPosition;
	/** Custom class for toast */
	className?: string;
	/** ARIA role */
	role?: string;
	/** Optional custom id */
	id?: string;
}

export interface KTToastConfig {
	classNames?: Partial<KTToastClassNames>;
	position?: KTToastPosition;
	duration?: number;
	className?: string;
	maxToasts?: number;
	offset?: number;
	gap?: number;
	dismiss?: boolean;
}

export interface KTToastInstance {
	id: string;
	element: HTMLElement;
	timeoutId: number;
}
