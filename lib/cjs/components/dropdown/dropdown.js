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
exports.KTDropdown = void 0;
var core_1 = require("@popperjs/core");
var dom_1 = require("../../helpers/dom");
var data_1 = require("../../helpers/data");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTDropdown = /** @class */ (function (_super) {
    __extends(KTDropdown, _super);
    function KTDropdown(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'dropdown';
        _this._defaultConfig = {
            zindex: 105,
            hoverTimeout: 200,
            placement: 'bottom-start',
            placementRtl: 'bottom-end',
            permanent: false,
            dismiss: false,
            keyboard: true,
            trigger: 'click',
            attach: '',
            offset: '0px, 5px',
            offsetRtl: '0px, 5px',
            hiddenClass: 'hidden',
            container: '',
        };
        _this._config = _this._defaultConfig;
        _this._disabled = false;
        _this._isTransitioning = false;
        _this._isOpen = false;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._toggleElement = _this._element.querySelector('[data-kt-dropdown-toggle]');
        if (!_this._toggleElement)
            return _this;
        _this._menuElement = _this._element.querySelector('[data-kt-dropdown-menu]');
        if (!_this._menuElement)
            return _this;
        data_1.default.set(_this._menuElement, 'dropdownElement', _this._element);
        _this._setupNestedDropdowns();
        _this._handleContainer();
        return _this;
    }
    KTDropdown.prototype._handleContainer = function () {
        var _a;
        if (this._getOption('container')) {
            if (this._getOption('container') === 'body') {
                document.body.appendChild(this._menuElement);
            }
            else {
                (_a = document
                    .querySelector(this._getOption('container'))) === null || _a === void 0 ? void 0 : _a.appendChild(this._menuElement);
            }
        }
    };
    KTDropdown.prototype._setupNestedDropdowns = function () {
        var subDropdowns = this._menuElement.querySelectorAll('[data-kt-dropdown-toggle]');
        subDropdowns.forEach(function (subToggle) {
            var _a;
            var subItem = subToggle.closest('[data-kt-dropdown-item]');
            var subMenu = (_a = subToggle
                .closest('.kt-menu-item')) === null || _a === void 0 ? void 0 : _a.querySelector('[data-kt-dropdown-menu]');
            if (subItem && subMenu) {
                new KTDropdown(subItem);
            }
        });
    };
    KTDropdown.prototype._click = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._disabled)
            return;
        if (this._getOption('trigger') !== 'click')
            return;
        this._toggle();
    };
    KTDropdown.prototype._mouseover = function (event) {
        if (this._disabled)
            return;
        if (this._getOption('trigger') !== 'hover')
            return;
        if (data_1.default.get(this._element, 'hover') === '1') {
            clearTimeout(data_1.default.get(this._element, 'timeout'));
            data_1.default.remove(this._element, 'hover');
            data_1.default.remove(this._element, 'timeout');
        }
        this._show();
    };
    KTDropdown.prototype._mouseout = function (event) {
        var _this = this;
        if (this._disabled)
            return;
        if (this._getOption('trigger') !== 'hover')
            return;
        var relatedTarget = event.relatedTarget;
        var isWithinDropdown = this._element.contains(relatedTarget);
        if (isWithinDropdown)
            return;
        var timeout = setTimeout(function () {
            if (data_1.default.get(_this._element, 'hover') === '1') {
                _this._hide();
            }
        }, parseInt(this._getOption('hoverTimeout')));
        data_1.default.set(this._element, 'hover', '1');
        data_1.default.set(this._element, 'timeout', timeout);
    };
    KTDropdown.prototype._toggle = function () {
        if (this._isOpen) {
            this._hide();
        }
        else {
            this._show();
        }
    };
    KTDropdown.prototype._show = function () {
        var _this = this;
        if (this._isOpen || this._isTransitioning)
            return;
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel)
            return;
        KTDropdown.hide(this._element);
        var zIndex = parseInt(this._getOption('zindex'));
        var parentZindex = dom_1.default.getHighestZindex(this._element);
        if (parentZindex !== null && parentZindex >= zIndex) {
            zIndex = parentZindex + 1;
        }
        if (zIndex > 0) {
            this._menuElement.style.zIndex = zIndex.toString();
        }
        this._menuElement.style.display = 'block';
        this._menuElement.style.opacity = '0';
        dom_1.default.reflow(this._menuElement);
        this._menuElement.style.opacity = '1';
        this._menuElement.classList.remove(this._getOption('hiddenClass'));
        this._toggleElement.classList.add('active');
        this._menuElement.classList.add('open');
        this._element.classList.add('open');
        this._initPopper();
        dom_1.default.transitionEnd(this._menuElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTDropdown.prototype._hide = function () {
        var _this = this;
        if (!this._isOpen || this._isTransitioning)
            return;
        var payload = { cancel: false };
        this._fireEvent('hide', payload);
        this._dispatchEvent('hide', payload);
        if (payload.cancel)
            return;
        this._menuElement.style.opacity = '1';
        dom_1.default.reflow(this._menuElement);
        this._menuElement.style.opacity = '0';
        this._menuElement.classList.remove('open');
        this._toggleElement.classList.remove('active');
        this._element.classList.remove('open');
        dom_1.default.transitionEnd(this._menuElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = false;
            _this._menuElement.classList.add(_this._getOption('hiddenClass'));
            _this._menuElement.style.display = '';
            _this._menuElement.style.zIndex = '';
            _this._destroyPopper();
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTDropdown.prototype._initPopper = function () {
        var isRtl = dom_1.default.isRTL();
        var reference;
        var attach = this._getOption('attach');
        if (attach) {
            reference =
                attach === 'parent'
                    ? this._toggleElement.parentNode
                    : document.querySelector(attach);
        }
        else {
            reference = this._toggleElement;
        }
        if (reference) {
            var popper = (0, core_1.createPopper)(reference, this._menuElement, this._getPopperConfig());
            data_1.default.set(this._element, 'popper', popper);
        }
    };
    KTDropdown.prototype._destroyPopper = function () {
        if (data_1.default.has(this._element, 'popper')) {
            data_1.default.get(this._element, 'popper').destroy();
            data_1.default.remove(this._element, 'popper');
        }
    };
    KTDropdown.prototype._isDropdownOpen = function () {
        return (this._element.classList.contains('open') &&
            this._menuElement.classList.contains('open'));
    };
    KTDropdown.prototype._getPopperConfig = function () {
        var isRtl = dom_1.default.isRTL();
        var placement = this._getOption('placement');
        if (isRtl && this._getOption('placementRtl')) {
            placement = this._getOption('placementRtl');
        }
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
        var strategy = this._getOption('overflow') === true ? 'absolute' : 'fixed';
        var altAxis = this._getOption('flip') !== false;
        return {
            placement: placement,
            strategy: strategy,
            modifiers: [
                {
                    name: 'offset',
                    options: { offset: offset },
                },
                {
                    name: 'preventOverflow',
                    options: { altAxis: altAxis },
                },
                {
                    name: 'flip',
                    options: { flipVariations: false },
                },
            ],
        };
    };
    KTDropdown.prototype._getToggleElement = function () {
        return this._toggleElement;
    };
    KTDropdown.prototype._getContentElement = function () {
        return this._menuElement;
    };
    // General Methods
    KTDropdown.prototype.click = function (event) {
        this._click(event);
    };
    KTDropdown.prototype.mouseover = function (event) {
        this._mouseover(event);
    };
    KTDropdown.prototype.mouseout = function (event) {
        this._mouseout(event);
    };
    KTDropdown.prototype.show = function () {
        this._show();
    };
    KTDropdown.prototype.hide = function () {
        this._hide();
    };
    KTDropdown.prototype.toggle = function () {
        this._toggle();
    };
    KTDropdown.prototype.getToggleElement = function () {
        return this._toggleElement;
    };
    KTDropdown.prototype.getContentElement = function () {
        return this._menuElement;
    };
    KTDropdown.prototype.isPermanent = function () {
        return this._getOption('permanent');
    };
    KTDropdown.prototype.disable = function () {
        this._disabled = true;
    };
    KTDropdown.prototype.enable = function () {
        this._disabled = false;
    };
    KTDropdown.prototype.isOpen = function () {
        return this._isDropdownOpen();
    };
    // Static Methods
    KTDropdown.getElement = function (reference) {
        if (reference && reference.hasAttribute('data-kt-dropdown-initialized'))
            return reference;
        var findElement = reference &&
            reference.closest('[data-kt-dropdown-initialized]');
        if (findElement)
            return findElement;
        if (reference &&
            reference.hasAttribute('data-kt-dropdown-menu') &&
            data_1.default.has(reference, 'dropdownElement')) {
            return data_1.default.get(reference, 'dropdownElement');
        }
        return null;
    };
    KTDropdown.getInstance = function (element) {
        element = this.getElement(element);
        if (!element)
            return null;
        if (data_1.default.has(element, 'dropdown')) {
            return data_1.default.get(element, 'dropdown');
        }
        if (element.getAttribute('data-kt-dropdown-initialized') === 'true') {
            return new KTDropdown(element);
        }
        return null;
    };
    KTDropdown.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTDropdown(element, config);
    };
    KTDropdown.update = function () {
        document
            .querySelectorAll('.open[data-kt-dropdown-initialized]')
            .forEach(function (item) {
            if (data_1.default.has(item, 'popper')) {
                data_1.default.get(item, 'popper').forceUpdate();
            }
        });
    };
    KTDropdown.hide = function (skipElement) {
        document
            .querySelectorAll('.open[data-kt-dropdown-initialized]:not([data-kt-dropdown-permanent="true"])')
            .forEach(function (item) {
            if (skipElement && (skipElement === item || item.contains(skipElement)))
                return;
            var dropdown = KTDropdown.getInstance(item);
            if (dropdown)
                dropdown.hide();
        });
    };
    KTDropdown.handleClickAway = function () {
        document.addEventListener('click', function (event) {
            document
                .querySelectorAll('.open[data-kt-dropdown-initialized]:not([data-kt-dropdown-permanent="true"])')
                .forEach(function (element) {
                var dropdown = KTDropdown.getInstance(element);
                if (!dropdown)
                    return;
                var contentElement = dropdown.getContentElement();
                var toggleElement = dropdown.getToggleElement();
                if (toggleElement === event.target ||
                    toggleElement.contains(event.target) ||
                    contentElement === event.target ||
                    contentElement.contains(event.target)) {
                    return;
                }
                dropdown.hide();
            });
        });
    };
    KTDropdown.handleKeyboard = function () {
        document.addEventListener('keydown', function (event) {
            var dropdownEl = document.querySelector('.open[data-kt-dropdown-initialized]');
            var dropdown = KTDropdown.getInstance(dropdownEl);
            if (!dropdown || !dropdown._getOption('keyboard'))
                return;
            if (event.key === 'Escape' &&
                !(event.ctrlKey || event.altKey || event.shiftKey)) {
                dropdown.hide();
            }
        });
    };
    KTDropdown.handleMouseover = function () {
        event_handler_1.default.on(document.body, '[data-kt-dropdown-toggle], [data-kt-dropdown-menu]', 'mouseover', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown && dropdown._getOption('trigger') === 'hover') {
                dropdown.mouseover(event);
            }
        });
    };
    KTDropdown.handleMouseout = function () {
        event_handler_1.default.on(document.body, '[data-kt-dropdown-toggle], [data-kt-dropdown-menu]', 'mouseout', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown && dropdown._getOption('trigger') === 'hover') {
                dropdown.mouseout(event);
            }
        });
    };
    KTDropdown.handleClick = function () {
        event_handler_1.default.on(document.body, '[data-kt-dropdown-toggle]', 'click', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown) {
                dropdown.click(event);
            }
        });
    };
    KTDropdown.handleDismiss = function () {
        event_handler_1.default.on(document.body, '[data-kt-dropdown-dismiss]', 'click', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown) {
                dropdown.hide();
            }
        });
    };
    KTDropdown.initHandlers = function () {
        this.handleClickAway();
        this.handleKeyboard();
        this.handleMouseover();
        this.handleMouseout();
        this.handleClick();
        this.handleDismiss();
    };
    KTDropdown.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-dropdown]');
        elements.forEach(function (element) {
            new KTDropdown(element);
        });
    };
    KTDropdown.init = function () {
        KTDropdown.createInstances();
        if (window.KT_DROPDOWN_INITIALIZED !== true) {
            KTDropdown.initHandlers();
            window.KT_DROPDOWN_INITIALIZED = true;
        }
    };
    return KTDropdown;
}(component_1.default));
exports.KTDropdown = KTDropdown;
if (typeof window !== 'undefined') {
    window.KTDropdown = KTDropdown;
}
//# sourceMappingURL=dropdown.js.map