/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { coreTemplateStrings } from './templates';

export const DefaultConfig: KTSelectConfigInterface = {
	// ...other config options
	loadMoreText: 'Load more...',
	// General Display
	debug: false,
	placeholder: 'Select an option', // Default placeholder text when no option is selected

	// Data Handling
	items: [], // Static list of options
	isLoading: false, // Indicates if options are being loaded asynchronously
	onFetch: null, // Callback function to fetch options asynchronously

	// Remote Data Configuration
	remote: false, // Enable/disable remote data fetching
	dataUrl: null, // URL to fetch options from
	apiDataProperty: null, // Property in the response object that contains the options
	remoteErrorMessage: 'Failed to load data', // Error message to display if remote data fetch fails

	// Field Mapping
	dataValueField: null, // Property in the option object that contains the value (default: 'id')
	dataFieldText: null, // Property in the option object that contains the text (default: 'title')

	// Search Configuration
	searchParam: '', // Query parameter for API search requests
	searchDebounce: 300, // Debounce delay for search (in ms)

	// Pagination Configuration
	pagination: false, // Enable/disable pagination for remote data
	paginationLimit: 10, // Items per page
	paginationPageParam: 'page', // Parameter name for page number
	paginationLimitParam: 'limit', // Parameter name for items per page
	paginationTotalParam: 'total', // Parameter name for total items

	// Selection Behavior
	allowClear: false, // Allow clearing the selection (if true, an empty value can be set)
	multiple: false, // Enable/disable multi-select
	maxSelections: null, // Maximum number of selections allowed in multi-select mode (null for unlimited)
	disabled: false, // Disable the select component
	isRequired: false, // Make selection required

	// Search Functionality
	enableSearch: false, // Enable/disable search functionality within the dropdown
	searchPlaceholder: 'Search...', // Placeholder text for the search input
	searchAutofocus: true, // Autofocus on search input when dropdown opens
	searchMinLength: 0, // Minimum characters required to trigger search
	searchMaxItems: 50, // Maximum number of search results to display
	searchEmpty: 'No results', // Text to display when no search results are found
	clearSearchOnClose: true, // Clear search input when dropdown closes

	// Multi-Select Display
	selectAllText: 'Select all', // Text for the "Select All" option (if implemented)
	clearAllText: 'Clear all', // Text for the "Clear All" option (if implemented)
	enableSelectAll: false, // Enable/disable "Select All" button for multi-select
	showSelectedCount: true, // Show the number of selected options in multi-select mode
	renderSelected: null, // Custom function to render the selected value(s) in the display area

	// Accessibility & Usability
	label: 'Select an option', // Label for the select component (for screen readers)
	height: 250, // Maximum height of the dropdown menu in pixels (if exceeded, a scrollbar will appear)

	// Dropdown Configuration
	dropdownZindex: 105, // Initial z-index value for the dropdown
	dropdownContainer: null, // Container element for the dropdown
	dropdownPlacement: null,
	dropdownFlip: false,
	dropdownPreventOverflow: false,
	dropdownStrategy: null,
	dropdownWidth: null, // Custom width for dropdown (e.g., '300px'), null to match toggle element width

	// New Config
	dropdownTemplate: '',
};

export interface KTSelectConfigInterface {
	// ...other config options
	loadMoreText?: string;
	// General Display
	debug?: boolean;
	placeholder?: string;

	// Selection Behavior
	allowClear?: boolean;
	multiple?: boolean;
	maxSelections?: number | null;
	disabled?: boolean;
	isRequired?: boolean;

	// Search Functionality
	enableSearch?: boolean;
	searchEmpty?: string;
	searchPlaceholder?: string;
	searchAutofocus?: boolean;
	searchMinLength?: number;
	searchMaxItems?: number;
	searchDebounce?: number;
	searchParam?: string;
	clearSearchOnClose?: boolean;

	// Multi-Select Display
	selectAllText?: string;
	clearAllText?: string;
	enableSelectAll?: boolean;
	showSelectedCount?: boolean;
	renderSelected?: (selectedOptions: any[]) => string; // Assuming any[] for now, adjust based on your option data structure

	// Accessibility & Usability
	label?: string;
	height: number;

	// Data Handling
	items?: KTSelectOption[];
	isLoading?: boolean;
	onFetch?: (query?: string) => Promise<KTSelectOption[]>;

	// Remote Data Configuration
	remote?: boolean;
	dataUrl?: string;
	apiDataProperty?: string;
	remoteErrorMessage?: string;

	// Field Mapping
	dataValueField?: string;
	dataFieldText?: string;

	// Pagination Configuration
	pagination?: boolean;
	paginationLimit?: number;
	paginationPageParam?: string;
	paginationLimitParam?: string;
	paginationTotalParam?: string;

	// Dropdown Configuration
	dropdownZindex?: number | null;
	dropdownContainer?: string | null;
	dropdownPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
	dropdownFlip?: boolean;
	dropdownPreventOverflow?: boolean;
	dropdownStrategy?: 'fixed' | 'absolute';
	dropdownWidth?: string | null; // Custom width for dropdown, null to match toggle element width

	// Styling
	dropdownClass?: string;
	displayClass?: string;
	optionsClass?: string;
	searchClass?: string;
	searchEmptyClass?: string;
	loadingClass?: string;
	tagClass?: string;
	loadMoreClass?: string;
	wrapperClass?: string;
	errorClass?: string;

	// New Config
	tags?: boolean;
	combobox?: boolean;
	maxSelection?: number;
	placeholderClass?: string;
	placeholderTemplate?: string;
	displaySeparator?: string;
	displayTemplate?: string;
	displayMaxSelected?: number;
	optionTemplate?: string;
	optionClass?: string;
	tagTemplate?: string;
	dropdownTemplate?: string;
	searchEmptyTemplate?: string;

	templates?: Partial<typeof coreTemplateStrings>;

	// Option Configuration
	config?: KTSelectConfigInterface; // config from data-kt-select-config attribute
	optionsConfig?: Record<string, KTSelectConfigInterface>;
}

export interface KTSelectOption {
	id: string;
	title: string;
	selected?: boolean;
	disabled?: boolean;
}

export class KTSelectState {
	private _config: KTSelectConfigInterface;
	private _selectedOptions: string[] = [];

	constructor(config?: KTSelectConfigInterface) {
		this._config = this._initDefaultConfig(config);
	}

	private _initDefaultConfig(
		config: KTSelectConfigInterface,
	): KTSelectConfigInterface {
		return {
			...DefaultConfig,
			...config,
			...config.config,
		};
	}

	public setItems(items?: any[], query?: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (items) {
				this._config.items = items;
				resolve();
			} else if (this._config.dataUrl) {
				this._fetchRemoteData(query)
					.then(resolve) // Resolve after _fetchRemoteData completes
					.catch(reject);
			} else if (this._config.onFetch) {
				this._config.isLoading = true;
				this._config
					.onFetch(query)
					.then((items) => {
						this._config.items = items;
						resolve(); // Resolve after onFetch completes
					})
					.catch((error) => {
						console.error('Error fetching data:', error);
						reject(error); // Reject on error
					})
					.finally(() => {
						this._config.isLoading = false;
					});
			} else {
				resolve();
			}
		});
	}

	private _fetchRemoteData(query?: string): Promise<void> {
		this._config.isLoading = true; // Show loading indicator

		let url = this._config.dataUrl!;
		if (query) {
			url += `?${this._config.searchParam}=${encodeURIComponent(query)}`;
		}

		return fetch(url)
			.then((response) => response.json())
			.then((data) => {
				if (this._config.apiDataProperty) {
					// Extract the data property from the response
					if (this._config.apiDataProperty in data) {
						data = data[this._config.apiDataProperty];
					} else {
						console.error(
							'Error fetching data:',
							`Property '${this._config.apiDataProperty}' not found in response`,
						);
						return;
					}
				}
				this._config.items = data;
			})
			.catch((error) => {
				console.error('Error fetching data:', error);
				// Handle error (e.g., display an error message)
			})
			.finally(() => {
				this._config.isLoading = false; // Hide loading indicator
			});
	}

	public getItems(): KTSelectOption[] {
		return this._config.items || [];
	}

	public setItemsFromOptions(options: HTMLOptionElement[]): void {
		this._config.items = options.map((option) => {
			const item: KTSelectOption = {
				id: option.value,
				title: option.textContent || option.value, // Use value as fallback for title
				// 'selected' property will be definitively set by _preSelectOptions
				disabled: option.disabled,
			};
			return item;
		});
		// The 'selected' status of these items and the overall component selection state
		// are now fully managed by _preSelectOptions in KTSelect during initialization.
	}

	public getConfig(): KTSelectConfigInterface {
		return this._config;
	}

	public setSelectedOptions(value: string | string[]): void {
		// Handle empty array case first to prevent undefined elements
		if (Array.isArray(value) && value.length === 0) {
			this._selectedOptions = [];
			return;
		}

		if (
			this._config.multiple &&
			typeof value === 'string' &&
			!this._selectedOptions.includes(value)
		) {
			this._selectedOptions.push(value);
		} else if (!this._config.multiple) {
			// For single select, replace the previous selection with the new one
			this._selectedOptions = typeof value === 'string' ? [value] : [value[0]];
		} else if (this._config.multiple && Array.isArray(value)) {
			// For multiple select with array input, use the provided array
			this._selectedOptions = [...value];
		}
	}

	public toggleSelectedOptions(value: string): void {
		if (!this._config.multiple) {
			// For non-multiple, always set the new value
			this._selectedOptions = [value];
			return;
		}

		// For multiple selection, toggle the value
		const index = this._selectedOptions.indexOf(value);
		if (index > -1) {
			this._selectedOptions.splice(index, 1);
		} else {
			this._selectedOptions.push(value);
		}
	}

	public getSelectedOptions(): string[] {
		return this._selectedOptions;
	}

	public isSelected(value: string): boolean {
		return this._selectedOptions.includes(value);
	}

	public modifyConfig(config: Partial<KTSelectConfigInterface>): void {
		this._config = { ...this._config, ...config };
	}
}
