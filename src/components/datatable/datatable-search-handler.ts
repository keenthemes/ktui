/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/**
 * Search binding utilities for KTDataTable.
 * Manages debounced search input binding and cleanup.
 */

type SearchElementWithDebounce = HTMLInputElement & {
	_debouncedSearch?: EventListener;
};

export interface KTDataTableSearchHandler {
	attach(
		tableId: string,
		currentSearch: string | object | undefined,
		delay: number,
		onSearch: (query: string) => void,
	): void;
	detach(tableId: string): void;
}

export function createSearchHandler(): KTDataTableSearchHandler {
	function findSearchElement(tableId: string): HTMLInputElement | null {
		return document.querySelector<HTMLInputElement>(
			`[data-kt-datatable-search="#${tableId}"]`,
		);
	}

	function asSearchElementWithDebounce(
		element: HTMLInputElement,
	): SearchElementWithDebounce {
		return element as SearchElementWithDebounce;
	}

	function debounce<TArgs extends unknown[]>(
		func: (...args: TArgs) => void,
		wait: number,
	): (...args: TArgs) => void {
		let timeout: number | undefined;
		return function (...args: TArgs) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = window.setTimeout(later, wait);
		};
	}

	function attach(
		tableId: string,
		currentSearch: string | object | undefined,
		delay: number,
		onSearch: (query: string) => void,
	): void {
		const searchElement = findSearchElement(tableId);
		if (!searchElement) return;

		// Restore search value from state
		if (currentSearch !== undefined && currentSearch !== null) {
			searchElement.value =
				typeof currentSearch === 'string'
					? currentSearch
					: String(currentSearch);
		}

		// Remove existing debounced listener if any
		const el = asSearchElementWithDebounce(searchElement);
		if (el._debouncedSearch) {
			searchElement.removeEventListener('keyup', el._debouncedSearch);
		}

		// Create and attach new debounced search
		const debouncedSearch = debounce(() => {
			onSearch(searchElement.value);
		}, delay);

		el._debouncedSearch = debouncedSearch;
		searchElement.addEventListener('keyup', debouncedSearch);
	}

	function detach(tableId: string): void {
		const searchElement = findSearchElement(tableId);
		if (!searchElement) return;

		const el = asSearchElementWithDebounce(searchElement);
		if (el._debouncedSearch) {
			searchElement.removeEventListener('keyup', el._debouncedSearch);
			delete el._debouncedSearch;
		}
	}

	return { attach, detach };
}
