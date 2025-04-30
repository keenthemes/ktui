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
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
var KTDrawer = /** @class */ (function (_super) {
    __extends(KTDrawer, _super);
    function KTDrawer(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'drawer';
        _this._defaultConfig = {
            zindex: '100',
            enable: true,
            class: '',
            hiddenClass: 'hidden',
            backdrop: true,
            backdropClass: 'transition-all duration-300 fixed inset-0 bg-gray-900 opacity-25',
            backdropStatic: false,
            keyboard: true,
            disableScroll: true,
            persistent: false,
            focus: true
        };
        _this._config = _this._defaultConfig;
        _this._isOpen = false;
        _this._isTransitioning = false;
        _this._backdropElement = null;
        _this._relatedTarget = null;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._handleClose();
        _this._update();
        return _this;
    }
    KTDrawer.prototype._handleClose = function () {
        var _this = this;
        if (!this._element)
            return;
        KTEventHandler.on(this._element, '[data-drawer-hide]', 'click', function () {
            _this._hide();
        });
    };
    KTDrawer.prototype._toggle = function (relatedTarget) {
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._isOpen === true) {
            this._hide();
        }
        else {
            this._show(relatedTarget);
        }
    };
    KTDrawer.prototype._show = function (relatedTarget) {
        var _this = this;
        if (this._isOpen || this._isTransitioning) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel === true) {
            return;
        }
        KTDrawer.hide();
        if (this._getOption('backdrop') === true)
            this._createBackdrop();
        if (relatedTarget)
            this._relatedTarget = relatedTarget;
        if (!this._element)
            return;
        this._isTransitioning = true;
        this._element.classList.remove(this._getOption('hiddenClass'));
        this._element.setAttribute('role', 'dialog');
        this._element.setAttribute('aria-modal', 'true');
        this._element.setAttribute('tabindex', '-1');
        var zindex = parseInt(this._getOption('zindex'));
        if (zindex > 0) {
            this._element.style.zIndex = "".concat(zindex);
        }
        if (this._getOption('disableScroll')) {
            document.body.style.overflow = 'hidden';
        }
        KTDom.reflow(this._element);
        this._element.classList.add('open');
        KTDom.transitionEnd(this._element, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            if (_this._getOption('focus') === true) {
                _this._autoFocus();
            }
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTDrawer.prototype._hide = function () {
        var _this = this;
        if (!this._element)
            return;
        if (this._isOpen === false || this._isTransitioning) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('hide', payload);
        this._dispatchEvent('hide', payload);
        if (payload.cancel === true) {
            return;
        }
        this._isTransitioning = true;
        this._element.removeAttribute('role');
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('tabindex');
        if (this._getOption('disableScroll')) {
            document.body.style.overflow = '';
        }
        KTDom.reflow(this._element);
        this._element.classList.remove('open');
        if (this._getOption('backdrop') === true) {
            this._deleteBackdrop();
        }
        KTDom.transitionEnd(this._element, function () {
            if (!_this._element)
                return;
            _this._isTransitioning = false;
            _this._isOpen = false;
            _this._element.classList.add(_this._getOption('hiddenClass'));
            _this._element.style.zIndex = '';
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTDrawer.prototype._update = function () {
        if (this._getOption('class').length > 0) {
            if (this.isEnabled()) {
                KTDom.addClass(this._element, this._getOption('class'));
            }
            else {
                KTDom.removeClass(this._element, this._getOption('class'));
            }
        }
    };
    KTDrawer.prototype._autoFocus = function () {
        if (!this._element)
            return;
        var input = this._element.querySelector('[data-drawer-focus]');
        if (!input)
            return;
        else
            input.focus();
    };
    KTDrawer.prototype._createBackdrop = function () {
        var _this = this;
        if (!this._element)
            return;
        var zindex = parseInt(this._getOption('zindex'));
        this._backdropElement = document.createElement('DIV');
        this._backdropElement.style.zIndex = (zindex - 1).toString();
        this._backdropElement.classList.add('drawer-backdrop');
        document.body.append(this._backdropElement);
        KTDom.reflow(this._backdropElement);
        KTDom.addClass(this._backdropElement, this._getOption('backdropClass'));
        this._backdropElement.addEventListener('click', function (event) {
            event.preventDefault();
            if (_this._getOption('backdropStatic') === false) {
                _this._hide();
            }
        });
    };
    KTDrawer.prototype._deleteBackdrop = function () {
        var _this = this;
        if (!this._backdropElement)
            return;
        KTDom.reflow(this._backdropElement);
        this._backdropElement.style.opacity = "0";
        KTDom.transitionEnd(this._backdropElement, function () {
            if (!_this._backdropElement)
                return;
            KTDom.remove(_this._backdropElement);
        });
    };
    KTDrawer.prototype._isEnabled = function () {
        return this._getOption('enable');
    };
    KTDrawer.prototype.toggle = function () {
        return this._toggle();
    };
    KTDrawer.prototype.show = function (relatedTarget) {
        return this._show(relatedTarget);
    };
    KTDrawer.prototype.hide = function () {
        return this._hide();
    };
    KTDrawer.prototype.update = function () {
        return this._update();
    };
    KTDrawer.prototype.getRelatedTarget = function () {
        return this._relatedTarget;
    };
    KTDrawer.prototype.isOpen = function () {
        return this._isOpen;
    };
    KTDrawer.prototype.isEnabled = function () {
        return this._isEnabled();
    };
    KTDrawer.getInstance = function (element) {
        if (!element)
            return null;
        if (KTData.has(element, 'drawer')) {
            return KTData.get(element, 'drawer');
        }
        if (element.getAttribute('data-drawer') === "true") {
            return new KTDrawer(element);
        }
        return null;
    };
    KTDrawer.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTDrawer(element, config);
    };
    KTDrawer.hide = function () {
        var elements = document.querySelectorAll('[data-drawer]');
        elements.forEach(function (element) {
            var drawer = KTDrawer.getInstance(element);
            if (drawer && drawer.isOpen()) {
                drawer.hide();
            }
        });
    };
    KTDrawer.handleResize = function () {
        window.addEventListener('resize', function () {
            var timer;
            KTUtils.throttle(timer, function () {
                document.querySelectorAll('[data-drawer]').forEach(function (element) {
                    var drawer = KTDrawer.getInstance(element);
                    drawer.update();
                    if (drawer && drawer.isOpen() && !drawer.isEnabled()) {
                        drawer.hide();
                    }
                });
            }, 200);
        });
    };
    KTDrawer.handleToggle = function () {
        KTEventHandler.on(document.body, '[data-drawer-toggle]', 'click', function (event, target) {
            event.stopPropagation();
            var selector = target.getAttribute("data-drawer-toggle");
            if (!selector)
                return;
            var drawerElement = document.querySelector(selector);
            var drawer = KTDrawer.getInstance(drawerElement);
            if (drawer) {
                drawer.toggle();
            }
        });
    };
    KTDrawer.handleDismiss = function () {
        KTEventHandler.on(document.body, '[data-drawer-dismiss]', 'click', function (event, target) {
            event.stopPropagation();
            var modalElement = target.closest('[data-drawer="true"]');
            if (modalElement) {
                var modal = KTDrawer.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        });
    };
    KTDrawer.handleClickAway = function () {
        document.addEventListener('click', function (event) {
            var drawerElement = document.querySelector('.open[data-drawer]');
            if (!drawerElement)
                return;
            var drawer = KTDrawer.getInstance(drawerElement);
            if (!drawer)
                return;
            if (drawer.getOption('persistent'))
                return;
            if (drawer.getOption('backdrop'))
                return;
            if (drawerElement !== event.target &&
                drawer.getRelatedTarget() !== event.target &&
                drawerElement.contains(event.target) === false) {
                drawer.hide();
            }
        });
    };
    KTDrawer.handleKeyword = function () {
        document.addEventListener('keydown', function (event) {
            var drawerElement = document.querySelector('.open[data-drawer]');
            var drawer = KTDrawer.getInstance(drawerElement);
            if (!drawer) {
                return;
            }
            // if esc key was not pressed in combination with ctrl or alt or shift
            if (event.key === 'Escape' && !(event.ctrlKey || event.altKey || event.shiftKey)) {
                drawer.hide();
            }
            if (event.code === 'Tab' && !event.metaKey) {
                return;
            }
        });
    };
    KTDrawer.createInstances = function () {
        var elements = document.querySelectorAll('[data-drawer="true"]');
        elements.forEach(function (element) {
            new KTDrawer(element);
        });
    };
    KTDrawer.init = function () {
        KTDrawer.createInstances();
        if (window.KT_DRAWER_INITIALIZED !== true) {
            KTDrawer.handleToggle();
            KTDrawer.handleDismiss();
            KTDrawer.handleResize();
            KTDrawer.handleClickAway();
            KTDrawer.handleKeyword();
            window.KT_DRAWER_INITIALIZED = true;
        }
    };
    return KTDrawer;
}(KTComponent));
export { KTDrawer };
//# sourceMappingURL=drawer.js.map