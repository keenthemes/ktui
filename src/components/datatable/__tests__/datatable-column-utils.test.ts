import { describe, it, expect, beforeEach } from 'vitest';
import {
	resolveColumns,
	getLogicalColumnCount,
} from '../datatable-column-utils';

describe('datatable-column-utils', () => {
	let thead: HTMLTableSectionElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		thead = document.createElement('thead');
	});

	describe('resolveColumns', () => {
		it('should resolve columns with data-kt-datatable-column attributes', () => {
			const tr = document.createElement('tr');
			['id', 'name', 'status'].forEach((name) => {
				const th = document.createElement('th');
				th.setAttribute('data-kt-datatable-column', name);
				tr.appendChild(th);
			});
			thead.appendChild(tr);

			const result = resolveColumns(thead);
			expect(result.allThs).toHaveLength(3);
			expect(result.typedThs).toHaveLength(3);
			expect(result.columnsByIndex).toHaveLength(3);
			expect(
				result.columnsByIndex[0]?.getAttribute('data-kt-datatable-column'),
			).toBe('id');
		});

		it('should handle empty thead', () => {
			const result = resolveColumns(thead);
			expect(result.allThs).toHaveLength(0);
			expect(result.typedThs).toHaveLength(0);
			expect(result.columnsByIndex).toHaveLength(0);
		});

		it('should prefer typedThs when only some have attributes', () => {
			const tr = document.createElement('tr');
			const th1 = document.createElement('th');
			th1.setAttribute('data-kt-datatable-column', 'id');
			tr.appendChild(th1);
			tr.appendChild(document.createElement('th')); // no attribute (e.g. group header in multi-row)
			thead.appendChild(tr);

			const result = resolveColumns(thead);
			// Prefer typed ths — untyped ths are group headers in multi-row layouts
			expect(result.allThs).toHaveLength(2);
			expect(result.typedThs).toHaveLength(1);
			expect(result.columnsByIndex).toHaveLength(1);
		});

		it('should fall back to allThs when no ths have attributes', () => {
			const tr = document.createElement('tr');
			tr.appendChild(document.createElement('th'));
			tr.appendChild(document.createElement('th'));
			thead.appendChild(tr);

			const result = resolveColumns(thead);
			// When no typed ths exist, fall back to all ths by index
			expect(result.allThs).toHaveLength(2);
			expect(result.typedThs).toHaveLength(0);
			expect(result.columnsByIndex).toHaveLength(2);
		});

		it('should handle null thead', () => {
			const result = resolveColumns(null);
			expect(result.allThs).toHaveLength(0);
			expect(result.typedThs).toHaveLength(0);
			expect(result.columnsByIndex).toHaveLength(0);
		});
	});

	describe('getLogicalColumnCount', () => {
		it('should count columns with data-kt-datatable-column', () => {
			const tr = document.createElement('tr');
			['id', 'name'].forEach((name) => {
				const th = document.createElement('th');
				th.setAttribute('data-kt-datatable-column', name);
				tr.appendChild(th);
			});
			thead.appendChild(tr);

			expect(getLogicalColumnCount(thead, null)).toBe(2);
		});

		it('should return 0 for empty thead', () => {
			expect(getLogicalColumnCount(thead, null)).toBe(0);
		});

		it('should prefer originalData keys when available', () => {
			const originalData = [{ id: '1', name: 'test', status: 'active' }];
			expect(getLogicalColumnCount(thead, null, originalData)).toBe(3);
		});

		it('should fall back to tbody first row td count', () => {
			const tbody = document.createElement('tbody');
			const tr = document.createElement('tr');
			tr.appendChild(document.createElement('td'));
			tr.appendChild(document.createElement('td'));
			tr.appendChild(document.createElement('td'));
			tbody.appendChild(tr);

			expect(getLogicalColumnCount(thead, tbody)).toBe(3);
		});

		it('should fall back to thead columns when no data or tbody', () => {
			const tr = document.createElement('tr');
			['id', 'name', 'status', 'email'].forEach((name) => {
				const th = document.createElement('th');
				th.setAttribute('data-kt-datatable-column', name);
				tr.appendChild(th);
			});
			thead.appendChild(tr);

			expect(getLogicalColumnCount(thead, null)).toBe(4);
		});
	});
});
