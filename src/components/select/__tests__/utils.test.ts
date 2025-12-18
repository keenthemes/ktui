/**
 * Utility Functions Tests for KTSelect
 * Tests HTML escaping and other utility functions
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, renderTemplateStringSafe } from '../utils';

describe('escapeHtml', () => {
	it('should escape HTML special characters', () => {
		expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
			'&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
		);
	});

	it('should escape less than sign', () => {
		expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
	});

	it('should escape greater than sign', () => {
		expect(escapeHtml('>')).toBe('&gt;');
	});

	it('should escape ampersand', () => {
		expect(escapeHtml('A & B')).toBe('A &amp; B');
	});

	it('should escape double quotes', () => {
		expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
	});

	it('should escape single quotes', () => {
		expect(escapeHtml("It's working")).toBe('It&#39;s working');
	});

	it('should escape all special characters together', () => {
		expect(escapeHtml('<script>alert("XSS" & \'more\')</script>')).toBe(
			'&lt;script&gt;alert(&quot;XSS&quot; &amp; &#39;more&#39;)&lt;/script&gt;',
		);
	});

	it('should handle null values', () => {
		expect(escapeHtml(null)).toBe('');
	});

	it('should handle undefined values', () => {
		expect(escapeHtml(undefined)).toBe('');
	});

	it('should handle empty strings', () => {
		expect(escapeHtml('')).toBe('');
	});

	it('should handle strings without special characters', () => {
		expect(escapeHtml('Hello World')).toBe('Hello World');
	});

	it('should handle numbers by converting to string', () => {
		expect(escapeHtml(String(123))).toBe('123');
	});

	it('should not double-escape already escaped content', () => {
		const escaped = escapeHtml('<script>');
		expect(escaped).toBe('&lt;script&gt;');
		// Escaping again should not create double escaping
		expect(escapeHtml(escaped)).toBe('&amp;lt;script&amp;gt;');
	});

	it('should handle mixed content', () => {
		expect(escapeHtml('Text with <tags> and "quotes"')).toBe(
			'Text with &lt;tags&gt; and &quot;quotes&quot;',
		);
	});
});

describe('renderTemplateStringSafe', () => {
	it('should escape variable values while preserving template HTML structure', () => {
		const template = '<div class="flex"><img src="{{icon}}" /><span>{{text}}</span></div>';
		const data = {
			icon: 'https://example.com/icon.png',
			text: '<script>alert("XSS")</script>',
		};

		const result = renderTemplateStringSafe(template, data);

		// HTML structure should be preserved
		expect(result).toContain('<div class="flex">');
		expect(result).toContain('<img src="');
		expect(result).toContain('<span>');
		expect(result).toContain('</span>');
		expect(result).toContain('</div>');

		// Safe values should be preserved
		expect(result).toContain('https://example.com/icon.png');

		// Malicious content in variables should be escaped
		expect(result).toContain('&lt;script&gt;');
		expect(result).toContain('&lt;/script&gt;');
		expect(result).not.toContain('<script>');
	});

	it('should handle HTML entities in variable values', () => {
		const template = '<span>{{text}}</span>';
		const data = { text: 'Text with <tags> & "quotes"' };

		const result = renderTemplateStringSafe(template, data);

		expect(result).toContain('<span>');
		expect(result).toContain('&lt;tags&gt;');
		expect(result).toContain('&amp;');
		expect(result).toContain('&quot;quotes&quot;');
	});

	it('should handle missing variables', () => {
		const template = '<div>{{text}} - {{missing}}</div>';
		const data = { text: 'Hello' };

		const result = renderTemplateStringSafe(template, data);

		expect(result).toBe('<div>Hello - </div>');
	});

	it('should preserve complex HTML templates', () => {
		const template =
			'<div class="flex items-center gap-2"><img src="{{flagUrl}}" class="w-6 h-6" /><span class="text-gray-800">{{text}}</span></div>';
		const data = {
			flagUrl: 'https://flagcdn.com/w40/us.png',
			text: 'United States',
		};

		const result = renderTemplateStringSafe(template, data);

		// All HTML structure should be preserved
		expect(result).toContain('<div class="flex items-center gap-2">');
		expect(result).toContain('<img src="https://flagcdn.com/w40/us.png"');
		expect(result).toContain('class="w-6 h-6"');
		expect(result).toContain('<span class="text-gray-800">');
		expect(result).toContain('United States');
		expect(result).toContain('</span>');
		expect(result).toContain('</div>');
	});

	it('should handle URLs with query parameters in attributes', () => {
		const template = '<img src="{{url}}" alt="{{alt}}" />';
		const data = {
			url: 'https://example.com/image.png?size=40&format=png',
			alt: 'Flag image',
		};

		const result = renderTemplateStringSafe(template, data);

		// URL should be preserved (ampersand in query string should be escaped to &amp;)
		expect(result).toContain('src="https://example.com/image.png?size=40&amp;format=png"');
		expect(result).toContain('alt="Flag image"');
		// The & in the URL should be escaped to &amp; for valid HTML
		expect(result).not.toContain('size=40&format');
	});

	it('should escape malicious content in attributes', () => {
		const template = '<img src="{{url}}" onerror="{{malicious}}" />';
		const data = {
			url: 'https://example.com/image.png',
			malicious: 'alert("XSS")',
		};

		const result = renderTemplateStringSafe(template, data);

		// Malicious content in attributes should be escaped
		expect(result).toContain('onerror="alert(&quot;XSS&quot;)"');
		expect(result).not.toContain('onerror="alert("XSS")"');
	});
});

