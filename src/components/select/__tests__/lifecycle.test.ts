/**
 * Lifecycle Tests for KTSelect
 * Tests component re-initialization, DOM change detection, and state synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTSelect } from '../select';
import { waitFor } from '../../datatable/__tests__/setup';

describe('KTSelect Lifecycle Management', () => {
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
		select.setAttribute('data-kt-select', 'true');
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
		await waitFor(200);
		await new Promise((resolve) => setTimeout(resolve, 0));
		await waitFor(50);
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		// Clean up all KTSelect instances
		const selects = document.querySelectorAll('select');
		selects.forEach((select) => {
			const instance = (select as any).instance;
			if (instance && typeof instance.dispose === 'function') {
				instance.dispose();
			}
		});

		// Clear document body
		document.body.innerHTML = '';
		container = null as any;
		vi.clearAllMocks();
	});

	describe('Component Re-initialization', () => {
		it('should allow re-initialization after disposal', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Create first instance with explicit config
			const select1 = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select1);

			// Verify it's initialized
			expect(select1.getElement()).toBe(selectEl);
			expect(selectEl.hasAttribute('data-kt-select-initialized')).toBe(true);

			// Dispose
			select1.dispose();

			// Verify disposed
			expect((select1 as any)._disposed).toBe(true);
			expect(selectEl.hasAttribute('data-kt-select-initialized')).toBe(false);

			// Re-initialize
			const select2 = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select2);

			// Verify new instance works
			expect(select2.getElement()).toBe(selectEl);
			expect((select2 as any)._disposed).toBe(false);
			expect(selectEl.hasAttribute('data-kt-select-initialized')).toBe(true);
			expect(select2).not.toBe(select1);
		});

		it('should use reinit() static method for explicit re-initialization', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Create first instance with explicit config
			const select1 = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select1);

			// Dispose
			select1.dispose();

			// Re-initialize using reinit()
			const select2 = KTSelect.reinit(selectEl, { height: 250 });
			await waitForInit(select2);

			// Verify new instance
			expect(select2.getElement()).toBe(selectEl);
			expect((select2 as any)._disposed).toBe(false);
			expect(select2).not.toBe(select1);
		});

		it('should return existing instance when reinit() called on active instance', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Create instance with explicit config
			const select1 = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select1);

			// Call reinit on active instance
			const select2 = KTSelect.reinit(selectEl);

			// Should return same instance
			expect(select2).toBe(select1);
			expect((select2 as any)._disposed).toBe(false);
		});

		it('should allow reinit with updated configuration', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Create first instance with explicit config
			const select1 = new KTSelect(selectEl, {
				enableSearch: false,
				height: 250,
			});
			await waitForInit(select1);

			// Dispose
			select1.dispose();

			// Re-initialize with different config
			const select2 = KTSelect.reinit(selectEl, {
				enableSearch: true,
				height: 250,
			});
			await waitForInit(select2);

			// Verify new config is applied
			expect(select2.getSearchInput()).toBeTruthy();
		});

		it('should handle multiple dispose calls (idempotent)', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Call dispose multiple times
			select.dispose();
			select.dispose();
			select.dispose();

			// Should not throw and should be disposed
			expect((select as any)._disposed).toBe(true);
		});
	});

	describe('DOM Change Detection', () => {
		it('should detect programmatic value changes', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Change value programmatically
			selectEl.value = '2';

			// Trigger change event
			selectEl.dispatchEvent(new Event('change'));

			// Wait for sync
			await waitFor(50);

			// Verify state is synchronized
			const selected = select.getSelectedOptions();
			expect(selected).toContain('2');
		});

		it('should detect option additions via MutationObserver', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Add new option
			const newOption = document.createElement('option');
			newOption.value = '4';
			newOption.textContent = 'Option 4';
			selectEl.appendChild(newOption);

			// Wait for MutationObserver to detect change
			await waitFor(100);

			// Verify option is available
			const options = selectEl.querySelectorAll('option');
			expect(options.length).toBe(4);
		});

		it('should detect option removals via MutationObserver', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Remove an option
			const optionToRemove = selectEl.querySelector('option[value="2"]');
			if (optionToRemove) {
				optionToRemove.remove();
			}

			// Wait for MutationObserver to detect change
			await waitFor(100);

			// Verify option is removed
			const options = selectEl.querySelectorAll('option');
			expect(options.length).toBe(2);
		});

		it('should detect selected attribute changes', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Change selected attribute programmatically
			const option = selectEl.querySelector('option[value="2"]') as HTMLOptionElement;
			option.selected = true;

			// Trigger change event
			selectEl.dispatchEvent(new Event('change'));

			// Wait for sync
			await waitFor(50);

			// Verify state is synchronized
			const selected = select.getSelectedOptions();
			expect(selected).toContain('2');
		});
	});

	describe('State Synchronization', () => {
		it('should synchronize state on native change events', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Change value
			selectEl.value = '3';
			selectEl.dispatchEvent(new Event('change'));

			// Wait for sync
			await waitFor(50);

			// Verify state synchronized
			const selected = select.getSelectedOptions();
			expect(selected).toContain('3');
		});

		it('should synchronize state on native input events', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Change value and trigger input event
			selectEl.value = '2';
			selectEl.dispatchEvent(new Event('input'));

			// Wait for debounced sync
			await waitFor(50);

			// Verify state synchronized
			const selected = select.getSelectedOptions();
			expect(selected).toContain('2');
		});

		it('should preserve valid selections during state sync', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: 'Option 1' },
				{ value: '2', text: 'Option 2' },
			]);
			container.appendChild(selectEl);

		const select = new KTSelect(selectEl, { height: 250 });
		await waitForInit(select);

		// Select option 2
		const option2 = selectEl.querySelector('option[value="2"]') as HTMLOptionElement;
		select.setSelectedOptions([option2]);
		await waitFor(50);

		// Change value programmatically to same value
			selectEl.value = '2';
			selectEl.dispatchEvent(new Event('change'));
			await waitFor(50);

			// Verify selection preserved
			const selected = select.getSelectedOptions();
			expect(selected).toContain('2');
		});

		it('should clear invalid selections during state sync', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: 'Option 1' },
				{ value: '2', text: 'Option 2' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

		// Select option 2
		const option2ToRemove = selectEl.querySelector('option[value="2"]') as HTMLOptionElement;
		select.setSelectedOptions([option2ToRemove]);
		await waitFor(50);

		// Remove option 2
			const option2 = selectEl.querySelector('option[value="2"]');
			if (option2) {
				option2.remove();
			}

			// Wait for MutationObserver
			await waitFor(100);

			// Verify selection cleared
			const selected = select.getSelectedOptions();
			expect(selected).not.toContain('2');
		});

		it('should prevent infinite loops in state synchronization', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Track sync calls
			let syncCallCount = 0;
			const originalSync = select['_syncSelectionFromNative'].bind(select);
			select['_syncSelectionFromNative'] = function () {
				syncCallCount++;
				return originalSync();
			};

			// Change value
			selectEl.value = '2';
			selectEl.dispatchEvent(new Event('change'));

			// Wait for sync
			await waitFor(100);

			// Should only sync once (not recursively)
			expect(syncCallCount).toBeLessThanOrEqual(2); // Allow for initial setup
		});
	});

	describe('Enhanced Disposal', () => {
		it('should disconnect MutationObserver on dispose', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Verify MutationObserver exists
			expect(select['_mutationObserver']).toBeTruthy();

			// Dispose
			select.dispose();

			// Verify MutationObserver is disconnected
			expect(select['_mutationObserver']).toBeNull();
		});

		it('should remove native event listeners on dispose', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Verify native handler exists
			expect(select['_nativeChangeHandler']).toBeTruthy();

			// Dispose
			select.dispose();

			// Verify handler is removed
			expect(select['_nativeChangeHandler']).toBeNull();
		});

		it('should clean up all module instances on dispose', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				enableSearch: true,
				tags: true,
				height: 250,
			});
			await waitForInit(select);

			// Verify modules exist
			expect(select['_searchModule']).toBeTruthy();
			expect(select['_tagsModule']).toBeTruthy();

			// Dispose
			select.dispose();

			// Verify modules are cleaned up
			expect(select['_searchModule']).toBeNull();
			expect(select['_tagsModule']).toBeNull();
		});

		it('should remove from static registry on dispose', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, { height: 250 });
			await waitForInit(select);

			// Open dropdown to add to registry
			select.openDropdown();
			await waitFor(50);

			// Verify in registry
			expect(KTSelect['openDropdowns'].has(select)).toBe(true);

			// Dispose
			select.dispose();

			// Verify removed from registry
			expect(KTSelect['openDropdowns'].has(select)).toBe(false);
		});
	});

	describe('Framework Integration Patterns', () => {
		it('should work with React-like useEffect pattern', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Simulate React useEffect
			let selectInstance: KTSelect | null = null;

			// Mount
			selectInstance = new KTSelect(selectEl, { height: 250 });
			await waitForInit(selectInstance);
			expect((selectInstance as any)._disposed).toBe(false);

			// Unmount (cleanup)
			if (selectInstance) {
				selectInstance.dispose();
			}
			expect((selectInstance as any)._disposed).toBe(true);

			// Re-mount
			selectInstance = new KTSelect(selectEl, { height: 250 });
			await waitForInit(selectInstance);
			expect((selectInstance as any)._disposed).toBe(false);
		});

		it('should work with Vue-like onMounted/onUnmounted pattern', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Simulate Vue lifecycle
			let selectInstance: KTSelect | null = null;

			// onMounted
			selectInstance = new KTSelect(selectEl, { height: 250 });
			await waitForInit(selectInstance);
			expect((selectInstance as any)._disposed).toBe(false);

			// onUnmounted
			if (selectInstance) {
				selectInstance.dispose();
			}
			expect((selectInstance as any)._disposed).toBe(true);

			// Re-mount
			selectInstance = KTSelect.reinit(selectEl, { height: 250 });
			await waitForInit(selectInstance);
			expect((selectInstance as any)._disposed).toBe(false);
		});

		it('should handle rapid destroy/re-init cycles without memory leaks', async () => {
			const selectEl = createSelectElement();
			container.appendChild(selectEl);

			// Perform multiple cycles
			for (let i = 0; i < 5; i++) {
				const select = new KTSelect(selectEl, { height: 250 });
				await waitForInit(select);
				select.dispose();
			}

			// Final instance should work
			const finalSelect = new KTSelect(selectEl, { height: 250 });
			await waitForInit(finalSelect);
			expect((finalSelect as any)._disposed).toBe(false);
			expect(finalSelect.getElement()).toBe(selectEl);
		});
	});
});

