/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTOptionType } from '../types';
declare const KTUtils: {
    geUID(prefix?: string): string;
    getCssVar(variable: string): string;
    parseDataAttribute(value: KTOptionType): KTOptionType;
    parseJson(value: string | null): JSON | null;
    parseSelector(selector: string): string;
    capitalize(value: string): string;
    uncapitalize(value: string): string;
    camelCase(value: string): string;
    camelReverseCase(str: string): string;
    isRTL(): boolean;
    throttle(timer: undefined | ReturnType<typeof setTimeout>, func: CallableFunction, delay: number): void;
    checksum(value: string): string;
    stringToBoolean: (value: KTOptionType) => boolean | null;
    stringToObject: <T>(value: KTOptionType) => T | null;
    stringToInteger: (value: KTOptionType | number) => number | null;
    stringToFloat: (value: KTOptionType | number) => number | null;
};
export default KTUtils;
