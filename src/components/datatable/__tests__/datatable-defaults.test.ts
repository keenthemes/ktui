import { describe, it, expect } from 'vitest';
import { DATATABLE_DEFAULTS, DEFAULT_PAGE_SIZES, DEFAULT_SEARCH_DELAY } from '../datatable-defaults';

describe('DATATABLE_DEFAULTS', () => {
	it('should have all required properties', () => {
		expect(DATATABLE_DEFAULTS).toHaveProperty('pageSize');
		expect(DATATABLE_DEFAULTS).toHaveProperty('pageSizes');
		expect(DATATABLE_DEFAULTS).toHaveProperty('stateSave');
		expect(DATATABLE_DEFAULTS).toHaveProperty('attributes');
		expect(DATATABLE_DEFAULTS).toHaveProperty('sort');
		expect(DATATABLE_DEFAULTS).toHaveProperty('search');
		expect(DATATABLE_DEFAULTS).toHaveProperty('pagination');
		expect(DATATABLE_DEFAULTS).toHaveProperty('loading');
		expect(DATATABLE_DEFAULTS).toHaveProperty('checkbox');
	});

	it('should have correct default pageSize', () => {
		expect(DATATABLE_DEFAULTS.pageSize).toBe(10);
	});

	it('should have correct default pageSizes array', () => {
		expect(DATATABLE_DEFAULTS.pageSizes).toEqual(DEFAULT_PAGE_SIZES);
	});

	it('should have stateSave enabled by default', () => {
		expect(DATATABLE_DEFAULTS.stateSave).toBe(true);
	});

	it('should have table selector in attributes', () => {
		expect(DATATABLE_DEFAULTS.attributes?.table).toContain('data-kt-datatable-table');
	});

	it('should have sort classes defined', () => {
		expect(DATATABLE_DEFAULTS.sort?.classes?.base).toBeDefined();
		expect(DATATABLE_DEFAULTS.sort?.classes?.asc).toBeDefined();
		expect(DATATABLE_DEFAULTS.sort?.classes?.desc).toBeDefined();
	});

	it('should have search delay defined', () => {
		expect(DATATABLE_DEFAULTS.search?.delay).toBe(DEFAULT_SEARCH_DELAY);
	});

	it('should have pagination templates', () => {
		expect(DATATABLE_DEFAULTS.pagination?.number?.class).toBeDefined();
		expect(DATATABLE_DEFAULTS.pagination?.previous?.class).toBeDefined();
		expect(DATATABLE_DEFAULTS.pagination?.next?.class).toBeDefined();
	});

	it('should have _state as empty object', () => {
		expect(DATATABLE_DEFAULTS._state).toEqual({});
	});

	it('should have loading template', () => {
		expect(DATATABLE_DEFAULTS.loading?.template).toBeDefined();
		expect(DATATABLE_DEFAULTS.loading?.content).toBe('Loading...');
	});
});
