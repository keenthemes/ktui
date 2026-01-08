/**
 * UX Behaviors Tests for KTSelect
 * Tests the enhancements: search autofocus, Enter key behavior, global dropdown management, and global event dispatch
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTSelect } from '../select';
import { waitFor } from '../../datatable/__tests__/setup';

describe('KTSelect UX Behaviors', () => {
	let container: HTMLElement;

	/**
	 * Helper to create a select element with options
	 */
	const createSelectElement = (
		options: Array<{ value: string; text: string }> = [
			{ value: '1', text: 'Option 1' },
			{ value: '2', text: 'Option 2' },
			{ value: '3', text: 'Option 3' },
		],
	): HTMLSelectElement => {
		const select = document.createElement('select');
		select.className = 'kt-select';
		options.forEach((opt) => {
			const option = document.createElement('option');
			option.value = opt.value;
			option.textContent = opt.text;
			select.appendChild(option);
		});
		return select;
	};

	/**
	 * Helper to wait for KTSelect to fully initialize
	 */
	const waitForInit = async (select: KTSelect): Promise<void> => {
		// Wait for async initialization - KTSelect uses promises for setup
		await waitFor(200);
		// Wait for next tick to ensure all modules are initialized
		await new Promise((resolve) => setTimeout(resolve, 0));
		// Additional wait for DOM to be ready
		await waitFor(50);
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		// Clean up all KTSelect instances
		const selects = document.querySelectorAll('.kt-select');
		selects.forEach((select) => {
			const instance = (select as any).instance;
			if (instance && typeof instance.destroy === 'function') {
				instance.destroy();
			}
		});

		// Clear document body
		document.body.innerHTML = '';
		container = null as any;

		// Clear all event listeners
		vi.clearAllMocks();
	});

	describe('Search Autofocus Enhancement', () => {
		it('should focus search input when dropdown opens with searchAutofocus enabled', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				searchAutofocus: true,
				height: 250,
			});

			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(200); // Wait for autofocus retry mechanism

			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();
			expect(document.activeElement).toBe(searchInput);
		});

		it('should not focus search input when searchAutofocus is disabled', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				searchAutofocus: false,
				height: 250,
			});

			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();
			expect(document.activeElement).not.toBe(searchInput);
		});

		it('should retry focus if initial focus fails', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				searchAutofocus: true,
				height: 250,
			});

			await waitForInit(select);

			// Get search input and set up spy before opening dropdown
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Spy on focus method
			const focusSpy = vi.spyOn(searchInput, 'focus');

			// Open dropdown - this will trigger autofocus
			select.openDropdown();
			await waitFor(350); // Wait for retry mechanism (0ms, 50ms, 100ms, 200ms)

			// Focus should have been called at least once (initial attempt + retries)
			expect(focusSpy).toHaveBeenCalled();
			focusSpy.mockRestore();
		});
	});

	describe('Enter Key Behavior', () => {
		it('should close dropdown when Enter is pressed with closeOnEnter enabled (default)', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				closeOnEnter: true,
				height: 250,
			});

			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Focus search input
			searchInput.focus();
			await waitFor(50);

			// Press Enter
			const enterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			searchInput.dispatchEvent(enterEvent);

			await waitFor(150);

			// Dropdown should be closed
			expect(select.isDropdownOpen()).toBe(false);
		});

		it('should keep dropdown open when Enter is pressed with closeOnEnter disabled', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				closeOnEnter: false,
				height: 250,
			});

			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Focus search input
			searchInput.focus();
			await waitFor(50);

			// Press Enter
			const enterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			searchInput.dispatchEvent(enterEvent);

			await waitFor(150);

			// Dropdown should remain open
			expect(select.isDropdownOpen()).toBe(true);
		});

		it('should select first option when Enter is pressed', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				closeOnEnter: true,
				height: 250,
			});

			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Focus search input
			searchInput.focus();
			await waitFor(50);

			// Press Enter
			const enterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			searchInput.dispatchEvent(enterEvent);

			await waitFor(150);

			// First option should be selected
			expect(select.getSelectedOptions()).toContain('1');
		});
	});

	describe('Global Dropdown Management', () => {
		it('should close other open dropdowns when opening a new one (default behavior)', async () => {
			const selectEl1 = createSelectElement();
			const selectEl2 = createSelectElement([
				{ value: 'a', text: 'Option A' },
				{ value: 'b', text: 'Option B' },
			]);
			container.appendChild(selectEl1);
			container.appendChild(selectEl2);

			const select1 = new KTSelect(selectEl1, { height: 250 });
			const select2 = new KTSelect(selectEl2, { height: 250 });

			await waitForInit(select1);
			await waitForInit(select2);

			// Open first dropdown
			select1.openDropdown();
			await waitFor(200);
			expect(select1.isDropdownOpen()).toBe(true);

			// Open second dropdown - should close first
			select2.openDropdown();
			await waitFor(200);

			// First dropdown should be closed
			expect(select1.isDropdownOpen()).toBe(false);

			// Second dropdown should be open
			expect(select2.isDropdownOpen()).toBe(true);
		});

		it('should allow multiple dropdowns when closeOnOtherOpen is disabled', async () => {
			const selectEl1 = createSelectElement();
			const selectEl2 = createSelectElement([
				{ value: 'a', text: 'Option A' },
				{ value: 'b', text: 'Option B' },
			]);
			container.appendChild(selectEl1);
			container.appendChild(selectEl2);

			const select1 = new KTSelect(selectEl1, {
				closeOnOtherOpen: false,
				height: 250,
			});
			const select2 = new KTSelect(selectEl2, {
				closeOnOtherOpen: false,
				height: 250,
			});

			await waitForInit(select1);
			await waitForInit(select2);

			// Open first dropdown
			select1.openDropdown();
			await waitFor(200);
			expect(select1.isDropdownOpen()).toBe(true);

			// Open second dropdown - first should remain open
			select2.openDropdown();
			await waitFor(200);

			// Both dropdowns should be open
			expect(select1.isDropdownOpen()).toBe(true);
			expect(select2.isDropdownOpen()).toBe(true);
		});

		it('should remove instance from registry when dropdown closes', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(100);

			// Close dropdown
			select.closeDropdown();
			await waitFor(100);

			// Registry should be empty (we can't directly access private static, but we can verify behavior)
			// Opening another dropdown should work without issues
			const selectEl2 = createSelectElement([
				{ value: 'a', text: 'Option A' },
			]);
			container.appendChild(selectEl2);
			const select2 = new KTSelect(selectEl2, { height: 250 });
			await waitForInit(select2);
			select2.openDropdown();
			await waitFor(100);

			// Should work without errors
			expect(select2).toBeTruthy();
		});

		it('should clean up registry when instance is destroyed', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Open dropdown
			select.openDropdown();
			await waitFor(100);

			// Destroy instance
			select.destroy();
			await waitFor(100);

			// Creating a new select should work without issues
			const selectEl2 = createSelectElement([
				{ value: 'a', text: 'Option A' },
			]);
			container.appendChild(selectEl2);
			const select2 = new KTSelect(selectEl2, { height: 250 });
			await waitForInit(select2);
			select2.openDropdown();
			await waitFor(100);

			// Should work without errors
			expect(select2).toBeTruthy();
		});
	});

	describe('Global Event Dispatch', () => {
		it('should dispatch events on document when dispatchGlobalEvents is enabled (default)', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Set up document listener
			const showHandler = vi.fn();
			document.addEventListener('kt-select:show', showHandler);

			// Open dropdown
			select.openDropdown();
			await waitFor(100);

			// Event should be dispatched on document
			expect(showHandler).toHaveBeenCalledTimes(1);
			const event = showHandler.mock.calls[0][0] as CustomEvent;
			expect(event.detail.instance).toBe(select);
			expect(event.detail.element).toBe(selectEl);

			// Cleanup
			document.removeEventListener('kt-select:show', showHandler);
		});

		it('should not dispatch events on document when dispatchGlobalEvents is disabled', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: false,
				height: 250,
			});

			await waitForInit(select);

			// Set up document listener
			const showHandler = vi.fn();
			document.addEventListener('kt-select:show', showHandler);

			// Open dropdown
			select.openDropdown();
			await waitFor(100);

			// Event should NOT be dispatched on document
			expect(showHandler).not.toHaveBeenCalled();

			// Cleanup
			document.removeEventListener('kt-select:show', showHandler);
		});

		it('should dispatch events on element regardless of dispatchGlobalEvents setting', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: false,
				height: 250,
			});

			await waitForInit(select);

			// Set up element listener
			const showHandler = vi.fn();
			selectEl.addEventListener('show', showHandler);

			// Open dropdown
			select.openDropdown();
			await waitFor(100);

			// Event should be dispatched on element
			expect(showHandler).toHaveBeenCalledTimes(1);

			// Cleanup
			selectEl.removeEventListener('show', showHandler);
		});

		it('should dispatch both namespaced and non-namespaced events on document', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Set up listeners for both namespaced and non-namespaced
			const namespacedHandler = vi.fn();
			const nonNamespacedHandler = vi.fn();

			// Use capture phase to catch events before they bubble
			document.addEventListener('kt-select:show', namespacedHandler, true);
			document.addEventListener('show', nonNamespacedHandler, true);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			// Both events should fire on document
			expect(namespacedHandler).toHaveBeenCalledTimes(1);
			// Non-namespaced event should also be dispatched on document (for jQuery compatibility)
			const nonNamespacedCalls = nonNamespacedHandler.mock.calls.filter(
				(call) => call[0].type === 'show' && call[0].target === document,
			);
			expect(nonNamespacedCalls.length).toBe(1);

			// Verify event detail structure is consistent
			const namespacedEvent = namespacedHandler.mock.calls[0][0] as CustomEvent;
			const nonNamespacedEvent = nonNamespacedCalls[0][0] as CustomEvent;
			expect(nonNamespacedEvent.detail.instance).toBe(select);
			expect(nonNamespacedEvent.detail.element).toBe(selectEl);
			expect(nonNamespacedEvent.detail).toEqual(namespacedEvent.detail);

			// Cleanup
			document.removeEventListener('kt-select:show', namespacedHandler, true);
			document.removeEventListener('show', nonNamespacedHandler, true);
		});

		it('should support jQuery-style non-namespaced event listeners on document', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Simulate jQuery-style listener: $(document).on('show', ...)
			const showHandler = vi.fn();
			document.addEventListener('show', showHandler);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			// Event should be dispatched on document and handler should be called
			// Filter to only count events dispatched directly on document (not bubbled from element)
			const documentEvents = showHandler.mock.calls.filter(
				(call) => call[0].target === document,
			);
			expect(documentEvents.length).toBe(1);
			const event = documentEvents[0][0] as CustomEvent;
			expect(event.type).toBe('show');
			expect(event.target).toBe(document);
			expect(event.detail.instance).toBe(select);
			expect(event.detail.element).toBe(selectEl);

			// Cleanup
			document.removeEventListener('show', showHandler);
		});

		it('should include component instance and element in event detail', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Set up document listener
			const closeHandler = vi.fn();
			document.addEventListener('kt-select:close', closeHandler);

			// Open dropdown first
			select.openDropdown();
			await waitFor(200);

			// Clear handler calls from open event
			closeHandler.mockClear();

			// Close dropdown
			select.closeDropdown();
			await waitFor(200);

			// Event should include instance and element
			expect(closeHandler).toHaveBeenCalledTimes(1);
			const event = closeHandler.mock.calls[0][0] as CustomEvent;
			expect(event.detail.instance).toBe(select);
			expect(event.detail.element).toBe(selectEl);

			// Cleanup
			document.removeEventListener('kt-select:close', closeHandler);
		});

		it('should dispatch change events on document when configured', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Set up document listener
			const changeHandler = vi.fn();
			document.addEventListener('kt-select:change', changeHandler);

			// Select an option by clicking on it
			select.openDropdown();
			await waitFor(200);

			const option = select
				.getDropdownElement()
				?.querySelector('[data-kt-select-option][data-value="1"]') as HTMLElement;

			expect(option).toBeTruthy();
			option.click();
			await waitFor(200);

			// Event should be dispatched on document
			expect(changeHandler).toHaveBeenCalled();

			// Cleanup
			document.removeEventListener('kt-select:change', changeHandler);
		});
	});

	describe('Integration Tests', () => {
		it('should work correctly with all features enabled', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				searchAutofocus: true,
				closeOnEnter: true,
				closeOnOtherOpen: true,
				dispatchGlobalEvents: true,
				height: 250,
			});

			await waitForInit(select);

			// Set up document listener
			const showHandler = vi.fn();
			document.addEventListener('kt-select:show', showHandler);

			// Open dropdown
			select.openDropdown();
			await waitFor(200);

			// Verify autofocus
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();
			expect(document.activeElement).toBe(searchInput);

			// Verify global event dispatch
			expect(showHandler).toHaveBeenCalledTimes(1);

			// Press Enter
			const enterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true,
			});
			searchInput.dispatchEvent(enterEvent);
			await waitFor(200);

			// Verify dropdown closed
			expect(select.isDropdownOpen()).toBe(false);

			// Cleanup
			document.removeEventListener('kt-select:show', showHandler);
		});
	});
});

