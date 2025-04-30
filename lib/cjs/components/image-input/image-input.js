"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTImageInput = void 0;
var data_1 = require("../../helpers/data");
var event_handler_1 = require("../../helpers/event-handler");
var component_1 = require("../component");
var KTImageInput = /** @class */ (function (_super) {
    __extends(KTImageInput, _super);
    function KTImageInput(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'image-input';
        _this._defaultConfig = {
            hiddenClass: 'hidden'
        };
        _this._previewUrl = '';
        if (data_1.default.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._inputElement = _this._element.querySelector('input[type="file"]');
        _this._hiddenElement = _this._element.querySelector('input[type="hidden"]');
        _this._removeElement = _this._element.querySelector('[data-image-input-remove]');
        _this._previewElement = _this._element.querySelector('.image-input-preview');
        _this._update();
        _this._handlers();
        return _this;
    }
    KTImageInput.prototype._handlers = function () {
        var _this = this;
        event_handler_1.default.on(this._element, '.image-input-placeholder', 'click', function (event) {
            event.preventDefault();
            _this._inputElement.click();
        });
        this._inputElement.addEventListener('change', function () {
            _this._change();
        });
        this._removeElement.addEventListener('click', function () {
            _this._remove();
        });
    };
    KTImageInput.prototype._change = function () {
        var _this = this;
        var payload = { cancel: false };
        this._fireEvent('change', payload);
        this._dispatchEvent('change', payload);
        if (payload.cancel === true) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            _this._previewElement.style.backgroundImage = "url(".concat(reader.result, ")");
        };
        reader.readAsDataURL(this._inputElement.files[0]);
        this._inputElement.value = "";
        this._hiddenElement.value = "";
        this._lastMode = 'new';
        this._element.classList.add('changed');
        this._removeElement.classList.remove('hidden');
        this._element.classList.remove('empty');
        this._fireEvent('changed');
        this._dispatchEvent('changed');
    };
    KTImageInput.prototype._remove = function () {
        var payload = { cancel: false };
        this._fireEvent('remove', payload);
        this._dispatchEvent('remove', payload);
        if (payload.cancel === true) {
            return;
        }
        this._element.classList.remove('empty');
        this._element.classList.remove('changed');
        if (this._lastMode == 'new') {
            if (this._previewUrl == '')
                this._removeElement.classList.add(this._getOption('hiddenClass'));
            if (this._previewUrl) {
                this._previewElement.style.backgroundImage = "url(".concat(this._previewUrl, ")");
            }
            else {
                this._previewElement.style.backgroundImage = 'none';
                this._element.classList.add('empty');
            }
            this._inputElement.value = "";
            this._hiddenElement.value = "";
            this._lastMode = 'saved';
        }
        else if (this._lastMode == 'saved') {
            if (this._previewUrl == '')
                this._removeElement.classList.add(this._getOption('hiddenClass'));
            this._previewElement.style.backgroundImage = 'none';
            this._element.classList.add('empty');
            this._hiddenElement.value = "1";
            this._inputElement.value = "";
            this._lastMode = 'placeholder';
        }
        else if (this._lastMode == 'placeholder') {
            if (this._previewUrl == '')
                this._removeElement.classList.add(this._getOption('hiddenClass'));
            if (this._previewUrl) {
                this._previewElement.style.backgroundImage = "url(".concat(this._previewUrl, ")");
            }
            else {
                this._element.classList.add('empty');
            }
            this._inputElement.value = "";
            this._hiddenElement.value = "";
            this._lastMode = 'saved';
        }
        this._fireEvent('remove');
        this._dispatchEvent('remove');
    };
    KTImageInput.prototype._update = function () {
        if (this._previewElement.style.backgroundImage) {
            this._setPreviewUrl(this._previewElement.style.backgroundImage);
            this._removeElement.classList.remove(this._getOption('hiddenClass'));
            this._lastMode = 'saved';
        }
        else {
            this._removeElement.classList.add(this._getOption('hiddenClass'));
            this._element.classList.add('empty');
            this._lastMode = 'placeholder';
        }
    };
    KTImageInput.prototype._getPreviewUrl = function () {
        return this._previewUrl;
    };
    KTImageInput.prototype._setPreviewUrl = function (url) {
        this._previewUrl = url.replace(/(url\(|\)|")/g, '');
    };
    KTImageInput.prototype.isEmpty = function () {
        return this._inputElement.value.length === 0;
    };
    KTImageInput.prototype.isChanged = function () {
        return this._inputElement.value.length > 0;
    };
    KTImageInput.prototype.remove = function () {
        this._remove();
    };
    KTImageInput.prototype.update = function () {
        this._update();
    };
    KTImageInput.prototype.setPreviewUrl = function (url) {
        this._setPreviewUrl(url);
    };
    KTImageInput.prototype.getPreviewUrl = function () {
        return this._getPreviewUrl();
    };
    KTImageInput.getInstance = function (element) {
        if (!element)
            return null;
        if (data_1.default.has(element, 'image-input')) {
            return data_1.default.get(element, 'image-input');
        }
        if (element.getAttribute('data-image-input') === "true") {
            return new KTImageInput(element);
        }
        return null;
    };
    KTImageInput.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTImageInput(element, config);
    };
    KTImageInput.createInstances = function () {
        var elements = document.querySelectorAll('[data-image-input="true"]');
        elements.forEach(function (element) {
            new KTImageInput(element);
        });
    };
    KTImageInput.init = function () {
        KTImageInput.createInstances();
    };
    return KTImageInput;
}(component_1.default));
exports.KTImageInput = KTImageInput;
//# sourceMappingURL=image-input.js.map