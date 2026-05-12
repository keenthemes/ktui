/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

// Checkbox logic for KTDataTable

import {
	KTDataTableConfigInterface,
	KTDataTableCheckChangePayloadInterface,
	KTDataTableStateInterface,
} from './types';
import KTEventHandler from '../../helpers/event-handler';
import { KTCallableType } from '../../types';

export interface KTDataTableCheckboxAPI {
	init(): void;
	check(): void;
	uncheck(): void;
	toggle(): void;
	isChecked(): boolean;
	getChecked(): string[];
	updateState(): void;
}

// Main function to create checkbox logic for a datatable instance
export function createCheckboxHandler(
	element: HTMLElement,
	config: KTDataTableConfigInterface,
	fireEvent: (eventName: string, eventData?: object) => void,
): KTDataTableCheckboxAPI {
	let headerChecked = false;
	let headerCheckElement: HTMLInputElement | null = null;
	let targetElements: NodeListOf<HTMLInputElement> | null = null;

	// Default: preserve selection across all pages
	const preserveSelection = config.checkbox?.preserveSelection !== false;

	function ensureState(): KTDataTableStateInterface {
		let state = config._state;
		if (!state) {
			state = {} as KTDataTableStateInterface;
			config._state = state;
		}
		return state;
	}

	// Helper: get selectedRows from state, always as string[]
	function getSelectedRows(): string[] {
		const state = ensureState();
		if (!Array.isArray(state.selectedRows)) state.selectedRows = [];
		return state.selectedRows.map(String);
	}

	// Helper: set selectedRows in state
	function setSelectedRows(rows: string[]) {
		const state = ensureState();
		state.selectedRows = Array.from(new Set(rows.map(String)));
	}

	// Helper: get all visible row IDs (values)
	function getVisibleRowIds(): string[] {
		if (!targetElements) return [];
		return Array.from(targetElements)
			.map((el) => el.value)
			.filter((v) => v != null && v !== '');
	}

	// Listener for header checkbox
	const checkboxListener = (event: MouseEvent) => {
		checkboxToggle(event);
	};

	function init() {
		const attrs = config.attributes;
		if (!attrs?.check || !attrs.checkbox) {
			return;
		}
		headerCheckElement = element.querySelector<HTMLInputElement>(attrs.check);
		if (!headerCheckElement) return;
		headerChecked = headerCheckElement.checked;
		targetElements = element.querySelectorAll<HTMLInputElement>(attrs.checkbox);
		checkboxHandler();
		reapplyCheckedStates();
		updateHeaderCheckboxState();
	}

	function checkboxHandler() {
		if (!headerCheckElement) return;
		const rowCheckboxSelector = config.attributes?.checkbox;
		if (!rowCheckboxSelector) return;
		headerCheckElement.addEventListener('click', checkboxListener);
		KTEventHandler.on(
			document.body,
			rowCheckboxSelector,
			'input',
			((event?: Event) => {
				if (event) handleRowCheckboxChange(event);
			}) as KTCallableType,
		);
	}

	// When a row checkbox is changed
	function handleRowCheckboxChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input) return;
		const value = input.value;
		let selectedRows = getSelectedRows();
		const wasChecked = selectedRows.includes(value);
		const isNowChecked = input.checked;

		// Update state first
		if (isNowChecked) {
			if (!wasChecked) selectedRows.push(value);
		} else {
			selectedRows = selectedRows.filter((v) => v !== value);
		}
		setSelectedRows(selectedRows);
		updateHeaderCheckboxState();

		// Fire specific checked/unchecked events after state is updated
		if (isNowChecked && !wasChecked) {
			fireEvent('checked');
		} else if (!isNowChecked && wasChecked) {
			fireEvent('unchecked');
		}

		// Always fire changed event for backward compatibility
		fireEvent('changed');
	}

	// When the header checkbox is toggled
	function checkboxToggle(_event?: Event) {
		const checked = !isChecked();
		// Update state first, then fire events
		change(checked);
		// Fire checked/unchecked events after state is updated
		const eventType = checked ? 'checked' : 'unchecked';
		fireEvent(eventType);
	}

	// Change all visible checkboxes and update selectedRows
	function change(checked: boolean) {
		const payload: KTDataTableCheckChangePayloadInterface = { cancel: false };
		fireEvent('change', payload);
		if (payload.cancel === true) return;
		headerChecked = checked;
		if (headerCheckElement) headerCheckElement.checked = checked;
		if (targetElements) {
			const visibleIds = getVisibleRowIds();
			let selectedRows = getSelectedRows();
			if (checked) {
				// Add all visible IDs to selectedRows
				selectedRows = preserveSelection
					? Array.from(new Set([...selectedRows, ...visibleIds]))
					: visibleIds;
			} else {
				// Remove all visible IDs from selectedRows
				selectedRows = preserveSelection
					? selectedRows.filter((v) => !visibleIds.includes(v))
					: [];
			}
			setSelectedRows(selectedRows);
			// Update visible checkboxes
			targetElements.forEach((element: HTMLInputElement) => {
				if (element) {
					element.checked = checked;
				}
			});
		}
		updateHeaderCheckboxState();
		fireEvent('changed');
	}

	// Reapply checked state to visible checkboxes based on selectedRows
	function reapplyCheckedStates() {
		const selectedRows = getSelectedRows();
		if (!targetElements) return;
		targetElements.forEach((element: HTMLInputElement) => {
			if (!element) return;
			const value = element.value;
			element.checked = selectedRows.includes(value);
			// Update row class
			const row = element.closest('tr');
			if (row && config.checkbox?.checkedClass) {
				if (element.checked) {
					row.classList.add(config.checkbox.checkedClass);
				} else {
					row.classList.remove(config.checkbox.checkedClass);
				}
			}
		});
	}

	// Update header checkbox state (checked/indeterminate/unchecked)
	function updateHeaderCheckboxState() {
		if (!headerCheckElement || !targetElements) return;
		const total = targetElements.length;
		let checked = 0;
		for (let i = 0; i < total; i++) {
			if (targetElements[i].checked) checked++;
		}
		if (checked === 0) {
			headerCheckElement.indeterminate = false;
			headerCheckElement.checked = false;
			headerChecked = false;
		} else if (checked > 0 && checked < total) {
			headerCheckElement.indeterminate = true;
			headerCheckElement.checked = false;
			headerChecked = false;
		} else if (checked === total) {
			headerCheckElement.indeterminate = false;
			headerCheckElement.checked = true;
			headerChecked = true;
		}
	}

	// Fix: isChecked() implementation
	function isChecked(): boolean {
		return headerChecked;
	}

	function getChecked(): string[] {
		return getSelectedRows();
	}

	function check() {
		change(true);
		reapplyCheckedStates();
		updateHeaderCheckboxState();
	}

	function uncheck() {
		change(false);
		reapplyCheckedStates();
		updateHeaderCheckboxState();
	}

	function toggle() {
		checkboxToggle();
		reapplyCheckedStates();
		updateHeaderCheckboxState();
	}

	function updateState() {
		const rowCheckSel = config.attributes?.checkbox;
		if (!rowCheckSel) {
			return;
		}
		targetElements = element.querySelectorAll<HTMLInputElement>(rowCheckSel);
		reapplyCheckedStates();
		updateHeaderCheckboxState();
	}

	return {
		init,
		check,
		uncheck,
		toggle,
		isChecked,
		getChecked,
		updateState,
	};
}
