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
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
var KTCollapse = /** @class */ (function (_super) {
    __extends(KTCollapse, _super);
    function KTCollapse(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'collapse';
        _this._defaultConfig = {
            hiddenClass: 'hidden',
            activeClass: 'active',
            target: '',
        };
        _this._config = _this._defaultConfig;
        _this._isAnimating = false;
        if (KTData.has(element, _this._name))
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
    KTCollapse.prototype._getTargetElement = function () {
        return (KTDom.getElement(this._element.getAttribute('data-kt-collapse')) || KTDom.getElement(this._getOption('target')));
    };
    KTCollapse.prototype._isOpen = function () {
        return this._targetElement.classList.contains(this._getOption('activeClass'));
    };
    KTCollapse.prototype._handlers = function () {
        var _this = this;
        this._element.addEventListener('click', function (event) {
            event.preventDefault();
            _this._toggle();
        });
    };
    KTCollapse.prototype._expand = function () {
        var _this = this;
        if (this._isAnimating || this._isOpen()) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('expand', payload);
        this._dispatchEvent('expand', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._element) {
            this._element.setAttribute('aria-expanded', 'true');
            this._element.classList.add(this._getOption('activeClass'));
        }
        this._targetElement.classList.remove(this._getOption('hiddenClass'));
        this._targetElement.classList.add(this._getOption('activeClass'));
        this._targetElement.style.height = '0px';
        this._targetElement.style.overflow = 'hidden';
        KTDom.reflow(this._targetElement);
        this._targetElement.style.height = "".concat(this._targetElement.scrollHeight, "px");
        this._isAnimating = true;
        KTDom.transitionEnd(this._targetElement, function () {
            _this._isAnimating = false;
            _this._targetElement.style.height = '';
            _this._targetElement.style.overflow = '';
            _this._fireEvent('expanded');
            _this._dispatchEvent('expanded');
        });
    };
    KTCollapse.prototype._collapse = function () {
        var _this = this;
        if (this._isAnimating || !this._isOpen()) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('collapse', payload);
        this._dispatchEvent('collapse', payload);
        if (payload.cancel === true) {
            return;
        }
        if (!this._element)
            return;
        this._element.setAttribute('aria-expanded', 'false');
        this._element.classList.remove(this._getOption('activeClass'));
        this._targetElement.classList.remove(this._getOption('activeClass'));
        this._targetElement.style.height = "".concat(this._targetElement.scrollHeight, "px");
        KTDom.reflow(this._targetElement);
        this._targetElement.style.height = "0px";
        this._targetElement.style.overflow = 'hidden';
        this._isAnimating = true;
        KTDom.transitionEnd(this._targetElement, function () {
            _this._isAnimating = false;
            _this._targetElement.classList.add(_this._getOption('hiddenClass'));
            _this._targetElement.style.overflow = '';
            _this._fireEvent('collapsed');
            _this._dispatchEvent('collapsed');
        });
    };
    KTCollapse.prototype._toggle = function () {
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._isOpen()) {
            this._collapse();
        }
        else {
            this._expand();
        }
    };
    KTCollapse.prototype.expand = function () {
        return this._expand();
    };
    KTCollapse.prototype.collapse = function () {
        return this._collapse();
    };
    KTCollapse.prototype.isOpen = function () {
        return this._isOpen();
    };
    KTCollapse.getInstance = function (element) {
        if (!element)
            return null;
        if (KTData.has(element, 'collapse')) {
            return KTData.get(element, 'collapse');
        }
        if (element.getAttribute('data-kt-collapse')) {
            return new KTCollapse(element);
        }
        return null;
    };
    KTCollapse.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTCollapse(element, config);
    };
    KTCollapse.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-collapse]');
        elements.forEach(function (element) {
            new KTCollapse(element);
        });
    };
    KTCollapse.init = function () {
        KTCollapse.createInstances();
    };
    return KTCollapse;
}(KTComponent));
export { KTCollapse };
if (typeof window !== 'undefined') {
    window.KTCollapse = KTCollapse;
}
//# sourceMappingURL=collapse.js.map