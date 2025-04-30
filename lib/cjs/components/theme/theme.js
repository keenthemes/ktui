"use strict";
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
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
exports.KTTheme = void 0;
var data_1 = require("../../helpers/data");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTTheme = /** @class */ (function (_super) {
    __extends(KTTheme, _super);
    function KTTheme(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'theme';
        _this._defaultConfig = {
            mode: 'light',
            class: true,
            attribute: 'data-theme-mode',
        };
        _this._mode = null;
        _this._currentMode = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._setMode((localStorage.getItem('theme') || _this._getOption('mode')));
        _this._handlers();
        return _this;
    }
    KTTheme.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        event_handler_1.default.on(this._element, '[data-theme-toggle="true"]', 'click', function () {
            _this._toggle();
        });
        event_handler_1.default.on(this._element, '[data-theme-switch]', 'click', function (event, target) {
            event.preventDefault();
            var mode = target.getAttribute('data-theme-switch');
            _this._setMode(mode);
        });
    };
    KTTheme.prototype._toggle = function () {
        var mode = this._currentMode === 'light' ? 'dark' : 'light';
        this._setMode(mode);
    };
    KTTheme.prototype._setMode = function (mode) {
        if (!this._element)
            return;
        var payload = { cancel: false };
        this._fireEvent('change', payload);
        this._dispatchEvent('change', payload);
        if (payload.cancel === true) {
            return;
        }
        var currentMode = mode;
        if (mode === 'system') {
            currentMode = this._getSystemMode();
        }
        this._mode = mode;
        this._currentMode = currentMode;
        this._bindMode();
        this._updateState();
        localStorage.setItem('theme', this._mode);
        this._element.setAttribute('data-theme-mode', mode);
        this._fireEvent('changed', {});
        this._dispatchEvent('changed', {});
    };
    KTTheme.prototype._getMode = function () {
        return localStorage.getItem('theme') || this._mode;
    };
    KTTheme.prototype._getSystemMode = function () {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    KTTheme.prototype._bindMode = function () {
        if (!this._currentMode || !this._element) {
            return;
        }
        if (this._getOption('class')) {
            this._element.classList.remove('dark');
            this._element.classList.remove('light');
            this._element.removeAttribute(this._getOption('attribute'));
            this._element.classList.add(this._currentMode);
        }
        else {
            this._element.classList.remove(this._currentMode);
            this._element.setAttribute(this._getOption('attribute'), this._currentMode);
        }
    };
    KTTheme.prototype._updateState = function () {
        var _this = this;
        var elements = document.querySelectorAll('input[type="checkbox"][data-theme-state]');
        elements.forEach(function (element) {
            if (element.getAttribute('data-theme-state') === _this._mode) {
                element.checked = true;
            }
        });
    };
    KTTheme.prototype.getMode = function () {
        return this._getMode();
    };
    KTTheme.prototype.setMode = function (mode) {
        this.setMode(mode);
    };
    KTTheme.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'theme')) {
            return data_1.default.get(element, 'theme');
        }
        if (element.getAttribute('data-theme') !== "false") {
            return new KTTheme(element);
        }
        return null;
    };
    KTTheme.getOrCreateInstance = function (element, config) {
        if (element === void 0) { element = document.body; }
        return this.getInstance(element) || new KTTheme(element, config);
    };
    KTTheme.createInstances = function () {
        var elements = document.querySelectorAll('[data-theme]:not([data-theme="false"]');
        elements.forEach(function (element) {
            new KTTheme(element);
        });
    };
    KTTheme.init = function () {
        KTTheme.createInstances();
    };
    return KTTheme;
}(component_1.default));
exports.KTTheme = KTTheme;
//# sourceMappingURL=theme.js.map