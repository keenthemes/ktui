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
exports.KTTabs = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTTabs = /** @class */ (function (_super) {
    __extends(KTTabs, _super);
    function KTTabs(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'tabs';
        _this._defaultConfig = {
            hiddenClass: 'hidden',
        };
        _this._config = _this._defaultConfig;
        _this._currentTabElement = null;
        _this._currentContentElement = null;
        _this._lastTabElement = null;
        _this._lastContentElement = null;
        _this._tabElements = null;
        _this._isTransitioning = false;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        if (!_this._element)
            return _this;
        _this._tabElements = _this._element.querySelectorAll('[data-kt-tab-toggle]');
        _this._currentTabElement = _this._element.querySelector('.active[data-kt-tab-toggle]');
        _this._currentContentElement =
            (_this._currentTabElement &&
                (dom_1.default.getElement(_this._currentTabElement.getAttribute('data-kt-tab-toggle')) ||
                    dom_1.default.getElement(_this._currentTabElement.getAttribute('href')))) ||
                null;
        _this._handlers();
        return _this;
    }
    KTTabs.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        event_handler_1.default.on(this._element, '[data-kt-tab-toggle]', 'click', function (event, target) {
            event.preventDefault();
            _this._show(target);
        });
    };
    KTTabs.prototype._show = function (tabElement) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this._isShown(tabElement) || this._isTransitioning)
            return;
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel === true) {
            return;
        }
        (_a = this._currentTabElement) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        (_b = this._currentTabElement) === null || _b === void 0 ? void 0 : _b.classList.remove('selected');
        (_c = this._currentContentElement) === null || _c === void 0 ? void 0 : _c.classList.add(this._getOption('hiddenClass'));
        this._lastTabElement = this._currentTabElement;
        (_d = this._getDropdownToggleElement(this._lastTabElement)) === null || _d === void 0 ? void 0 : _d.classList.remove('active');
        this._lastContentElement = this._currentContentElement;
        this._currentTabElement = tabElement;
        this._currentContentElement =
            dom_1.default.getElement(tabElement.getAttribute('data-kt-tab-toggle')) ||
                dom_1.default.getElement(tabElement.getAttribute('href'));
        (_e = this._currentTabElement) === null || _e === void 0 ? void 0 : _e.classList.add('active');
        (_f = this._currentTabElement) === null || _f === void 0 ? void 0 : _f.classList.add('selected');
        (_g = this._currentContentElement) === null || _g === void 0 ? void 0 : _g.classList.remove(this._getOption('hiddenClass'));
        (_h = this._getDropdownToggleElement(this._currentTabElement)) === null || _h === void 0 ? void 0 : _h.classList.add('active');
        this._currentContentElement.style.opacity = '0';
        dom_1.default.reflow(this._currentContentElement);
        this._currentContentElement.style.opacity = '1';
        dom_1.default.transitionEnd(this._currentContentElement, function () {
            _this._isTransitioning = false;
            _this._currentContentElement.style.opacity = '';
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTTabs.prototype._getDropdownToggleElement = function (element) {
        var containerElement = element.closest('[data-kt-dropdown-initialized],[data-kt-menu-initialized]');
        if (containerElement) {
            return containerElement.querySelector('[data-kt-dropdown-toggle], [data-kt-menu-toggle]');
        }
        else {
            return null;
        }
    };
    KTTabs.prototype._isShown = function (tabElement) {
        return tabElement.classList.contains('active');
    };
    KTTabs.prototype.isShown = function (tabElement) {
        return this._isShown(tabElement);
    };
    KTTabs.prototype.show = function (tabElement) {
        return this._show(tabElement);
    };
    KTTabs.keyboardArrow = function () { };
    KTTabs.keyboardJump = function () { };
    KTTabs.handleAccessibility = function () { };
    KTTabs.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'tabs')) {
            return data_1.default.get(element, 'tabs');
        }
        if (element.getAttribute('data-kt-tabs')) {
            return new KTTabs(element);
        }
        return null;
    };
    KTTabs.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTTabs(element, config);
    };
    KTTabs.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-tabs]');
        elements.forEach(function (element) {
            new KTTabs(element);
        });
    };
    KTTabs.init = function () {
        KTTabs.createInstances();
        if (window.KT_TABS_INITIALIZED !== true) {
            KTTabs.handleAccessibility();
            window.KT_TABS_INITIALIZED = true;
        }
    };
    return KTTabs;
}(component_1.default));
exports.KTTabs = KTTabs;
if (typeof window !== 'undefined') {
    window.KTTabs = KTTabs;
}
//# sourceMappingURL=tabs.js.map