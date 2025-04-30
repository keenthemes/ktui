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
import { createPopper } from '@popperjs/core';
import KTDom from '../../helpers/dom';
import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTMenu } from '../menu';
var KTDropdown = /** @class */ (function (_super) {
    __extends(KTDropdown, _super);
    function KTDropdown(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'dropdown';
        _this._defaultConfig = {
            zindex: 105,
            hoverTimeout: 200,
            placement: 'bottom-start',
            permanent: false,
            dismiss: false,
            trigger: 'click',
            attach: '',
            offset: '0px, 5px',
            hiddenClass: 'hidden'
        };
        _this._config = _this._defaultConfig;
        _this._disabled = false;
        _this._isTransitioning = false;
        _this._isOpen = false;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._toggleElement = _this._element.querySelector('.dropdown-toggle');
        if (!_this._toggleElement)
            return _this;
        _this._contentElement = _this._element.querySelector('.dropdown-content, [data-dropdown-content="true"]');
        if (!_this._contentElement)
            return _this;
        KTData.set(_this._contentElement, 'dropdownElement', _this._element);
        return _this;
    }
    KTDropdown.prototype._click = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._disabled === true) {
            return;
        }
        if (this._getOption('trigger') !== 'click') {
            return;
        }
        this._toggle();
    };
    KTDropdown.prototype._mouseover = function () {
        if (this._disabled === true) {
            return;
        }
        if (this._getOption('trigger') !== 'hover') {
            return;
        }
        if (KTData.get(this._element, 'hover') === '1') {
            clearTimeout(KTData.get(this._element, 'timeout'));
            KTData.remove(this._element, 'hover');
            KTData.remove(this._element, 'timeout');
        }
        this._show();
    };
    KTDropdown.prototype._mouseout = function () {
        var _this = this;
        if (this._disabled === true) {
            return;
        }
        if (this._getOption('trigger') !== 'hover') {
            return;
        }
        var timeout = setTimeout(function () {
            if (KTData.get(_this._element, 'hover') === '1') {
                _this._hide();
            }
        }, parseInt(this._getOption('hoverTimeout')));
        KTData.set(this._element, 'hover', '1');
        KTData.set(this._element, 'timeout', timeout);
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
        if (this._isOpen || this._isTransitioning) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('show', payload);
        this._dispatchEvent('show', payload);
        if (payload.cancel === true) {
            return;
        }
        // Hide all currently shown dropdowns except current one
        KTDropdown.hide();
        KTMenu.hide(this._element);
        var zIndex = parseInt(this._getOption('zindex'));
        var parentZindex = KTDom.getHighestZindex(this._element);
        if (parentZindex !== null && parentZindex >= zIndex) {
            zIndex = parentZindex + 1;
        }
        if (zIndex > 0) {
            this._contentElement.style.zIndex = zIndex.toString();
        }
        this._contentElement.style.display = 'block';
        this._contentElement.style.opacity = '0';
        KTDom.reflow(this._contentElement);
        this._contentElement.style.opacity = '1';
        this._contentElement.classList.remove(this._getOption('hiddenClass'));
        this._toggleElement.classList.add('active');
        this._contentElement.classList.add('open');
        this._element.classList.add('open');
        this._initPopper();
        KTDom.transitionEnd(this._contentElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = true;
            _this._fireEvent('shown');
            _this._dispatchEvent('shown');
        });
    };
    KTDropdown.prototype._hide = function () {
        var _this = this;
        if (this._isOpen === false || this._isTransitioning) {
            return;
        }
        var payload = { cancel: false };
        this._fireEvent('hide', payload);
        this._dispatchEvent('hide', payload);
        if (payload.cancel === true) {
            return;
        }
        this._contentElement.style.opacity = '1';
        KTDom.reflow(this._contentElement);
        this._contentElement.style.opacity = '0';
        this._contentElement.classList.remove('open');
        this._toggleElement.classList.remove('active');
        this._element.classList.remove('open');
        KTDom.transitionEnd(this._contentElement, function () {
            _this._isTransitioning = false;
            _this._isOpen = false;
            _this._contentElement.classList.add(_this._getOption('hiddenClass'));
            _this._contentElement.style.display = '';
            _this._contentElement.style.zIndex = '';
            // Destroy popper(new)
            _this._destroyPopper();
            // Handle dropdown hidden event
            _this._fireEvent('hidden');
            _this._dispatchEvent('hidden');
        });
    };
    KTDropdown.prototype._initPopper = function () {
        // Setup popper instance
        var reference;
        var attach = this._getOption('attach');
        if (attach) {
            if (attach === 'parent') {
                reference = this._toggleElement.parentNode;
            }
            else {
                reference = document.querySelector(attach);
            }
        }
        else {
            reference = this._toggleElement;
        }
        if (reference) {
            var popper = createPopper(reference, this._contentElement, this._getPopperConfig());
            KTData.set(this._element, 'popper', popper);
        }
    };
    KTDropdown.prototype._destroyPopper = function () {
        if (KTData.has(this._element, 'popper')) {
            KTData.get(this._element, 'popper').destroy();
            KTData.remove(this._element, 'popper');
        }
    };
    KTDropdown.prototype.__isOpen = function () {
        return this._element.classList.contains('open') && this._contentElement.classList.contains('open');
    };
    KTDropdown.prototype._getPopperConfig = function () {
        // Placement
        var placement = this._getOption('placement');
        if (!placement) {
            placement = 'right';
        }
        // Offset
        var offsetValue = this._getOption('offset');
        var offset = offsetValue ? offsetValue.toString().split(',').map(function (value) { return parseInt(value.trim(), 10); }) : [0, 0];
        // Strategy
        var strategy = this._getOption('overflow') === true ? 'absolute' : 'fixed';
        var altAxis = this._getOption('flip') !== false ? true : false;
        var popperConfig = {
            placement: placement,
            strategy: strategy,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: offset
                    }
                },
                {
                    name: 'preventOverflow',
                    options: {
                        altAxis: altAxis
                    }
                },
                {
                    name: 'flip',
                    options: {
                        flipVariations: false
                    }
                }
            ]
        };
        return popperConfig;
    };
    KTDropdown.prototype._getToggleElement = function () {
        return this._toggleElement;
    };
    KTDropdown.prototype._getContentElement = function () {
        return this._contentElement;
    };
    // General Methods
    KTDropdown.prototype.click = function (event) {
        this._click(event);
    };
    KTDropdown.prototype.mouseover = function () {
        this._mouseover();
    };
    KTDropdown.prototype.mouseout = function () {
        this._mouseout();
    };
    KTDropdown.prototype.show = function () {
        return this._show();
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
        return this._contentElement;
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
        return this._isOpen;
    };
    // Statics methods
    KTDropdown.getElement = function (reference) {
        if (reference.hasAttribute('data-dropdown'))
            return reference;
        var findElement = reference.closest('[data-dropdown]');
        if (findElement)
            return findElement;
        if (reference.classList.contains('dropdown-content') && KTData.has(reference, 'dropdownElement')) {
            return KTData.get(reference, 'dropdownElement');
        }
        return null;
    };
    KTDropdown.getInstance = function (element) {
        element = this.getElement(element);
        if (!element)
            return null;
        if (KTData.has(element, 'dropdown')) {
            return KTData.get(element, 'dropdown');
        }
        if (element.getAttribute('data-dropdown') === "true") {
            return new KTDropdown(element);
        }
        return null;
    };
    KTDropdown.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTDropdown(element, config);
    };
    KTDropdown.update = function () {
        document.querySelectorAll('.open[data-dropdown]').forEach(function (item) {
            if (KTData.has(item, 'popper')) {
                KTData.get(item, 'popper').forceUpdate();
            }
        });
    };
    KTDropdown.hide = function (skipElement) {
        document.querySelectorAll('.open[data-dropdown]').forEach(function (item) {
            if (skipElement && (skipElement === item || item.contains(skipElement)))
                return;
            var dropdown = KTDropdown.getInstance(item);
            if (dropdown)
                dropdown.hide();
        });
    };
    KTDropdown.handleClickAway = function () {
        document.addEventListener('click', function (event) {
            document.querySelectorAll('.open[data-dropdown]').forEach(function (element) {
                var dropdown = KTDropdown.getInstance(element);
                if (dropdown && dropdown.isPermanent() === false) {
                    var contentElement = dropdown.getContentElement();
                    if (element === event.target || element.contains(event.target)) {
                        return;
                    }
                    if (contentElement && (contentElement === event.target || contentElement.contains(event.target))) {
                        return;
                    }
                    dropdown.hide();
                }
            });
        });
    };
    KTDropdown.handleKeyboard = function () {
    };
    KTDropdown.handleMouseover = function () {
        KTEventHandler.on(document.body, '.dropdown-toggle', 'mouseover', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown !== null && dropdown.getOption('trigger') === 'hover') {
                return dropdown.mouseover();
            }
        });
    };
    KTDropdown.handleMouseout = function () {
        KTEventHandler.on(document.body, '.dropdown-toggle', 'mouseout', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown !== null && dropdown.getOption('trigger') === 'hover') {
                return dropdown.mouseout();
            }
        });
    };
    KTDropdown.handleClick = function () {
        KTEventHandler.on(document.body, '.dropdown-toggle', 'click', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown) {
                return dropdown.click(event);
            }
        });
    };
    KTDropdown.handleDismiss = function () {
        KTEventHandler.on(document.body, '[data-dropdown-dismiss]', 'click', function (event, target) {
            var dropdown = KTDropdown.getInstance(target);
            if (dropdown) {
                return dropdown.hide();
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
        var elements = document.querySelectorAll('[data-dropdown="true"]');
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
}(KTComponent));
export { KTDropdown };
//# sourceMappingURL=dropdown.js.map