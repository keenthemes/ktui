import { describe, it, expect, beforeEach } from 'vitest';
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
	const th3 = document.createElement('th');
	th3.setAttribute('data-kt-datatable-column', 'email');
	th3.textContent = 'Email';
	theadRow.appendChild(th1);
	theadRow.appendChild(th2);
	theadRow.appendChild(th3);
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
		getLogicalColumnCount:
			(overrides.getLogicalColumnCount as () => number) || (() => 3),
		getState:
			(overrides.getState as () => never) ||
			(() => ({
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
		tableElement: (overrides.tableElement as HTMLTableElement) || table,
		theadElement: (overrides.theadElement as HTMLTableSectionElement) || thead,
		...overrides,
	};
}

const sampleData = [
	{ name: 'Alice', age: '30', email: 'alice@example.com' },
	{ name: 'Bob', age: '25', email: 'bob@example.com' },
	{ name: 'Charlie', age: '35', email: 'charlie@example.com' },
];

describe('DataTable Fixed Layout', () => {
	let renderer: KTDataTableDomTableRenderer<Record<string, unknown>>;

	beforeEach(() => {
		document.body.innerHTML = '';
		renderer = new KTDataTableDomTableRenderer();
	});

	describe('tableLayout config option', () => {
		it('sets table-layout:fixed on table element when tableLayout is "fixed"', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			expect(input.tableElement.style.tableLayout).toBe('fixed');
		});

		it('sets table-layout:auto on table element when tableLayout is "auto"', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'auto' },
			});

			renderer.render(input as never);
			expect(input.tableElement.style.tableLayout).toBe('auto');
		});

		it('defaults to table-layout:auto when tableLayout is not set', () => {
			const input = createRendererInput({
				data: sampleData,
			});

			renderer.render(input as never);
			expect(input.tableElement.style.tableLayout).toBe('auto');
		});

		it('sets width:100% on table when tableLayout is "fixed" and no width is set', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			expect(input.tableElement.style.width).toBe('100%');
		});

		it('does not overwrite existing width when tableLayout is "fixed"', () => {
			const { table, thead } = createTableElement();
			table.style.width = '80%';

			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
				tableElement: table,
				theadElement: thead,
			});

			renderer.render(input as never);
			expect(table.style.width).toBe('80%');
		});
	});

	describe('colgroup generation', () => {
		it('generates colgroup with correct number of col elements for configured columns', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: {},
						age: {},
						email: {},
					},
				},
			});

			renderer.render(input as never);
			const colgroup = input.tableElement.querySelector('colgroup');
			expect(colgroup).toBeTruthy();
			expect(colgroup!.children.length).toBe(3);
			expect(colgroup!.children[0].tagName).toBe('COL');
			expect(colgroup!.children[1].tagName).toBe('COL');
			expect(colgroup!.children[2].tagName).toBe('COL');
		});

		it('generates colgroup for implicit columns from th elements', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			const colgroup = input.tableElement.querySelector('colgroup');
			expect(colgroup).toBeTruthy();
			expect(colgroup!.children.length).toBe(3);
		});

		it('does NOT generate colgroup when tableLayout is "auto"', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'auto' },
			});

			renderer.render(input as never);
			const colgroup = input.tableElement.querySelector('colgroup');
			expect(colgroup).toBeNull();
		});

		it('does NOT generate colgroup when tableLayout is not set (default)', () => {
			const input = createRendererInput({
				data: sampleData,
			});

			renderer.render(input as never);
			const colgroup = input.tableElement.querySelector('colgroup');
			expect(colgroup).toBeNull();
		});

		it('inserts colgroup before thead', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			const children = Array.from(input.tableElement.children);
			const colgroupIndex = children.findIndex(
				(el) => el.tagName === 'COLGROUP',
			);
			const theadIndex = children.findIndex((el) => el.tagName === 'THEAD');
			expect(colgroupIndex).toBeLessThan(theadIndex);
		});

		it('removes existing colgroup before creating new one on re-render', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			renderer.render(input as never);
			const colgroups = input.tableElement.querySelectorAll('colgroup');
			expect(colgroups.length).toBe(1);
		});
	});

	describe('column widths from config.columns', () => {
		it('applies column widths to colgroup col elements', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: { width: '200px' },
						age: { width: '100px' },
						email: { width: '300px' },
					},
				},
			});

			renderer.render(input as never);
			const cols = input.tableElement.querySelectorAll('colgroup col');
			expect(cols[0].style.width).toBe('200px');
			expect(cols[1].style.width).toBe('100px');
			expect(cols[2].style.width).toBe('300px');
		});

		it('leaves col width empty when column has no width specified', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: { width: '200px' },
						age: {},
						email: {},
					},
				},
			});

			renderer.render(input as never);
			const cols = input.tableElement.querySelectorAll('colgroup col');
			expect(cols[0].style.width).toBe('200px');
			expect(cols[1].style.width).toBe('');
			expect(cols[2].style.width).toBe('');
		});

		it('supports percentage widths', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: { width: '40%' },
						age: { width: '20%' },
						email: { width: '40%' },
					},
				},
			});

			renderer.render(input as never);
			const cols = input.tableElement.querySelectorAll('colgroup col');
			expect(cols[0].style.width).toBe('40%');
			expect(cols[1].style.width).toBe('20%');
			expect(cols[2].style.width).toBe('40%');
		});
	});

	describe('implicit column widths from th data attributes', () => {
		it('reads width from data-kt-datatable-column-width attribute on th', () => {
			const table = document.createElement('table');
			const thead = table.createTHead();
			const theadRow = document.createElement('tr');
			const th1 = document.createElement('th');
			th1.setAttribute('data-kt-datatable-column', 'name');
			th1.setAttribute('data-kt-datatable-column-width', '150px');
			th1.textContent = 'Name';
			const th2 = document.createElement('th');
			th2.setAttribute('data-kt-datatable-column', 'age');
			th2.setAttribute('data-kt-datatable-column-width', '80px');
			th2.textContent = 'Age';
			theadRow.appendChild(th1);
			theadRow.appendChild(th2);
			thead.appendChild(theadRow);

			const input = createRendererInput({
				data: [
					{ name: 'Alice', age: '30' },
					{ name: 'Bob', age: '25' },
				],
				config: { tableLayout: 'fixed' },
				tableElement: table,
				theadElement: thead,
			});

			renderer.render(input as never);
			const cols = table.querySelectorAll('colgroup col');
			expect(cols.length).toBe(2);
			expect(cols[0].style.width).toBe('150px');
			expect(cols[1].style.width).toBe('80px');
		});

		it('leaves col width empty when th has no data-kt-datatable-column-width', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			const cols = input.tableElement.querySelectorAll('colgroup col');
			for (const col of Array.from(cols)) {
				expect((col as HTMLTableColElement).style.width).toBe('');
			}
		});
	});

	describe('colgroup persistence across pagination redraws', () => {
		it('colgroup persists after re-render (simulating page change)', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: { width: '200px' },
						age: { width: '100px' },
						email: { width: '300px' },
					},
				},
			});

			// Page 1 render
			const tbody1 = renderer.render(input as never);
			input.tableElement.appendChild(tbody1);

			const colgroup1 = input.tableElement.querySelector('colgroup');
			expect(colgroup1).toBeTruthy();
			expect(colgroup1!.children.length).toBe(3);

			// Page 2 render (different data)
			input.data = [
				{ name: 'Dave', age: '40', email: 'dave@example.com' },
				{ name: 'Eve', age: '28', email: 'eve@example.com' },
			];
			const tbody2 = renderer.render(input as never);
			input.tableElement.appendChild(tbody2);

			const colgroup2 = input.tableElement.querySelector('colgroup');
			expect(colgroup2).toBeTruthy();
			expect(colgroup2!.children.length).toBe(3);
			expect((colgroup2!.children[0] as HTMLTableColElement).style.width).toBe(
				'200px',
			);
			expect((colgroup2!.children[1] as HTMLTableColElement).style.width).toBe(
				'100px',
			);
			expect((colgroup2!.children[2] as HTMLTableColElement).style.width).toBe(
				'300px',
			);
		});

		it('table-layout style persists across re-renders', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'fixed' },
			});

			renderer.render(input as never);
			expect(input.tableElement.style.tableLayout).toBe('fixed');

			input.data = [{ name: 'Dave', age: '40', email: 'dave@example.com' }];
			renderer.render(input as never);
			expect(input.tableElement.style.tableLayout).toBe('fixed');
		});
	});

	describe('switching between tableLayout modes', () => {
		it('removes colgroup when switching from fixed to auto', () => {
			const input = createRendererInput({
				data: sampleData,
				config: {
					tableLayout: 'fixed',
					columns: {
						name: { width: '200px' },
						age: { width: '100px' },
						email: { width: '300px' },
					},
				},
			});

			renderer.render(input as never);
			expect(input.tableElement.querySelector('colgroup')).toBeTruthy();

			// Switch to auto
			input.config.tableLayout = 'auto';
			renderer.render(input as never);
			expect(input.tableElement.querySelector('colgroup')).toBeNull();
		});

		it('adds colgroup when switching from auto to fixed', () => {
			const input = createRendererInput({
				data: sampleData,
				config: { tableLayout: 'auto' },
			});

			renderer.render(input as never);
			expect(input.tableElement.querySelector('colgroup')).toBeNull();

			// Switch to fixed
			input.config.tableLayout = 'fixed';
			renderer.render(input as never);
			expect(input.tableElement.querySelector('colgroup')).toBeTruthy();
		});
	});
});
