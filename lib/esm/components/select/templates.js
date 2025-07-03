/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { renderTemplateString } from './utils';
/**
 * Default HTML string templates for KTSelect. All UI structure is defined here.
 * Users can override any template by providing a matching key in the config.templates object.
 */
export var coreTemplateStrings = {
    dropdown: "<div data-kt-select-dropdown class=\"kt-select-dropdown hidden {{class}}\" style=\"z-index: {{zindex}};\"></div>",
    options: "<ul role=\"listbox\" aria-label=\"{{label}}\" class=\"kt-select-options {{class}}\" data-kt-select-options=\"true\"></ul>",
    error: "<li class=\"kt-select-error\" role=\"alert\"></li>",
    wrapper: "<div data-kt-select-wrapper class=\"kt-select-wrapper {{class}}\"></div>",
    combobox: "\n\t\t<div data-kt-select-combobox data-kt-select-display class=\"kt-select-combobox {{class}}\">\n\t\t\t<div data-kt-select-combobox-values=\"true\" class=\"kt-select-combobox-values\"></div>\n\t\t\t<input class=\"kt-input kt-select-combobox-input\" data-kt-select-search=\"true\" type=\"text\" placeholder=\"{{placeholder}}\" role=\"searchbox\" aria-label=\"{{label}}\" {{disabled}} />\n\t\t\t<button type=\"button\" data-kt-select-clear-button=\"true\" class=\"kt-select-combobox-clear-btn\" aria-label=\"Clear selection\">\n\t\t\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n\t\t\t\t\t<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\n\t\t\t\t\t<line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\n\t\t\t\t</svg>\n\t\t\t</button>\n\t\t</div>\n\t",
    placeholder: "<div data-kt-select-placeholder class=\"kt-select-placeholder {{class}}\"></div>",
    display: "\n\t\t<div data-kt-select-display class=\"kt-select-display {{class}}\" tabindex=\"{{tabindex}}\" role=\"button\" data-selected=\"0\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-label=\"{{label}}\" {{disabled}}>\n\t\t\t<div class=\"kt-select-option-text\" data-kt-text-container=\"true\">{{text}}</div>\n\t\t</div>\n\t",
    option: "\n\t\t<li data-kt-select-option data-value=\"{{value}}\" data-text=\"{{text}}\" class=\"kt-select-option {{class}}\" role=\"option\" {{selected}} {{disabled}}>\n\t\t\t<div class=\"kt-select-option-text\" data-kt-text-container=\"true\">{{text}}</div><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"size-3.5 ms-auto hidden text-primary kt-select-option-selected:block\"><path d=\"M20 6 9 17l-5-5\"/></svg>\n\t\t</li>\n\t",
    search: "<div data-kt-select-search class=\"kt-select-search {{class}}\"><input type=\"text\" data-kt-select-search=\"true\" placeholder=\"{{searchPlaceholder}}\" class=\"kt-input kt-input-ghost\" role=\"searchbox\" aria-label=\"{{searchPlaceholder}}\"/></div>",
    searchEmpty: "<div data-kt-select-search-empty class=\"kt-select-search-empty {{class}}\"></div>",
    loading: "<li class=\"kt-select-loading {{class}}\" role=\"status\" aria-live=\"polite\"></li>",
    tag: "<div data-kt-select-tag=\"true\" class=\"kt-select-tag {{class}}\"></div>",
    loadMore: "<li class=\"kt-select-load-more {{class}}\" data-kt-select-load-more=\"true\"></li>",
    selectAll: "<div data-kt-select-select-all class=\"kt-select-select-all\"><button type=\"button\" class=\"kt-select-select-all-button\">{{text}}</button></div>",
    tagRemoveButton: "<button type=\"button\" data-kt-select-remove-button class=\"kt-select-tag-remove\" aria-label=\"Remove tag\" tabindex=\"0\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"3\" y1=\"3\" x2=\"9\" y2=\"9\"/><line x1=\"9\" y1=\"3\" x2=\"3\" y2=\"9\"/></svg></button>",
};
/**
 * Default templates for KTSelect component
 */
function stringToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
/**
 * User-supplied template overrides. Use setTemplateStrings() to add or update.
 */
var userTemplateStrings = {};
/**
 * Register or update user template overrides.
 * @param templates Partial template object to merge with defaults.
 */
export function setTemplateStrings(templates) {
    userTemplateStrings = __assign(__assign({}, userTemplateStrings), templates);
}
/**
 * Get the complete template set, merging defaults, user overrides, and config templates.
 * @param config Optional config object with a "templates" property.
 */
export function getTemplateStrings(config) {
    var templates = config && typeof config === 'object' && 'templates' in config
        ? config.templates
        : undefined;
    if (templates) {
        return __assign(__assign(__assign({}, coreTemplateStrings), userTemplateStrings), templates);
    }
    return __assign(__assign({}, coreTemplateStrings), userTemplateStrings);
}
/**
 * Default templates for KTSelect component
 */
export var defaultTemplates = {
    /**
     * Renders the dropdown content
     */
    dropdown: function (config) {
        var _a;
        var template = getTemplateStrings(config).dropdown;
        // If a custom dropdownTemplate is provided, it's responsible for its own content.
        // Otherwise, the base template is used, and content is appended later.
        if (config.dropdownTemplate) {
            var renderedCustomTemplate = renderTemplateString(config.dropdownTemplate, {
                zindex: config.zindex ? String(config.zindex) : '',
                // content: config.content || '', // No longer pass content to custom template directly here
                class: config.dropdownClass || '',
            });
            // The custom template IS the dropdown element
            var customDropdownEl = stringToElement(renderedCustomTemplate);
            if (config.zindex)
                customDropdownEl.style.zIndex = String(config.zindex);
            if (config.dropdownClass)
                (_a = customDropdownEl.classList).add.apply(_a, config.dropdownClass.split(' '));
            return customDropdownEl;
        }
        var html = template
            .replace('{{zindex}}', config.zindex ? String(config.zindex) : '')
            // .replace('{{content}}', '') // Content is no longer part of the base template string
            .replace('{{class}}', config.dropdownClass || '');
        return stringToElement(html);
    },
    /**
     * Renders the options container for the dropdown
     */
    options: function (config) {
        var template = getTemplateStrings(config).options;
        var html = template
            .replace('{{label}}', config.label || 'Options')
            .replace('{{height}}', config.height ? String(config.height) : '250')
            // .replace('{{options}}', '') // Options are now appended dynamically
            .replace('{{class}}', config.optionsClass || '');
        return stringToElement(html);
    },
    /**
     * Renders the load more button for pagination
     */
    loadMore: function (config) {
        var html = getTemplateStrings(config)
            .loadMore // .replace('{{loadMoreText}}', config.loadMoreText || 'Load more...') // Content is no longer in template string
            .replace('{{class}}', config.loadMoreClass || '');
        var element = stringToElement(html);
        element.textContent = config.loadMoreText || 'Load more...';
        return element;
    },
    /**
     * Renders an error message in the dropdown
     */
    error: function (config) {
        // Changed return type to HTMLElement
        var template = getTemplateStrings(config).error;
        var html = template
            // .replace('{{errorMessage}}', config.errorMessage || 'An error occurred') // Content is no longer in template string
            .replace('{{class}}', config.errorClass || '');
        var element = stringToElement(html);
        element.textContent = config.errorMessage || 'An error occurred';
        return element;
    },
    /**
     * Renders the main container for the select component
     */
    wrapper: function (config) {
        var html = getTemplateStrings(config).wrapper.replace('{{class}}', config.wrapperClass || '');
        var element = stringToElement(html);
        return element;
    },
    /**
     * Renders the display element (trigger) for the select
     */
    display: function (config) {
        var html = getTemplateStrings(config)
            .display.replace('{{tabindex}}', config.disabled ? '-1' : '0')
            .replace('{{label}}', config.label || config.placeholder || 'Select...')
            .replace('{{disabled}}', config.disabled ? 'aria-disabled="true"' : '')
            .replace('{{placeholder}}', config.placeholder || 'Select...')
            .replace('{{class}}', config.displayClass || '');
        var element = stringToElement(html);
        // Add data-multiple attribute if in multiple select mode
        if (config.multiple) {
            element.setAttribute('data-multiple', 'true');
        }
        return element;
    },
    /**
     * Renders a single option
     */
    option: function (option, config) {
        var _a, _b, _c;
        var isHtmlOption = option instanceof HTMLOptionElement;
        var optionData;
        if (isHtmlOption) {
            // If it's a plain HTMLOptionElement, construct data similarly to how KTSelectOption would
            // This branch might be less common if KTSelectOption instances are always used for rendering.
            var el = option;
            var textContent = el.textContent || '';
            optionData = __assign({ value: el.value, text: textContent, selected: el.selected, disabled: el.disabled, content: textContent }, (((_a = config.optionsConfig) === null || _a === void 0 ? void 0 : _a[el.value]) || {}));
        }
        else {
            // If it's a KTSelectOption class instance (from './option')
            // which should have the getOptionDataForTemplate method.
            optionData = option.getOptionDataForTemplate();
        }
        var content = (_b = optionData === null || optionData === void 0 ? void 0 : optionData.text) === null || _b === void 0 ? void 0 : _b.trim(); // Default content to option's text
        if (config.optionTemplate) {
            // Use the user-provided template string, rendering with the full optionData.
            // renderTemplateString will replace {{key}} with values from optionData.
            content = renderTemplateString(config.optionTemplate, optionData);
        }
        else {
            content = optionData.text || optionData.content; // Prefer explicit text, fallback to content
        }
        // Use the core option template string as the base structure.
        var baseTemplate = getTemplateStrings(config).option;
        var optionClasses = [config.optionClass || ''];
        if (optionData.disabled) {
            optionClasses.push('disabled');
        }
        // Populate the base template for the <li> attributes.
        // The actual display content (text or custom HTML) will be set on the inner span later.
        var html = renderTemplateString(baseTemplate, __assign(__assign({}, optionData), { class: optionClasses.join(' ').trim() || '', selected: optionData.selected
                ? 'aria-selected="true"'
                : 'aria-selected="false"', disabled: optionData.disabled ? 'aria-disabled="true"' : '', content: content }));
        var element = stringToElement(html);
        // If a custom option template is provided, replace the element's innerHTML with the content.
        if (config.optionTemplate) {
            element.innerHTML = content;
        }
        // Ensure data-text attribute is set to the original, clean text for searching/filtering
        element.setAttribute('data-text', ((_c = optionData === null || optionData === void 0 ? void 0 : optionData.text) === null || _c === void 0 ? void 0 : _c.trim()) || '');
        return element;
    },
    /**
     * Renders the search input
     */
    search: function (config) {
        var html = getTemplateStrings(config)
            .search.replace('{{searchPlaceholder}}', config.searchPlaceholder || 'Search...')
            .replace('{{class}}', config.searchClass || '');
        return stringToElement(html);
    },
    /**
     * Renders the no results message
     */
    searchEmpty: function (config) {
        var html = getTemplateStrings(config).searchEmpty.replace('{{class}}', config.searchEmptyClass || '');
        var content = config.searchEmpty || 'No results';
        if (config.searchEmptyTemplate) {
            content = renderTemplateString(config.searchEmptyTemplate, {
                class: config.searchEmptyClass || '',
            });
            var element = stringToElement(html);
            element.innerHTML = content; // For templates, content can be HTML
            return element;
        }
        else {
            var element = stringToElement(html);
            element.textContent = content; // For simple text, use textContent
            return element;
        }
    },
    /**
     * Renders the loading state
     */
    loading: function (config, loadingMessage) {
        var html = getTemplateStrings(config).loading.replace('{{class}}', config.loadingClass || '');
        var element = stringToElement(html);
        element.textContent = loadingMessage || 'Loading options...';
        return element;
    },
    /**
     * Renders a tag for multi-select
     */
    tag: function (option, config) {
        var _a;
        var template = getTemplateStrings(config).tag;
        var preparedContent = option.title; // Default content is the option's title
        if (config.tagTemplate) {
            var tagTemplateString_1 = config.tagTemplate;
            var optionValue = option.getAttribute('data-value') || option.value;
            // Replace all {{varname}} in option.innerHTML with values from _config.optionsConfig
            Object.entries(((_a = config.optionsConfig) === null || _a === void 0 ? void 0 : _a[optionValue]) || {}).forEach(function (_a) {
                var key = _a[0], val = _a[1];
                if (typeof val === 'string' ||
                    typeof val === 'number' ||
                    typeof val === 'boolean') {
                    tagTemplateString_1 = tagTemplateString_1.replace(new RegExp("{{".concat(key, "}}"), 'g'), String(val));
                }
            });
            // Render the custom tag template with option data
            preparedContent = renderTemplateString(tagTemplateString_1, {
                title: option.title,
                id: option.id,
                class: config.tagClass || '', // This class is for content, not the main tag div
                // content: option.innerHTML, // Avoid direct innerHTML from option due to potential XSS
                text: option.innerText || option.textContent || '',
                value: optionValue,
            });
        }
        // Append the remove button HTML string to the prepared content
        preparedContent += getTemplateStrings(config).tagRemoveButton;
        var html = template
            // .replace('{{title}}', option.title) // Title is part of preparedContent if using custom template
            // .replace('{{id}}', option.id)       // ID is part of preparedContent if using custom template
            .replace('{{class}}', config.tagClass || ''); // Class for the main tag div
        var element = stringToElement(html);
        element.innerHTML = preparedContent; // Set the fully prepared content (text/HTML + remove button)
        return element;
    },
    /**
     * Renders the placeholder for the select
     */
    placeholder: function (config) {
        var html = getTemplateStrings(config).placeholder.replace('{{class}}', config.placeholderClass || '');
        var content = config.placeholder || 'Select...';
        if (config.placeholderTemplate) {
            content = renderTemplateString(config.placeholderTemplate, {
                placeholder: config.placeholder || 'Select...',
                class: config.placeholderClass || '',
            });
            var element = stringToElement(html);
            element.innerHTML = content; // For templates, content can be HTML
            return element;
        }
        else {
            var element = stringToElement(html);
            element.textContent = content; // For simple text, use textContent
            return element;
        }
    },
    selectAll: function (config) {
        var template = getTemplateStrings(config).selectAll;
        var element = stringToElement(template.replace('{{text}}', config.selectAllText || 'Select All'));
        return element;
    },
};
//# sourceMappingURL=templates.js.map