/**
 * Tests for datatable improvements applied 2026-05-28:
 * - Sort handler: AbortController cleanup, pre-stripped HTML cache
 * - Local provider: filter pipeline (text, numeric, dateRange)
 * - Checkbox handler: scoped to root element (not document.body)
 * - Layout plugin: rAF throttle on resize/scroll
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDataTableSortHandler } from '../datatable-sort';
import { KTDataTableLocalDataProvider } from '../datatable-local-provider';
import { KTDataTableCheckboxHandler } from '../datatable-checkbox';
import { KTDataTableConfigStateStore } from '../datatable-state-store';
import {
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
} from '../types';
import { createStickyLayoutPlugin } from '../datatable-layout-plugin';
import { KTDataTable } from '../datatable';

// ── Helpers ──────────────────────────────────────────────────────────

function createConfig(
	overrides: Partial<KTDataTableConfigInterface> = {},
): KTDataTableConfigInterface {
	return {
		pageSize: 10,
		pageSizes: [10, 20],
		pageMore: true,
		pageMoreLimit: 3,
		info: '{start}-{end} of {total}',
		infoEmpty: 'No records found',
		pagination: {
			number: { class: 'number', text: '{page}' },
			previous: { class: 'previous', text: 'Previous' },
			next: { class: 'next', text: 'Next' },
			more: { class: 'more', text: '...' },
		},
		search: { delay: 0 },
		sort: {},
		attributes: {
			table: '[data-kt-datatable-table="true"]',
			info: '[data-kt-datatable-info="true"]',
			size: '[data-kt-datatable-size="true"]',
			pagination: '[data-kt-datatable-pagination="true"]',
			spinner: '[data-kt-datatable-spinner="true"]',
			check: '[data-kt-datatable-check="true"]',
			checkbox: '[data-kt-datatable-row-check="true"]',
		},
		_state: {},
		...overrides,
	} as KTDataTableConfigInterface;
}

/**
 * Create a local provider with data in the DOM (so fetchSync can extract it).
 * The thead has data-kt-datatable-column attributes matching the td values.
 */
function createProviderWithDomData(
	config: KTDataTableConfigInterface,
	columns: string[],
	rows: string[][],
) {
	const table = document.createElement('table');
	const thead = table.createTHead();
	const theadRow = document.createElement('tr');
	for (const col of columns) {
		const th = document.createElement('th');
		th.setAttribute('data-kt-datatable-column', col);
		theadRow.appendChild(th);
	}
	thead.appendChild(theadRow);

	const tbody = table.createTBody();
	for (const row of rows) {
		const tr = document.createElement('tr');
		for (const cell of row) {
			const td = document.createElement('td');
			td.textContent = cell;
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}

	const store = new KTDataTableConfigStateStore(config);

	const provider = new KTDataTableLocalDataProvider({
		config,
		elements: () => ({
			tableElement: table,
			tbodyElement: tbody,
			theadElement: thead,
		}),
		getLogicalColumnCount: () => columns.length,
		storeOriginalClasses: vi.fn(),
		stateStore: store,
	});

	return { provider, store };
}

// ── Sort Handler Tests ───────────────────────────────────────────────

describe('Sort handler improvements', () => {
	let thead: HTMLTableSectionElement;

	beforeEach(() => {
		thead = document.createElement('thead');
		const tr = document.createElement('tr');
		const th1 = document.createElement('th');
		th1.setAttribute('data-kt-datatable-column', 'name');
		th1.innerHTML = '<span class="sort-icon"></span>';
		const th2 = document.createElement('th');
		th2.setAttribute('data-kt-datatable-column', 'price');
		th2.innerHTML = '<span class="sort-icon"></span>';
		tr.appendChild(th1);
		tr.appendChild(th2);
		thead.appendChild(tr);
	});

	it('uses AbortController to clean up sort listeners on re-init', () => {
		const updateData = vi.fn();
		const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
			config: { sort: { classes: { base: 'sort-icon' } } } as never,
			theadElement: thead,
			getState: () => ({ sortField: '' as string | number, sortOrder: '' }),
			setState: vi.fn(),
			emit: vi.fn(),
			updateData,
		});

		handler.initSort();

		const th = thead.querySelector('th')!;
		th.click();
		expect(updateData).toHaveBeenCalledTimes(1);

		// Re-init should abort previous listeners and attach new ones
		handler.initSort();
		updateData.mockClear();

		th.click();
		expect(updateData).toHaveBeenCalledTimes(1);

		handler.dispose();
	});

	it('dispose() aborts listeners without destroying th elements', () => {
		const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
			config: { sort: { classes: { base: 'sort-icon' } } } as never,
			theadElement: thead,
			getState: () => ({ sortField: '' as string | number, sortOrder: '' }),
			setState: vi.fn(),
			emit: vi.fn(),
			updateData: vi.fn(),
		});

		handler.initSort();
		const thBefore = thead.querySelector('th')!;
		thBefore.setAttribute('data-custom', 'preserved');

		handler.dispose();

		const thAfter = thead.querySelector('th')!;
		expect(thAfter).toBe(thBefore);
		expect(thAfter.getAttribute('data-custom')).toBe('preserved');
	});

	it('sortData pre-strips HTML for string comparison', () => {
		const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
			config: {} as never,
			theadElement: thead,
			getState: () => ({ sortField: '' as string | number, sortOrder: '' }),
			setState: vi.fn(),
			emit: vi.fn(),
			updateData: vi.fn(),
		});

		const data = [
			{ name: '<b>Zoe</b>' },
			{ name: '<span class="x">Alice</span>' },
			{ name: '<i>Bob</i>' },
		];

		const sorted = handler.sortData(data, 'name', 'asc');
		const names = sorted.map((r) => (r as Record<string, unknown>)['name']);

		expect(names).toEqual([
			'<span class="x">Alice</span>',
			'<i>Bob</i>',
			'<b>Zoe</b>',
		]);
	});

	it('sortData pre-strips HTML for numeric comparison', () => {
		const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
			config: { columns: { price: { sortType: 'numeric' } } } as never,
			theadElement: thead,
			getState: () => ({ sortField: '' as string | number, sortOrder: '' }),
			setState: vi.fn(),
			emit: vi.fn(),
			updateData: vi.fn(),
		});

		const data = [
			{ price: '<b>$123</b>' },
			{ price: '<span>$5</span>' },
			{ price: '<i>$20</i>' },
		];

		const sorted = handler.sortData(data, 'price', 'asc');
		const prices = sorted.map((r) => (r as Record<string, unknown>)['price']);

		expect(prices).toEqual([
			'<span>$5</span>',
			'<i>$20</i>',
			'<b>$123</b>',
		]);
	});
});

// ── Local Provider Filter Tests ─────────────────────────────────────

describe('Local provider filter pipeline', () => {
	const columns = ['id', 'name'];
	const rows = [
		['1', 'Alice'],
		['2', 'Bob'],
		['3', 'Charlie'],
	];

	it('applies text filter (case-insensitive)', () => {
		const config = createConfig({ pageSize: 100 });
		const { provider, store } = createProviderWithDomData(config, columns, rows);
		store.setFilter({ column: 'name', type: 'text', value: 'bo' });

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(1);
		expect(result.data).toEqual([{ id: '2', name: 'Bob' }]);
	});

	it('applies numeric filter (exact match)', () => {
		const config = createConfig({ pageSize: 100 });
		const { provider, store } = createProviderWithDomData(config, columns, rows);
		store.setFilter({ column: 'id', type: 'numeric', value: 2 });

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(1);
		expect(result.data).toEqual([{ id: '2', name: 'Bob' }]);
	});

	it('applies dateRange filter', () => {
		const dateColumns = ['date', 'name'];
		const dateRows = [
			['2024-01-01', 'Alice'],
			['2024-06-15', 'Bob'],
			['2025-01-01', 'Charlie'],
		];
		const config = createConfig({ pageSize: 100 });
		const { provider, store } = createProviderWithDomData(config, dateColumns, dateRows);
		store.setFilter({
			column: 'date',
			type: 'dateRange',
			value: { from: '2024-03-01', to: '2024-12-31' },
		});

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(1);
		expect(result.data).toEqual([{ date: '2024-06-15', name: 'Bob' }]);
	});

	it('chains multiple filters (AND logic)', () => {
		const multiColumns = ['score', 'name'];
		const multiRows = [
			['10', 'Alice'],
			['20', 'Bob'],
			['20', 'Charlie'],
			['30', 'Alice'],
		];
		const config = createConfig({ pageSize: 100 });
		const { provider, store } = createProviderWithDomData(config, multiColumns, multiRows);
		store.setFilter({ column: 'name', type: 'text', value: 'alice' });
		store.setFilter({ column: 'score', type: 'numeric', value: 30 });

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(1);
		expect(result.data).toEqual([{ score: '30', name: 'Alice' }]);
	});

	it('empty text filter value matches all rows', () => {
		const config = createConfig({ pageSize: 100 });
		const { provider, store } = createProviderWithDomData(config, columns, rows);
		store.setFilter({ column: 'name', type: 'text', value: '' });

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(3);
	});

	it('filters and paginates correctly together', () => {
		const paginateColumns = ['id', 'status'];
		const paginateRows = [
			['1', 'yes'],
			['2', 'no'],
			['3', 'yes'],
			['4', 'yes'],
			['5', 'no'],
		];
		const config = createConfig({ pageSize: 2 });
		const { provider, store } = createProviderWithDomData(config, paginateColumns, paginateRows);
		store.setFilter({ column: 'status', type: 'text', value: 'yes' });

		const result = provider.fetchSync();

		// 3 'yes' rows, page size 2 => page 1 shows 2, totalItems = 3
		expect(result.totalItems).toBe(3);
		expect(result.data).toHaveLength(2);
	});

	it('no filters returns all rows (backwards compatible)', () => {
		const config = createConfig({ pageSize: 100 });
		const { provider } = createProviderWithDomData(config, columns, rows);

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(3);
		expect(result.data).toHaveLength(3);
	});
});

// ── Checkbox Handler Scope Tests ─────────────────────────────────────

describe('Checkbox handler event scope', () => {
	it('delegates checkbox events to root element, not document.body', () => {
		const root = document.createElement('div');
		const headerCheck = document.createElement('input');
		headerCheck.type = 'checkbox';
		headerCheck.setAttribute('data-kt-datatable-check', 'true');
		root.appendChild(headerCheck);

		const rowCheck = document.createElement('input');
		rowCheck.type = 'checkbox';
		rowCheck.value = 'row-1';
		rowCheck.setAttribute('data-kt-datatable-row-check', 'true');
		const tr = document.createElement('tr');
		tr.appendChild(rowCheck);
		const tbody = document.createElement('tbody');
		tbody.appendChild(tr);
		root.appendChild(tbody);
		document.body.appendChild(root);

		const fireEvent = vi.fn();
		const config = createConfig();

		const handler = new KTDataTableCheckboxHandler(
			root,
			config,
			fireEvent,
			{
				getState: () => ({ selectedRows: [] }),
				setSelectedRows: vi.fn(),
			},
		);
		handler.init();

		rowCheck.checked = true;
		rowCheck.dispatchEvent(new Event('input', { bubbles: true }));

		expect(fireEvent).toHaveBeenCalledWith('changed');

		// Verify that a checkbox OUTSIDE root does not trigger the handler
		fireEvent.mockClear();
		const outsideCheck = document.createElement('input');
		outsideCheck.type = 'checkbox';
		outsideCheck.value = 'outside';
		outsideCheck.setAttribute('data-kt-datatable-row-check', 'true');
		document.body.appendChild(outsideCheck);

		outsideCheck.checked = true;
		outsideCheck.dispatchEvent(new Event('input', { bubbles: true }));

		expect(fireEvent).not.toHaveBeenCalled();

		handler.dispose();
	});
});

// ── update() → refreshCheckboxes() Alias Tests ──────────────────────

describe('update() alias', () => {
	it('both methods exist on the prototype', () => {
		expect(typeof KTDataTable.prototype.update).toBe('function');
		expect(typeof KTDataTable.prototype.refreshCheckboxes).toBe('function');
	});

	it('update() delegates to refreshCheckboxes()', () => {
		const spy = vi.spyOn(KTDataTable.prototype, 'refreshCheckboxes').mockImplementation(() => {});
		const instance = Object.create(KTDataTable.prototype);
		instance.update();
		expect(spy).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});
});

// ── Layout Plugin Tests ─────────────────────────────────────────────

describe('Layout plugin', () => {
	it('exports createStickyLayoutPlugin with expected hooks', () => {
		const plugin = createStickyLayoutPlugin();
		expect(plugin.afterDraw).toBeDefined();
		expect(plugin.beforeDraw).toBeDefined();
		expect(plugin.dispose).toBeDefined();
	});

	it('afterDraw attaches resize and scroll listeners', () => {
		const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
		const plugin = createStickyLayoutPlugin();

		const scrollContainer = document.createElement('div');
		scrollContainer.className = 'kt-table-wrapper';
		const root = document.createElement('div');
		root.appendChild(scrollContainer);

		const table = document.createElement('table');
		const thead = table.createTHead();
		const tbody = table.createTBody();
		scrollContainer.appendChild(table);

		const ctx = {
			rootElement: root,
			tableElement: table,
			theadElement: thead,
			tbodyElement: tbody,
			config: { lockedLayout: { stickyHeader: true } },
		} as never;

		plugin.afterDraw!(ctx);

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			'resize',
			expect.any(Function),
		);

		plugin.dispose!(ctx);
		addEventListenerSpy.mockRestore();
	});

	it('dispose removes resize listener', () => {
		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
		const plugin = createStickyLayoutPlugin();

		const scrollContainer = document.createElement('div');
		scrollContainer.className = 'kt-table-wrapper';
		const root = document.createElement('div');
		root.appendChild(scrollContainer);

		const table = document.createElement('table');
		const thead = table.createTHead();
		const tbody = table.createTBody();
		scrollContainer.appendChild(table);

		const ctx = {
			rootElement: root,
			tableElement: table,
			theadElement: thead,
			tbodyElement: tbody,
			config: { lockedLayout: { stickyHeader: true } },
		} as never;

		plugin.afterDraw!(ctx);
		plugin.dispose!(ctx);

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			'resize',
			expect.any(Function),
		);

		removeEventListenerSpy.mockRestore();
	});
});
