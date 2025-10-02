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
import KTComponent from '../component';
import { defaultTemplates } from './templates';
var KTSelectOption = /** @class */ (function (_super) {
    __extends(KTSelectOption, _super);
    function KTSelectOption(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'select-option';
        _this._dataOptionPrefix = 'kt-'; // Use 'kt-' prefix to support data-kt-select-option attributes
        // Always initialize a new option instance
        _this._init(element);
        _this._globalConfig = config;
        _this._buildConfig();
        // Clean the config
        _this._config = _this._config[''] || {};
        // Add the option config to the global config
        // Ensure optionsConfig is initialized
        if (_this._globalConfig) {
            _this._globalConfig.optionsConfig = _this._globalConfig.optionsConfig || {};
            _this._globalConfig.optionsConfig[element.value] =
                _this._config;
            // console.log('[KTSelectOption] Populating _globalConfig.optionsConfig for value', (element as HTMLInputElement).value, 'with:', JSON.parse(JSON.stringify(this._config)));
            // console.log('[KTSelectOption] _globalConfig.optionsConfig is now:', JSON.parse(JSON.stringify(this._globalConfig.optionsConfig)));
        }
        else {
            // Handle case where _globalConfig might be undefined, though constructor expects it.
            // This might indicate a need to ensure config is always passed or has a default.
            console.warn('KTSelectOption: _globalConfig is undefined during constructor.');
        }
        // Don't store in KTData to avoid Singleton pattern issues
        // Each option should be a unique instance
        element.instance = _this;
        return _this;
    }
    Object.defineProperty(KTSelectOption.prototype, "id", {
        get: function () {
            return this.getHTMLOptionElement().value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(KTSelectOption.prototype, "title", {
        get: function () {
            return this.getHTMLOptionElement().textContent || '';
        },
        enumerable: false,
        configurable: true
    });
    KTSelectOption.prototype.getHTMLOptionElement = function () {
        return this._element;
    };
    /**
     * Gathers all necessary data for rendering this option,
     * including standard HTML attributes and custom data-kt-* attributes.
     */
    KTSelectOption.prototype.getOptionDataForTemplate = function () {
        var el = this.getHTMLOptionElement();
        var text = el.textContent || '';
        return __assign(__assign({}, this._config), { 
            // Standard HTMLOptionElement properties
            value: el.value, text: text, selected: el.selected, disabled: el.disabled, 
            // Provide 'content' for convenience in templates, defaulting to text.
            // User's optionTemplate can then use {{content}} or specific fields like {{text}}, {{icon}}, etc.
            content: text });
    };
    KTSelectOption.prototype.render = function () {
        // 'this' is the KTSelectOption instance.
        // defaultTemplates.option will handle using this instance's data along with _globalConfig.
        return defaultTemplates.option(this, this._globalConfig);
    };
    return KTSelectOption;
}(KTComponent));
export { KTSelectOption };
//# sourceMappingURL=option.js.map