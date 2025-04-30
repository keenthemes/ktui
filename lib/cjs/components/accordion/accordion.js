"use strict";
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
exports.KTAccordion = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTAccordion = /** @class */ (function (_super) {
    __extends(KTAccordion, _super);
    function KTAccordion(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'accordion';
        _this._defaultConfig = {
            hiddenClass: 'hidden',
            activeClass: 'active',
            expandAll: false
        };
        _this._config = _this._defaultConfig;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._handlers();
        return _this;
    }
    KTAccordion.prototype._handlers = function () {
        var _this = this;
        event_handler_1.default.on(this._element, '[data-accordion-toggle]', 'click', function (event, target) {
            event.preventDefault();
            var accordionElement = target.closest('[data-accordion-item]');
            if (accordionElement)
                _this._toggle(accordionElement);
        });
    };
    KTAccordion.prototype._toggle = function (accordionElement) {
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        if (accordionElement.classList.contains('active')) {
            this._hide(accordionElement);
        }
        else {
            this._show(accordionElement);
        }
    };
    KTAccordion.prototype._show = function (accordionElement) {
        var _this = this;
        if (accordionElement.hasAttribute('animating') || accordionElement.classList.contains(this._getOption('activeClass')))
            return;
        var toggleElement = dom_1.default.child(accordionElement, '[data-accordion-toggle]');
        if (!toggleElement)
            return;
        var contentElement = dom_1.default.getElement(toggleElement.getAttribute('data-accordion-toggle'));
        if (!contentElement)
            return;
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._getOption('expandAll') === false) {
            this._hideSiblings(accordionElement);
        }
        accordionElement.setAttribute('aria-expanded', 'true');
        accordionElement.classList.add(this._getOption('activeClass'));
        accordionElement.setAttribute('animating', 'true');
        contentElement.classList.remove(this._getOption('hiddenClass'));
        contentElement.style.height = "0px";
        dom_1.default.reflow(contentElement);
        contentElement.style.height = "".concat(contentElement.scrollHeight, "px");
        dom_1.default.transitionEnd(contentElement, function () {
            accordionElement.removeAttribute('animating');
            contentElement.style.height = '';
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTAccordion.prototype._hide = function (accordionElement) {
        var _this = this;
        if (accordionElement.hasAttribute('animating') || !accordionElement.classList.contains(this._getOption('activeClass')))
            return;
        var toggleElement = dom_1.default.child(accordionElement, '[data-accordion-toggle]');
        if (!toggleElement)
            return;
        var contentElement = dom_1.default.getElement(toggleElement.getAttribute('data-accordion-toggle'));
        if (!contentElement)
            return;
        var payload = { cancel: false };
        this._fireEvent('hide', payload);
        this._dispatchEvent('hide', payload);
        if (payload.cancel === true) {
            return;
        }
        accordionElement.setAttribute('aria-expanded', 'false');
        contentElement.style.height = "".concat(contentElement.scrollHeight, "px");
        dom_1.default.reflow(contentElement);
        contentElement.style.height = '0px';
        accordionElement.setAttribute('animating', 'true');
        dom_1.default.transitionEnd(contentElement, function () {
            accordionElement.removeAttribute('animating');
            accordionElement.classList.remove(_this._getOption('activeClass'));
            contentElement.classList.add(_this._getOption('hiddenClass'));
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTAccordion.prototype._hideSiblings = function (accordionElement) {
        var _this = this;
        var siblings = dom_1.default.siblings(accordionElement);
        siblings === null || siblings === void 0 ? void 0 : siblings.forEach(function (sibling) {
            _this._hide(sibling);
        });
    };
    KTAccordion.prototype.show = function (accordionElement) {
        this._show(accordionElement);
    };
    KTAccordion.prototype.hide = function (accordionElement) {
        this._hide(accordionElement);
    };
    KTAccordion.prototype.toggle = function (accordionElement) {
        this._toggle(accordionElement);
    };
    KTAccordion.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'accordion')) {
            return data_1.default.get(element, 'accordion');
        }
        if (element.getAttribute('data-accordion') === "true") {
            return new KTAccordion(element);
        }
        return null;
    };
    KTAccordion.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTAccordion(element, config);
    };
    KTAccordion.createInstances = function () {
        var elements = document.querySelectorAll('[data-accordion="true"]');
        elements.forEach(function (element) {
            new KTAccordion(element);
        });
    };
    KTAccordion.init = function () {
        KTAccordion.createInstances();
    };
    return KTAccordion;
}(component_1.default));
exports.KTAccordion = KTAccordion;
//# sourceMappingURL=accordion.js.map