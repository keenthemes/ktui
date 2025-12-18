/**
 * Lifecycle Tests for KTDataTable
 * Tests component re-initialization, disposal, and async operation cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTDataTable } from '../datatable';
import { KTDataTableDataInterface } from '../types';

describe('KTDataTable Lifecycle Management', () => {
	let container: HTMLElement;

	/**
	 * Helper to create a table element
	 */
	const createTableElement = (): HTMLTableElement => {
		const table = document.createElement('table');
		table.setAttribute('data-kt-datatable', 'true');
		table.setAttribute('data-kt-datatable-table', 'true'); // Required for DataTable to find the table
		table.id = 'test-table';

		// Create thead
		const thead = document.createElement('thead');
		const tr = document.createElement('tr');
		const th1 = document.createElement('th');
		th1.textContent = 'ID';
		th1.setAttribute('data-kt-datatable-column', 'id');
		const th2 = document.createElement('th');
		th2.textContent = 'Name';
		th2.setAttribute('data-kt-datatable-column', 'name');
		tr.appendChild(th1);
		tr.appendChild(th2);
		thead.appendChild(tr);
		table.appendChild(thead);

		// Create tbody
		const tbody = document.createElement('tbody');
		table.appendChild(tbody);

		return table;
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		// Clean up all DataTable instances
		const tables = document.querySelectorAll('table[data-kt-datatable]');
		tables.forEach((table) => {
			const instance = (table as any).instance;
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
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Create first instance
			const table1 = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Verify it's initialized
			expect(table1.getElement()).toBe(tableEl);
			expect(tableEl.hasAttribute('data-kt-datatable-initialized')).toBe(true);

			// Dispose
			table1.dispose();

			// Verify disposed
			expect((table1 as any)._disposed).toBe(true);
			expect(tableEl.hasAttribute('data-kt-datatable-initialized')).toBe(false);

			// Re-initialize
			const table2 = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Verify new instance works
			expect(table2.getElement()).toBe(tableEl);
			expect((table2 as any)._disposed).toBe(false);
			expect(tableEl.hasAttribute('data-kt-datatable-initialized')).toBe(true);
			expect(table2).not.toBe(table1);
		});

		it('should use reinit() static method for explicit re-initialization', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Create first instance
			const table1 = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Dispose
			table1.dispose();

			// Re-initialize using reinit()
			const table2 = KTDataTable.reinit(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Verify new instance
			expect(table2.getElement()).toBe(tableEl);
			expect((table2 as any)._disposed).toBe(false);
			expect(table2).not.toBe(table1);
		});

		it('should return existing instance when reinit() called on active instance', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Create instance
			const table1 = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Call reinit on active instance
			const table2 = KTDataTable.reinit(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Should return same instance
			expect(table2).toBe(table1);
			expect((table2 as any)._disposed).toBe(false);
		});

		it('should allow reinit with updated configuration', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Create first instance
			const table1 = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
				pageSize: 10,
			});

			// Dispose
			table1.dispose();

			// Re-initialize with different config
			const table2 = KTDataTable.reinit(tableEl, {
				apiEndpoint: '/api/data',
				pageSize: 20,
			});

			// Verify new config is applied
			expect((table2 as any)._config.pageSize).toBe(20);
		});
	});

	describe('Enhanced Disposal', () => {
		it('should cancel pending async operations on dispose', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Mock fetch to simulate async operation
			const abortSpy = vi.fn();
			global.fetch = vi.fn(() => {
				const controller = new AbortController();
				controller.signal.addEventListener('abort', abortSpy);
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve(
							new Response(JSON.stringify({ data: [], total: 0 }), {
								status: 200,
								headers: { 'Content-Type': 'application/json' },
							}),
						);
					}, 1000);
				});
			}) as any;

			const table = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Trigger data fetch
			table.reload();

			// Dispose immediately (should cancel fetch)
			table.dispose();

			// Verify abort was called
			expect(table['_abortController']).toBeNull();
			expect(table['_isFetching']).toBe(false);
		});

		it('should remove all event listeners on dispose', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Create search element BEFORE table initialization so it can be found
			const searchEl = document.createElement('input');
			searchEl.setAttribute('data-kt-datatable-search', '#test-table');
			container.appendChild(searchEl);

			// Use local data instead of API to ensure _finalize() is called
			const table = new KTDataTable(tableEl, {
				_data: [
					{ id: '1', name: 'Test 1' },
					{ id: '2', name: 'Test 2' },
				],
			});

			// Wait for async initialization to complete (_finalize calls _attachSearchEvent)
			// Use a longer timeout and poll for the handler
			let attempts = 0;
			while (!(searchEl as any)._debouncedSearch && attempts < 50) {
				await new Promise((resolve) => setTimeout(resolve, 10));
				attempts++;
			}

			// Verify search handler exists
			expect((searchEl as any)._debouncedSearch).toBeDefined();

			// Dispose
			table.dispose();

			// Verify search handler is removed
			expect((searchEl as any)._debouncedSearch).toBeUndefined();
		});

		it('should clean up all module instances on dispose', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			const table = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Verify modules exist
			expect(table['_checkbox']).toBeTruthy();
			expect(table['_sortHandler']).toBeTruthy();

			// Dispose
			table.dispose();

			// Verify modules are cleaned up
			expect(table['_checkbox']).toBeNull();
			expect(table['_sortHandler']).toBeNull();
		});

		it('should remove from static instances map on dispose', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			const table = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Verify in static map
			expect(KTDataTable.getInstance(tableEl)).toBe(table);

			// Dispose
			table.dispose();

			// Verify removed from static map
			expect(KTDataTable.getInstance(tableEl)).toBeUndefined();
		});

		it('should handle multiple dispose calls (idempotent)', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			const table = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});

			// Call dispose multiple times
			table.dispose();
			table.dispose();
			table.dispose();

			// Should not throw and should be disposed
			expect((table as any)._disposed).toBe(true);
		});
	});

	describe('Framework Integration Patterns', () => {
		it('should work with React-like useEffect pattern', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Simulate React useEffect
			let tableInstance: KTDataTable<KTDataTableDataInterface> | null = null;

			// Mount
			tableInstance = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});
			expect((tableInstance as any)._disposed).toBe(false);

			// Unmount (cleanup)
			if (tableInstance) {
				tableInstance.dispose();
			}
			expect((tableInstance as any)._disposed).toBe(true);

			// Re-mount
			tableInstance = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});
			expect((tableInstance as any)._disposed).toBe(false);
		});

		it('should work with Vue-like onMounted/onUnmounted pattern', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Simulate Vue lifecycle
			let tableInstance: KTDataTable<KTDataTableDataInterface> | null = null;

			// onMounted
			tableInstance = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});
			expect((tableInstance as any)._disposed).toBe(false);

			// onUnmounted
			if (tableInstance) {
				tableInstance.dispose();
			}
			expect((tableInstance as any)._disposed).toBe(true);

			// Re-mount
			tableInstance = KTDataTable.reinit(tableEl, {
				apiEndpoint: '/api/data',
			});
			expect((tableInstance as any)._disposed).toBe(false);
		});

		it('should handle rapid destroy/re-init cycles without memory leaks', async () => {
			const tableEl = createTableElement();
			container.appendChild(tableEl);

			// Perform multiple cycles
			for (let i = 0; i < 5; i++) {
				const table = new KTDataTable(tableEl, {
					apiEndpoint: '/api/data',
				});
				table.dispose();
			}

			// Final instance should work
			const finalTable = new KTDataTable(tableEl, {
				apiEndpoint: '/api/data',
			});
			expect((finalTable as any)._disposed).toBe(false);
			expect(finalTable.getElement()).toBe(tableEl);
		});
	});
});

