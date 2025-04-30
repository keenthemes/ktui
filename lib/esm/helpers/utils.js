var KTUtils = {
    geUID: function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + Math.floor(Math.random() * (new Date()).getTime());
    },
    getBreakpoint: function (breakpoint) {
        var value = KTUtils.getCssVar("--tw-".concat(breakpoint));
        if (value) {
            return parseInt(value.trim());
        }
        else {
            return -1;
        }
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
        return value && value.length > 0 ? JSON.parse(decodeURIComponent(value)) : null;
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
};
export default KTUtils;
//# sourceMappingURL=utils.js.map