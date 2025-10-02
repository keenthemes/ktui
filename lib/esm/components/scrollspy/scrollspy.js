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
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
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
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        if (!_this._element)
            return _this;
        var targetElement = _this._getTarget() === 'body'
            ? document
            : KTDom.getElement(_this._getTarget());
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
        KTEventHandler.on(this._element, '[data-kt-scrollspy-anchor]', 'click', function (event, target) {
            event.preventDefault();
            _this._scrollTo(target);
        });
    };
    KTScrollspy.prototype._scrollTo = function (anchorElement) {
        if (!anchorElement)
            return;
        var sectionElement = KTDom.getElement(anchorElement.getAttribute('href'));
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
        var sectionElement = KTDom.getElement(anchorElement.getAttribute('href'));
        if (!sectionElement)
            return;
        if (!KTDom.isVisible(anchorElement))
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
            var parentAnchorElements = KTDom.parents(anchorElement, '[data-kt-scrollspy-group]');
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
        if (KTData.has(element, 'scrollspy')) {
            return KTData.get(element, 'scrollspy');
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
}(KTComponent));
export { KTScrollspy };
if (typeof window !== 'undefined') {
    window.KTScrollspy = KTScrollspy;
}
//# sourceMappingURL=scrollspy.js.map