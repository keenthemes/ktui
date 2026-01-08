/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTDom from './helpers/dom';
import KTUtils from './helpers/utils';
import KTEventHandler from './helpers/event-handler';
import KTData from './helpers/data';
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
import { KTThemeSwitch } from './components/theme-switch';
import { KTImageInput } from './components/image-input';
import { KTTogglePassword } from './components/toggle-password';
import { KTDataTable } from './components/datatable';
import { KTSelect } from './components/select';
import { KTToast } from './components/toast';

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
export { KTThemeSwitch } from './components/theme-switch';
export { KTImageInput } from './components/image-input';
export { KTTogglePassword } from './components/toggle-password';
export { KTDataTable } from './components/datatable';
export { KTSelect } from './components/select';
export { KTToast } from './components/toast';

const KTComponents = {
	init(): void {
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
		KTThemeSwitch.init();
		KTImageInput.init();
		KTTogglePassword.init();
		KTDataTable.init();
		KTSelect.init();
		KTToast.init();
	},
};

declare global {
	interface Window {
		KTUtils: typeof KTUtils;
		KTDom: typeof KTDom;
		KTEventHandler: typeof KTEventHandler;
		KTData: typeof KTData;
		KTDropdown: typeof KTDropdown;
		KTModal: typeof KTModal;
		KTDrawer: typeof KTDrawer;
		KTCollapse: typeof KTCollapse;
		KTDismiss: typeof KTDismiss;
		KTTabs: typeof KTTabs;
		KTAccordion: typeof KTAccordion;
		KTScrollspy: typeof KTScrollspy;
		KTScrollable: typeof KTScrollable;
		KTScrollto: typeof KTScrollto;
		KTSticky: typeof KTSticky;
		KTReparent: typeof KTReparent;
		KTToggle: typeof KTToggle;
		KTTooltip: typeof KTTooltip;
		KTStepper: typeof KTStepper;
		KTThemeSwitch: typeof KTThemeSwitch;
		KTImageInput: typeof KTImageInput;
		KTTogglePassword: typeof KTTogglePassword;
		KTDataTable: typeof KTDataTable;
		KTSelect: typeof KTSelect;
		KTToast: typeof KTToast;
		KTComponents: typeof KTComponents;
	}
}

export default KTComponents;

KTDom.ready(() => {
	KTComponents.init();
});
