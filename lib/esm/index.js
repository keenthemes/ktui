/*
* Index
* @version: 1.0.0
* @author: Keenthemes
* Copyright 2024 Keenthemes
*/
import KTDom from './helpers/dom';
import { KTMenu } from './components/menu';
import { KTDropdown } from './components/dropdown';
import { KTModal } from './components/modal';
import { KTDrawer } from './components/drawer';
import { KTCollapse } from './components/collapse';
import { KTDismiss } from './components/dismiss';
import { KTTabs } from './components/tabs';
import { KTAccordion } from './components/accordion';
import { KTScrollspy } from './components/scrollspy';
import { KTScrollable } from './components/scrollable';
import { KTScrollto } from './components/scrollto';
import { KTSticky } from './components/sticky';
import { KTReparent } from './components/reparent';
import { KTToggle } from './components/toggle';
import { KTTooltip } from './components/tooltip';
import { KTStepper } from './components/stepper';
import { KTTheme } from './components/theme';
import { KTImageInput } from './components/image-input';
import { KTTogglePassword } from './components/toggle-password';
import { KTDataTable } from './components/datatable';
export { default as KTUtils } from './helpers/utils';
export { default as KTDom } from './helpers/dom';
export { default as KTEventHandler } from './helpers/event-handler';
export { KTMenu } from './components/menu';
export { KTDropdown } from './components/dropdown';
export { KTModal } from './components/modal';
export { KTDrawer } from './components/drawer';
export { KTCollapse } from './components/collapse';
export { KTDismiss } from './components/dismiss';
export { KTTabs } from './components/tabs';
export { KTAccordion } from './components/accordion';
export { KTScrollspy } from './components/scrollspy';
export { KTScrollable } from './components/scrollable';
export { KTScrollto } from './components/scrollto';
export { KTSticky } from './components/sticky';
export { KTReparent } from './components/reparent';
export { KTToggle } from './components/toggle';
export { KTTooltip } from './components/tooltip';
export { KTStepper } from './components/stepper';
export { KTTheme } from './components/theme';
export { KTImageInput } from './components/image-input';
export { KTTogglePassword } from './components/toggle-password';
export { KTDataTable } from './components/datatable';
var KTComponents = {
    init: function () {
        KTMenu.init();
        KTDropdown.init();
        KTModal.init();
        KTDrawer.init();
        KTCollapse.init();
        KTDismiss.init();
        KTTabs.init();
        KTAccordion.init();
        KTScrollspy.init();
        KTScrollable.init();
        KTScrollto.init();
        KTSticky.init();
        KTReparent.init();
        KTToggle.init();
        KTTooltip.init();
        KTStepper.init();
        KTTheme.init();
        KTImageInput.init();
        KTTogglePassword.init();
        KTDataTable.init();
    }
};
export default KTComponents;
KTDom.ready(function () {
    KTComponents.init();
});
//# sourceMappingURL=index.js.map