/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
/* eslint-disable max-len */
import KTUtils from './utils';
var KTDom = {
    isRTL: function () {
        var htmlTag = document.documentElement; // Access the <html> tag
        // Check if the "dir" attribute is present and its value is "rtl"
        var dir = htmlTag.getAttribute('dir');
        return dir === 'rtl';
    },
    isElement: function (element) {
        if (element && element instanceof HTMLElement) {
            return true;
        }
        else {
            return false;
        }
    },
    getElement: function (element) {
        if (this.isElement(element)) {
            return element;
        }
        if (element && element.length > 0) {
            return document.querySelector(KTUtils.parseSelector(element));
        }
        return null;
    },
    remove: function (element) {
        if (this.isElement(element) && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    hasClass: function (element, className) {
        // Split classNames string into an array of individual class names
        var classes = className.split(' ');
        // Loop through each class name
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var className_1 = classes_1[_i];
            // Check if the element has the current class name
            if (!element.classList.contains(className_1)) {
                // Return false if any class is missing
                return false;
            }
        }
        // Return true if all classes are present
        return true;
    },
    addClass: function (element, className) {
        var classNames = className.split(' ');
        if (element.classList) {
            for (var i = 0; i < classNames.length; i++) {
                if (classNames[i] && classNames[i].length > 0) {
                    element.classList.add(classNames[i].trim());
                }
            }
        }
        else if (!this.hasClass(element, className)) {
            for (var x = 0; x < classNames.length; x++) {
                element.className += ' ' + classNames[x].trim();
            }
        }
    },
    removeClass: function (element, className) {
        var classNames = className.split(' ');
        if (element.classList) {
            for (var i = 0; i < classNames.length; i++) {
                element.classList.remove(classNames[i].trim());
            }
        }
        else if (this.hasClass(element, className)) {
            for (var x = 0; x < classNames.length; x++) {
                element.className = element.className.replace(new RegExp('\\b' + classNames[x].trim() + '\\b', 'g'), '');
            }
        }
    },
    getCssProp: function (element, prop) {
        return (element ? window.getComputedStyle(element).getPropertyValue(prop) : '').replace(' ', '');
    },
    setCssProp: function (element, prop, value) {
        if (element) {
            window.getComputedStyle(element).setProperty(prop, value);
        }
    },
    offset: function (element) {
        if (!element)
            return { top: 0, left: 0, right: 0, bottom: 0 };
        var rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            right: window.innerWidth - rect.right,
            bottom: window.innerHeight - rect.top,
        };
    },
    getIndex: function (element) {
        var _a;
        var children = Array.from(((_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.children) || []);
        return children.indexOf(element);
    },
    parents: function (element, selector) {
        var parents = [];
        // Push each parent element to the array
        for (element && element !== document.documentElement; (element = element.parentElement);) {
            if (selector) {
                if (element.matches(selector)) {
                    parents.push(element);
                }
                continue;
            }
            parents.push(element);
        }
        // Return our parent array
        return parents;
    },
    siblings: function (element) {
        var parent = element.parentNode;
        if (!parent)
            return [];
        return Array.from(parent.children).filter(function (child) { return child !== element; });
    },
    children: function (element, selector) {
        if (!element || !element.childNodes) {
            return null;
        }
        var result = [];
        var l = element.childNodes.length;
        var i = 0;
        for (i = 0; i < l; i++) {
            if (element.childNodes[i].nodeType == 1 &&
                element.childNodes[i].matches(selector)) {
                result.push(element.childNodes[i]);
            }
        }
        return result;
    },
    child: function (element, selector) {
        var children = KTDom.children(element, selector);
        return children ? children[0] : null;
    },
    isVisible: function (element) {
        if (!this.isElement(element) || element.getClientRects().length === 0) {
            return false;
        }
        // eslint-disable-next-line max-len
        return (getComputedStyle(element).getPropertyValue('visibility') === 'visible');
    },
    isDisabled: function (element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }
        if (element.classList.contains('disabled')) {
            return true;
        }
        if (typeof element.disabled !== 'undefined') {
            return element.disabled;
        }
        return (element.hasAttribute('disabled') &&
            element.getAttribute('disabled') !== 'false');
    },
    transitionEnd: function (element, callback) {
        var duration = this.getCSSTransitionDuration(element);
        setTimeout(function () {
            callback();
        }, duration);
    },
    animationEnd: function (element, callback) {
        var duration = this.getCSSAnimationDuration(element);
        setTimeout(function () {
            callback();
        }, duration);
    },
    getCSSTransitionDuration: function (element) {
        return (parseFloat(window.getComputedStyle(element).transitionDuration) * 1000);
    },
    getCSSAnimationDuration: function (element) {
        return (parseFloat(window.getComputedStyle(element).animationDuration) * 1000);
    },
    reflow: function (element) {
        element.offsetHeight;
    },
    insertAfter: function (element, referenceNode) {
        var parentNode = referenceNode.parentNode;
        if (parentNode) {
            parentNode.insertBefore(element, referenceNode.nextSibling);
        }
    },
    getHighestZindex: function (element) {
        var position, value;
        while (element && element !== document.documentElement) {
            // Ignore z-index if position is set to a value where z-index is ignored by the browser
            // This makes behavior of this function consistent across browsers
            // WebKit always returns auto if the element is positioned
            position = element.style.position;
            if (position === 'absolute' ||
                position === 'relative' ||
                position === 'fixed') {
                // IE returns 0 when zIndex is not specified
                // other browsers return a string
                // we ignore the case of nested elements with an explicit value of 0
                // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                value = parseInt(element.style.zIndex);
                if (!isNaN(value) && value !== 0) {
                    return value;
                }
            }
            element = element.parentNode;
        }
        return 1;
    },
    isParentOrElementHidden: function (element) {
        if (!element) {
            return false;
        }
        var computedStyle = window.getComputedStyle(element);
        if (computedStyle.display === 'none') {
            return true;
        }
        return this.isParentOrElementHidden(element.parentElement);
    },
    getViewPort: function () {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    },
    getScrollTop: function () {
        return (document.scrollingElement || document.documentElement).scrollTop;
    },
    isInViewport: function (element) {
        var rect = element.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    },
    isPartiallyInViewport: function (element) {
        var x = element.getBoundingClientRect().left;
        var y = element.getBoundingClientRect().top;
        var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var hw = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var w = element.clientWidth;
        var h = element.clientHeight;
        return y < hw && y + h > 0 && x < ww && x + w > 0;
    },
    isVisibleInParent: function (child, parent) {
        var childRect = child.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect();
        // Check if the child element is visible
        if (child.offsetParent === null ||
            getComputedStyle(child).visibility === 'hidden' ||
            getComputedStyle(child).display === 'none') {
            return false;
        }
        // Check if the child is within the vertical bounds of the parent
        var isVisibleVertically = childRect.top >= parentRect.top && childRect.bottom <= parentRect.bottom;
        // Check if the child is within the horizontal bounds of the parent
        var isVisibleHorizontally = childRect.left >= parentRect.left && childRect.right <= parentRect.right;
        return isVisibleVertically && isVisibleHorizontally;
    },
    getRelativeTopPosition: function (child, parent) {
        var childRect = child.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect();
        // Calculate the relative top position
        var relativeTop = childRect.top - parentRect.top;
        return relativeTop;
    },
    getDataAttributes: function (element, prefix) {
        if (!element) {
            return {};
        }
        prefix = KTUtils.camelCase(prefix);
        var attributes = {};
        var keys = Object.keys(element.dataset).filter(function (key) {
            return key.startsWith(prefix);
        });
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var normalizedKey = key.replace(prefix, '');
            normalizedKey = KTUtils.uncapitalize(normalizedKey);
            attributes[normalizedKey] = KTUtils.parseDataAttribute(element.dataset[key]);
        }
        return attributes;
    },
    ready: function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                callback();
            });
        }
        else {
            callback();
        }
    },
};
export default KTDom;
//# sourceMappingURL=dom.js.map