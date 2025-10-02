/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { defaultTemplates } from './templates';
import { EventManager } from './utils';
/**
 * KTSelectTags - Handles tags-specific functionality for KTSelect
 */
var KTSelectTags = /** @class */ (function () {
    /**
     * Constructor: Initializes the tags component
     */
    function KTSelectTags(select) {
        this._select = select;
        this._config = select.getConfig();
        this._valueDisplayElement = select.getValueDisplayElement();
        this._eventManager = new EventManager();
        if (this._config.debug)
            console.log('KTSelectTags initialized');
    }
    /**
     * Update selected tags display
     * Renders selected options as tags in the display element
     */
    KTSelectTags.prototype.updateTagsDisplay = function (selectedOptions) {
        var _this = this;
        // Remove any existing tag elements
        var wrapper = this._valueDisplayElement.parentElement;
        if (!wrapper)
            return;
        // If no options selected, ensure placeholder is shown
        if (selectedOptions.length === 0) {
            // Clear any existing content and show placeholder
            this._valueDisplayElement.innerHTML = '';
            var placeholderEl = defaultTemplates.placeholder(this._config);
            this._valueDisplayElement.appendChild(placeholderEl);
            return;
        }
        // Clear all existing content before adding tags
        this._valueDisplayElement.innerHTML = '';
        // Insert each tag before the display element
        selectedOptions.forEach(function (optionValue) {
            // Find the original option element (in dropdown or select)
            var optionElement = null;
            var optionElements = _this._select.getOptionsElement();
            for (var _i = 0, _a = Array.from(optionElements); _i < _a.length; _i++) {
                var opt = _a[_i];
                if (opt.dataset.value === optionValue) {
                    optionElement = opt;
                    break;
                }
            }
            if (!optionElement) {
                var originalOptions = _this._select
                    .getElement()
                    .querySelectorAll('option');
                for (var _b = 0, _c = Array.from(originalOptions); _b < _c.length; _b++) {
                    var opt = _c[_b];
                    if (opt.value === optionValue) {
                        optionElement = opt;
                        break;
                    }
                }
            }
            var tag = defaultTemplates.tag(optionElement, _this._config);
            // Add event listener to the close button
            var closeButton = tag.querySelector('[data-kt-select-remove-button]');
            if (closeButton) {
                _this._eventManager.addListener(closeButton, 'click', function (event) {
                    event.stopPropagation();
                    _this._removeTag(optionValue);
                });
            }
            // Insert tag inside the display element
            _this._valueDisplayElement.appendChild(tag);
        });
    };
    /**
     * Remove a tag and its selection
     */
    KTSelectTags.prototype._removeTag = function (optionValue) {
        // Delegate to the select component to handle state changes
        this._select.toggleSelection(optionValue);
    };
    /**
     * Clean up resources used by this module
     */
    KTSelectTags.prototype.destroy = function () {
        this._eventManager.removeAllListeners(null);
    };
    return KTSelectTags;
}());
export { KTSelectTags };
//# sourceMappingURL=tags.js.map