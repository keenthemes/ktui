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
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTComponent from '../component';
var KTSticky = /** @class */ (function (_super) {
    __extends(KTSticky, _super);
    function KTSticky(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'sticky';
        _this._defaultConfig = {
            name: '',
            class: '',
            top: '',
            left: '',
            right: '',
            width: '',
            zindex: '',
            offset: 0,
            reverse: false,
            release: '',
            activate: ''
        };
        _this._config = _this._defaultConfig;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._releaseElement = KTDom.getElement(_this._getOption('release'));
        _this._wrapperElement = _this._element.closest('[data-sticky-wrapper]');
        _this._attributeRoot = "data-sticky-".concat(_this._getOption('name'));
        _this._eventTriggerState = true;
        _this._lastScrollTop = 0;
        _this._handlers();
        _this._process();
        _this._update();
        return _this;
    }
    KTSticky.prototype._handlers = function () {
        var _this = this;
        window.addEventListener('resize', function () {
            var timer;
            KTUtils.throttle(timer, function () {
                _this._update();
            }, 200);
        });
        window.addEventListener('scroll', function () {
            _this._process();
        });
    };
    KTSticky.prototype._process = function () {
        var reverse = this._getOption('reverse');
        var activateOffset = this._getActivateOffset();
        var releaseOffset = this._getReleaseOffset();
        if (activateOffset < 0) {
            this._disable();
            return;
        }
        var st = KTDom.getScrollTop();
        var proceed = (!this._releaseElement || releaseOffset > st);
        // Release on reverse scroll mode
        if (reverse === true) {
            // Forward scroll mode
            if (st > activateOffset && proceed) {
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
            if (st > activateOffset && proceed) {
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
            else { // back scroll mode
                if (document.body.hasAttribute(this._attributeRoot) === true) {
                    this._disable();
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
    KTSticky.prototype._getActivateOffset = function () {
        var offset = parseInt(this._getOption('offset'));
        var activateElement = KTDom.getElement(this._getOption('activate'));
        if (activateElement) {
            offset = Math.abs(offset - activateElement.offsetTop);
        }
        return offset;
    };
    KTSticky.prototype._getReleaseOffset = function () {
        var offset = parseInt(this._getOption('offset'));
        if (this._releaseElement && this._releaseElement.offsetTop) {
            offset = Math.abs(offset - this._releaseElement.offsetTop);
        }
        return offset;
    };
    KTSticky.prototype._enable = function () {
        if (!this._element)
            return false;
        var width = this._getOption('width');
        var top = this._getOption('top');
        var left = this._getOption('left');
        var right = this._getOption('right');
        var height = this._calculateHeight();
        var zindex = this._getOption('zindex');
        var classList = this._getOption('class');
        if (height + parseInt(top) > KTDom.getViewPort().height) {
            return false;
        }
        if (width) {
            var targetElement = document.querySelector(width);
            if (targetElement) {
                width = KTDom.getCssProp(targetElement, 'width');
            }
            else if (width == 'auto') {
                width = KTDom.getCssProp(this._element, 'width');
            }
            this._element.style.width = "".concat(Math.round(parseFloat(width)), "px");
        }
        if (top) {
            this._element.style.top = "".concat(top, "px");
        }
        if (left) {
            if (left === 'auto') {
                var offsetLeft = KTDom.offset(this._element).left;
                if (offsetLeft >= 0) {
                    this._element.style.left = "".concat(offsetLeft, "px");
                }
            }
            else {
                this._element.style.left = "".concat(left, "px");
            }
        }
        if (right) {
            if (right === 'auto') {
                var offseRight = KTDom.offset(this._element).right;
                if (offseRight >= 0) {
                    this._element.style.right = "".concat(offseRight, "px");
                }
            }
            else {
                this._element.style.right = "".concat(right, "px");
            }
        }
        if (zindex) {
            this._element.style.zIndex = zindex;
            this._element.style.position = 'fixed';
        }
        if (classList) {
            KTDom.addClass(this._element, classList);
        }
        if (this._wrapperElement) {
            this._wrapperElement.style.height = "".concat(height, "px");
        }
        this._element.classList.add('active');
        return true;
    };
    KTSticky.prototype._disable = function () {
        if (!this._element)
            return;
        this._element.style.top = '';
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
            KTDom.removeClass(this._element, classList);
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
        var height = parseFloat(KTDom.getCssProp(this._element, 'height'));
        height += parseFloat(KTDom.getCssProp(this._element, 'margin-top'));
        height += parseFloat(KTDom.getCssProp(this._element, 'margin-bottom'));
        if (KTDom.getCssProp(this._element, 'border-top')) {
            height = height + parseFloat(KTDom.getCssProp(this._element, 'border-top'));
        }
        if (KTDom.getCssProp(this._element, 'border-bottom')) {
            height = height + parseFloat(KTDom.getCssProp(this._element, 'border-bottom'));
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
        if (KTData.has(element, 'sticky')) {
            return KTData.get(element, 'sticky');
        }
        if (element.getAttribute('data-sticky') === "true") {
            return new KTSticky(element);
        }
        return null;
    };
    KTSticky.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTSticky(element, config);
    };
    KTSticky.createInstances = function () {
        var elements = document.querySelectorAll('[data-sticky="true"]');
        elements.forEach(function (element) {
            new KTSticky(element);
        });
    };
    KTSticky.init = function () {
        KTSticky.createInstances();
    };
    return KTSticky;
}(KTComponent));
export { KTSticky };
//# sourceMappingURL=sticky.js.map