"use strict";
/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("../helpers/data");
var dom_1 = require("../helpers/dom");
var utils_1 = require("../helpers/utils");
var config_1 = require("./config");
var KTComponent = /** @class */ (function () {
    function KTComponent() {
        this._uid = null;
        this._element = null;
    }
    KTComponent.prototype._init = function (element) {
        element = dom_1.default.getElement(element);
        if (!element) {
            return;
        }
        this._element = element;
        this._events = new Map();
        this._uid = utils_1.default.geUID(this._name);
        data_1.default.set(this._element, this._name, this);
    };
    KTComponent.prototype._fireEvent = function (eventType, payload) {
        var _a;
        if (payload === void 0) { payload = null; }
        (_a = this._events.get(eventType)) === null || _a === void 0 ? void 0 : _a.forEach(function (callable) {
            callable(payload);
        });
    };
    KTComponent.prototype._dispatchEvent = function (eventType, payload) {
        if (payload === void 0) { payload = null; }
        var event = new CustomEvent(eventType, {
            detail: { payload: payload },
            bubbles: true,
            cancelable: true,
            composed: false,
        });
        if (!this._element)
            return;
        this._element.dispatchEvent(event);
    };
    KTComponent.prototype._getOption = function (name) {
        var value = this._config[name];
        if (value && (typeof value) === 'string') {
            return this._getResponsiveOption(value);
        }
        else {
            return value;
        }
    };
    KTComponent.prototype._getResponsiveOption = function (value) {
        var result = null;
        var width = dom_1.default.getViewPort().width;
        var parts = String(value).split('|');
        if (parts.length > 1) {
            parts.every(function (part) {
                if (part.includes(':')) {
                    var _a = part.split(':'), breakpointKey = _a[0], breakpointValue = _a[1];
                    var breakpoint = utils_1.default.getBreakpoint(breakpointKey);
                    if (breakpoint <= width) {
                        result = breakpointValue;
                        return false;
                    }
                }
                else {
                    result = part;
                }
                return true;
            });
        }
        else {
            result = value;
        }
        result = utils_1.default.parseDataAttribute(result);
        return result;
    };
    KTComponent.prototype._getGlobalConfig = function () {
        if (window.KTGlobalComponentsConfig && window.KTGlobalComponentsConfig[this._name]) {
            return window.KTGlobalComponentsConfig[this._name];
        }
        else if (config_1.default && config_1.default[this._name]) {
            return config_1.default[this._name];
        }
        else {
            return {};
        }
    };
    KTComponent.prototype._buildConfig = function (config) {
        if (config === void 0) { config = {}; }
        if (!this._element)
            return;
        this._config = __assign(__assign(__assign(__assign({}, this._defaultConfig), this._getGlobalConfig()), dom_1.default.getDataAttributes(this._element, this._name)), config);
    };
    KTComponent.prototype.dispose = function () {
        if (!this._element)
            return;
        data_1.default.remove(this._element, this._name);
    };
    KTComponent.prototype.on = function (eventType, callback) {
        var eventId = utils_1.default.geUID();
        if (!this._events.get(eventType)) {
            this._events.set(eventType, new Map());
        }
        this._events.get(eventType).set(eventId, callback);
        return eventId;
    };
    KTComponent.prototype.off = function (eventType, eventId) {
        var _a;
        (_a = this._events.get(eventType)) === null || _a === void 0 ? void 0 : _a.delete(eventId);
    };
    KTComponent.prototype.getOption = function (name) {
        return this._getOption(name);
    };
    KTComponent.prototype.getElement = function () {
        if (!this._element)
            return null;
        return this._element;
    };
    return KTComponent;
}());
exports.default = KTComponent;
//# sourceMappingURL=component.js.map