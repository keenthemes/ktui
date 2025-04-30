import { KTOptionType } from '../types';

const KTUtils = {
	geUID(prefix: string = ''): string {
		return prefix + Math.floor(Math.random() * new Date().getTime());
	},

	getCssVar(variable: string): string {
		let hex = getComputedStyle(document.documentElement).getPropertyValue(
			variable
		);

		if (hex && hex.length > 0) {
			hex = hex.trim();
		}

		return hex;
	},

	parseDataAttribute(value: string): KTOptionType {
		if (value === 'true') {
			return true;
		}

		if (value === 'false') {
			return false;
		}

		if (value === Number(value).toString()) {
			return Number(value);
		}

		if (value === '' || value === 'null') {
			return null;
		}

		if (typeof value !== 'string') {
			return value;
		}

		try {
			return KTUtils.parseJson(value) as object;
		} catch {
			return value;
		}
	},

	parseJson(value: string): JSON {
		return value && value.length > 0
			? JSON.parse(decodeURIComponent(value))
			: null;
	},

	parseSelector(selector: string): string {
		if (selector && window.CSS && window.CSS.escape) {
			// Escape any IDs in the selector using CSS.escape
			selector = selector.replace(
				/#([^\s"#']+)/g,
				(match, id) => `#${window.CSS.escape(id)}`
			);
		}

		return selector;
	},

	capitalize(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	},

	uncapitalize(value: string): string {
		return value.charAt(0).toLowerCase() + value.slice(1);
	},

	camelCase(value: string): string {
		return value.replace(/-([a-z])/g, (match, letter) => {
			return letter.toUpperCase();
		});
	},

	camelReverseCase(str: string): string {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	},

	isRTL(): boolean {
		const htmlElement = document.querySelector('html');
		return Boolean(
			htmlElement && htmlElement.getAttribute('direction') === 'rtl'
		);
	},

	throttle(
		timer: undefined | ReturnType<typeof setTimeout>,
		func: CallableFunction,
		delay: number
	): void {
		// If setTimeout is already scheduled, no need to do anything
		if (timer) {
			return;
		}

		// Schedule a setTimeout after delay seconds
		timer = setTimeout(() => {
			func();

			// Once setTimeout function execution is finished, timerId = undefined so that in <br>
			// the next scroll event function execution can be scheduled by the setTimeout
			clearTimeout(timer);
		}, delay);
	},

	checksum(value: string): string {
		let hash = 0;

		for (let i = 0; i < value.length; i++) {
			hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
		}

		return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
	},

	stringToBoolean: (value: KTOptionType): boolean | null => {
		if (typeof value === 'boolean') return value;
		if (typeof value !== 'string') return null;

		const cleanedStr = value.toLowerCase().trim();
		if (cleanedStr === 'true') return true;
		if (cleanedStr === 'false') return false;
		return null;
	},

	stringToObject: <T>(value: KTOptionType): T | null => {
		try {
			const parsed = JSON.parse(value.toString() as string);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as T;
			}
			return null;
		} catch (error) {
			return null;
		}
	},

	stringToInteger: (value: KTOptionType | number): number | null => {
		// If already a number, return it as an integer
		if (typeof value === 'number' && !isNaN(value)) {
			return Math.floor(value);
		}

		// If not a string, return null
		if (typeof value !== 'string') return null;

		const cleanedStr = value.trim();
		const num = parseInt(cleanedStr, 10);
		if (!isNaN(num) && cleanedStr !== '') {
			return num;
		}
		return null;
	},

	stringToFloat: (value: KTOptionType | number): number | null => {
		// If already a number, return it as is
		if (typeof value === 'number' && !isNaN(value)) {
			return value;
		}

		// If not a string, return null
		if (typeof value !== 'string') return null;

		const cleanedStr = value.trim();
		const num = parseFloat(cleanedStr);
		if (!isNaN(num) && cleanedStr !== '') {
			return num;
		}
		return null;
	},
};

export default KTUtils;
