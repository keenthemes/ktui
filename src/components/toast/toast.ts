/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTComponent from '../component';
import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import {
	KTToastOptions,
	KTToastConfig,
	KTToastInstance,
	KTToastPosition,
} from './types';

const DEFAULT_CONFIG: KTToastConfig = {
	position: 'top-right',
	duration: 4000,
	className: '',
	maxToasts: 5,
};

import type { KTToastConfigInterface, KTToastInterface } from './types';

export class KTToast extends KTComponent implements KTToastInterface {
	protected override _name: string = 'toast';
	protected override _defaultConfig: KTToastConfigInterface = DEFAULT_CONFIG;
	protected override _config: KTToastConfigInterface = DEFAULT_CONFIG;
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
		const merged = { ...this._config, ...(options || {}) };
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

	// --- Static API --- //
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
			options.position || this.globalConfig.position || 'top-right';
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
		const toast = document.createElement('div');
		toast.className =
			classNames.toast ||
			`kt-toast${options.type ? ' ' + options.type : ''}${options.className ? ' ' + options.className : ''}${this.globalConfig.className ? ' ' + this.globalConfig.className : ''}${options.invert ? ' kt-toast-invert' : ''}`;
		// ARIA support
		toast.setAttribute('role', options.role || 'status');
		toast.setAttribute('aria-live', 'polite');
		toast.setAttribute('aria-atomic', 'true');
		toast.setAttribute('tabindex', '0');
		// If modal-like, set aria-modal
		if (options.important) toast.setAttribute('aria-modal', 'true');
		toast.style.pointerEvents = 'auto';

		// --- CUSTOM CONTENT SUPPORT ---
		if (options.content) {
			let customContent: HTMLElement | null = null;
			if (typeof options.content === 'function') {
				const node = options.content();
				if (node instanceof HTMLElement) customContent = node;
			} else if (typeof options.content === 'string') {
				const dom = document.getElementById(options.content);
				if (dom instanceof HTMLElement) {
					customContent = dom.cloneNode(true) as HTMLElement;
				} else {
					// treat as raw HTML string
					const wrapper = document.createElement('div');
					wrapper.innerHTML = options.content;
					customContent = wrapper.firstElementChild as HTMLElement;
				}
			} else if (options.content instanceof HTMLElement) {
				customContent = options.content.cloneNode(true) as HTMLElement;
			}
			if (customContent) {
				toast.appendChild(customContent);
				container.appendChild(toast);
				KTToast._fireEventOnElement(toast, 'show', { id });
				KTToast._dispatchEventOnElement(toast, 'show', { id });
				const instance: KTToastInstance = { id, element: toast, timeoutId: 0 };
				this.toasts.set(id, instance);
				return {
					...instance,
					dismiss: () => KTToast.close(id),
				};
			}
		}

		// Icon
		if (options.icon) {
			let iconNode: HTMLElement | null = null;
			if (typeof options.icon === 'string') {
				iconNode = document.createElement('span');
				iconNode.innerHTML = options.icon;
			} else if (typeof options.icon === 'function') {
				const node = options.icon();
				if (node instanceof HTMLElement) iconNode = node;
			} else if (options.icon instanceof HTMLElement) {
				iconNode = options.icon;
			}
			if (iconNode) {
				iconNode.className = classNames.icon || 'kt-toast-icon';
				toast.appendChild(iconNode);
			}
		}
		// Toast content (message)
		let contentWrapper = document.createElement('div');
		contentWrapper.className = classNames.content || 'kt-toast-content';
		// Main message
		if (typeof options.message === 'string') {
			const message = document.createElement('div');
			message.textContent = options.message;
			message.className = 'kt-toast-message';
			contentWrapper.appendChild(message);
		} else if (typeof options.message === 'function') {
			const node = options.message();
			if (node instanceof HTMLElement) contentWrapper.appendChild(node);
		} else if (options.message instanceof HTMLElement) {
			contentWrapper.appendChild(options.message);
		}
		// Description
		if (options.description) {
			let descNode: HTMLElement | null = null;
			if (typeof options.description === 'string') {
				descNode = document.createElement('div');
				descNode.textContent = options.description;
			} else if (typeof options.description === 'function') {
				const node = options.description();
				if (node instanceof HTMLElement) descNode = node;
			} else if (options.description instanceof HTMLElement) {
				descNode = options.description;
			}
			if (descNode) {
				descNode.className = classNames.description || 'kt-toast-description';
				contentWrapper.appendChild(descNode);
			}
		}
		toast.appendChild(contentWrapper);
		// Action button
		if (options.action) {
			const actionBtn = document.createElement('button');
			actionBtn.className =
				(classNames.action || 'kt-toast-action') +
				(options.action.className ? ' ' + options.action.className : '');
			actionBtn.textContent = options.action.label;
			actionBtn.onclick = (e) => {
				e.stopPropagation();
				options.action?.onClick(id);
				KTToast._fireEventOnElement(toast, 'action', { id });
				KTToast._dispatchEventOnElement(toast, 'action', { id });
				KTToast.close(id);
			};
			toast.appendChild(actionBtn);
		}
		// Cancel button
		if (options.cancel) {
			const cancelBtn = document.createElement('button');
			cancelBtn.className =
				(classNames.cancel || 'kt-toast-cancel') +
				(options.cancel.className ? ' ' + options.cancel.className : '');
			cancelBtn.textContent = options.cancel.label;
			cancelBtn.onclick = (e) => {
				e.stopPropagation();
				options.cancel?.onClick(id);
				KTToast._fireEventOnElement(toast, 'cancel', { id });
				KTToast._dispatchEventOnElement(toast, 'cancel', { id });
				KTToast.close(id);
			};
			toast.appendChild(cancelBtn);
		}
		// Close button
		if (options.closeButton !== false) {
			const closeBtn = document.createElement('button');
			closeBtn.className = classNames.close || 'kt-toast-close';
			closeBtn.innerHTML = `<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

			closeBtn.onclick = (e) => {
				e.stopPropagation();
				KTToast.close(id);
			};
			toast.appendChild(closeBtn);
		}
		// Progress line
		const duration = options.important
			? null
			: (options.duration ??
				this.globalConfig.duration ??
				DEFAULT_CONFIG.duration);
		const showProgress = options.progress !== false; // default true
		if (duration && showProgress) {
			const progress = document.createElement('div');
			progress.className = classNames.progress || 'kt-toast-progress';
			progress.style.animationDuration = duration + 'ms';
			toast.appendChild(progress);
		}
		// Animate out on close
		toast.addEventListener('kt.toast.close', () => {
			toast.style.animation = 'kt-toast-out 0.25s forwards';
			setTimeout(() => {
				toast.remove();
				this.toasts.delete(id);
				options.onDismiss?.(id);
				KTToast._fireEventOnElement(toast, 'hidden', { id });
				KTToast._dispatchEventOnElement(toast, 'hidden', { id });
			}, 250);
		});
		// Insert toast
		container.appendChild(toast);
		KTToast._fireEventOnElement(toast, 'show', { id });
		KTToast._dispatchEventOnElement(toast, 'show', { id });
		// Auto-dismiss
		let timeoutId: number | undefined = undefined;
		if (duration) {
			timeoutId = window.setTimeout(() => {
				options.onAutoClose?.(id);
				KTToast.close(id);
			}, duration);
		}
		// Store instance
		const instance: KTToastInstance = {
			id,
			element: toast,
			timeoutId: timeoutId || 0,
		};
		this.toasts.set(id, instance);
		// Dismissible
		if (options.dismissible !== false) {
			toast.onclick = () => KTToast.close(id);
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
		let inst: KTToastInstance | undefined;
		let id: string | undefined;
		if (!idOrInstance) return;
		if (typeof idOrInstance === 'string') {
			id = idOrInstance;
			inst = this.toasts.get(id);
		} else if (typeof idOrInstance === 'object' && idOrInstance.id) {
			id = idOrInstance.id;
			inst = idOrInstance;
		}
		if (!inst || !id) return;
		clearTimeout(inst.timeoutId);
		KTToast._fireEventOnElement(inst.element, 'hide', { id });
		KTToast._dispatchEventOnElement(inst.element, 'hide', { id });
		inst.element.dispatchEvent(new CustomEvent('kt.toast.close'));
	}

	static clearAll() {
		for (const id of Array.from(this.toasts.keys())) {
			this.close(id);
		}
	}

	// Helper: fire event on toast element (for static context)
	private static _fireEventOnElement(
		element: HTMLElement,
		eventType: string,
		payload?: object,
	) {
		// For future: integrate with KTComponent event system if needed
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

	static init(): void {}
}
