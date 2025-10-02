"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLocales = exports.generateLocaleConfig = void 0;
/**
 * Generates a locale configuration object based on the given locale and first day of the week.
 *
 * @param {string} locale - The locale code to generate the configuration for.
 * @param {number} firstDayOfWeek - The first day of the week, where 0 represents Sunday.
 * @return {LocaleConfigInterface} The generated locale configuration object.
 */
var generateLocaleConfig = function (locale, firstDayOfWeek) { return ({
    // Names of months (e.g., January, February, ...)
    monthNames: Array.from({ length: 12 }, function (_, month) {
        return new Date(0, month).toLocaleString(locale, { month: 'long' });
    }),
    // Shortened names of months (e.g., Jan, Feb, ...)
    monthNamesShort: Array.from({ length: 12 }, function (_, month) {
        return new Date(0, month).toLocaleString(locale, { month: 'short' });
    }),
    // Names of days of the week (e.g., Sunday, Monday, ...)
    dayNames: Array.from({ length: 7 }, function (_, day) {
        return new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'long' });
    }),
    // Shortened names of days of the week (e.g., Sun, Mon, ...)
    dayNamesShort: Array.from({ length: 7 }, function (_, day) {
        return new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'short' });
    }),
    // The first day of the week is the first day of the week in the selected locale
    firstDayOfWeek: firstDayOfWeek,
    // Names of days of the week, abbreviated (e.g., S, M, ...)
    dayNamesMin: Array.from({ length: 7 }, function (_, day) {
        return new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'narrow' });
    }),
}); };
exports.generateLocaleConfig = generateLocaleConfig;
exports.DefaultLocales = {
    // English (United States)
    'en-US': (0, exports.generateLocaleConfig)('en-US', 0),
    // Chinese (China)
    'zh-CN': (0, exports.generateLocaleConfig)('zh-CN', 0),
    // Spanish (Spain)
    'es-ES': (0, exports.generateLocaleConfig)('es-ES', 1),
    // French (France)
    'fr-FR': (0, exports.generateLocaleConfig)('fr-FR', 1),
    // Russian (Russia)
    'ru-RU': (0, exports.generateLocaleConfig)('ru-RU', 1),
    // Japanese (Japan)
    'ja-JP': (0, exports.generateLocaleConfig)('ja-JP', 0),
    // Korean (South Korea)
    'ko-KR': (0, exports.generateLocaleConfig)('ko-KR', 0),
    // Indonesian (Indonesia)
    'id-ID': (0, exports.generateLocaleConfig)('id-ID', 0),
    // Malay (Malaysia)
    'ms-MY': (0, exports.generateLocaleConfig)('ms-MY', 1),
    // Italian (Italy)
    'it-IT': (0, exports.generateLocaleConfig)('it-IT', 1),
    // Portuguese (Portugal)
    'pt-PT': (0, exports.generateLocaleConfig)('pt-PT', 1),
    // German (Germany)
    'de-DE': (0, exports.generateLocaleConfig)('de-DE', 1),
    // Chinese (Hong Kong)
    'zh-HK': (0, exports.generateLocaleConfig)('zh-HK', 0),
    // Chinese (Taiwan)
    'zh-TW': (0, exports.generateLocaleConfig)('zh-TW', 0),
    // Vietnamese (Vietnam)
    'vi-VN': (0, exports.generateLocaleConfig)('vi-VN', 0),
    // Turkish (Turkey)
    'tr-TR': (0, exports.generateLocaleConfig)('tr-TR', 1),
    // Thai (Thailand)
    'th-TH': (0, exports.generateLocaleConfig)('th-TH', 0),
    // Arabic (Egypt)
    'ar-EG': (0, exports.generateLocaleConfig)('ar-EG', 0),
};
//# sourceMappingURL=locales.js.map