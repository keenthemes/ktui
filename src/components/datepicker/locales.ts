import { LocaleConfigInterface } from "./types";

/**
 * Generates a locale configuration object based on the given locale and first day of the week.
 *
 * @param {string} locale - The locale code to generate the configuration for.
 * @param {number} firstDayOfWeek - The first day of the week, where 0 represents Sunday.
 * @return {LocaleConfigInterface} The generated locale configuration object.
 */
export const generateLocaleConfig = (locale: string, firstDayOfWeek: number): LocaleConfigInterface => ({
	// Names of months (e.g., January, February, ...)
	monthNames: Array.from({ length: 12 }, (_, month) => new Date(0, month).toLocaleString(locale, { month: 'long' })),
	// Shortened names of months (e.g., Jan, Feb, ...)
	monthNamesShort: Array.from({ length: 12 }, (_, month) => new Date(0, month).toLocaleString(locale, { month: 'short' })),
	// Names of days of the week (e.g., Sunday, Monday, ...)
	dayNames: Array.from({ length: 7 }, (_, day) => new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'long' })),
	// Shortened names of days of the week (e.g., Sun, Mon, ...)
	dayNamesShort: Array.from({ length: 7 }, (_, day) => new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'short' })),
	// The first day of the week is the first day of the week in the selected locale
	firstDayOfWeek,
	// Names of days of the week, abbreviated (e.g., S, M, ...)
	dayNamesMin: Array.from({ length: 7 }, (_, day) => new Date(0, 0, day + 1).toLocaleString(locale, { weekday: 'narrow' })),
});

export const DefaultLocales: { [key: string]: LocaleConfigInterface } = {
	// English (United States)
	'en-US': generateLocaleConfig('en-US', 0),
	// Chinese (China)
	'zh-CN': generateLocaleConfig('zh-CN', 0),
	// Spanish (Spain)
	'es-ES': generateLocaleConfig('es-ES', 1),
	// French (France)
	'fr-FR': generateLocaleConfig('fr-FR', 1),
	// Russian (Russia)
	'ru-RU': generateLocaleConfig('ru-RU', 1),
	// Japanese (Japan)
	'ja-JP': generateLocaleConfig('ja-JP', 0),
	// Korean (South Korea)
	'ko-KR': generateLocaleConfig('ko-KR', 0),
	// Indonesian (Indonesia)
	'id-ID': generateLocaleConfig('id-ID', 0),
	// Malay (Malaysia)
	'ms-MY': generateLocaleConfig('ms-MY', 1),
	// Italian (Italy)
	'it-IT': generateLocaleConfig('it-IT', 1),
	// Portuguese (Portugal)
	'pt-PT': generateLocaleConfig('pt-PT', 1),
	// German (Germany)
	'de-DE': generateLocaleConfig('de-DE', 1),
	// Chinese (Hong Kong)
	'zh-HK': generateLocaleConfig('zh-HK', 0),
	// Chinese (Taiwan)
	'zh-TW': generateLocaleConfig('zh-TW', 0),
	// Vietnamese (Vietnam)
	'vi-VN': generateLocaleConfig('vi-VN', 0),
	// Turkish (Turkey)
	'tr-TR': generateLocaleConfig('tr-TR', 1),
	// Thai (Thailand)
	'th-TH': generateLocaleConfig('th-TH', 0),
	// Arabic (Egypt)
	'ar-EG': generateLocaleConfig('ar-EG', 0),
};