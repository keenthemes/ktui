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
exports.KTScrollto = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var component_1 = require("../component");
var KTScrollto = /** @class */ (function (_super) {
    __extends(KTScrollto, _super);
    function KTScrollto(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'scrollto';
        _this._defaultConfig = {
            smooth: true,
            parent: 'body',
            target: '',
            offset: 0,
        };
        _this._config = _this._defaultConfig;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        if (!_this._element)
            return _this;
        _this._targetElement = _this._getTargetElement();
        if (!_this._targetElement) {
            return _this;
        }
        _this._handlers();
        return _this;
    }
    KTScrollto.prototype._getTargetElement = function () {
        return (dom_1.default.getElement(this._element.getAttribute('data-scrollto')) ||
            dom_1.default.getElement(this._getOption('target')));
    };
    KTScrollto.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        this._element.addEventListener('click', function (event) {
            event.preventDefault();
            _this._scroll();
        });
    };
    KTScrollto.prototype._scroll = function () {
        var pos = this._targetElement.offsetTop + parseInt(this._getOption('offset'));
        var parent = dom_1.default.getElement(this._getOption('parent'));
        if (!parent || parent === document.body) {
            parent = window;
        }
        parent.scrollTo({
            top: pos,
            behavior: this._getOption('smooth') ? 'smooth' : 'instant',
        });
    };
    KTScrollto.prototype.scroll = function () {
        this._scroll();
    };
    KTScrollto.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'scrollto')) {
            return data_1.default.get(element, 'scrollto');
        }
        if (element.getAttribute('data-scrollto') !== "false") {
            return new KTScrollto(element);
        }
        return null;
    };
    KTScrollto.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTScrollto(element, config);
    };
    KTScrollto.createInstances = function () {
        var elements = document.querySelectorAll('[data-scrollto]:not([data-scrollto="false"]');
        elements.forEach(function (element) {
            new KTScrollto(element);
        });
    };
    KTScrollto.init = function () {
        KTScrollto.createInstances();
    };
    return KTScrollto;
}(component_1.default));
exports.KTScrollto = KTScrollto;
;
//# sourceMappingURL=scrollto.js.map