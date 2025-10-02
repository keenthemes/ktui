"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTDatepickerDropdown = void 0;
var core_1 = require("@popperjs/core");
var dom_1 = require("../../helpers/dom");
var data_1 = require("../../helpers/data");
var component_1 = require("../component");
/**
 * Class to manage focus within the dropdown
 */
var FocusManager = /** @class */ (function () {
    function FocusManager(element) {
        this._focusableSelector = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        this._element = element;
    }
    /**
     * Get all visible focusable options
     */
    FocusManager.prototype.getVisibleOptions = function () {
        return Array.from(this._element.querySelectorAll(this._focusableSelector)).filter(function (el) {
            var element = el;
            return element.offsetParent !== null; // Only visible elements
        });
    };
    /**
     * Apply focus to an element
     */
    FocusManager.prototype.applyFocus = function (element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    };
    /**
     * Focus next element
     */
    FocusManager.prototype.focusNext = function () {
        var options = this.getVisibleOptions();
        var currentFocused = document.activeElement;
        var nextIndex = 0;
        if (currentFocused) {
            var currentIndex = options.indexOf(currentFocused);
            nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
        }
        if (options.length > 0) {
            this.applyFocus(options[nextIndex]);
        }
    };
    /**
     * Focus previous element
     */
    FocusManager.prototype.focusPrevious = function () {
        var options = this.getVisibleOptions();
        var currentFocused = document.activeElement;
        var prevIndex = options.length - 1;
        if (currentFocused) {
            var currentIndex = options.indexOf(currentFocused);
            prevIndex =
                currentIndex >= 0
                    ? (currentIndex - 1 + options.length) % options.length
                    : prevIndex;
        }
        if (options.length > 0) {
            this.applyFocus(options[prevIndex]);
        }
    };
    /**
     * Scroll element into view
     */
    FocusManager.prototype.scrollIntoView = function (element) {
        if (element && typeof element.scrollIntoView === 'function') {
            element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    };
    /**
     * Clean up resources
     */
    FocusManager.prototype.dispose = function () {
        // Nothing to clean up yet
    };
    return FocusManager;
}());
/**
 * Class to manage event listeners
 */
var EventManager = /** @class */ (function () {
    function EventManager() {
        this._listeners = new Map();
    }
    /**
     * Add event listener and track it
     */
    EventManager.prototype.addListener = function (element, eventType, handler) {
        if (!this._listeners.has(element)) {
            this._listeners.set(element, new Map());
        }
        var elementListeners = this._listeners.get(element);
        if (!elementListeners.has(eventType)) {
            elementListeners.set(eventType, []);
        }
        var handlers = elementListeners.get(eventType);
        element.addEventListener(eventType, handler);
        handlers.push(handler);
    };
    /**
     * Remove all listeners for an element
     */
    EventManager.prototype.removeAllListeners = function (element) {
        if (this._listeners.has(element)) {
            var elementListeners = this._listeners.get(element);
            elementListeners.forEach(function (handlers, eventType) {
                handlers.forEach(function (handler) {
                    element.removeEventListener(eventType, handler);
                });
            });
            this._listeners.delete(element);
        }
    };
    return EventManager;
}());
/**
 * Focus trap class to manage keyboard focus within the dropdown
 */
var FocusTrap = /** @class */ (function () {
    /**
     * Constructor
     *
     * @param element - Element to trap focus within
     */
    function FocusTrap(element) {
        this._focusableElements = [];
        this._firstFocusableElement = null;
        this._lastFocusableElement = null;
        this._element = element;
        this._update();
    }
    /**
     * Update the focusable elements
     */
    FocusTrap.prototype.update = function () {
        this._update();
    };
    /**
     * Update the list of focusable elements
     */
    FocusTrap.prototype._update = function () {
        // Get all focusable elements
        var focusableElements = this._element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        // Convert to array and filter out disabled elements
        this._focusableElements = Array.from(focusableElements).filter(function (el) { return !el.hasAttribute('disabled'); });
        // Get first and last focusable elements
        this._firstFocusableElement = this._focusableElements[0] || null;
        this._lastFocusableElement =
            this._focusableElements[this._focusableElements.length - 1] || null;
    };
    /**
     * Handle tab key press to trap focus
     *
     * @param event - Keyboard event
     */
    FocusTrap.prototype.handleTab = function (event) {
        // If no focusable elements, do nothing
        if (!this._firstFocusableElement || !this._lastFocusableElement) {
            event.preventDefault();
            return;
        }
        var isTabPressed = event.key === 'Tab' || event.keyCode === 9;
        if (!isTabPressed)
            return;
        // Handle Shift+Tab to focus last element when on first
        if (event.shiftKey) {
            if (document.activeElement === this._firstFocusableElement) {
                this._lastFocusableElement.focus();
                event.preventDefault();
            }
        }
        else {
            // Handle Tab to focus first element when on last
            if (document.activeElement === this._lastFocusableElement) {
                this._firstFocusableElement.focus();
                event.preventDefault();
            }
        }
    };
    /**
     * Focus the first interactive element
     */
    FocusTrap.prototype.focusFirstElement = function () {
        if (this._firstFocusableElement) {
            this._firstFocusableElement.focus();
        }
    };
    return FocusTrap;
}());
/**
 * KTDatepickerDropdown
 *
 * A specialized dropdown implementation for the KTDatepicker component.
 * This module handles the dropdown functionality for the datepicker component,
 * including positioning, showing/hiding, and keyboard navigation.
 */
var KTDatepickerDropdown = /** @class */ (function (_super) {
    __extends(KTDatepickerDropdown, _super);
    /**
     * Constructor
     * @param element The parent element (datepicker wrapper)
     * @param toggleElement The element that triggers the dropdown
     * @param dropdownElement The dropdown content element
     * @param config The configuration options
     */
    function KTDatepickerDropdown(element, toggleElement, dropdownElement, config) {
        var _this = _super.call(this) || this;
        _this._name = 'datepicker-dropdown';
        // State
        _this._isOpen = false;
        _this._isTransitioning = false;
        _this._popperInstance = null;
        _this._focusTrap = null;
        _this._activeElement = null;
        _this._element = element;
        _this._toggleElement = toggleElement;
        _this._dropdownElement = dropdownElement;
        _this._config = config;
        _this._eventManager = new EventManager();
        _this._focusManager = new FocusManager(dropdownElement);
        _this._setupEventListeners();
        return _this;
    }
    /**
     * Set up event listeners for the dropdown
     */
    KTDatepickerDropdown.prototype._setupEventListeners = function () {
        // Toggle click
        this._eventManager.addListener(this._toggleElement, 'click', this._handleToggleClick.bind(this));
        // Keyboard navigation
        this._eventManager.addListener(this._element, 'keydown', this._handleKeyDown.bind(this));
        // Close on outside click
        this._eventManager.addListener(document, 'click', this._handleOutsideClick.bind(this));
    };
    /**
     * Handle toggle element click
     */
    KTDatepickerDropdown.prototype._handleToggleClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
    };
    /**
     * Handle keyboard events
     */
    KTDatepickerDropdown.prototype._handleKeyDown = function (event) {
        if (!this._isOpen)
            return;
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                this._toggleElement.focus();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this._focusManager.focusNext();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this._focusManager.focusPrevious();
                break;
            case 'Home':
                event.preventDefault();
                // Focus first visible option
                var firstOption = this._focusManager.getVisibleOptions()[0];
                if (firstOption) {
                    this._focusManager.applyFocus(firstOption);
                    this._focusManager.scrollIntoView(firstOption);
                }
                break;
            case 'End':
                event.preventDefault();
                // Focus last visible option
                var visibleOptions = this._focusManager.getVisibleOptions();
                var lastOption = visibleOptions[visibleOptions.length - 1];
                if (lastOption) {
                    this._focusManager.applyFocus(lastOption);
                    this._focusManager.scrollIntoView(lastOption);
                }
                break;
        }
    };
    /**
     * Handle clicks outside the dropdown
     */
    KTDatepickerDropdown.prototype._handleOutsideClick = function (event) {
        var _a;
        if (!this._isOpen)
            return;
        var target = event.target;
        if (!this._element.contains(target) &&
            !this._dropdownElement.contains(target)) {
            // Before closing, check if a range selection is in progress
            var datepickerElement = this._element.closest('[data-kt-datepicker]');
            if (datepickerElement) {
                // Get the state manager through the calendar instance or directly
                var stateManager = (_a = datepickerElement.instance) === null || _a === void 0 ? void 0 : _a._state;
                if (stateManager) {
                    var state = stateManager.getState();
                    var config = stateManager.getConfig();
                    // If we're in range mode and range selection is in progress, don't close
                    if (config.range && state.isRangeSelectionInProgress) {
                        console.log('Outside click detected but range selection in progress - keeping dropdown open');
                        return;
                    }
                }
            }
            this.close();
        }
    };
    /**
     * Set width of dropdown based on toggle element
     */
    KTDatepickerDropdown.prototype._setDropdownWidth = function () {
        if (!this._dropdownElement || !this._toggleElement)
            return;
        // Get the datepicker configuration
        var datepickerElement = this._element.closest('[data-kt-datepicker]');
        var visibleMonths = 1;
        if (datepickerElement) {
            // Get visible months from config
            var instance = datepickerElement.instance;
            if (instance && instance._config) {
                visibleMonths = instance._config.visibleMonths || 1;
            }
        }
        // Calculate appropriate width based on number of visible months
        if (visibleMonths > 1) {
            // For multiple months, calculate a fixed width per month plus padding and gaps
            var monthWidth = 280; // Fixed width for each month
            var padding = 24; // Left/right padding (p-3 = 0.75rem × 2 × 16px = 24px)
            var spacing = 16 * (visibleMonths - 1); // Gap between months (gap-4 = 1rem × 16px)
            // Limit to showing max 3 months at once for UX (user can scroll to see more)
            var visibleWidth = Math.min(visibleMonths, 3);
            var totalWidth = monthWidth * visibleWidth + spacing + padding;
            // Set fixed width for the dropdown
            this._dropdownElement.style.width = "".concat(totalWidth, "px");
            this._dropdownElement.style.minWidth = "".concat(totalWidth, "px");
        }
        else {
            // For single month, use a fixed width that works well for most calendars
            this._dropdownElement.style.width = '332px'; // 280px calendar width + 24px padding + border
            this._dropdownElement.style.minWidth = '332px';
        }
    };
    /**
     * Initialize the Popper instance for dropdown positioning
     */
    KTDatepickerDropdown.prototype._initPopper = function () {
        // Destroy existing popper instance if it exists
        this._destroyPopper();
        // Default offset
        var offsetValue = '0, 5';
        // Get configuration options
        var placement = 'bottom-start';
        var strategy = 'absolute';
        var preventOverflow = true;
        var flip = true;
        // Create new popper instance
        this._popperInstance = (0, core_1.createPopper)(this._toggleElement, this._dropdownElement, {
            placement: placement,
            strategy: strategy,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: this._parseOffset(offsetValue),
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: 'viewport',
                        altAxis: preventOverflow,
                    },
                },
                {
                    name: 'flip',
                    options: {
                        enabled: flip,
                        fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                    },
                },
            ],
        });
    };
    /**
     * Parse offset string into an array of numbers
     */
    KTDatepickerDropdown.prototype._parseOffset = function (offset) {
        return offset.split(',').map(function (value) { return parseInt(value.trim(), 10); });
    };
    /**
     * Destroy the Popper instance
     */
    KTDatepickerDropdown.prototype._destroyPopper = function () {
        if (this._popperInstance) {
            this._popperInstance.destroy();
            this._popperInstance = null;
        }
    };
    /**
     * Update dropdown position
     */
    KTDatepickerDropdown.prototype.updatePosition = function () {
        // Look for the display element rather than using the input directly
        var displayElement = this._element.querySelector('[data-kt-datepicker-display]');
        var triggerElement = displayElement || this._toggleElement;
        if (!triggerElement || !this._dropdownElement)
            return;
        // Reset position styles
        this._dropdownElement.style.top = '';
        this._dropdownElement.style.bottom = '';
        this._dropdownElement.style.left = '';
        this._dropdownElement.style.right = '';
        // Set width before positioning
        this._setDropdownWidth();
        // Get position information
        var triggerRect = triggerElement.getBoundingClientRect();
        var containerRect = this._element.getBoundingClientRect();
        var dropdownRect = this._dropdownElement.getBoundingClientRect();
        var viewportHeight = window.innerHeight;
        var viewportWidth = window.innerWidth;
        // Calculate available space below and above the trigger
        var spaceBelow = viewportHeight - triggerRect.bottom;
        var spaceAbove = triggerRect.top;
        // Calculate if dropdown would overflow horizontally
        var overflowRight = triggerRect.left + dropdownRect.width > viewportWidth;
        // Position dropdown
        this._dropdownElement.style.position = 'absolute';
        // Determine vertical position
        if (spaceBelow >= dropdownRect.height || spaceBelow >= spaceAbove) {
            // Position below the trigger
            this._dropdownElement.style.top = "".concat(triggerRect.height + 5, "px");
        }
        else {
            // Position above the trigger
            this._dropdownElement.style.bottom = "".concat(triggerRect.height + 5, "px");
        }
        // Determine horizontal position - handle potential overflow
        if (overflowRight) {
            // Align with right edge of trigger to prevent overflow
            var rightOffset = Math.max(0, dropdownRect.width - triggerRect.width);
            this._dropdownElement.style.right = "0px";
        }
        else {
            // Align with left edge of trigger
            this._dropdownElement.style.left = "0px";
        }
    };
    /**
     * Toggle the dropdown
     */
    KTDatepickerDropdown.prototype.toggle = function () {
        if (this._isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    };
    /**
     * Open the dropdown
     */
    KTDatepickerDropdown.prototype.open = function () {
        var _this = this;
        if (this._isOpen || this._isTransitioning)
            return;
        // Fire before show event
        var beforeShowEvent = new CustomEvent('kt.datepicker.dropdown.show', {
            bubbles: true,
            cancelable: true,
        });
        this._element.dispatchEvent(beforeShowEvent);
        if (beforeShowEvent.defaultPrevented)
            return;
        // Begin opening transition
        this._isTransitioning = true;
        // Set dropdown visibility
        this._dropdownElement.classList.remove('hidden');
        this._dropdownElement.setAttribute('aria-hidden', 'false');
        // Set dropdown width
        this._setDropdownWidth();
        // Make sure the element is visible for transitioning
        dom_1.default.reflow(this._dropdownElement);
        // Apply z-index
        this._dropdownElement.style.zIndex = '1000';
        // Initialize popper for positioning
        this._initPopper();
        // Add active classes
        this._toggleElement.classList.add('ring', 'ring-blue-300');
        this._toggleElement.setAttribute('aria-expanded', 'true');
        // Start transition
        this._dropdownElement.classList.remove('opacity-0', 'translate-y-2');
        this._dropdownElement.classList.add('opacity-100', 'translate-y-0');
        // Handle transition end
        dom_1.default.transitionEnd(this._dropdownElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            // Focus the first interactive element
            _this._focusFirstInteractiveElement();
            // Fire after show event
            var afterShowEvent = new CustomEvent('kt.datepicker.dropdown.shown', {
                bubbles: true,
            });
            _this._element.dispatchEvent(afterShowEvent);
        });
    };
    /**
     * Focus the first interactive element in the dropdown
     */
    KTDatepickerDropdown.prototype._focusFirstInteractiveElement = function () {
        // Priority of elements to focus:
        // 1. A "Today" button if available
        // 2. The first day in the current month
        // 3. Any other focusable element
        // Find the Today button using standard DOM selectors
        var todayBtn = null;
        var buttons = this._dropdownElement.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent && buttons[i].textContent.trim() === 'Today') {
                todayBtn = buttons[i];
                break;
            }
        }
        if (todayBtn) {
            todayBtn.focus();
            return;
        }
        var currentMonthDay = this._dropdownElement.querySelector('button[data-date]:not(.text-gray-400)');
        if (currentMonthDay) {
            currentMonthDay.focus();
            return;
        }
        var firstOption = this._focusManager.getVisibleOptions()[0];
        if (firstOption) {
            this._focusManager.applyFocus(firstOption);
        }
    };
    /**
     * Close the dropdown
     */
    KTDatepickerDropdown.prototype.close = function () {
        var _this = this;
        if (!this._isOpen || this._isTransitioning)
            return;
        // Fire before hide event
        var beforeHideEvent = new CustomEvent('kt.datepicker.dropdown.hide', {
            bubbles: true,
            cancelable: true,
        });
        this._element.dispatchEvent(beforeHideEvent);
        if (beforeHideEvent.defaultPrevented)
            return;
        // Begin closing transition
        this._isTransitioning = true;
        // Start transition
        this._dropdownElement.classList.add('opacity-0', 'translate-y-2');
        this._dropdownElement.classList.remove('opacity-100', 'translate-y-0');
        // Handle transition end
        dom_1.default.transitionEnd(this._dropdownElement, function () {
            // Remove active classes
            _this._dropdownElement.classList.add('hidden');
            _this._dropdownElement.setAttribute('aria-hidden', 'true');
            // Reset styles
            _this._dropdownElement.style.opacity = '';
            _this._dropdownElement.style.transform = '';
            _this._dropdownElement.style.zIndex = '';
            // Destroy popper
            _this._destroyPopper();
            // Update state
            _this._isTransitioning = false;
            _this._isOpen = false;
            // Fire after hide event
            var afterHideEvent = new CustomEvent('kt.datepicker.dropdown.hidden', {
                bubbles: true,
            });
            _this._element.dispatchEvent(afterHideEvent);
        });
    };
    /**
     * Check if dropdown is open
     */
    KTDatepickerDropdown.prototype.isOpen = function () {
        return this._isOpen;
    };
    /**
     * Clean up component
     */
    KTDatepickerDropdown.prototype.dispose = function () {
        // Destroy popper
        this._destroyPopper();
        // Remove event listeners
        this._eventManager.removeAllListeners(this._element);
        this._eventManager.removeAllListeners(this._toggleElement);
        this._eventManager.removeAllListeners(document);
        // Clean up focus manager
        if (this._focusManager &&
            typeof this._focusManager.dispose === 'function') {
            this._focusManager.dispose();
        }
        // Clean up state
        this._isOpen = false;
        this._isTransitioning = false;
        // Remove data reference
        data_1.default.remove(this._element, this._name);
    };
    return KTDatepickerDropdown;
}(component_1.default));
exports.KTDatepickerDropdown = KTDatepickerDropdown;
//# sourceMappingURL=dropdown.js.map