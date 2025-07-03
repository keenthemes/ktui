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
exports.KTTooltip = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var component_1 = require("../component");
var core_1 = require("@popperjs/core");
var KTTooltip = /** @class */ (function (_super) {
    __extends(KTTooltip, _super);
    function KTTooltip(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'tooltip';
        _this._defaultConfig = {
            target: '',
            hiddenClass: 'hidden',
            trigger: 'hover',
            placement: 'top',
            placementRtl: 'top',
            container: null,
            strategy: 'fixed',
            offset: '0, 5px',
            offsetRtl: '0, 5px',
            delayShow: 0,
            delayHide: 0,
            permanent: false,
            zindex: '100',
        };
        _this._config = _this._defaultConfig;
        _this._isOpen = false;
        _this._targetElement = null;
        _this._popper = null;
        _this._transitioning = false;
        _this._timeout = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config || {});
        _this._targetElement = _this._getTargetElement();
        if (!_this._targetElement) {
            return _this;
        }
        _this._handlers();
        return _this;
    }
    KTTooltip.prototype._getTargetElement = function () {
        var _a;
        if (!this._element)
            return null;
        var targetAttr = this._element.getAttribute('data-kt-tooltip');
        var query = targetAttr ||
            ((_a = this._getOption('target')) === null || _a === void 0 ? void 0 : _a.toString()) ||
            '[data-kt-tooltip-content]';
        return (dom_1.default.getElement(query) || this._element.querySelector(query));
    };
    KTTooltip.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        if (this._getOption('trigger') === 'click') {
            this._element.addEventListener('click', function () { return _this._toggle(); });
        }
        if (this._getOption('trigger') === 'focus') {
            this._element.addEventListener('focus', function () { return _this._toggle(); });
            this._element.addEventListener('blur', function () { return _this._hide(); });
        }
        if (this._getOption('trigger') === 'hover') {
            this._element.addEventListener('mouseenter', function () { return _this._show(); });
            this._element.addEventListener('mouseleave', function () { return _this._hide(); });
        }
    };
    KTTooltip.prototype._show = function () {
        var _this = this;
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        if (this._isOpen)
            return;
        this._timeout = setTimeout(function () {
            var payload = { cancel: false };
            _this._fireEvent('show', payload);
            _this._dispatchEvent('show', payload);
            if (payload.cancel === true) {
                return;
            }
            if (!_this._targetElement || !_this._element) {
                return;
            }
            _this._createPopper();
            _this._handleContainer();
            _this._setZindex();
            _this._targetElement.classList.add('show');
            _this._targetElement.classList.remove(_this._getOption('hiddenClass'));
            _this._targetElement.style.opacity = '0';
            dom_1.default.reflow(_this._targetElement);
            _this._targetElement.style.opacity = '1';
            _this._transitioning = true;
            _this._isOpen = true;
            dom_1.default.transitionEnd(_this._targetElement, function () {
                if (_this._targetElement) {
                    _this._targetElement.style.opacity = '';
                }
                _this._transitioning = false;
                _this._fireEvent('shown');
                _this._dispatchEvent('shown');
            });
        }, this._getOption('delayShow'));
    };
    KTTooltip.prototype._hide = function () {
        var _this = this;
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        if (!this._isOpen)
            return;
        this._timeout = setTimeout(function () {
            var payload = { cancel: false };
            _this._fireEvent('hide', payload);
            _this._dispatchEvent('hide', payload);
            if (payload.cancel === true) {
                return;
            }
            if (!_this._targetElement) {
                return;
            }
            _this._targetElement.style.opacity = '1';
            dom_1.default.reflow(_this._targetElement);
            _this._targetElement.style.opacity = '0';
            _this._transitioning = true;
            _this._isOpen = false;
            dom_1.default.transitionEnd(_this._targetElement, function () {
                if (_this._popper) {
                    _this._popper.destroy();
                    _this._popper = null;
                }
                if (_this._targetElement) {
                    _this._targetElement.classList.remove('show');
                    _this._targetElement.classList.add(_this._getOption('hiddenClass'));
                    _this._targetElement.style.opacity = '';
                }
                _this._transitioning = false;
                _this._fireEvent('hidden');
                _this._dispatchEvent('hidden');
            });
        }, this._getOption('delayHide'));
    };
    KTTooltip.prototype._toggle = function () {
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._isOpen) {
            this._hide();
        }
        else {
            this._show();
        }
    };
    KTTooltip.prototype._createPopper = function () {
        if (!this._element || !this._targetElement)
            return;
        var isRtl = dom_1.default.isRTL();
        // Placement
        var placement = this._getOption('placement');
        if (isRtl && this._getOption('placementRtl')) {
            placement = this._getOption('placementRtl');
        }
        // Offset
        var offsetValue = this._getOption('offset');
        if (isRtl && this._getOption('offsetRtl')) {
            offsetValue = this._getOption('offsetRtl');
        }
        var offset = offsetValue
            ? offsetValue
                .toString()
                .split(',')
                .map(function (value) { return parseInt(value.trim(), 10); })
            : [0, 0];
        if (!this._targetElement) {
            return;
        }
        this._popper = (0, core_1.createPopper)(this._element, this._targetElement, {
            placement: placement,
            strategy: this._getOption('strategy'),
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: offset,
                    },
                },
            ],
        });
    };
    KTTooltip.prototype._handleContainer = function () {
        var container = this._getOption('container');
        if (container) {
            if (container === 'body') {
                if (this._targetElement) {
                    document.body.appendChild(this._targetElement);
                }
            }
            else {
                var containerElement = dom_1.default.getElement(container);
                if (containerElement && this._targetElement) {
                    containerElement.appendChild(this._targetElement);
                }
            }
        }
    };
    KTTooltip.prototype._setZindex = function () {
        if (!this._element || !this._targetElement)
            return;
        var zindex = parseInt(this._getOption('zindex'));
        var elementZindex = dom_1.default.getCssProp(this._element, 'z-index');
        if (elementZindex && parseInt(elementZindex) > zindex) {
            zindex = parseInt(elementZindex);
        }
        var highestZindex = dom_1.default.getHighestZindex(this._element);
        if (highestZindex && highestZindex > zindex) {
            zindex = highestZindex + 1;
        }
        this._targetElement.style.zIndex = String(zindex);
    };
    KTTooltip.prototype.show = function () {
        this._show();
    };
    KTTooltip.prototype.hide = function () {
        this._hide();
    };
    KTTooltip.prototype.toggle = function () {
        this._toggle();
    };
    KTTooltip.prototype.getContentElement = function () {
        return this._targetElement;
    };
    KTTooltip.prototype.isOpen = function () {
        return this._isOpen;
    };
    KTTooltip.prototype.getTriggerOption = function () {
        return this._getOption('trigger');
    };
    KTTooltip.prototype.isPermanent = function () {
        return this._getOption('permanent');
    };
    KTTooltip.initHandlers = function () {
        document.addEventListener('click', function (event) {
            document
                .querySelectorAll('[data-kt-tooltip-initialized]')
                .forEach(function (tooltipElement) {
                var tooltip = KTTooltip.getInstance(tooltipElement);
                if (tooltip &&
                    tooltip.isOpen() &&
                    tooltip.getTriggerOption() !== 'hover' &&
                    !tooltip.isPermanent()) {
                    var contentElement = tooltip.getContentElement();
                    if (contentElement &&
                        (contentElement === event.target ||
                            contentElement.contains(event.target))) {
                        return;
                    }
                    else if (tooltip) {
                        tooltip.hide();
                    }
                }
            });
        });
    };
    KTTooltip.getInstance = function (element) {
        if (data_1.default.has(element, 'tooltip')) {
            return data_1.default.get(element, 'tooltip');
        }
        else {
            return null;
        }
    };
    KTTooltip.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTTooltip(element, config);
    };
    KTTooltip.createInstances = function () {
        document.querySelectorAll('[data-kt-tooltip]').forEach(function (element) {
            new KTTooltip(element);
        });
    };
    KTTooltip.init = function () {
        KTTooltip.createInstances();
        if (window.KT_TOOLTIP_INITIALIZED !== true) {
            KTTooltip.initHandlers();
            window.KT_TOOLTIP_INITIALIZED = true;
        }
    };
    return KTTooltip;
}(component_1.default));
exports.KTTooltip = KTTooltip;
if (typeof window !== 'undefined') {
    window.KTTooltip = KTTooltip;
}
//# sourceMappingURL=tooltip.js.map