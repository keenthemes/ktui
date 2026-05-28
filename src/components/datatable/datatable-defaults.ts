/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTDataTableConfigInterface, KTDataTableStateInterface } from './types';

/** Default page size options shown in the size selector */
export const DEFAULT_PAGE_SIZES = [5, 10, 20, 30, 50] as const;

/** Default debounce delay (ms) for search input */
export const DEFAULT_SEARCH_DELAY = 500;

/** Default maximum visible page buttons before showing '...' */
export const DEFAULT_PAGE_MORE_LIMIT = 3;

/**
 * Default configuration for KTDataTable.
 * Extracted from _initDefaultConfig() for separation of concerns.
 * Note: sort.callback and search.callback are NOT included here because
 * they require instance context (this._sortHandler). They are added
 * in datatable.ts _initDefaultConfig().
 */
export const DATATABLE_DEFAULTS: Readonly<KTDataTableConfigInterface> = {
	/**
	 * HTTP method for server-side API call
	 */
	requestMethod: 'GET',
	/**
	 * Custom HTTP headers for the API request
	 */
	requestHeaders: {
		'Content-Type': 'application/x-www-form-urlencoded',
	},
	/**
	 * Pagination info template
	 */
	info: '{start}-{end} of {total}',
	/**
	 * Info text when there is no data
	 */
	infoEmpty: 'No records found',
	/**
	 * Available page sizes
	 */
	pageSizes: [5, 10, 20, 30, 50],
	/**
	 * Default page size
	 */
	pageSize: 10,
	/**
	 * Enable or disable pagination more button
	 */
	pageMore: true,
	/**
	 * Maximum number of pages before enabling pagination more button
	 */
	pageMoreLimit: 3,
	/**
	 * Pagination button templates
	 */
	pagination: {
		number: {
			/**
			 * CSS classes to be added to the pagination button
			 */
			class: 'kt-datatable-pagination-button',
			/**
			 * Text to be displayed in the pagination button
			 */
			text: '{page}',
		},
		previous: {
			/**
			 * CSS classes to be added to the previous pagination button
			 */
			class: 'kt-datatable-pagination-button kt-datatable-pagination-prev',
			/**
			 * Text to be displayed in the previous pagination button
			 */
			text: `
				<svg class="rtl:transform rtl:rotate-180 size-3.5 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8.86501 16.7882V12.8481H21.1459C21.3724 12.8481 21.5897 12.7581 21.7498 12.5979C21.91 12.4378 22 12.2205 22 11.994C22 11.7675 21.91 11.5503 21.7498 11.3901C21.5897 11.2299 21.3724 11.1399 21.1459 11.1399H8.86501V7.2112C8.86628 7.10375 8.83517 6.9984 8.77573 6.90887C8.7163 6.81934 8.63129 6.74978 8.53177 6.70923C8.43225 6.66869 8.32283 6.65904 8.21775 6.68155C8.11267 6.70405 8.0168 6.75766 7.94262 6.83541L2.15981 11.6182C2.1092 11.668 2.06901 11.7274 2.04157 11.7929C2.01413 11.8584 2 11.9287 2 11.9997C2 12.0707 2.01413 12.141 2.04157 12.2065C2.06901 12.272 2.1092 12.3314 2.15981 12.3812L7.94262 17.164C8.0168 17.2417 8.11267 17.2953 8.21775 17.3178C8.32283 17.3403 8.43225 17.3307 8.53177 17.2902C8.63129 17.2496 8.7163 17.18 8.77573 17.0905C8.83517 17.001 8.86628 16.8956 8.86501 16.7882Z" fill="currentColor"/>
				</svg>
			`,
		},
		next: {
			/**
			 * CSS classes to be added to the next pagination button
			 */
			class: 'kt-datatable-pagination-button kt-datatable-pagination-next',
			/**
			 * Text to be displayed in the next pagination button
			 */
			text: `
				<svg class="rtl:transform rtl:rotate-180 size-3.5 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.135 7.21144V11.1516H2.85407C2.62756 11.1516 2.41032 11.2415 2.25015 11.4017C2.08998 11.5619 2 11.7791 2 12.0056C2 12.2321 2.08998 12.4494 2.25015 12.6096C2.41032 12.7697 2.62756 12.8597 2.85407 12.8597H15.135V16.7884C15.1337 16.8959 15.1648 17.0012 15.2243 17.0908C15.2837 17.1803 15.3687 17.2499 15.4682 17.2904C15.5677 17.3309 15.6772 17.3406 15.7822 17.3181C15.8873 17.2956 15.9832 17.242 16.0574 17.1642L21.8402 12.3814C21.8908 12.3316 21.931 12.2722 21.9584 12.2067C21.9859 12.1412 22 12.0709 22 11.9999C22 11.9289 21.9859 11.8586 21.9584 11.7931C21.931 11.7276 21.8908 11.6683 21.8402 11.6185L16.0574 6.83565C15.9832 6.75791 15.8873 6.70429 15.7822 6.68179C15.6772 6.65929 15.5677 6.66893 15.4682 6.70948C15.3687 6.75002 15.2837 6.81959 15.2243 6.90911C15.1648 6.99864 15.1337 7.10399 15.135 7.21144Z" fill="currentColor"/>
				</svg>
			`,
		},
		more: {
			/**
			 * CSS classes to be added to the pagination more button
			 */
			class: 'kt-datatable-pagination-button kt-datatable-pagination-more',
			/**
			 * Text to be displayed in the pagination more button
			 */
			text: '...',
		},
	},
	/**
	 * Sorting options — classes only; callback is added in datatable.ts
	 */
	sort: {
		/**
		 * CSS classes to be added to the sortable headers
		 */
		classes: {
			base: 'kt-table-col',
			asc: 'asc',
			desc: 'desc',
		},
	},
	/**
	 * Search options — delay only; callback is added in datatable.ts
	 */
	search: {
		/**
		 * Delay in milliseconds before the search function is applied to the data array
		 * @default 500
		 */
		delay: 500, // ms
	},
	/**
	 * Loading spinner options
	 */
	loading: {
		/**
		 * Template to be displayed during data fetching process
		 */
		template: `
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div class="kt-datatable-loading">
					<svg class="animate-spin -ml-1 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					{content}
				</div>
			</div>
		`,
		/**
		 * Loading text to be displayed in the template
		 */
		content: 'Loading...',
	},
	/**
	 * Selectors of the elements to be targeted
	 */
	attributes: {
		/**
		 * Data table element
		 */
		table: 'table[data-kt-datatable-table="true"]',
		/**
		 * Pagination info element
		 */
		info: '[data-kt-datatable-info="true"]',
		/**
		 * Page size dropdown element
		 */
		size: '[data-kt-datatable-size="true"]',
		/**
		 * Pagination element
		 */
		pagination: '[data-kt-datatable-pagination="true"]',
		/**
		 * Spinner element
		 */
		spinner: '[data-kt-datatable-spinner="true"]',
		/**
		 * Checkbox element
		 */
		check: '[data-kt-datatable-check="true"]',
		checkbox: '[data-kt-datatable-row-check="true"]',
	},
	/**
	 * Enable or disable state saving
	 */
	stateSave: true,
	checkbox: {
		checkedClass: 'checked',
	},
	/**
	 * Private properties
	 */
	_state: {} as KTDataTableStateInterface,
	loadingClass: 'loading',
};
