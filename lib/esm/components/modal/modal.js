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
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
var KTModal = /** @class */ (function (_super) {
    __extends(KTModal, _super);
    function KTModal(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'modal';
        _this._defaultConfig = {
            zindex: '90',
            backdrop: true,
            backdropClass: 'transition-all duration-300 fixed inset-0 bg-gray-900 opacity-25',
            backdropStatic: false,
            keyboard: true,
            disableScroll: true,
            persistent: false,
            focus: true,
            hiddenClass: 'hidden'
        };
        _this._config = _this._defaultConfig;
        _this._isOpen = false;
        _this._isTransitioning = false;
        _this._backdropElement = null;
        _this._targetElement = null;
        if (KTData.has(element, _this._name))
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
        //const beforeScroll = this.fireEvent('beforeScroll', this.el);
        //this.dispatch('beforeScroll.hs.scrollspy', this.el, this.el);
        //if (beforeScroll instanceof Promise) beforeScroll.then(() => scrollFn());
        //else scrollFn();
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
        KTDom.reflow(this._element);
        this._element.classList.add('open');
        this._element.classList.remove(this._getOption('hiddenClass'));
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
            _this._element.style.display = '';
            _this._element.classList.add(_this._getOption('hiddenClass'));
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTModal.prototype._setZindex = function () {
        var zindex = parseInt(this._getOption('zindex'));
        if (parseInt(KTDom.getCssProp(this._element, 'z-index')) > zindex) {
            zindex = parseInt(KTDom.getCssProp(this._element, 'z-index'));
        }
        if (KTDom.getHighestZindex(this._element) > zindex) {
            zindex = KTDom.getHighestZindex(this._element) + 1;
        }
        this._element.style.zIndex = String(zindex);
    };
    KTModal.prototype._autoFocus = function () {
        if (!this._element)
            return;
        var input = this._element.querySelector('[data-modal-input-focus]');
        if (!input)
            return;
        else
            input.focus();
    };
    KTModal.prototype._createBackdrop = function () {
        if (!this._element)
            return;
        var zindex = parseInt(KTDom.getCssProp(this._element, 'z-index'));
        this._backdropElement = document.createElement('DIV');
        this._backdropElement.style.zIndex = (zindex - 1).toString();
        this._backdropElement.classList.add('modal-backdrop');
        document.body.append(this._backdropElement);
        KTDom.reflow(this._backdropElement);
        KTDom.addClass(this._backdropElement, this._getOption('backdropClass'));
    };
    KTModal.prototype._deleteBackdrop = function () {
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
        if (KTData.has(element, 'modal')) {
            return KTData.get(element, 'modal');
        }
        if (element.getAttribute('data-modal') === "true") {
            return new KTModal(element);
        }
        return null;
    };
    KTModal.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTModal(element, config);
    };
    KTModal.hide = function () {
        var elements = document.querySelectorAll('[data-modal]');
        elements.forEach(function (element) {
            var modal = KTModal.getInstance(element);
            if (modal && modal.isOpen()) {
                modal.hide();
            }
        });
    };
    KTModal.handleToggle = function () {
        KTEventHandler.on(document.body, '[data-modal-toggle]', 'click', function (event, target) {
            event.stopPropagation();
            var selector = target.getAttribute("data-modal-toggle");
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
        KTEventHandler.on(document.body, '[data-modal-dismiss]', 'click', function (event, target) {
            event.stopPropagation();
            var modalElement = target.closest('[data-modal]');
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
            var modalElement = document.querySelector('.open[data-modal]');
            if (!modalElement)
                return;
            var modal = KTModal.getInstance(modalElement);
            if (!modal)
                return;
            if (modal.getOption('persistent'))
                return;
            if (modal.getOption('backdrop'))
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
            var modalElement = document.querySelector('.open[data-modal]');
            var modal = KTModal.getInstance(modalElement);
            if (!modal) {
                return;
            }
            // if esc key was not pressed in combination with ctrl or alt or shift
            if (event.key === 'Escape' && !(event.ctrlKey || event.altKey || event.shiftKey)) {
                modal.hide();
            }
            if (event.code === 'Tab' && !event.metaKey) {
                return;
            }
        });
    };
    KTModal.createInstances = function () {
        var elements = document.querySelectorAll('[data-modal="true"]');
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
}(KTComponent));
export { KTModal };
//# sourceMappingURL=modal.js.map