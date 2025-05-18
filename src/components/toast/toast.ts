/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import KTData from '../../helpers/data';
import KTUtils from '../../helpers/utils';
import {
	KTToastOptions,
	KTToastConfig,
	KTToastInstance,
	KTToastPosition,
} from './types';

const DEFAULT_CONFIG: KTToastConfig = {
	position: 'top-end',
	duration: 4000,
	className: '',
	maxToasts: 5,
	offset: 15,
	gap: 10,
};

const DEFAULT_TOAST_OPTIONS: KTToastOptions = {
	variant: 'primary',
	appearance: 'solid',
	progress: false,
	size: 'md',
	action: {
		label: 'Ok',
		className: 'kt-btn btn-sm btn-mono',
		onClick: () => {},
	},
	cancel: {
		label: 'Cancel',
		className: 'kt-btn btn-sm btn-outline',
		onClick: () => {},
	},
	dismiss: true,
};

import type { KTToastConfigInterface, KTToastInterface } from './types';

export class KTToast extends KTComponent implements KTToastInterface {
	protected override _name: string = 'toast';
	protected override _defaultConfig: KTToastConfigInterface = DEFAULT_CONFIG;
	protected override _config: KTToastConfigInterface = DEFAULT_CONFIG;
	protected _defaultToastOptions: KTToastOptions = DEFAULT_TOAST_OPTIONS;
	private static containerMap: Map<KTToastPosition, HTMLElement> = new Map();
	private static toasts: Map<string, KTToastInstance> = new Map();
	private static globalConfig: KTToastConfig = { ...DEFAULT_CONFIG };

	constructor(element: HTMLElement, config?: Partial<KTToastConfigInterface>) {
		super();
		if (KTData.has(element, this._name)) return;
		this._init(element);
		this._buildConfig(config);
		KTData.set(element, this._name, this);
	}

	// Instance API (for per-element toasts)
	public show(
		options?: KTToastOptions,
	): (KTToastInstance & { dismiss: () => void }) | undefined {
		const merged = KTUtils.merge(this._defaultToastOptions, options || {});

		if (!merged.message && !merged.content) {
			return undefined;
		}

		return KTToast.show(merged);
	}

	/**
	 * Hide this toast. Accepts id string or KTToastInstance.
	 */
	public hide(idOrInstance?: string | KTToastInstance): void {
		KTToast.close(idOrInstance);
	}

	public clearAll(): void {
		KTToast.clearAll();
	}

	public getElement(): HTMLElement {
		return this._element;
	}

	public getConfig(): KTToastConfigInterface {
		return this._config;
	}

	static getContent(options?: KTToastOptions) {
		if (options?.content) {
			if (typeof options.content === 'string') {
				return options.content;
			} else if (typeof options.content === 'function') {
				const node = options.content();
				if (node instanceof HTMLElement) {
					return node.outerHTML;
				}
			} else if (options.content instanceof HTMLElement) {
				return options.content.outerHTML;
			}
		}

		let template = '';

		if (options?.icon) {
			template += '<div class="kt-alert-icon">' + options.icon + '</div>';
		}

		if (options?.message) {
			template += '<div class="kt-alert-title">' + options.message + '</div>';
		}

		if (options?.action || options?.dismiss !== false || options?.cancel) {
			template += '<div class="kt-alert-toolbar">';

			if (options?.cancel && typeof options.cancel === 'object') {
				template +=
					'<button data-kt-toast-cancel="true" class="' +
					(options.cancel.className || '') +
					'">' +
					options.cancel.label +
					'</button>';
			}

			if (options?.action && typeof options.action === 'object') {
				template +=
					'<button data-kt-toast-action="true" class="' +
					(options.action.className || '') +
					'">' +
					options.action.label +
					'</button>';
			}

			if (options?.dismiss !== false) {
				template +=
					'<button data-kt-toast-dismiss="true" class="kt-alert-close"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
			}

			template += '</div>';
		}

		template += '</div>';

		return template;
	}

	// --- Static API --- //

	/**
	 * Reposition all toasts in the container with smooth animation
	 */
	static repositionToasts(container: HTMLElement | null, offset?: number) {
		if (!container) return;
		offset =
			typeof offset === 'number' ? offset : (this.globalConfig.offset ?? 15);
		requestAnimationFrame(() => {
			const gap = this.globalConfig.gap ?? 8;
			// Group toasts by alignment (top/bottom)
			const positionGroups: Record<string, HTMLElement[]> = {
				top: [],
				bottom: [],
			};
			const toasts = Array.from(container.children) as HTMLElement[];
			toasts.forEach((toast) => {
				if (
					toast.classList.contains('kt-toast-top-end') ||
					toast.classList.contains('kt-toast-top-center') ||
					toast.classList.contains('kt-toast-top-start')
				) {
					positionGroups.top.push(toast);
				} else {
					positionGroups.bottom.push(toast);
				}
			});

			// Stack top toasts from the top down
			let currentOffset = offset;
			positionGroups.top.forEach((toast) => {
				toast.style.top = `${currentOffset}px`;
				toast.style.bottom = '';
				toast.style.transition =
					'top 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s cubic-bezier(.4,0,.2,1)';
				currentOffset += toast.offsetHeight + gap;

				if (toast.classList.contains('kt-toast-top-start')) {
					toast.style.insetInlineStart = `${offset}px`;
				}

				if (toast.classList.contains('kt-toast-top-end')) {
					toast.style.insetInlineEnd = `${offset}px`;
				}
			});
			// Stack bottom toasts from the bottom up
			currentOffset = offset;
			for (let i = positionGroups.bottom.length - 1; i >= 0; i--) {
				const toast = positionGroups.bottom[i];
				toast.style.bottom = `${currentOffset}px`;
				toast.style.top = '';
				toast.style.transition =
					'bottom 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s cubic-bezier(.4,0,.2,1)';
				currentOffset += toast.offsetHeight + gap;

				if (toast.classList.contains('kt-toast-top-start')) {
					toast.style.insetInlineStart = `${offset}px`;
				}

				if (toast.classList.contains('kt-toast-top-end')) {
					toast.style.insetInlineEnd = `${offset}px`;
				}
			}
		});
	}

	static configToast(options: Partial<KTToastConfig>) {
		this.globalConfig = { ...this.globalConfig, ...options };
	}

	static show(
		options?: KTToastOptions,
	): (KTToastInstance & { dismiss: () => void }) | undefined {
		if (!options || (!options.message && !options.content)) {
			return undefined;
		}

		const id =
			options.id ||
			`kt-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		const position =
			options.position || this.globalConfig.position || 'top-end';

		const classNames = {
			...((this.globalConfig.classNames as any) || {}),
			...((options.classNames as any) || {}),
		};

		let container = this.containerMap.get(position);

		if (!container) {
			container = document.createElement('div');
			const classNames = {
				...((this.globalConfig.classNames as any) || {}),
				...((options.classNames as any) || {}),
			};
			// Fallback to default hardcoded classes if not provided in options or globalConfig
			container.className =
				classNames.container || `kt-toast-container ${position}`;
			document.body.appendChild(container);
			this.containerMap.set(position, container);
		}

		// Enforce maxToasts
		if (
			container.children.length >=
			(this.globalConfig.maxToasts || DEFAULT_CONFIG.maxToasts)
		) {
			const firstToast = container.firstElementChild;
			if (firstToast) {
				firstToast.classList.add('kt-toast-closing');
				firstToast.addEventListener('animationend', () => {
					firstToast.remove();
				});
			}
		}

		// Create toast element
		const variantMap = {
			info: 'kt-alert-info',
			success: 'kt-alert-success',
			error: 'kt-alert-error',
			warning: 'kt-alert-warning',
			primary: 'kt-alert-primary',
			secondary: 'kt-alert-secondary',
			destructive: 'kt-alert-destructive',
			mono: 'kt-alert-mono',
		};

		const appearanceMap = {
			solid: 'kt-alert-solid',
			outline: 'kt-alert-outline',
			light: 'kt-alert-light',
		};

		const sizeMap = {
			sm: 'kt-alert-sm',
			md: 'kt-alert-md',
			lg: 'kt-alert-lg',
		};

		const toast = document.createElement('div');
		toast.className =
			classNames.toast ||
			`kt-toast kt-alert ${variantMap[options.variant]} ${appearanceMap[options.appearance]} ${sizeMap[options.size]} ${options.className || ''}`;
		// ARIA support
		toast.setAttribute('role', options.role || 'status');
		toast.setAttribute('aria-live', 'polite');
		toast.setAttribute('aria-atomic', 'true');
		toast.setAttribute('tabindex', '0');

		// Set unique toast id for event handlers
		if (options.id) {
			toast.setAttribute('data-kt-toast-id', options.id);
		} else {
			const toastId = `kt-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			toast.setAttribute('data-kt-toast-id', toastId);
			options.id = toastId;
		}

		// Populate content via getContent
		const contentHtml = KTToast.getContent(options);
		toast.innerHTML = contentHtml;

		// Assign event handlers to buttons by data attribute
		const actionBtn = toast.querySelector(
			'[data-kt-toast-action]',
		) as HTMLButtonElement | null;

		if (
			actionBtn &&
			options.action &&
			typeof options.action === 'object' &&
			options.action.onClick
		) {
			actionBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (typeof options.action === 'object' && options.action.onClick) {
					options.action.onClick(id);
					KTToast.close(id);
				}
			});
		}

		const cancelBtn = toast.querySelector(
			'[data-kt-toast-cancel]',
		) as HTMLButtonElement | null;

		if (cancelBtn && options.cancel && typeof options.cancel === 'object') {
			cancelBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (typeof options.cancel === 'object' && options.cancel.onClick) {
					options.cancel.onClick(id);
					KTToast.close(id);
				}
			});
		}

		// Dismiss button handler
		const dismissBtn = toast.querySelector(
			'[data-kt-toast-dismiss]',
		) as HTMLButtonElement | null;

		if (dismissBtn && options.dismiss !== false) {
			dismissBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				KTToast.close(id);
			});
		}

		// If modal-like, set aria-modal
		if (options.important) toast.setAttribute('aria-modal', 'true');
		toast.style.pointerEvents = 'auto';

		// Progress line
		const duration = options.important
			? null
			: (options.duration ??
				this.globalConfig.duration ??
				DEFAULT_CONFIG.duration);

		if (duration && options.progress) {
			const progress = document.createElement('div');
			progress.className = classNames.progress || 'kt-toast-progress';
			progress.style.animationDuration = duration + 'ms';
			toast.appendChild(progress);
		}

		// Assign direction class to the toast itself, not the container
		const directionClassMap: Record<string, string> = {
			'top-end': 'kt-toast-top-end',
			'top-center': 'kt-toast-top-center',
			'top-start': 'kt-toast-top-start',
			'bottom-end': 'kt-toast-bottom-end',
			'bottom-center': 'kt-toast-bottom-center',
			'bottom-start': 'kt-toast-bottom-start',
		};
		Object.values(directionClassMap).forEach((cls) =>
			toast.classList.remove(cls),
		);
		const dirClass = directionClassMap[position] || 'kt-toast-top-end';
		toast.classList.add(dirClass);

		// Insert toast at the top
		container.insertBefore(toast, container.firstChild);
		KTToast.repositionToasts(container);

		KTToast._fireEventOnElement(toast, 'show', { id });
		KTToast._dispatchEventOnElement(toast, 'show', { id });
		const instance: KTToastInstance = { id, element: toast, timeoutId: 0 };
		KTToast.toasts.set(id, instance);

		// Auto-dismiss
		let timeoutId: number | undefined = undefined;
		if (duration) {
			timeoutId = window.setTimeout(() => {
				options.onAutoClose?.(id);
				KTToast.close(id);
			}, duration);
			instance.timeoutId = timeoutId;
		}

		KTToast._fireEventOnElement(toast, 'shown', { id });
		KTToast._dispatchEventOnElement(toast, 'shown', { id });

		return {
			...instance,
			dismiss: () => KTToast.close(id),
		};
	}

	/**
	 * Close a toast by id or instance.
	 */
	static close(idOrInstance?: string | KTToastInstance) {
		let inst: (KTToastInstance & { _closing?: boolean }) | undefined;
		let id: string | undefined;
		if (!idOrInstance) return;
		if (typeof idOrInstance === 'string') {
			id = idOrInstance;
			inst = this.toasts.get(id);
			console.log('this.toasts', this.toasts.get(id));
		} else if (typeof idOrInstance === 'object' && idOrInstance.id) {
			id = idOrInstance.id;
			inst = idOrInstance as KTToastInstance & { _closing?: boolean };
		}

		if (!inst || !id) return;
		if (inst._closing) return; // Prevent double-close
		inst._closing = true;

		clearTimeout(inst.timeoutId);
		KTToast._fireEventOnElement(inst.element, 'hide', { id });
		KTToast._dispatchEventOnElement(inst.element, 'hide', { id });
		inst.element.style.animation = 'kt-toast-out 0.25s forwards';

		setTimeout(() => {
			inst?.element.remove();
			KTToast.repositionToasts(
				inst?.element.parentElement as HTMLElement | null,
			);
			KTToast.toasts.delete(id!);
			// Try to call onDismiss if available in the toast instance (if stored)
			if (typeof (inst as any).options?.onDismiss === 'function') {
				(inst as any).options.onDismiss(id);
			}
			KTToast._fireEventOnElement(inst.element, 'hidden', { id });
			KTToast._dispatchEventOnElement(inst.element, 'hidden', { id });
		}, 250);
	}

	/**
	 * Clear all toasts.
	 */
	static clearAll() {
		for (const id of Array.from(this.toasts.keys())) {
			this.close(id);
		}
	}

	private static _fireEventOnElement(
		element: HTMLElement,
		eventType: string,
		payload?: object,
	) {
		const event = new CustomEvent(`kt.toast.${eventType}`, { detail: payload });
		element.dispatchEvent(event);
	}

	private static _dispatchEventOnElement(
		element: HTMLElement,
		eventType: string,
		payload?: object,
	) {
		const event = new CustomEvent(eventType, { detail: payload });
		element.dispatchEvent(event);
	}

	public static init(): void {}
}
