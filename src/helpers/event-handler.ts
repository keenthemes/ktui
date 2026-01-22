/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTCallableType } from '../types';
import KTUtils from './utils';

export interface KTDelegatedEventHandlersInterface {
	[key: string]: KTCallableType;
}

const KTDelegatedEventHandlers: KTDelegatedEventHandlersInterface = {};

const KTEventHandler = {
	on: function (
		element: HTMLElement,
		selector: string,
		eventName: string,
		handler: KTCallableType,
	): string {
		if (element === null) {
			return null;
		}

		const eventId = KTUtils.geUID('event');

		KTDelegatedEventHandlers[eventId] = (
			event: Event & { target: HTMLElement },
		) => {
			// Fix: Check selector dynamically instead of pre-computing targets
			// This allows event delegation to work with dynamically added elements
			let target = event.target as HTMLElement;

			while (target && target !== element) {
				// Check if current target matches the selector
				if (target.matches && target.matches(selector)) {
					handler.call(this, event, target);
					return; // Stop bubbling once we've handled it
				}

				target = target.parentNode as HTMLElement;
			}
		};

		element.addEventListener(eventName, KTDelegatedEventHandlers[eventId]);

		return eventId;
	},

	off(element: HTMLElement, eventName: string, eventId: string) {
		if (!element || KTDelegatedEventHandlers[eventId] === null) {
			return;
		}

		element.removeEventListener(eventName, KTDelegatedEventHandlers[eventId]);

		delete KTDelegatedEventHandlers[eventId];
	},
};

export default KTEventHandler;
