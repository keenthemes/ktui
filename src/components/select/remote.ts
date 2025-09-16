/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTSelectConfigInterface,
	KTSelectOption as KTSelectOptionData,
} from './config';

/**
 * KTSelectRemote class
 * Handles fetching remote data for the KTSelect component
 */
export class KTSelectRemote {
	private _config: KTSelectConfigInterface;
	private _isLoading: boolean = false;
	private _hasError: boolean = false;
	private _errorMessage: string = '';
	private _currentPage: number = 1;
	private _totalPages: number = 1;
	private _lastQuery: string = '';
	private _element: HTMLElement | null = null;

	/**
	 * Constructor
	 * @param config KTSelect configuration
	 * @param element The select element
	 */
	constructor(config: KTSelectConfigInterface, element?: HTMLElement) {
		this._config = config;
		this._element = element || null;
	}

	/**
	 * Fetch data from remote URL
	 * @param query Optional search query
	 * @param page Page number for pagination
	 * @returns Promise with fetched items
	 */
	public fetchData(
		query?: string,
		page: number = 1,
	): Promise<KTSelectOptionData[]> {
		this._isLoading = true;
		this._hasError = false;
		this._errorMessage = '';
		this._lastQuery = query || '';
		this._currentPage = page;

		let url = this._buildUrl(query, page);

		if (this._config.debug) console.log('Fetching remote data from:', url);

		// Dispatch search start event
		this._dispatchEvent('remoteSearchStart');

		return fetch(url)
			.then((response: Response): Promise<any> => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data: any): KTSelectOptionData[] => {
				// Process the data
				return this._processData(data);
			})
			.catch((error: Error): KTSelectOptionData[] => {
				console.error('Error fetching remote data:', error);
				this._hasError = true;
				this._errorMessage =
					this._config.remoteErrorMessage || 'Failed to load data';
				return [];
			})
			.finally((): void => {
				this._isLoading = false;
				// Dispatch search end event
				this._dispatchEvent('remoteSearchEnd');
			});
	}

	/**
	 * Dispatch custom events to notify about search state changes
	 * @param eventName Name of the event to dispatch
	 */
	private _dispatchEvent(eventName: string): void {
		if (!this._element) return;

		const event = new CustomEvent(`ktselect.${eventName}`, {
			bubbles: true,
			detail: {
				query: this._lastQuery,
				isLoading: this._isLoading,
				hasError: this._hasError,
				errorMessage: this._errorMessage,
			},
		});

		this._element.dispatchEvent(event);
	}

	/**
	 * Build the URL for the API request
	 * @param query Search query
	 * @param page Page number
	 * @returns Fully formed URL
	 */
	private _buildUrl(query?: string, page: number = 1): string {
		let url = this._config.dataUrl;

		if (!url) {
			console.error('No URL specified for remote data');
			return '';
		}

		// Add parameters
		const params = new URLSearchParams();

		// Add search parameter if provided
		if (query && this._config.searchParam) {
			params.append(this._config.searchParam, query);
		}

		// Add pagination parameters if enabled
		if (this._config.pagination) {
			const limitParam = this._config.paginationLimitParam || 'limit';
			const pageParam = this._config.paginationPageParam || 'page';
			const limit = this._config.paginationLimit || 10;

			params.append(limitParam, limit.toString());
			params.append(pageParam, page.toString());
		}

		// Append parameters to URL if there are any
		const paramsString = params.toString();
		if (paramsString) {
			url += (url.includes('?') ? '&' : '?') + paramsString;
		}

		return url;
	}

	/**
	 * Process the API response data
	 * @param data API response data
	 * @returns Array of KTSelectOptionData
	 */
	private _processData(data: any): KTSelectOptionData[] {
		try {
			if (this._config.debug) console.log('Processing API response:', data);

			let processedData = data;

			// Extract data from the API property if specified
			if (this._config.apiDataProperty && data[this._config.apiDataProperty]) {
				if (this._config.debug)
					console.log(
						`Extracting data from property: ${this._config.apiDataProperty}`,
					);

				// If pagination metadata is available, extract it
				if (this._config.pagination) {
					if (data.total_pages) {
						this._totalPages = data.total_pages;
						if (this._config.debug)
							console.log(`Total pages found: ${this._totalPages}`);
					}
					if (data.total) {
						this._totalPages = Math.ceil(
							data.total / (this._config.paginationLimit || 10),
						);
						if (this._config.debug)
							console.log(
								`Calculated total pages: ${this._totalPages} from total: ${data.total}`,
							);
					}
				}

				processedData = data[this._config.apiDataProperty];
			}

			// Ensure data is an array
			if (!Array.isArray(processedData)) {
				console.warn('Remote data is not an array:', processedData);
				return [];
			}

			if (this._config.debug)
				console.log(
					`Mapping ${processedData.length} items to KTSelectOptionData format`,
				);

			// Map data to KTSelectOptionData format
			const mappedData = processedData.map((item: any): KTSelectOptionData => {
				const mappedItem = this._mapItemToOption(item);

				// Add logging to trace data path extraction
				if (
					this._config.dataValueField &&
					this._config.dataValueField.includes('.')
				) {
					// For nested paths, verify extraction worked
					const parts = this._config.dataValueField.split('.');
					let nestedValue = item;

					// Try to navigate to the value manually for verification
					for (const part of parts) {
						if (
							nestedValue &&
							typeof nestedValue === 'object' &&
							part in nestedValue
						) {
							nestedValue = nestedValue[part];
						} else {
							nestedValue = null;
							break;
						}
					}

					// If we found a value, verify it matches what was extracted
					if (nestedValue !== null && nestedValue !== undefined) {
						const expectedValue = String(nestedValue);
						if (this._config.debug)
							console.log(
								`Data path verification for [${this._config.dataValueField}]: Expected: ${expectedValue}, Got: ${mappedItem.id}`,
							);

						if (mappedItem.id !== expectedValue && expectedValue) {
							console.warn(
								`Value mismatch! Path: ${this._config.dataValueField}, Expected: ${expectedValue}, Got: ${mappedItem.id}`,
							);
						}
					}
				}

				if (this._config.debug)
					console.log(`Mapped item: ${JSON.stringify(mappedItem)}`);
				return mappedItem;
			});

			if (this._config.debug)
				console.log(`Returned ${mappedData.length} mapped items`);
			return mappedData;
		} catch (error) {
			console.error('Error processing remote data:', error);
			this._hasError = true;
			this._errorMessage = 'Error processing data';
			return [];
		}
	}

	/**
	 * Map a data item to KTSelectOptionData format
	 * @param item Data item from API
	 * @returns KTSelectOptionData object
	 */
	private _mapItemToOption(item: any): KTSelectOptionData {
		// Get the field mapping from config with fallbacks for common field names
		const valueField = this._config.dataValueField || 'id';
		const labelField = this._config.dataFieldText || 'title';

		if (this._config.debug)
			console.log(
				`Mapping fields: value=${valueField}, label=${labelField}`,
			);
		if (this._config.debug)
			console.log('Item data:', JSON.stringify(item).substring(0, 200) + '...'); // Trimmed for readability

		// Extract values using improved getValue function
		const getValue = (obj: any, path: string): any => {
			if (!path || !obj) return null;

			try {
				// Handle dot notation to access nested properties
				const parts = path.split('.');
				let result = obj;

				for (const part of parts) {
					if (result === null || result === undefined || typeof result !== 'object') {
						return null;
					}
					result = result[part];
				}

				// Log the extraction result
				if (this._config.debug)
					console.log(
						`Extracted [${path}] => ${
							result !== null && result !== undefined
								? typeof result === 'object'
									? JSON.stringify(result).substring(0, 50)
									: String(result).substring(0, 50)
								: 'null'
						}`,
					);

				return result;
			} catch (error) {
				console.error(`Error extracting path ${path}:`, error);
				return null;
			}
		};

		// Get ID and ensure it's a string
		let id = getValue(item, valueField);
		if (id === null || id === undefined) {
			// Try common fallback fields for ID
			const fallbackFields = ['id', 'value', 'key', 'pk'];
			for (const field of fallbackFields) {
				if (item[field] !== null && item[field] !== undefined) {
					id = String(item[field]);
					if (this._config.debug) console.log(`Using fallback field '${field}' for ID: ${id}`);
					break;
				}
			}
		} else {
			id = String(id);
		}

		// If still no ID, generate one
		if (!id) {
			id = `option-${Math.random().toString(36).substr(2, 9)}`;
			if (this._config.debug) console.log(`Generated fallback ID: ${id}`);
		}

		// Get label with proper fallbacks
		let title = getValue(item, labelField);
		if (!title) {
			// Try common fallback fields for title
			const fallbackFields = ['name', 'title', 'label', 'text', 'displayName', 'description'];
			for (const field of fallbackFields) {
				if (item[field] !== null && item[field] !== undefined) {
					title = String(item[field]);
					if (this._config.debug) console.log(`Using fallback field '${field}' for title: ${title}`);
					break;
				}
			}
		} else {
			title = String(title);
		}

		// If still no title, use ID as fallback
		if (!title) {
			title = `Option ${id}`;
			if (this._config.debug) console.log(`Using ID as fallback title: ${title}`);
		}

		// Create the option object with consistent structure
		const result: KTSelectOptionData = {
			id: id,
			title: title,
			selected: Boolean(item.selected),
			disabled: Boolean(item.disabled)
		};

		if (this._config.debug)
			console.log('Final mapped item:', JSON.stringify(result));
		return result;
	}

	/**
	 * Load the next page of results
	 * @returns Promise with fetched items
	 */
	public loadNextPage(): Promise<KTSelectOptionData[]> {
		if (this._currentPage < this._totalPages) {
			return this.fetchData(this._lastQuery, this._currentPage + 1);
		}
		return Promise.resolve([]);
	}

	/**
	 * Check if there are more pages available
	 * @returns Boolean indicating if more pages exist
	 */
	public hasMorePages(): boolean {
		return this._currentPage < this._totalPages;
	}

	/**
	 * Get loading state
	 * @returns Boolean indicating if data is loading
	 */
	public isLoading(): boolean {
		return this._isLoading;
	}

	/**
	 * Get error state
	 * @returns Boolean indicating if there was an error
	 */
	public hasError(): boolean {
		return this._hasError;
	}

	/**
	 * Get error message
	 * @returns Error message
	 */
	public getErrorMessage(): string {
		return this._errorMessage;
	}

	/**
	 * Reset the remote data state
	 */
	public reset(): void {
		this._isLoading = false;
		this._hasError = false;
		this._errorMessage = '';
		this._currentPage = 1;
		this._totalPages = 1;
		this._lastQuery = '';
	}

	/**
	 * Set the select element for event dispatching
	 * @param element The select element
	 */
	public setElement(element: HTMLElement): void {
		this._element = element;
	}
}
