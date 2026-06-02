import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KTUtils from '../utils';

describe('KTUtils', () => {
	describe('geUID', () => {
		it('returns string starting with prefix', () => {
			const uid = KTUtils.geUID('test-');
			expect(uid).toMatch(/^test-/);
		});

		it('returns different values on successive calls', () => {
			const a = KTUtils.geUID('p-');
			const b = KTUtils.geUID('p-');
			expect(a).not.toBe(b);
		});

		it('works without prefix', () => {
			const uid = KTUtils.geUID();
			expect(typeof uid).toBe('string');
			expect(uid.length).toBeGreaterThan(0);
		});
	});

	describe('getCssVar', () => {
		it('reads computed style from document.documentElement', () => {
			const spy = vi.spyOn(
				window,
				'getComputedStyle',
			).mockReturnValue({
				getPropertyValue: (prop: string) =>
					prop === '--my-var' ? ' red ' : '',
			} as unknown as CSSStyleDeclaration);

			const result = KTUtils.getCssVar('--my-var');
			expect(result).toBe('red');
			spy.mockRestore();
		});

		it('returns empty string when property is empty', () => {
			const spy = vi.spyOn(
				window,
				'getComputedStyle',
			).mockReturnValue({
				getPropertyValue: () => '',
			} as unknown as CSSStyleDeclaration);

			const result = KTUtils.getCssVar('--missing');
			expect(result).toBe('');
			spy.mockRestore();
		});
	});

	describe('parseDataAttribute', () => {
		it('"true" returns true', () => {
			expect(KTUtils.parseDataAttribute('true')).toBe(true);
		});

		it('"false" returns false', () => {
			expect(KTUtils.parseDataAttribute('false')).toBe(false);
		});

		it('"123" returns 123', () => {
			expect(KTUtils.parseDataAttribute('123')).toBe(123);
		});

		it('"3.14" returns 3.14', () => {
			expect(KTUtils.parseDataAttribute('3.14')).toBeCloseTo(3.14);
		});

		it('"" returns null', () => {
			expect(KTUtils.parseDataAttribute('')).toBeNull();
		});

		it('"null" returns null', () => {
			expect(KTUtils.parseDataAttribute('null')).toBeNull();
		});

		it('"hello" returns "hello" (string fallback)', () => {
			expect(KTUtils.parseDataAttribute('hello')).toBe('hello');
		});

		it('JSON object string returns parsed object', () => {
			const result = KTUtils.parseDataAttribute('{"key":"value"}');
			expect(result).toEqual({ key: 'value' });
		});
	});

	describe('parseJson', () => {
		it('parses valid JSON string', () => {
			expect(KTUtils.parseJson('{"a":1}')).toEqual({ a: 1 });
		});

		it('returns null for empty string', () => {
			expect(KTUtils.parseJson('')).toBeNull();
		});

		it('decodes URI-encoded JSON', () => {
			const encoded = encodeURIComponent('{"x":"y"}');
			expect(KTUtils.parseJson(encoded)).toEqual({ x: 'y' });
		});
	});

	describe('parseSelector', () => {
		it('escapes ID with CSS.escape', () => {
			vi.stubGlobal('CSS', { escape: (s: string) => `escaped(${s})` });
			const result = KTUtils.parseSelector('#my-id');
			expect(result).toBe('#escaped(my-id)');
			vi.unstubAllGlobals();
		});

		it('returns unchanged when no ID present', () => {
			const result = KTUtils.parseSelector('.class');
			expect(result).toBe('.class');
		});

		it('returns selector as-is when CSS.escape is unavailable', () => {
			const orig = window.CSS;
			// @ts-ignore
			delete window.CSS;
			expect(KTUtils.parseSelector('#my-id')).toBe('#my-id');
			window.CSS = orig;
		});
	});

	describe('capitalize', () => {
		it('capitalizes first character', () => {
			expect(KTUtils.capitalize('hello')).toBe('Hello');
		});

		it('does not change already capitalized string', () => {
			expect(KTUtils.capitalize('Hello')).toBe('Hello');
		});
	});

	describe('uncapitalize', () => {
		it('lowercases first character', () => {
			expect(KTUtils.uncapitalize('Hello')).toBe('hello');
		});

		it('does not change already lowercase string', () => {
			expect(KTUtils.uncapitalize('hello')).toBe('hello');
		});
	});

	describe('camelCase', () => {
		it('converts hyphenated to camelCase', () => {
			expect(KTUtils.camelCase('my-class-name')).toBe('myClassName');
		});

		it('returns unchanged when no hyphens', () => {
			expect(KTUtils.camelCase('foo')).toBe('foo');
		});
	});

	describe('camelReverseCase', () => {
		it('converts camelCase to hyphenated', () => {
			expect(KTUtils.camelReverseCase('myClassName')).toBe(
				'my-class-name',
			);
		});

		it('returns unchanged when no uppercase', () => {
			expect(KTUtils.camelReverseCase('foo')).toBe('foo');
		});
	});

	describe('isRTL', () => {
		it('returns true when direction is rtl', () => {
			const html = document.documentElement;
			html.setAttribute('direction', 'rtl');
			expect(KTUtils.isRTL()).toBe(true);
			html.removeAttribute('direction');
		});

		it('returns false when direction is not rtl', () => {
			expect(KTUtils.isRTL()).toBe(false);
		});

		it('returns false when html element not found', () => {
			const orig = document.querySelector;
			document.querySelector = vi.fn().mockReturnValue(null);
			expect(KTUtils.isRTL()).toBe(false);
			document.querySelector = orig;
		});
	});

	describe('checksum', () => {
		it('returns consistent 8-char hex string', () => {
			const result = KTUtils.checksum('hello');
			expect(result).toMatch(/^[0-9a-f]{8}$/);
		});

		it('returns "00000000" for empty string', () => {
			expect(KTUtils.checksum('')).toBe('00000000');
		});

		it('is deterministic (same input → same output)', () => {
			expect(KTUtils.checksum('hello')).toBe(KTUtils.checksum('hello'));
		});

		it('different inputs produce different hashes', () => {
			expect(KTUtils.checksum('hello')).not.toBe(
				KTUtils.checksum('world'),
			);
		});
	});

	describe('stringToBoolean', () => {
		it('returns true for boolean true', () => {
			expect(KTUtils.stringToBoolean(true)).toBe(true);
		});

		it('returns true for "true"', () => {
			expect(KTUtils.stringToBoolean('true')).toBe(true);
		});

		it('returns false for "false"', () => {
			expect(KTUtils.stringToBoolean('false')).toBe(false);
		});

		it('returns true for "TRUE" (case insensitive)', () => {
			expect(KTUtils.stringToBoolean('TRUE')).toBe(true);
		});

		it('returns null for number 123', () => {
			expect(KTUtils.stringToBoolean(123)).toBeNull();
		});

		it('returns null for unrecognized string', () => {
			expect(KTUtils.stringToBoolean('yes')).toBeNull();
		});
	});

	describe('stringToObject', () => {
		it('parses valid JSON object string', () => {
			expect(KTUtils.stringToObject('{"key":"value"}')).toEqual({
				key: 'value',
			});
		});

		it('returns null for "invalid"', () => {
			expect(KTUtils.stringToObject('invalid')).toBeNull();
		});

		it('returns null for null', () => {
			expect(KTUtils.stringToObject(null)).toBeNull();
		});

		it('returns null for array (not object)', () => {
			expect(KTUtils.stringToObject('[1,2]')).toBeNull();
		});
	});

	describe('stringToInteger', () => {
		it('returns integer for number 42', () => {
			expect(KTUtils.stringToInteger(42)).toBe(42);
		});

		it('floors decimal number 3.7 to 3', () => {
			expect(KTUtils.stringToInteger(3.7)).toBe(3);
		});

		it('parses string "123" to 123', () => {
			expect(KTUtils.stringToInteger('123')).toBe(123);
		});

		it('returns null for "abc"', () => {
			expect(KTUtils.stringToInteger('abc')).toBeNull();
		});

		it('returns null for null', () => {
			expect(KTUtils.stringToInteger(null)).toBeNull();
		});

		it('returns null for NaN number', () => {
			expect(KTUtils.stringToInteger(NaN)).toBeNull();
		});

		it('handles negative numbers', () => {
			expect(KTUtils.stringToInteger('-5')).toBe(-5);
		});
	});

	describe('stringToFloat', () => {
		it('returns float for number 3.14', () => {
			expect(KTUtils.stringToFloat(3.14)).toBeCloseTo(3.14);
		});

		it('parses string "2.5" to 2.5', () => {
			expect(KTUtils.stringToFloat('2.5')).toBeCloseTo(2.5);
		});

		it('returns null for "abc"', () => {
			expect(KTUtils.stringToFloat('abc')).toBeNull();
		});

		it('returns null for null', () => {
			expect(KTUtils.stringToFloat(null)).toBeNull();
		});

		it('returns null for NaN number', () => {
			expect(KTUtils.stringToFloat(NaN)).toBeNull();
		});
	});

	describe('throttle', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('calls func after delay when timer is undefined', () => {
			const func = vi.fn();
			KTUtils.throttle(undefined, func, 300);
			expect(func).not.toHaveBeenCalled();
			vi.advanceTimersByTime(300);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('does not schedule new timeout when timer is set', () => {
			const func = vi.fn();
			const existingTimer = setTimeout(() => {}, 1000);
			KTUtils.throttle(existingTimer, func, 300);
			vi.advanceTimersByTime(500);
			expect(func).not.toHaveBeenCalled();
			clearTimeout(existingTimer);
		});
	});
});
