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
	handleDropdownKeyNavigation,
	filterOptions,
	FocusManager,
	EventManager,
} from './utils';
import { KTSelectTags } from './tags';
import { SelectMode } from './types';

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
	private _valueDisplayElement: HTMLElement;
	private _options: NodeListOf<HTMLElement>;

	// State
	private _dropdownIsOpen: boolean = false;
	private _state: KTSelectState;
	private _searchModule: KTSelectSearch;
	private _remoteModule: KTSelectRemote;
	private _comboboxModule: KTSelectCombobox | null = null;
	private _tagsModule: KTSelectTags | null = null;
	private _dropdownModule: KTSelectDropdown | null = null;
	private _loadMoreIndicator: HTMLElement | null = null;
	private _focusManager: FocusManager;
	private _eventManager: EventManager;

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
						this._setupComponent();

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

		// Ensure we have at least an empty option
		if (this._element.querySelectorAll('option').length === 0) {
			const emptyOption = defaultTemplates.emptyOption({
				...this._config,
				placeholder: this._config.placeholder,
			});
			this._element.appendChild(emptyOption);
		}
	}

	/**
	 * Helper to show a dropdown message (error, loading, noResults)
	 */
	private _showDropdownMessage(
		type: 'error' | 'loading' | 'noResults',
		message?: string,
	) {
		if (!this._dropdownContentElement) return;
		const optionsContainer = this._dropdownContentElement.querySelector(
			'[data-kt-select-options-container]',
		);
		if (!optionsContainer) return;

		switch (type) {
			case 'error':
				optionsContainer.innerHTML = defaultTemplates.error({
					...this._config,
					errorMessage: message,
				});
				break;
			case 'loading':
				optionsContainer.innerHTML = defaultTemplates.loading(
					this._config,
					message || 'Loading...',
				).outerHTML;
				break;
			case 'noResults':
				optionsContainer.innerHTML = '';
				optionsContainer.appendChild(defaultTemplates.noResults(this._config));
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
		// Create error option if the select is empty
		if (this._element.querySelectorAll('option').length <= 1) {
			const loadingOptions = this._element.querySelectorAll(
				'option[disabled]:not([value])',
			);
			loadingOptions.forEach((option) => option.remove());

			// Use template function for error option instead of hardcoded element
			const errorOption = defaultTemplates.errorOption({
				...this._config,
				errorMessage: message,
			});
			this._element.appendChild(errorOption);
		}

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
			'[data-kt-select-options-container]',
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
			`[data-kt-select-options-container]`,
		);
		if (!optionsContainer) return;

		// Get the load more button
		const loadMoreButton = optionsContainer.querySelector(
			`[data-kt-select-load-more]`,
		);

		// Process each new item
		newItems.forEach((item) => {
			// Create option for the original select
			const selectOption = defaultTemplates.emptyOption({
				...this._config,
				placeholder: item.title || 'Unnamed option',
			});
			selectOption.value = item.id || '';

			// Add description and icon attributes if available and valid
			if (
				item.description &&
				item.description !== 'null' &&
				item.description !== 'undefined'
			) {
				selectOption.setAttribute(
					'data-kt-select-option-description',
					item.description,
				);
			}
			if (item.icon && item.icon !== 'null' && item.icon !== 'undefined') {
				selectOption.setAttribute('data-kt-select-option-icon', item.icon);
			}

			// Add the option to the original select element
			this._element.appendChild(selectOption);

			// Create option element for the dropdown using the KTSelectOption class
			// This ensures consistent option rendering
			const ktOption = new KTSelectOption(selectOption, this._config);
			const renderedOption = ktOption.render();

			// Add to dropdown container
			if (loadMoreButton) {
				// Insert before the load more button
				optionsContainer.insertBefore(renderedOption, loadMoreButton);
			} else {
				// Append to the end
				optionsContainer.appendChild(renderedOption);
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
		this._initZIndex();

		// Initialize options
		this._initializeOptionsHtml();
		this._preSelectOptions(this._element);

		// Apply disabled state if needed
		this._applyInitialDisabledState();

		// Initialize search if enabled
		if (this._config.enableSearch) {
			this._initializeSearchModule();
		}

		// Initialize combobox if enabled
		if (this._config.mode === SelectMode.COMBOBOX) {
			this._comboboxModule = new KTSelectCombobox(this);
		}

		// Initialize tags if enabled
		if (this._config.mode === SelectMode.TAGS) {
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
		);

		// Update display and set ARIA attributes
		this._updateDisplayAndAriaAttributes();
		this.updateSelectedOptionDisplay();
		this._setAriaAttributes();

		// Attach event listeners after all modules are initialized
		this._attachEventListeners();
	}

	/**
	 * Initialize options HTML from data
	 */
	private _initializeOptionsHtml() {
		this._generateOptionsHtml(this._element);
	}

	/**
	 * Creates the HTML structure for the select component
	 */
	private _createHtmlStructure() {
		const options = Array.from(this._element.querySelectorAll('option'));

		// Create wrapper and display elements
		const wrapperElement = defaultTemplates.main(this._config);
		const displayElement = defaultTemplates.display(this._config);

		// Move classes from original select to display element
		if (this._element.classList.length > 0) {
			displayElement.classList.add(...Array.from(this._element.classList));
			this._element.className = '';
		}

		// Add the display element to the wrapper
		wrapperElement.appendChild(displayElement);

		// Create an empty dropdown first (without options) using template
		const dropdownElement = defaultTemplates.dropdownContent({
			...this._config,
			zindex: this._config.dropdownZindex,
		});

		// Add search input if needed
		const isCombobox = this._config.mode === SelectMode.COMBOBOX;
		const hasSearch = this._config.enableSearch && !isCombobox;

		if (hasSearch) {
			const searchElement = defaultTemplates.search(this._config);
			dropdownElement.appendChild(searchElement);
		}

		// Create options container using template
		const optionsContainer = defaultTemplates.optionsContainer(this._config);

		// Add each option directly to the container
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
		this._element.style.display = 'none';
	}

	/**
	 * Setup all element references after DOM is created
	 */
	private _setupElementReferences() {
		this._wrapperElement = this._element.nextElementSibling as HTMLElement;

		// Get display element
		this._displayElement = this._wrapperElement.querySelector(
			`[data-kt-select-display]`,
		) as HTMLElement;

		// Get dropdown content element - this is critical for dropdown functionality
		this._dropdownContentElement = this._wrapperElement.querySelector(
			`[data-kt-select-dropdown-content]`,
		) as HTMLElement;

		if (!this._dropdownContentElement) {
			console.error('Dropdown content element not found', this._wrapperElement);
		}

		// Get search input element - this is used for the search functionality
		// First check if it's in dropdown, then check if it's in display (for combobox)
		this._searchInputElement = this._dropdownContentElement.querySelector(
			`[data-kt-select-search]`,
		) as HTMLInputElement;

		// If not found in dropdown, check if it's the display element itself (for combobox)
		if (
			!this._searchInputElement &&
			this._config.mode === SelectMode.COMBOBOX
		) {
			this._searchInputElement = this._displayElement as HTMLInputElement;
		}

		if (this._config.debug)
			console.log(
				'Search input found:',
				this._searchInputElement ? 'Yes' : 'No',
				'Mode:',
				this._config.mode,
				'EnableSearch:',
				this._config.enableSearch,
			);

		this._valueDisplayElement = this._wrapperElement.querySelector(
			`[data-kt-select-value]`,
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
		document.addEventListener('keydown', this._handleEscKey.bind(this));

		// Dropdown option click events
		this._eventManager.addListener(
			this._dropdownContentElement,
			'click',
			this._handleDropdownOptionClick.bind(this),
		);

		// Only attach click handler to display element
		this._eventManager.addListener(
			this._displayElement,
			'click',
			this._handleDropdownClick.bind(this),
		);

		// Only attach keyboard navigation to display element if NOT in combobox mode
		// This prevents conflicts with the combobox module's keyboard handler
		if (this._config.mode !== SelectMode.COMBOBOX) {
			if (this._config.debug)
				console.log(
					'Attaching keyboard navigation to display element (non-combobox mode)',
				);
			this._eventManager.addListener(
				this._displayElement,
				'keydown',
				this._handleDropdownKeyDown.bind(this),
			);
		}
	}

	/**
	 * Initialize search module if search is enabled
	 */
	private _initializeSearchModule() {
		// Only initialize search module if NOT in combobox mode
		if (this._config.enableSearch && this._config.mode !== SelectMode.COMBOBOX) {
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

				// Get description - skip if null, undefined, or "null" string
				let description = null;
				if (
					item.description !== undefined &&
					item.description !== null &&
					String(item.description) !== 'null' &&
					String(item.description) !== 'undefined'
				) {
					description = String(item.description);
				} else if (this._config.dataFieldDescription) {
					const extractedDesc = this._getValueByKey(
						item,
						this._config.dataFieldDescription,
					);
					if (
						extractedDesc !== null &&
						extractedDesc !== undefined &&
						String(extractedDesc) !== 'null' &&
						String(extractedDesc) !== 'undefined'
					) {
						description = String(extractedDesc);
					}
				}

				// Get icon - skip if null, undefined, or "null" string
				let icon = null;
				if (
					item.icon !== undefined &&
					item.icon !== null &&
					String(item.icon) !== 'null' &&
					String(item.icon) !== 'undefined'
				) {
					icon = String(item.icon);
				} else if (this._config.dataFieldIcon) {
					const extractedIcon = this._getValueByKey(
						item,
						this._config.dataFieldIcon,
					);
					if (
						extractedIcon !== null &&
						extractedIcon !== undefined &&
						String(extractedIcon) !== 'null' &&
						String(extractedIcon) !== 'undefined'
					) {
						icon = String(extractedIcon);
					}
				}

				// Log the extracted values for debugging
				if (this._config.debug)
					console.log(
						`Option: value=${value}, label=${label}, desc=${description ? description : 'none'}, icon=${icon ? icon : 'none'}`,
					);

				// Set option attributes
				optionElement.value = value;
				optionElement.textContent = label || 'Unnamed option';

				if (description) {
					optionElement.setAttribute(
						'data-kt-select-option-description',
						description,
					);
				}

				if (icon) {
					optionElement.setAttribute('data-kt-select-option-icon', icon);
				}

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
	 * Set appropriate z-index for dropdown
	 */
	private _initZIndex() {
		let zindex: number = this._config.dropdownZindex as number;
		if (
			parseInt(KTDom.getCssProp(this._dropdownContentElement, 'z-index')) >
			zindex
		) {
			zindex = parseInt(
				KTDom.getCssProp(this._dropdownContentElement, 'z-index'),
			);
		}
		if (KTDom.getHighestZindex(this._wrapperElement) > zindex) {
			zindex = KTDom.getHighestZindex(this._wrapperElement) + 1;
		}
		this._dropdownContentElement.style.zIndex = String(zindex);
	}

	/**
	 * ========================================================================
	 * DROPDOWN MANAGEMENT
	 * ========================================================================
	 */

	/**
	 * Toggle dropdown visibility
	 */
	public toggleDropdown() {
		if (this._config.debug) console.log('toggleDropdown called');
		if (this._dropdownModule) {
			// Always use the dropdown module's state to determine whether to open or close
			if (this._dropdownModule.isOpen()) {
				if (this._config.debug) console.log('Dropdown is open, closing...');
				this.closeDropdown();
			} else {
				if (this._config.debug) console.log('Dropdown is closed, opening...');
				this.openDropdown();
			}
		}
	}

	/**
	 * Open the dropdown
	 */
	public openDropdown() {
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

		// Focus search input if configured and exists
		if (
			this._config.enableSearch &&
			this._config.searchAutofocus &&
			this._searchInputElement
		) {
			setTimeout(() => {
				this._searchInputElement.focus();
			}, 50);
		}

		// Update ARIA states
		this._setAriaAttributes();

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

		// Clear search input and highlights if the dropdown is closing
		if (this._searchModule && this._searchInputElement) {
			// Clear search input if configured to do so
			if (this._config.clearSearchOnClose) {
				this._searchInputElement.value = '';
			}

			// Always clear the highlights when dropdown closes
			this._searchModule.clearSearchHighlights();
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

		// Get the first selected option element
		const firstSelectedValue = selectedOptions[0];

		// Use the FocusManager to focus on the option
		this._focusManager.focusOptionByValue(firstSelectedValue);
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
			if (this._config.debug) console.log('_selectOption: Option is disabled, ignoring selection');
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

		if (this._config.renderSelected) {
			// Use the custom renderSelected function if provided
			this._updateValueDisplay(this._config.renderSelected(selectedOptions));
		} else {
			if (selectedOptions.length === 0) {
				if (this._config.mode !== SelectMode.COMBOBOX) {
					this._updateValueDisplay(this._config.placeholder); // Use innerHTML for placeholder
				}
			} else if (this._config.multiple) {
				if (this._config.mode === SelectMode.TAGS) {
					// Use the tags module to render selected options as tags
					if (this._tagsModule) {
						this._tagsModule.updateTagsDisplay(selectedOptions);
					} else {
						// Fallback if tags module not initialized for some reason
						this._updateValueDisplay(selectedOptions.join(', '));
					}
				} else {
					// Render as comma-separated values
					const displayText = selectedOptions
						.map((option) => this._getOptionInnerHtml(option) || '')
						.join(', ');
					this._updateValueDisplay(displayText);
				}
			} else {
				const selectedOption = selectedOptions[0];
				if (selectedOption) {
					const selectedText = this._getOptionInnerHtml(selectedOption);
					this._updateValueDisplay(selectedText);

					// Update combobox input value if in combobox mode
					if (
						this._config.mode === SelectMode.COMBOBOX &&
						this._comboboxModule
					) {
						this._comboboxModule.updateSelectedValue(selectedText);
					}
				} else {
					this._updateValueDisplay(this._config.placeholder);
				}
			}
		}

		// Update any debug display boxes if they exist
		this._updateDebugDisplays();
	}

	/**
	 * Update the value display element
	 */
	private _updateValueDisplay(value: string) {
		if (this._config.mode === SelectMode.COMBOBOX) {
			// For combobox, we only update the hidden value element, not the input
			// The combobox module will handle updating the input value
			if (!this._comboboxModule) {
				(this._valueDisplayElement as HTMLInputElement).value = value;
			}
		} else {
			this._valueDisplayElement.innerHTML = value;
		}
	}

	/**
	 * Update debug displays if present
	 */
	private _updateDebugDisplays() {
		// Check if we're in a test environment with debug boxes
		const selectId = this.getElement().id;
		if (selectId) {
			const debugElement = document.getElementById(`${selectId}-value`);
			if (debugElement) {
				const selectedOptions = this.getSelectedOptions();

				// Format display based on selection mode
				if (this._config.multiple) {
					// For multiple selection, show comma-separated list
					debugElement.textContent =
						selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None';
				} else {
					// For single selection, show just the one value
					debugElement.textContent =
						selectedOptions.length > 0 ? selectedOptions[0] : 'None';
				}
			}
		}
	}

	/**
	 * Get option inner HTML content by option value
	 */
	private _getOptionInnerHtml(optionValue: string) {
		const option = Array.from(this._options).find(
			(opt) => opt.dataset.value === optionValue,
		);
		if (this._config.mode == SelectMode.COMBOBOX) {
			return option.textContent;
		}
		return option.innerHTML; // Get the entire HTML content of the option
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
			if (isSelected) {
				option.classList.add('selected');
				option.setAttribute('aria-selected', 'true');
				option.classList.remove('hidden');
				option.classList.remove('disabled');
				option.removeAttribute('aria-disabled');
			} else {
				option.classList.remove('selected');
				option.setAttribute('aria-selected', 'false');
				if (maxReached) {
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

		// For combobox, also clear the input value
		if (this._config.mode === SelectMode.COMBOBOX) {
			if (this._searchInputElement) {
				this._searchInputElement.value = '';
			}

			// If combobox has a clear button, hide it
			if (this._comboboxModule) {
				// The combobox module will handle hiding the clear button
				this._comboboxModule.resetInputValueToSelection();
			}
		}

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
	 * ========================================================================
	 * KEYBOARD NAVIGATION
	 * ========================================================================
	 */

	/**
	 * Handle dropdown key down events for keyboard navigation
	 * Only used for standard (non-combobox) dropdowns
	 */
	private _handleDropdownKeyDown(event: KeyboardEvent) {
		// Log event for debugging
		if (this._config.debug)
			console.log('Standard dropdown keydown:', event.key);

		// Use the shared handler
		handleDropdownKeyNavigation(event, this, {
			multiple: this._config.multiple,
			closeOnSelect: this._config.closeOnSelect,
		});
	}

	/**
	 * Focus next option in dropdown
	 */
	private _focusNextOption(): Element | null {
		return this._focusManager.focusNext();
	}

	/**
	 * Focus previous option in dropdown
	 */
	private _focusPreviousOption(): Element | null {
		return this._focusManager.focusPrevious();
	}

	/**
	 * Apply hover/focus state to focused option
	 */
	private _hoverFocusedOption(option: Element) {
		this._focusManager.applyFocus(option as HTMLElement);
	}

	/**
	 * Scroll option into view when navigating
	 */
	private _scrollOptionIntoView(option: Element) {
		this._focusManager.scrollIntoView(option as HTMLElement);
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

			// For combobox mode, update input value AFTER selection to ensure consistency
			if (this._config.mode === SelectMode.COMBOBOX && this._comboboxModule) {
				this._comboboxModule.updateSelectedValue(selectedText);
				// Also directly update the input value for immediate visual feedback
				if (this._searchInputElement) {
					this._searchInputElement.value = selectedText;
				}
			}
		}
	}

	/**
	 * ========================================================================
	 * COMBOBOX SPECIFIC METHODS
	 * ========================================================================
	 */

	/**
	 * Handle combobox input events
	 */
	private _handleComboboxInput(event: Event) {
		if (this._comboboxModule) {
			return;
		}

		const inputElement = event.target as HTMLInputElement;
		const query = inputElement.value.toLowerCase();

		// If dropdown isn't open, open it when user starts typing
		if (!this._dropdownIsOpen) {
			this.openDropdown();
		}

		// Filter options based on input
		this._filterOptionsForCombobox(query);
	}

	/**
	 * Filter options for combobox based on input query
	 * Uses the shared filterOptions function
	 */
	private _filterOptionsForCombobox(query: string) {
		const options = Array.from(
			this._dropdownContentElement.querySelectorAll('[data-kt-select-option]'),
		) as HTMLElement[];

		filterOptions(options, query, this._config, this._dropdownContentElement);
	}

	/**
	 * ========================================================================
	 * EVENT HANDLERS
	 * ========================================================================
	 */

	/**
	 * Handle display element click
	 */
	private _handleDropdownClick(event: Event) {
		if (this._config.debug)
			console.log('Display element clicked', event.target);
		event.preventDefault();
		event.stopPropagation(); // Prevent event bubbling
		this.toggleDropdown();
	}

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
	 * Handle escape key press
	 */
	private _handleEscKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && this._dropdownIsOpen) {
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
	 * Handle focus events
	 */
	private _handleFocus() {
		// Implementation pending
	}

	/**
	 * Handle blur events
	 */
	private _handleBlur() {
		// Implementation pending
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
		return this._valueDisplayElement;
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
							styleAttr.replace(/display:\s*[^;]+;?/gi, '').trim(),
						);
					}
				}
			}
		});

		// If search input exists, clear it
		if (this._searchInputElement && this._config.mode !== SelectMode.COMBOBOX) {
			this._searchInputElement.value = '';
			// If we have a search module, clear any search filtering
			if (this._searchModule) {
				this._searchModule.clearSearchHighlights();
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
			if (this._config.debug) console.log('toggleSelection: Option is disabled, ignoring selection');
			return;
		}

		// Get current selection state
		const isSelected = this._state.isSelected(value);
		if (this._config.debug)
			console.log(
				`toggleSelection called for value: ${value}, isSelected: ${isSelected}, multiple: ${this._config.multiple}, closeOnSelect: ${this._config.closeOnSelect}`,
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

		// Ensure any search highlights are cleared when selection changes
		if (this._searchModule) {
			this._searchModule.clearSearchHighlights();
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
		// For multiple select mode, only close if closeOnSelect is true
		if (!this._config.multiple) {
			if (this._config.debug)
				console.log(
					'About to call closeDropdown() for single select mode - always close after selection',
				);
			this.closeDropdown();
		} else if (this._config.closeOnSelect) {
			if (this._config.debug)
				console.log(
					'About to call closeDropdown() for multiple select with closeOnSelect:true',
				);
			this.closeDropdown();
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

							// Refresh the search module's option cache if search is enabled
							if (this._searchModule && this._config.enableSearch) {
								this._searchModule.refreshOptionCache();
							}
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
				'[data-kt-select-options-container]',
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
	}

	/**
	 * Update search results in the dropdown
	 * @param items Search result items
	 */
	private _updateSearchResults(items: KTSelectOptionData[]) {
		if (!this._dropdownContentElement) return;

		const optionsContainer = this._dropdownContentElement.querySelector(
			'[data-kt-select-options-container]',
		);
		if (!optionsContainer) return;

		// Clear current options
		optionsContainer.innerHTML = '';

		if (items.length === 0) {
			// Show no results message using template for consistency and customization
			const noResultsElement = defaultTemplates.noResults(this._config);
			optionsContainer.appendChild(noResultsElement);
			return;
		}

		// Process each item individually to create options
		items.forEach((item) => {
			// Create option for the original select
			const selectOption = defaultTemplates.emptyOption({
				...this._config,
				placeholder: item.title,
			});
			selectOption.value = item.id;
			if (item.description) {
				selectOption.setAttribute(
					'data-kt-select-option-description',
					item.description,
				);
			}
			if (item.icon) {
				selectOption.setAttribute('data-kt-select-option-icon', item.icon);
			}

			// Create option element for the dropdown
			const ktOption = new KTSelectOption(selectOption, this._config);
			const renderedOption = ktOption.render();

			// Add to dropdown container
			optionsContainer.appendChild(renderedOption);
		});

		// Add pagination "Load More" button if needed
		if (this._config.pagination && this._remoteModule.hasMorePages()) {
			this._addLoadMoreButton();
		}

		// Update options NodeList
		this._options = this._wrapperElement.querySelectorAll(
			`[data-kt-select-option]`,
		) as NodeListOf<HTMLElement>;
	}

	/**
	 * Filter options by query
	 */
	public filterOptions(query: string): void {
		this._filterOptionsForCombobox(query);
	}

	/**
	 * Check if dropdown is open
	 */
	public isDropdownOpen(): boolean {
		return this._dropdownIsOpen;
	}

	/**
	 * Check if an option is disabled (either in dropdown or original select)
	 */
	private _isOptionDisabled(value: string): boolean {
		const dropdownOption = Array.from(this._options).find(
			(opt) => opt.getAttribute('data-value') === value
		);
		const isDropdownDisabled = dropdownOption && (dropdownOption.classList.contains('disabled') || dropdownOption.getAttribute('aria-disabled') === 'true');
		const selectOption = Array.from(this._element.querySelectorAll('option')).find(
			(opt) => opt.value === value
		) as HTMLOptionElement;
		const isNativeDisabled = selectOption && selectOption.disabled;
		return Boolean(isDropdownDisabled || isNativeDisabled);
	}
}
