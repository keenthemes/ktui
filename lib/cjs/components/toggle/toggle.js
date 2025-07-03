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
exports.KTToggle = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var component_1 = require("../component");
var KTToggle = /** @class */ (function (_super) {
    __extends(KTToggle, _super);
    function KTToggle(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'toggle';
        _this._defaultConfig = {
            target: '',
            activeClass: 'active',
            class: '',
            removeClass: '',
            attribute: '',
        };
        _this._config = _this._defaultConfig;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._targetElement = _this._getTargetElement();
        if (!_this._targetElement) {
            return _this;
        }
        _this._handlers();
        return _this;
    }
    KTToggle.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        this._element.addEventListener('click', function () {
            _this._toggle();
        });
    };
    KTToggle.prototype._getTargetElement = function () {
        return (dom_1.default.getElement(this._element.getAttribute('data-kt-toggle')) || dom_1.default.getElement(this._getOption('target')));
    };
    KTToggle.prototype._toggle = function () {
        if (!this._element)
            return;
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        this._element.classList.toggle(this._getOption('activeClass'));
        this._update();
        this._fireEvent('toggled');
        this._dispatchEvent('toggled');
    };
    KTToggle.prototype._update = function () {
        if (!this._targetElement)
            return;
        if (this._getOption('removeClass')) {
            dom_1.default.removeClass(this._targetElement, this._getOption('removeClass'));
        }
        if (!this._isActive()) {
            if (this._getOption('class')) {
                dom_1.default.addClass(this._targetElement, this._getOption('class'));
            }
            if (this._getOption('attribute')) {
                this._targetElement.setAttribute(this._getOption('attribute'), 'true');
            }
        }
        else {
            if (this._getOption('class')) {
                dom_1.default.removeClass(this._targetElement, this._getOption('class'));
            }
            if (this._getOption('attribute')) {
                this._targetElement.removeAttribute(this._getOption('attribute'));
            }
        }
    };
    KTToggle.prototype._isActive = function () {
        if (!this._element)
            return false;
        return (dom_1.default.hasClass(this._targetElement, this._getOption('class')) ||
            this._targetElement.hasAttribute(this._getOption('attribute')));
    };
    KTToggle.prototype.toggle = function () {
        this._toggle();
    };
    KTToggle.prototype.update = function () {
        this._update();
    };
    KTToggle.prototype.isActive = function () {
        return this._isActive();
    };
    KTToggle.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'toggle')) {
            return data_1.default.get(element, 'toggle');
        }
        if (element.getAttribute('data-kt-toggle')) {
            return new KTToggle(element);
        }
        return null;
    };
    KTToggle.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTToggle(element, config);
    };
    KTToggle.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-toggle]');
        elements.forEach(function (element) {
            new KTToggle(element);
        });
    };
    KTToggle.init = function () {
        KTToggle.createInstances();
    };
    return KTToggle;
}(component_1.default));
exports.KTToggle = KTToggle;
if (typeof window !== 'undefined') {
    window.KTToggle = KTToggle;
}
//# sourceMappingURL=toggle.js.map