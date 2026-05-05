/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTRepeaterConfigInterface {
	target: string;
	wrapper: string;
	limit: number;
}

export interface KTRepeaterInterface {
	add(): void;
	getOption(name: string): unknown;
	getElement(): HTMLElement | null;
	on(eventName: string, handler: CallableFunction): string;
	off(eventName: string, eventId: string): void;
	dispose(): void;
}
