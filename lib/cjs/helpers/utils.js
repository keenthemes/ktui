"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
Object.defineProperty(exports, "__esModule", { value: true });
var KTUtils = {
    geUID: function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + Math.floor(Math.random() * new Date().getTime());
    },
    getCssVar: function (variable) {
        var hex = getComputedStyle(document.documentElement).getPropertyValue(variable);
        if (hex && hex.length > 0) {
            hex = hex.trim();
        }
        return hex;
    },
    parseDataAttribute: function (value) {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (value === Number(value).toString()) {
            return Number(value);
        }
        if (value === '' || value === 'null') {
            return null;
        }
        if (typeof value !== 'string') {
            return value;
        }
        try {
            return KTUtils.parseJson(value);
        }
        catch (_a) {
            return value;
        }
    },
    parseJson: function (value) {
        return value && value.length > 0
            ? JSON.parse(decodeURIComponent(value))
            : null;
    },
    parseSelector: function (selector) {
        if (selector && window.CSS && window.CSS.escape) {
            // Escape any IDs in the selector using CSS.escape
            selector = selector.replace(/#([^\s"#']+)/g, function (match, id) { return "#".concat(window.CSS.escape(id)); });
        }
        return selector;
    },
    capitalize: function (value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    },
    uncapitalize: function (value) {
        return value.charAt(0).toLowerCase() + value.slice(1);
    },
    camelCase: function (value) {
        return value.replace(/-([a-z])/g, function (match, letter) {
            return letter.toUpperCase();
        });
    },
    camelReverseCase: function (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    },
    isRTL: function () {
        var htmlElement = document.querySelector('html');
        return Boolean(htmlElement && htmlElement.getAttribute('direction') === 'rtl');
    },
    throttle: function (timer, func, delay) {
        // If setTimeout is already scheduled, no need to do anything
        if (timer) {
            return;
        }
        // Schedule a setTimeout after delay seconds
        timer = setTimeout(function () {
            func();
            // Once setTimeout function execution is finished, timerId = undefined so that in <br>
            // the next scroll event function execution can be scheduled by the setTimeout
            clearTimeout(timer);
        }, delay);
    },
    checksum: function (value) {
        var hash = 0;
        for (var i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
        }
        return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
    },
    stringToBoolean: function (value) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value !== 'string')
            return null;
        var cleanedStr = value.toLowerCase().trim();
        if (cleanedStr === 'true')
            return true;
        if (cleanedStr === 'false')
            return false;
        return null;
    },
    stringToObject: function (value) {
        try {
            var parsed = JSON.parse(value.toString());
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    },
    stringToInteger: function (value) {
        // If already a number, return it as an integer
        if (typeof value === 'number' && !isNaN(value)) {
            return Math.floor(value);
        }
        // If not a string, return null
        if (typeof value !== 'string')
            return null;
        var cleanedStr = value.trim();
        var num = parseInt(cleanedStr, 10);
        if (!isNaN(num) && cleanedStr !== '') {
            return num;
        }
        return null;
    },
    stringToFloat: function (value) {
        // If already a number, return it as is
        if (typeof value === 'number' && !isNaN(value)) {
            return value;
        }
        // If not a string, return null
        if (typeof value !== 'string')
            return null;
        var cleanedStr = value.trim();
        var num = parseFloat(cleanedStr);
        if (!isNaN(num) && cleanedStr !== '') {
            return num;
        }
        return null;
    },
};
exports.default = KTUtils;
//# sourceMappingURL=utils.js.map