/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTDom from './helpers/dom';
import KTUtils from './helpers/utils';
import KTEventHandler from './helpers/event-handler';
import KTData from './helpers/data';
import { KTDropdown } from './components/dropdown';
import { KTContextMenu } from './components/context-menu';
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
import { KTRating } from './components/rating';
import { KTRepeater } from './components/repeater';
import { KTClipboard } from './components/clipboard';
import { KTRangeSlider } from './components/range-slider';
import { KTPinInput } from './components/pin-input';
import { KTCarousel } from './components/carousel';

export { KTDropdown } from './components/dropdown';
export { KTContextMenu } from './components/context-menu';
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
export { KTRating } from './components/rating';
export { KTRepeater } from './components/repeater';
export { KTClipboard } from './components/clipboard';
export { KTRangeSlider } from './components/range-slider';
export { KTPinInput } from './components/pin-input';
export { KTCarousel } from './components/carousel';

export type {
	KTAccordionConfigInterface,
	KTAccordionInterface,
} from './components/accordion';
export type {
	KTCollapseConfigInterface,
	KTCollapseInterface,
} from './components/collapse';
export type {
	KTDataTableSortOrderInterface,
	KTDataTableDataInterface,
	KTDataTableState,
	KTDataTableInterface,
	KTDataTableResponseDataInterface,
	KTDataTableConfigInterface,
	KTDataTableColumnFilterTypeInterface,
	KTDataTableColumnFilterInterface,
	KTDataTableCheckConfigInterface,
	KTDataTableCheckInterface,
	KTDataTableCheckChangePayloadInterface,
	KTDataTableLockedRowsConfigInterface,
	KTDataTableLockedColumnsConfigInterface,
	KTDataTableLockedLayoutConfigInterface,
	KTDataTableLayoutPluginContextInterface,
	KTDataTableLayoutPluginInterface,
} from './components/datatable';
export type {
	KTDismissConfigInterface,
	KTDismissInterface,
} from './components/dismiss';
export type {
	KTDrawerConfigInterface,
	KTDrawerInterface,
} from './components/drawer';
export type {
	KTDropdownConfigInterface,
	KTDropdownInterface,
} from './components/dropdown';
export type {
	KTContextMenuConfigInterface,
	KTContextMenuInterface,
} from './components/context-menu';
export type {
	KTImageInputConfigInterface,
	KTImageInputInterface,
} from './components/image-input';
export type {
	KTModalConfigInterface,
	KTModalInterface,
} from './components/modal';
export type {
	KTRatingConfigInterface,
	KTRatingInterface,
	KTRatingSymbolType,
} from './components/rating';
export type {
	KTReparentConfigInterface,
	KTReparentInterface,
} from './components/reparent';
export type {
	KTRepeaterConfigInterface,
	KTRepeaterInterface,
} from './components/repeater';
export type {
	KTClipboardConfigInterface,
	KTClipboardInterface,
} from './components/clipboard';
export type {
	KTRangeSliderConfigInterface,
	KTRangeSliderEventPayloadInterface,
	KTRangeSliderInterface,
} from './components/range-slider';
export type {
	KTPinInputConfigInterface,
	KTPinInputEventPayloadInterface,
	KTPinInputInterface,
} from './components/pin-input';
export type {
	KTCarouselConfigInterface,
	KTCarouselChangePayloadInterface,
	KTCarouselInterface,
} from './components/carousel';
export type {
	KTScrollableConfigInterface,
	KTScrollableInterface,
} from './components/scrollable';
export type {
	KTScrollspyConfigInterface,
	KTScrollspyInterface,
} from './components/scrollspy';
export type {
	KTScrolltoConfigInterface,
	KTScrolltoInterface,
} from './components/scrollto';
export type {
	KTSelectConfigInterface,
	KTSelectOption,
} from './components/select';
export type {
	KTStepperConfigInterface,
	KTStepperInterface,
} from './components/stepper';
export type {
	KTStickyConfigInterface,
	KTStickyInterface,
} from './components/sticky';
export type { KTTabsConfigInterface, KTTabsInterface } from './components/tabs';
export type {
	KTThemeSwitchConfigInterface,
	KTThemeSwitchInterface,
} from './components/theme-switch';
export type {
	KTToastConfigInterface,
	KTToastInterface,
} from './components/toast';
export type {
	KTToggleConfigInterface,
	KTToggleInterface,
} from './components/toggle';
export type {
	KTTogglePasswordConfigInterface,
	KTTogglePasswordInterface,
} from './components/toggle-password';
export type {
	KTTooltipConfigInterface,
	KTTooltipInterface,
} from './components/tooltip';

export const KTComponents = {
	init(): void {
		KTDropdown.init();
		KTContextMenu.init();
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
		KTRating.init();
		KTRepeater.init();
		KTClipboard.init();
		KTRangeSlider.init();
		KTPinInput.init();
		KTCarousel.init();
	},
};

declare global {
	interface Window {
		KTUtils: typeof KTUtils;
		KTDom: typeof KTDom;
		KTEventHandler: typeof KTEventHandler;
		KTData: typeof KTData;
		KTDropdown: typeof KTDropdown;
		KTContextMenu: typeof KTContextMenu;
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
		KTRating: typeof KTRating;
		KTRepeater: typeof KTRepeater;
		KTClipboard: typeof KTClipboard;
		KTRangeSlider: typeof KTRangeSlider;
		KTPinInput: typeof KTPinInput;
		KTCarousel: typeof KTCarousel;
		KTComponents: typeof KTComponents;
	}
}

export default KTComponents;
