/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableColumnFilterInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
} from './types';
import {
	KTDataTableDataProvider,
	KTDataTableEventAdapter,
	KTDataTableProviderResult,
	KTDataTableStateStore,
} from './datatable-contracts';

interface KTDataTableRemoteProviderOptions {
	config: KTDataTableConfigInterface;
	createUrl: (pathOrUrl: string) => URL;
	eventAdapter: KTDataTableEventAdapter;
	noticeOnTable: (message?: string) => void;
	stateStore: KTDataTableStateStore;
}

export class KTDataTableRemoteDataProvider<
	T extends KTDataTableDataInterface,
> implements KTDataTableDataProvider<T> {
	private abortController: AbortController | null = null;
	private requestId = 0;

	constructor(private readonly options: KTDataTableRemoteProviderOptions) {}

	public dispose(): void {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
	}

	public async fetch(): Promise<KTDataTableProviderResult<T>> {
		const currentRequestId = ++this.requestId;
		const queryParams = this.getQueryParamsForFetchRequest();

		let response: Response;
		try {
			response = await this.performFetchRequest(queryParams);
		} catch (error) {
			if ((error as Error).name === 'AbortError') {
				return { data: [], totalItems: 0, skipped: true };
			}
			throw error;
		}

		if (currentRequestId !== this.requestId) {
			return { data: [], totalItems: 0, skipped: true };
		}

		let responseData = null;

		try {
			responseData = await response.json();
		} catch (error) {
			this.options.eventAdapter.emit('parseError', {
				response,
				error: String(error),
				status: response.status,
				statusText: response.statusText,
			});
			return { data: [], totalItems: 0, skipped: true };
		}

		if (currentRequestId !== this.requestId) {
			return { data: [], totalItems: 0, skipped: true };
		}

		this.options.eventAdapter.emit('fetched', { response: responseData });

		if (typeof this.options.config.mapResponse === 'function') {
			responseData = this.options.config.mapResponse.call(this, responseData);
		}

		return {
			data: responseData.data as T[],
			totalItems: responseData.totalCount,
			response: responseData,
		};
	}

	private getQueryParamsForFetchRequest(): URLSearchParams {
		const { page, pageSize, sortField, sortOrder, filters, search } =
			this.options.stateStore.getState();

		let queryParams = new URLSearchParams();
		queryParams.set('page', String(page));
		queryParams.set('size', String(pageSize));

		if (sortOrder !== undefined) {
			queryParams.set('sortOrder', String(sortOrder));
		}

		if (sortField !== undefined) {
			queryParams.set('sortField', String(sortField));
		}

		if (Array.isArray(filters) && filters.length) {
			queryParams.set(
				'filters',
				JSON.stringify(
					filters.map((filter: KTDataTableColumnFilterInterface) => ({
						column: filter.column,
						type: filter.type,
						value: filter.value,
					})),
				),
			);
		}

		if (search) {
			queryParams.set(
				'search',
				typeof search === 'object' ? JSON.stringify(search) : search,
			);
		}

		if (typeof this.options.config.mapRequest === 'function') {
			queryParams = this.options.config.mapRequest.call(this, queryParams);
		}

		return queryParams;
	}

	private async performFetchRequest(
		queryParams: URLSearchParams,
	): Promise<Response> {
		const requestMethod: RequestInit['method'] =
			this.options.config.requestMethod;
		let requestBody: RequestInit['body'] | undefined = undefined;
		let apiEndpoint = this.options.config.apiEndpoint;

		if (this.abortController) {
			this.abortController.abort();
		}

		this.abortController = new AbortController();

		if (requestMethod === 'POST') {
			requestBody = queryParams;
		} else if (requestMethod === 'GET') {
			const apiEndpointWithQueryParams = this.options.createUrl(apiEndpoint);
			apiEndpointWithQueryParams.search = queryParams.toString();
			apiEndpoint = apiEndpointWithQueryParams.toString();
		}

		return fetch(apiEndpoint, {
			method: requestMethod,
			body: requestBody,
			headers: this.options.config.requestHeaders,
			...(this.options.config.requestCredentials && {
				credentials: this.options.config.requestCredentials,
			}),
			...(this.abortController && { signal: this.abortController.signal }),
		}).catch((error) => {
			if (error.name === 'AbortError') {
				return Promise.reject(error);
			}

			this.options.eventAdapter.emit('error', { error });
			this.options.noticeOnTable(
				'Error performing fetch request: ' + String(error),
			);
			throw error;
		});
	}
}
