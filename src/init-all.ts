/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTDom from './helpers/dom';
import { KTComponents } from './index';

export const initAllComponents = (): void => {
	KTDom.ready(() => {
		KTComponents.init();
	});
};

initAllComponents();
