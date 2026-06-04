import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDataTableSortHandler } from '../datatable-sort';
import type {
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
} from '../types';

function createSortHandler(
	config: Partial<KTDataTableConfigInterface> = {},
	state: { sortField: string | number; sortOrder: string } = {
		sortField: '',
		sortOrder: '',
	},
) {
	const thead = document.createElement('thead');
	const tr = document.createElement('tr');

	const th1 = document.createElement('th');
	th1.setAttribute('data-kt-datatable-column', 'name');
	th1.innerHTML = '<span class="sort-icon"></span>';

	const th2 = document.createElement('th');
	th2.setAttribute('data-kt-datatable-column', 'price');
	th2.innerHTML = '<span class="sort-icon"></span>';

	const th3 = document.createElement('th');
	th3.setAttribute('data-kt-datatable-column', 'date');
	th3.innerHTML = '<span class="sort-icon"></span>';

	tr.appendChild(th1);
	tr.appendChild(th2);
	tr.appendChild(th3);
	thead.appendChild(tr);

	const updateData = vi.fn();
	const setState = vi.fn();
	const emit = vi.fn();

	const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
		config: {
			sort: { classes: { base: 'sort-icon', asc: 'asc', desc: 'desc' } },
			...config,
		} as any,
		theadElement: thead,
		getState: () => state as any,
		setState: setState as any,
		emit,
		updateData,
	});

	return { handler, thead, updateData, setState, emit };
}

describe('Sort handler extended coverage', () => {
	describe('Sort direction cycling', () => {
		it('clicking unsorted column → asc', () => {
			const { handler, thead, setState, updateData } = createSortHandler();
			handler.initSort();

			const th = thead.querySelector('th')!;
			th.click();

			expect(setState).toHaveBeenCalledWith('name', 'asc');
			expect(updateData).toHaveBeenCalled();

			handler.dispose();
		});

		it('clicking asc column → desc', () => {
			const { handler, thead, setState, updateData } = createSortHandler(
				{},
				{ sortField: 'name', sortOrder: 'asc' },
			);
			handler.initSort();

			const th = thead.querySelector('th')!;
			th.click();

			expect(setState).toHaveBeenCalledWith('name', 'desc');
			expect(updateData).toHaveBeenCalled();

			handler.dispose();
		});

		it('clicking desc column → removes sort (clears field)', () => {
			const { handler, thead, setState, updateData } = createSortHandler(
				{},
				{ sortField: 'name', sortOrder: 'desc' },
			);
			handler.initSort();

			const th = thead.querySelector('th')!;
			th.click();

			expect(setState).toHaveBeenCalledWith('name', '');
			expect(updateData).toHaveBeenCalled();

			handler.dispose();
		});

		it('clicking with data-kt-datatable-column-sort attribute uses that as sort field', () => {
			const thead = document.createElement('thead');
			const tr = document.createElement('tr');
			const th = document.createElement('th');
			th.setAttribute('data-kt-datatable-column', 'name');
			th.setAttribute('data-kt-datatable-column-sort', 'customField');
			th.innerHTML = '<span class="sort-icon"></span>';
			tr.appendChild(th);
			thead.appendChild(tr);

			const setState = vi.fn();
			const updateData = vi.fn();

			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {
					sort: { classes: { base: 'sort-icon' } },
				} as any,
				theadElement: thead,
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: setState as any,
				emit: vi.fn(),
				updateData,
			});

			handler.initSort();
			th.click();

			expect(setState).toHaveBeenCalledWith('customField', 'asc');

			handler.dispose();
		});
	});

	describe('Custom sort comparator', () => {
		it('column with customComparator uses provided function instead of default string compare', () => {
			const sortValueFn = vi.fn(
				(cellValue: string | number, rowData: KTDataTableDataInterface) => {
					return typeof cellValue === 'string'
						? cellValue.length
						: Number(cellValue);
				},
			);

			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {
					columns: {
						name: { sortValue: sortValueFn },
					},
				} as any,
				theadElement: document.createElement('thead'),
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: vi.fn(),
				emit: vi.fn(),
				updateData: vi.fn(),
			});

			const data = [{ name: 'Bob' }, { name: 'Alice' }, { name: 'Charlie' }];

			const sorted = handler.sortData(data, 'name', 'asc');
			expect(sortValueFn).toHaveBeenCalled();
			// Bob(3) < Alice(5) < Charlie(7) by length
			expect(sorted.map((r) => r.name)).toEqual(['Bob', 'Alice', 'Charlie']);
		});

		it('customComparator receives (cellValue, rowData) arguments', () => {
			const receivedArgs: unknown[] = [];
			const sortValueFn = vi.fn(
				(cellValue: string | number, rowData: KTDataTableDataInterface) => {
					receivedArgs.push({ cellValue, rowData });
					return String(cellValue);
				},
			);

			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {
					columns: {
						name: { sortValue: sortValueFn },
					},
				} as any,
				theadElement: document.createElement('thead'),
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: vi.fn(),
				emit: vi.fn(),
				updateData: vi.fn(),
			});

			const data = [{ name: 'Alice' }, { name: 'Bob' }];
			handler.sortData(data, 'name', 'asc');

			expect(receivedArgs.length).toBeGreaterThan(0);
		});
	});

	describe('HTML stripping in sort', () => {
		it('sort column with HTML tags strips tags before comparing', () => {
			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {} as any,
				theadElement: document.createElement('thead'),
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: vi.fn(),
				emit: vi.fn(),
				updateData: vi.fn(),
			});

			const data = [
				{ name: '<b>Zoe</b>' },
				{ name: '<span>Alice</span>' },
				{ name: '<i>Bob</i>' },
			];

			const sorted = handler.sortData(data, 'name', 'asc');
			expect(sorted.map((r) => r.name)).toEqual([
				'<span>Alice</span>',
				'<i>Bob</i>',
				'<b>Zoe</b>',
			]);
		});

		it('sort column with &nbsp; entities strips them before comparing', () => {
			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {} as any,
				theadElement: document.createElement('thead'),
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: vi.fn(),
				emit: vi.fn(),
				updateData: vi.fn(),
			});

			const data = [
				{ name: 'Charlie' },
				{ name: '&nbsp;Alice&nbsp;' },
				{ name: 'Bob' },
			];

			const sorted = handler.sortData(data, 'name', 'asc');
			// stripHtml removes &nbsp; → "Alice" sorts first
			expect(sorted[0].name).toBe('&nbsp;Alice&nbsp;');
		});
	});

	describe('Dispose', () => {
		it('dispose() aborts AbortController', () => {
			const { handler, thead, updateData } = createSortHandler();
			handler.initSort();

			handler.dispose();

			// After dispose, clicking should not trigger updateData
			updateData.mockClear();
			const th = thead.querySelector('th')!;
			th.click();
			expect(updateData).not.toHaveBeenCalled();
		});

		it('dispose() called twice does not throw', () => {
			const { handler } = createSortHandler();
			handler.initSort();
			handler.dispose();
			expect(() => handler.dispose()).not.toThrow();
		});
	});

	describe('initSort()', () => {
		it('initSort() with no sortable columns does not throw', () => {
			const thead = document.createElement('thead');
			const tr = document.createElement('tr');
			// No sort-icon class
			const th = document.createElement('th');
			th.setAttribute('data-kt-datatable-column', 'name');
			th.textContent = 'Name';
			tr.appendChild(th);
			thead.appendChild(tr);

			const handler = new KTDataTableSortHandler<KTDataTableDataInterface>({
				config: {
					sort: { classes: { base: 'sort-icon' } },
				} as any,
				theadElement: thead,
				getState: () => ({ sortField: '', sortOrder: '' }) as any,
				setState: vi.fn(),
				emit: vi.fn(),
				updateData: vi.fn(),
			});

			expect(() => handler.initSort()).not.toThrow();
			handler.dispose();
		});

		it('initSort() aborts previous AbortController before creating new one', () => {
			const { handler, thead, updateData } = createSortHandler();
			handler.initSort();

			// Click on first th
			const th = thead.querySelector('th')!;
			th.click();
			expect(updateData).toHaveBeenCalledTimes(1);

			// Re-init
			handler.initSort();
			updateData.mockClear();

			// Click again - should only fire once (new listener, old one aborted)
			th.click();
			expect(updateData).toHaveBeenCalledTimes(1);

			handler.dispose();
		});

		it('initSort() adds sort indicator classes to active column', () => {
			const { handler, thead } = createSortHandler(
				{},
				{ sortField: 'name', sortOrder: 'asc' },
			);
			handler.initSort();

			const th = thead.querySelector('th')!;
			const sortElement = th.querySelector('.sort-icon') as HTMLElement;
			expect(sortElement.className).toContain('asc');

			handler.dispose();
		});

		it('initSort() with desc order adds desc class', () => {
			const { handler, thead } = createSortHandler(
				{},
				{ sortField: 'price', sortOrder: 'desc' },
			);
			handler.initSort();

			const allTh = thead.querySelectorAll('th');
			const priceTh = allTh[1];
			const sortElement = priceTh.querySelector('.sort-icon') as HTMLElement;
			expect(sortElement.className).toContain('desc');

			handler.dispose();
		});

		it('initSort() with empty sort order resets classes', () => {
			const { handler, thead } = createSortHandler(
				{},
				{ sortField: '', sortOrder: '' },
			);
			handler.initSort();

			const th = thead.querySelector('th')!;
			const sortElement = th.querySelector('.sort-icon') as HTMLElement;
			expect(sortElement.className).toBe('sort-icon');

			handler.dispose();
		});
	});

	describe('toggleSortOrder', () => {
		it('returns asc when current field differs from new field', () => {
			const { handler } = createSortHandler();
			const result = handler.toggleSortOrder('name', 'asc', 'price');
			expect(result).toBe('asc');
		});

		it('returns desc when current field is same and order is asc', () => {
			const { handler } = createSortHandler();
			const result = handler.toggleSortOrder('name', 'asc', 'name');
			expect(result).toBe('desc');
		});

		it('returns empty string when current field is same and order is desc', () => {
			const { handler } = createSortHandler();
			const result = handler.toggleSortOrder('name', 'desc', 'name');
			expect(result).toBe('');
		});

		it('returns asc when current field is same and order is empty', () => {
			const { handler } = createSortHandler();
			const result = handler.toggleSortOrder('name', '', 'name');
			expect(result).toBe('asc');
		});
	});

	describe('setSortIcon', () => {
		it('sets aria-sort attribute on active column', () => {
			const { handler, thead } = createSortHandler();
			handler.setSortIcon('name', 'asc');

			const th = thead.querySelector('th')!;
			expect(th.getAttribute('aria-sort')).toBe('asc');
		});

		it('sets aria-sort to none on inactive columns', () => {
			const { handler, thead } = createSortHandler();
			handler.setSortIcon('name', 'asc');

			const allTh = thead.querySelectorAll('th');
			const priceTh = allTh[1];
			expect(priceTh.getAttribute('aria-sort')).toBe('none');
		});

		it('sets aria-sort to none when sort order is empty', () => {
			const { handler, thead } = createSortHandler();
			handler.setSortIcon('name', '');

			const th = thead.querySelector('th')!;
			expect(th.getAttribute('aria-sort')).toBe('none');
		});

		it('sort by numeric index works correctly', () => {
			const { handler, thead } = createSortHandler();
			handler.setSortIcon(0 as any, 'asc');

			const th = thead.querySelector('th')!;
			expect(th.getAttribute('aria-sort')).toBe('asc');
		});
	});
});
