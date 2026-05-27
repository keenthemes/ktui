import { describe, it, expect } from 'vitest';
import type {
	KTDataTableColumnFilterInterface,
	KTDataTableTextFilterInterface,
	KTDataTableNumericFilterInterface,
	KTDataTableDateRangeFilterInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
} from '../types';

describe('Discriminated Union - KTDataTableColumnFilterInterface', () => {
	it('should accept text filter with string value', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'name',
			type: 'text',
			value: 'John',
		};
		expect(filter.type).toBe('text');
		expect(typeof filter.value).toBe('string');
	});

	it('should accept numeric filter with number value', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'id',
			type: 'numeric',
			value: 42,
		};
		expect(filter.type).toBe('numeric');
		expect(typeof filter.value).toBe('number');
	});

	it('should accept dateRange filter with from/to value', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'date',
			type: 'dateRange',
			value: { from: '2024-01-01', to: '2024-12-31' },
		};
		expect(filter.type).toBe('dateRange');
		expect(filter.value).toHaveProperty('from');
		expect(filter.value).toHaveProperty('to');
	});

	it('should narrow type correctly for text filter', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'name',
			type: 'text',
			value: 'test',
		};
		if (filter.type === 'text') {
			expect(typeof filter.value).toBe('string');
		}
	});

	it('should narrow type correctly for numeric filter', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'id',
			type: 'numeric',
			value: 10,
		};
		if (filter.type === 'numeric') {
			expect(typeof filter.value).toBe('number');
		}
	});

	it('should narrow type correctly for dateRange filter', () => {
		const filter: KTDataTableColumnFilterInterface = {
			column: 'date',
			type: 'dateRange',
			value: { from: '2024-01-01', to: '2024-12-31' },
		};
		if (filter.type === 'dateRange') {
			expect(filter.value).toHaveProperty('from');
			expect(filter.value).toHaveProperty('to');
		}
	});
});

describe('Generic KTDataTableConfigInterface<T>', () => {
	it('should work without type parameter (backward compatible)', () => {
		const config: KTDataTableConfigInterface = {
			pageSize: 10,
			stateSave: false,
		};
		expect(config.pageSize).toBe(10);
	});

	it('should work with custom type parameter', () => {
		interface MyData extends KTDataTableDataInterface {
			id: number;
			name: string;
			email: string;
		}

		const config: KTDataTableConfigInterface<MyData> = {
			pageSize: 20,
			columns: {
				name: {
					title: 'Name',
					render: (item, data) => {
						return String(item);
					},
				},
			},
			sort: {
				callback: (data, sortField, sortOrder) => {
					return data;
				},
			},
			search: {
				callback: (data, search) => {
					return data;
				},
			},
		};
		expect(config.pageSize).toBe(20);
	});
});
