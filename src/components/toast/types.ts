/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export type KTToastType = 'info' | 'success' | 'error' | 'warning';

export interface KTToastAction {
	label: string;
	onClick: (toastId: string) => void;
	className?: string;
}

export type KTToastPosition =
	| 'top-right'
	| 'top-center'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-center'
	| 'bottom-left';

/**
 * Allows overriding all internal class names for headless usage.
 * Each property corresponds to a slot in the toast UI.
 */
export interface KTToastClassNames {
	container?: string; // Toast container (positioned wrapper)
	toast?: string; // Main toast element
	icon?: string; // Icon element
	content?: string; // Content wrapper
	message?: string; // Message element
	description?: string; // Description element
	close?: string; // Close button
	progress?: string; // Progress bar
	action?: string; // Action button
	cancel?: string; // Cancel button
}

export interface KTToastConfigInterface {
	/** Override internal class names for headless usage */
	classNames?: Partial<KTToastClassNames>;

	position?: KTToastPosition;
	duration?: number;
	className?: string;
	maxToasts?: number;
	message?: string | HTMLElement | (() => HTMLElement);
	description?: string | HTMLElement | (() => HTMLElement);
	icon?: string | HTMLElement | (() => HTMLElement);
	action?: KTToastAction;
	cancel?: KTToastAction;
	close?: KTToastAction;
	type?: KTToastType;
	important?: boolean;
	onAutoClose?: (id: string) => void;
	onDismiss?: (id: string) => void;
	closeButton?: boolean;
	style?: Partial<CSSStyleDeclaration>;
	invert?: boolean;
	role?: string;
	dismissible?: boolean;
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
	/** Optional secondary content */
	description?: string | HTMLElement | (() => HTMLElement);
	/** Leading icon or visual */
	icon?: string | HTMLElement | (() => HTMLElement);
	/** Primary action button */
	action?: KTToastAction;
	/** Cancel/secondary action button */
	cancel?: KTToastAction;
	/** Close button */
	close?: KTToastAction;
	/** Toast type (info, success, etc) */
	type?: KTToastType;
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
	/** Show/hide close button */
	closeButton?: boolean;
	/** Custom class for toast */
	className?: string;
	/** Invert color scheme */
	invert?: boolean;
	/** ARIA role */
	role?: string;
	/** If false, disables manual dismiss */
	dismissible?: boolean;
	/** Optional custom id */
	id?: string;
}

export interface KTToastConfig {
	/** Override internal class names for headless usage */
	classNames?: Partial<KTToastClassNames>;
	position?: KTToastPosition;
	duration?: number;
	className?: string;
	maxToasts?: number;
}

export interface KTToastInstance {
	id: string;
	element: HTMLElement;
	timeoutId: number;
}
