/**
 * currency-sort.test.ts
 * Tests that price/currency columns sort by numeric value, not lexicographically.
 *
 * Spec: fix-datatable-sort-arrow-and-numeric-sort
 * Requirement: Numeric and Custom Column Sort Configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSortHandler } from '../datatable-sort';
import { KTDataTableConfigInterface } from '../types';

describe('KTDataTable - Currency/numeric sort', () => {
	let thead: HTMLTableSectionElement;
	const noop = vi.fn();

	beforeEach(() => {
		thead = document.createElement('thead');
		const tr = document.createElement('tr');
		const th = document.createElement('th');
		th.setAttribute('data-kt-datatable-column', 'price');
		tr.appendChild(th);
		thead.appendChild(tr);
	});

	it('sorts currency column by numeric value ascending (e.g. £5, £20, £123)', () => {
		const config = {
			columns: {
				price: { sortType: 'numeric' as const },
			},
		};
		const handler = createSortHandler(
			config as KTDataTableConfigInterface,
			thead,
			() => ({ sortField: null, sortOrder: '' }),
			noop,
			noop,
			noop,
			noop,
		);

		const data = [
			{ price: '£123' },
			{ price: '£20' },
			{ price: '£5' },
			{ price: '£9.99' },
		];
		const sorted = handler.sortData(data, 'price', 'asc');

		// Must be numeric order: 5, 9.99, 20, 123 (not lexicographic £123, £20, £5)
		const values = sorted.map((row) => row.price);
		expect(values).toEqual(['£5', '£9.99', '£20', '£123']);
	});

	it('sorts currency column by numeric value descending', () => {
		const config = {
			columns: {
				price: { sortType: 'numeric' as const },
			},
		};
		const handler = createSortHandler(
			config as KTDataTableConfigInterface,
			thead,
			() => ({ sortField: null, sortOrder: '' }),
			noop,
			noop,
			noop,
			noop,
		);

		const data = [{ price: '£5' }, { price: '£20' }, { price: '£123' }];
		const sorted = handler.sortData(data, 'price', 'desc');

		const numericOrder = sorted.map((row) =>
			parseFloat(String(row.price).replace(/[^0-9.-]/g, '')),
		);
		expect(numericOrder).toEqual([123, 20, 5]);
	});

	it('without sortType numeric, sorts lexicographically (e.g. £123 before £20)', () => {
		const config = { columns: {} };
		const handler = createSortHandler(
			config as KTDataTableConfigInterface,
			thead,
			() => ({ sortField: null, sortOrder: '' }),
			noop,
			noop,
			noop,
			noop,
		);

		const data = [{ price: '£123' }, { price: '£20' }, { price: '£5' }];
		const sorted = handler.sortData(data, 'price', 'asc');

		// String sort: "£123" < "£20" < "£5" (1 < 2 < 5)
		const values = sorted.map((row) => row.price);
		expect(values[0]).toBe('£123');
		expect(values[1]).toBe('£20');
		expect(values[2]).toBe('£5');
	});
});
