/**
 * pagination-reset.test.ts
 * Tests for datatable pagination reset behavior on search and filter operations
 *
 * Spec: openspec/changes/fix-datatable-pagination-reset
 * Requirement: Pagination Reset on Search and Filter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDataTable } from '../datatable';
import { KTDataTableColumnFilterInterface } from '../types';

describe('KTDataTable - Pagination Reset', () => {
	let container: HTMLElement;
	let tableElement: HTMLTableElement;
	let datatable: KTDataTable<any>;

	/**
	 * Helper: Create a mock datatable with sample data
	 */
	const createMockDataTable = (recordCount: number = 25) => {
		container = document.createElement('div');
		container.id = 'test-datatable-container';

		// Create table structure
		tableElement = document.createElement('table');
		tableElement.setAttribute('data-kt-datatable-table', 'true');
		tableElement.id = 'test-table';

		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');

		const th1 = document.createElement('th');
		th1.setAttribute('data-kt-datatable-column', 'id');
		th1.textContent = 'ID';

		const th2 = document.createElement('th');
		th2.setAttribute('data-kt-datatable-column', 'name');
		th2.textContent = 'Name';

		const th3 = document.createElement('th');
		th3.setAttribute('data-kt-datatable-column', 'status');
		th3.textContent = 'Status';

		headerRow.appendChild(th1);
		headerRow.appendChild(th2);
		headerRow.appendChild(th3);
		thead.appendChild(headerRow);
		tableElement.appendChild(thead);

		// Create tbody with sample data
		const tbody = document.createElement('tbody');
		for (let i = 1; i <= recordCount; i++) {
			const row = document.createElement('tr');

			const td1 = document.createElement('td');
			td1.textContent = String(i);

			const td2 = document.createElement('td');
			td2.textContent = `User ${i}`;

			const td3 = document.createElement('td');
			td3.textContent = i % 2 === 0 ? 'active' : 'inactive';

			row.appendChild(td1);
			row.appendChild(td2);
			row.appendChild(td3);
			tbody.appendChild(row);
		}
		tableElement.appendChild(tbody);

		// Create pagination info element
		const infoElement = document.createElement('div');
		infoElement.setAttribute('data-kt-datatable-info', 'true');

		// Create page size selector
		const sizeElement = document.createElement('select');
		sizeElement.setAttribute('data-kt-datatable-size', 'true');

		// Create pagination container
		const paginationElement = document.createElement('div');
		paginationElement.setAttribute('data-kt-datatable-pagination', 'true');

		container.appendChild(tableElement);
		container.appendChild(infoElement);
		container.appendChild(sizeElement);
		container.appendChild(paginationElement);

		document.body.appendChild(container);

		return {
			container,
			tableElement,
			infoElement,
			sizeElement,
			paginationElement,
		};
	};

	beforeEach(() => {
		// Clear any existing elements
		document.body.innerHTML = '';
		vi.clearAllMocks();
	});

	describe('Scenario: Pagination resets when search is performed', () => {
		it('should reset to page 1 when search is called from page 2+', () => {
			// Setup: Create datatable with 25 records (page size 10 = 3 pages)
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Navigate to page 2
			datatable.goPage(2);
			expect(datatable.getState().page).toBe(2);

			// Perform search
			datatable.search('User 5');

			// Assert: Pagination should reset to page 1
			expect(datatable.getState().page).toBe(1);
		});

		it('should reset to page 1 from page 3 when searching', () => {
			const { container } = createMockDataTable(35);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Navigate to page 3
			datatable.goPage(3);
			expect(datatable.getState().page).toBe(3);

			// Perform search
			datatable.search('test query');

			// Assert
			expect(datatable.getState().page).toBe(1);
		});

		it('should reset page even when search yields no results', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(2);

			// Search for something that doesn't exist
			datatable.search('NonExistentUser999');

			expect(datatable.getState().page).toBe(1);
		});

		it('should reset page on empty search query', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(2);
			datatable.search('');

			expect(datatable.getState().page).toBe(1);
		});

		it('should reset page when searching with object query', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
				// Provide custom search callback that handles objects
				search: {
					delay: 500,
					callback: (data: any[], search: string | object) => {
						if (!search) return data;
						// For object search, just return all data (simplified for test)
						if (typeof search === 'object') return data;
						// String search
						return data.filter((item: any) =>
							Object.values(item).some((value: any) =>
								String(value).toLowerCase().includes((search as string).toLowerCase()),
							),
						);
					},
				},
			});

			datatable.goPage(2);

			// Search with object (for complex queries)
			datatable.search({ name: 'User', status: 'active' });

			expect(datatable.getState().page).toBe(1);
		});
	});

	describe('Scenario: Pagination resets when filter is applied', () => {
		it('should reset to page 1 when setFilter is called from page 2+', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Navigate to page 2
			datatable.goPage(2);
			expect(datatable.getState().page).toBe(2);

			// Apply filter
			const filter: KTDataTableColumnFilterInterface = {
				column: 'status',
				type: 'text',
				value: 'active',
			};
			datatable.setFilter(filter);

			// Assert: Pagination should reset to page 1
			expect(datatable.getState().page).toBe(1);
		});

		it('should reset to page 1 from any page when filtering', () => {
			const { container } = createMockDataTable(50);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Navigate to page 5
			datatable.goPage(5);
			expect(datatable.getState().page).toBe(5);

			// Apply filter
			datatable.setFilter({
				column: 'name',
				type: 'text',
				value: 'User 1',
			});

			expect(datatable.getState().page).toBe(1);
		});

		it('should reset page for numeric filter', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(3);

			datatable.setFilter({
				column: 'id',
				type: 'numeric',
				value: '5',
			});

			expect(datatable.getState().page).toBe(1);
		});
	});

	describe('Scenario: Multiple filters can be chained before reload', () => {
		it('should reset page once when chaining multiple setFilter calls', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(3);
			expect(datatable.getState().page).toBe(3);

			// Chain multiple filters
			datatable
				.setFilter({ column: 'status', type: 'text', value: 'active' })
				.setFilter({ column: 'name', type: 'text', value: 'User' });

			// Page should be reset to 1 after first filter
			expect(datatable.getState().page).toBe(1);

			// Verify both filters are applied
			const filters = datatable.getState().filters;
			expect(filters).toHaveLength(2);
			expect(filters[0].column).toBe('status');
			expect(filters[1].column).toBe('name');
		});

		it('should maintain page 1 through multiple filter operations', () => {
			const { container } = createMockDataTable(40);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(4);

			// Apply first filter
			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });
			expect(datatable.getState().page).toBe(1);

			// Apply second filter (page should stay at 1)
			datatable.setFilter({ column: 'name', type: 'text', value: 'John' });
			expect(datatable.getState().page).toBe(1);

			// Apply third filter (page should stay at 1)
			datatable.setFilter({ column: 'id', type: 'numeric', value: '10' });
			expect(datatable.getState().page).toBe(1);
		});

		it('should allow filter replacement on same column', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(2);

			// Apply filter on 'status'
			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });
			expect(datatable.getState().page).toBe(1);

			// Replace filter on same column
			datatable.setFilter({ column: 'status', type: 'text', value: 'inactive' });
			expect(datatable.getState().page).toBe(1);

			// Should only have one filter for 'status' column
			const filters = datatable.getState().filters;
			const statusFilters = filters.filter((f) => f.column === 'status');
			expect(statusFilters).toHaveLength(1);
			expect(statusFilters[0].value).toBe('inactive');
		});
	});

	describe('Scenario: Pagination reset aligns with page size behavior', () => {
		it('should use same state update pattern as setPageSize', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Navigate to page 2
			datatable.goPage(2);

			// Change page size (existing behavior)
			datatable.setPageSize(20);
			expect(datatable.getState().page).toBe(1);

			// Navigate to page 2 again
			datatable.goPage(2);

			// Apply search (new behavior)
			datatable.search('test');
			expect(datatable.getState().page).toBe(1);

			// Navigate to page 2 again
			datatable.goPage(2);

			// Apply filter (new behavior)
			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });
			expect(datatable.getState().page).toBe(1);
		});

		it('should reset pagination for all data-modifying operations', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Test 1: Page size change
			datatable.goPage(3);
			datatable.setPageSize(15);
			expect(datatable.getState().page).toBe(1);

			// Test 2: Search
			datatable.goPage(3);
			datatable.search('query');
			expect(datatable.getState().page).toBe(1);

			// Test 3: Filter
			datatable.goPage(3);
			datatable.setFilter({ column: 'name', type: 'text', value: 'test' });
			expect(datatable.getState().page).toBe(1);
		});
	});

	describe('Scenario: Empty search results display correctly', () => {
		it('should show page 1 when search yields no results from page 2+', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(2);

			// Search for non-existent data
			datatable.search('XYZ_NONEXISTENT_999');

			expect(datatable.getState().page).toBe(1);
		});

		it('should maintain page 1 state after empty search', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(3);
			datatable.search('NonExistent');

			// Page should be 1
			expect(datatable.getState().page).toBe(1);

			// Clear search
			datatable.search('');

			// Should still be on page 1
			expect(datatable.getState().page).toBe(1);
		});
	});

	describe('Scenario: State persistence respects pagination reset', () => {
		it('should save page 1 to state immediately when search resets pagination', async () => {
			const { container } = createMockDataTable(25);

			// Enable state saving with unique namespace
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: true,
				stateNamespace: 'test-datatable-search-reset-immediate',
			});

			// Wait for initial _updateData() to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			datatable.goPage(2);

			// Wait for goPage to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify we're on page 2
			expect(datatable.getState().page).toBe(2);

			// Spy on localStorage.setItem to verify immediate save
			const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

			// Perform search - state should be saved immediately (synchronously) before reload
			datatable.search('test query');

			// Verify state was saved immediately (check localStorage was called)
			expect(setItemSpy).toHaveBeenCalled();

			// Check that the saved state reflects page 1 immediately
			const savedState = localStorage.getItem('test-datatable-search-reset-immediate');
			expect(savedState).toBeTruthy();

			if (savedState) {
				const state = JSON.parse(savedState);
				expect(state.page).toBe(1);
				expect(state.search).toBe('test query');
			}

			// Verify current state is also page 1
			expect(datatable.getState().page).toBe(1);

			setItemSpy.mockRestore();

			// Cleanup
			localStorage.removeItem('test-datatable-search-reset-immediate');
		});

		it('should save page 1 to state when search resets pagination', async () => {
			const { container } = createMockDataTable(25);

			// Enable state saving with unique namespace
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: true,
				stateNamespace: 'test-datatable-search-reset',
			});

			// Wait for initial _updateData() to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			datatable.goPage(2);

			// Wait for goPage to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			datatable.search('test query');

			// Wait for async state save operations to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Check saved state
			const savedState = localStorage.getItem('test-datatable-search-reset');
			expect(savedState).toBeTruthy();

			if (savedState) {
				const state = JSON.parse(savedState);
				expect(state.page).toBe(1);
				expect(state.search).toBe('test query');
			}

			// Cleanup
			localStorage.removeItem('test-datatable-search-reset');
		});

		it('should save page 1 to state when filter resets pagination', () => {
			const { container } = createMockDataTable(25);

			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: true,
				stateNamespace: 'test-datatable-filter-reset',
			});

			datatable.goPage(3);
			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });

			// Trigger reload to save state
			datatable.reload();

			const savedState = localStorage.getItem('test-datatable-filter-reset');
			expect(savedState).toBeTruthy();

			if (savedState) {
				const state = JSON.parse(savedState);
				expect(state.page).toBe(1);
			}

			// Cleanup
			localStorage.removeItem('test-datatable-filter-reset');
		});

		it('should restore to page 1 with active search on reload', async () => {
			const { container } = createMockDataTable(25);
			const namespace = 'test-datatable-restore';

			// First instance
			let table1 = new KTDataTable(container, {
				pageSize: 10,
				stateSave: true,
				stateNamespace: namespace,
			});

			// Wait for initial load
			await new Promise((resolve) => setTimeout(resolve, 100));

			table1.goPage(2);

			// Wait for goPage to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			table1.search('User 5');

			// Wait for search and state save to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Destroy first instance
			table1.dispose();

			// Wait for cleanup to complete
			await new Promise((resolve) => setTimeout(resolve, 50));

			document.body.innerHTML = '';

			// Create new instance (simulating page reload)
			const { container: newContainer } = createMockDataTable(25);
			const table2 = new KTDataTable(newContainer, {
				pageSize: 10,
				stateSave: true,
				stateNamespace: namespace,
			});

			// Should restore to page 1 with search active
			expect(table2.getState().page).toBe(1);
			expect(table2.getState().search).toBe('User 5');

			// Cleanup
			localStorage.removeItem(namespace);
		});
	});

	describe('Edge Cases', () => {
		it('should handle search reset on page 1 (no-op)', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			// Already on page 1
			expect(datatable.getState().page).toBe(1);

			datatable.search('test');

			// Should still be on page 1
			expect(datatable.getState().page).toBe(1);
		});

		it('should handle filter reset on page 1 (no-op)', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			expect(datatable.getState().page).toBe(1);

			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });

			expect(datatable.getState().page).toBe(1);
		});

		it('should handle rapid consecutive search calls', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(3);

			// Rapid searches
			datatable.search('query1');
			datatable.search('query2');
			datatable.search('query3');

			// Should be on page 1 with last query
			expect(datatable.getState().page).toBe(1);
			expect(datatable.getState().search).toBe('query3');
		});

		it('should handle search and filter in quick succession', () => {
			const { container } = createMockDataTable(30);
			datatable = new KTDataTable(container, {
				pageSize: 10,
				stateSave: false,
			});

			datatable.goPage(3);

			// Search then filter quickly
			datatable.search('User');
			datatable.setFilter({ column: 'status', type: 'text', value: 'active' });

			expect(datatable.getState().page).toBe(1);
			expect(datatable.getState().search).toBe('User');
			expect(datatable.getState().filters).toHaveLength(1);
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain same return type for search method', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, { pageSize: 10 });

			// search() returns void
			const result = datatable.search('test');
			expect(result).toBeUndefined();
		});

		it('should maintain same return type for setFilter method', () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, { pageSize: 10 });

			// setFilter() returns this (chainable)
			const result = datatable.setFilter({
				column: 'status',
				type: 'text',
				value: 'active',
			});

			expect(result).toBe(datatable);
		});

		it('should not break existing event handlers', async () => {
			const { container } = createMockDataTable(25);
			datatable = new KTDataTable(container, { pageSize: 10, stateSave: false });

			const reloadSpy = vi.fn();
			// Listen for 'reload' event directly (CustomEvent)
			container.addEventListener('reload', reloadSpy);

			datatable.goPage(2);
			datatable.search('test');

			// Wait for async reload to complete
			await new Promise((resolve) => setTimeout(resolve, 50));

			// reload event should still fire
			expect(reloadSpy).toHaveBeenCalled();
		});
	});
});

