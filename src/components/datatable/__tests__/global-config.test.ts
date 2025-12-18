/**
 * global-config.test.ts
 * Tests for datatable global configuration functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTDataTable } from '../datatable';
import { KTDataTableConfigInterface } from '../types';

describe('KTDataTable - Global Configuration', () => {
	let container: HTMLElement;
	let tableElement: HTMLTableElement;

	/**
	 * Helper: Create a mock datatable structure
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

		headerRow.appendChild(th1);
		headerRow.appendChild(th2);
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

			row.appendChild(td1);
			row.appendChild(td2);
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
		// Clear global config before each test
		// Access private property via type assertion for testing
		(KTDataTable as any)._globalConfig = {};
		localStorage.clear();
		document.body.innerHTML = '';
	});

	afterEach(() => {
		// Clean up all DataTable instances
		const tables = document.querySelectorAll('[data-kt-datatable]');
		tables.forEach((table) => {
			const instance = KTDataTable.getInstance(table as HTMLElement);
			if (instance) {
				instance.dispose();
			}
		});

		// Reset global config
		(KTDataTable as any)._globalConfig = {};
		localStorage.clear();
		document.body.innerHTML = '';
	});

	describe('Scenario: Set global configuration', () => {
		it('should apply global config to all new instances', () => {
			const { container: container1 } = createMockDataTable(25);
			const { container: container2 } = createMockDataTable(25);

			// Set global config
			KTDataTable.setGlobalConfig({
				pageSize: 20,
				pageSizes: [10, 20, 50],
			});

			// Create instances without specifying these options
			const table1 = new KTDataTable(container1);
			const table2 = new KTDataTable(container2);

			// Both should use global config
			expect(table1.getState().pageSize).toBe(20);
			expect(table2.getState().pageSize).toBe(20);
		});

		it('should merge global config with instance config', () => {
			const { container } = createMockDataTable(25);

			// Set global config
			KTDataTable.setGlobalConfig({
				pageSize: 20,
				stateSave: true,
			});

			// Create instance with partial override
			const table = new KTDataTable(container, {
				pageSize: 10, // Override global
			});

			// Instance config should override global
			expect(table.getState().pageSize).toBe(10);
			// Global config should be used for non-overridden values
			expect((table as any)._config.stateSave).toBe(true);
		});
	});

	describe('Scenario: Global config merges with instance config', () => {
		it('should use instance config when both global and instance specify same property', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 20,
				stateSave: true,
			});

			const table = new KTDataTable(container, {
				pageSize: 10, // Should override global
			});

			expect(table.getState().pageSize).toBe(10); // Instance overrides
			expect((table as any)._config.stateSave).toBe(true); // Global used
		});

		it('should merge nested config objects correctly', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				search: {
					delay: 300,
				},
			});

			const table = new KTDataTable(container, {
				search: {
					callback: (data, search) => data.filter((item) =>
						String(item.name).includes(search),
					),
				},
			});

			// Should have both delay from global and callback from instance
			expect((table as any)._config.search.delay).toBe(300);
			expect(typeof (table as any)._config.search.callback).toBe('function');
		});
	});

	describe('Scenario: Global config applies to multiple instances', () => {
		it('should apply same global config to multiple instances', () => {
			const { container: container1 } = createMockDataTable(25);
			const { container: container2 } = createMockDataTable(25);
			const { container: container3 } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 25,
				pageMore: false,
			});

			const table1 = new KTDataTable(container1);
			const table2 = new KTDataTable(container2);
			const table3 = new KTDataTable(container3);

			// All should use global config
			expect(table1.getState().pageSize).toBe(25);
			expect(table2.getState().pageSize).toBe(25);
			expect(table3.getState().pageSize).toBe(25);
			expect((table1 as any)._config.pageMore).toBe(false);
			expect((table2 as any)._config.pageMore).toBe(false);
			expect((table3 as any)._config.pageMore).toBe(false);
		});

		it('should allow instances to override global config independently', () => {
			const { container: container1 } = createMockDataTable(25);
			const { container: container2 } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 25,
			});

			const table1 = new KTDataTable(container1); // Uses global
			const table2 = new KTDataTable(container2, {
				pageSize: 10, // Overrides global
			});

			expect(table1.getState().pageSize).toBe(25);
			expect(table2.getState().pageSize).toBe(10);
		});
	});

	describe('Scenario: Global config supports all configuration options', () => {
		it('should support all valid config properties', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 15,
				pageSizes: [5, 10, 15, 20],
				pageMore: true,
				pageMoreLimit: 5,
				stateSave: false,
				info: 'Custom info {start}-{end}',
				infoEmpty: 'No data found',
			});

			const table = new KTDataTable(container);

			expect(table.getState().pageSize).toBe(15);
			expect((table as any)._config.pageSizes).toEqual([5, 10, 15, 20]);
			expect((table as any)._config.pageMore).toBe(true);
			expect((table as any)._config.pageMoreLimit).toBe(5);
			expect((table as any)._config.stateSave).toBe(false);
			expect((table as any)._config.info).toBe('Custom info {start}-{end}');
			expect((table as any)._config.infoEmpty).toBe('No data found');
		});

		it('should merge nested config objects correctly', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				search: {
					delay: 300,
				},
				sort: {
					classes: {
						base: 'custom-sort-base',
						asc: 'custom-asc',
					},
				},
				pagination: {
					number: {
						class: 'custom-page-btn',
						text: 'Page {page}',
					},
					previous: {
						class: 'custom-prev-btn',
						text: 'Prev',
					},
					next: {
						class: 'custom-next-btn',
						text: 'Next',
					},
					more: {
						class: 'custom-more-btn',
						text: '...',
					},
				},
			});

			const table = new KTDataTable(container);

			expect((table as any)._config.search.delay).toBe(300);
			expect((table as any)._config.sort.classes.base).toBe('custom-sort-base');
			expect((table as any)._config.sort.classes.asc).toBe('custom-asc');
			expect((table as any)._config.pagination.number.class).toBe('custom-page-btn');
			expect((table as any)._config.pagination.number.text).toBe('Page {page}');
		});

		it('should support function callbacks in global config', () => {
			const { container } = createMockDataTable(25);

			const globalSearchCallback = vi.fn((data, search) => data);

			KTDataTable.setGlobalConfig({
				search: {
					callback: globalSearchCallback,
				},
			});

			const table1 = new KTDataTable(container);
			const { container: container2 } = createMockDataTable(25);
			const table2 = new KTDataTable(container2);

			// Both should use the same callback function
			expect((table1 as any)._config.search.callback).toBe(globalSearchCallback);
			expect((table2 as any)._config.search.callback).toBe(globalSearchCallback);
		});
	});

	describe('Scenario: Global config can be updated', () => {
		it('should merge subsequent setGlobalConfig calls', () => {
			const { container } = createMockDataTable(25);

			// First call
			KTDataTable.setGlobalConfig({
				pageSize: 20,
				stateSave: true,
			});

			// Second call - should merge
			KTDataTable.setGlobalConfig({
				pageSize: 25, // Override previous
				pageMore: false, // New property
			});

			const table = new KTDataTable(container);

			// Should use latest values
			expect(table.getState().pageSize).toBe(25);
			expect((table as any)._config.stateSave).toBe(true); // From first call
			expect((table as any)._config.pageMore).toBe(false); // From second call
		});

		it('should apply updated global config to new instances', () => {
			const { container: container1 } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 20,
			});

			const table1 = new KTDataTable(container1);
			expect(table1.getState().pageSize).toBe(20);

			// Update global config
			KTDataTable.setGlobalConfig({
				pageSize: 30,
			});

			const { container: container2 } = createMockDataTable(25);
			const table2 = new KTDataTable(container2);

			// New instance should use updated config
			expect(table2.getState().pageSize).toBe(30);
			// Existing instance should not be affected
			expect(table1.getState().pageSize).toBe(20);
		});

		it('should deep merge nested objects on subsequent calls', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				search: {
					delay: 300,
				},
			});

			KTDataTable.setGlobalConfig({
				search: {
					callback: (data, search) => data,
				},
			});

			const table = new KTDataTable(container);

			// Should have both properties from merged configs
			expect((table as any)._config.search.delay).toBe(300);
			expect(typeof (table as any)._config.search.callback).toBe('function');
		});
	});

	describe('Edge cases', () => {
		it('should handle empty global config', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({});

			const table = new KTDataTable(container);

			// Should use defaults
			expect(table.getState().pageSize).toBe(10); // Default
		});

		it('should handle undefined instance config', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 20,
			});

			const table = new KTDataTable(container, undefined);

			expect(table.getState().pageSize).toBe(20);
		});

		it('should handle null instance config', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 20,
			});

			const table = new KTDataTable(container, null as any);

			expect(table.getState().pageSize).toBe(20);
		});

		it('should not affect existing instances when global config changes', () => {
			const { container } = createMockDataTable(25);

			KTDataTable.setGlobalConfig({
				pageSize: 20,
			});

			const table = new KTDataTable(container);
			expect(table.getState().pageSize).toBe(20);

			// Change global config
			KTDataTable.setGlobalConfig({
				pageSize: 30,
			});

			// Existing instance should not change
			expect(table.getState().pageSize).toBe(20);
		});
	});
});

