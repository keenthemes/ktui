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
import KTData from '../../helpers/data';
import KTComponent from '../component';
var KTTogglePassword = /** @class */ (function (_super) {
    __extends(KTTogglePassword, _super);
    function KTTogglePassword(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'toggle-password';
        _this._defaultConfig = {
            permanent: false
        };
        _this._config = _this._defaultConfig;
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._triggerElement = _this._element.querySelector('[data-toggle-password-trigger]');
        _this._inputElement = _this._element.querySelector('input[type="password"]');
        if (!_this._triggerElement || !_this._inputElement) {
            return _this;
        }
        _this._handlers();
        return _this;
    }
    KTTogglePassword.prototype._handlers = function () {
        var _this = this;
        if (!this._element)
            return;
        this._triggerElement.addEventListener('click', function () {
            _this._toggle();
        });
        this._inputElement.addEventListener('input', function () {
            _this._update();
        });
    };
    KTTogglePassword.prototype._toggle = function () {
        if (!this._element)
            return;
        var payload = { cancel: false };
        this._fireEvent('toggle', payload);
        this._dispatchEvent('toggle', payload);
        if (payload.cancel === true) {
            return;
        }
        if (this._isVisible()) {
            this._element.classList.remove('active');
            this._setVisible(false);
        }
        else {
            this._element.classList.add('active');
            this._setVisible(true);
        }
        this._fireEvent('toggled');
        this._dispatchEvent('toggled');
    };
    KTTogglePassword.prototype._update = function () {
        if (!this._element)
            return;
        if (this._getOption('permanent') === false) {
            if (this._isVisible()) {
                this._setVisible(false);
            }
        }
    };
    KTTogglePassword.prototype._isVisible = function () {
        return this._inputElement.getAttribute('type') === 'text';
    };
    KTTogglePassword.prototype._setVisible = function (flag) {
        if (flag) {
            this._inputElement.setAttribute('type', 'text');
        }
        else {
            this._inputElement.setAttribute('type', 'password');
        }
    };
    KTTogglePassword.prototype.toggle = function () {
        this._toggle();
    };
    KTTogglePassword.prototype.setVisible = function (flag) {
        this._setVisible(flag);
    };
    KTTogglePassword.prototype.isVisible = function () {
        return this._isVisible();
    };
    KTTogglePassword.getInstance = function (element) {
        if (!element)
            return null;
        if (KTData.has(element, 'toggle-password')) {
            return KTData.get(element, 'toggle-password');
        }
        if (element.getAttribute('data-toggle-password') === "true") {
            return new KTTogglePassword(element);
        }
        return null;
    };
    KTTogglePassword.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTTogglePassword(element, config);
    };
    KTTogglePassword.createInstances = function () {
        var elements = document.querySelectorAll('[data-toggle-password="true"]');
        elements.forEach(function (element) {
            new KTTogglePassword(element);
        });
    };
    KTTogglePassword.init = function () {
        KTTogglePassword.createInstances();
    };
    return KTTogglePassword;
}(KTComponent));
export { KTTogglePassword };
//# sourceMappingURL=toggle-password.js.map