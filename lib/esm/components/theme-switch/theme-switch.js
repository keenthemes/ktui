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
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
var KTThemeSwitch = /** @class */ (function (_super) {
    __extends(KTThemeSwitch, _super);
    function KTThemeSwitch(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'theme-swtich';
        _this._defaultConfig = {
            mode: 'light',
        };
        _this._mode = null;
        _this._currentMode = null;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._setMode((localStorage.getItem('kt-theme') ||
            _this._getOption('mode')));
        _this._handlers();
        return _this;
    }
    KTThemeSwitch.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        KTEventHandler.on(document.body, '[data-kt-theme-switch-toggle]', 'click', function () {
            _this._toggle();
        });
        KTEventHandler.on(document.body, '[data-kt-theme-switch-set]', 'click', function (event, target) {
            event.preventDefault();
            var mode = target.getAttribute('data-kt-theme-switch-set');
            _this._setMode(mode);
        });
    };
    KTThemeSwitch.prototype._toggle = function () {
        var mode = this._currentMode === 'light' ? 'dark' : 'light';
        this._setMode(mode);
    };
    KTThemeSwitch.prototype._setMode = function (mode) {
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
        localStorage.setItem('kt-theme', this._mode);
        this._element.setAttribute('data-kt-theme-switch-mode', mode);
        this._fireEvent('changed', {});
        this._dispatchEvent('changed', {});
    };
    KTThemeSwitch.prototype._getMode = function () {
        return (localStorage.getItem('kt-theme') || this._mode);
    };
    KTThemeSwitch.prototype._getSystemMode = function () {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    };
    KTThemeSwitch.prototype._bindMode = function () {
        if (!this._currentMode || !this._element) {
            return;
        }
        this._element.classList.remove('dark');
        this._element.classList.remove('light');
        this._element.removeAttribute(this._getOption('attribute'));
        this._element.classList.add(this._currentMode);
    };
    KTThemeSwitch.prototype._updateState = function () {
        var _this = this;
        var elements = document.querySelectorAll('input[type="checkbox"][data-kt-theme-switch-state]');
        elements.forEach(function (element) {
            if (element.getAttribute('data-kt-theme-switch-state') === _this._mode) {
                element.checked = true;
            }
        });
    };
    KTThemeSwitch.prototype.getMode = function () {
        return this._getMode();
    };
    KTThemeSwitch.prototype.setMode = function (mode) {
        this.setMode(mode);
    };
    KTThemeSwitch.getInstance = function () {
        var root = document.documentElement;
        if (KTData.has(root, 'theme-switch')) {
            return KTData.get(root, 'theme-switch');
        }
        if (root) {
            return new KTThemeSwitch(root);
        }
        return null;
    };
    KTThemeSwitch.createInstances = function () {
        var root = document.documentElement;
        if (root)
            new KTThemeSwitch(root);
    };
    KTThemeSwitch.init = function () {
        KTThemeSwitch.createInstances();
    };
    return KTThemeSwitch;
}(KTComponent));
export { KTThemeSwitch };
if (typeof window !== 'undefined') {
    window.KTThemeSwitch = KTThemeSwitch;
}
//# sourceMappingURL=theme-switch.js.map