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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTDismiss = void 0;
var data_1 = __importDefault(require("../../helpers/data"));
var dom_1 = __importDefault(require("../../helpers/dom"));
var component_1 = __importDefault(require("../component"));
var KTDismiss = /** @class */ (function (_super) {
    __extends(KTDismiss, _super);
    function KTDismiss(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'dismiss';
        _this._defaultConfig = {
            hiddenClass: 'hidden',
            mode: 'remove',
            interrupt: true,
            target: '',
        };
        _this._config = _this._defaultConfig;
        _this._isAnimating = false;
        _this._targetElement = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._config['mode'] = _this._config['mode'];
        if (!_this._element)
            return _this;
        _this._targetElement = _this._getTargetElement();
        if (!_this._targetElement) {
            return _this;
        }
        _this._handlers();
        return _this;
    }
    KTDismiss.prototype._getTargetElement = function () {
        return (dom_1.default.getElement(this._element.getAttribute('data-kt-dismiss')) || dom_1.default.getElement(this._getOption('target')));
    };
    KTDismiss.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        this._element.addEventListener('click', function (event) {
            event.preventDefault();
            if (_this._getOption('interrupt') === true) {
                event.stopPropagation();
            }
            _this._dismiss();
        });
    };
    KTDismiss.prototype._dismiss = function () {
        var _this = this;
        if (this._isAnimating) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('dismiss', payload);
        this._dispatchEvent('dismiss', payload);
        if (payload.cancel === true) {
            return;
        }
        if (!this._targetElement)
            return;
        this._targetElement.style.opacity = '0';
        dom_1.default.reflow(this._targetElement);
        this._isAnimating = true;
        dom_1.default.transitionEnd(this._targetElement, function () {
            if (!_this._targetElement)
                return;
            _this._isAnimating = false;
            _this._targetElement.style.opacity = '';
            if (_this._getOption('mode').toString().toLowerCase() === 'hide') {
                _this._targetElement.classList.add(_this._getOption('hiddenClass'));
            }
            else {
                dom_1.default.remove(_this._targetElement);
            }
            _this._fireEvent('dismissed');
            _this._dispatchEvent('dismissed');
        });
    };
    KTDismiss.prototype.getTargetElement = function () {
        return this._targetElement;
    };
    KTDismiss.prototype.dismiss = function () {
        this._dismiss();
    };
    KTDismiss.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'dismiss')) {
            return data_1.default.get(element, 'dismiss');
        }
        if (element.getAttribute('data-kt-dismiss')) {
            return new KTDismiss(element);
        }
        return null;
    };
    KTDismiss.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTDismiss(element, config);
    };
    KTDismiss.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-dismiss]');
        elements.forEach(function (element) {
            new KTDismiss(element);
        });
    };
    KTDismiss.init = function () {
        KTDismiss.createInstances();
    };
    return KTDismiss;
}(component_1.default));
exports.KTDismiss = KTDismiss;
if (typeof window !== 'undefined') {
    window.KTDismiss = KTDismiss;
}
//# sourceMappingURL=dismiss.js.map