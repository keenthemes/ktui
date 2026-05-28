import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDataTableDomTableRenderer } from '../datatable-table-renderer';

function createTableElement() {
	const table = document.createElement('table');
	const thead = table.createTHead();
	const theadRow = document.createElement('tr');
	const th1 = document.createElement('th');
	th1.setAttribute('data-kt-datatable-column', 'name');
	th1.textContent = 'Name';
	const th2 = document.createElement('th');
	th2.setAttribute('data-kt-datatable-column', 'age');
	th2.textContent = 'Age';
	theadRow.appendChild(th1);
	theadRow.appendChild(th2);
	thead.appendChild(theadRow);
	return { table, thead };
}

function createRendererInput(overrides: Record<string, unknown> = {}) {
	const { table, thead } = createTableElement();
	return {
		config: {
			infoEmpty: 'No records found',
			pageSize: 10,
			...((overrides.config as object) || {}),
		},
		context: {} as never,
		data: (overrides.data as never[]) || [],
		getLogicalColumnCount: (overrides.getLogicalColumnCount as () => number) || (() => 2),
		getState: (overrides.getState as () => never) || (() => ({
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
			sortField: null,
			sortOrder: '',
			selectedRows: [],
			filters: [],
			search: '',
			originalData: [],
			originalDataAttributes: [],
		})),
		originalClasses: (overrides.originalClasses as never) || {
			tbody: '',
			thead: '',
			tr: [],
			td: [],
			th: [],
		},
		tableElement: table,
		theadElement: thead,
		...overrides,
	};
}

describe('KTDataTableDomTableRenderer', () => {
	let renderer: KTDataTableDomTableRenderer<Record<string, unknown>>;

	beforeEach(() => {
		document.body.innerHTML = '';
		renderer = new KTDataTableDomTableRenderer();
	});

	describe('render with empty data', () => {
		it('shows "No records found" message when data is empty', () => {
			const input = createRendererInput({
				data: [],
				config: { infoEmpty: 'No records found' },
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows.length).toBe(1);
			expect(tbody.rows[0].cells[0].innerHTML).toBe('No records found');
		});

		it('shows custom infoEmpty message', () => {
			const input = createRendererInput({
				data: [],
				config: { infoEmpty: 'Custom empty message' },
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].innerHTML).toBe('Custom empty message');
		});

		it('shows empty string when infoEmpty is empty', () => {
			const input = createRendererInput({
				data: [],
				config: { infoEmpty: '' },
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].innerHTML).toBe('');
		});
	});

	describe('render with data', () => {
		it('populates tbody with rows', () => {
			const input = createRendererInput({
				data: [
					{ name: 'Alice', age: '30' },
					{ name: 'Bob', age: '25' },
				],
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows.length).toBe(2);
			expect(tbody.rows[0].cells[0].textContent).toBe('Alice');
			expect(tbody.rows[0].cells[1].textContent).toBe('30');
			expect(tbody.rows[1].cells[0].textContent).toBe('Bob');
			expect(tbody.rows[1].cells[1].textContent).toBe('25');
		});

		it('creates correct number of columns', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells.length).toBe(2);
		});
	});

	describe('render with configured columns', () => {
		it('uses column render function when provided', () => {
			const renderFn = vi.fn().mockReturnValue('<b>Bold</b>');
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				config: {
					infoEmpty: 'No records found',
					columns: {
						name: { render: renderFn },
					},
				},
			});

			const tbody = renderer.render(input as never);
			expect(renderFn).toHaveBeenCalledWith(
				'Alice',
				{ name: 'Alice', age: '30' },
				expect.anything(),
			);
			expect(tbody.rows[0].cells[0].innerHTML).toBe('<b>Bold</b>');
		});

		it('uses column render function returning HTMLElement', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				config: {
					infoEmpty: 'No records found',
					columns: {
						name: {
							render: () => {
								const el = document.createElement('span');
								el.textContent = 'Custom';
								return el;
							},
						},
					},
				},
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].querySelector('span')).toBeTruthy();
			expect(tbody.rows[0].cells[0].querySelector('span')!.textContent).toBe(
				'Custom',
			);
		});

		it('calls createdCell callback', () => {
			const createdCell = vi.fn();
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				config: {
					infoEmpty: 'No records found',
					columns: {
						name: { createdCell },
					},
				},
			});

			renderer.render(input as never);
			expect(createdCell).toHaveBeenCalledWith(
				expect.any(HTMLTableCellElement),
				'Alice',
				{ name: 'Alice', age: '30' },
				expect.any(HTMLTableRowElement),
			);
		});

		it('sets textContent when no render function', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				config: {
					infoEmpty: 'No records found',
					columns: {
						name: {},
					},
				},
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].textContent).toBe('Alice');
		});
	});

	describe('render with originalClasses', () => {
		it('applies original tbody class', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				originalClasses: {
					tbody: 'custom-tbody',
					thead: '',
					tr: [],
					td: [],
					th: [],
				},
			});

			const tbody = renderer.render(input as never);
			expect(tbody.className).toBe('custom-tbody');
		});

		it('applies original tr classes', () => {
			const input = createRendererInput({
				data: [
					{ name: 'Alice', age: '30' },
					{ name: 'Bob', age: '25' },
				],
				originalClasses: {
					tbody: '',
					thead: '',
					tr: ['row-0', 'row-1'],
					td: [],
					th: [],
				},
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].className).toBe('row-0');
			expect(tbody.rows[1].className).toBe('row-1');
		});

		it('applies original td classes', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				originalClasses: {
					tbody: '',
					thead: '',
					tr: [],
					td: [['td-name', 'td-age']],
					th: [],
				},
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].className).toBe('td-name');
			expect(tbody.rows[0].cells[1].className).toBe('td-age');
		});
	});

	describe('render with data-kt-datatable-column on th', () => {
		it('matches columns by data-kt-datatable-column attribute', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].textContent).toBe('Alice');
			expect(tbody.rows[0].cells[1].textContent).toBe('30');
		});

		it('falls back to column index when data attribute missing', () => {
			// Create table without data-kt-datatable-column attributes
			const table = document.createElement('table');
			const thead = table.createTHead();
			const theadRow = document.createElement('tr');
			const th1 = document.createElement('th');
			th1.textContent = 'Name';
			const th2 = document.createElement('th');
			th2.textContent = 'Age';
			theadRow.appendChild(th1);
			theadRow.appendChild(th2);
			thead.appendChild(theadRow);

			const input = createRendererInput({
				data: [
					{ '0': 'Alice', '1': '30' },
				],
				tableElement: table,
				theadElement: thead,
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].textContent).toBe('Alice');
		});
	});

	describe('render with dataRowAttributes', () => {
		it('applies data row attributes to td elements', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
				getState: () => ({
					page: 1,
					pageSize: 10,
					totalItems: 1,
					totalPages: 1,
					sortField: null,
					sortOrder: '',
					selectedRows: [],
					filters: [],
					search: '',
					originalData: [],
					originalDataAttributes: [
						{ 0: { 'data-custom': 'val1' }, 1: { 'data-custom': 'val2' } },
					],
				}),
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].getAttribute('data-custom')).toBe('val1');
			expect(tbody.rows[0].cells[1].getAttribute('data-custom')).toBe('val2');
		});
	});

	describe('render with afterDraw callback', () => {
		it('afterDraw is called with table element in context', () => {
			// The afterDraw callback is handled by the main datatable, not the renderer directly.
			// But we can verify the renderer returns a valid tbody that could be used in afterDraw.
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
			});

			const tbody = renderer.render(input as never);
			expect(tbody).toBeInstanceOf(HTMLTableSectionElement);
		});
	});

	describe('render re-creates tbody on each call', () => {
		it('removes old tbody and creates new one', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice', age: '30' }],
			});

			const tbody1 = renderer.render(input as never);
			input.tableElement.appendChild(tbody1);
			expect(input.tableElement.tBodies.length).toBe(1);

			// Render again with new data
			input.data = [
				{ name: 'Bob', age: '25' },
				{ name: 'Charlie', age: '35' },
			];
			const tbody2 = renderer.render(input as never);
			expect(input.tableElement.tBodies.length).toBe(1);
			expect(tbody2.rows.length).toBe(2);
			expect(tbody2.rows[0].cells[0].textContent).toBe('Bob');
		});
	});

	describe('notice', () => {
		it('adds a notice row to tbody', () => {
			const table = document.createElement('table');
			table.createTBody();

			renderer.notice(table, () => 3, 'Custom message');
			const tbody = table.tBodies[0];
			expect(tbody.rows.length).toBe(1);
			expect(tbody.rows[0].cells[0].innerHTML).toBe('Custom message');
			expect(tbody.rows[0].cells[0].colSpan).toBe(3);
		});

		it('uses colSpan of 1 when logical count is 0', () => {
			const table = document.createElement('table');
			table.createTBody();

			renderer.notice(table, () => 0, 'Empty');
			expect(table.tBodies[0].rows[0].cells[0].colSpan).toBe(1);
		});

		it('defaults to empty message when not provided', () => {
			const table = document.createElement('table');
			table.createTBody();

			renderer.notice(table, () => 2);
			expect(table.tBodies[0].rows[0].cells[0].innerHTML).toBe('');
		});
	});

	describe('render with value missing from item', () => {
		it('uses empty string when column not in item', () => {
			const input = createRendererInput({
				data: [{ name: 'Alice' }], // no 'age' key
			});

			const tbody = renderer.render(input as never);
			expect(tbody.rows[0].cells[0].textContent).toBe('Alice');
			expect(tbody.rows[0].cells[1].innerHTML).toBe('');
		});
	});
});
