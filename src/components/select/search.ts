/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import {
	filterOptions,
	FocusManager,
	EventManager,
} from './utils';

export class KTSelectSearch {
	private _select: KTSelect;
	private _searchInput: HTMLInputElement;
	private _noResultsElement: HTMLElement | null = null;
	private _originalOptionContents = new Map<string, string>();
	private _eventManager: EventManager;
	private _focusManager: FocusManager;
	private _config: KTSelectConfigInterface;

	// Public handler for search input (made public for event binding)
	public handleSearchInput: (...args: any[]) => void;

	constructor(select: KTSelect) {
		this._select = select;
		this._searchInput = select.getSearchInput();
		this._eventManager = new EventManager();
		this._focusManager = new FocusManager(
			this._select.getDropdownElement(),
			'[data-kt-select-option]',
			select.getConfig(),
		);
		this.handleSearchInput = this._handleSearchInput.bind(this);
		this._config = select.getConfig();
		this._cacheOriginalOptionContents();
	}

	init() {
		if (this._select.getConfig().enableSearch) {
			this._searchInput = this._select.getSearchInput();

			if (this._searchInput) {
				if (this._config.debug)
					console.log(
						'Initializing search module with input:',
						this._searchInput,
					);

				// First remove any existing listeners to prevent duplicates
				this._removeEventListeners();

				// Add the input event listener for filtering
				this._eventManager.addListener(
					this._searchInput,
					'input',
					this.handleSearchInput,
				);

				// Add keydown event listener for navigation, selection, and escape
				this._eventManager.addListener(
					this._searchInput,
					'keydown',
					this._handleSearchKeyDown.bind(this)
				);

				// Add blur event listener to ensure highlights are cleared when focus is lost
				this._eventManager.addListener(this._searchInput, 'blur', () => {
					// Small delay to prevent race conditions with selection
					setTimeout(() => {
						if (!this._searchInput.value) {
							this._resetAllOptions();
							this.clearSearch();
						}
					}, 100);
				});

				// Listen for remote search events to coordinate with remote search functionality
				if (
					this._select.getConfig().remote &&
					this._select.getConfig().searchParam
				) {
					this._select
						.getElement()
						.addEventListener('remoteSearchStart', () => {
							// Reset focused option when remote search starts
							this._focusManager.resetFocus();
						});

					this._select.getElement().addEventListener('remoteSearchEnd', () => {
						// After remote search completes, refresh our option cache
						this.refreshOptionCache();
					});
				}

				// Listen for dropdown close to reset options - ATTACH TO WRAPPER
				this._select.getWrapperElement().addEventListener('dropdown.close', () => {
					this._focusManager.resetFocus();
					// If clearSearchOnClose is false and there's a value, the search term and filtered state should persist.
					// KTSelect's closeDropdown method already calls this._searchModule.clearSearch() (which clears highlights)
					// and conditionally clears the input value based on KTSelect's config.clearSearchOnClose.
					// This listener in search.ts seems to unconditionally clear everything.
					// For now, keeping its original behavior:
					this.clearSearch(); // Clears highlights from current options
					this._searchInput.value = ''; // Clears the search input field
					this._resetAllOptions(); // Shows all options, restores original text, removes highlights
					this._clearNoResultsMessage(); // Clears any "no results" message
				});

				// Clear highlights when an option is selected - ATTACH TO ORIGINAL SELECT (standard 'change' event)
				this._select.getElement().addEventListener('change', () => {
					this.clearSearch();

					// Close dropdown only for single select mode
					// Keep dropdown open for multiple select mode to allow additional selections
					if (!this._select.getConfig().multiple) {
						this._select.closeDropdown();
					}
				});

				// Consolidated 'dropdown.show' event listener - ATTACH TO WRAPPER
				this._select.getWrapperElement().addEventListener('dropdown.show', () => {
					this._focusManager.resetFocus(); // Always clear previous focus state

					if (this._searchInput?.value) {
						// If there's an existing search term:
						// 1. Re-filter options. This ensures the display (hidden/visible) is correct
						//    and "no results" message is handled if query yields nothing.
						this._filterOptions(this._searchInput.value);
					} else {
						// If search input is empty:
						// 1. Reset all options to their full, unfiltered, original state.
						this._resetAllOptions(); // Shows all, clears highlights from options, restores original text
						// 2. Clear any "no results" message.
						this._clearNoResultsMessage();
					}

					// Handle autofocus for the search input (this was one of the original separate listeners)
					if (this._select.getConfig().searchAutofocus) {
						setTimeout(() => {
							this._searchInput?.focus(); // Focus search input
						}, 50); // Delay to ensure dropdown is visible
					}
				});
			}
		}
	}

	/**
	 * Remove event listeners to prevent memory leaks or duplicates
	 */
	private _removeEventListeners(): void {
		if (this._searchInput) {
			this._eventManager.removeAllListeners(this._searchInput);
		}
	}

	/**
	 * Handles keydown events on the search input for navigation and actions.
	 */
	private _handleSearchKeyDown(event: KeyboardEvent): void {
		const key = event.key;

		switch (key) {
			case 'ArrowDown':
				event.preventDefault();
				this._focusManager.focusNext();
				break;
			case 'ArrowUp':
				event.preventDefault();
				this._focusManager.focusPrevious();
				break;
			case 'Enter':
				event.preventDefault();
				// Always attempt to select the first available option in the list.
				// focusFirst() finds, focuses, and returns the first visible, non-disabled option.
				const firstAvailableOption = this._focusManager.focusFirst();

				if (firstAvailableOption) {
					const optionValue = firstAvailableOption.getAttribute('data-value');
					if (optionValue) {
						this._select.toggleSelection(optionValue);
						// KTSelect.toggleSelection handles closing the dropdown based on config.closeOnSelect and config.multiple
					}
				}
				break;
			case 'Escape':
				event.preventDefault();
				this._searchInput.value = '';
				this.clearSearch();
				this._resetAllOptions();
				this._clearNoResultsMessage();
				this._focusManager.focusFirst();
				break;
			default:
				break;
		}
	}

	/**
	 * Store original HTML content of all options for later restoration
	 * This prevents losing formatting when clearing search
	 */
	private _cacheOriginalOptionContents() {
		// Wait for options to be initialized
		setTimeout(() => {
			this._originalOptionContents.clear(); // Clear before re-caching
			const options = Array.from(this._select.getOptionsElement());
			options.forEach((option) => {
				const value = option.getAttribute('data-value');
				if (value) {
					// Store the full innerHTML as the original content
					this._originalOptionContents.set(value, option.innerHTML);
				}
			});
		}, 0);
	}

	/**
	 * Restores the innerHTML of all options from the cache if they have been modified.
	 * This is typically called before applying new filters/highlights.
	 */
	private _restoreOptionContentsBeforeFilter(): void {
		const options = Array.from(this._select.getOptionsElement()) as HTMLElement[];
		options.forEach(option => {
			const value = option.getAttribute('data-value');
			if (value && this._originalOptionContents.has(value)) {
				const originalContent = this._originalOptionContents.get(value)!;
				// Only restore if current content is different, to avoid unnecessary DOM manipulation
				if (option.innerHTML !== originalContent) {
					option.innerHTML = originalContent;
				}
			}
		});
	}

	private _handleSearchInput(event: Event) {
		const query = (event.target as HTMLInputElement).value;
		const config = this._select.getConfig();

		// Reset focused option when search changes
		this._focusManager.resetFocus();

		// Restore original content for all options before filtering/highlighting again
		this._restoreOptionContentsBeforeFilter();

		if (query.trim() === '') {
			this._resetAllOptions();
			this._focusManager.focusFirst(); // Focus first option when search is cleared
			return;
		}

		// For remote search, KTSelect component handles it.
		// KTSelect will call refreshAfterSearch on this module when remote data is updated.
		if (config.remote && config.searchParam) {
			if (query.length < config.searchMinLength) {
				this._resetAllOptions();
				this._clearNoResultsMessage();
				this._focusManager.focusFirst(); // Focus first if query too short
			}
			return;
		}

		// For local search
		if (query.length >= config.searchMinLength) {
			this._filterOptions(query);
			this._focusManager.focusFirst(); // Focus first visible option after local filtering
		} else {
			this._resetAllOptions();
			this._clearNoResultsMessage();
			this._focusManager.focusFirst(); // Focus first if query too short and not remote
		}
	}

	private _filterOptions(query: string) {
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];
		const config = this._select.getConfig();
		const dropdownElement = this._select.getDropdownElement();

		// Cache original option HTML if not already cached
		if (this._originalOptionContents.size === 0) {
			this._cacheOriginalOptionContents();
		}

		// Restore original content before filtering, so highlighting is applied fresh.
		this._restoreOptionContentsBeforeFilter();

		const visibleCount = filterOptions(options, query, config, dropdownElement, (count) =>
			this._handleNoResults(count),
		);
	}

	/**
	 * Reset all options to their original state
	 */
	private _resetAllOptions() {
		// Show all options
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		// Ensure the cache is populated if it's somehow empty here
		if (this._originalOptionContents.size === 0) {
			this._cacheOriginalOptionContents();
		}

		options.forEach((option) => {
			option.classList.remove('hidden');
			if (option.style.display === 'none') option.style.display = ''; // Ensure visible

			// Restore original HTML content (remove highlights)
			const value = option.getAttribute('data-value');
			if (value && this._originalOptionContents.has(value)) {
				const originalContent = this._originalOptionContents.get(value)!;
				// Only update if different, to minimize DOM changes
				if (option.innerHTML !== originalContent) {
					option.innerHTML = originalContent;
				}
			}
		});

		this._clearNoResultsMessage(); // Ensure no results message is cleared when resetting
	}

	private _handleNoResults(visibleOptionsCount: number) {
		if (visibleOptionsCount === 0 && this._searchInput?.value?.trim() !== '') {
			this._showNoResultsMessage();
		} else {
			this._clearNoResultsMessage();
		}
	}

	private _showNoResultsMessage() {
		this._clearNoResultsMessage();

		const config = this._select.getConfig();
		this._noResultsElement = defaultTemplates.searchEmpty(config);

		const dropdownElement = this._select.getDropdownElement();
		const optionsContainer = dropdownElement.querySelector(
			'[data-kt-select-options]',
		);
		if (optionsContainer) {
			optionsContainer.appendChild(this._noResultsElement);
		} else {
			dropdownElement.appendChild(this._noResultsElement);
		}
	}

	private _clearNoResultsMessage() {
		if (this._noResultsElement && this._noResultsElement.parentNode) {
			this._noResultsElement.parentNode.removeChild(this._noResultsElement);
			this._noResultsElement = null;
		}
	}

	/**
	 * Public method to explicitly clear all search highlights
	 * This is called when search is reset or selection changes
	 */
	public clearSearch() {
		// Restore original option content (removes highlighting)
		const optionsToClear = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		// Ensure cache is available
		if (this._originalOptionContents.size === 0 && optionsToClear.length > 0) {
			this._cacheOriginalOptionContents();
		}

		optionsToClear.forEach((option) => {
			const value = option.getAttribute('data-value');
			if (value && this._originalOptionContents.has(value)) {
				const originalContent = this._originalOptionContents.get(value)!;
				// Only restore if different
				if (option.innerHTML !== originalContent) {
					option.innerHTML = originalContent;
				}
			}
		});
	}

	/**
	 * This ensures that search highlighting works correctly with new options
	 */
	public refreshOptionCache(): void {
		// Re-cache all option contents
		this._originalOptionContents.clear();
		const currentOptions = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		currentOptions.forEach((option) => {
			const value = option.getAttribute('data-value');
			if (value) {
				this._originalOptionContents.set(value, option.innerHTML);
			}
		});
	}

	/**
	 * Called after search (local or remote via KTSelect) to reset focus.
	 */
	public refreshAfterSearch(): void {
		this._focusManager.resetFocus();
		this._focusManager.focusFirst();
		// Re-cache original contents as options might have changed (especially after remote search)
		this.refreshOptionCache();
	}

	/**
	 * Clean up all resources used by the search module
	 */
	public destroy(): void {
		// Remove all event listeners
		this._removeEventListeners();

		// Clear all references
		if (this._focusManager) {
			this._focusManager.dispose();
		}

		// Clear cached content
		this._originalOptionContents.clear();

		// Clear highlight elements
		this.clearSearch();
	}
}
