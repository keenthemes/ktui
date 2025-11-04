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
exports.KTSelectDropdown = void 0;
var core_1 = require("@popperjs/core");
var dom_1 = require("../../helpers/dom");
var data_1 = require("../../helpers/data");
var component_1 = require("../component");
var utils_1 = require("./utils");
/**
 * KTSelectDropdown
 *
 * A specialized dropdown implementation for the KTSelect component.
 * This module handles the dropdown functionality for the select component,
 * including positioning and showing/hiding.
 */
var KTSelectDropdown = /** @class */ (function (_super) {
    __extends(KTSelectDropdown, _super);
    /**
     * Constructor
     * @param element The parent element (select wrapper)
     * @param toggleElement The element that triggers the dropdown
     * @param dropdownElement The dropdown content element
     * @param config The configuration options
     */
    function KTSelectDropdown(element, toggleElement, dropdownElement, config, ktSelectInstance) {
        var _this = _super.call(this) || this;
        _this._name = 'select-dropdown';
        // State
        _this._isOpen = false;
        _this._isTransitioning = false;
        _this._popperInstance = null;
        _this._element = element;
        _this._toggleElement = toggleElement;
        _this._dropdownElement = dropdownElement;
        _this._config = config;
        _this._ktSelectInstance = ktSelectInstance; // Assign instance
        var container = _this._resolveDropdownContainer();
        if (container) {
            if (container !== _this._dropdownElement.parentElement) {
                container.appendChild(_this._dropdownElement);
            }
        }
        _this._eventManager = new utils_1.EventManager();
        _this._focusManager = new utils_1.FocusManager(dropdownElement, '[data-kt-select-option]', config);
        _this._setupEventListeners();
        return _this;
    }
    /**
     * Set up event listeners for the dropdown
     */
    KTSelectDropdown.prototype._setupEventListeners = function () {
        // Toggle click
        this._eventManager.addListener(this._toggleElement, 'click', this._handleToggleClick.bind(this));
        // Close on outside click
        this._eventManager.addListener(document, 'click', this._handleOutsideClick.bind(this));
    };
    /**
     * Handle toggle element click
     */
    KTSelectDropdown.prototype._handleToggleClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._config.disabled) {
            if (this._config.debug)
                console.log('KTSelectDropdown._handleToggleClick: select is disabled');
            return;
        }
        // Call KTSelect's methods
        if (this._ktSelectInstance.isDropdownOpen()) {
            this._ktSelectInstance.closeDropdown();
        }
        else {
            this._ktSelectInstance.openDropdown();
        }
    };
    /**
     * Handle clicks outside the dropdown
     */
    KTSelectDropdown.prototype._handleOutsideClick = function (event) {
        if (!this._isOpen)
            return;
        var target = event.target;
        if (!this._element.contains(target) &&
            !this._dropdownElement.contains(target)) {
            // Call KTSelect's closeDropdown method
            this._ktSelectInstance.closeDropdown();
        }
    };
    /**
     * Set width of dropdown based on toggle element
     */
    KTSelectDropdown.prototype._setDropdownWidth = function () {
        if (!this._dropdownElement || !this._toggleElement)
            return;
        // Check if width is configured
        if (this._config.dropdownWidth) {
            // If custom width is set, use that
            this._dropdownElement.style.width = this._config.dropdownWidth;
        }
        else {
            // Otherwise, match toggle element width for a cleaner appearance
            var toggleWidth = this._toggleElement.offsetWidth;
            this._dropdownElement.style.width = "".concat(toggleWidth, "px");
        }
    };
    /**
     * Detect if the select is inside a modal container
     * @returns The modal element if found, null otherwise
     */
    KTSelectDropdown.prototype._getModalContainer = function () {
        return this._element.closest('[data-kt-modal], .kt-modal, .kt-modal-center');
    };
    /**
     * Get the appropriate positioning strategy based on context
     * @returns 'fixed' if inside modal, 'absolute' otherwise
     */
    KTSelectDropdown.prototype._getPositioningStrategy = function () {
        // Check if config explicitly sets strategy
        if (this._config.dropdownStrategy) {
            return this._config.dropdownStrategy;
        }
        // Use fixed positioning if inside a modal (to handle transform-based centering)
        var modalParent = this._getModalContainer();
        return modalParent ? 'fixed' : 'absolute';
    };
    /**
     * Initialize the Popper instance for dropdown positioning
     */
    KTSelectDropdown.prototype._initPopper = function () {
        // Destroy existing popper instance if it exists
        this._destroyPopper();
        // Default offset
        var offsetValue = '0, 5';
        // Get configuration options
        var placement = this._config.dropdownPlacement || 'bottom-start';
        var strategy = this._getPositioningStrategy();
        var preventOverflow = this._config.dropdownPreventOverflow !== false;
        var flip = this._config.dropdownFlip !== false;
        // Detect modal container for boundary
        var modalParent = this._getModalContainer();
        var boundary = modalParent || 'clippingParents';
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
                        boundary: boundary,
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
                {
                    name: 'sameWidth',
                    enabled: !this._config.dropdownWidth,
                    phase: 'beforeWrite',
                    requires: ['computeStyles'],
                    fn: function (_a) {
                        var state = _a.state;
                        state.styles.popper.width = "".concat(state.rects.reference.width, "px");
                    },
                    effect: function (_a) {
                        var state = _a.state;
                        // Add type guard for HTMLElement
                        var reference = state.elements.reference;
                        if (reference && 'offsetWidth' in reference) {
                            state.elements.popper.style.width = "".concat(reference.offsetWidth, "px");
                        }
                    },
                },
            ],
        });
    };
    /**
     * Parse offset string into an array of numbers
     */
    KTSelectDropdown.prototype._parseOffset = function (offset) {
        return offset.split(',').map(function (value) { return parseInt(value.trim(), 10); });
    };
    /**
     * Destroy the Popper instance
     */
    KTSelectDropdown.prototype._destroyPopper = function () {
        if (this._popperInstance) {
            this._popperInstance.destroy();
            this._popperInstance = null;
        }
    };
    /**
     * Update dropdown position
     */
    KTSelectDropdown.prototype.updatePosition = function () {
        if (this._popperInstance) {
            this._popperInstance.update();
        }
    };
    /**
     * Open the dropdown
     */
    KTSelectDropdown.prototype.open = function () {
        var _this = this;
        if (this._config.disabled) {
            if (this._config.debug)
                console.log('KTSelectDropdown.open: select is disabled, not opening');
            return;
        }
        if (this._isOpen || this._isTransitioning)
            return;
        // Begin opening transition
        this._isTransitioning = true;
        // Set initial styles
        this._dropdownElement.classList.remove('hidden');
        this._dropdownElement.style.opacity = '0';
        // Set dropdown width
        this._setDropdownWidth();
        // Reflow
        dom_1.default.reflow(this._dropdownElement);
        // Apply z-index
        var zIndexToApply = null;
        if (this._config.dropdownZindex) {
            zIndexToApply = this._config.dropdownZindex;
        }
        // Consider the dropdown's current z-index if it's already set and higher
        var currentDropdownZIndexStr = dom_1.default.getCssProp(this._dropdownElement, 'z-index');
        if (currentDropdownZIndexStr && currentDropdownZIndexStr !== 'auto') {
            var currentDropdownZIndex = parseInt(currentDropdownZIndexStr);
            if (!isNaN(currentDropdownZIndex) &&
                currentDropdownZIndex > (zIndexToApply || 0)) {
                zIndexToApply = currentDropdownZIndex;
            }
        }
        // Ensure dropdown is above elements within its original toggle's parent context
        var toggleParentContextZindex = dom_1.default.getHighestZindex(this._element); // _element is the select wrapper
        if (toggleParentContextZindex !== null &&
            toggleParentContextZindex >= (zIndexToApply || 0)) {
            zIndexToApply = toggleParentContextZindex + 1;
        }
        if (zIndexToApply !== null) {
            this._dropdownElement.style.zIndex = zIndexToApply.toString();
        }
        // Initialize popper
        this._initPopper();
        // Add active classes for visual state
        this._dropdownElement.classList.add('open');
        this._toggleElement.classList.add('active');
        // ARIA attributes will be handled by KTSelect
        // Start transition
        this._dropdownElement.style.opacity = '1';
        // Handle transition end
        dom_1.default.transitionEnd(this._dropdownElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            // Focus and events will be handled by KTSelect
        });
    };
    /**
     * Close the dropdown
     */
    KTSelectDropdown.prototype.close = function () {
        var _this = this;
        if (this._config.debug)
            console.log('KTSelectDropdown.close called - isOpen:', this._isOpen, 'isTransitioning:', this._isTransitioning);
        if (!this._isOpen || this._isTransitioning) {
            if (this._config.debug)
                console.log('KTSelectDropdown.close - early return: dropdown not open or is transitioning');
            return;
        }
        // Events and ARIA will be handled by KTSelect
        if (this._config.debug)
            console.log('KTSelectDropdown.close - starting transition');
        this._isTransitioning = true;
        this._dropdownElement.style.opacity = '0';
        var transitionComplete = false;
        var fallbackTimer = setTimeout(function () {
            if (!transitionComplete) {
                if (_this._config.debug)
                    console.log('KTSelectDropdown.close - fallback timer triggered');
                completeTransition();
            }
        }, 300);
        var completeTransition = function () {
            if (transitionComplete)
                return;
            transitionComplete = true;
            clearTimeout(fallbackTimer);
            if (_this._config.debug)
                console.log('KTSelectDropdown.close - transition ended');
            _this._dropdownElement.classList.add('hidden');
            _this._dropdownElement.classList.remove('open');
            _this._toggleElement.classList.remove('active');
            // ARIA attributes will be handled by KTSelect
            _this._destroyPopper();
            _this._isTransitioning = false;
            _this._isOpen = false;
            // Events will be handled by KTSelect
            if (_this._config.debug)
                console.log('KTSelectDropdown.close - visual part complete');
        };
        dom_1.default.transitionEnd(this._dropdownElement, completeTransition);
        if (dom_1.default.getCssProp(this._dropdownElement, 'transition-duration') === '0s') {
            completeTransition();
        }
    };
    /**
     * Check if dropdown is open
     */
    KTSelectDropdown.prototype.isOpen = function () {
        return this._isOpen;
    };
    /**
     * Clean up component
     */
    KTSelectDropdown.prototype.dispose = function () {
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
    KTSelectDropdown.prototype._resolveDropdownContainer = function () {
        var containerSelector = this._config.dropdownContainer;
        if (containerSelector) {
            var containerElement = document.querySelector(containerSelector);
            if (!containerElement && this._config.debug) {
                console.warn("KTSelectDropdown: dropdownContainer selector \"".concat(containerSelector, "\" not found. Dropdown will remain in its default position."));
            }
            return containerElement;
        }
        return null;
    };
    return KTSelectDropdown;
}(component_1.default));
exports.KTSelectDropdown = KTSelectDropdown;
//# sourceMappingURL=dropdown.js.map