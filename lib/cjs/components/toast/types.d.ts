/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/**
 * Toast variant types
 */
export type KTToastVariantType = 'info' | 'success' | 'error' | 'warning' | 'primary' | 'secondary' | 'destructive' | 'mono';
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
export type KTToastPosition = 'top-end' | 'top-center' | 'top-start' | 'bottom-end' | 'bottom-center' | 'bottom-start';
/**
 * Toast action interface
 */
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
    container?: string;
    toast?: string;
    icon?: string;
    message?: string;
    toolbar?: string;
    actions?: string;
}
/**
 * Toast configuration
 * @property offset - The vertical offset (in px) from the edge of the screen for stacking toasts.
 */
export interface KTToastConfigInterface {
    classNames?: Partial<KTToastClassNames>;
    position?: KTToastPosition;
    duration?: number;
    className?: string;
    maxToasts?: number;
    offset?: number;
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
    progress?: boolean;
}
export interface KTToastInterface {
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
    /** Toast maxToasts */
    maxToasts?: number;
    /** Prevents auto-dismiss when toast is focused */
    pauseOnHover?: boolean;
    /** Custom class for toast */
    className?: string;
    /** ARIA role */
    role?: string;
    /** Beep sound */
    beep?: boolean;
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
//# sourceMappingURL=types.d.ts.map