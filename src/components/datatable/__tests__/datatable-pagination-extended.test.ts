import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDataTableDomPaginationRenderer } from '../datatable-pagination-renderer';
import { DATATABLE_DEFAULTS, DEFAULT_PAGE_SIZES } from '../datatable-defaults';

function createPaginationDOM() {
	const container = document.createElement('div');
	container.innerHTML = `
		<div data-kt-datatable-info="true"></div>
		<div data-kt-datatable-pager="true">
			<button data-kt-datatable-pager-link="first">First</button>
			<button data-kt-datatable-pager-link="prev">Prev</button>
			<button data-kt-datatable-pager-link="pages">
				<button data-kt-datatable-pager-link-page="1" data-page="1">1</button>
				<button data-kt-datatable-pager-link-page="2" data-page="2">2</button>
			</button>
			<button data-kt-datatable-pager-link="next">Next</button>
			<button data-kt-datatable-pager-link="last">Last</button>
		</div>
		<select data-kt-datatable-size="true"></select>
	`;
	document.body.appendChild(container);
	return container;
}

function createConfig(overrides: Record<string, unknown> = {}) {
	return {
		pageSize: 10,
		pageSizes: [5, 10, 20, 30, 50],
		pageMore: true,
		pageMoreLimit: 3,
		info: '{start}-{end} of {total}',
		infoEmpty: 'No records found',
		pagination: {
			number: { class: 'page-btn', text: '{page}' },
			previous: { class: 'prev-btn', text: 'Prev' },
			next: { class: 'next-btn', text: 'Next' },
			more: { class: 'more-btn', text: '...' },
		},
		...overrides,
	};
}

function createState(overrides: Record<string, unknown> = {}) {
	return {
		page: 1,
		pageSize: 10,
		totalItems: 100,
		totalPages: 10,
		sortField: null,
		sortOrder: '',
		selectedRows: [],
		filters: [],
		search: '',
		originalData: [],
		originalDataAttributes: [],
		...overrides,
	};
}

describe('KTDataTableDomPaginationRenderer', () => {
	let renderer: KTDataTableDomPaginationRenderer;

	beforeEach(() => {
		document.body.innerHTML = '';
		renderer = new KTDataTableDomPaginationRenderer();
	});

	describe('render with size element', () => {
		it('populates select options from config.pageSizes', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;

			renderer.render({
				config: createConfig({ pageSizes: [5, 10, 25] }),
				dataLength: 50,
				sizeElement: sizeEl,
				state: createState({ pageSize: 10 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(sizeEl.options.length).toBe(3);
			expect(sizeEl.options[0].value).toBe('5');
			expect(sizeEl.options[1].value).toBe('10');
			expect(sizeEl.options[2].value).toBe('25');
		});

		it('uses DEFAULT_PAGE_SIZES when config.pageSizes is undefined', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;

			renderer.render({
				config: createConfig({ pageSizes: undefined }),
				dataLength: 50,
				sizeElement: sizeEl,
				state: createState({ pageSize: 10 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(sizeEl.options.length).toBe(DEFAULT_PAGE_SIZES.length);
		});

		it('selects current pageSize in the select element', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;

			renderer.render({
				config: createConfig({ pageSizes: [5, 10, 20] }),
				dataLength: 50,
				sizeElement: sizeEl,
				state: createState({ pageSize: 20 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const selected = Array.from(sizeEl.options).find((o) => o.selected);
			expect(selected?.value).toBe('20');
		});

		it('calls reloadPageSize on select change', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;
			const reloadPageSize = vi.fn();

			renderer.render({
				config: createConfig({ pageSizes: [5, 10, 20] }),
				dataLength: 50,
				sizeElement: sizeEl,
				state: createState({ pageSize: 10 }),
				reloadPageSize,
				paginateData: vi.fn(),
			} as never);

			sizeEl.value = '20';
			sizeEl.dispatchEvent(new Event('change'));
			expect(reloadPageSize).toHaveBeenCalledWith(20, 1);
		});
	});

	describe('render with info element', () => {
		it('sets info text showing range and total', () => {
			const container = createPaginationDOM();
			const infoEl = container.querySelector(
				'[data-kt-datatable-info]',
			) as HTMLElement;
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 25,
				infoElement: infoEl,
				paginationElement: paginationEl,
				state: createState({ page: 2, pageSize: 10, totalItems: 25 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(infoEl.textContent).toBe('11-20 of 25');
		});

		it('handles last page with fewer items', () => {
			const container = createPaginationDOM();
			const infoEl = container.querySelector(
				'[data-kt-datatable-info]',
			) as HTMLElement;
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 5,
				infoElement: infoEl,
				paginationElement: paginationEl,
				state: createState({ page: 3, pageSize: 10, totalItems: 25 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(infoEl.textContent).toBe('21-25 of 25');
		});
	});

	describe('render with pagination element', () => {
		it('returns without error when no pagination element', () => {
			expect(() => {
				renderer.render({
					config: createConfig(),
					dataLength: 10,
					state: createState(),
					reloadPageSize: vi.fn(),
					paginateData: vi.fn(),
				} as never);
			}).not.toThrow();
		});

		it('returns without error when no size element', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			expect(() => {
				renderer.render({
					config: createConfig(),
					dataLength: 10,
					paginationElement: paginationEl,
					state: createState(),
					reloadPageSize: vi.fn(),
					paginateData: vi.fn(),
				} as never);
			}).not.toThrow();
		});

		it('returns cleanup function', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;

			const result = renderer.render({
				config: createConfig(),
				dataLength: 10,
				sizeElement: sizeEl,
				state: createState(),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(typeof result).toBe('function');
		});

		it('cleanup clears size element', () => {
			const container = createPaginationDOM();
			const sizeEl = container.querySelector(
				'[data-kt-datatable-size]',
			) as HTMLSelectElement;

			const cleanup = renderer.render({
				config: createConfig({ pageSizes: [5, 10] }),
				dataLength: 10,
				sizeElement: sizeEl,
				state: createState(),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			expect(sizeEl.options.length).toBeGreaterThan(0);
			(cleanup as () => void)();
			expect(sizeEl.options.length).toBe(0);
			expect(sizeEl.onchange).toBeNull();
		});

		it('renders pagination buttons when pagination config is present', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 100,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 10, totalItems: 100 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const buttons = paginationEl.querySelectorAll('button');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('disables prev button on first page', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 100,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 5, totalItems: 100 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const buttons = Array.from(paginationEl.querySelectorAll('button'));
			const prevBtn = buttons.find((b) =>
				b.className.includes('prev-btn'),
			);
			expect(prevBtn).toBeDefined();
			expect(prevBtn!.disabled).toBe(true);
		});

		it('disables next button on last page', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 50,
				paginationElement: paginationEl,
				state: createState({ page: 5, totalPages: 5, totalItems: 50 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const buttons = Array.from(paginationEl.querySelectorAll('button'));
			const nextBtn = buttons.find((b) =>
				b.className.includes('next-btn'),
			);
			expect(nextBtn).toBeDefined();
			expect(nextBtn!.disabled).toBe(true);
		});

		it('marks active page button', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 100,
				paginationElement: paginationEl,
				state: createState({ page: 2, totalPages: 5, totalItems: 100 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const buttons = Array.from(paginationEl.querySelectorAll('button'));
			const activeBtn = buttons.find(
				(b) => b.className.includes('active') && b.textContent === '2',
			);
			expect(activeBtn).toBeDefined();
			expect(activeBtn!.disabled).toBe(true);
		});
	});

	describe('pageMore behavior', () => {
		it('shows all pages when pageMoreLimit > totalPages', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig({ pageMoreLimit: 10 }),
				dataLength: 30,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 3, totalItems: 30 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const pageButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('page-btn'));
			expect(pageButtons.length).toBe(3);
		});

		it('shows ellipsis when pageMoreLimit < totalPages', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig({ pageMoreLimit: 3, pageMore: true }),
				dataLength: 100,
				paginationElement: paginationEl,
				state: createState({ page: 5, totalPages: 10, totalItems: 100 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const moreButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('more-btn'));
			expect(moreButtons.length).toBeGreaterThan(0);
		});

		it('shows all pages when pageMore is false', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig({ pageMore: false }),
				dataLength: 50,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 5, totalItems: 50 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const pageButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('page-btn'));
			expect(pageButtons.length).toBe(5);
		});

		it('clicking a page button calls paginateData', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;
			const paginateData = vi.fn();

			renderer.render({
				config: createConfig({ pageMore: false }),
				dataLength: 50,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 5, totalItems: 50 }),
				reloadPageSize: vi.fn(),
				paginateData,
			} as never);

			const pageButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('page-btn'));
			pageButtons[2].click(); // click page 3
			expect(paginateData).toHaveBeenCalledWith(3);
		});
	});

	describe('calculatePageRange edge cases', () => {
		it('shows all pages when totalPages <= maxButtons', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig({ pageMoreLimit: 5, pageMore: true }),
				dataLength: 30,
				paginationElement: paginationEl,
				state: createState({ page: 1, totalPages: 3, totalItems: 30 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const pageButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('page-btn'));
			expect(pageButtons.length).toBe(3);
		});

		it('calculates correct range when near end', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig({ pageMoreLimit: 3, pageMore: true }),
				dataLength: 100,
				paginationElement: paginationEl,
				state: createState({ page: 10, totalPages: 10, totalItems: 100 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			const pageButtons = Array.from(
				paginationEl.querySelectorAll('button'),
			).filter((b) => b.className.includes('page-btn'));
			const pageTexts = pageButtons.map((b) => b.textContent);
			expect(pageTexts).toContain('10');
		});
	});

	describe('no data', () => {
		it('returns null from createPaginationControls when dataLength is 0', () => {
			const container = createPaginationDOM();
			const paginationEl = container.querySelector(
				'[data-kt-datatable-pager]',
			) as HTMLElement;

			renderer.render({
				config: createConfig(),
				dataLength: 0,
				paginationElement: paginationEl,
				state: createState({ totalItems: 0 }),
				reloadPageSize: vi.fn(),
				paginateData: vi.fn(),
			} as never);

			// Should not add any buttons
			const buttons = paginationEl.querySelectorAll('button');
			expect(buttons.length).toBe(0);
		});
	});
});
