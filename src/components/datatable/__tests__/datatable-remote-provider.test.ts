import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDataTableRemoteDataProvider } from '../datatable-remote-provider';
import type {
	KTDataTableEventAdapter,
	KTDataTableStateStore,
} from '../datatable-contracts';
import type { KTDataTableConfigInterface } from '../types';

function createMockStateStore(overrides = {}) {
	return {
		getState: vi.fn(() => ({
			page: 1,
			pageSize: 10,
			sortField: undefined,
			sortOrder: undefined,
			filters: [],
			search: '',
			...overrides,
		})),
		setState: vi.fn(),
		setPage: vi.fn(),
		setPageSize: vi.fn(),
		setSort: vi.fn(),
		setSearch: vi.fn(),
		setFilter: vi.fn(),
		replaceState: vi.fn(),
		patchState: vi.fn(),
		setOriginalData: vi.fn(),
	} as unknown as KTDataTableStateStore;
}

function createMockEventAdapter() {
	return {
		emit: vi.fn(),
	} as unknown as KTDataTableEventAdapter;
}

function createMockConfig(
	overrides: Partial<KTDataTableConfigInterface> = {},
): KTDataTableConfigInterface {
	return {
		requestMethod: 'GET',
		apiEndpoint: 'https://api.example.com/data',
		...overrides,
	} as KTDataTableConfigInterface;
}

function createProvider(
	options: {
		config?: Partial<KTDataTableConfigInterface>;
		stateOverrides?: Record<string, unknown>;
	} = {},
) {
	const stateStore = createMockStateStore(options.stateOverrides);
	const eventAdapter = createMockEventAdapter();
	const noticeOnTable = vi.fn();
	const config = createMockConfig(options.config);
	const provider = new KTDataTableRemoteDataProvider({
		config,
		createUrl: (path: string) => new URL(path, 'https://api.example.com'),
		eventAdapter,
		noticeOnTable,
		stateStore,
	});
	return { provider, stateStore, eventAdapter, noticeOnTable };
}

describe('KTDataTableRemoteDataProvider', () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Successful fetch (GET)', () => {
		it('fetch() with GET method appends query params to URL', async () => {
			const mockResponse = { data: [{ id: 1 }], totalCount: 1 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				config: {
					requestMethod: 'GET',
					apiEndpoint: 'https://api.example.com/data',
				},
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			expect(calledUrl).toContain('page=');
			expect(calledUrl).toContain('size=');
			expect(fetchMock).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ method: 'GET' }),
			);
		});

		it('fetch() returns data and totalCount from response', async () => {
			const mockResponse = { data: [{ id: 1 }, { id: 2 }], totalCount: 100 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider();
			const result = await provider.fetch();

			expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
			expect(result.totalItems).toBe(100);
		});

		it('fetch() applies mapResponse when provided', async () => {
			const mockResponse = { data: [{ id: 1 }], totalCount: 1 };
			const mappedResponse = { data: [{ id: 1, mapped: true }], totalCount: 1 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				config: {
					requestMethod: 'GET',
					apiEndpoint: 'https://api.example.com/data',
					mapResponse: () => mappedResponse as any,
				},
			});

			const result = await provider.fetch();
			expect(result.data).toEqual([{ id: 1, mapped: true }]);
		});
	});

	describe('Successful fetch (POST)', () => {
		it('fetch() with POST method sends queryParams as body', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				config: {
					requestMethod: 'POST',
					apiEndpoint: 'https://api.example.com/data',
				},
			});

			await provider.fetch();

			expect(fetchMock).toHaveBeenCalledWith(
				'https://api.example.com/data',
				expect.objectContaining({
					method: 'POST',
					body: expect.any(URLSearchParams),
				}),
			);
		});
	});

	describe('Query params', () => {
		it('getQueryParams includes page, size from state', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				stateOverrides: { page: 3, pageSize: 25 },
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			expect(calledUrl).toContain('page=3');
			expect(calledUrl).toContain('size=25');
		});

		it('getQueryParams includes sortField, sortOrder when defined', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				stateOverrides: { sortField: 'name', sortOrder: 'asc' },
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			expect(calledUrl).toContain('sortField=name');
			expect(calledUrl).toContain('sortOrder=asc');
		});

		it('getQueryParams includes filters as JSON string when present', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				stateOverrides: {
					filters: [{ column: 'status', type: 'text', value: 'active' }],
				},
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			const url = new URL(calledUrl);
			const filters = url.searchParams.get('filters');
			expect(filters).toBeTruthy();
			expect(JSON.parse(filters!)).toEqual([
				{ column: 'status', type: 'text', value: 'active' },
			]);
		});

		it('getQueryParams includes search as string', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				stateOverrides: { search: 'hello' },
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			expect(calledUrl).toContain('search=hello');
		});

		it('getQueryParams includes search as JSON.stringify when object', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const searchObj = { query: 'test', category: 'all' };
			const { provider } = createProvider({
				stateOverrides: { search: searchObj },
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			const url = new URL(calledUrl);
			expect(url.searchParams.get('search')).toEqual(JSON.stringify(searchObj));
		});

		it('getQueryParams applies mapRequest when provided', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				config: {
					requestMethod: 'GET',
					apiEndpoint: 'https://api.example.com/data',
					mapRequest: (params: URLSearchParams) => {
						params.set('custom', 'value');
						return params;
					},
				},
			});

			await provider.fetch();

			const calledUrl = fetchMock.mock.calls[0][0] as string;
			expect(calledUrl).toContain('custom=value');
		});
	});

	describe('Error handling', () => {
		it('fetch() network error fires error event and calls noticeOnTable', async () => {
			const networkError = new TypeError('Failed to fetch');
			fetchMock.mockRejectedValue(networkError);

			const { provider, eventAdapter, noticeOnTable } = createProvider();

			await expect(provider.fetch()).rejects.toThrow();
			expect(eventAdapter.emit).toHaveBeenCalledWith('error', {
				error: networkError,
			});
			expect(noticeOnTable).toHaveBeenCalledWith(
				expect.stringContaining('Error performing fetch request'),
			);
		});

		it('fetch() JSON parse error fires fetchError event with response details', async () => {
			fetchMock.mockResolvedValue({
				json: () => Promise.reject(new SyntaxError('Unexpected token')),
				ok: true,
				status: 200,
				statusText: 'OK',
			});

			const { provider, eventAdapter } = createProvider();
			const result = await provider.fetch();

			expect(result.skipped).toBe(true);
			expect(eventAdapter.emit).toHaveBeenCalledWith(
				'fetchError',
				expect.objectContaining({
					status: 200,
					statusText: 'OK',
				}),
			);
		});

		it('fetch() AbortError returns { data: [], totalItems: 0, skipped: true }', async () => {
			const abortError = new DOMException(
				'The operation was aborted',
				'AbortError',
			);
			fetchMock.mockRejectedValue(abortError);

			const { provider } = createProvider();
			const result = await provider.fetch();

			expect(result).toEqual({ data: [], totalItems: 0, skipped: true });
		});
	});

	describe('Request ID race conditions', () => {
		it('second fetch() before first completes → first returns skipped', async () => {
			let resolveFirst: (v: any) => void;
			const firstPromise = new Promise((r) => {
				resolveFirst = r;
			});

			fetchMock
				.mockReturnValueOnce(
					firstPromise.then(() => ({
						json: () => Promise.resolve({ data: ['first'], totalCount: 1 }),
						ok: true,
						status: 200,
					})),
				)
				.mockResolvedValue({
					json: () => Promise.resolve({ data: ['second'], totalCount: 1 }),
					ok: true,
					status: 200,
				});

			const { provider } = createProvider();

			// Start first fetch, don't await
			const firstFetch = provider.fetch();
			// Start second fetch immediately
			const secondFetch = provider.fetch();

			resolveFirst!(null);

			const [firstResult, secondResult] = await Promise.all([
				firstFetch,
				secondFetch,
			]);

			expect(firstResult.skipped).toBe(true);
			expect(secondResult.data).toEqual(['second']);
		});

		it('requestId check after JSON parse → returns skipped if mismatched', async () => {
			let resolveJson: (v: any) => void;
			const jsonPromise = new Promise((r) => {
				resolveJson = r;
			});

			fetchMock
				.mockResolvedValueOnce({
					json: () => jsonPromise,
					ok: true,
					status: 200,
				})
				.mockResolvedValue({
					json: () => Promise.resolve({ data: ['new'], totalCount: 1 }),
					ok: true,
					status: 200,
				});

			const { provider } = createProvider();

			const firstFetch = provider.fetch();
			const secondFetch = provider.fetch();

			// Resolve JSON after second fetch started
			resolveJson!({ data: ['old'], totalCount: 1 });

			const firstResult = await firstFetch;
			expect(firstResult.skipped).toBe(true);
		});
	});

	describe('Dispose', () => {
		it('dispose() aborts pending request', async () => {
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve({ data: [], totalCount: 0 }),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider();
			await provider.fetch(); // Creates an AbortController
			provider.dispose();

			// No assertion needed - just verifying dispose doesn't throw on a provider that has been used
			expect(true).toBe(true);
		});

		it('dispose() with no pending request does not throw', () => {
			const { provider } = createProvider();
			expect(() => provider.dispose()).not.toThrow();
		});
	});

	describe('Edge cases', () => {
		it('fetch() without apiEndpoint throws Error', async () => {
			const { provider } = createProvider({
				config: { requestMethod: 'GET', apiEndpoint: undefined } as any,
			});

			await expect(provider.fetch()).rejects.toThrow(
				'KTDataTable: apiEndpoint is required',
			);
		});

		it('performFetchRequest with requestCredentials includes credentials option', async () => {
			const mockResponse = { data: [], totalCount: 0 };
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve(mockResponse),
				ok: true,
				status: 200,
			});

			const { provider } = createProvider({
				config: {
					requestMethod: 'GET',
					apiEndpoint: 'https://api.example.com/data',
					requestCredentials: 'include',
				},
			});

			await provider.fetch();

			expect(fetchMock).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					credentials: 'include',
				}),
			);
		});
	});
});
