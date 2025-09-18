"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeToSearchBuffer = exports.EventManager = exports.FocusManager = void 0;
exports.formatCurrency = formatCurrency;
exports.filterOptions = filterOptions;
exports.debounce = debounce;
exports.renderTemplateString = renderTemplateString;
exports.stringToElement = stringToElement;
/**
 * Format a number as a currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}
/**
 * Filter options based on a search query
 */
function filterOptions(options, query, config, dropdownElement, onVisibleCount) {
    var visibleOptionsCount = 0;
    // For empty query, make all options visible
    // The KTSelectSearch class is now responsible for restoring original content before calling this.
    if (!query || query.trim() === '') {
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var option = options_1[_i];
            option.classList.remove('hidden');
            // Remove inline display style if it was used to hide
            if (option.style.display === 'none') {
                option.style.display = '';
            }
            // At this point, option.innerHTML should be its original.
            visibleOptionsCount++;
        }
        if (onVisibleCount) {
            onVisibleCount(visibleOptionsCount);
        }
        return visibleOptionsCount;
    }
    var queryLower = query.toLowerCase();
    for (var _a = 0, options_2 = options; _a < options_2.length; _a++) {
        var option = options_2[_a];
        // Use data-text for matching if available, otherwise fall back to textContent
        var optionText = (option.dataset.text ||
            option.textContent ||
            '').toLowerCase();
        var isMatch = optionText.includes(queryLower);
        if (isMatch) {
            option.classList.remove('hidden');
            if (option.style.display === 'none')
                option.style.display = ''; // Ensure visible
            visibleOptionsCount++;
        }
        else {
            option.classList.add('hidden');
        }
        // Early exit if maxItems limit is reached (optional)
        // if (config.searchMaxItems && visibleOptionsCount >= config.searchMaxItems) {
        // 	break;
        // }
    }
    if (onVisibleCount) {
        onVisibleCount(visibleOptionsCount);
    }
    return visibleOptionsCount;
}
/**
 * Focus manager for keyboard navigation
 * Consolidates redundant focus management logic into shared functions
 */
var FocusManager = /** @class */ (function () {
    function FocusManager(element, optionsSelector, config) {
        if (optionsSelector === void 0) { optionsSelector = '[data-kt-select-option]'; }
        this._focusedOptionIndex = null;
        this._onFocusChange = null;
        this._element = element;
        this._optionsSelector = optionsSelector;
        this._eventManager = new EventManager();
        // Add click handler to update focus state when options are clicked
        this._setupOptionClickHandlers();
        this._focusClass = 'focus'; // or whatever your intended class is
        this._hoverClass = 'hover'; // or your intended class
    }
    /**
     * Set up click handlers for all options to update focus state
     */
    FocusManager.prototype._setupOptionClickHandlers = function () {
        var _this = this;
        // Add click handler to the options container
        this._eventManager.addListener(this._element, 'click', function (e) {
            var target = e.target;
            var optionElement = target.closest(_this._optionsSelector);
            if (optionElement) {
            }
        });
    };
    /**
     * Get all visible options
     */
    FocusManager.prototype.getVisibleOptions = function () {
        return Array.from(this._element.querySelectorAll(this._optionsSelector)).filter(function (option) {
            var element = option;
            // Check only for hidden class
            if (element.classList.contains('hidden')) {
                return false;
            }
            // Also check inline styles for backward compatibility
            if (element.style.display === 'none') {
                return false;
            }
            return true;
        });
    };
    /**
     * Focus the first visible option
     */
    FocusManager.prototype.focusFirst = function () {
        var options = this.getVisibleOptions();
        if (options.length === 0)
            return null;
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (!option.classList.contains('disabled') &&
                option.getAttribute('aria-disabled') !== 'true') {
                this.resetFocus();
                this._focusedOptionIndex = i;
                this.applyFocus(option);
                this.scrollIntoView(option);
                return option;
            }
        }
        return null;
    };
    /**
     * Focus the last visible option
     */
    FocusManager.prototype.focusLast = function () {
        var options = this.getVisibleOptions();
        if (options.length === 0)
            return null;
        for (var i = options.length - 1; i >= 0; i--) {
            var option = options[i];
            if (!option.classList.contains('disabled') &&
                option.getAttribute('aria-disabled') !== 'true') {
                this.resetFocus();
                this._focusedOptionIndex = i;
                this.applyFocus(option);
                this.scrollIntoView(option);
                return option;
            }
        }
        return null;
    };
    /**
     * Focus the next visible option that matches the search string
     */
    FocusManager.prototype.focusByString = function (str) {
        var _a, _b, _c;
        var options = this.getVisibleOptions();
        if (options.length === 0)
            return null;
        var lowerStr = str.toLowerCase();
        var startIdx = ((_a = this._focusedOptionIndex) !== null && _a !== void 0 ? _a : -1) + 1;
        for (var i = 0; i < options.length; i++) {
            var idx = (startIdx + i) % options.length;
            var option = options[idx];
            if (!option.classList.contains('disabled') &&
                option.getAttribute('aria-disabled') !== 'true' &&
                (((_b = option.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase().startsWith(lowerStr)) ||
                    ((_c = option.dataset.value) === null || _c === void 0 ? void 0 : _c.toLowerCase().startsWith(lowerStr)))) {
                this.resetFocus();
                this._focusedOptionIndex = idx;
                this.applyFocus(option);
                this.scrollIntoView(option);
                return option;
            }
        }
        return null;
    };
    /**
     * Focus the next visible option
     */
    FocusManager.prototype.focusNext = function () {
        var options = this.getVisibleOptions();
        if (options.length === 0)
            return null;
        var idx = this._focusedOptionIndex === null
            ? 0
            : (this._focusedOptionIndex + 1) % options.length;
        var startIdx = idx;
        do {
            var option = options[idx];
            if (!option.classList.contains('disabled') &&
                option.getAttribute('aria-disabled') !== 'true') {
                this.resetFocus();
                this._focusedOptionIndex = idx;
                this.applyFocus(option);
                this.scrollIntoView(option);
                return option;
            }
            idx = (idx + 1) % options.length;
        } while (idx !== startIdx);
        return null;
    };
    /**
     * Focus the previous visible option
     */
    FocusManager.prototype.focusPrevious = function () {
        var options = this.getVisibleOptions();
        if (options.length === 0)
            return null;
        var idx = this._focusedOptionIndex === null
            ? options.length - 1
            : (this._focusedOptionIndex - 1 + options.length) % options.length;
        var startIdx = idx;
        do {
            var option = options[idx];
            if (!option.classList.contains('disabled') &&
                option.getAttribute('aria-disabled') !== 'true') {
                this.resetFocus();
                this._focusedOptionIndex = idx;
                this.applyFocus(option);
                this.scrollIntoView(option);
                return option;
            }
            idx = (idx - 1 + options.length) % options.length;
        } while (idx !== startIdx);
        return null;
    };
    /**
     * Apply focus to a specific option
     */
    FocusManager.prototype.applyFocus = function (option) {
        if (!option)
            return;
        // Ensure it's not disabled
        if (option.classList.contains('disabled') ||
            option.getAttribute('aria-disabled') === 'true') {
            return;
        }
        // DO NOT CALL resetFocus() here. Caller's responsibility.
        option.classList.add(this._focusClass);
        option.classList.add(this._hoverClass);
        // _triggerFocusChange needs _focusedOptionIndex to be set by the caller before this.
        this._triggerFocusChange();
    };
    /**
     * Reset focus on all options
     */
    FocusManager.prototype.resetFocus = function () {
        var _this = this;
        var focusedElements = this._element.querySelectorAll(".".concat(this._focusClass, ", .").concat(this._hoverClass));
        // Remove focus and hover classes from all options
        focusedElements.forEach(function (element) {
            element.classList.remove(_this._focusClass, _this._hoverClass);
        });
        this._focusedOptionIndex = null; // Always reset the index
    };
    /**
     * Ensure the focused option is visible in the scrollable container
     */
    FocusManager.prototype.scrollIntoView = function (option) {
        if (!option)
            return;
        var container = this._element.querySelector('[data-kt-select-options]');
        if (!container)
            return;
        var optionRect = option.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        // Check if option is below the visible area
        if (optionRect.bottom > containerRect.bottom) {
            option.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
        // Check if option is above the visible area
        else if (optionRect.top < containerRect.top) {
            option.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
    };
    /**
     * Focus a specific option by its value
     */
    FocusManager.prototype.focusOptionByValue = function (value) {
        var options = this.getVisibleOptions();
        var index = options.findIndex(function (option) { return option.dataset.value === value; });
        if (index >= 0) {
            var optionToFocus = options[index];
            if (!optionToFocus.classList.contains('disabled') &&
                optionToFocus.getAttribute('aria-disabled') !== 'true') {
                this.resetFocus();
                this._focusedOptionIndex = index;
                this.applyFocus(optionToFocus);
                this.scrollIntoView(optionToFocus);
                return true;
            }
        }
        return false;
    };
    /**
     * Get the currently focused option
     */
    FocusManager.prototype.getFocusedOption = function () {
        var options = this.getVisibleOptions();
        if (this._focusedOptionIndex !== null &&
            this._focusedOptionIndex < options.length) {
            return options[this._focusedOptionIndex];
        }
        return null;
    };
    /**
     * Get the index of the currently focused option
     */
    FocusManager.prototype.getFocusedIndex = function () {
        return this._focusedOptionIndex;
    };
    /**
     * Set the focused option index directly
     */
    FocusManager.prototype.setFocusedIndex = function (index) {
        this._focusedOptionIndex = index;
    };
    /**
     * Set a callback to be called when focus changes
     */
    FocusManager.prototype.setOnFocusChange = function (cb) {
        this._onFocusChange = cb;
    };
    FocusManager.prototype._triggerFocusChange = function () {
        if (this._onFocusChange) {
            this._onFocusChange(this.getFocusedOption(), this._focusedOptionIndex);
        }
    };
    /**
     * Clean up event listeners
     */
    FocusManager.prototype.dispose = function () {
        if (this._eventManager) {
            this._eventManager.removeAllListeners(this._element);
        }
    };
    return FocusManager;
}());
exports.FocusManager = FocusManager;
/**
 * Centralized event listener management
 */
var EventManager = /** @class */ (function () {
    function EventManager() {
        this._boundHandlers = new Map();
    }
    /**
     * Add an event listener with a bound context
     */
    EventManager.prototype.addListener = function (element, event, handler, context) {
        if (!element)
            return;
        // Create a bound version of the handler if context provided
        var boundHandler = context && typeof handler === 'function'
            ? handler.bind(context)
            : handler;
        // Store the relationship between original and bound handler
        if (!this._boundHandlers.has(event)) {
            this._boundHandlers.set(event, new Map());
        }
        var eventMap = this._boundHandlers.get(event);
        eventMap.set(handler, boundHandler);
        // Add the event listener
        element.addEventListener(event, boundHandler);
    };
    /**
     * Remove an event listener
     */
    EventManager.prototype.removeListener = function (element, event, handler) {
        if (!element)
            return;
        var eventMap = this._boundHandlers.get(event);
        if (!eventMap)
            return;
        // Get the bound version of the handler
        var boundHandler = eventMap.get(handler);
        if (!boundHandler)
            return;
        // Remove the event listener
        element.removeEventListener(event, boundHandler);
        // Clean up the map
        eventMap.delete(handler);
        if (eventMap.size === 0) {
            this._boundHandlers.delete(event);
        }
    };
    /**
     * Remove all event listeners
     */
    EventManager.prototype.removeAllListeners = function (element) {
        if (!element)
            return;
        // Go through each event type
        this._boundHandlers.forEach(function (eventMap, event) {
            // For each event type, go through each handler
            eventMap.forEach(function (boundHandler) {
                element.removeEventListener(event, boundHandler);
            });
        });
        // Clear the maps
        this._boundHandlers.clear();
    };
    return EventManager;
}());
exports.EventManager = EventManager;
/**
 * Debounce function to limit how often a function can be called
 */
function debounce(func, delay) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, delay);
    };
}
/**
 * Replaces all {{key}} in the template with the corresponding value from the data object.
 * If a key is missing in data, replaces with an empty string.
 */
function renderTemplateString(template, data) {
    return template.replace(/{{(\w+)}}/g, function (_, key) {
        return data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
    });
}
// Type-to-search buffer utility for keyboard navigation
var TypeToSearchBuffer = /** @class */ (function () {
    function TypeToSearchBuffer(timeout) {
        if (timeout === void 0) { timeout = 500; }
        this.buffer = '';
        this.lastTime = 0;
        this.timeout = timeout;
    }
    TypeToSearchBuffer.prototype.push = function (char) {
        var now = Date.now();
        if (now - this.lastTime > this.timeout) {
            this.buffer = '';
        }
        this.buffer += char;
        this.lastTime = now;
    };
    TypeToSearchBuffer.prototype.getBuffer = function () {
        return this.buffer;
    };
    TypeToSearchBuffer.prototype.clear = function () {
        this.buffer = '';
    };
    return TypeToSearchBuffer;
}());
exports.TypeToSearchBuffer = TypeToSearchBuffer;
function stringToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
//# sourceMappingURL=utils.js.map