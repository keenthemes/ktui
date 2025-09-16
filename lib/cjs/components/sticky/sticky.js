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
exports.KTSticky = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var utils_1 = require("../../helpers/utils");
var component_1 = require("../component");
var KTSticky = /** @class */ (function (_super) {
    __extends(KTSticky, _super);
    function KTSticky(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'sticky';
        _this._defaultConfig = {
            target: 'body',
            name: '',
            class: '',
            top: '',
            middle: false,
            bottom: '',
            start: '',
            center: false,
            end: '',
            width: '',
            zindex: '',
            offset: 0,
            reverse: false,
            release: '',
            activate: '',
        };
        _this._config = _this._defaultConfig;
        _this._targetElement = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._releaseElement = dom_1.default.getElement(_this._getOption('release'));
        _this._activateElement = dom_1.default.getElement(_this._getOption('activate'));
        _this._wrapperElement = _this._element.closest('[data-kt-sticky-wrapper]');
        _this._attributeRoot = "data-kt-sticky-".concat(_this._getOption('name'));
        _this._eventTriggerState = true;
        _this._lastScrollTop = 0;
        var targetElement = _this._getTarget() === 'body'
            ? document
            : dom_1.default.getElement(_this._getTarget());
        if (!targetElement)
            return _this;
        _this._targetElement = targetElement;
        _this._handlers();
        _this._process();
        _this._update();
        return _this;
    }
    KTSticky.prototype._getTarget = function () {
        return (this._element.getAttribute('data-kt-sticky-target') ||
            this._getOption('target'));
    };
    KTSticky.prototype._handlers = function () {
        var _this = this;
        window.addEventListener('resize', function () {
            var timer;
            utils_1.default.throttle(timer, function () {
                _this._update();
            }, 200);
        });
        this._targetElement.addEventListener('scroll', function () {
            _this._process();
        });
    };
    KTSticky.prototype._process = function () {
        var reverse = this._getOption('reverse');
        var offset = this._getOffset();
        if (offset < 0) {
            this._disable();
            return;
        }
        var st = this._getTarget() === 'body'
            ? dom_1.default.getScrollTop()
            : this._targetElement.scrollTop;
        var release = this._releaseElement && dom_1.default.isPartiallyInViewport(this._releaseElement);
        // Release on reverse scroll mode
        if (reverse === true) {
            // Forward scroll mode
            if (st > offset && !release) {
                if (document.body.hasAttribute(this._attributeRoot) === false) {
                    if (this._enable() === false) {
                        return;
                    }
                    document.body.setAttribute(this._attributeRoot, 'on');
                }
                if (this._eventTriggerState === true) {
                    var payload = { active: true };
                    this._fireEvent('change', payload);
                    this._dispatchEvent('change', payload);
                    this._eventTriggerState = false;
                }
                // Back scroll mode
            }
            else {
                if (document.body.hasAttribute(this._attributeRoot) === true) {
                    this._disable();
                    if (release) {
                        this._element.classList.add('release');
                    }
                    document.body.removeAttribute(this._attributeRoot);
                }
                if (this._eventTriggerState === false) {
                    var payload = { active: false };
                    this._fireEvent('change', payload);
                    this._dispatchEvent('change', payload);
                    this._eventTriggerState = true;
                }
            }
            this._lastScrollTop = st;
            // Classic scroll mode
        }
        else {
            // Forward scroll mode
            if (st > offset && !release) {
                if (document.body.hasAttribute(this._attributeRoot) === false) {
                    if (this._enable() === false) {
                        return;
                    }
                    document.body.setAttribute(this._attributeRoot, 'on');
                }
                if (this._eventTriggerState === true) {
                    var payload = { active: true };
                    this._fireEvent('change', payload);
                    this._dispatchEvent('change', payload);
                    this._eventTriggerState = false;
                }
                // Back scroll mode
            }
            else {
                // back scroll mode
                if (document.body.hasAttribute(this._attributeRoot) === true) {
                    this._disable();
                    if (release) {
                        this._element.classList.add('release');
                    }
                    document.body.removeAttribute(this._attributeRoot);
                }
                if (this._eventTriggerState === false) {
                    var payload = { active: false };
                    this._fireEvent('change', payload);
                    this._dispatchEvent('change', payload);
                    this._eventTriggerState = true;
                }
            }
        }
    };
    KTSticky.prototype._getOffset = function () {
        var offset = parseInt(this._getOption('offset'));
        var activateElement = dom_1.default.getElement(this._getOption('activate'));
        if (activateElement) {
            offset = Math.abs(offset - activateElement.offsetTop);
        }
        return offset;
    };
    KTSticky.prototype._enable = function () {
        if (!this._element)
            return false;
        var width = this._getOption('width');
        var top = this._getOption('top');
        var middle = this._getOption('middle');
        var bottom = this._getOption('bottom');
        var start = this._getOption('start');
        var center = this._getOption('center');
        var end = this._getOption('end');
        var height = this._calculateHeight();
        var zindex = this._getOption('zindex');
        var classList = this._getOption('class');
        if (height + parseInt(top) > dom_1.default.getViewPort().height) {
            return false;
        }
        if (width) {
            var targetElement = document.querySelector(width);
            if (targetElement) {
                width = dom_1.default.getCssProp(targetElement, 'width');
            }
            else if (width == 'auto') {
                width = dom_1.default.getCssProp(this._element, 'width');
            }
            this._element.style.width = "".concat(Math.round(parseFloat(width)), "px");
        }
        if (middle === true) {
            this._element.style.insetBlockStart = "50%";
        }
        else {
            if (top) {
                if (top === 'auto') {
                    this._element.style.insetBlockStart = "0px";
                }
                else {
                    this._element.style.insetBlockStart = "".concat(top, "px");
                }
            }
            else {
                if (bottom) {
                    if (bottom === 'auto') {
                        this._element.style.insetBlockEnd = "0px";
                    }
                    else {
                        this._element.style.insetBlockEnd = "".concat(bottom, "px");
                    }
                }
            }
        }
        if (center === true) {
            this._element.style.insetInlineStart = "50%";
        }
        else {
            if (start) {
                if (start === 'auto') {
                    var offsetLeft = dom_1.default.offset(this._element).left;
                    if (offsetLeft >= 0) {
                        this._element.style.insetInlineStart = "".concat(offsetLeft, "px");
                    }
                }
                else {
                    this._element.style.insetInlineStart = "".concat(start, "px");
                }
            }
            else {
                if (end) {
                    if (end === 'auto') {
                        var offsetRight = dom_1.default.offset(this._element).right;
                        if (offsetRight >= 0) {
                            this._element.style.insetInlineEnd = "".concat(offsetRight, "px");
                        }
                    }
                    else {
                        this._element.style.insetInlineEnd = "".concat(end, "px");
                    }
                }
            }
        }
        if (zindex) {
            this._element.style.zIndex = zindex;
            this._element.style.position = 'fixed';
        }
        if (classList) {
            dom_1.default.addClass(this._element, classList);
        }
        if (this._wrapperElement) {
            this._wrapperElement.style.height = "".concat(height, "px");
        }
        this._element.classList.add('active');
        this._element.classList.remove('release');
        return true;
    };
    KTSticky.prototype._disable = function () {
        if (!this._element)
            return;
        this._element.style.top = '';
        this._element.style.bottom = '';
        this._element.style.insetInlineStart = '';
        this._element.style.insetInlineEnd = '';
        this._element.style.insetBlockStart = '';
        this._element.style.insetBlockEnd = '';
        this._element.style.width = '';
        this._element.style.left = '';
        this._element.style.right = '';
        this._element.style.zIndex = '';
        this._element.style.position = '';
        var classList = this._getOption('class');
        if (this._wrapperElement) {
            this._wrapperElement.style.height = '';
        }
        if (classList) {
            dom_1.default.removeClass(this._element, classList);
        }
        this._element.classList.remove('active');
    };
    KTSticky.prototype._update = function () {
        if (this._isActive()) {
            this._disable();
            this._enable();
        }
        else {
            this._disable();
        }
    };
    KTSticky.prototype._calculateHeight = function () {
        if (!this._element)
            return 0;
        var height = parseFloat(dom_1.default.getCssProp(this._element, 'height'));
        height += parseFloat(dom_1.default.getCssProp(this._element, 'margin-top'));
        height += parseFloat(dom_1.default.getCssProp(this._element, 'margin-bottom'));
        if (dom_1.default.getCssProp(this._element, 'border-top')) {
            height =
                height + parseFloat(dom_1.default.getCssProp(this._element, 'border-top'));
        }
        if (dom_1.default.getCssProp(this._element, 'border-bottom')) {
            height =
                height + parseFloat(dom_1.default.getCssProp(this._element, 'border-bottom'));
        }
        return height;
    };
    KTSticky.prototype._isActive = function () {
        return this._element.classList.contains('active');
    };
    KTSticky.prototype.update = function () {
        this._update();
    };
    KTSticky.prototype.isActive = function () {
        return this._isActive();
    };
    KTSticky.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'sticky')) {
            return data_1.default.get(element, 'sticky');
        }
        if (element.getAttribute('data-kt-sticky')) {
            return new KTSticky(element);
        }
        return null;
    };
    KTSticky.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTSticky(element, config);
    };
    KTSticky.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-sticky]');
        elements.forEach(function (element) {
            new KTSticky(element);
        });
    };
    KTSticky.init = function () {
        KTSticky.createInstances();
    };
    return KTSticky;
}(component_1.default));
exports.KTSticky = KTSticky;
if (typeof window !== 'undefined') {
    window.KTSticky = KTSticky;
}
//# sourceMappingURL=sticky.js.map