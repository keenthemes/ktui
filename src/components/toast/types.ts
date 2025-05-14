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

export interface KTToastConfigInterface {
	position?: KTToastPosition;
	duration?: number;
	className?: string;
	maxToasts?: number;
	message?: string | HTMLElement | (() => HTMLElement);
	description?: string | HTMLElement | (() => HTMLElement);
	icon?: string | HTMLElement | (() => HTMLElement);
	action?: KTToastAction;
	cancel?: KTToastAction;
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
}

export interface KTToastInterface {
	show(options?: KTToastOptions): string | void;
	hide(id?: string): void;
	toggle?(id?: string): void;
	clearAll?(): void;
	getElement?(): HTMLElement;
	getConfig?(): KTToastConfigInterface;
}

export interface KTToastOptions {
	/** Main content of the toast */
	message: string | HTMLElement | (() => HTMLElement);
	/** Optional secondary content */
	description?: string | HTMLElement | (() => HTMLElement);
	/** Leading icon or visual */
	icon?: string | HTMLElement | (() => HTMLElement);
	/** Primary action button */
	action?: KTToastAction;
	/** Cancel/secondary action button */
	cancel?: KTToastAction;
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
	/** Inline style for toast */
	style?: Partial<CSSStyleDeclaration>;
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
