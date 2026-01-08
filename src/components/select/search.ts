/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface } from './config';
import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import { filterOptions, FocusManager, EventManager } from './utils';

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
					this._handleSearchKeyDown.bind(this),
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
				this._select
					.getWrapperElement()
					.addEventListener('dropdown.close', () => {
						this._focusManager.resetFocus();
						const config = this._select.getConfig();

						// Clear highlights from current options (always do this)
						this.clearSearch();

						// Respect clearSearchOnClose config option
						if (config.clearSearchOnClose) {
							// Clear the search input field
							this._searchInput.value = '';
							// Reset all options to their original state
							this._resetAllOptions();
							// Clear any "no results" message
							this._clearNoResultsMessage();
						} else {
							// When clearSearchOnClose is false, preserve search text
							// The search input value is already preserved by KTSelect's closeDropdown method
							// Reset options visibility to show all (they will be re-filtered when dropdown reopens)
							this._resetAllOptions();
							// Clear any "no results" message
							this._clearNoResultsMessage();
							// Note: The search input value is preserved, so when dropdown reopens,
							// the dropdown.show listener will detect it and re-filter options accordingly
						}
					});

				// Clear highlights when an option is selected - ATTACH TO ORIGINAL SELECT (standard 'change' event)
				this._select.getElement().addEventListener('change', () => {
					this.clearSearch();

					// Close dropdown only for single select mode, and only if closeOnEnter is not false
					// Keep dropdown open for multiple select mode to allow additional selections
					// Also respect closeOnEnter config when it's explicitly set to false
					const config = this._select.getConfig();
					if (!config.multiple && config.closeOnEnter !== false) {
						this._select.closeDropdown();
					}
				});

				// Consolidated 'dropdown.show' event listener - ATTACH TO WRAPPER
				this._select
					.getWrapperElement()
					.addEventListener('dropdown.show', () => {
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

						// Handle autofocus for the search input with retry mechanism
						if (this._select.getConfig().searchAutofocus) {
							this._focusSearchInputWithRetry();
						}
						this._select.updateSelectAllButtonState();
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
	 * Focus the search input with retry mechanism for reliability
	 * Retries up to 3 times with exponential backoff (50ms, 100ms, 200ms)
	 */
	private _focusSearchInputWithRetry(attempt: number = 0): void {
		if (!this._searchInput) {
			return;
		}

		const maxAttempts = 3;
		const delays = [0, 50, 100, 200]; // Initial attempt + 3 retries

		if (attempt > maxAttempts) {
			if (this._config.debug) {
				console.warn(
					'KTSelect: Failed to focus search input after',
					maxAttempts,
					'attempts',
				);
			}
			return;
		}

		const delay = delays[attempt] || 200;
		const focusAttempt = () => {
			try {
				this._searchInput?.focus();
				// Check if focus was successful
				const isFocused = document.activeElement === this._searchInput || this._searchInput === document.activeElement;
				if (isFocused) {
					// Focus successful
					return;
				}
				// Focus failed, retry if we haven't exceeded max attempts
				if (attempt < maxAttempts) {
					this._focusSearchInputWithRetry(attempt + 1);
				}
			} catch (error) {
				// Focus failed with error, retry if we haven't exceeded max attempts
				if (attempt < maxAttempts) {
					this._focusSearchInputWithRetry(attempt + 1);
				}
			}
		};

		if (delay === 0) {
			focusAttempt();
		} else {
			setTimeout(focusAttempt, delay);
		}
	}

	/**
	 * Handles keydown events on the search input for navigation and actions.
	 */
	private _handleSearchKeyDown(event: KeyboardEvent): void {
		const key = event.key;

		switch (key) {
			case ' ': // Spacebar
				// Do nothing, allow space to be typed into the input
				// Stop propagation to prevent parent handlers from processing this event
				event.stopPropagation();
				break;
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
				const firstAvailableOption = this._focusManager.focusFirst();

				if (firstAvailableOption) {
					const optionValue = firstAvailableOption.getAttribute('data-value');
					if (optionValue) {
						const config = this._select.getConfig();
						const isAlreadySelected = !config.multiple && this._select.getSelectedOptions().includes(optionValue);
						const shouldClose = !config.multiple && config.closeOnEnter !== false;

						if (isAlreadySelected && shouldClose) {
							this._select.closeDropdown();
						} else {
							this._select.toggleSelection(optionValue);
						}

						// Focus display element after closing so user can press Enter again
						if (shouldClose) {
							setTimeout(() => {
								this._select.getDisplayElement()?.focus();
							}, 0);
						}
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
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];
		options.forEach((option) => {
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

		const visibleCount = filterOptions(
			options,
			query,
			config,
			dropdownElement,
			(count) => this._handleNoResults(count),
		);

		this._select.updateSelectAllButtonState();
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
		this._select.updateSelectAllButtonState();
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
