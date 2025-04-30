"use strict";
/*
* Index
* @version: 1.0.0
* @author: Keenthemes
* Copyright 2024 Keenthemes
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTDataTable = exports.KTTogglePassword = exports.KTImageInput = exports.KTTheme = exports.KTStepper = exports.KTTooltip = exports.KTToggle = exports.KTReparent = exports.KTSticky = exports.KTScrollto = exports.KTScrollable = exports.KTScrollspy = exports.KTAccordion = exports.KTTabs = exports.KTDismiss = exports.KTCollapse = exports.KTDrawer = exports.KTModal = exports.KTDropdown = exports.KTMenu = exports.KTEventHandler = exports.KTDom = exports.KTUtils = void 0;
var dom_1 = require("./helpers/dom");
var menu_1 = require("./components/menu");
var dropdown_1 = require("./components/dropdown");
var modal_1 = require("./components/modal");
var drawer_1 = require("./components/drawer");
var collapse_1 = require("./components/collapse");
var dismiss_1 = require("./components/dismiss");
var tabs_1 = require("./components/tabs");
var accordion_1 = require("./components/accordion");
var scrollspy_1 = require("./components/scrollspy");
var scrollable_1 = require("./components/scrollable");
var scrollto_1 = require("./components/scrollto");
var sticky_1 = require("./components/sticky");
var reparent_1 = require("./components/reparent");
var toggle_1 = require("./components/toggle");
var tooltip_1 = require("./components/tooltip");
var stepper_1 = require("./components/stepper");
var theme_1 = require("./components/theme");
var image_input_1 = require("./components/image-input");
var toggle_password_1 = require("./components/toggle-password");
var datatable_1 = require("./components/datatable");
var utils_1 = require("./helpers/utils");
Object.defineProperty(exports, "KTUtils", { enumerable: true, get: function () { return utils_1.default; } });
var dom_2 = require("./helpers/dom");
Object.defineProperty(exports, "KTDom", { enumerable: true, get: function () { return dom_2.default; } });
var event_handler_1 = require("./helpers/event-handler");
Object.defineProperty(exports, "KTEventHandler", { enumerable: true, get: function () { return event_handler_1.default; } });
var menu_2 = require("./components/menu");
Object.defineProperty(exports, "KTMenu", { enumerable: true, get: function () { return menu_2.KTMenu; } });
var dropdown_2 = require("./components/dropdown");
Object.defineProperty(exports, "KTDropdown", { enumerable: true, get: function () { return dropdown_2.KTDropdown; } });
var modal_2 = require("./components/modal");
Object.defineProperty(exports, "KTModal", { enumerable: true, get: function () { return modal_2.KTModal; } });
var drawer_2 = require("./components/drawer");
Object.defineProperty(exports, "KTDrawer", { enumerable: true, get: function () { return drawer_2.KTDrawer; } });
var collapse_2 = require("./components/collapse");
Object.defineProperty(exports, "KTCollapse", { enumerable: true, get: function () { return collapse_2.KTCollapse; } });
var dismiss_2 = require("./components/dismiss");
Object.defineProperty(exports, "KTDismiss", { enumerable: true, get: function () { return dismiss_2.KTDismiss; } });
var tabs_2 = require("./components/tabs");
Object.defineProperty(exports, "KTTabs", { enumerable: true, get: function () { return tabs_2.KTTabs; } });
var accordion_2 = require("./components/accordion");
Object.defineProperty(exports, "KTAccordion", { enumerable: true, get: function () { return accordion_2.KTAccordion; } });
var scrollspy_2 = require("./components/scrollspy");
Object.defineProperty(exports, "KTScrollspy", { enumerable: true, get: function () { return scrollspy_2.KTScrollspy; } });
var scrollable_2 = require("./components/scrollable");
Object.defineProperty(exports, "KTScrollable", { enumerable: true, get: function () { return scrollable_2.KTScrollable; } });
var scrollto_2 = require("./components/scrollto");
Object.defineProperty(exports, "KTScrollto", { enumerable: true, get: function () { return scrollto_2.KTScrollto; } });
var sticky_2 = require("./components/sticky");
Object.defineProperty(exports, "KTSticky", { enumerable: true, get: function () { return sticky_2.KTSticky; } });
var reparent_2 = require("./components/reparent");
Object.defineProperty(exports, "KTReparent", { enumerable: true, get: function () { return reparent_2.KTReparent; } });
var toggle_2 = require("./components/toggle");
Object.defineProperty(exports, "KTToggle", { enumerable: true, get: function () { return toggle_2.KTToggle; } });
var tooltip_2 = require("./components/tooltip");
Object.defineProperty(exports, "KTTooltip", { enumerable: true, get: function () { return tooltip_2.KTTooltip; } });
var stepper_2 = require("./components/stepper");
Object.defineProperty(exports, "KTStepper", { enumerable: true, get: function () { return stepper_2.KTStepper; } });
var theme_2 = require("./components/theme");
Object.defineProperty(exports, "KTTheme", { enumerable: true, get: function () { return theme_2.KTTheme; } });
var image_input_2 = require("./components/image-input");
Object.defineProperty(exports, "KTImageInput", { enumerable: true, get: function () { return image_input_2.KTImageInput; } });
var toggle_password_2 = require("./components/toggle-password");
Object.defineProperty(exports, "KTTogglePassword", { enumerable: true, get: function () { return toggle_password_2.KTTogglePassword; } });
var datatable_2 = require("./components/datatable");
Object.defineProperty(exports, "KTDataTable", { enumerable: true, get: function () { return datatable_2.KTDataTable; } });
var KTComponents = {
    init: function () {
        menu_1.KTMenu.init();
        dropdown_1.KTDropdown.init();
        modal_1.KTModal.init();
        drawer_1.KTDrawer.init();
        collapse_1.KTCollapse.init();
        dismiss_1.KTDismiss.init();
        tabs_1.KTTabs.init();
        accordion_1.KTAccordion.init();
        scrollspy_1.KTScrollspy.init();
        scrollable_1.KTScrollable.init();
        scrollto_1.KTScrollto.init();
        sticky_1.KTSticky.init();
        reparent_1.KTReparent.init();
        toggle_1.KTToggle.init();
        tooltip_1.KTTooltip.init();
        stepper_1.KTStepper.init();
        theme_1.KTTheme.init();
        image_input_1.KTImageInput.init();
        toggle_password_1.KTTogglePassword.init();
        datatable_1.KTDataTable.init();
    }
};
exports.default = KTComponents;
dom_1.default.ready(function () {
    KTComponents.init();
});
//# sourceMappingURL=index.js.map