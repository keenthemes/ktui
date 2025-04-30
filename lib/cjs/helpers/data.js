"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KTElementMap = new Map();
var KTData = {
    set: function (element, key, value) {
        if (!KTElementMap.has(element)) {
            KTElementMap.set(element, new Map());
        }
        var valueMap = KTElementMap.get(element);
        valueMap.set(key, value);
    },
    get: function (element, key) {
        if (KTElementMap.has(element)) {
            return KTElementMap.get(element).get(key) || null;
        }
        return null;
    },
    has: function (element, key) {
        return KTElementMap.has(element) && KTElementMap.get(element).has(key);
    },
    remove: function (element, key) {
        if (!KTElementMap.has(element) || !KTElementMap.get(element).has(key)) {
            return;
        }
        var valueMap = KTElementMap.get(element);
        valueMap.delete(key);
        if (valueMap.size === 0) {
            KTElementMap.delete(element);
        }
    }
};
exports.default = KTData;
//# sourceMappingURL=data.js.map