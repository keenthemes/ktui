/**
 * Tests for datatable architecture boundaries introduced during internal refactor.
 */

import { describe, it, expect, vi } from 'vitest';
import { KTDataTable } from '../datatable';
import { createDataTableEventAdapter } from '../datatable-event-adapter';
import { KTDataTableLocalDataProvider } from '../datatable-local-provider';
import { KTDataTableDomPaginationRenderer } from '../datatable-pagination-renderer';
import { KTDataTableRemoteDataProvider } from '../datatable-remote-provider';
import { KTDataTableConfigStateStore } from '../datatable-state-store';
import { KTDataTableDomTableRenderer } from '../datatable-table-renderer';
import { KTDataTableConfigInterface } from '../types';
import { waitFor } from './setup';

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
		requestMethod: 'GET',
		requestHeaders: {},
		pagination: {
			number: { class: 'number', text: '{page}' },
			previous: { class: 'previous', text: 'Previous' },
			next: { class: 'next', text: 'Next' },
			more: { class: 'more', text: '...' },
		},
		search: {
			delay: 0,
			callback: (data, search) =>
				data.filter((item) => String(item.name).includes(search)),
		},
		sort: {
			callback: (data) => data,
		},
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

describe('KTDataTable architecture boundaries', () => {
	it('routes state transitions through the state store', () => {
		const config = createConfig();
		const store = new KTDataTableConfigStateStore(config);

		store.setPage(3);
		store.setPageSize(20);
		store.setSort('name', 'asc');
		store.setSearch('Ada');
		store.setFilter({ column: 'status', type: 'text', value: 'active' });

		expect(store.getState()).toMatchObject({
			page: 1,
			pageSize: 20,
			sortField: 'name',
			sortOrder: 'asc',
			search: 'Ada',
		});
		expect(store.getState().filters).toEqual([
			{ column: 'status', type: 'text', value: 'active' },
		]);
		expect(config._state.page).toBe(1);
	});

	it('emits through both legacy event channels from one adapter', () => {
		const fireEvent = vi.fn();
		const dispatchEvent = vi.fn();
		const adapter = createDataTableEventAdapter(fireEvent, dispatchEvent);

		adapter.emit('reload', { page: 1 });

		expect(fireEvent).toHaveBeenCalledWith('reload', { page: 1 });
		expect(dispatchEvent).toHaveBeenCalledWith('reload', { page: 1 });
	});

	it('extracts and pages local table data through the local provider', () => {
		const config = createConfig({ pageSize: 1 });
		const stateStore = new KTDataTableConfigStateStore(config);
		const table = document.createElement('table');
		const thead = table.createTHead();
		thead.innerHTML = `
			<tr>
				<th data-kt-datatable-column="id">ID</th>
				<th data-kt-datatable-column="name">Name</th>
			</tr>
		`;
		const tbody = table.createTBody();
		tbody.innerHTML = `
			<tr><td>1</td><td>Ada</td></tr>
			<tr><td>2</td><td>Grace</td></tr>
		`;

		const provider = new KTDataTableLocalDataProvider({
			config,
			elements: () => ({
				tableElement: table,
				tbodyElement: tbody,
				theadElement: thead,
			}),
			getLogicalColumnCount: () => 2,
			storeOriginalClasses: vi.fn(),
			stateStore,
		});

		const result = provider.fetchSync();

		expect(result.totalItems).toBe(2);
		expect(result.data).toEqual([{ id: '1', name: 'Ada' }]);
		expect(stateStore.getState().originalData).toHaveLength(2);
	});

	it('normalizes remote provider fetch results and emits response event', async () => {
		const config = createConfig({ apiEndpoint: '/api/users' });
		const stateStore = new KTDataTableConfigStateStore(config);
		const emit = vi.fn();
		global.fetch = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: [{ id: 1, name: 'Ada' }],
					totalCount: 1,
				}),
			),
		);

		const provider = new KTDataTableRemoteDataProvider({
			config,
			createUrl: (pathOrUrl: string) => new URL(pathOrUrl, window.location.origin),
			eventAdapter: { emit },
			noticeOnTable: vi.fn(),
			stateStore,
		});

		const result = await provider.fetch();

		expect(result.data).toEqual([{ id: 1, name: 'Ada' }]);
		expect(result.totalItems).toBe(1);
		expect(emit).toHaveBeenCalledWith('fetched', {
			response: { data: [{ id: 1, name: 'Ada' }], totalCount: 1 },
		});
	});

	it('renders table body output through the table renderer', () => {
		const config = createConfig();
		const stateStore = new KTDataTableConfigStateStore(config);
		stateStore.setOriginalData(
			[{ id: '1', name: 'Ada' }],
			[],
		);
		const table = document.createElement('table');
		const thead = table.createTHead();
		thead.innerHTML = `
			<tr>
				<th data-kt-datatable-column="id">ID</th>
				<th data-kt-datatable-column="name">Name</th>
			</tr>
		`;
		table.createTBody();

		new KTDataTableDomTableRenderer().render({
			config,
			context: {} as KTDataTable,
			data: [{ id: '1', name: 'Ada' }],
			getLogicalColumnCount: () => 2,
			getState: () => stateStore.getState(),
			originalTbodyClass: 'body-class',
			originalTrClasses: ['row-class'],
			originalTdClasses: [['id-cell', 'name-cell']],
			tableElement: table,
			theadElement: thead,
		});

		expect(table.tBodies[0].className).toBe('body-class');
		expect(table.tBodies[0].querySelector('tr')?.className).toBe('row-class');
		expect(table.tBodies[0].querySelectorAll('td')[1].textContent).toBe('Ada');
	});

	it('renders pagination controls through the pagination renderer', async () => {
		const renderer = new KTDataTableDomPaginationRenderer();
		const config = createConfig();
		const sizeElement = document.createElement('select');
		const infoElement = document.createElement('div');
		const paginationElement = document.createElement('div');
		const paginateData = vi.fn();

		renderer.render({
			config,
			dataLength: 10,
			infoElement,
			paginateData,
			paginationElement,
			reloadPageSize: vi.fn(),
			sizeElement,
			state: {
				page: 2,
				pageSize: 10,
				totalItems: 25,
				totalPages: 3,
				filters: [],
			} as never,
		});

		await waitFor(120);

		expect(infoElement.textContent).toBe('11-20 of 25');
		expect(sizeElement.querySelectorAll('option')).toHaveLength(2);
		expect(paginationElement.querySelectorAll('button')).toHaveLength(5);
		paginationElement.querySelectorAll('button')[1].click();
		expect(paginateData).toHaveBeenCalledWith(1);
	});

	it('keeps local and remote provider selection compatible through KTDataTable', async () => {
		const element = document.createElement('div');
		element.innerHTML = `
			<table data-kt-datatable-table="true">
				<thead><tr><th data-kt-datatable-column="name">Name</th></tr></thead>
				<tbody><tr><td>Ada</td></tr></tbody>
			</table>
			<div data-kt-datatable-info="true"></div>
			<select data-kt-datatable-size="true"></select>
			<div data-kt-datatable-pagination="true"></div>
		`;
		document.body.appendChild(element);

		const fetchSpy = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: [{ name: 'Ada' }], totalCount: 1 })),
		);
		global.fetch = fetchSpy;

		new KTDataTable(element, { stateSave: false });
		expect(fetchSpy).not.toHaveBeenCalled();

		const remoteElement = element.cloneNode(true) as HTMLElement;
		document.body.appendChild(remoteElement);
		new KTDataTable(remoteElement, {
			apiEndpoint: '/api/users',
			stateSave: false,
		});
		await waitFor(0);

		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
