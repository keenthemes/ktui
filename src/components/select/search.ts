/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelect } from './select';
import { defaultTemplates } from './templates';
import {
	handleDropdownKeyNavigation,
	filterOptions,
	FocusManager,
	EventManager,
} from './utils';

export class KTSelectSearch {
	private _select: KTSelect;
	private _searchInput: HTMLInputElement;
	private _noResultsElement: HTMLElement | null = null;
	private _originalOptionContents = new Map<string, string>();
	private _boundKeyNavHandler: (event: KeyboardEvent) => void;
	private _eventManager: EventManager;
	private _focusManager: FocusManager;
	private _config: import('./config').KTSelectConfigInterface;

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
		this._boundKeyNavHandler = this._handleKeyboardNavigation.bind(this);
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

				// Add the event listener
				this._eventManager.addListener(
					this._searchInput,
					'input',
					this.handleSearchInput,
				);

				// Add blur event listener to ensure highlights are cleared when focus is lost
				this._eventManager.addListener(this._searchInput, 'blur', () => {
					// Small delay to prevent race conditions with selection
					setTimeout(() => {
						if (!this._searchInput.value) {
							this._resetAllOptions();
							this.clearSearchHighlights();
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

				// Add keyboard navigation for search results
				// This is stopping event propagation to prevent conflicts
				this._eventManager.addListener(
					this._searchInput,
					'keydown',
					this._boundKeyNavHandler,
				);

				// Listen for dropdown close to reset options if search is empty
				this._select.getElement().addEventListener('dropdown.close', () => {
					this._focusManager.resetFocus();
					this.clearSearchHighlights();
					this._searchInput.value = '';
					this._resetAllOptions();
					this._clearNoResultsMessage();
				});

				// Clear highlights when an option is selected
				this._select.getElement().addEventListener('change', () => {
					this.clearSearchHighlights();

					// Close dropdown if configured to do so
					if (
						this._select.getConfig().closeOnSelect &&
						!this._select.getConfig().multiple
					) {
						this._select.closeDropdown();
					}
				});

				// Autofocus on search input
				if (this._select.getConfig().searchAutofocus) {
					this._select.getElement().addEventListener('dropdown.show', () => {
						setTimeout(() => {
							// Add slight delay to ensure the dropdown and search input are visible
							this._searchInput?.focus();
						}, 50);
					});
				}

				// Listen for explicit dropdown open event to clear highlights if needed
				this._select.getElement().addEventListener('dropdown.show', () => {
					// If search input is empty, ensure highlights are cleared on open
					if (!this._searchInput?.value) {
						this.clearSearchHighlights();
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
	 * Handle keyboard navigation for search results
	 */
	private _handleKeyboardNavigation(event: KeyboardEvent) {
		// Stop propagation to prevent multiple handlers from firing
		event.stopPropagation();

		if (this._config.debug) console.log('Search module keydown:', event.key);

		const visibleOptions = this._focusManager.getVisibleOptions();
		if (visibleOptions.length === 0) return;

		// Use the shared keyboard navigation handler with custom callbacks
		handleDropdownKeyNavigation(
			event,
			this._select,
			{
				multiple: this._select.getConfig().multiple,
				closeOnSelect: this._select.getConfig().closeOnSelect,
			},
			{
				onArrowDown: () => this._focusManager.focusNext(),
				onArrowUp: () => this._focusManager.focusPrevious(),
				onEnter: () => this._selectFocusedOption(),
				onClose: () => {
					if (event.key === 'Escape') {
						this.clearSearchHighlights();
					}
				},
			},
		);
	}

	/**
	 * Select the currently focused option
	 */
	private _selectFocusedOption() {
		const focusedOption = this._focusManager.getFocusedOption();

		if (focusedOption) {
			const optionValue = focusedOption.getAttribute('data-value');

			if (optionValue) {
				// Ensure highlights are cleared before selection
				this.clearSearchHighlights();

				// Trigger the selection in the main select component
				this._select['_selectOption'](optionValue);
			}
		}
	}

	/**
	 * Store original HTML content of all options for later restoration
	 * This prevents losing formatting when clearing search
	 */
	private _cacheOriginalOptionContents() {
		// Wait for options to be initialized
		setTimeout(() => {
			const options = Array.from(this._select.getOptionsElement());
			options.forEach((option) => {
				const value = option.getAttribute('data-value');
				if (value) {
					this._originalOptionContents.set(value, option.innerHTML);
				}
			});
		}, 0);
	}

	private _handleSearchInput(event: Event) {
		const query = (event.target as HTMLInputElement).value.toLowerCase();
		const config = this._select.getConfig();

		// Reset focused option when search changes
		this._focusManager.resetFocus();

		// If search query is empty, clear all highlights
		if (query.trim() === '') {
			this.clearSearchHighlights();
		}

		// For remote search, we don't filter locally
		// The KTSelect component will handle the remote search
		if (config.remote && config.searchParam) {
			// If query is too short, reset all options to visible state
			if (query.length < config.searchMinLength) {
				this._resetAllOptions();
				this._clearNoResultsMessage();
			}
			// Otherwise, let KTSelect handle remote search
			return;
		}

		// For local search
		if (query.length >= config.searchMinLength) {
			this._filterOptions(query);
		} else {
			this._resetAllOptions();
			this._clearNoResultsMessage();
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

		// Use the shared filterOptions utility
		filterOptions(options, query, config, dropdownElement, (visibleCount) =>
			this._handleNoResults(visibleCount),
		);

		// Apply specialized text highlighting if needed
		if (config.searchHighlight && query.trim() !== '') {
			this._applyHighlightToDisplay(query);
		}
	}

	/**
	 * Apply highlighting to the display element for multi-select
	 */
	private _applyHighlightToDisplay(query: string) {
		// Implementation for display highlighting
	}

	/**
	 * Reset all options to their original state
	 */
	private _resetAllOptions() {
		// Show all options
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		// Cache original option HTML if not already cached
		if (this._originalOptionContents.size === 0) {
			this._cacheOriginalOptionContents();
		}

		options.forEach((option) => {
			// Remove the hidden class
			option.classList.remove('hidden');

			// Restore original HTML content (remove highlights)
			const value = option.getAttribute('data-value');
			if (value && this._originalOptionContents.has(value)) {
				option.innerHTML = this._originalOptionContents.get(value);
			}

			// Remove any display styling
			if (
				option.hasAttribute('style') &&
				option.getAttribute('style').includes('display:')
			) {
				const styleAttr = option.getAttribute('style');
				if (
					styleAttr.trim() === 'display: none;' ||
					styleAttr.trim() === 'display: block;'
				) {
					option.removeAttribute('style');
				} else {
					option.setAttribute(
						'style',
						styleAttr.replace(/display:\s*[^;]+;?/gi, '').trim(),
					);
				}
			}
		});
	}

	private _handleNoResults(visibleOptionsCount: number) {
		if (visibleOptionsCount === 0 && this._searchInput.value.trim() !== '') {
			this._showNoResultsMessage();
		} else {
			this._clearNoResultsMessage();
		}
	}

	private _showNoResultsMessage() {
		this._clearNoResultsMessage();

		const config = this._select.getConfig();
		this._noResultsElement = defaultTemplates.empty(config);

		const dropdownElement = this._select.getDropdownElement();
		const optionsContainer = dropdownElement.querySelector(
			'[data-kt-select-options-container]',
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
	public clearSearchHighlights() {
		// Restore original option content (removes highlighting)
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		options.forEach((option) => {
			const value = option.getAttribute('data-value');
			if (value && this._originalOptionContents.has(value)) {
				option.innerHTML = this._originalOptionContents.get(value);
			}
		});

		// Also clear highlights from the display element
		this._clearDisplayHighlights();
	}

	/**
	 * Clear any highlights from the display element (selected values)
	 */
	private _clearDisplayHighlights() {
		// Implementation for clearing display highlights
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		options.forEach((option) => {
			if (option.dataset && !option.dataset.originalText) {
				option.dataset.originalText = option.innerHTML;
			}
		});
	}

	/**
	 * This ensures that search highlighting works correctly with new options
	 */
	public refreshOptionCache(): void {
		// Re-cache all option contents
		this._originalOptionContents.clear();
		const options = Array.from(
			this._select.getOptionsElement(),
		) as HTMLElement[];

		options.forEach((option) => {
			const value = option.getAttribute('data-value');
			if (value) {
				this._originalOptionContents.set(value, option.innerHTML);
			}
		});
	}

	/**
	 * Clean up all resources used by the search module
	 */
	public destroy(): void {
		// Remove all event listeners
		this._removeEventListeners();

		// Clear all references
		this._focusManager.dispose();
		this._eventManager.removeAllListeners(null);

		// Clear cached content
		this._originalOptionContents.clear();

		// Clear highlight elements
		this.clearSearchHighlights();
	}
}
