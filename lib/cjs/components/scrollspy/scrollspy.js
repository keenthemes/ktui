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
exports.KTScrollspy = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTScrollspy = /** @class */ (function (_super) {
    __extends(KTScrollspy, _super);
    function KTScrollspy(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'scrollspy';
        _this._defaultConfig = {
            target: 'body',
            offset: 0,
            smooth: true,
        };
        _this._config = _this._defaultConfig;
        _this._targetElement = null;
        _this._anchorElements = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        if (!_this._element)
            return _this;
        var targetElement = _this._getTarget() === 'body'
            ? document
            : dom_1.default.getElement(_this._getTarget());
        if (!targetElement)
            return _this;
        _this._targetElement = targetElement;
        _this._anchorElements = _this._element.querySelectorAll('[data-kt-scrollspy-anchor]');
        if (!_this._anchorElements)
            return _this;
        _this._handlers();
        _this._update();
        return _this;
    }
    KTScrollspy.prototype._getTarget = function () {
        return (this._element.getAttribute('data-kt-scrollspy-target') ||
            this._getOption('target'));
    };
    KTScrollspy.prototype._handlers = function () {
        var _this = this;
        if (!this._anchorElements)
            return;
        this._targetElement.addEventListener('scroll', function () {
            _this._anchorElements.forEach(function (anchorElement) {
                _this._updateAnchor(anchorElement);
            });
        });
        event_handler_1.default.on(this._element, '[data-kt-scrollspy-anchor]', 'click', function (event, target) {
            event.preventDefault();
            _this._scrollTo(target);
        });
    };
    KTScrollspy.prototype._scrollTo = function (anchorElement) {
        if (!anchorElement)
            return;
        var sectionElement = dom_1.default.getElement(anchorElement.getAttribute('href'));
        if (!sectionElement)
            return;
        var targetElement = this._targetElement === document ? window : this._targetElement;
        if (!targetElement)
            return;
        var offset = parseInt(this._getOption('offset'));
        if (anchorElement.getAttribute('data-kt-scrollspy-anchor-offset')) {
            offset = parseInt(anchorElement.getAttribute('data-kt-scrollspy-anchor-offset'));
        }
        var scrollTop = sectionElement.offsetTop - offset;
        if ('scrollTo' in targetElement) {
            targetElement.scrollTo({
                top: scrollTop,
                left: 0,
                behavior: this._getOption('smooth') ? 'smooth' : 'instant',
            });
        }
    };
    KTScrollspy.prototype._updateAnchor = function (anchorElement) {
        var sectionElement = dom_1.default.getElement(anchorElement.getAttribute('href'));
        if (!sectionElement)
            return;
        if (!dom_1.default.isVisible(anchorElement))
            return;
        if (!this._anchorElements)
            return;
        var scrollPosition = this._targetElement === document
            ? document.documentElement.scrollTop || document.body.scrollTop
            : this._targetElement.scrollTop;
        var offset = parseInt(this._getOption('offset'));
        if (anchorElement.getAttribute('data-kt-scrollspy-anchor-offset')) {
            offset = parseInt(anchorElement.getAttribute('data-kt-scrollspy-anchor-offset'));
        }
        var offsetTop = sectionElement.offsetTop;
        if (scrollPosition + offset >= offsetTop) {
            this._anchorElements.forEach(function (anchorElement) {
                anchorElement.classList.remove('active');
            });
            var payload = { element: anchorElement };
            this._fireEvent('activate', payload);
            this._dispatchEvent('activate', payload);
            anchorElement.classList.add('active');
            var parentAnchorElements = dom_1.default.parents(anchorElement, '[data-kt-scrollspy-group]');
            if (parentAnchorElements) {
                parentAnchorElements.forEach(function (parentAnchorElement) {
                    var _a;
                    (_a = parentAnchorElement
                        .querySelector('[data-kt-scrollspy-anchor]')) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                });
            }
        }
    };
    KTScrollspy.prototype._update = function () {
        var _this = this;
        if (!this._anchorElements)
            return;
        this._anchorElements.forEach(function (anchorElement) {
            _this._updateAnchor(anchorElement);
        });
    };
    KTScrollspy.prototype._isActive = function (anchorElement) {
        return anchorElement.classList.contains('active');
    };
    KTScrollspy.prototype.updateAnchor = function (anchorElement) {
        this._updateAnchor(anchorElement);
    };
    KTScrollspy.prototype.isActive = function (anchorElement) {
        return this._isActive(anchorElement);
    };
    KTScrollspy.prototype.update = function () {
        this.update();
    };
    KTScrollspy.prototype.scrollTo = function (anchorElement) {
        this._scrollTo(anchorElement);
    };
    KTScrollspy.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'scrollspy')) {
            return data_1.default.get(element, 'scrollspy');
        }
        if (element.getAttribute('data-kt-scrollspy')) {
            return new KTScrollspy(element);
        }
        return null;
    };
    KTScrollspy.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTScrollspy(element, config);
    };
    KTScrollspy.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-scrollspy]');
        elements.forEach(function (element) {
            new KTScrollspy(element);
        });
    };
    KTScrollspy.init = function () {
        KTScrollspy.createInstances();
    };
    return KTScrollspy;
}(component_1.default));
exports.KTScrollspy = KTScrollspy;
if (typeof window !== 'undefined') {
    window.KTScrollspy = KTScrollspy;
}
//# sourceMappingURL=scrollspy.js.map