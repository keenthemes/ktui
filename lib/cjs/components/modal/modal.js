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
exports.KTModal = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var event_handler_1 = require("../../helpers/event-handler");
var utils_1 = require("../../helpers/utils");
var component_1 = require("../component");
var KTModal = /** @class */ (function (_super) {
    __extends(KTModal, _super);
    function KTModal(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'modal';
        _this._defaultConfig = {
            zindex: '90',
            backdrop: true,
            backdropClass: 'kt-modal-backdrop',
            backdropStatic: false,
            keyboard: true,
            disableScroll: true,
            persistent: false,
            focus: true,
            hiddenClass: 'hidden',
        };
        _this._config = _this._defaultConfig;
        _this._isOpen = false;
        _this._isTransitioning = false;
        _this._backdropElement = null;
        _this._targetElement = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._handlers();
        return _this;
    }
    KTModal.prototype._handlers = function () {
        var _this = this;
        this._element.addEventListener('click', function (event) {
            if (_this._element !== event.target)
                return;
            if (_this._getOption('backdropStatic') === false) {
                _this._hide();
            }
        });
    };
    KTModal.prototype._toggle = function (targetElement) {
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
            this._show(targetElement);
        }
    };
    KTModal.prototype._show = function (targetElement) {
        var _this = this;
        if (this._isOpen || this._isTransitioning) {
            return;
        }
        if (targetElement)
            this._targetElement = targetElement;
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel === true) {
            return;
        }
        KTModal.hide();
        if (!this._element)
            return;
        this._isTransitioning = true;
        this._element.setAttribute('role', 'dialog');
        this._element.setAttribute('aria-modal', 'true');
        this._element.setAttribute('tabindex', '-1');
        this._setZindex();
        if (this._getOption('backdrop') === true)
            this._createBackdrop();
        if (this._getOption('disableScroll')) {
            document.body.style.overflow = 'hidden';
        }
        this._element.style.display = 'block';
        dom_1.default.reflow(this._element);
        this._element.classList.add('open');
        this._element.classList.remove(this._getOption('hiddenClass'));
        dom_1.default.transitionEnd(this._element, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            if (_this._getOption('focus') === true) {
                _this._autoFocus();
            }
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTModal.prototype._hide = function () {
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
        dom_1.default.reflow(this._element);
        this._element.classList.remove('open');
        if (this._getOption('backdrop') === true) {
            this._deleteBackdrop();
        }
        dom_1.default.transitionEnd(this._element, function () {
            if (!_this._element)
                return;
            _this._isTransitioning = false;
            _this._isOpen = false;
            _this._element.style.display = '';
            _this._element.classList.add(_this._getOption('hiddenClass'));
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTModal.prototype._setZindex = function () {
        var zindex = parseInt(this._getOption('zindex'));
        if (parseInt(dom_1.default.getCssProp(this._element, 'z-index')) > zindex) {
            zindex = parseInt(dom_1.default.getCssProp(this._element, 'z-index'));
        }
        if (dom_1.default.getHighestZindex(this._element) > zindex) {
            zindex = dom_1.default.getHighestZindex(this._element) + 1;
        }
        this._element.style.zIndex = String(zindex);
    };
    KTModal.prototype._autoFocus = function () {
        if (!this._element)
            return;
        var input = this._element.querySelector('[data-kt-modal-input-focus]');
        if (!input)
            return;
        else
            input.focus();
    };
    KTModal.prototype._createBackdrop = function () {
        if (!this._element)
            return;
        var zindex = parseInt(dom_1.default.getCssProp(this._element, 'z-index'));
        this._backdropElement = document.createElement('DIV');
        this._backdropElement.setAttribute('data-kt-modal-backdrop', 'true');
        this._backdropElement.style.zIndex = (zindex - 1).toString();
        document.body.append(this._backdropElement);
        dom_1.default.reflow(this._backdropElement);
        dom_1.default.addClass(this._backdropElement, this._getOption('backdropClass'));
    };
    KTModal.prototype._deleteBackdrop = function () {
        var _this = this;
        if (!this._backdropElement)
            return;
        dom_1.default.reflow(this._backdropElement);
        this._backdropElement.style.opacity = '0';
        dom_1.default.transitionEnd(this._backdropElement, function () {
            if (!_this._backdropElement)
                return;
            dom_1.default.remove(_this._backdropElement);
        });
    };
    KTModal.prototype.toggle = function (targetElement) {
        return this._toggle(targetElement);
    };
    KTModal.prototype.show = function (targetElement) {
        return this._show(targetElement);
    };
    KTModal.prototype.hide = function () {
        return this._hide();
    };
    KTModal.prototype.getTargetElement = function () {
        return this._targetElement;
    };
    KTModal.prototype.isOpen = function () {
        return this._isOpen;
    };
    KTModal.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'modal')) {
            return data_1.default.get(element, 'modal');
        }
        if (element.getAttribute('data-kt-modal')) {
            return new KTModal(element);
        }
        return null;
    };
    KTModal.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTModal(element, config);
    };
    KTModal.hide = function () {
        var elements = document.querySelectorAll('[data-kt-modal-initialized]');
        elements.forEach(function (element) {
            var modal = KTModal.getInstance(element);
            if (modal && modal.isOpen()) {
                modal.hide();
            }
        });
    };
    KTModal.handleToggle = function () {
        event_handler_1.default.on(document.body, '[data-kt-modal-toggle]', 'click', function (event, target) {
            event.stopPropagation();
            var selector = target.getAttribute('data-kt-modal-toggle');
            if (!selector)
                return;
            var modalElement = document.querySelector(selector);
            var modal = KTModal.getInstance(modalElement);
            if (modal) {
                modal.toggle(target);
            }
        });
    };
    KTModal.handleDismiss = function () {
        event_handler_1.default.on(document.body, '[data-kt-modal-dismiss]', 'click', function (event, target) {
            event.stopPropagation();
            var modalElement = target.closest('[data-kt-modal-initialized]');
            if (modalElement) {
                var modal = KTModal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        });
    };
    KTModal.handleClickAway = function () {
        document.addEventListener('click', function (event) {
            var modalElement = document.querySelector('.open[data-kt-modal-initialized]');
            if (!modalElement)
                return;
            var modal = KTModal.getInstance(modalElement);
            if (!modal)
                return;
            if (utils_1.default.stringToBoolean(modal.getOption('persistent')) === true)
                return;
            if (utils_1.default.stringToBoolean(modal.getOption('backdrop')) === true)
                return;
            if (modalElement !== event.target &&
                modal.getTargetElement() !== event.target &&
                modalElement.contains(event.target) === false) {
                modal.hide();
            }
        });
    };
    KTModal.handleKeyword = function () {
        document.addEventListener('keydown', function (event) {
            var modalElement = document.querySelector('.open[data-kt-modal-initialized]');
            var modal = KTModal.getInstance(modalElement);
            if (!modal) {
                return;
            }
            // if esc key was not pressed in combination with ctrl or alt or shift
            if (event.key === 'Escape' &&
                !(event.ctrlKey || event.altKey || event.shiftKey)) {
                modal.hide();
            }
            if (event.code === 'Tab' && !event.metaKey) {
                return;
            }
        });
    };
    KTModal.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-modal]');
        elements.forEach(function (element) {
            new KTModal(element);
        });
    };
    KTModal.init = function () {
        KTModal.createInstances();
        if (window.KT_MODAL_INITIALIZED !== true) {
            KTModal.handleToggle();
            KTModal.handleDismiss();
            KTModal.handleClickAway();
            KTModal.handleKeyword();
            window.KT_MODAL_INITIALIZED = true;
        }
    };
    return KTModal;
}(component_1.default));
exports.KTModal = KTModal;
if (typeof window !== 'undefined') {
    window.KTModal = KTModal;
}
//# sourceMappingURL=modal.js.map