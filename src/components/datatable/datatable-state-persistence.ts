/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTDataTableStateInterface } from './types';

export interface KTDataTableStatePersistence {
	save(namespace: string, state: KTDataTableStateInterface): void;
	load(namespace: string): KTDataTableStateInterface | null;
	remove(namespace: string): void;
}

export function createStatePersistence(): KTDataTableStatePersistence {
	function save(namespace: string, state: KTDataTableStateInterface): void {
		if (namespace) {
			localStorage.setItem(namespace, JSON.stringify(state));
		}
	}

	function load(namespace: string): KTDataTableStateInterface | null {
		const stateString = localStorage.getItem(namespace);
		if (!stateString) return null;

		try {
			return JSON.parse(stateString) as KTDataTableStateInterface;
		} catch {
			return null;
		}
	}

	function remove(namespace: string): void {
		if (namespace) {
			localStorage.removeItem(namespace);
		}
	}

	return { save, load, remove };
}

/**
 * Resolve the namespace for a datatable state key.
 * Priority: config.stateNamespace > table element ID > root element ID > fallback name.
 */
export function resolveTableNamespace(
	config: { stateNamespace?: string },
	tableElement: HTMLTableElement | null,
	rootElement: HTMLElement | null,
	fallbackName: string,
): string {
	if (config.stateNamespace) {
		return config.stateNamespace;
	}
	const tableIdAttr = tableElement?.getAttribute('id');
	if (tableIdAttr) return tableIdAttr;
	const rootIdAttr = rootElement?.getAttribute('id');
	if (rootIdAttr) return rootIdAttr;
	return fallbackName;
}
