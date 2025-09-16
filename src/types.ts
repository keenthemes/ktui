/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export declare type KTCallableType = (
	event?: Event,
	target?: HTMLElement
) => void | boolean;

export declare type KTViewPortType = {
	width: number;
	height: number;
};

export declare type KTOffsetType = {
	top: number;
	left: number;
	right: number;
	bottom: number;
};

export declare type KTOptionType = string | number | boolean | object;
