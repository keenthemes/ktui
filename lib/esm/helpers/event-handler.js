/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTUtils from './utils';
var KTDelegatedEventHandlers = {};
var KTEventHandler = {
    on: function (element, selector, eventName, handler) {
        var _this = this;
        if (element === null) {
            return null;
        }
        var eventId = KTUtils.geUID('event');
        KTDelegatedEventHandlers[eventId] = function (event) {
            var targets = element.querySelectorAll(selector);
            var target = event.target;
            while (target && target !== element) {
                for (var i = 0, j = targets.length; i < j; i++) {
                    if (target === targets[i]) {
                        handler.call(_this, event, target);
                    }
                }
                target = target.parentNode;
            }
        };
        element.addEventListener(eventName, KTDelegatedEventHandlers[eventId]);
        return eventId;
    },
    off: function (element, eventName, eventId) {
        if (!element || KTDelegatedEventHandlers[eventId] === null) {
            return;
        }
        element.removeEventListener(eventName, KTDelegatedEventHandlers[eventId]);
        delete KTDelegatedEventHandlers[eventId];
    },
};
export default KTEventHandler;
//# sourceMappingURL=event-handler.js.map