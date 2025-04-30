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
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTComponent from '../component';
var KTReparent = /** @class */ (function (_super) {
    __extends(KTReparent, _super);
    function KTReparent(element, config) {
        if (config === void 0) { config = null; }
        var _this = _super.call(this) || this;
        _this._name = 'reparent';
        _this._defaultConfig = {
            mode: '',
            target: ''
        };
        if (KTData.has(element, _this._name))
            return _this;
        _this._init(element);
        _this._buildConfig(config);
        _this._update();
        return _this;
    }
    KTReparent.prototype._update = function () {
        if (!this._element)
            return;
        var target = this._getOption('target');
        var targetEl = KTDom.getElement(target);
        var mode = this._getOption('mode');
        if (targetEl && this._element.parentNode !== targetEl) {
            if (mode === 'prepend') {
                targetEl.prepend(this._element);
            }
            else if (mode === 'append') {
                targetEl.append(this._element);
            }
        }
    };
    KTReparent.prototype.update = function () {
        this._update();
    };
    KTReparent.handleResize = function () {
        window.addEventListener('resize', function () {
            var timer;
            KTUtils.throttle(timer, function () {
                document.querySelectorAll('[data-reparent]').forEach(function (element) {
                    var reparent = KTReparent.getInstance(element);
                    reparent === null || reparent === void 0 ? void 0 : reparent.update();
                });
            }, 200);
        });
    };
    KTReparent.getInstance = function (element) {
        return KTData.get(element, 'reparent');
    };
    KTReparent.getOrCreateInstance = function (element, config) {
        return this.getInstance(element) || new KTReparent(element, config);
    };
    KTReparent.createInstances = function () {
        var elements = document.querySelectorAll('[data-reparent="true"]');
        elements.forEach(function (element) {
            new KTReparent(element);
        });
    };
    KTReparent.init = function () {
        KTReparent.createInstances();
        if (window.KT_REPARENT_INITIALIZED !== true) {
            KTReparent.handleResize();
            window.KT_REPARENT_INITIALIZED = true;
        }
    };
    return KTReparent;
}(KTComponent));
export { KTReparent };
//# sourceMappingURL=reparent.js.map