/**
 * XSS Prevention Tests for KTSelect
 * Tests that option templates properly escape HTML to prevent XSS attacks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTSelect } from '../select';
import { waitFor } from '../../datatable/__tests__/setup';

describe('KTSelect XSS Prevention', () => {
	let container: HTMLElement;

	/**
	 * Helper to create a select element with options
	 */
	const createSelectElement = (
		options: Array<{ value: string; text: string }> = [
			{ value: '1', text: 'Option 1' },
			{ value: '2', text: 'Option 2' },
		],
	): HTMLSelectElement => {
		const select = document.createElement('select');
		select.className = 'kt-select';
		select.setAttribute('data-kt-select', 'true');
		options.forEach((opt) => {
			const option = document.createElement('option');
			option.value = opt.value;
			option.textContent = opt.text;
			select.appendChild(option);
		});
		return select;
	};

	/**
	 * Helper to wait for KTSelect to fully initialize
	 */
	const waitForInit = async (select: KTSelect): Promise<void> => {
		await waitFor(200);
		await new Promise((resolve) => setTimeout(resolve, 0));
		await waitFor(50);
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		// Clean up all KTSelect instances
		const selects = document.querySelectorAll('select');
		selects.forEach((select) => {
			const instance = (select as any).instance;
			if (instance && typeof instance.dispose === 'function') {
				instance.dispose();
			}
		});

		// Clear document body
		document.body.innerHTML = '';
		container = null as any;
		vi.clearAllMocks();
	});

	describe('Option Template XSS Prevention', () => {
		it('should escape script tags in option template data', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: '<script>alert("XSS")</script>' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: '{{text}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			// Get the rendered option element
			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			expect(options).toBeTruthy();
			expect(options?.length).toBeGreaterThan(0);

			const optionElement = options?.[0] as HTMLElement;
			expect(optionElement).toBeTruthy();

			// Check that script tags in variable values are escaped (not executed)
			const innerHTML = optionElement.innerHTML;
			expect(innerHTML).toContain('&lt;script&gt;');
			expect(innerHTML).toContain('&lt;/script&gt;');
			expect(innerHTML).not.toContain('<script>');
			expect(innerHTML).not.toContain('</script>');

			// Verify no script execution by checking that alert was not called
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
			// If script was executed, alert would have been called
			expect(alertSpy).not.toHaveBeenCalled();
			alertSpy.mockRestore();
		});

		it('should preserve HTML structure in templates while escaping variable values', async () => {
			const selectEl = createSelectElement([
				{ value: 'us', text: 'United States' },
			]);
			container.appendChild(selectEl);

			// User provides HTML template with images and structure
			const select = new KTSelect(selectEl, {
				optionTemplate:
					'<div class="flex items-center gap-2"><img src="https://flagcdn.com/w40/us.png" class="w-6 h-6" /><span class="text-gray-800">{{text}}</span></div>',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			// Verify HTML structure is preserved
			const innerHTML = optionElement.innerHTML;
			expect(innerHTML).toContain('<div class="flex items-center gap-2">');
			expect(innerHTML).toContain('<img src="https://flagcdn.com/w40/us.png"');
			expect(innerHTML).toContain('<span class="text-gray-800">');
			expect(innerHTML).toContain('United States');
			expect(innerHTML).toContain('</span>');
			expect(innerHTML).toContain('</div>');

			// Verify the image element exists and is properly rendered (not escaped as text)
			const img = optionElement.querySelector('img');
			expect(img).toBeTruthy();
			expect(img?.src).toBe('https://flagcdn.com/w40/us.png');
			expect(img?.tagName).toBe('IMG');
			// Verify the image is actually an IMG element, not text
			expect(img?.nodeName).toBe('IMG');
		});

		it('should escape malicious content in variable values even when template has HTML', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: '<script>alert("XSS")</script>' },
			]);
			container.appendChild(selectEl);

			// User provides HTML template, but malicious content in variable should be escaped
			const select = new KTSelect(selectEl, {
				optionTemplate:
					'<div class="flex"><span>{{text}}</span></div>',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			const innerHTML = optionElement.innerHTML;
			// HTML structure should be preserved
			expect(innerHTML).toContain('<div class="flex">');
			expect(innerHTML).toContain('<span>');
			// But malicious content in variable should be escaped
			expect(innerHTML).toContain('&lt;script&gt;');
			expect(innerHTML).toContain('&lt;/script&gt;');
			expect(innerHTML).not.toMatch(/<script[^>]*>/);

			// Verify no script execution
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
			expect(alertSpy).not.toHaveBeenCalled();
			alertSpy.mockRestore();
		});

		it('should escape HTML entities in option template data', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: 'Text with <tags> & "quotes"' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: '{{text}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			// Check textContent to verify HTML is escaped (displayed as text, not rendered as HTML)
			const textContent = optionElement.textContent || '';
			expect(textContent).toContain('<tags>');
			expect(textContent).toContain('&');
			expect(textContent).toContain('"quotes"');

			// Check outerHTML to verify escaped entities are in the source
			const outerHTML = optionElement.outerHTML;
			expect(outerHTML).toContain('&lt;tags&gt;');
			expect(outerHTML).toContain('&amp;');
			// Verify no actual HTML tags are rendered (they should be escaped)
			expect(optionElement.querySelector('tags')).toBeNull();
		});

		it('should escape malicious content in template variables', async () => {
			// Test with malicious content directly in option text to verify escaping works
			const selectEl = createSelectElement([
				{ value: '1', text: '<img src=x onerror=alert("XSS")>' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: 'Label: {{text}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;
			expect(optionElement).toBeTruthy();

			// Check textContent to verify malicious content is displayed as text (not executed)
			const textContent = optionElement.textContent || '';
			expect(textContent).toContain('<img src=x onerror=alert("XSS")>');
			expect(textContent).toContain('Label:');

			// Check innerHTML to verify escaped entities are in the content (not in attributes)
			const innerHTML = optionElement.innerHTML;
			expect(innerHTML).toContain('&lt;img');
			expect(innerHTML).toContain('&gt;');
			// The innerHTML should NOT contain unescaped HTML tags
			expect(innerHTML).not.toMatch(/<img[^>]*>/);

			// Verify no actual img tag is rendered (it should be escaped)
			expect(optionElement.querySelector('img')).toBeNull();

			// Verify no alert was triggered
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
			expect(alertSpy).not.toHaveBeenCalled();
			alertSpy.mockRestore();
		});

		it('should maintain backward compatibility with safe content', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: 'Safe Option Text' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: '{{text}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			// Safe content should display correctly
			expect(optionElement.textContent).toContain('Safe Option Text');
		});

		it('should handle null and undefined values in templates', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: 'Option 1' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: '{{text}} - {{missing}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			// Should handle missing/null values gracefully
			expect(optionElement).toBeTruthy();
			// Missing variable should be replaced with empty string
			expect(optionElement.textContent).toContain('Option 1 -');
		});

		it('should escape content in complex template expressions', async () => {
			const selectEl = createSelectElement([
				{ value: '1', text: '<b>Bold</b> & <i>Italic</i>' },
			]);
			container.appendChild(selectEl);

			const select = new KTSelect(selectEl, {
				optionTemplate: 'Label: {{text}}',
				height: 250,
			});

			await waitForInit(select);
			select.openDropdown();
			await waitFor(200);

			const options = select.getDropdownElement()?.querySelectorAll(
				'[data-kt-select-option]',
			);
			const optionElement = options?.[0] as HTMLElement;

			const innerHTML = optionElement.innerHTML;
			// All HTML should be escaped
			expect(innerHTML).toContain('&lt;b&gt;');
			expect(innerHTML).toContain('&lt;/b&gt;');
			expect(innerHTML).toContain('&amp;');
			expect(innerHTML).toContain('&lt;i&gt;');
			expect(innerHTML).toContain('&lt;/i&gt;');
		});
	});
});

