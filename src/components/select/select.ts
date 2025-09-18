/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import {
	KTSelectConfigInterface,
	KTSelectState,
	KTSelectOption as KTSelectOptionData,
} from './config';
import { KTSelectOption } from './option';
import { KTSelectRemote } from './remote';
import { KTSelectSearch } from './search';
import { defaultTemplates } from './templates';
import { KTSelectCombobox } from './combobox';
import { KTSelectDropdown } from './dropdown';
import {
	FocusManager,
	EventManager,
	renderTemplateString,
	TypeToSearchBuffer,
} from './utils';
import { KTSelectTags } from './tags';

export class KTSelect extends KTComponent {
	// Core properties
	protected override readonly _name: string = 'select';
	protected override readonly _dataOptionPrefix: string = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
	protected override readonly _config: KTSelectConfigInterface;
	protected override _defaultConfig: KTSelectConfigInterface;

	// DOM elements
	private _wrapperElement: HTMLElement;
	private _displayElement: HTMLElement;
	private _dropdownContentElement: HTMLElement;
	private _searchInputElement: HTMLInputElement | null;
	private _options: NodeListOf<HTMLElement>;

	// Cached DOM references for performance
	private _optionsContainer: HTMLElement | null = null;

	// State
	private _dropdownIsOpen: boolean = false;
	private _state: KTSelectState;
	private _searchModule: KTSelectSearch;
	private _remoteModule: KTSelectRemote;
	private _comboboxModule: KTSelectCombobox | null = null;
	private _tagsModule: KTSelectTags | null = null;
	private _dropdownModule: KTSelectDropdown | null = null;
	private _loadMoreIndicator: HTMLElement | null = null;
	private _selectAllButton: HTMLElement | null = null;
	private _selectAllButtonToggle: HTMLButtonElement | null = null;
	private _focusManager: FocusManager;
	private _eventManager: EventManager;
	private _typeToSearchBuffer: TypeToSearchBuffer = new TypeToSearchBuffer();
	private _mutationObserver: MutationObserver | null = null;

	/**
	 * Constructor: Initializes the select component
	 */
	constructor(element: HTMLElement, config?: KTSelectConfigInterface) {
		super();

		if (KTData.has(element, this._name)) {
			return;
		}

		this._init(element);
		this._buildConfig(config);

		this._state = new KTSelectState(this._config);
		this._config = this._state.getConfig();

		(element as any).instance = this;

		// Initialize event manager
		this._eventManager = new EventManager();

		// Initialize remote module if remote data is enabled
		if (this._config.remote) {
			this._remoteModule = new KTSelectRemote(this._config, this._element);
			this._initializeRemoteData();
		} else {
			this._state
				.setItems()
				.then(() => {
					if (this._config.debug)
						console.log('Setting up component after remote data is loaded');
					this._setupComponent();
				})
				.catch((error) => {
					console.error('Error setting items:', error);
					// Handle the error, e.g., display an error message to the user
				});
		}
	}

	/**
	 * Initialize remote data fetching
	 */
	private _initializeRemoteData() {
		if (!this._remoteModule || !this._config.remote) return;

		if (this._config.debug)
			console.log('Initializing remote data with URL:', this._config.dataUrl);

		// For remote data, we need to create the HTML structure first
		// so that the component can be properly initialized
		this._createHtmlStructure();
		this._setupElementReferences();

		// Show loading state
		this._renderLoadingState();

		// Fetch remote data
		this._remoteModule
			.fetchData()
			.then((items) => {
				if (this._config.debug) console.log('Remote data fetched:', items);

				// Remove placeholder/loading options before setting new items
				this._clearExistingOptions();

				// Update state with fetched items
				this._state
					.setItems(items)
					.then(() => {
						// Generate options from the fetched data
						this._generateOptionsHtml(this._element);

						if (this._config.debug)
							console.log('Generating options HTML from remote data');

						// Update the dropdown to show the new options
						this._updateDropdownWithNewOptions();

						// Complete the component setup with the fetched data
						this._completeRemoteSetup();

						// Add pagination "Load More" button if needed
						if (this._config.pagination && this._remoteModule.hasMorePages()) {
							this._addLoadMoreButton();
						}
					})
					.catch((error) => {
						console.error('Error setting items:', error);
						this._renderErrorState(error.message || 'Failed to load data');
					});
			})
			.catch((error) => {
				console.error('Error fetching remote data:', error);
				this._renderErrorState(
					this._remoteModule.getErrorMessage() || 'Failed to load data',
				);
			});
	}

	/**
	 * Clear existing options from the select element
	 */
	private _clearExistingOptions() {
		// Keep only the empty/placeholder option and remove the rest
		const options = Array.from(
			this._element.querySelectorAll('option:not([value=""])'),
		);
		options.forEach((option) => option.remove());
	}

	/**
	 * Unified method to render options in dropdown - eliminates code duplication
	 */
	private _renderOptionsInDropdown(
		optionsData: KTSelectOptionData[] | HTMLOptionElement[],
		clearContainer: boolean = true,
	): void {
		if (!this._dropdownContentElement) return;

		// Use cached options container for better performance
		const optionsContainer =
			this._optionsContainer ||
			this._dropdownContentElement.querySelector('[data-kt-select-options]');
		if (!optionsContainer) return;

		// Clear container if requested
		if (clearContainer) {
			optionsContainer.innerHTML = '';
		}

		// Use DocumentFragment for efficient DOM manipulation
		const fragment = document.createDocumentFragment();

		// Process options data
		optionsData.forEach((optionData) => {
			let optionElement: HTMLOptionElement;

			// Handle different input types
			if (optionData instanceof HTMLOptionElement) {
				// Skip empty placeholder options
				if (optionData.value === '' && optionData.textContent.trim() === '') {
					return;
				}
				optionElement = optionData;
			} else {
				// Handle KTSelectOptionData objects - cast to ensure type safety
				const dataItem = optionData as KTSelectOptionData;
				optionElement = document.createElement('option');
				optionElement.value = dataItem.id || '';
				optionElement.textContent = dataItem.title || '';

				if (dataItem.selected) {
					optionElement.setAttribute('selected', 'selected');
				}
				if (dataItem.disabled) {
					optionElement.setAttribute('disabled', 'disabled');
				}
			}

			// Create KTSelectOption instance for proper rendering
			const selectOption = new KTSelectOption(optionElement, this._config);
			const renderedOption = selectOption.render();

			// Add to fragment for batch DOM operation
			fragment.appendChild(renderedOption);
		});

		// Batch append all options at once
		optionsContainer.appendChild(fragment);

		// Update options NodeList
		this._options = this._wrapperElement.querySelectorAll(
			'[data-kt-select-option]',
		) as NodeListOf<HTMLElement>;

		if (this._config.debug) {
			console.log(`Rendered ${optionsData.length} options in dropdown`);
		}
	}

	/**
	 * Update dropdown with new options from the original select element
	 */
	private _updateDropdownWithNewOptions() {
		// Get all options from the original select element
		const options = Array.from(this._element.querySelectorAll('option'));

		// Use unified renderer
		this._renderOptionsInDropdown(options, true);
	}

	/**
	 * Complete the setup for remote data after HTML structure is created
	 */
	private _completeRemoteSetup() {
		// Initialize options
		this._preSelectOptions(this._element);

		// Apply disabled state if needed
		this._applyInitialDisabledState();

		// Initialize search if enabled
		if (this._config.enableSearch) {
			this._initializeSearchModule();
		}

		// Initialize combobox if enabled
		if (this._config.combobox) {
			this._comboboxModule = new KTSelectCombobox(this);
		}

		// Initialize tags if enabled
		if (this._config.tags) {
			this._tagsModule = new KTSelectTags(this);
		}

		// Initialize focus manager after dropdown element is created
		this._focusManager = new FocusManager(
			this._dropdownContentElement,
			'[data-kt-select-option]',
			this._config,
		);

		// Initialize dropdown module after all elements are created
		this._dropdownModule = new KTSelectDropdown(
			this._wrapperElement,
			this._displayElement,
			this._dropdownContentElement,
			this._config,
			this, // Pass the KTSelect instance to KTSelectDropdown
		);

		// Update display and set ARIA attributes
		this._updateDisplayAndAriaAttributes();
		this.updateSelectedOptionDisplay();
		this._setAriaAttributes();

		// Update select all button state
		this.updateSelectAllButtonState();

		// Focus the first selected option or first option if nothing selected
		this._focusSelectedOption();

		// Attach event listeners after all modules are initialized
		this._attachEventListeners();

		this._observeNativeSelect();
	}

	/**
	 * Helper to show a dropdown message (error, loading, noResults)
	 */
	private _showDropdownMessage(
		type: 'error' | 'loading' | 'empty',
		message?: string,
	) {
		if (!this._dropdownContentElement) return;
		const optionsContainer = this._dropdownContentElement.querySelector(
			'[data-kt-select-options]',
		);
		if (!optionsContainer) return;

		// Clear previous messages
		optionsContainer.innerHTML = '';

		switch (type) {
			case 'error':
				optionsContainer.appendChild(
					defaultTemplates.error({
						...this._config,
						errorMessage: message,
					}),
				);
				break;
			case 'loading':
				optionsContainer.appendChild(
					defaultTemplates.loading(this._config, message || 'Loading...'),
				);
				break;
			case 'empty':
				optionsContainer.appendChild(
					defaultTemplates.searchEmpty(this._config),
				);
				break;
		}
	}

	/**
	 * Render loading state in dropdown
	 */
	private _renderLoadingState() {
		if (this._element.querySelectorAll('option').length <= 1) {
			const existingLoadingOptions = this._element.querySelectorAll(
				'option[disabled][selected][value=""]',
			);
			existingLoadingOptions.forEach((option) => option.remove());
			this._showDropdownMessage('loading', 'Loading options...');
		}
	}

	/**
	 * Render error state
	 * @param message Error message
	 */
	private _renderErrorState(message: string) {
		// If dropdown is already created, show error message there
		this._showDropdownMessage('error', message);

		if (!this._wrapperElement) {
			if (this._config.debug) console.log('Setting up component after error');
			this._setupComponent();
		}
	}

	/**
	 * Add "Load More" button for pagination
	 */
	private _addLoadMoreButton() {
		if (!this._dropdownContentElement || !this._config.pagination) return;

		// Remove existing button if any
		if (this._loadMoreIndicator) {
			this._loadMoreIndicator.remove();
			this._loadMoreIndicator = null;
		}

		// Create load more button using template
		this._loadMoreIndicator = defaultTemplates.loadMore(this._config);

		// Add to dropdown
		const optionsContainer = this._dropdownContentElement.querySelector(
			'[data-kt-select-options]',
		);
		if (optionsContainer) {
			optionsContainer.appendChild(this._loadMoreIndicator);
		} else {
			this._dropdownContentElement.appendChild(this._loadMoreIndicator);
		}

		// Add event listener
		this._loadMoreIndicator.addEventListener(
			'click',
			this._handleLoadMore.bind(this),
		);
	}

	/**
	 * Handle load more button click
	 */
	private _handleLoadMore() {
		if (!this._remoteModule || !this._config.pagination) return;

		// Show loading state
		if (this._loadMoreIndicator) {
			this._loadMoreIndicator.textContent = 'Loading...';
		}

		// Fetch next page
		this._remoteModule
			.loadNextPage()
			.then((newItems) => {
				// Get existing items
				const existingItems = this._state.getItems();

				// Combine new items with existing items
				this._state
					.setItems([...existingItems, ...newItems])
					.then(() => {
						// Update options in the dropdown
						this._updateOptionsInDropdown(newItems);

						// Check if there are more pages
						if (this._remoteModule.hasMorePages()) {
							// Reset load more button
							if (this._loadMoreIndicator) {
								this._loadMoreIndicator.textContent =
									this._config.loadMoreText || 'Load more...';
							}
						} else {
							// Remove load more button if no more pages
							if (this._loadMoreIndicator) {
								this._loadMoreIndicator.remove();
								this._loadMoreIndicator = null;
							}
						}
					})
					.catch((error) => {
						console.error('Error updating items:', error);

						// Reset load more button
						if (this._loadMoreIndicator) {
							this._loadMoreIndicator.textContent = 'Error loading more items';
						}
					});
			})
			.catch((error) => {
				console.error('Error loading more items:', error);

				// Reset load more button
				if (this._loadMoreIndicator) {
					this._loadMoreIndicator.textContent = 'Error loading more items';
				}
			});
	}

	/**
	 * Update options in the dropdown
	 * @param newItems New items to add to the dropdown
	 */
	private _updateOptionsInDropdown(newItems: KTSelectOptionData[]) {
		if (!this._dropdownContentElement || !newItems.length) return;

		const optionsContainer = this._dropdownContentElement.querySelector(
			`[data-kt-select-options]`,
		);
		if (!optionsContainer) return;

		// Get the load more button
		const loadMoreButton = optionsContainer.querySelector(
			`[data-kt-select-load-more]`,
		);

		// Process each new item
		newItems.forEach((item) => {
			// Create option for the original select
			const selectOption = document.createElement('option');
			selectOption.value = item.id || '';

			// Add to dropdown container
			if (loadMoreButton) {
				// Insert before the load more button
				optionsContainer.insertBefore(selectOption, loadMoreButton);
			} else {
				// Append to the end
				optionsContainer.appendChild(selectOption);
			}
		});

		// Update options NodeList to include the new options
		this._options = this._wrapperElement.querySelectorAll(
			`[data-kt-select-option]`,
		) as NodeListOf<HTMLElement>;

		if (this._config.debug)
			console.log(`Added ${newItems.length} more options to dropdown`);
	}

	/**
	 * ========================================================================
	 * INITIALIZATION METHODS
	 * ========================================================================
	 */

	/**
	 * Set up the component after everything is initialized
	 */
	private _setupComponent() {
		// Setup HTML structure
		this._createHtmlStructure();
		this._setupElementReferences();

		// Initialize options
		this._preSelectOptions(this._element);

		// Apply disabled state if needed
		this._applyInitialDisabledState();

		// Initialize search if enabled
		if (this._config.enableSearch) {
			this._initializeSearchModule();
		}

		// Initialize combobox if enabled
		if (this._config.combobox) {
			this._comboboxModule = new KTSelectCombobox(this);
		}

		// Initialize tags if enabled
		if (this._config.tags) {
			this._tagsModule = new KTSelectTags(this);
		}

		// Initialize focus manager after dropdown element is created
		this._focusManager = new FocusManager(
			this._dropdownContentElement,
			'[data-kt-select-option]',
			this._config,
		);

		// Initialize dropdown module after all elements are created
		this._dropdownModule = new KTSelectDropdown(
			this._wrapperElement,
			this._displayElement,
			this._dropdownContentElement,
			this._config,
			this, // Pass the KTSelect instance to KTSelectDropdown
		);

		// Update display and set ARIA attributes
		this._updateDisplayAndAriaAttributes();
		this.updateSelectedOptionDisplay();
		this._setAriaAttributes();

		// Update select all button state
		this.updateSelectAllButtonState();

		// Focus the first selected option or first option if nothing selected
		this._focusSelectedOption();

		// Attach event listeners after all modules are initialized
		this._attachEventListeners();

		this._observeNativeSelect();
	}

	/**
	 * Creates the HTML structure for the select component
	 */
	private _createHtmlStructure() {
		const options = Array.from(this._element.querySelectorAll('option'));

		// Create wrapper and display elements
		const wrapperElement = defaultTemplates.wrapper(this._config);

		const displayElement = defaultTemplates.display(this._config);

		// Add the display element to the wrapper
		wrapperElement.appendChild(displayElement);

		// Move classes from original select to wrapper and display elements
		if (this._element.classList.length > 0) {
			const originalClasses = Array.from(this._element.classList);
			const displaySpecificClasses = [
				'kt-select',
				'kt-select-sm',
				'kt-select-lg',
			];

			const classesForWrapper = originalClasses.filter(
				(className) => !displaySpecificClasses.includes(className),
			);
			if (classesForWrapper.length > 0) {
				wrapperElement.classList.add(...classesForWrapper);
			}

			// Move display-specific classes to display element
			const classesForDisplay = originalClasses.filter((className) =>
				displaySpecificClasses.includes(className),
			);
			if (classesForDisplay.length > 0) {
				displayElement.classList.add(...classesForDisplay);
			}

			this._element.className = ''; // Clear classes from original select element
		}

		// Create an empty dropdown first (without options) using template
		const dropdownElement = defaultTemplates.dropdown({
			...this._config,
			zindex: this._config.dropdownZindex,
		});

		// Add search input if needed
		if (this._config.enableSearch) {
			const searchElement = defaultTemplates.search(this._config);
			dropdownElement.appendChild(searchElement);
		}

		// Add select all button if needed
		if (this._config.multiple && this._config.enableSelectAll) {
			const selectAllElement = defaultTemplates.selectAll(this._config);
			dropdownElement.appendChild(selectAllElement);
		}

		// Create options container using template
		const optionsContainer = defaultTemplates.options(this._config);

		// Add each option directly to the container (only if options exist)
		options.forEach((optionElement) => {
			// Skip empty placeholder options (only if BOTH value AND text are empty)
			// This allows options with empty value but visible text to display in dropdown
			if (
				optionElement.value === '' &&
				optionElement.textContent.trim() === ''
			) {
				return;
			}

			// Create new KTSelectOption instance for each option
			const selectOption = new KTSelectOption(optionElement, this._config);
			const renderedOption = selectOption.render();

			// Append directly to options container
			optionsContainer.appendChild(renderedOption);
		});

		// Add options container to dropdown
		dropdownElement.appendChild(optionsContainer);

		// Add dropdown to wrapper
		wrapperElement.appendChild(dropdownElement);

		// Insert after the original element
		this._element.after(wrapperElement);
		this._element.classList.add('hidden');
	}

	/**
	 * Setup all element references after DOM is created
	 */
	private _setupElementReferences() {
		this._wrapperElement = this._element.nextElementSibling as HTMLElement;

		// Safety check - ensure wrapper element exists
		if (!this._wrapperElement) {
			console.error(
				'KTSelect: Wrapper element not found. HTML structure may not be created properly.',
			);
			return;
		}

		// Get display element
		this._displayElement = this._wrapperElement.querySelector(
			`[data-kt-select-display]`,
		) as HTMLElement;

		// Get dropdown content element - this is critical for dropdown functionality
		this._dropdownContentElement = this._wrapperElement.querySelector(
			`[data-kt-select-dropdown]`,
		) as HTMLElement;

		if (!this._dropdownContentElement) {
			console.error(
				'KTSelect: Dropdown content element not found',
				this._wrapperElement,
			);
			return;
		}

		// Get search input element - this is used for the search functionality
		this._searchInputElement = this._dropdownContentElement.querySelector(
			`[data-kt-select-search]`,
		) as HTMLInputElement;

		// If not found in dropdown, check if it's the display element itself
		if (!this._searchInputElement) {
			this._searchInputElement = this._displayElement as HTMLInputElement;
		}

		this._selectAllButton = this._wrapperElement.querySelector(
			'[data-kt-select-select-all]',
		) as HTMLElement;

		// Cache the options container for performance
		this._optionsContainer = this._dropdownContentElement.querySelector(
			'[data-kt-select-options]',
		) as HTMLElement;

		this._options = this._wrapperElement.querySelectorAll(
			`[data-kt-select-option]`,
		) as NodeListOf<HTMLElement>;
	}

	/**
	 * Attach all event listeners to elements
	 */
	private _attachEventListeners() {
		// Document level event listeners
		document.addEventListener('click', this._handleDocumentClick.bind(this));

		// Dropdown option click events
		this._eventManager.addListener(
			this._dropdownContentElement,
			'click',
			this._handleDropdownOptionClick.bind(this),
		);

		if (this._selectAllButton) {
			this._selectAllButtonToggle =
				this._selectAllButton.querySelector('button');
			if (this._selectAllButtonToggle) {
				this._eventManager.addListener(
					this._selectAllButtonToggle,
					'click',
					this._handleSelectAllClick.bind(this),
				);
			}
		}

		// Attach centralized keyboard handler to the wrapper element.
		// Events from focusable children like _displayElement or _searchInputElement (if present) will bubble up.
		if (this._wrapperElement) {
			this._wrapperElement.addEventListener(
				'keydown',
				this._handleKeyboardEvent.bind(this),
			);
		}
	}

	/**
	 * Initialize search module if search is enabled
	 */
	private _initializeSearchModule() {
		if (this._config.enableSearch) {
			this._searchModule = new KTSelectSearch(this);
			this._searchModule.init();

			// If remote search is enabled, add event listener for search input
			if (
				this._config.remote &&
				this._config.searchParam &&
				this._searchInputElement
			) {
				this._searchInputElement.addEventListener(
					'input',
					this._handleRemoteSearch.bind(this),
				);
			}
		}
	}

	/**
	 * Apply ARIA attributes and update display
	 */
	private _updateDisplayAndAriaAttributes() {
		this.updateSelectedOptionDisplay();
		this._setAriaAttributes();
	}

	/**
	 * Apply initial disabled state if configured
	 */
	private _applyInitialDisabledState() {
		if (this._config.disabled) {
			this.getElement().classList.add('disabled');
			this.getElement().setAttribute('disabled', 'disabled');
			this._wrapperElement.classList.add('disabled');
		}
	}

	/**
	 * Generate options HTML from data items
	 */
	private _generateOptionsHtml(element: HTMLElement) {
		const items = this._state.getItems() || [];

		if (this._config.debug)
			console.log(`Generating options HTML from ${items.length} items`);

		// Only modify options if we have items to replace them with
		if (items && items.length > 0) {
			// Clear existing options except the first empty one
			const options = element.querySelectorAll('option:not(:first-child)');
			options.forEach((option) => option.remove());

			// Generate options from data
			items.forEach((item) => {
				const optionElement = document.createElement('option');

				// Get value - use item.id directly if available, otherwise try dataValueField
				let value = '';
				if (item.id !== undefined) {
					value = String(item.id);
				} else if (this._config.dataValueField) {
					const extractedValue = this._getValueByKey(
						item,
						this._config.dataValueField,
					);
					value = extractedValue !== null ? String(extractedValue) : '';
				}

				// Get label - use item.title directly if available, otherwise try dataFieldText
				let label = '';
				if (item.title !== undefined) {
					label = String(item.title);
				} else if (this._config.dataFieldText) {
					const extractedLabel = this._getValueByKey(
						item,
						this._config.dataFieldText,
					);
					label =
						extractedLabel !== null ? String(extractedLabel) : 'Unnamed option';
				}

				// Log the extracted values for debugging
				if (this._config.debug)
					console.log(`Option: value=${value}, label=${label}`);

				// Set option attributes
				optionElement.value = value;
				optionElement.textContent = label || 'Unnamed option';

				if (item.selected) {
					optionElement.setAttribute('selected', 'selected');
				}

				element.appendChild(optionElement);
			});

			if (this._config.debug)
				console.log(`Added ${items.length} options to select element`);
		} else {
			if (this._config.debug) console.log('No items to generate options from');
		}
	}

	/**
	 * Extract nested property value from object using dot notation
	 */
	private _getValueByKey(obj: any, key: string): any {
		if (!key || !obj) return null;

		// Use reduce to walk through the object by splitting the key on dots
		const result = key
			.split('.')
			.reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);

		if (this._config.debug)
			console.log(
				`Extracting [${key}] from object => ${result !== null ? JSON.stringify(result) : 'null'}`,
			);
		return result;
	}

	/**
	 * Pre-select options that have the selected attribute
	 */
	private _preSelectOptions(element: HTMLElement) {
		// Handle options with selected attribute
		Array.from(element.querySelectorAll('option[selected]')).forEach(
			(option) => {
				const value = (option as HTMLOptionElement).value;
				this._selectOption(value);
			},
		);

		// Handle data-kt-select-pre-selected attribute for React compatibility
		const preSelectedValues = element.getAttribute(
			'data-kt-select-pre-selected',
		);
		if (preSelectedValues) {
			const values = preSelectedValues.split(',').map((v) => v.trim());
			values.forEach((value) => {
				if (value) {
					this._selectOption(value);
				}
			});
		}
	}

	/**
	 * ========================================================================
	 * DROPDOWN MANAGEMENT
	 * ========================================================================
	 */

	/**
	 * Open the dropdown
	 */
	public openDropdown() {
		if (this._config.disabled) {
			if (this._config.debug)
				console.log('openDropdown: select is disabled, not opening');
			return;
		}
		if (this._config.debug)
			console.log(
				'openDropdown called, dropdownModule exists:',
				!!this._dropdownModule,
			);

		if (!this._dropdownModule) {
			if (this._config.debug)
				console.log('Early return from openDropdown - module missing');
			return;
		}

		// Don't open dropdown if the select is disabled
		if (this._config.disabled) {
			if (this._config.debug)
				console.log('Early return from openDropdown - select is disabled');
			return;
		}

		if (this._config.debug)
			console.log('Opening dropdown via dropdownModule...');

		// Set our internal flag to match what we're doing
		this._dropdownIsOpen = true;

		// Open the dropdown via the module
		this._dropdownModule.open();

		// Dispatch custom event
		this._dispatchEvent('show');
		this._fireEvent('show');

		// Update ARIA states
		this._setAriaAttributes();

		// Update select all button state
		this.updateSelectAllButtonState();

		// Focus the first selected option or first option if nothing selected
		this._focusSelectedOption();
	}

	/**
	 * Close the dropdown
	 */
	public closeDropdown() {
		if (this._config.debug)
			console.log(
				'closeDropdown called, dropdownModule exists:',
				!!this._dropdownModule,
			);

		// Only check if dropdown module exists, not dropdownIsOpen flag
		if (!this._dropdownModule) {
			if (this._config.debug)
				console.log('Early return from closeDropdown - module missing');
			return;
		}

		// Always close by delegating to the dropdown module, which is the source of truth
		if (this._config.debug)
			console.log('Closing dropdown via dropdownModule...');

		// Clear search input if the dropdown is closing
		if (this._searchModule && this._searchInputElement) {
			// Clear search input if configured to do so
			if (this._config.clearSearchOnClose) {
				this._searchInputElement.value = '';
			}

			// Clear search input when dropdown closes
			this._searchModule.clearSearch();
		}

		// Set our internal flag to match what we're doing
		this._dropdownIsOpen = false;

		// Call the dropdown module's close method
		this._dropdownModule.close();

		// Reset all focus states
		if (this._focusManager) {
			this._focusManager.resetFocus();
		}

		// Dispatch custom events
		this._dispatchEvent('close');
		this._fireEvent('close');

		// Update ARIA states
		this._setAriaAttributes();
		if (this._config.debug) console.log('closeDropdown complete');
	}

	/**
	 * Update dropdown position
	 */
	public updateDropdownPosition() {
		if (this._dropdownModule) {
			this._dropdownModule.updatePosition();
		}
	}

	/**
	 * Focus on the first selected option if any exists in the dropdown
	 */
	private _focusSelectedOption() {
		// Get selected options
		const selectedOptions = this.getSelectedOptions();
		if (selectedOptions.length === 0) return;

		// Iterate through selected options and focus the first one that is visible
		for (const value of selectedOptions) {
			if (this._focusManager && this._focusManager.focusOptionByValue(value)) {
				break; // Stop after focusing the first found selected and visible option
			}
		}
	}

	/**
	 * ========================================================================
	 * SELECTION MANAGEMENT
	 * ========================================================================
	 */

	/**
	 * Select an option by value
	 */
	private _selectOption(value: string) {
		// Prevent selection if the option is disabled (in dropdown or original select)
		if (this._isOptionDisabled(value)) {
			if (this._config.debug)
				console.log('_selectOption: Option is disabled, ignoring selection');
			return;
		}

		// Get current selection state
		const isSelected = this._state.isSelected(value);

		// Toggle selection in state
		if (this._config.multiple) {
			// Toggle in multiple mode
			this._state.toggleSelectedOptions(value);
		} else {
			// Set as only selection in single mode
			this._state.setSelectedOptions(value);
		}

		// Update the original select element's option selected state
		const optionEl = Array.from(this._element.querySelectorAll('option')).find(
			(opt) => opt.value === value,
		) as HTMLOptionElement;

		if (optionEl) {
			if (this._config.multiple) {
				// Toggle the selection for multiple select
				optionEl.selected = !isSelected;
			} else {
				// Set as only selection for single select
				Array.from(this._element.querySelectorAll('option')).forEach((opt) => {
					(opt as HTMLOptionElement).selected = opt.value === value;
				});
			}
		}

		// Update the visual display of selected options
		this.updateSelectedOptionDisplay();

		// Update option classes without re-rendering the dropdown content
		this._updateSelectedOptionClass();

		// Dispatch standard and custom change events
		this._dispatchEvent('change', {
			value: value,
			selected: !isSelected,
			selectedOptions: this.getSelectedOptions(),
		});
		this._fireEvent('change', {
			value: value,
			selected: !isSelected,
			selectedOptions: this.getSelectedOptions(),
		});
	}

	/**
	 * Update selected option display value
	 */
	public updateSelectedOptionDisplay() {
		const selectedOptions = this.getSelectedOptions();
		const tagsEnabled = this._config.tags && this._tagsModule;
		const valueDisplayEl = this.getValueDisplayElement();

		if (tagsEnabled) {
			// Tags module will render tags if selectedOptions > 0, or clear them if selectedOptions === 0.
			this._tagsModule.updateTagsDisplay(selectedOptions);
		}

		// Guard against valueDisplayEl being null due to template modifications
		if (!valueDisplayEl) {
			if (this._config.debug) {
				console.warn(
					'KTSelect: Value display element is null. Cannot update display or placeholder. Check template for [data-kt-select-value].',
				);
			}
			return; // Nothing to display on if the element is missing
		}

		if (typeof this._config.renderSelected === 'function') {
			valueDisplayEl.innerHTML = this._config.renderSelected(selectedOptions);
		} else {
			if (selectedOptions.length === 0) {
				// No options selected: display placeholder.
				// This runs if tags are off, OR if tags are on but no items are selected (tags module would have cleared tags).
				const placeholderEl = defaultTemplates.placeholder(this._config);
				valueDisplayEl.replaceChildren(placeholderEl);
			} else {
				// Options are selected.
				if (tagsEnabled) {
					// Tags are enabled AND options are selected: tags module has rendered them.
					// Clear valueDisplayEl as tags are the primary display.
					valueDisplayEl.innerHTML = '';
				} else {
					// Tags are not enabled AND options are selected: render normal text display.
					let content = '';
					if (this._config.displayTemplate) {
						content = this.renderDisplayTemplateForSelected(
							this.getSelectedOptions(),
						);
					} else {
						content = this.getSelectedOptionsText();
					}
					valueDisplayEl.innerHTML = content;
				}
			}
		}
	}

	/**
	 * Check if an option was originally disabled in the HTML
	 */
	private _isOptionOriginallyDisabled(value: string): boolean {
		const originalOption = Array.from(
			this._element.querySelectorAll('option'),
		).find((opt) => opt.value === value) as HTMLOptionElement;
		return originalOption ? originalOption.disabled : false;
	}

	/**
	 * Update CSS classes for selected options
	 */
	private _updateSelectedOptionClass(): void {
		const allOptions = this._wrapperElement.querySelectorAll(
			`[data-kt-select-option]`,
		);
		const selectedValues = this._state.getSelectedOptions();
		const maxReached =
			typeof this._config.maxSelections === 'number' &&
			selectedValues.length >= this._config.maxSelections;

		if (this._config.debug)
			console.log(
				'Updating selected classes for options, selected values:',
				selectedValues,
			);

		allOptions.forEach((option) => {
			const optionValue = option.getAttribute('data-value');
			if (!optionValue) return;

			const isSelected = selectedValues.includes(optionValue);
			const isOriginallyDisabled =
				this._isOptionOriginallyDisabled(optionValue);

			if (isSelected) {
				option.classList.add('selected');
				option.setAttribute('aria-selected', 'true');
				// Selected options should not be visually hidden or disabled by maxSelections logic
				option.classList.remove('hidden');
				option.classList.remove('disabled');
				option.removeAttribute('aria-disabled');
			} else {
				option.classList.remove('selected');
				option.setAttribute('aria-selected', 'false');

				// An option should be disabled if it was originally disabled OR if maxSelections is reached
				if (isOriginallyDisabled || maxReached) {
					option.classList.add('disabled');
					option.setAttribute('aria-disabled', 'true');
				} else {
					option.classList.remove('disabled');
					option.removeAttribute('aria-disabled');
				}
			}
		});
	}

	/**
	 * Clear all selected options
	 */
	public clearSelection() {
		// Clear the current selection
		this._state.setSelectedOptions([]);
		this.updateSelectedOptionDisplay();
		this._updateSelectedOptionClass();

		// Update select all button state
		this.updateSelectAllButtonState();

		// Dispatch change event
		this._dispatchEvent('change');
		this._fireEvent('change');
	}

	/**
	 * Set selected options programmatically
	 */
	public setSelectedOptions(options: HTMLOptionElement[]) {
		const values = Array.from(options).map((option) => option.value);
		this._state.setSelectedOptions(values);
	}

	/**
	 * Select the currently focused option
	 */
	public selectFocusedOption() {
		const focusedOption = this._focusManager.getFocusedOption();

		if (focusedOption) {
			const selectedValue = focusedOption.dataset.value;

			// Extract just the title text, not including description
			let selectedText = '';
			const titleElement = focusedOption.querySelector(
				'[data-kt-option-title]',
			);
			if (titleElement) {
				// If it has a structured content with title element
				selectedText = titleElement.textContent?.trim() || '';
			} else {
				// Fallback to the whole text content
				selectedText = focusedOption.textContent?.trim() || '';
			}

			// First trigger the selection to ensure state is updated properly
			if (selectedValue) {
				this._selectOption(selectedValue);
			}
		}
	}

	/**
	 * ========================================================================
	 * EVENT HANDLERS
	 * ========================================================================
	 */

	/**
	 * Handle click within the dropdown
	 */
	private _handleDropdownOptionClick(event: Event) {
		const optionElement = (event.target as HTMLElement).closest(
			`[data-kt-select-option]`,
		);

		// If an option is clicked, handle the option click
		if (optionElement) {
			this._handleOptionClick(event);
		}
	}

	/**
	 * Handle clicking on an option in the dropdown
	 */
	private _handleOptionClick(event: Event) {
		if (this._config.debug)
			console.log('_handleOptionClick called', event.target);
		event.preventDefault();
		event.stopPropagation();

		// Find the clicked option element
		const clickedOption = (event.target as HTMLElement).closest(
			`[data-kt-select-option]`,
		) as HTMLElement;

		if (!clickedOption) {
			if (this._config.debug) console.log('No clicked option found');
			return;
		}

		// Check if the option is disabled
		if (clickedOption.getAttribute('aria-disabled') === 'true') {
			if (this._config.debug) console.log('Option is disabled, ignoring click');
			return;
		}

		// Use dataset.value to get the option value
		const optionValue = clickedOption.dataset.value;
		if (optionValue === undefined) {
			if (this._config.debug) console.log('Option value is undefined');
			return;
		}

		if (this._config.debug) console.log('Option clicked:', optionValue);

		// If in single-select mode and the clicked option is already selected, just close the dropdown.
		if (!this._config.multiple && this._state.isSelected(optionValue)) {
			if (this._config.debug)
				console.log(
					'Single select mode: clicked already selected option. Closing dropdown.',
				);
			this.closeDropdown();
			return;
		}

		// Use toggleSelection instead of _selectOption to prevent re-rendering
		this.toggleSelection(optionValue);
	}

	/**
	 * Handle document click for closing dropdown
	 */
	private _handleDocumentClick(event: MouseEvent) {
		const targetElement = event.target as HTMLElement;
		// Check if the click is outside the dropdown and the display element
		if (!this._wrapperElement.contains(targetElement)) {
			this.closeDropdown();
		}
	}

	/**
	 * ========================================================================
	 * ACCESSIBILITY METHODS
	 * ========================================================================
	 */

	/**
	 * Set ARIA attributes for accessibility
	 */
	private _setAriaAttributes() {
		this._displayElement.setAttribute(
			'aria-expanded',
			this._dropdownIsOpen.toString(),
		);
	}

	/**
	 * ========================================================================
	 * PUBLIC API
	 * ========================================================================
	 */

	/**
	 * Get the search input element
	 */
	public getSearchInput(): HTMLInputElement {
		return this._searchInputElement;
	}

	/**
	 * Get selected options
	 */
	public getSelectedOptions() {
		return this._state.getSelectedOptions();
	}

	/**
	 * Get configuration
	 */
	public getConfig(): KTSelectConfigInterface {
		return this._config;
	}

	/**
	 * Get option elements
	 */
	public getOptionsElement(): NodeListOf<HTMLElement> {
		return this._options;
	}

	/**
	 * Get dropdown element
	 */
	public getDropdownElement() {
		return this._dropdownContentElement;
	}

	/**
	 * Get value display element
	 */
	public getValueDisplayElement() {
		return this._displayElement;
	}

	/**
	 * Get wrapper element
	 */
	public getWrapperElement(): HTMLElement {
		return this._wrapperElement;
	}

	/**
	 * Show all options in the dropdown
	 */
	public showAllOptions() {
		// Get all options in the dropdown
		const options = Array.from(
			this._wrapperElement.querySelectorAll(`[data-kt-select-option]`),
		);

		// Show all options by removing the hidden class and any inline styles
		options.forEach((option) => {
			// Remove hidden class
			option.classList.remove('hidden');

			// Clean up any existing inline styles for backward compatibility
			if (option.hasAttribute('style')) {
				const styleAttr = option.getAttribute('style');

				if (styleAttr.includes('display:')) {
					// If style only contains display property, remove the entire attribute
					if (
						styleAttr.trim() === 'display: none;' ||
						styleAttr.trim() === 'display: block;'
					) {
						option.removeAttribute('style');
					} else {
						// Otherwise, remove just the display property
						option.setAttribute(
							'style',
							styleAttr?.replace(/display:\s*[^;]+;?/gi, '')?.trim(),
						);
					}
				}
			}
		});

		// If search input exists, clear it
		if (this._searchInputElement) {
			this._searchInputElement.value = '';
			// If we have a search module, clear any search filtering
			if (this._searchModule) {
				this._searchModule.clearSearch();
			}
		}
	}

	/**
	 * Toggle multi-select functionality
	 */
	public enableMultiSelect() {
		this._state.modifyConfig({ multiple: true });
	}

	/**
	 * Disable multi-select functionality
	 */
	public disableMultiSelect() {
		this._state.modifyConfig({ multiple: false });
	}

	/**
	 * Toggle the selection of an option
	 */
	public toggleSelection(value: string): void {
		// Prevent selection if the option is disabled (in dropdown or original select)
		if (this._isOptionDisabled(value)) {
			if (this._config.debug)
				console.log('toggleSelection: Option is disabled, ignoring selection');
			return;
		}

		// Get current selection state
		const isSelected = this._state.isSelected(value);
		if (this._config.debug)
			console.log(
				`toggleSelection called for value: ${value}, isSelected: ${isSelected}, multiple: ${this._config.multiple}`,
			);

		// If already selected in single select mode, do nothing (can't deselect in single select)
		if (isSelected && !this._config.multiple) {
			if (this._config.debug)
				console.log(
					'Early return from toggleSelection - already selected in single select mode',
				);
			return;
		}

		if (this._config.debug)
			console.log(
				`Toggling selection for option: ${value}, currently selected: ${isSelected}`,
			);

		// Ensure any search input is cleared when selection changes
		if (this._searchModule) {
			this._searchModule.clearSearch();
		}

		// Toggle the selection in the state
		this._state.toggleSelectedOptions(value);

		// Update the original select element's option selected state
		const optionEl = Array.from(this._element.querySelectorAll('option')).find(
			(opt) => opt.value === value,
		) as HTMLOptionElement;

		if (optionEl) {
			// For multiple select, toggle the 'selected' attribute
			if (this._config.multiple) {
				optionEl.selected = !isSelected;
			} else {
				// For single select, deselect all other options and select this one
				Array.from(this._element.querySelectorAll('option')).forEach((opt) => {
					(opt as HTMLOptionElement).selected = opt.value === value;
				});
			}
		}

		// Update the display element value
		this.updateSelectedOptionDisplay();

		// Update option classes without re-rendering the dropdown content
		this._updateSelectedOptionClass();

		// For single select mode, always close the dropdown after selection
		// For multiple select mode, keep the dropdown open to allow multiple selections
		if (!this._config.multiple) {
			if (this._config.debug)
				console.log(
					'About to call closeDropdown() for single select mode - always close after selection',
				);
			this.closeDropdown();
		} else {
			if (this._config.debug)
				console.log(
					'Multiple select mode - keeping dropdown open for additional selections',
				);
			// Don't close dropdown in multiple select mode to allow multiple selections
			this.updateSelectAllButtonState();
		}

		// Dispatch custom change event with additional data
		this._dispatchEvent('change', {
			value: value,
			selected: !isSelected,
			selectedOptions: this.getSelectedOptions(),
		});
		this._fireEvent('change', {
			value: value,
			selected: !isSelected,
			selectedOptions: this.getSelectedOptions(),
		});
	}

	/**
	 * Clean up all resources when the component is destroyed
	 * This overrides the parent dispose method
	 */
	public override dispose(): void {
		// Clean up event listeners
		this._eventManager.removeAllListeners(null);

		// Dispose modules
		if (this._dropdownModule) {
			this._dropdownModule.dispose();
		}

		if (this._comboboxModule) {
			if (typeof this._comboboxModule.destroy === 'function') {
				this._comboboxModule.destroy();
			}
		}

		if (this._tagsModule) {
			if (typeof this._tagsModule.destroy === 'function') {
				this._tagsModule.destroy();
			}
		}

		if (this._searchModule) {
			if (typeof this._searchModule.destroy === 'function') {
				this._searchModule.destroy();
			}
		}

		// Remove DOM elements
		if (this._wrapperElement && this._wrapperElement.parentNode) {
			this._wrapperElement.parentNode.removeChild(this._wrapperElement);
		}

		// Call parent dispose to clean up data
		super.dispose();
	}

	/**
	 * ========================================================================
	 * STATIC METHODS
	 * ========================================================================
	 */

	private static readonly _instances = new Map<HTMLElement, KTSelect>();

	/**
	 * Create instances of KTSelect for all matching elements
	 */
	public static createInstances(): void {
		const elements = document.querySelectorAll<HTMLElement>('[data-kt-select]');

		elements.forEach((element) => {
			if (
				element.hasAttribute('data-kt-select') &&
				!element.classList.contains('data-kt-select-initialized')
			) {
				const instance = new KTSelect(element);
				this._instances.set(element, instance);
			}
		});
	}

	/**
	 * Initialize all KTSelect instances
	 */
	public static init(): void {
		KTSelect.createInstances();
	}

	/**
	 * Handle remote search
	 * @param event Input event
	 */
	private _handleRemoteSearch(event: Event) {
		if (
			!this._remoteModule ||
			!this._config.remote ||
			!this._config.searchParam
		)
			return;

		const query = (event.target as HTMLInputElement).value;

		// Check if the query is long enough
		if (query.length < (this._config.searchMinLength || 0)) {
			// Restore original options if query is too short
			this._restoreOriginalOptions();
			return;
		}

		// Debounce the search
		if (this._searchDebounceTimeout) {
			clearTimeout(this._searchDebounceTimeout);
		}

		this._searchDebounceTimeout = window.setTimeout(() => {
			// Show loading state
			this._renderSearchLoadingState();

			// Fetch remote data with search query
			this._remoteModule
				.fetchData(query)
				.then((items) => {
					// Update state with fetched items
					this._state
						.setItems(items)
						.then(() => {
							// Update options in the dropdown
							this._updateSearchResults(items);

							// Refresh the search module to update focus and cache
							if (this._searchModule) {
								this._searchModule.refreshAfterSearch();
							}
							this.updateSelectAllButtonState();
						})
						.catch((error) => {
							console.error('Error updating search results:', error);
							this._renderSearchErrorState(
								error.message || 'Failed to load search results',
							);
						});
				})
				.catch((error) => {
					console.error('Error fetching search results:', error);
					this._renderSearchErrorState(
						this._remoteModule.getErrorMessage() ||
							'Failed to load search results',
					);
				});
		}, this._config.searchDebounce || 300);
	}

	// Search debounce timeout
	private _searchDebounceTimeout: number | null = null;

	/**
	 * Render loading state for search
	 */
	private _renderSearchLoadingState() {
		if (!this._originalOptionsHtml && this._dropdownContentElement) {
			const optionsContainer = this._dropdownContentElement.querySelector(
				'[data-kt-select-options]',
			);
			if (optionsContainer) {
				this._originalOptionsHtml = optionsContainer.innerHTML;
			}
		}
		this._showDropdownMessage('loading', 'Searching...');
	}

	// Store original options HTML for restoring after search
	private _originalOptionsHtml: string | null = null;

	/**
	 * Render error state for search
	 * @param message Error message
	 */
	private _renderSearchErrorState(message: string) {
		this._showDropdownMessage('error', message);

		// Restore original options after error with a delay
		setTimeout(() => {
			this._restoreOriginalOptions();
		}, 2000);
	}

	/**
	 * Restore original options when search is cleared
	 */
	private _restoreOriginalOptions() {
		if (!this._dropdownContentElement || !this._originalOptionsHtml) return;

		// Use cached options container for better performance
		const optionsContainer =
			this._optionsContainer ||
			this._dropdownContentElement.querySelector('[data-kt-select-options]');
		if (!optionsContainer) return;

		// Restore original options
		optionsContainer.innerHTML = this._originalOptionsHtml;

		// Update options NodeList
		this._options = this._wrapperElement.querySelectorAll(
			'[data-kt-select-option]',
		) as NodeListOf<HTMLElement>;

		// Refresh search module
		if (this._searchModule) {
			this._searchModule.refreshAfterSearch();
		}
		this.updateSelectAllButtonState();

		if (this._config.debug) {
			console.log('Restored original options after search clear');
		}
	}

	/**
	 * Update search results in the dropdown
	 * @param items Search result items
	 */
	private _updateSearchResults(items: KTSelectOptionData[]) {
		if (!this._dropdownContentElement) return;

		// Use cached options container for better performance
		const optionsContainer =
			this._optionsContainer ||
			this._dropdownContentElement.querySelector('[data-kt-select-options]');
		if (!optionsContainer) return;

		// Handle empty results
		if (items.length === 0) {
			optionsContainer.innerHTML = '';
			const noResultsElement = defaultTemplates.searchEmpty(this._config);
			optionsContainer.appendChild(noResultsElement);
			return;
		}

		// Use unified renderer for search results
		this._renderOptionsInDropdown(items, true);

		// Add pagination "Load More" button if needed
		if (this._config.pagination && this._remoteModule.hasMorePages()) {
			this._addLoadMoreButton();
		}
	}

	/**
	 * Check if dropdown is open
	 */
	public isDropdownOpen(): boolean {
		return this._dropdownIsOpen;
	}

	public getSelectedOptionsText(): string {
		const selectedValues = this.getSelectedOptions();
		const displaySeparator = this._config.displaySeparator || ', ';
		const texts = selectedValues
			.map((value) => {
				const option = Array.from(this._options).find(
					(opt) => opt.getAttribute('data-value') === value,
				);
				return option?.getAttribute('data-text') || '';
			})
			.filter(Boolean);
		return texts.join(displaySeparator);
	}

	/**
	 * Check if an option is disabled (either in dropdown or original select)
	 */
	private _isOptionDisabled(value: string): boolean {
		const dropdownOption = Array.from(this._options).find(
			(opt) => opt.getAttribute('data-value') === value,
		);
		const isDropdownDisabled =
			dropdownOption &&
			(dropdownOption.classList.contains('disabled') ||
				dropdownOption.getAttribute('aria-disabled') === 'true');
		const selectOption = Array.from(
			this._element.querySelectorAll('option'),
		).find((opt) => opt.value === value) as HTMLOptionElement;
		const isNativeDisabled = selectOption && selectOption.disabled;
		return Boolean(isDropdownDisabled || isNativeDisabled);
	}

	/**
	 * Centralized keyboard event handler for all select modes
	 */
	private _handleKeyboardEvent(event: KeyboardEvent) {
		// If the event target is the search input and the event was already handled (defaultPrevented),
		// then return early to avoid duplicate processing by this broader handler.
		if (event.target === this._searchInputElement && event.defaultPrevented) {
			return;
		}

		const isOpen = this._dropdownIsOpen;
		const config = this._config;
		const focusManager = this._focusManager;
		const buffer = this._typeToSearchBuffer;

		// If the event target is the search input, let it handle most typing keys naturally.
		if (event.target === this._searchInputElement) {
			// Allow navigation keys like ArrowDown, ArrowUp, Escape, Enter (for search/selection) to be handled by the logic below.
			// For other keys (characters, space, backspace, delete), let the input field process them.
			if (
				event.key !== 'ArrowDown' &&
				event.key !== 'ArrowUp' &&
				event.key !== 'Escape' &&
				event.key !== 'Enter' &&
				event.key !== 'Tab' &&
				event.key !== 'Home' &&
				event.key !== 'End' &&
				event.key !== ' '
			) {
				// If it's a character key and we are NOT type-to-searching (because search has focus)
				// then let the input field handle it for its own value.
				// The search module's 'input' event will handle filtering based on the input's value.
				buffer.clear(); // Clear type-to-search buffer when typing in search field
				return;
			}
			// For Enter specifically in search input, we might want to select the focused option or submit search.
			// This is handled later in the switch.
		}

		// Ignore modifier keys (except for specific combinations if added later)
		if (event.altKey || event.ctrlKey || event.metaKey) return;

		// Type-to-search: only for single char keys, when search input does not have focus
		if (
			event.key.length === 1 &&
			!event.repeat &&
			!event.key.match(/\s/) &&
			document.activeElement !== this._searchInputElement
		) {
			buffer.push(event.key);
			const str = buffer.getBuffer();
			if (isOpen) {
				focusManager.focusByString(str);
			} else {
				// If closed, type-to-search could potentially open and select.
				// For now, let's assume it only works when open or opens it first.
				// Or, we could find the matching option and set it directly without opening.
			}
			return; // Type-to-search handles the event
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					this.openDropdown();
				} else {
					focusManager.focusNext();
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!isOpen) {
					this.openDropdown();
				} else {
					focusManager.focusPrevious();
				}
				break;
			case 'Home':
				event.preventDefault();
				if (isOpen) focusManager.focusFirst();
				break;
			case 'End':
				event.preventDefault();
				if (isOpen) focusManager.focusLast();
				break;
			case 'Enter':
			case ' ': // Space
				if (isOpen) {
					const focusedOptionEl = this._focusManager.getFocusedOption();
					if (focusedOptionEl) {
						const val = focusedOptionEl.dataset.value;
						// If single select, and the item is already selected, just close.
						if (
							val !== undefined &&
							!this._config.multiple &&
							this._state.isSelected(val)
						) {
							if (this._config.debug)
								console.log(
									'Enter on already selected item in single-select mode. Closing.',
								);
							this.closeDropdown();
							event.preventDefault();
							break;
						}
					}

					// Proceed with selection if not handled above
					this.selectFocusedOption();

					// Close dropdown only for single select mode (for new selections)
					// Keep dropdown open for multiple select mode to allow additional selections
					if (!this._config.multiple) {
						// This will also be true for the case handled above, but closeDropdown is idempotent.
						// However, the break above prevents this from being reached for that specific case.
						this.closeDropdown();
					}
					event.preventDefault(); // Prevent form submission or other default actions
					break;
				} else {
					this.openDropdown();
				}
				break;
			case 'Escape':
				if (isOpen) {
					this.closeDropdown();
					(event.target as HTMLElement).blur();
				}
				break;
			case 'Tab':
				// Let Tab propagate for normal focus movement
				break;
			default:
				break;
		}
	}

	public renderDisplayTemplateForSelected(selectedValues: string[]): string {
		const optionsConfig = (this._config.optionsConfig as any) || {};
		const displaySeparator = this._config.displaySeparator || ', ';
		const contentArray = Array.from(
			new Set(
				selectedValues
					.map((value) => {
						const option = Array.from(this._options).find(
							(opt) => opt.getAttribute('data-value') === value,
						);
						if (!option) return '';

						let displayTemplate = this._config.displayTemplate;
						const text = option.getAttribute('data-text') || '';

						// Replace all {{varname}} in option.innerHTML with values from _config
						Object.entries(optionsConfig[value] || {}).forEach(([key, val]) => {
							if (['string', 'number', 'boolean'].includes(typeof val)) {
								displayTemplate = displayTemplate.replace(
									new RegExp(`{{${key}}}`, 'g'),
									String(val),
								);
							}
						});

						return renderTemplateString(displayTemplate, {
							selectedCount: selectedValues.length || 0,
							selectedTexts: this.getSelectedOptionsText() || '',
							text,
						});
					})
					.filter(Boolean),
			),
		);
		return contentArray.join(displaySeparator);
	}

	public getDisplayElement(): HTMLElement {
		return this._displayElement;
	}

	private _observeNativeSelect() {
		if (this._mutationObserver) return; // Prevent double observers
		this._mutationObserver = new MutationObserver((mutations) => {
			let needsRebuild = false;
			let needsSelectionSync = false;

			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					// Option(s) added or removed
					needsRebuild = true;
				} else if (
					mutation.type === 'attributes' &&
					mutation.target instanceof HTMLOptionElement
				) {
					if (mutation.attributeName === 'selected') {
						needsSelectionSync = true;
					}
				}
			}

			if (needsRebuild) {
				// Rebuild the custom dropdown options
				this._rebuildOptionsFromNative();
			}
			if (needsSelectionSync) {
				this._syncSelectionFromNative();
			}
		});

		this._mutationObserver.observe(this._element, {
			childList: true,
			attributes: true,
			subtree: true,
			attributeFilter: ['selected'],
		});
	}

	private _rebuildOptionsFromNative() {
		// Remove and rebuild the custom dropdown options from the native select
		if (this._dropdownContentElement) {
			const optionsContainer = this._dropdownContentElement.querySelector(
				'[data-kt-select-options]',
			);
			if (optionsContainer) {
				optionsContainer.innerHTML = '';
				const options = Array.from(this._element.querySelectorAll('option'));
				options.forEach((optionElement) => {
					if (
						optionElement.value === '' &&
						optionElement.textContent.trim() === ''
					) {
						return;
					}
					const selectOption = new KTSelectOption(optionElement, this._config);
					const renderedOption = selectOption.render();
					optionsContainer.appendChild(renderedOption);
				});
				// Update internal references
				this._options = this._wrapperElement.querySelectorAll(
					'[data-kt-select-option]',
				) as NodeListOf<HTMLElement>;
			}
		}
		// Sync selection after rebuilding
		this._syncSelectionFromNative();
		this.updateSelectedOptionDisplay();
		this._updateSelectedOptionClass();
	}

	private _syncSelectionFromNative() {
		// Sync internal state from the native select's selected options
		const selected = Array.from(
			this._element.querySelectorAll('option:checked'),
		).map((opt) => (opt as HTMLOptionElement).value);
		this._state.setSelectedOptions(
			this._config.multiple ? selected : selected[0] || '',
		);
		this.updateSelectedOptionDisplay();
		this._updateSelectedOptionClass();
		this.updateSelectAllButtonState();
	}

	private _handleSelectAllClick(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		const visibleOptions = this._focusManager
			.getVisibleOptions()
			.filter((opt) => opt.getAttribute('aria-disabled') !== 'true');
		if (visibleOptions.length === 0) return;

		const visibleValues = visibleOptions.map(
			(opt) => opt.dataset.value as string,
		);
		const selectedValues = new Set(this.getSelectedOptions());
		const isAllSelected = visibleOptions.every((opt) =>
			selectedValues.has(opt.dataset.value as string),
		);

		if (isAllSelected) {
			// Deselect all visible
			visibleValues.forEach((value) => selectedValues.delete(value));
		} else {
			// Select all visible
			visibleValues.forEach((value) => selectedValues.add(value));
		}

		this._state.setSelectedOptions(Array.from(selectedValues));
		this.updateSelectedOptionDisplay();
		this._updateSelectedOptionClass();
		this.updateSelectAllButtonState();

		this._dispatchEvent('change');
		this._fireEvent('change');
	}

	public updateSelectAllButtonState(): void {
		if (
			!this._config.multiple ||
			!this._config.enableSelectAll ||
			!this._selectAllButtonToggle
		) {
			return;
		}

		const visibleOptions = this._focusManager
			.getVisibleOptions()
			.filter((opt) => opt.getAttribute('aria-disabled') !== 'true');

		if (visibleOptions.length === 0) {
			this._selectAllButton.style.display = 'none';
			return;
		}

		this._selectAllButton.style.display = '';

		const selectedValues = new Set(this.getSelectedOptions());
		const isAllSelected = visibleOptions.every((opt) =>
			selectedValues.has(opt.dataset.value as string),
		);

		this._selectAllButtonToggle.textContent = isAllSelected
			? this._config.clearAllText
			: this._config.selectAllText;
	}
}
