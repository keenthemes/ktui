"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = __importDefault(require("../helpers/data"));
var dom_1 = __importDefault(require("../helpers/dom"));
var utils_1 = __importDefault(require("../helpers/utils"));
var KTComponent = /** @class */ (function () {
    function KTComponent() {
        this._dataOptionPrefix = 'kt-';
        this._name = '';
        this._defaultConfig = {};
        this._config = {};
        this._events = new Map();
        this._uid = null;
        this._element = null;
    }
    KTComponent.prototype._init = function (element) {
        var resolvedElement = element ? dom_1.default.getElement(element) : null;
        if (!resolvedElement) {
            return;
        }
        this._element = resolvedElement;
        this._events = new Map();
        this._uid = utils_1.default.geUID(this._name);
        this._element.setAttribute("data-kt-".concat(this._name, "-initialized"), 'true');
        data_1.default.set(this._element, this._name, this);
    };
    KTComponent.prototype._fireEvent = function (eventType_1) {
        return __awaiter(this, arguments, void 0, function (eventType, payload) {
            var callbacks;
            if (payload === void 0) { payload = null; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callbacks = this._events.get(eventType);
                        if (callbacks instanceof Map == false) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(Array.from(callbacks.values())
                                .filter(function (callable) {
                                return typeof callable === 'function';
                            })
                                .map(function (callable) {
                                return Promise.resolve(callable(payload));
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
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
        var reponsiveValue = this._element
            ? dom_1.default.getCssProp(this._element, "--kt-".concat(this._name, "-").concat(utils_1.default.camelReverseCase(name)))
            : null;
        return reponsiveValue || value;
    };
    KTComponent.prototype._getGlobalConfig = function () {
        if (window.KTGlobalComponentsConfig &&
            window.KTGlobalComponentsConfig[this._name]) {
            return window.KTGlobalComponentsConfig[this._name];
        }
        else {
            return {};
        }
    };
    KTComponent.prototype._buildConfig = function (config) {
        if (config === void 0) { config = {}; }
        if (!this._element)
            return;
        this._config = __assign(__assign(__assign(__assign({}, this._defaultConfig), this._getGlobalConfig()), dom_1.default.getDataAttributes(this._element, this._dataOptionPrefix + this._name)), config);
    };
    KTComponent.prototype.dispose = function () {
        if (!this._element)
            return;
        this._element.removeAttribute("data-kt-".concat(this._name, "-initialized"));
        data_1.default.remove(this._element, this._name);
    };
    KTComponent.prototype.on = function (eventType, callback) {
        var eventId = utils_1.default.geUID();
        if (!this._events.get(eventType)) {
            this._events.set(eventType, new Map());
        }
        var eventMap = this._events.get(eventType);
        if (eventMap) {
            eventMap.set(eventId, callback);
        }
        return eventId;
    };
    KTComponent.prototype.off = function (eventType, eventId) {
        var eventMap = this._events.get(eventType);
        if (eventMap) {
            eventMap.delete(eventId);
        }
    };
    KTComponent.prototype.getOption = function (name) {
        return this._getOption(name);
    };
    KTComponent.prototype.getElement = function () {
        return this._element;
    };
    return KTComponent;
}());
exports.default = KTComponent;
//# sourceMappingURL=component.js.map