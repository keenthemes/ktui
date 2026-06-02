/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';

type DataTableInstance = {
	dispose(): void;
};

export interface KTDataTableRegistry<T extends DataTableInstance> {
	register(element: HTMLElement, instance: T): void;
	get(element: HTMLElement): T | undefined;
	remove(element: HTMLElement): void;
	clear(): void;
	createAll(factory: (element: HTMLElement) => T): void;
	reinit(factory: (element: HTMLElement) => T): void;
}

export function createDataTableRegistry<
	T extends DataTableInstance,
>(): KTDataTableRegistry<T> {
	type ElementWithInstance = HTMLElement & { instance?: T };
	const instances = new Map<HTMLElement, T>();

	function toElementWithInstance(element: HTMLElement): ElementWithInstance {
		return element as ElementWithInstance;
	}

	function register(element: HTMLElement, instance: T): void {
		instances.set(element, instance);
		toElementWithInstance(element).instance = instance;
	}

	function get(element: HTMLElement): T | undefined {
		return instances.get(element) ?? toElementWithInstance(element).instance;
	}

	function remove(element: HTMLElement): void {
		instances.delete(element);
		const el = toElementWithInstance(element);
		if (el.instance) delete el.instance;
	}

	function clear(): void {
		instances.clear();
	}

	function createAll(factory: (element: HTMLElement) => T): void {
		if (typeof document === 'undefined') return;
		const elements = document.querySelectorAll<HTMLElement>(
			'[data-kt-datatable="true"]',
		);
		elements.forEach((element) => {
			if (
				element.hasAttribute('data-kt-datatable') &&
				!element.classList.contains('datatable-initialized')
			) {
				const instance = factory(element);
				register(element, instance);
			}
		});
	}

	function reinit(factory: (element: HTMLElement) => T): void {
		if (typeof document === 'undefined') return;
		const elements = document.querySelectorAll<HTMLElement>(
			'[data-kt-datatable="true"]',
		);
		elements.forEach((element) => {
			try {
				const instance = get(element);
				if (instance && typeof instance.dispose === 'function') {
					instance.dispose();
				}
				KTData.remove(element, 'datatable');
				element.removeAttribute('data-kt-datatable-initialized');
				element.classList.remove('datatable-initialized');
			} catch {
				// ignore per-element errors
			}
		});
		clear();
		createAll(factory);
	}

	return { register, get, remove, clear, createAll, reinit };
}
