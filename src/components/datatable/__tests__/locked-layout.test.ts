import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KTDataTable } from '../datatable';

type DataRow = {
	id: string;
	name: string;
	status: string;
};

const rows: DataRow[] = [
	{ id: '1', name: 'Alpha', status: 'Active' },
	{ id: '2', name: 'Beta', status: 'Pending' },
	{ id: '3', name: 'Gamma', status: 'Disabled' },
];

const createDatatableFixture = () => {
	const wrapper = document.createElement('div');
	wrapper.className = 'kt-table-wrapper';

	const container = document.createElement('div');
	container.id = 'kt_datatable_locked_layout';
	container.setAttribute('data-kt-datatable', 'true');

	const table = document.createElement('table');
	table.setAttribute('data-kt-datatable-table', 'true');

	const thead = document.createElement('thead');
	thead.innerHTML = `
		<tr>
			<th data-kt-datatable-column="id">ID</th>
			<th data-kt-datatable-column="name">Name</th>
			<th data-kt-datatable-column="status">Status</th>
		</tr>
	`;
	table.appendChild(thead);

	const tbody = document.createElement('tbody');
	rows.forEach((row) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${row.id}</td><td>${row.name}</td><td>${row.status}</td>`;
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);

	wrapper.appendChild(table);
	container.appendChild(wrapper);

	const info = document.createElement('span');
	info.setAttribute('data-kt-datatable-info', 'true');
	const size = document.createElement('select');
	size.setAttribute('data-kt-datatable-size', 'true');
	const pagination = document.createElement('div');
	pagination.setAttribute('data-kt-datatable-pagination', 'true');

	container.appendChild(info);
	container.appendChild(size);
	container.appendChild(pagination);
	document.body.appendChild(container);

	const sizedCells = table.querySelectorAll<HTMLTableCellElement>('th, td');
	sizedCells.forEach((cell) => {
		Object.defineProperty(cell, 'getBoundingClientRect', {
			value: () =>
				({
					width: 120,
					height: 40,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					x: 0,
					y: 0,
					toJSON: () => ({}),
				}) as DOMRect,
		});
	});

	return { container, table };
};

describe('KTDataTable locked layout plugin', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('applies locked header, rows and columns in local mode and keeps them after sorting', async () => {
		const { container, table } = createDatatableFixture();

		const datatable = new KTDataTable<DataRow>(container, {
			stateSave: false,
			columns: {
				id: { title: 'ID' },
				name: { title: 'Name' },
				status: { title: 'Status' },
			},
			lockedLayout: {
				stickyHeader: true,
				stickyRows: { top: 1, bottom: 1 },
				stickyColumns: { left: ['id'], right: ['status'] },
			},
		});

		await vi.runAllTimersAsync();

		expect(
			table.querySelectorAll('.kt-datatable-locked-header').length,
		).toBeGreaterThan(0);
		expect(
			table.querySelectorAll('.kt-datatable-locked-top-row').length,
		).toBeGreaterThan(0);
		expect(
			table.querySelectorAll('.kt-datatable-locked-bottom-row').length,
		).toBeGreaterThan(0);
		expect(
			table.querySelectorAll('.kt-datatable-locked-left').length,
		).toBeGreaterThan(0);
		expect(
			table.querySelectorAll('.kt-datatable-locked-right').length,
		).toBeGreaterThan(0);

		datatable.sort('name');
		await vi.runAllTimersAsync();

		expect(
			table.querySelectorAll('.kt-datatable-locked-cell').length,
		).toBeGreaterThan(0);
	});

	it('reapplies locked layout after remote fetch redraw', async () => {
		const { container, table } = createDatatableFixture();
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ data: rows, totalCount: rows.length }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		new KTDataTable<DataRow>(container, {
			stateSave: false,
			apiEndpoint: 'https://example.test/datatable',
			requestMethod: 'GET',
			mapResponse: (data) => data,
			lockedLayout: {
				stickyHeader: true,
				stickyColumns: { left: ['id'] },
			},
		});

		await vi.runAllTimersAsync();

		expect(fetchMock).toHaveBeenCalled();
		expect(
			table.querySelectorAll('.kt-datatable-locked-header').length,
		).toBeGreaterThan(0);
		expect(
			table.querySelectorAll('.kt-datatable-locked-left').length,
		).toBeGreaterThan(0);
	});

	it('uses opaque fallback background for locked header columns with alpha colors', async () => {
		const { container, table } = createDatatableFixture();
		const firstHeaderCell = table.querySelector(
			'th[data-kt-datatable-column="id"]',
		) as HTMLTableCellElement | null;
		expect(firstHeaderCell).not.toBeNull();
		if (!firstHeaderCell) {
			return;
		}

		const originalGetComputedStyle = window.getComputedStyle;
		const rootComputedStyle = {
			backgroundColor: 'rgb(255, 255, 255)',
			getPropertyValue: (name: string) =>
				name === '--color-card' ? 'rgb(255, 255, 255)' : '',
		} as CSSStyleDeclaration;
		const tableComputedStyle = {
			backgroundColor: 'rgb(255, 255, 255)',
			getPropertyValue: (_name: string) => '',
		} as CSSStyleDeclaration;
		const alphaHeaderStyle = {
			backgroundColor: 'oklch(0.97 0.01 250 / 0.4)',
			getPropertyValue: (_name: string) => '',
		} as CSSStyleDeclaration;
		window.getComputedStyle = vi.fn((element: Element) => {
			if (element === container) {
				return rootComputedStyle;
			}
			if (element === table) {
				return tableComputedStyle;
			}
			if (element === firstHeaderCell) {
				return alphaHeaderStyle;
			}
			return originalGetComputedStyle(element);
		}) as typeof window.getComputedStyle;

		try {
			new KTDataTable<DataRow>(container, {
				stateSave: false,
				columns: {
					id: { title: 'ID' },
					name: { title: 'Name' },
					status: { title: 'Status' },
				},
				lockedLayout: {
					stickyHeader: true,
					stickyColumns: { left: ['id'] },
				},
			});

			await vi.runAllTimersAsync();

			const lockedHeaderCell = table.querySelector(
				'th.kt-datatable-locked-left',
			) as HTMLTableCellElement | null;
			expect(lockedHeaderCell).not.toBeNull();
			expect(lockedHeaderCell?.style.backgroundColor).toBe(
				'rgb(255, 255, 255)',
			);
		} finally {
			window.getComputedStyle = originalGetComputedStyle;
		}
	});
});
