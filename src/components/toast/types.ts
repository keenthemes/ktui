/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Toast variant types
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

/**
 * Toast appearance types
 */
export type KTToastAppearanceType = 'solid' | 'outline' | 'light';

/**
 * Toast size types
 */
export type KTToastSizeType = 'sm' | 'md' | 'lg';

/**
 * Toast position types
 */
export type KTToastPosition =
	| 'top-end'
	| 'top-center'
	| 'top-start'
	| 'bottom-end'
	| 'bottom-center'
	| 'bottom-start';

/**
 * Toast action interface
 */
export interface KTToastAction {
	label?: string; // Button label
	onClick?: (toastId: string) => void; // Click handler
	className?: string; // Button classes
}

/**
 * Allows overriding all internal class names for headless usage.
 * Each property corresponds to a slot in the toast UI.
 */
export interface KTToastClassNames {
	container?: string; // Toast container
	toast?: string; // Taast
	icon?: string; // Icon
	message?: string; // Message
	toolbar?: string; // Toolbar
	actions?: string; // Actions
}

/**
 * Toast configuration
 * @property offset - The vertical offset (in px) from the edge of the screen for stacking toasts.
 */
export interface KTToastConfigInterface {
	classNames?: Partial<KTToastClassNames>; // Override internal class names
	position?: KTToastPosition; // Toast position
	duration?: number; // Auto-dismiss duration (ms)
	className?: string; // Custom class for toast root
	maxToasts?: number; // Max toasts at once
	offset?: number; // Offset from edge (px)
	message?: string | HTMLElement | (() => HTMLElement); // Main message
	description?: string | HTMLElement | (() => HTMLElement); // Description
	icon?: string | HTMLElement | (() => HTMLElement); // Icon
	action?: KTToastAction; // Action button
	cancel?: KTToastAction; // Cancel button
	dismiss?: boolean; // Show close button
	variant?: KTToastVariantType; // Toast color/variant
	appearance?: KTToastAppearanceType; // Appearance style
	size?: KTToastSizeType; // Toast size
	important?: boolean;
	onAutoClose?: (id: string) => void;
	onDismiss?: (id: string) => void;
	closeButton?: boolean;
	style?: Partial<CSSStyleDeclaration>;
	invert?: boolean;
	role?: string;
	id?: string;
	progress?: boolean;
}

export interface KTToastInterface {}

export interface KTToastOptions {
	/** Custom content for the toast. HTMLElement, function returning HTMLElement, or string (DOM id). If set, replaces all default markup. */
	content?: HTMLElement | (() => HTMLElement) | string; // Custom content (overrides default markup)
	/** Override internal class names for headless usage */
	classNames?: Partial<KTToastClassNames>;
	/** Show/hide progress indicator */
	progress?: boolean;
	/** Main content of the toast */
	message?: string | HTMLElement | (() => HTMLElement); // Main content/message
	/** Leading icon or visual */
	icon?: string | boolean; // Leading icon or visual
	/** Primary action button */
	action?: KTToastAction | boolean; // Primary action button
	/** Cancel/secondary action button */
	cancel?: KTToastAction | boolean; // Cancel/secondary action button
	/** Close button */
	dismiss?: KTToastAction | boolean; // Close button
	/** Toast variant */
	variant?: KTToastVariantType; // Toast variant
	/** Toast appearance */
	appearance?: KTToastAppearanceType; // Toast appearance
	/** Toast size */
	size?: KTToastSizeType; // Toast size
	/** Auto-dismiss duration (ms) */
	duration?: number; // Auto-dismiss duration (ms)
	/** Prevents auto-dismiss if true */
	important?: boolean; // Prevent auto-dismiss
	/** Called when auto-dismiss fires */
	onAutoClose?: (id: string) => void; // Called when auto-dismiss fires
	/** Called when toast is dismissed (manual or auto) */
	onDismiss?: (id: string) => void; // Called when toast is dismissed
	/** Toast position */
	position?: KTToastPosition; // Toast position
	/** Toast maxToasts */
	maxToasts?: number; // Max toasts allowed
	/** Prevents auto-dismiss when toast is focused */
	pauseOnHover?: boolean; // Pause auto-dismiss on hover
	/** Custom class for toast */
	className?: string; // Custom class for toast
	/** ARIA role */
	role?: string; // ARIA role
	/** Beep sound */
	beep?: boolean; // Beep sound
}

/**
 * Example: Set global config for all toasts
 *
 * import { KTToast } from './toast';
 *
 * KTToast.configToast({
 *   position: 'bottom-end', // Default position
 *   duration: 5000,        // Default auto-dismiss duration (ms)
 *   maxToasts: 3,          // Max toasts visible at once
 *   className: 'my-toast-root', // Custom class
 *   gap: 20,               // Gap between stacked toasts
 *   dismiss: true          // Show close button by default
 * });
 */
export interface KTToastConfig {
	classNames?: Partial<KTToastClassNames>; // Override internal class names
	position?: KTToastPosition; // Toast position
	duration?: number; // Auto-dismiss duration (ms)
	className?: string; // Custom class for toast root
	maxToasts?: number; // Max toasts at once
	offset?: number; // Offset from edge (px)
	gap?: number; // Gap between toasts (px)
	dismiss?: boolean; // Show close button
}

export interface KTToastInstance {
	id: string; // Toast unique ID
	element: HTMLElement; // Toast DOM element
	timeoutId: number; // Timer ID for auto-dismiss
}
