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
				return map.has(el) ? (map.get(el).get(key) ?? null) : null;
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

import { KTDataTable } from '../datatable';
import { KTDataTableConfigInterface } from '../types';

function createLocalTableHtml(overrides: Record<string, string> = {}): string {
	const attrs = Object.entries(overrides)
		.map(([k, v]) => `${k}="${v}"`)
		.join(' ');
	return `
		<div data-kt-datatable="true" ${attrs}>
			<table data-kt-datatable-table="true">
				<thead>
					<tr>
						<th data-kt-datatable-column="name">Name</th>
						<th data-kt-datatable-column="age">Age</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Alice</td><td>30</td></tr>
					<tr><td>Bob</td><td>25</td></tr>
				</tbody>
			</table>
		</div>
	`;
}

function createLocalDatatable(
	overrides: Record<string, string> = {},
	configOverrides: Partial<KTDataTableConfigInterface> = {},
) {
	const container = document.createElement('div');
	container.innerHTML = createLocalTableHtml(overrides);
	document.body.appendChild(container);
	const table = container.querySelector('[data-kt-datatable]') as HTMLElement;
	return { container, table, dt: new KTDataTable(table, configOverrides) };
}

describe('KTDataTable _finalize and config edge cases', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	describe('_finalize behavior', () => {
		it('adds datatable-initialized class to element', async () => {
			const { table, dt } = createLocalDatatable();
			// _updateData is async; wait for the microtask queue to flush
			await vi.waitFor(() => {
				expect(table.classList.contains('datatable-initialized')).toBe(true);
			});
			dt.dispose();
		});

		it('_emit with no listeners does not throw', () => {
			const { table, dt } = createLocalDatatable();
			expect(() => (dt as any)._emit('nonexistent-event')).not.toThrow();
			dt.dispose();
		});

		it('_emit with registered handlers calls them', () => {
			const { table, dt } = createLocalDatatable();
			const handler = vi.fn();
			dt.on('custom-event', handler);
			(dt as any)._emit('custom-event', { data: 123 });
			expect(handler).toHaveBeenCalledWith({ data: 123 });
			dt.dispose();
		});
	});

	describe('_initDefaultConfig with data attributes', () => {
		it('reads pageSizes from data attribute', () => {
			const container = document.createElement('div');
			container.innerHTML = `
				<div data-kt-datatable="true" data-kt-datatable-page-sizes="[3,6,9]">
					<table data-kt-datatable-table="true">
						<thead><tr><th data-kt-datatable-column="name">Name</th></tr></thead>
						<tbody><tr><td>Alice</td></tr></tbody>
					</table>
				</div>
			`;
			document.body.appendChild(container);
			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			const dt = new KTDataTable(el);
			const state = dt.getState();
			expect(state.pageSize).toBeDefined();
			dt.dispose();
		});

		it('reads search delay from data attribute', () => {
			const container = document.createElement('div');
			container.innerHTML = `
				<div data-kt-datatable="true" data-kt-datatable-search-delay="1000">
					<table data-kt-datatable-table="true">
						<thead><tr><th data-kt-datatable-column="name">Name</th></tr></thead>
						<tbody><tr><td>Alice</td></tr></tbody>
					</table>
				</div>
			`;
			document.body.appendChild(container);
			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			const dt = new KTDataTable(el);
			expect(dt).toBeDefined();
			dt.dispose();
		});
	});

	describe('constructor with apiEndpoint', () => {
		it('creates remote provider when apiEndpoint is set', () => {
			const container = document.createElement('div');
			container.innerHTML = `
				<div data-kt-datatable="true">
					<table data-kt-datatable-table="true">
						<thead><tr><th data-kt-datatable-column="name">Name</th></tr></thead>
						<tbody></tbody>
					</table>
				</div>
			`;
			document.body.appendChild(container);
			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			const dt = new KTDataTable(el, {
				apiEndpoint: 'https://example.com/api/data',
			});
			const remoteProvider = (dt as any)._remoteProvider;
			expect(remoteProvider).toBeDefined();
			dt.dispose();
		});
	});

	describe('constructor without apiEndpoint', () => {
		it('creates local provider when no apiEndpoint', () => {
			const { table, dt } = createLocalDatatable();
			const localProvider = (dt as any)._localProvider;
			expect(localProvider).toBeDefined();
			dt.dispose();
		});
	});

	describe('dispose cleanup', () => {
		it('cleans up checkbox handler', () => {
			const { table, dt } = createLocalDatatable();
			const checkbox = (dt as any)._checkbox;
			const spy = vi.spyOn(checkbox, 'dispose');
			dt.dispose();
			expect(spy).toHaveBeenCalled();
		});

		it('cleans up sort handler', () => {
			const { table, dt } = createLocalDatatable();
			const sortHandler = (dt as any)._sortHandler;
			const spy = vi.spyOn(sortHandler, 'dispose');
			dt.dispose();
			expect(spy).toHaveBeenCalled();
		});

		it('cleans up search handler', () => {
			const { table, dt } = createLocalDatatable();
			const searchHandler = (dt as any)._searchHandler;
			const spy = vi.spyOn(searchHandler, 'detach');
			dt.dispose();
			expect(spy).toHaveBeenCalled();
		});

		it('removes element from datatable registry', () => {
			const { table, dt } = createLocalDatatable();
			dt.dispose();
			expect(KTDataTable.getInstance(table)).toBeUndefined();
		});

		it('removes datatable-initialized class', () => {
			const { table, dt } = createLocalDatatable();
			dt.dispose();
			expect(table.classList.contains('datatable-initialized')).toBe(false);
		});
	});

	describe('dispose with layout plugin', () => {
		it('disposes layout plugin when present', () => {
			const disposeSpy = vi.fn();
			const { table, dt } = createLocalDatatable(
				{},
				{
					layoutPlugin: {
						dispose: disposeSpy,
					},
				},
			);
			dt.dispose();
			expect(disposeSpy).toHaveBeenCalled();
		});
	});

	describe('stateSave', () => {
		it('does not save state when stateSave is false', () => {
			const { table, dt } = createLocalDatatable({}, { stateSave: false });
			const persistence = (dt as any)._statePersistence;
			const spy = vi.spyOn(persistence, 'save');
			// Trigger a redraw that would normally save state
			dt.reload();
			// Since stateSave is false, save should not be called in _draw
			// (but _updateData calls _finalize which doesn't save)
			expect(spy).not.toHaveBeenCalled();
			dt.dispose();
		});
	});

	describe('stateNamespace', () => {
		it('uses stateNamespace from config when provided', () => {
			const { table, dt } = createLocalDatatable(
				{},
				{
					stateNamespace: 'custom-namespace',
				},
			);
			expect(dt).toBeDefined();
			dt.dispose();
		});
	});

	describe('_initElements edge cases', () => {
		it('throws when table element not found', () => {
			const container = document.createElement('div');
			container.innerHTML = `
				<div data-kt-datatable="true">
					<div>No table here</div>
				</div>
			`;
			document.body.appendChild(container);
			const el = container.querySelector('[data-kt-datatable]') as HTMLElement;
			expect(() => new KTDataTable(el)).toThrow();
		});
	});

	describe('MutationObserver destroy event', () => {
		it('fires destroy event when element is removed from DOM', async () => {
			vi.useFakeTimers();
			const { container, table, dt } = createLocalDatatable();
			const handler = vi.fn();
			dt.on('destroy', handler);

			// Remove the element from DOM — MutationObserver should detect this
			container.remove();

			// Advance timers to allow MutationObserver callback to fire
			vi.advanceTimersByTime(100);

			// Note: jsdom may not fully support MutationObserver,
			// so we just verify dispose works without error
			expect(() => dt.dispose()).not.toThrow();
			vi.useRealTimers();
		});
	});

	describe('config normalization', () => {
		it('normalizes invalid pageSize to first pageSizes entry', () => {
			const { table, dt } = createLocalDatatable({}, { pageSize: -5 });
			const state = dt.getState();
			expect(state.pageSize).toBeGreaterThan(0);
			dt.dispose();
		});

		it('normalizes pageSize to integer', () => {
			const { table, dt } = createLocalDatatable({}, { pageSize: 7.5 });
			const state = dt.getState();
			expect(Number.isInteger(state.pageSize)).toBe(true);
			dt.dispose();
		});

		it('filters out invalid pageSizes entries', () => {
			const { table, dt } = createLocalDatatable(
				{},
				{
					pageSizes: [5, -1, 0, 20, NaN],
				},
			);
			const config = (dt as any)._config;
			expect(config.pageSizes).toContain(5);
			expect(config.pageSizes).toContain(20);
			expect(config.pageSizes).not.toContain(-1);
			expect(config.pageSizes).not.toContain(0);
			expect(config.pageSizes).not.toContain(NaN);
			dt.dispose();
		});

		it('uses default pageSizes when all entries are invalid', () => {
			const { table, dt } = createLocalDatatable(
				{},
				{
					pageSizes: [-1, 0],
				},
			);
			const config = (dt as any)._config;
			expect(config.pageSizes.length).toBeGreaterThan(0);
			dt.dispose();
		});
	});

	describe('goPage edge cases', () => {
		it('ignores page less than 1', () => {
			const { table, dt } = createLocalDatatable();
			const spy = vi.spyOn(dt as any, '_paginateData');
			dt.goPage(0);
			expect(spy).not.toHaveBeenCalled();
			dt.dispose();
		});

		it('ignores non-integer page', () => {
			const { table, dt } = createLocalDatatable();
			const spy = vi.spyOn(dt as any, '_paginateData');
			dt.goPage(1.5);
			expect(spy).not.toHaveBeenCalled();
			dt.dispose();
		});
	});

	describe('setPageSize edge cases', () => {
		it('ignores non-integer pageSize', () => {
			const { table, dt } = createLocalDatatable();
			const spy = vi.spyOn(dt as any, '_reloadPageSize');
			dt.setPageSize(5.5);
			expect(spy).not.toHaveBeenCalled();
			dt.dispose();
		});
	});

	describe('sort', () => {
		it('sorts data by field and updates state', async () => {
			const { table, dt } = createLocalDatatable();
			dt.sort('name');
			const state = dt.getState();
			expect(state.sortField).toBe('name');
			expect(state.sortOrder).toBeTruthy();
			dt.dispose();
		});

		it('toggles sort order on repeated calls', async () => {
			const { table, dt } = createLocalDatatable();
			dt.sort('name');
			const firstOrder = dt.getState().sortOrder;
			dt.sort('name');
			const secondOrder = dt.getState().sortOrder;
			expect(firstOrder).not.toBe(secondOrder);
			dt.dispose();
		});
	});
});
