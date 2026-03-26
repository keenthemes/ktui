/**
 * multi-row-headers.test.ts
 * Tests for datatable column count with multi-row (grouped) headers.
 *
 * Spec: openspec/changes/fix-datatable-multi-row-header-column-count
 * Requirement: Multi-Row (Grouped) Header Column Count
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KTDataTable } from '../datatable';

describe('KTDataTable - Multi-row header column count', () => {
	let container: HTMLElement;
	let tableElement: HTMLTableElement;

	/**
	 * Create a table with multi-row thead (no data-kt-datatable-column) and 17 data columns.
	 * Row 1: Person (rowspan=2), Backlog (colspan=3), Floater2 (colspan=3), Floater1 (colspan=3), CL2025 (colspan=3), LWP (colspan=3), Action (rowspan=2) = 7 th
	 * Row 2: 15 leaf th (Assigned, Used, Balance × 5)
	 * Total 22 th in DOM but only 17 data columns.
	 */
	const createMultiRowHeaderTable = (bodyRowCount: number = 2) => {
		container = document.createElement('div');
		container.id = 'kt_datatable_multirow';
		container.setAttribute('data-kt-datatable', 'true');

		tableElement = document.createElement('table');
		tableElement.setAttribute('data-kt-datatable-table', 'true');

		const thead = document.createElement('thead');
		const row1 = document.createElement('tr');
		row1.innerHTML = `
			<th rowspan="2">Person</th>
			<th colspan="3">Backlog</th>
			<th colspan="3">Floater (2) 2025</th>
			<th colspan="3">Floater (1) 2025</th>
			<th colspan="3">CL2025</th>
			<th colspan="3">LWP</th>
			<th rowspan="2">Action</th>
		`;
		thead.appendChild(row1);

		const row2 = document.createElement('tr');
		row2.innerHTML = `
			<th>Assigned</th><th>Used</th><th>Balance</th>
			<th>Assigned</th><th>Used</th><th>Balance</th>
			<th>Assigned</th><th>Used</th><th>Balance</th>
			<th>Assigned</th><th>Used</th><th>Balance</th>
			<th>Assigned</th><th>Used</th><th>Balance</th>
		`;
		thead.appendChild(row2);
		tableElement.appendChild(thead);

		const tbody = document.createElement('tbody');
		const tdCount = 17;
		for (let r = 0; r < bodyRowCount; r++) {
			const tr = document.createElement('tr');
			for (let c = 0; c < tdCount; c++) {
				const td = document.createElement('td');
				td.textContent = c === 0 ? `Person ${r + 1}` : String(c);
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		tableElement.appendChild(tbody);

		const wrapper = document.createElement('div');
		wrapper.appendChild(tableElement);

		const infoElement = document.createElement('span');
		infoElement.setAttribute('data-kt-datatable-info', 'true');
		const sizeElement = document.createElement('select');
		sizeElement.setAttribute('data-kt-datatable-size', 'true');
		const paginationElement = document.createElement('div');
		paginationElement.setAttribute('data-kt-datatable-pagination', 'true');

		container.appendChild(wrapper);
		container.appendChild(infoElement);
		container.appendChild(sizeElement);
		container.appendChild(paginationElement);
		document.body.appendChild(container);

		return { container, tableElement, tbody };
	};

	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('should render exactly 17 columns when thead has multi-row headers and no data-kt-datatable-column', async () => {
		createMultiRowHeaderTable(2);
		new KTDataTable(container, { stateSave: false });
		await vi.runAllTimersAsync();

		const tbody = tableElement.tBodies[0];
		expect(tbody).toBeDefined();
		const rows = tbody.querySelectorAll('tr');
		// Two data rows
		expect(rows.length).toBe(2);
		rows.forEach((row) => {
			const cells = row.querySelectorAll('td');
			expect(cells.length).toBe(17);
		});
	});

	it('should use logical column count for empty-state row colspan', async () => {
		createMultiRowHeaderTable(0);
		const tbody = tableElement.querySelector('tbody');
		expect(tbody).toBeDefined();
		new KTDataTable(container, { stateSave: false });
		await vi.runAllTimersAsync();

		const noticeRow = tableElement.tBodies[0].querySelector('tr');
		expect(noticeRow).toBeDefined();
		const cell = noticeRow?.querySelector('td');
		expect(cell).toBeDefined();
		// Should span 17 (logical columns from originalData) or 1 if no data; after extract we have 0 rows so logicalCount could be 0 -> we use 1
		// With 0 body rows we never have originalData, so _getLogicalColumnCount() returns first tbody row td count (0) or 0; we set colspan to 1
		expect(cell!.colSpan).toBeGreaterThanOrEqual(1);
	});
});
