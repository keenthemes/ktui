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
	public show(options: KTToastOptions): string {
		return KTToast.show({ ...this._config, ...options });
	}

	public hide(id: string): void {
		KTToast.close(id);
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

	static show(options: KTToastOptions): string {
		const id =
			options.id ||
			`kt-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const position =
			options.position || this.globalConfig.position || 'top-right';
		let container = this.containerMap.get(position);
		if (!container) {
			container = document.createElement('div');
			container.className = `kt-toast-container ${position}`;
			document.body.appendChild(container);
			this.containerMap.set(position, container);
		}
		// Enforce maxToasts
		while (
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
		toast.className = `kt-toast${options.type ? ' ' + options.type : ''}${options.className ? ' ' + options.className : ''}${this.globalConfig.className ? ' ' + this.globalConfig.className : ''}${options.invert ? ' kt-toast-invert' : ''}`;
		// ARIA support
		toast.setAttribute('role', options.role || 'status');
		toast.setAttribute('aria-live', 'polite');
		toast.setAttribute('aria-atomic', 'true');
		toast.setAttribute('tabindex', '0');
		// If modal-like, set aria-modal
		if (options.important) toast.setAttribute('aria-modal', 'true');
		toast.style.pointerEvents = 'auto';
		if (options.style) Object.assign(toast.style, options.style);
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
				iconNode.classList.add('kt-toast-icon');
				toast.appendChild(iconNode);
			}
		}
		// Toast content (message)
		let contentWrapper = document.createElement('div');
		contentWrapper.className = 'kt-toast-content';
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
				descNode.classList.add('kt-toast-description');
				contentWrapper.appendChild(descNode);
			}
		}
		toast.appendChild(contentWrapper);
		// Action button
		if (options.action) {
			const actionBtn = document.createElement('button');
			actionBtn.className =
				'kt-toast-action' +
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
				'kt-toast-cancel' +
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
			closeBtn.className = 'kt-toast-close';
			closeBtn.innerHTML = '&times;';
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
		if (duration) {
			const progress = document.createElement('div');
			progress.className = 'kt-toast-progress';
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
		this.toasts.set(id, { id, element: toast, timeoutId: timeoutId || 0 });
		// Dismissible
		if (options.dismissible !== false) {
			toast.onclick = () => KTToast.close(id);
		}
		KTToast._fireEventOnElement(toast, 'shown', { id });
		KTToast._dispatchEventOnElement(toast, 'shown', { id });
		return id;
	}

	static close(id: string) {
		const inst = this.toasts.get(id);
		if (!inst) return;
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

	// Instance management for per-element toasts
	static getInstance(element: HTMLElement): KTToast {
		if (!element) return null;
		if (KTData.has(element, 'toast')) {
			return KTData.get(element, 'toast') as KTToast;
		}
		if (element.getAttribute('data-kt-toast')) {
			return new KTToast(element);
		}
		return null;
	}

	static getOrCreateInstance(
		element: HTMLElement,
		config?: Partial<KTToastConfig>,
	): KTToast {
		return this.getInstance(element) || new KTToast(element, config);
	}

	static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-toast]');
		elements.forEach((element) => {
			new KTToast(element as HTMLElement);
		});
	}

	static handleDelegatedEvents(): void {
		KTEventHandler.on(
			document.body,
			'[data-kt-toast-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.stopPropagation();
				const selector = target.getAttribute('data-kt-toast-toggle');
				if (!selector) return;
				const toastElement = document.querySelector(selector) as HTMLElement;
				const toast = KTToast.getInstance(toastElement);
				if (toast) {
					toast.show({
						message: '',
					});
				}
			},
		);
		KTEventHandler.on(
			document.body,
			'[data-kt-toast-dismiss]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.stopPropagation();
				const toastElement = target.closest('[data-kt-toast]') as HTMLElement;
				if (toastElement) {
					const toast = KTToast.getInstance(toastElement);
					if (toast) {
						// Only close this toast, not all
						toast.hide?.(toastElement.id || '');
					}
				}
			},
		);
	}

	static init(): void {
		KTToast.createInstances();
		KTToast.handleDelegatedEvents();
	}
}
