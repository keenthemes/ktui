import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../index', () => ({
	default: { init: vi.fn() },
}));

vi.mock('../../helpers/data', () => {
	const map = new Map();
	return {
		default: {
			set: vi.fn((el: HTMLElement, key: string, val: unknown) => {
				if (!map.has(el)) map.set(el, new Map());
				map.get(el).set(key, val);
			}),
			get: vi.fn((el: HTMLElement, key: string) => {
				return map.has(el) ? map.get(el).get(key) ?? null : null;
			}),
			has: vi.fn((el: HTMLElement, key: string) => {
				return map.has(el) && map.get(el).has(key);
			}),
			remove: vi.fn((el: HTMLElement, key: string) => {
				if (map.has(el)) map.get(el).delete(key);
			}),
			clear: vi.fn((el: HTMLElement) => {
				map.delete(el);
			}),
		},
	};
});

import { KTDataTable, initAllDataTables } from '../datatable';

function createLocalTableHtml(): string {
	return `
    <div data-kt-datatable="true">
      <table data-kt-datatable-table="true">
        <thead>
          <tr>
            <th data-kt-datatable-column="0" data-kt-datatable-column-sort="false">Name</th>
            <th data-kt-datatable-column="1">Age</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Alice</td><td>30</td></tr>
          <tr><td>Bob</td><td>25</td></tr>
          <tr><td>Charlie</td><td>35</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function createLocalDatatable() {
	const container = document.createElement('div');
	container.innerHTML = createLocalTableHtml();
	document.body.appendChild(container);
	const table = container.querySelector(
		'[data-kt-datatable]',
	) as HTMLElement;
	return { container, table };
}

describe('KTDataTable public API', () => {
	describe('reload and redraw', () => {
		it('reload() calls _updateData (local mode, synchronous)', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spy = vi.spyOn(dt as any, '_updateData');
			dt.reload();
			expect(spy).toHaveBeenCalled();
			dt.dispose();
		});

		it('redraw() calls _paginateData with default page 1', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spy = vi.spyOn(dt as any, '_paginateData');
			dt.redraw();
			expect(spy).toHaveBeenCalledWith(1);
			dt.dispose();
		});

		it('redraw(3) calls _paginateData with page 3', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spy = vi.spyOn(dt as any, '_paginateData');
			dt.redraw(3);
			expect(spy).toHaveBeenCalledWith(3);
			dt.dispose();
		});
	});

	describe('Spinner', () => {
		it('showSpinner() shows loading spinner', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spinner = (dt as any)._spinner;
			const spy = vi.spyOn(spinner, 'show');
			dt.showSpinner();
			expect(spy).toHaveBeenCalled();
			dt.dispose();
		});

		it('hideSpinner() hides loading spinner', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spinner = (dt as any)._spinner;
			const spy = vi.spyOn(spinner, 'hide');
			dt.hideSpinner();
			expect(spy).toHaveBeenCalled();
			dt.dispose();
		});
	});

	describe('setFilter', () => {
		it('setFilter() stores filter and returns this (chainable)', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const result = dt.setFilter({
				column: 'name',
				type: 'text',
				value: 'Alice',
			});
			expect(result).toBe(dt);
			const state = dt.getState();
			expect(state.filters).toContainEqual({
				column: 'name',
				type: 'text',
				value: 'Alice',
			});
			dt.dispose();
		});
	});

	describe('search', () => {
		it('search("query") sets search state and reloads', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const reloadSpy = vi.spyOn(dt, 'reload');
			dt.search('Alice');
			expect(reloadSpy).toHaveBeenCalled();
			const state = dt.getState();
			expect(state.search).toBe('Alice');
			dt.dispose();
		});
	});

	describe('Static methods', () => {
		it('KTDataTable.getInstance() returns instance for registered element', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const instance = KTDataTable.getInstance(table);
			expect(instance).toBe(dt);
			dt.dispose();
		});

		it('KTDataTable.getInstance() returns undefined for unregistered element', () => {
			const el = document.createElement('div');
			expect(KTDataTable.getInstance(el)).toBeUndefined();
		});

		it('KTDataTable.createInstances() creates instances for [data-kt-datatable] elements', () => {
			const container = document.createElement('div');
			container.innerHTML = `
        <div data-kt-datatable="true">
          <table data-kt-datatable-table="true">
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Test</td></tr></tbody>
          </table>
        </div>
      `;
			document.body.appendChild(container);

			KTDataTable.createInstances();
			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			const instance = KTDataTable.getInstance(el);
			expect(instance).toBeDefined();
			instance?.dispose();
		});
	});

	describe('dispose', () => {
		it('dispose() calls remoteProvider.dispose() if remote mode', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const remoteProvider = (dt as any)._remoteProvider;
			const spy = vi.spyOn(remoteProvider, 'dispose');
			dt.dispose();
			expect(spy).toHaveBeenCalled();
		});

		it('dispose() calls _dispose() cleanup', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			const spy = vi.spyOn(dt as any, '_dispose');
			dt.dispose();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('_emit helper', () => {
		it('_emit dispatches both internal and DOM CustomEvent', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);

			const handler = vi.fn();
			dt.on('test-event', handler);

			table.addEventListener('kt.datatable.test-event', ((e: CustomEvent) => {
				expect(e.detail).toBeDefined();
			}) as EventListener);

			(dt as any)._emit('test-event', { foo: 'bar' });
			expect(handler).toHaveBeenCalledWith({ foo: 'bar' });

			dt.dispose();
		});

		it('_emit with no listeners does not throw', () => {
			const { table } = createLocalDatatable();
			const dt = new KTDataTable(table);
			expect(() => (dt as any)._emit('nonexistent-event')).not.toThrow();
			dt.dispose();
		});
	});

	describe('initAllDataTables', () => {
		it('initAllDataTables creates instances and assigns to window', () => {
			const container = document.createElement('div');
			container.innerHTML = `
        <div data-kt-datatable="true">
          <table data-kt-datatable-table="true">
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Test</td></tr></tbody>
          </table>
        </div>
      `;
			document.body.appendChild(container);

			initAllDataTables();

			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			const instance = KTDataTable.getInstance(el);
			expect(instance).toBeDefined();
			expect((window as any).KTDataTable).toBe(KTDataTable);

			instance?.dispose();
		});
	});
});
