/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import KTComponent from '../component';
import { KTDatepickerCalendar } from './calendar';
import { KTDatepickerStateManager } from './config';
import { KTDatepickerKeyboard } from './keyboard';
import { DateRangeInterface, KTDatepickerConfigInterface } from './types';
import { formatDate, parseDate, isValidDate, isDateDisabled } from './utils';
import {
	datepickerContainerTemplate,
	inputWrapperTemplate,
	segmentedDateInputTemplate,
	segmentedDateRangeInputTemplate,
	placeholderTemplate,
} from './templates';
import { KTDatepickerEventManager, KTDatepickerEventName } from './events';

// Helper function to replace stringToElement
function createElement(html: string): HTMLElement {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild as HTMLElement;
}

/**
 * KTDatepicker - Main datepicker component class
 * Manages the datepicker functionality and integration with input elements
 */
export class KTDatepicker extends KTComponent {
	protected override readonly _name: string = 'datepicker';
	protected override readonly _config: KTDatepickerConfigInterface;

	private _state: KTDatepickerStateManager;
	private _calendar: KTDatepickerCalendar;
	private _keyboard: KTDatepickerKeyboard;
	private _eventManager: KTDatepickerEventManager;

	private _dateInputElement: HTMLInputElement | null = null;
	private _startDateInputElement: HTMLInputElement | null = null;
	private _endDateInputElement: HTMLInputElement | null = null;
	private _displayElement: HTMLElement | null = null;
	private _useSegmentedDisplay = false;
	private _displayWrapper: HTMLElement | null = null;
	private _displayText: HTMLElement | null = null;

	private _currentDate: Date | null = null;
	private _currentRange: DateRangeInterface | null = null;
	private _segmentFocused:
		| 'day'
		| 'month'
		| 'year'
		| 'start-day'
		| 'start-month'
		| 'start-year'
		| 'end-day'
		| 'end-month'
		| 'end-year'
		| null = null;

	/**
	 * Constructor for the KTDatepicker class.
	 */
	constructor(element: HTMLElement, config?: KTDatepickerConfigInterface) {
		super();

		// Check if the element already has a datepicker instance attached to it
		if (element.getAttribute('data-kt-datepicker-initialized') === 'true') {
			return;
		}

		// Initialize the datepicker with the provided element
		this._init(element);

		// Build the configuration object by merging the default config with the provided config
		this._buildConfig(config);

		// Store the instance of the datepicker directly on the element
		(element as any).instance = this;

		// Ensure the element is focusable
		this._element.setAttribute('tabindex', '0');
		this._element.classList.add(
			'kt-datepicker',
			'relative',
			'focus:outline-none',
		);

		// Mark as initialized
		this._element.setAttribute('data-kt-datepicker-initialized', 'true');

		// Find input elements
		this._initializeInputElements();

		// Create display element if needed
		this._createDisplayElement();

		// Create state manager first
		this._state = new KTDatepickerStateManager(this._element, this._config);
		this._config = this._state.getConfig();

		// Initialize the calendar and keyboard after creating the state manager
		this._calendar = new KTDatepickerCalendar(this._element, this._state);
		this._keyboard = new KTDatepickerKeyboard(this._element, this._state);

		// Initialize event manager
		this._eventManager = this._state.getEventManager();

		// Set up event listeners
		this._setupEventListeners();

		// Initialize with any default values
		this._initializeDefaultValues();
	}

	/**
	 * Initialize input elements
	 */
	private _initializeInputElements(): void {
		// Get main input element - will be hidden
		this._dateInputElement = this._element.querySelector(
			'[data-kt-datepicker-input]',
		);

		// Hide the input element and make it only for data storage
		if (this._dateInputElement) {
			this._dateInputElement.classList.add('hidden', 'sr-only');
			this._dateInputElement.setAttribute('aria-hidden', 'true');
			this._dateInputElement.tabIndex = -1;
		}

		// Get range input elements if applicable
		this._startDateInputElement = this._element.querySelector(
			'[data-kt-datepicker-start]',
		);
		this._endDateInputElement = this._element.querySelector(
			'[data-kt-datepicker-end]',
		);

		// Get display element if exists
		this._displayElement = this._element.querySelector(
			'[data-kt-datepicker-display]',
		);

		// Check if we should use segmented display
		this._useSegmentedDisplay =
			this._element.hasAttribute('data-kt-datepicker-segmented') ||
			this._element.hasAttribute('data-kt-datepicker-segmented-input');
	}

	/**
	 * Create display element for datepicker
	 */
	private _createDisplayElement(): void {
		// Skip if already created
		if (this._displayElement) {
			return;
		}

		// Get format from config or use default
		const format = this._config.format || 'mm/dd/yyyy';
		const placeholder =
			this._dateInputElement?.getAttribute('placeholder') || format;

		// Create wrapper for display element
		this._displayWrapper = document.createElement('div');
		this._displayWrapper.className =
			'kt-datepicker-display-wrapper kt-datepicker-display-segment';
		this._displayWrapper.setAttribute('role', 'combobox');
		this._displayWrapper.setAttribute('aria-haspopup', 'dialog');
		this._displayWrapper.setAttribute('aria-expanded', 'false');
		this._element.appendChild(this._displayWrapper);

		if (this._useSegmentedDisplay) {
			// Create segmented display for better date part selection
			const displayContainer = document.createElement('div');
			displayContainer.className = 'kt-datepicker-display-element';
			displayContainer.setAttribute('tabindex', '0');
			displayContainer.setAttribute('role', 'textbox');
			displayContainer.setAttribute('aria-label', placeholder);
			displayContainer.setAttribute('data-kt-datepicker-display', '');

			// Add segmented template based on range mode
			if (this._config.range) {
				displayContainer.innerHTML = segmentedDateRangeInputTemplate(
					this._config.format || 'mm/dd/yyyy',
				);
			} else {
				displayContainer.innerHTML = segmentedDateInputTemplate(
					this._config.format || 'mm/dd/yyyy',
				);
			}

			this._displayElement = displayContainer;
			this._displayWrapper.appendChild(this._displayElement);

			// Add click handlers for segments
			const segments = this._displayElement.querySelectorAll('[data-segment]');
			segments.forEach((segment) => {
				segment.addEventListener('click', (e) => {
					e.stopPropagation();
					const segmentType = segment.getAttribute('data-segment');
					this._handleSegmentClick(segmentType);
				});
			});
		} else {
			// Create simple display element
			this._displayElement = document.createElement('div');
			this._displayElement.className = 'kt-datepicker-display-element';
			this._displayElement.setAttribute('tabindex', '0');
			this._displayElement.setAttribute('role', 'textbox');
			this._displayElement.setAttribute('aria-label', placeholder);
			this._displayElement.setAttribute('data-placeholder', placeholder);
			this._displayElement.setAttribute('data-kt-datepicker-display', '');

			// Create display text element
			this._displayText = document.createElement('span');
			this._displayText.className = 'kt-datepicker-display-text';
			this._displayText.textContent = placeholder;
			this._displayText.classList.add('text-gray-400');

			this._displayElement.appendChild(this._displayText);
			this._displayWrapper.appendChild(this._displayElement);
		}

		// Add click event to display element
		this._displayElement.addEventListener('click', (e) => {
			e.preventDefault();
			if (!this._state.getState().isOpen) {
				this._state.setOpen(true);
			}
		});

		// Enhanced keyboard event handling for display element
		this._displayElement.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				e.stopPropagation();

				// If not already open, open the dropdown
				if (!this._state.getState().isOpen) {
					this._state.setOpen(true);

					// Dispatch a custom event to notify about the keyboard open
					this._eventManager.dispatchKeyboardOpenEvent();
				}
			}
		});
	}

	/**
	 * Handle segment click to focus and open appropriate view
	 *
	 * @param segmentType - Type of segment clicked
	 */
	private _handleSegmentClick(segmentType: string | null): void {
		if (!segmentType) return;

		// Store the focused segment
		this._segmentFocused = segmentType as any;

		// Remove highlight from all segments
		this._removeSegmentHighlights();

		// Add highlight to clicked segment
		if (this._displayElement) {
			const segment = this._displayElement.querySelector(
				`[data-segment="${segmentType}"]`,
			);
			if (segment) {
				segment.classList.add('kt-datepicker-segment-focused');
			}
		}

		// Set the appropriate view mode based on segment type
		if (segmentType.includes('day')) {
			// Day segment - open in days view (default)
			this._state.setViewMode('days');
			this._state.setOpen(true);
		} else if (segmentType.includes('month')) {
			// Month segment - open in months view
			this._state.setViewMode('months');
			this._state.setOpen(true);
		} else if (segmentType.includes('year')) {
			// Year segment - open in years view
			this._state.setViewMode('years');
			this._state.setOpen(true);
		}
	}

	/**
	 * Set up event listeners
	 */
	private _setupEventListeners(): void {
		// Listen for state changes
		this._eventManager.addEventListener(
			KTDatepickerEventName.STATE_CHANGE,
			(e: CustomEvent) => {
				const { state } = e.detail;

				// Update ARIA attributes based on open state
				if (this._displayWrapper) {
					this._displayWrapper.setAttribute(
						'aria-expanded',
						state.isOpen.toString(),
					);
				}

				// Update display when closing
				if (!state.isOpen && state.prevIsOpen) {
					this._syncDisplayWithSelectedDate();
				}
			},
		);

		// Set up change event listener to update input values
		this._eventManager.addEventListener(
			KTDatepickerEventName.DATE_CHANGE,
			this._handleDateChange.bind(this),
		);

		// Add keyboard events to the root element
		this._element.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				const state = this._state.getState();
				if (!state.isOpen) {
					e.preventDefault();
					this._state.setOpen(true);
				}
			}
		});

		// Add keyboard navigation for segments
		if (this._displayElement && this._useSegmentedDisplay) {
			this._displayElement.addEventListener(
				'keydown',
				this._handleSegmentKeydown.bind(this),
			);
		}
	}

	/**
	 * Handle keyboard navigation between segments
	 *
	 * @param e - Keyboard event
	 */
	private _handleSegmentKeydown(e: KeyboardEvent): void {
		// Only handle if we have a focused segment
		if (!this._segmentFocused) return;

		const target = e.target as HTMLElement;
		const segmentType = target.getAttribute('data-segment');
		if (!segmentType) return;

		// Handle keyboard navigation
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				this._navigateSegments('prev', segmentType);
				break;
			case 'ArrowRight':
				e.preventDefault();
				this._navigateSegments('next', segmentType);
				break;
			case 'Tab':
				// Let default tab behavior work, but update focus segment when tabbing
				this._segmentFocused = segmentType as any;
				// Remove highlight from all segments
				this._removeSegmentHighlights();
				// Add highlight to current segment
				target.classList.add('segment-focused');
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				this._handleSegmentClick(segmentType);
				break;
		}
	}

	/**
	 * Navigate between segments with keyboard
	 *
	 * @param direction - 'prev' or 'next'
	 * @param currentSegment - Current segment identifier
	 */
	private _navigateSegments(
		direction: 'prev' | 'next',
		currentSegment: string,
	): void {
		if (!this._displayElement) return;

		// Define segment order
		let segments: string[];
		if (this._config.range) {
			segments = [
				'start-month',
				'start-day',
				'start-year',
				'end-month',
				'end-day',
				'end-year',
			];
		} else {
			segments = ['month', 'day', 'year'];
		}

		// Find current index
		const currentIndex = segments.indexOf(currentSegment);
		if (currentIndex === -1) return;

		// Calculate new index
		let newIndex;
		if (direction === 'prev') {
			newIndex = currentIndex === 0 ? segments.length - 1 : currentIndex - 1;
		} else {
			newIndex = currentIndex === segments.length - 1 ? 0 : currentIndex + 1;
		}

		// Find new segment element
		const newSegment = this._displayElement.querySelector(
			`[data-segment="${segments[newIndex]}"]`,
		) as HTMLElement;
		if (!newSegment) return;

		// Update focus
		newSegment.focus();
		this._segmentFocused = segments[newIndex] as any;

		// Remove highlight from all segments
		this._removeSegmentHighlights();

		// Add highlight to new segment
		newSegment.classList.add('segment-focused');
	}

	/**
	 * Remove highlight from all segments
	 */
	private _removeSegmentHighlights(): void {
		if (!this._displayElement) return;

		const segments = this._displayElement.querySelectorAll('.segment-part');
		segments.forEach((segment) => {
			segment.classList.remove('segment-focused');
		});
	}

	/**
	 * Sync display element with the selected date
	 */
	private _syncDisplayWithSelectedDate(): void {
		if (!this._displayElement) return;

		const state = this._state.getState();
		const selectedDate = state.selectedDate;
		const selectedDateRange = state.selectedDateRange;

		if (this._useSegmentedDisplay) {
			// Update segmented display elements
			if (selectedDate) {
				// Single date
				const daySegment = this._displayElement.querySelector(
					'[data-segment="day"]',
				);
				const monthSegment = this._displayElement.querySelector(
					'[data-segment="month"]',
				);
				const yearSegment = this._displayElement.querySelector(
					'[data-segment="year"]',
				);

				if (daySegment) {
					daySegment.textContent = selectedDate
						.getDate()
						.toString()
						.padStart(2, '0');
				}
				if (monthSegment) {
					monthSegment.textContent = (selectedDate.getMonth() + 1)
						.toString()
						.padStart(2, '0');
				}
				if (yearSegment) {
					yearSegment.textContent = selectedDate.getFullYear().toString();
				}
			} else if (selectedDateRange && selectedDateRange.startDate) {
				// Range selection
				const startDay = this._displayElement.querySelector(
					'[data-segment="start-day"]',
				);
				const startMonth = this._displayElement.querySelector(
					'[data-segment="start-month"]',
				);
				const startYear = this._displayElement.querySelector(
					'[data-segment="start-year"]',
				);

				if (startDay) {
					startDay.textContent = selectedDateRange.startDate
						.getDate()
						.toString()
						.padStart(2, '0');
				}
				if (startMonth) {
					startMonth.textContent = (selectedDateRange.startDate.getMonth() + 1)
						.toString()
						.padStart(2, '0');
				}
				if (startYear) {
					startYear.textContent = selectedDateRange.startDate
						.getFullYear()
						.toString();
				}

				if (selectedDateRange.endDate) {
					const endDay = this._displayElement.querySelector(
						'[data-segment="end-day"]',
					);
					const endMonth = this._displayElement.querySelector(
						'[data-segment="end-month"]',
					);
					const endYear = this._displayElement.querySelector(
						'[data-segment="end-year"]',
					);

					if (endDay) {
						endDay.textContent = selectedDateRange.endDate
							.getDate()
							.toString()
							.padStart(2, '0');
					}
					if (endMonth) {
						endMonth.textContent = (selectedDateRange.endDate.getMonth() + 1)
							.toString()
							.padStart(2, '0');
					}
					if (endYear) {
						endYear.textContent = selectedDateRange.endDate
							.getFullYear()
							.toString();
					}
				}
			}
		} else if (this._displayText) {
			// Simple display
			if (selectedDate) {
				// Clear placeholder styling
				this._displayText.classList.remove('placeholder');

				// Format date(s) based on config
				if (
					this._config.range &&
					selectedDateRange &&
					selectedDateRange.startDate &&
					selectedDateRange.endDate
				) {
					this._displayText.textContent = `${formatDate(
						selectedDateRange.startDate,
						this._config.format,
						this._config,
					)} - ${formatDate(
						selectedDateRange.endDate,
						this._config.format,
						this._config,
					)}`;
				} else {
					this._displayText.textContent = formatDate(
						selectedDate,
						this._config.format,
						this._config,
					);
				}
			} else {
				// No date selected, show format as placeholder
				const placeholder =
					this._displayElement?.getAttribute('data-placeholder') ||
					this._config.format;
				this._displayText.textContent = placeholder;
				this._displayText.classList.add('placeholder');
			}
		}
	}

	/**
	 * Handle date change events
	 *
	 * @param e - Custom event with date change details
	 */
	private _handleDateChange(e: CustomEvent): void {
		const detail = e.detail?.payload;
		if (!detail) return;

		// Handle single date selection
		if (detail.selectedDate) {
			const formattedDate = formatDate(
				detail.selectedDate,
				this._config.format,
				this._config,
			);

			// Update hidden input value
			if (this._dateInputElement) {
				this._dateInputElement.value = formattedDate;
				// Dispatch change event on input to trigger form validation
				this._dateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			// Update display element
			this._updateDisplayElement(detail.selectedDate);
		}

		// Handle date range selection
		if (detail.selectedDateRange && this._config.range) {
			const { startDate, endDate } = detail.selectedDateRange;

			// Format the range for the hidden input
			if (this._dateInputElement) {
				let displayValue = '';

				if (startDate) {
					displayValue = formatDate(
						startDate,
						this._config.format,
						this._config,
					);

					if (endDate) {
						const endFormatted = formatDate(
							endDate,
							this._config.format,
							this._config,
						);
						displayValue += `${this._config.rangeSeparator}${endFormatted}`;
					}
				}

				this._dateInputElement.value = displayValue;
				// Dispatch change event on input
				this._dateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			// Update individual start/end inputs if they exist
			if (this._startDateInputElement && startDate) {
				this._startDateInputElement.value = formatDate(
					startDate,
					this._config.format,
					this._config,
				);
				this._startDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			if (this._endDateInputElement && endDate) {
				this._endDateInputElement.value = formatDate(
					endDate,
					this._config.format,
					this._config,
				);
				this._endDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			// Update display element for range
			this._updateRangeDisplayElement(startDate, endDate);
		}
	}

	/**
	 * Update the display element for a single date
	 *
	 * @param date - The date to display
	 */
	private _updateDisplayElement(date: Date | null): void {
		if (!this._displayElement) return;

		if (!date) {
			// If no date, show placeholder
			const placeholder =
				this._dateInputElement?.getAttribute('placeholder') || 'Select date';
			this._displayElement.innerHTML = placeholderTemplate(placeholder);
			return;
		}

		if (this._useSegmentedDisplay) {
			// Update segmented display
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();

			const daySegment = this._displayElement.querySelector(
				'[data-segment="day"]',
			);
			const monthSegment = this._displayElement.querySelector(
				'[data-segment="month"]',
			);
			const yearSegment = this._displayElement.querySelector(
				'[data-segment="year"]',
			);

			if (daySegment) daySegment.textContent = day < 10 ? `0${day}` : `${day}`;
			if (monthSegment)
				monthSegment.textContent = month < 10 ? `0${month}` : `${month}`;
			if (yearSegment) yearSegment.textContent = `${year}`;
		} else {
			// Simple display
			this._displayElement.textContent = formatDate(
				date,
				this._config.format,
				this._config,
			);
		}
	}

	/**
	 * Update the display element for a date range
	 *
	 * @param startDate - The start date of the range
	 * @param endDate - The end date of the range
	 */
	private _updateRangeDisplayElement(
		startDate: Date | null,
		endDate: Date | null,
	): void {
		if (!this._displayElement) return;

		if (!startDate) {
			// If no date, show placeholder
			const placeholder =
				this._dateInputElement?.getAttribute('placeholder') ||
				'Select date range';
			this._displayElement.innerHTML = placeholderTemplate(placeholder);
			return;
		}

		if (this._useSegmentedDisplay) {
			// Update segmented range display
			// Start date segments
			const startDay = this._displayElement.querySelector(
				'[data-segment="start-day"]',
			);
			const startMonth = this._displayElement.querySelector(
				'[data-segment="start-month"]',
			);
			const startYear = this._displayElement.querySelector(
				'[data-segment="start-year"]',
			);

			if (startDay)
				startDay.textContent =
					startDate.getDate() < 10
						? `0${startDate.getDate()}`
						: `${startDate.getDate()}`;
			if (startMonth)
				startMonth.textContent =
					startDate.getMonth() + 1 < 10
						? `0${startDate.getMonth() + 1}`
						: `${startDate.getMonth() + 1}`;
			if (startYear) startYear.textContent = `${startDate.getFullYear()}`;

			// End date segments
			if (endDate) {
				const endDay = this._displayElement.querySelector(
					'[data-segment="end-day"]',
				);
				const endMonth = this._displayElement.querySelector(
					'[data-segment="end-month"]',
				);
				const endYear = this._displayElement.querySelector(
					'[data-segment="end-year"]',
				);

				if (endDay)
					endDay.textContent =
						endDate.getDate() < 10
							? `0${endDate.getDate()}`
							: `${endDate.getDate()}`;
				if (endMonth)
					endMonth.textContent =
						endDate.getMonth() + 1 < 10
							? `0${endDate.getMonth() + 1}`
							: `${endDate.getMonth() + 1}`;
				if (endYear) endYear.textContent = `${endDate.getFullYear()}`;
			}
		} else {
			// Simple display
			let displayText = formatDate(
				startDate,
				this._config.format,
				this._config,
			);

			if (endDate) {
				const endFormatted = formatDate(
					endDate,
					this._config.format,
					this._config,
				);
				displayText += `${this._config.rangeSeparator}${endFormatted}`;
			}

			this._displayElement.textContent = displayText;
		}
	}

	/**
	 * Handle input change events
	 *
	 * @param e - Input change event
	 */
	private _handleInputChange(e: Event): void {
		const input = e.target as HTMLInputElement;
		const inputValue = input.value.trim();

		if (!inputValue) {
			// Clear selection if input is empty
			this._state.setSelectedDate(null);
			return;
		}

		if (this._config.range) {
			// Handle range input
			const rangeParts = inputValue.split(this._config.rangeSeparator);

			if (rangeParts.length === 2) {
				const startDate = parseDate(
					rangeParts[0].trim(),
					this._config.format,
					this._config,
				);
				const endDate = parseDate(
					rangeParts[1].trim(),
					this._config.format,
					this._config,
				);

				// Validate dates are within min/max constraints
				if (startDate && isDateDisabled(startDate, this._config)) {
					console.log(
						'Start date from input is outside allowed range:',
						startDate.toISOString(),
					);
					return;
				}

				if (endDate && isDateDisabled(endDate, this._config)) {
					console.log(
						'End date from input is outside allowed range:',
						endDate.toISOString(),
					);
					return;
				}

				if (startDate && endDate) {
					this.setDateRange(startDate, endDate);
				}
			} else if (rangeParts.length === 1) {
				const singleDate = parseDate(
					rangeParts[0].trim(),
					this._config.format,
					this._config,
				);

				// Validate date is within min/max constraints
				if (singleDate && isDateDisabled(singleDate, this._config)) {
					console.log(
						'Date from input is outside allowed range:',
						singleDate.toISOString(),
					);
					return;
				}

				if (singleDate) {
					this.setDateRange(singleDate, null);
				}
			}
		} else {
			// Handle single date input
			const parsedDate = parseDate(
				inputValue,
				this._config.format,
				this._config,
			);

			// Validate date is within min/max constraints
			if (parsedDate && isDateDisabled(parsedDate, this._config)) {
				console.log(
					'Date from input is outside allowed range:',
					parsedDate.toISOString(),
				);
				return;
			}

			if (parsedDate) {
				this.setDate(parsedDate);
			}
		}
	}

	/**
	 * Initialize with default values from input
	 */
	private _initializeDefaultValues(): void {
		// Set min and max dates from attributes if they exist
		const minDateAttr = this._element.getAttribute(
			'data-kt-datepicker-min-date',
		);
		const maxDateAttr = this._element.getAttribute(
			'data-kt-datepicker-max-date',
		);

		if (minDateAttr) {
			const minDate = parseDate(minDateAttr, this._config.format, this._config);
			if (minDate) {
				this.setMinDate(minDate);
			}
		}

		if (maxDateAttr) {
			const maxDate = parseDate(maxDateAttr, this._config.format, this._config);
			if (maxDate) {
				this.setMaxDate(maxDate);
			}
		}

		// Check for default value in main input
		if (this._dateInputElement && this._dateInputElement.value) {
			this._handleInputChange({
				target: this._dateInputElement,
			} as unknown as Event);
		}
		// Check for default values in range inputs
		else if (
			this._config.range &&
			this._startDateInputElement &&
			this._startDateInputElement.value
		) {
			const startDate = parseDate(
				this._startDateInputElement.value,
				this._config.format,
				this._config,
			);
			let endDate = null;

			if (this._endDateInputElement && this._endDateInputElement.value) {
				endDate = parseDate(
					this._endDateInputElement.value,
					this._config.format,
					this._config,
				);
			}

			if (startDate) {
				this.setDateRange(startDate, endDate);
			}
		}
	}

	/**
	 * ========================================================================
	 * Public API
	 * ========================================================================
	 */

	/**
	 * Get the currently selected date
	 *
	 * @returns Selected date, null if no selection, or date range object
	 */
	public getDate(): Date | null | DateRangeInterface {
		const state = this._state.getState();
		const config = this._state.getConfig();

		if (config.range) {
			return state.selectedDateRange || { startDate: null, endDate: null };
		} else {
			return state.selectedDate;
		}
	}

	/**
	 * Set the selected date
	 *
	 * @param date - Date to select or null to clear selection
	 */
	public setDate(date: Date | null): void {
		// Skip if the date is disabled (outside min/max range)
		if (date && isDateDisabled(date, this._config)) {
			console.log(
				'Date is disabled in setDate, ignoring selection:',
				date.toISOString(),
			);
			return;
		}

		this._state.setSelectedDate(date);

		if (date) {
			this._state.setCurrentDate(date);
		}

		// Update the display
		this._updateDisplayElement(date);

		// Update hidden input
		if (this._dateInputElement && date) {
			this._dateInputElement.value = formatDate(
				date,
				this._config.format,
				this._config,
			);
			this._dateInputElement.dispatchEvent(
				new Event('change', { bubbles: true }),
			);
		} else if (this._dateInputElement) {
			this._dateInputElement.value = '';
			this._dateInputElement.dispatchEvent(
				new Event('change', { bubbles: true }),
			);
		}
	}

	/**
	 * Get the currently selected date range
	 *
	 * @returns Selected date range or null if no selection
	 */
	public getDateRange(): DateRangeInterface | null {
		const state = this._state.getState();
		return state.selectedDateRange;
	}

	/**
	 * Set the selected date range
	 *
	 * @param start - Start date of the range
	 * @param end - End date of the range
	 */
	public setDateRange(start: Date | null, end: Date | null): void {
		const state = this._state.getState();

		// Ensure we're in range mode
		if (!this._config.range) {
			console.warn('Cannot set date range when range mode is disabled');
			return;
		}

		// Validate start and end dates are within min/max range
		if (start && isDateDisabled(start, this._config)) {
			console.log(
				'Start date is disabled in setDateRange, ignoring selection:',
				start.toISOString(),
			);
			return;
		}

		if (end && isDateDisabled(end, this._config)) {
			console.log(
				'End date is disabled in setDateRange, ignoring selection:',
				end.toISOString(),
			);
			return;
		}

		// Reset range selection state
		this._state.getState().isRangeSelectionStart = true;

		// Set start date
		if (start) {
			if (!state.selectedDateRange) {
				state.selectedDateRange = { startDate: null, endDate: null };
			}

			state.selectedDateRange.startDate = start;
			this._state.setCurrentDate(start);

			// Set end date if provided
			if (end) {
				state.selectedDateRange.endDate = end;
			} else {
				state.selectedDateRange.endDate = null;
			}

			// Update display element
			this._updateRangeDisplayElement(start, end);

			// Update hidden inputs
			if (this._dateInputElement) {
				let inputValue = formatDate(start, this._config.format, this._config);
				if (end) {
					inputValue += `${this._config.rangeSeparator}${formatDate(
						end,
						this._config.format,
						this._config,
					)}`;
				}
				this._dateInputElement.value = inputValue;
				this._dateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			if (this._startDateInputElement) {
				this._startDateInputElement.value = formatDate(
					start,
					this._config.format,
					this._config,
				);
				this._startDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			if (this._endDateInputElement && end) {
				this._endDateInputElement.value = formatDate(
					end,
					this._config.format,
					this._config,
				);
				this._endDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			} else if (this._endDateInputElement) {
				this._endDateInputElement.value = '';
			}

			// Dispatch change event
			this._eventManager.dispatchEvent(KTDatepickerEventName.DATE_CHANGE, {
				selectedDateRange: state.selectedDateRange,
			});
		} else {
			// Clear selection
			this._state.getState().selectedDateRange = null;

			// Clear display
			if (this._displayElement) {
				const placeholder =
					this._dateInputElement?.getAttribute('placeholder') ||
					'Select date range';
				this._displayElement.innerHTML = placeholderTemplate(placeholder);
			}

			// Clear inputs
			if (this._dateInputElement) {
				this._dateInputElement.value = '';
				this._dateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			if (this._startDateInputElement) {
				this._startDateInputElement.value = '';
				this._startDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			if (this._endDateInputElement) {
				this._endDateInputElement.value = '';
				this._endDateInputElement.dispatchEvent(
					new Event('change', { bubbles: true }),
				);
			}

			this._eventManager.dispatchEvent(KTDatepickerEventName.DATE_CHANGE, {
				selectedDateRange: null,
			});
		}
	}

	/**
	 * Set the minimum selectable date
	 *
	 * @param minDate - Minimum date or null to remove constraint
	 */
	public setMinDate(minDate: Date | null): void {
		this._config.minDate = minDate;

		// Refresh calendar view to apply new constraints
		this._eventManager.dispatchEvent(KTDatepickerEventName.UPDATE);
	}

	/**
	 * Set the maximum selectable date
	 *
	 * @param maxDate - Maximum date or null to remove constraint
	 */
	public setMaxDate(maxDate: Date | null): void {
		this._config.maxDate = maxDate;

		// Refresh calendar view to apply new constraints
		this._eventManager.dispatchEvent(KTDatepickerEventName.UPDATE);
	}

	/**
	 * Update the datepicker (refresh view)
	 */
	public update(): void {
		// Trigger calendar update through events
		this._eventManager.dispatchEvent(KTDatepickerEventName.UPDATE);
	}

	/**
	 * Destroy the datepicker instance and clean up
	 */
	public destroy(): void {
		// Remove event listeners
		this._eventManager.removeEventListener(
			KTDatepickerEventName.DATE_CHANGE,
			this._handleDateChange.bind(this),
		);

		if (this._dateInputElement) {
			this._dateInputElement.removeEventListener(
				'change',
				this._handleInputChange.bind(this),
			);
		}

		if (this._displayElement) {
			this._displayElement.remove();
		}

		// Remove instance from element
		this._element.removeAttribute('data-kt-datepicker-initialized');
		delete (this._element as any).instance;

		// Remove initialized class
		this._element.classList.remove('relative');

		// Remove from instances map
		KTDatepicker._instances.delete(this._element);
	}

	/**
	 * Dispatch a custom event
	 *
	 * @param eventName - Name of the event
	 * @param payload - Optional event payload
	 */
	protected _dispatchEvent(eventName: string, payload?: any): void {
		this._eventManager.dispatchEvent(eventName, payload);
	}

	/**
	 * ========================================================================
	 * Static instances
	 * ========================================================================
	 */

	private static readonly _instances = new Map<HTMLElement, KTDatepicker>();

	/**
	 * Create instances for all datepicker elements on the page
	 */
	public static createInstances(): void {
		const elements = document.querySelectorAll<HTMLElement>(
			'[data-kt-datepicker]',
		);

		elements.forEach((element) => {
			if (
				element.hasAttribute('data-kt-datepicker') &&
				!element.getAttribute('data-kt-datepicker-initialized')
			) {
				// Create instance
				const instance = new KTDatepicker(element);
				this._instances.set(element, instance);
			}
		});
	}

	/**
	 * Initialize all datepickers on the page
	 */
	public static init(): void {
		KTDatepicker.createInstances();
	}
}
