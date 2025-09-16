"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTToast = exports.KTSelect = exports.KTDatepicker = exports.KTDataTable = exports.KTTogglePassword = exports.KTImageInput = exports.KTThemeSwitch = exports.KTStepper = exports.KTTooltip = exports.KTToggle = exports.KTReparent = exports.KTSticky = exports.KTScrollto = exports.KTScrollable = exports.KTScrollspy = exports.KTAccordion = exports.KTTabs = exports.KTDismiss = exports.KTCollapse = exports.KTDrawer = exports.KTModal = exports.KTDropdown = void 0;
var dom_1 = __importDefault(require("./helpers/dom"));
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
var theme_switch_1 = require("./components/theme-switch");
var image_input_1 = require("./components/image-input");
var toggle_password_1 = require("./components/toggle-password");
var datatable_1 = require("./components/datatable");
var datepicker_1 = require("./components/datepicker");
var select_1 = require("./components/select");
var toast_1 = require("./components/toast");
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
var theme_switch_2 = require("./components/theme-switch");
Object.defineProperty(exports, "KTThemeSwitch", { enumerable: true, get: function () { return theme_switch_2.KTThemeSwitch; } });
var image_input_2 = require("./components/image-input");
Object.defineProperty(exports, "KTImageInput", { enumerable: true, get: function () { return image_input_2.KTImageInput; } });
var toggle_password_2 = require("./components/toggle-password");
Object.defineProperty(exports, "KTTogglePassword", { enumerable: true, get: function () { return toggle_password_2.KTTogglePassword; } });
var datatable_2 = require("./components/datatable");
Object.defineProperty(exports, "KTDataTable", { enumerable: true, get: function () { return datatable_2.KTDataTable; } });
var datepicker_2 = require("./components/datepicker");
Object.defineProperty(exports, "KTDatepicker", { enumerable: true, get: function () { return datepicker_2.KTDatepicker; } });
var select_2 = require("./components/select");
Object.defineProperty(exports, "KTSelect", { enumerable: true, get: function () { return select_2.KTSelect; } });
var toast_2 = require("./components/toast");
Object.defineProperty(exports, "KTToast", { enumerable: true, get: function () { return toast_2.KTToast; } });
var KTComponents = {
    init: function () {
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
        theme_switch_1.KTThemeSwitch.init();
        image_input_1.KTImageInput.init();
        toggle_password_1.KTTogglePassword.init();
        datatable_1.KTDataTable.init();
        datepicker_1.KTDatepicker.init();
        select_1.KTSelect.init();
        toast_1.KTToast.init();
    },
};
exports.default = KTComponents;
dom_1.default.ready(function () {
    KTComponents.init();
});
//# sourceMappingURL=index.js.map