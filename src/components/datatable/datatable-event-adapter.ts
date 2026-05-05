/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableEmit,
	KTDataTableEventAdapter,
} from './datatable-contracts';

export function createDataTableEventAdapter(
	fireEvent: KTDataTableEmit,
	dispatchEvent: KTDataTableEmit,
): KTDataTableEventAdapter {
	return {
		emit(eventName: string, eventData?: object): void {
			fireEvent(eventName, eventData);
			dispatchEvent(eventName, eventData);
		},
	};
}
