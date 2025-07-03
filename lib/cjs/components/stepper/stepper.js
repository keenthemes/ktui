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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTStepper = void 0;
var data_1 = require("../../helpers/data");
var dom_1 = require("../../helpers/dom");
var component_1 = require("../component");
var KTStepper = /** @class */ (function (_super) {
    __extends(KTStepper, _super);
    function KTStepper(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'stepper';
        _this._defaultConfig = {
            hiddenClass: 'hidden',
            activeStep: 1,
        };
        _this._config = _this._defaultConfig;
        _this._activeStep = 0;
        _this._nextElement = null;
        _this._backElement = null;
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        if (!_this._element)
            return _this;
        _this._nextElement = _this._element.querySelector('[data-kt-stepper-next]');
        _this._backElement = _this._element.querySelector('[data-kt-stepper-back]');
        _this._activeStep = 1;
        if (_this._getOption('activeStep') !== _this._activeStep) {
            _this._go(_this._getOption('activeStep'));
        }
        _this._update();
        _this._handlers();
        return _this;
    }
    KTStepper.prototype._handlers = function () {
        var _this = this;
        if (!this._nextElement) {
            console.error('data-kt-stepper-next not found');
            return;
        }
        if (this._nextElement) {
            this._nextElement.addEventListener('click', function (event) {
                event.preventDefault();
                _this._goNext();
            });
        }
        if (this._backElement) {
            this._backElement.addEventListener('click', function (event) {
                event.preventDefault();
                _this._goBack();
            });
        }
    };
    KTStepper.prototype._update = function () {
        var _this = this;
        if (!this._element)
            return;
        var state = '';
        if (this._activeStep === this._getTotalSteps()) {
            state = 'last';
        }
        else if (this._activeStep === 1) {
            state = 'first';
        }
        else {
            state = 'between';
        }
        this._element.classList.remove('first');
        this._element.classList.remove('last');
        this._element.classList.remove('between');
        this._element.classList.add(state);
        this._getItemElements().forEach(function (element, index) {
            var contentElement = dom_1.default.getElement(element.getAttribute('data-kt-stepper-item'));
            if (!contentElement)
                return;
            element.classList.remove('active');
            element.classList.remove('completed');
            element.classList.remove('pending');
            var numberElement = element.querySelector('[data-kt-stepper-number]');
            if (numberElement)
                numberElement.innerHTML = String(index + 1);
            if (index + 1 == _this._activeStep) {
                element.classList.add('active');
                contentElement.classList.remove(_this._getOption('hiddenClass'));
            }
            else {
                contentElement.classList.add(_this._getOption('hiddenClass'));
                if (index + 1 < _this._activeStep) {
                    element.classList.add('completed');
                }
                else {
                    element.classList.add('pending');
                }
            }
        });
    };
    KTStepper.prototype._getItemElements = function () {
        var elements = [];
        this._element
            .querySelectorAll('[data-kt-stepper-item]')
            .forEach(function (element) {
            if (dom_1.default.isVisible(element)) {
                elements.push(element);
            }
        });
        return elements;
    };
    KTStepper.prototype._go = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (step === this._activeStep || step > this._getTotalSteps() || step < 0)
                            return [2 /*return*/];
                        payload = { step: step, cancel: false };
                        return [4 /*yield*/, this._fireEvent('change', payload)];
                    case 1:
                        _a.sent();
                        this._dispatchEvent('change', payload);
                        if (payload.cancel === true) {
                            return [2 /*return*/];
                        }
                        this._activeStep = step;
                        this._update();
                        this._fireEvent('changed');
                        this._dispatchEvent('changed');
                        return [2 /*return*/];
                }
            });
        });
    };
    KTStepper.prototype._goTo = function (itemElement) {
        var step = this._getStep(itemElement);
        this._go(step);
    };
    KTStepper.prototype._getStep = function (itemElement) {
        var step = -1;
        this._getItemElements().forEach(function (element, index) {
            if (element === itemElement) {
                step = index + 1;
                return;
            }
        });
        return step;
    };
    KTStepper.prototype._getItemElement = function (step) {
        return this._getItemElements()[step - 1];
    };
    KTStepper.prototype._getTotalSteps = function () {
        return this._getItemElements().length;
    };
    KTStepper.prototype._goNext = function () {
        var step;
        if (this._getTotalSteps() >= this._activeStep + 1) {
            step = this._activeStep + 1;
        }
        else {
            step = this._getTotalSteps();
        }
        this._go(step);
    };
    KTStepper.prototype._goBack = function () {
        var step;
        if (this._activeStep - 1 > 1) {
            step = this._activeStep - 1;
        }
        else {
            step = 1;
        }
        this._go(step);
    };
    KTStepper.prototype._goLast = function () {
        var step = this._getTotalSteps();
        this._go(step);
    };
    KTStepper.prototype._goFirst = function () {
        var step = 1;
        this._go(step);
    };
    KTStepper.prototype._isLast = function () {
        return this._getTotalSteps() === this._activeStep + 1;
    };
    KTStepper.prototype._isFirst = function () {
        return this._activeStep === 1;
    };
    KTStepper.prototype.isLast = function () {
        return this._isLast();
    };
    KTStepper.prototype.isFirst = function () {
        return this._isFirst();
    };
    KTStepper.prototype.go = function (step) {
        this._go(step);
    };
    KTStepper.prototype.goTo = function (itemElement) {
        this.goTo(itemElement);
    };
    KTStepper.prototype.goFirst = function () {
        this._goFirst();
    };
    KTStepper.prototype.goLast = function () {
        this._goLast();
    };
    KTStepper.prototype.goNext = function () {
        this._goNext();
    };
    KTStepper.prototype.goBack = function () {
        this._goBack();
    };
    KTStepper.prototype.update = function () {
        this._update();
    };
    KTStepper.prototype.getStep = function (itemElement) {
        return this._getStep(itemElement);
    };
    KTStepper.prototype.getItemElement = function (step) {
        return this._getItemElement(step);
    };
    KTStepper.prototype.getTotalSteps = function () {
        return this._getTotalSteps();
    };
    KTStepper.prototype.getItemElements = function () {
        return this._getItemElements();
    };
    KTStepper.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'stepper')) {
            return data_1.default.get(element, 'stepper');
        }
        if (element.getAttribute('data-kt-stepper')) {
            return new KTStepper(element);
        }
        return null;
    };
    KTStepper.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTStepper(element, config);
    };
    KTStepper.createInstances = function () {
        var elements = document.querySelectorAll('[data-kt-stepper]');
        elements.forEach(function (element) {
            new KTStepper(element);
        });
    };
    KTStepper.init = function () {
        KTStepper.createInstances();
    };
    return KTStepper;
}(component_1.default));
exports.KTStepper = KTStepper;
if (typeof window !== 'undefined') {
    window.KTStepper = KTStepper;
}
//# sourceMappingURL=stepper.js.map