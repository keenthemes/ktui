/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { LocaleConfigInterface } from './types';
/**
 * Generates a locale configuration object based on the given locale and first day of the week.
 *
 * @param {string} locale - The locale code to generate the configuration for.
 * @param {number} firstDayOfWeek - The first day of the week, where 0 represents Sunday.
 * @return {LocaleConfigInterface} The generated locale configuration object.
 */
export declare const generateLocaleConfig: (locale: string, firstDayOfWeek: number) => LocaleConfigInterface;
export declare const DefaultLocales: {
    [key: string]: LocaleConfigInterface;
};
//# sourceMappingURL=locales.d.ts.map