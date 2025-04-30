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
exports.KTMenu = void 0;
var core_1 = require("@popperjs/core");
var dom_1 = require("../../helpers/dom");
var utils_1 = require("../../helpers/utils");
var data_1 = require("../../helpers/data");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var constants_1 = require("../constants");
var dropdown_1 = require("../dropdown");
var KTMenu = /** @class */ (function (_super) {
    __extends(KTMenu, _super);
    function KTMenu(element, config) {
        var _this = _super.call(this) || this;
        _this._name = 'menu';
        _this._defaultConfig = {
            dropdownZindex: '105',
            dropdownHoverTimeout: 200,
            accordionExpandAll: false
        };
        _this._config = _this._defaultConfig;
        _this._disabled = false;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._update();
        return _this;
    }
    KTMenu.prototype._click = function (element, event) {
        if (element.hasAttribute('href') && element.getAttribute('href') !== '#') {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (this._disabled === true) {
            return;
        }
        var itemElement = this._getItemElement(element);
        if (!itemElement)
            return;
        if (this._getItemOption(itemElement, 'trigger') !== 'click') {
            return;
        }
        if (this._getItemOption(itemElement, 'toggle') === false) {
            this._show(itemElement);
        }
        else {
            this._toggle(itemElement);
        }
    };
    KTMenu.prototype._link = function (element, event) {
        if (this._disabled === true) {
            return;
        }
        var payload = {
            cancel: false,
            element: element,
            event: event
        };
        this._fireEvent('link.click', payload);
        this._dispatchEvent('link.click', payload);
        if (payload.cancel === true) {
            return;
        }
        var itemElement = this._getItemElement(element);
        if (this._isItemDropdownPermanent(itemElement) === false) {
            KTMenu.hide();
        }
        payload = {
            element: element,
            event: event
        };
        this._fireEvent('link.clicked', payload);
        this._dispatchEvent('link.clicked', payload);
    };
    KTMenu.prototype._dismiss = function (element) {
        var _this = this;
        var itemElement = this._getItemElement(element);
        if (!itemElement)
            return;
        var itemElements = this._getItemChildElements(itemElement);
        if (itemElement !== null &&
            this._getItemToggleMode(itemElement) === 'dropdown') {
            // hide items dropdown
            this._hide(itemElement);
            // Hide all child elements as well
            itemElements.forEach(function (each) {
                if (_this._getItemToggleMode(each) === 'dropdown') {
                    _this._hide(each);
                }
            });
        }
    };
    KTMenu.prototype._mouseover = function (element) {
        var itemElement = this._getItemElement(element);
        if (!itemElement)
            return;
        if (this._disabled === true) {
            return;
        }
        if (itemElement === null) {
            return;
        }
        if (this._getItemOption(itemElement, 'trigger') !== 'hover') {
            return;
        }
        if (data_1.default.get(itemElement, 'hover') === '1') {
            clearTimeout(data_1.default.get(itemElement, 'timeout'));
            data_1.default.remove(itemElement, 'hover');
            data_1.default.remove(itemElement, 'timeout');
        }
        this._show(itemElement);
    };
    KTMenu.prototype._mouseout = function (element) {
        var _this = this;
        var itemElement = this._getItemElement(element);
        if (!itemElement)
            return;
        if (this._disabled === true) {
            return;
        }
        if (this._getItemOption(itemElement, 'trigger') !== 'hover') {
            return;
        }
        var timeout = setTimeout(function () {
            if (data_1.default.get(itemElement, 'hover') === '1') {
                _this._hide(itemElement);
            }
        }, parseInt(this._getOption('dropdownHoverTimeout')));
        data_1.default.set(itemElement, 'hover', '1');
        data_1.default.set(itemElement, 'timeout', timeout);
    };
    KTMenu.prototype._toggle = function (itemElement) {
        if (this._isItemSubShown(itemElement) === true) {
            this._hide(itemElement);
        }
        else {
            this._show(itemElement);
        }
    };
    KTMenu.prototype._show = function (itemElement) {
        if (this._isItemSubShown(itemElement) === true) {
            return;
        }
        if (this._getItemToggleMode(itemElement) === 'dropdown') {
            this._showDropdown(itemElement);
        }
        else if (this._getItemToggleMode(itemElement) === 'accordion') {
            this._showAccordion(itemElement);
        }
        // Remember last submenu type
        data_1.default.set(itemElement, 'toggle', this._getItemToggleMode(itemElement));
    };
    KTMenu.prototype._hide = function (itemElement) {
        if (this._isItemSubShown(itemElement) === false) {
            return;
        }
        if (this._getItemToggleMode(itemElement) === 'dropdown') {
            this._hideDropdown(itemElement);
        }
        else if (this._getItemToggleMode(itemElement) === 'accordion') {
            this._hideAccordion(itemElement);
        }
    };
    KTMenu.prototype._reset = function (itemElement) {
        if (this._hasItemSub(itemElement) === false) {
            return;
        }
        var subElement = this._getItemSubElement(itemElement);
        // Reset sub state if sub type is changed during the window resize
        if (data_1.default.has(itemElement, 'toggle') &&
            data_1.default.get(itemElement, 'toggle') !== this._getItemToggleMode(itemElement)) {
            itemElement.classList.remove('show');
            subElement === null || subElement === void 0 ? void 0 : subElement.classList.remove('show');
        }
    };
    KTMenu.prototype._update = function () {
        var _this = this;
        if (!this._element)
            return;
        var itemElements = this._element.querySelectorAll('.menu-item[data-menu-item-trigger]');
        itemElements.forEach(function (itemElement) {
            _this._updateItemSubType(itemElement);
            _this._reset(itemElement);
        });
    };
    KTMenu.prototype._updateItemSubType = function (itemElement) {
        var subElement = this._getItemSubElement(itemElement);
        if (subElement) {
            if (this._getItemToggleMode(itemElement) === 'dropdown') {
                itemElement.classList.remove('menu-item-accordion');
                itemElement.classList.add('menu-item-dropdown');
                subElement.classList.remove('menu-accordion');
                subElement.classList.add('menu-dropdown');
            }
            else {
                itemElement.classList.remove('menu-item-dropdown');
                itemElement.classList.add('menu-item-accordion');
                subElement.classList.remove('menu-dropdown');
                subElement.classList.add('menu-accordion');
            }
        }
    };
    KTMenu.prototype._isItemSubShown = function (itemElement) {
        var subElement = this._getItemSubElement(itemElement);
        if (subElement !== null) {
            if (this._getItemToggleMode(itemElement) === 'dropdown') {
                if (subElement.classList.contains('show') === true &&
                    subElement.hasAttribute('data-popper-placement') === true) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return itemElement.classList.contains('show');
            }
        }
        else {
            return false;
        }
    };
    KTMenu.prototype._isItemDropdownPermanent = function (itemElement) {
        return this._getItemOption(itemElement, 'permanent');
    };
    KTMenu.prototype._isItemParentShown = function (itemElement) {
        var parents = dom_1.default.parents(itemElement, '.menu-item.show');
        return parents && parents.length > 0 ? true : false;
    };
    KTMenu.prototype._isItemSubElement = function (itemElement) {
        return itemElement.classList.contains('menu-dropdown') || itemElement.classList.contains('menu-accordion');
    };
    KTMenu.prototype._hasItemSub = function (itemElement) {
        return (itemElement.classList.contains('menu-item') &&
            itemElement.hasAttribute('data-menu-item-trigger'));
    };
    KTMenu.prototype._getItemLinkElement = function (itemElement) {
        return dom_1.default.child(itemElement, '.menu-link, .menu-toggle');
    };
    KTMenu.prototype._getItemSubElement = function (itemElement) {
        if (itemElement.classList.contains('menu-dropdown') === true || itemElement.classList.contains('menu-accordion') === true) {
            return itemElement;
        }
        else if (data_1.default.has(itemElement, 'sub')) {
            return data_1.default.get(itemElement, 'sub');
        }
        else {
            return dom_1.default.child(itemElement, '.menu-dropdown, .menu-accordion');
        }
    };
    KTMenu.prototype._getItemToggleMode = function (itemElement) {
        var itemEl = this._getItemElement(itemElement);
        if (this._getItemOption(itemEl, 'toggle') === 'dropdown') {
            return 'dropdown';
        }
        else {
            return 'accordion';
        }
    };
    KTMenu.prototype._getItemElement = function (element) {
        if (element.classList.contains('menu-item') && element.hasAttribute('data-menu-item-toggle')) {
            return element;
        }
        // Element has item DOM reference in it's data storage
        if (data_1.default.has(element, 'item')) {
            return data_1.default.get(element, 'item');
        }
        // Item is parent of element
        var itemElement = element.closest('.menu-item[data-menu-item-toggle]');
        if (itemElement) {
            return itemElement;
        }
        // Element's parent has item DOM reference in it's data storage
        var subElement = element.closest('.menu-dropdown, .menu-accordion');
        if (subElement) {
            if (data_1.default.has(subElement, 'item') === true) {
                return data_1.default.get(subElement, 'item');
            }
        }
        return null;
    };
    KTMenu.prototype._getItemParentElement = function (itemElement) {
        var subElement = itemElement.closest('.menu-dropdown, .menu-accordion');
        var parentItem;
        if (subElement && data_1.default.has(subElement, 'item')) {
            return data_1.default.get(subElement, 'item');
        }
        if (subElement &&
            (parentItem = subElement.closest('.menu-item[data-menu-item-trigger]'))) {
            return parentItem;
        }
        return null;
    };
    KTMenu.prototype._getItemParentElements = function (itemElement) {
        var parentElements = [];
        var parentElement;
        var i = 0;
        do {
            parentElement = this._getItemParentElement(itemElement);
            if (parentElement) {
                parentElements.push(parentElement);
                itemElement = parentElement;
            }
            i++;
        } while (parent !== null && i < 20);
        return parentElements;
    };
    KTMenu.prototype._getItemChildElement = function (itemElement) {
        var selector = itemElement;
        var element;
        if (data_1.default.has(itemElement, 'sub')) {
            selector = data_1.default.get(itemElement, 'sub');
        }
        if (selector !== null) {
            //element = selector.querySelector('.show.menu-item[data-menu-trigger]');
            element = selector.querySelector('.menu-item[data-menu-item-trigger]');
            if (element) {
                return element;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };
    KTMenu.prototype._getItemChildElements = function (itemElement) {
        var children = [];
        var child;
        var i = 0;
        var buffer = itemElement;
        do {
            child = this._getItemChildElement(buffer);
            if (child) {
                children.push(child);
                buffer = child;
            }
            i++;
        } while (child !== null && i < 20);
        return children;
    };
    KTMenu.prototype._showDropdown = function (itemElement) {
        var payload = { cancel: false };
        this._fireEvent('dropdown.show', payload);
        this._dispatchEvent('dropdown.show', payload);
        if (payload.cancel === true) {
            return;
        }
        // Hide all currently shown dropdowns except current one
        KTMenu.hide(itemElement);
        dropdown_1.KTDropdown.hide(itemElement);
        var subElement = this._getItemSubElement(itemElement);
        if (!subElement)
            return;
        var width = this._getItemOption(itemElement, 'width');
        var height = this._getItemOption(itemElement, 'height');
        // Set z=index
        var zindex = parseInt(this._getOption('dropdownZindex'));
        if (parseInt(dom_1.default.getCssProp(subElement, 'z-index')) > zindex) {
            zindex = parseInt(dom_1.default.getCssProp(subElement, 'z-index'));
        }
        if (dom_1.default.getHighestZindex(itemElement) > zindex) {
            zindex = dom_1.default.getHighestZindex(itemElement) + 1;
        }
        subElement.style.zIndex = String(zindex);
        // end
        if (width) {
            subElement.style.width = width;
        }
        if (height) {
            subElement.style.height = height;
        }
        subElement.style.display = '';
        subElement.style.overflow = '';
        // Init popper(new)
        this._initDropdownPopper(itemElement, subElement);
        itemElement.classList.add('show');
        itemElement.classList.add('menu-item-dropdown');
        subElement.classList.add('show');
        // Append the sub the the root of the menu
        if (this._getItemOption(itemElement, 'overflow') === true) {
            document.body.appendChild(subElement);
            subElement.setAttribute('data-menu-sub-overflow', 'true');
            data_1.default.set(itemElement, 'sub', subElement);
            data_1.default.set(subElement, 'item', itemElement);
            data_1.default.set(subElement, 'menu', this);
        }
        else {
            data_1.default.set(subElement, 'item', itemElement);
        }
        // Handle dropdown shown event
        this._fireEvent('dropdown.shown');
        this._dispatchEvent('dropdown.shown');
    };
    KTMenu.prototype._hideDropdown = function (itemElement) {
        var payload = { cancel: false };
        this._fireEvent('dropdown.hide', payload);
        this._dispatchEvent('dropdown.hide', payload);
        if (payload.cancel === true) {
            return;
        }
        var subElement = this._getItemSubElement(itemElement);
        if (!subElement)
            return;
        subElement.style.zIndex = '';
        subElement.style.width = '';
        subElement.style.height = '';
        itemElement.classList.remove('show');
        itemElement.classList.remove('menu-item-dropdown');
        subElement.classList.remove('show');
        // Append the sub back to it's parent
        if (this._getItemOption(itemElement, 'overflow') === true) {
            subElement.removeAttribute('data-menu-sub-overflow');
            if (itemElement.classList.contains('menu-item')) {
                itemElement.appendChild(subElement);
            }
            else {
                if (!this._element)
                    return;
                dom_1.default.insertAfter(this._element, itemElement);
            }
            data_1.default.remove(itemElement, 'sub');
            data_1.default.remove(subElement, 'item');
            data_1.default.remove(subElement, 'menu');
        }
        // Destroy popper(new)
        this._destroyDropdownPopper(itemElement);
        // Handle dropdown hidden event
        this._fireEvent('dropdown.hidden');
        this._dispatchEvent('dropdown.hidden');
    };
    KTMenu.prototype._initDropdownPopper = function (itemElement, subElement) {
        // Setup popper instance
        var reference;
        var attach = this._getItemOption(itemElement, 'attach');
        if (attach) {
            if (attach === 'parent') {
                reference = itemElement.parentNode;
            }
            else {
                reference = document.querySelector(attach);
            }
        }
        else {
            reference = itemElement;
        }
        if (reference) {
            var popper = (0, core_1.createPopper)(reference, subElement, this._getDropdownPopperConfig(itemElement));
            data_1.default.set(itemElement, 'popper', popper);
        }
    };
    KTMenu.prototype._destroyDropdownPopper = function (itemElement) {
        if (data_1.default.has(itemElement, 'popper')) {
            data_1.default.get(itemElement, 'popper').destroy();
            data_1.default.remove(itemElement, 'popper');
        }
    };
    KTMenu.prototype._getDropdownPopperConfig = function (itemElement) {
        // Placement
        var placement = this._getItemOption(itemElement, 'placement');
        if (!placement) {
            placement = 'right';
        }
        // Offset
        var offsetValue = this._getItemOption(itemElement, 'offset');
        var offset = offsetValue ? offsetValue.toString().split(',').map(function (value) { return parseInt(value.trim(), 10); }) : [0, 0];
        // Strategy
        var strategy = this._getItemOption(itemElement, 'overflow') === true ? 'absolute' : 'fixed';
        var altAxis = this._getItemOption(itemElement, 'flip') !== false ? true : false;
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
    KTMenu.prototype._showAccordion = function (itemElement) {
        var _this = this;
        var payload = { cancel: false };
        this._fireEvent('accordion.show', payload);
        this._dispatchEvent('accordion.show', payload);
        if (payload.cancel === true) {
            return;
        }
        var subElement = this._getItemSubElement(itemElement);
        if (!subElement)
            return;
        var expandAll = this._getOption('accordionExpandAll');
        if (this._getItemOption(itemElement, 'expandAll') === true) {
            expandAll = true;
        }
        else if (this._getItemOption(itemElement, 'expandAll') === false) {
            expandAll = false;
        }
        else if (this._element && this._getItemOption(this._element, 'expandAll') === true) {
            expandAll = true;
        }
        if (expandAll === false) {
            this._hideAccordions(itemElement);
        }
        if (data_1.default.has(itemElement, 'popper') === true) {
            this._hideDropdown(itemElement);
        }
        itemElement.classList.add('transitioning');
        subElement.style.height = '0px';
        dom_1.default.reflow(subElement);
        subElement.style.display = 'flex';
        subElement.style.overflow = 'hidden';
        subElement.style.height = "".concat(subElement.scrollHeight, "px");
        itemElement.classList.add('show');
        dom_1.default.transitionEnd(subElement, function () {
            itemElement.classList.remove('transitioning');
            subElement.classList.add('show');
            subElement.style.height = '';
            subElement.style.display = '';
            subElement.style.overflow = '';
            // Handle accordion hidden event
            _this._fireEvent('accordion.shown', payload);
            _this._dispatchEvent('accordion.shown', payload);
        });
    };
    KTMenu.prototype._hideAccordion = function (itemElement) {
        var _this = this;
        var payload = { cancel: false };
        this._fireEvent('accordion.hide', payload);
        this._dispatchEvent('accordion.hide', payload);
        if (payload.cancel === true) {
            return;
        }
        var subElement = this._getItemSubElement(itemElement);
        if (!subElement)
            return;
        itemElement.classList.add('transitioning');
        itemElement.classList.remove('show');
        subElement.style.height = "".concat(subElement.scrollHeight, "px");
        dom_1.default.reflow(subElement);
        subElement.style.height = '0px';
        subElement.style.overflow = 'hidden';
        dom_1.default.transitionEnd(subElement, function () {
            subElement.style.overflow = '';
            itemElement.classList.remove('transitioning');
            subElement.classList.remove('show');
            // Handle accordion hidden event
            _this._fireEvent('accordion.hidden');
            _this._dispatchEvent('accordion.hidden');
        });
    };
    KTMenu.prototype._setActiveLink = function (linkElement) {
        var _this = this;
        var itemElement = this._getItemElement(linkElement);
        if (!itemElement)
            return;
        if (!this._element)
            return;
        var parentItems = this._getItemParentElements(itemElement);
        var activeLinks = this._element.querySelectorAll('.menu-link.active');
        var activeParentItems = this._element.querySelectorAll('.menu-item.here, .menu-item.show');
        if (this._getItemToggleMode(itemElement) === 'accordion') {
            this._showAccordion(itemElement);
        }
        else {
            itemElement.classList.add('here');
        }
        parentItems === null || parentItems === void 0 ? void 0 : parentItems.forEach(function (parentItem) {
            if (_this._getItemToggleMode(parentItem) === 'accordion') {
                _this._showAccordion(parentItem);
            }
            else {
                parentItem.classList.add('here');
            }
        });
        activeLinks === null || activeLinks === void 0 ? void 0 : activeLinks.forEach(function (activeLink) {
            activeLink.classList.remove('active');
        });
        activeParentItems === null || activeParentItems === void 0 ? void 0 : activeParentItems.forEach(function (activeParentItem) {
            if (activeParentItem.contains(itemElement) === false) {
                activeParentItem.classList.remove('here');
                activeParentItem.classList.remove('show');
            }
        });
        linkElement.classList.add('active');
    };
    KTMenu.prototype._getLinkByAttribute = function (value, name) {
        if (name === void 0) { name = 'href'; }
        if (!this._element)
            return null;
        var linkElement = this._element.querySelector("'.menu-link[".concat(name, "=\"").concat(value, "\"]"));
        return linkElement && null;
    };
    KTMenu.prototype._hideAccordions = function (itemElement) {
        var _this = this;
        if (!this._element)
            return;
        var itemsToHide = this._element.querySelectorAll('.show[data-menu-item-trigger]');
        itemsToHide.forEach(function (itemToHide) {
            if (_this._getItemToggleMode(itemToHide) === 'accordion' &&
                itemToHide !== itemElement &&
                (itemElement === null || itemElement === void 0 ? void 0 : itemElement.contains(itemToHide)) === false &&
                itemToHide.contains(itemElement) === false) {
                _this._hideAccordion(itemToHide);
            }
        });
    };
    KTMenu.prototype._getItemOption = function (element, name) {
        var attr;
        var value = null;
        if (element && element.hasAttribute("data-menu-item-".concat(name))) {
            attr = element.getAttribute("data-menu-item-".concat(name));
            if (!attr)
                return null;
            value = this._getResponsiveOption(attr);
        }
        return value;
    };
    // General Methods
    KTMenu.prototype.getItemTriggerMode = function (itemElement) {
        return this._getItemOption(itemElement, 'trigger');
    };
    KTMenu.prototype.getItemToggleMode = function (element) {
        return this._getItemToggleMode(element);
    };
    KTMenu.prototype.click = function (element, event) {
        this._click(element, event);
    };
    KTMenu.prototype.link = function (element, event) {
        this._link(element, event);
    };
    KTMenu.prototype.dismiss = function (element) {
        this._dismiss(element);
    };
    KTMenu.prototype.mouseover = function (element) {
        this._mouseover(element);
    };
    KTMenu.prototype.mouseout = function (element) {
        this._mouseout(element);
    };
    KTMenu.prototype.show = function (itemElement) {
        return this._show(itemElement);
    };
    KTMenu.prototype.hide = function (itemElement) {
        this._hide(itemElement);
    };
    KTMenu.prototype.toggle = function (itemElement) {
        this._toggle(itemElement);
    };
    KTMenu.prototype.reset = function (itemElement) {
        this._reset(itemElement);
    };
    KTMenu.prototype.update = function () {
        this._update();
    };
    KTMenu.prototype.setActiveLink = function (link) {
        this._setActiveLink(link);
    };
    KTMenu.prototype.getLinkByAttribute = function (value, name) {
        if (name === void 0) { name = 'href'; }
        return this._getLinkByAttribute(value, name);
    };
    KTMenu.prototype.getItemLinkElement = function (itemElement) {
        return this._getItemLinkElement(itemElement);
    };
    KTMenu.prototype.getItemElement = function (element) {
        return this._getItemElement(element);
    };
    KTMenu.prototype.getItemSubElement = function (itemElement) {
        return this._getItemSubElement(itemElement);
    };
    KTMenu.prototype.getItemParentElements = function (itemElement) {
        return this._getItemParentElements(itemElement);
    };
    KTMenu.prototype.isItemSubShown = function (itemElement) {
        return this._isItemSubShown(itemElement);
    };
    KTMenu.prototype.isItemParentShown = function (itemElement) {
        return this._isItemParentShown(itemElement);
    };
    KTMenu.prototype.isItemDropdownPermanent = function (itemElement) {
        return this._isItemDropdownPermanent(itemElement);
    };
    KTMenu.prototype.disable = function () {
        this._disabled = true;
    };
    KTMenu.prototype.enable = function () {
        this._disabled = false;
    };
    KTMenu.prototype.hideAccordions = function (itemElement) {
        this._hideAccordions(itemElement);
    };
    // Statics methods
    KTMenu.getInstance = function (element) {
        if (!element) {
            return null;
        }
        // Element has menu DOM reference in it's DATA storage
        if (data_1.default.has(element, 'menu')) {
            return data_1.default.get(element, 'menu');
        }
        // Element has .menu parent
        var menuElement = element.closest('.menu');
        if (menuElement && data_1.default.has(menuElement, 'menu')) {
            return data_1.default.get(menuElement, 'menu');
        }
        else if (menuElement && menuElement.getAttribute("data-menu") === "true") {
            return new KTMenu(menuElement);
        }
        var subElement = element.closest('[data-menu-sub-overflow="true"]');
        if (subElement && data_1.default.has(subElement, 'menu')) {
            return data_1.default.get(subElement, 'menu');
        }
        // Element has a parent with DOM reference to .menu in it's DATA storage
        if (element.classList.contains('menu-link') || element.classList.contains('menu-toggle')) {
            var subElement_1 = (element.closest('.menu-dropdown') || element.closest('.menu-accordion'));
            if (data_1.default.has(subElement_1, 'menu')) {
                return data_1.default.get(subElement_1, 'menu');
            }
        }
        return null;
    };
    KTMenu.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTMenu(element, config);
    };
    KTMenu.hide = function (skipElement) {
        var itemElements = document.querySelectorAll('.show.menu-item-dropdown[data-menu-item-trigger]');
        itemElements.forEach(function (itemElement) {
            var _a;
            var menu = KTMenu.getInstance(itemElement);
            if (menu && menu.getItemToggleMode(itemElement) === 'dropdown') {
                if (skipElement) {
                    if (itemElement &&
                        ((_a = menu.getItemSubElement(itemElement)) === null || _a === void 0 ? void 0 : _a.contains(skipElement)) === false &&
                        itemElement.contains(skipElement) === false &&
                        itemElement !== skipElement) {
                        menu.hide(itemElement);
                    }
                }
                else {
                    menu.hide(itemElement);
                }
            }
        });
    };
    KTMenu.updateDropdowns = function () {
        var itemElements = document.querySelectorAll('.show.menu-item-dropdown[data-menu-item-trigger]');
        itemElements.forEach(function (itemElement) {
            if (data_1.default.has(itemElement, 'popper')) {
                data_1.default.get(itemElement, 'popper').forceUpdate();
            }
        });
    };
    KTMenu.updateByLinkAttribute = function (value, name) {
        if (name === void 0) { name = 'href'; }
        var elements = document.querySelectorAll('[data-menu]');
        elements.forEach(function (element) {
            var menu = KTMenu.getInstance(element);
            if (menu) {
                var link = menu.getLinkByAttribute(value, name);
                if (link) {
                    menu.setActiveLink(link);
                }
            }
        });
    };
    KTMenu.handleClickAway = function () {
        document.addEventListener('click', function (event) {
            var itemElements = document.querySelectorAll('.show.menu-item-dropdown[data-menu-item-trigger]:not([data-menu-item-static="true"])');
            itemElements.forEach(function (itemElement) {
                var menu = KTMenu.getInstance(itemElement);
                if (menu &&
                    menu.getItemToggleMode(itemElement) === 'dropdown') {
                    var subElement = menu.getItemSubElement(itemElement);
                    if (itemElement === event.target ||
                        itemElement.contains(event.target)) {
                        return;
                    }
                    if (subElement && (subElement === event.target || subElement.contains(event.target))) {
                        return;
                    }
                    menu.hide(itemElement);
                }
            });
        });
    };
    KTMenu.findFocused = function () {
        var linkElement = document.querySelector('.menu-link:focus, .menu-toggle:focus');
        if (linkElement && dom_1.default.isVisible(linkElement)) {
            return linkElement;
        }
        else {
            return null;
        }
    };
    KTMenu.getFocusLink = function (linkElement, direction, preFocus) {
        if (preFocus === void 0) { preFocus = false; }
        if (!linkElement)
            return null;
        var itemElement = linkElement.parentElement;
        if (!itemElement || !itemElement.classList.contains('menu-item'))
            return null;
        if (direction === 'next') {
            var nextElement = linkElement.nextElementSibling;
            if (nextElement && (nextElement.matches('.menu-accordion' + (!preFocus ? '.show' : '')) || nextElement.matches('.menu-dropdown' + (!preFocus ? '.show' : '')))) {
                var itemElement2 = dom_1.default.child(nextElement, '.menu-item');
                return dom_1.default.child(itemElement2, '.menu-link');
            }
            else {
                var nextElement2 = itemElement.nextElementSibling;
                if (nextElement2 && nextElement2.classList.contains('menu-item')) {
                    var nextLink = dom_1.default.child(nextElement2, '.menu-link');
                    if (nextLink) {
                        return nextLink;
                    }
                }
            }
        }
        else {
            var prevElement = itemElement.previousElementSibling;
            if (prevElement) {
                if (prevElement && prevElement.classList.contains('menu-item')) {
                    var nextLink = dom_1.default.child(prevElement, '.menu-link');
                    if (nextLink) {
                        return nextLink;
                    }
                }
            }
            else {
                var parentElement = itemElement.parentElement;
                if (parentElement && (parentElement.matches('.menu-accordion' + (!preFocus ? '.show' : '')) || parentElement.matches('.menu-dropdown' + (!preFocus ? '.show' : '')))) {
                    var prevElement2 = parentElement.previousElementSibling;
                    if (prevElement2.classList.contains('menu-link')) {
                        return prevElement2;
                    }
                }
            }
        }
        return null;
    };
    KTMenu.handleKeyboard = function () {
        var _this = this;
        document.addEventListener('keydown', function (event) {
            if (constants_1.KT_ACCESSIBILITY_KEYS.includes(event.key) && !(event.ctrlKey || event.altKey || event.shiftKey)) {
                var currentFocused = _this.findFocused();
                if (!currentFocused)
                    return;
                if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    var direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 'next' : 'previouse';
                    var newFocusLink = _this.getFocusLink(currentFocused, direction);
                    event.preventDefault();
                    if (newFocusLink) {
                        newFocusLink.focus();
                        newFocusLink.classList.add('focus');
                    }
                }
                if (event.key === 'Enter') {
                    var menu = _this.getInstance(currentFocused);
                    var itemElement = menu.getItemElement(currentFocused);
                    var subShown = menu.isItemSubShown(itemElement);
                    if (!menu)
                        return;
                    if (menu.getItemToggleMode(itemElement) === 'accordion') {
                        currentFocused.dispatchEvent(new MouseEvent('click', {
                            bubbles: true
                        }));
                    }
                    if (menu.getItemToggleMode(itemElement) === 'dropdown') {
                        if (menu.getItemTriggerMode(itemElement) === 'click') {
                            currentFocused.dispatchEvent(new MouseEvent('click', {
                                bubbles: true
                            }));
                        }
                        else {
                            if (subShown) {
                                currentFocused.dispatchEvent(new MouseEvent('mouseout', {
                                    bubbles: true
                                }));
                            }
                            else {
                                currentFocused.dispatchEvent(new MouseEvent('mouseover', {
                                    bubbles: true
                                }));
                            }
                        }
                    }
                    if (subShown) {
                        var subFocus = _this.getFocusLink(currentFocused, 'next', true);
                        if (subFocus) {
                            subFocus.focus();
                        }
                    }
                    else {
                        currentFocused.focus();
                    }
                    event.preventDefault();
                }
                if (event.key === 'Escape') {
                    var items = document.querySelectorAll('.show.menu-item-dropdown[data-menu-item-trigger]:not([data-menu-item-static="true"])');
                    items.forEach(function (item) {
                        var menu = KTMenu.getInstance(item);
                        if (menu &&
                            menu.getItemToggleMode(item) === 'dropdown') {
                            menu.hide(item);
                        }
                    });
                }
            }
        }, false);
    };
    KTMenu.handleMouseover = function () {
        event_handler_1.default.on(document.body, '[data-menu-item-trigger], .menu-dropdown', 'mouseover', function (event, target) {
            var menu = KTMenu.getInstance(target);
            if (menu !== null && menu.getItemToggleMode(target) === 'dropdown') {
                return menu.mouseover(target);
            }
        });
    };
    KTMenu.handleMouseout = function () {
        event_handler_1.default.on(document.body, '[data-menu-item-trigger], .menu-dropdown', 'mouseout', function (event, target) {
            var menu = KTMenu.getInstance(target);
            if (menu !== null && menu.getItemToggleMode(target) === 'dropdown') {
                return menu.mouseout(target);
            }
        });
    };
    KTMenu.handleClick = function () {
        event_handler_1.default.on(document.body, '.menu-item[data-menu-item-trigger] > .menu-link, .menu-item[data-menu-item-trigger] > .menu-toggle, .menu-item[data-menu-item-trigger] > .menu-label .menu-toggle, [data-menu-item-trigger]:not(.menu-item):not([data-menu-item-trigger="auto"])', 'click', function (event, target) {
            var menu = KTMenu.getInstance(target);
            if (menu !== null) {
                return menu.click(target, event);
            }
        });
        event_handler_1.default.on(document.body, '.menu-item:not([data-menu-item-trigger]) > .menu-link', 'click', function (event, target) {
            var menu = KTMenu.getInstance(target);
            if (menu !== null) {
                return menu.link(target, event);
            }
        });
    };
    KTMenu.handleDismiss = function () {
        event_handler_1.default.on(document.body, '[data-menu-dismiss="true"]', 'click', function (event, target) {
            var menu = KTMenu.getInstance(target);
            if (menu !== null) {
                return menu.dismiss(target);
            }
        });
    };
    KTMenu.handleResize = function () {
        window.addEventListener('resize', function () {
            var timer;
            utils_1.default.throttle(timer, function () {
                // Locate and update Offcanvas instances on window resize
                var elements = document.querySelectorAll('[data-menu]');
                elements.forEach(function (element) {
                    var _a;
                    (_a = KTMenu.getInstance(element)) === null || _a === void 0 ? void 0 : _a.update();
                });
            }, 200);
        });
    };
    KTMenu.initHandlers = function () {
        this.handleClickAway();
        this.handleKeyboard();
        this.handleMouseover();
        this.handleMouseout();
        this.handleClick();
        this.handleDismiss();
        this.handleResize();
    };
    KTMenu.createInstances = function () {
        var elements = document.querySelectorAll('[data-menu="true"]');
        elements.forEach(function (element) {
            new KTMenu(element);
        });
    };
    KTMenu.init = function () {
        KTMenu.createInstances();
        if (window.KT_MENU_INITIALIZED !== true) {
            KTMenu.initHandlers();
            window.KT_MENU_INITIALIZED = true;
        }
    };
    return KTMenu;
}(component_1.default));
exports.KTMenu = KTMenu;
//# sourceMappingURL=menu.js.map