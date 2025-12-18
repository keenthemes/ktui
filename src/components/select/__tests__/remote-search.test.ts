/**
 * Remote Search Tests for KTSelect
 * Tests remote data fetching, search functionality, and option rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KTSelect } from '../select';
import { waitFor } from '../../datatable/__tests__/setup';

describe('KTSelect Remote Search', () => {
	let container: HTMLElement;
	let mockFetch: ReturnType<typeof vi.fn>;

	/**
	 * Helper to create a select element configured for remote search
	 */
	const createRemoteSelectElement = (): HTMLSelectElement => {
		const select = document.createElement('select');
		select.className = 'kt-select';
		select.setAttribute('data-kt-select', 'true');
		select.setAttribute('data-kt-select-remote', 'true');
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

	/**
	 * Helper to wait for async operations to complete
	 */
	const waitForAsync = async (): Promise<void> => {
		await new Promise((resolve) => requestAnimationFrame(resolve));
		await new Promise((resolve) => requestAnimationFrame(resolve));
		await new Promise((resolve) => setTimeout(resolve, 50));
	};

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);

		// Mock fetch globally
		global.fetch = vi.fn() as any;
		mockFetch = global.fetch as any;
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

	describe('Remote Search - Option Rendering', () => {
		it('should render search results with correct data-value and data-text attributes', async () => {
			const selectEl = createRemoteSelectElement();
			container.appendChild(selectEl);

			// Mock initial data fetch
			const initialData = [
				{ id: '1', title: 'Leanne Graham' },
				{ id: '2', title: 'Ervin Howell' },
				{ id: '3', title: 'Clementine Bauch' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => initialData,
			});

			// Create KTSelect instance with remote config
			const select = new KTSelect(selectEl, {
				remote: true,
				dataUrl: 'https://jsonplaceholder.typicode.com/users',
				searchParam: 'q',
				enableSearch: true,
				searchMinLength: 0,
				searchDebounce: 100, // Lower debounce for tests
				height: 250,
			});

			// Wait for initial remote data to load
			await waitFor(300);
			await waitForAsync();

			// Open dropdown
			select.openDropdown();
			await waitForAsync();

			// Get search input
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Mock search results
			const searchResults = [
				{ id: '3', title: 'Clementine Bauch' },
				{ id: '10', title: 'Clementina DuBuque' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => searchResults,
			});

			// Trigger search
			if (searchInput) {
				searchInput.value = 'clem';
				searchInput.dispatchEvent(new Event('input', { bubbles: true }));
			}

			// Wait for search to complete (debounce + async operations)
			await waitFor(300); // Wait for debounce
			await waitForAsync();
			await waitForAsync(); // Extra wait for requestAnimationFrame

			// Get rendered options from dropdown
			const dropdown = select.getDropdownElement();
			expect(dropdown).toBeTruthy();

			const options = dropdown?.querySelectorAll(
				'[data-kt-select-option]',
			) as NodeListOf<HTMLElement>;

			// Debug: log what we found
			if (options.length === 0) {
				console.log('No options found in dropdown');
				console.log('Dropdown HTML:', dropdown?.innerHTML?.substring(0, 500));
			}

			expect(options.length).toBeGreaterThan(0);

			// Check first option has correct attributes
			const firstOption = options[0];
			expect(firstOption).toBeTruthy();

			const dataValue = firstOption.getAttribute('data-value');
			const dataText = firstOption.getAttribute('data-text');

			// Verify attributes are not empty
			expect(dataValue).toBeTruthy();
			expect(dataValue).not.toBe('');
			expect(dataText).toBeTruthy();
			expect(dataText).not.toBe('');

			// Verify text content is rendered
			const textContainer = firstOption.querySelector(
				'[data-kt-text-container="true"]',
			);
			expect(textContainer).toBeTruthy();
			expect(textContainer?.textContent?.trim()).toBeTruthy();
			expect(textContainer?.textContent?.trim()).not.toBe('');

			// Verify option text matches expected value
			expect(dataText).toContain('Clementine');
		});

		it('should preserve data-value and data-text attributes after refreshAfterSearch', async () => {
			const selectEl = createRemoteSelectElement();
			container.appendChild(selectEl);

			// Mock initial data fetch
			const initialData = [
				{ id: '1', title: 'Leanne Graham' },
				{ id: '2', title: 'Ervin Howell' },
				{ id: '3', title: 'Clementine Bauch' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => initialData,
			});

			// Create KTSelect instance with remote config
			const select = new KTSelect(selectEl, {
				remote: true,
				dataUrl: 'https://jsonplaceholder.typicode.com/users',
				searchParam: 'q',
				enableSearch: true,
				searchMinLength: 0,
				searchDebounce: 100, // Lower debounce for tests
				height: 250,
			});

			// Wait for initial remote data to load
			await waitFor(300);
			await waitForAsync();

			// Open dropdown
			select.openDropdown();
			await waitForAsync();

			// Get search input
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Mock search results
			const searchResults = [
				{ id: '3', title: 'Clementine Bauch' },
				{ id: '10', title: 'Clementina DuBuque' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => searchResults,
			});

			// Trigger search
			if (searchInput) {
				searchInput.value = 'clem';
				searchInput.dispatchEvent(new Event('input', { bubbles: true }));
			}

			// Wait for search to complete
			await waitFor(300); // Wait for debounce
			await waitForAsync();
			await waitForAsync(); // Extra wait for requestAnimationFrame

			// Get rendered options before refreshAfterSearch
			const dropdown = select.getDropdownElement();
			const optionsBefore = dropdown?.querySelectorAll(
				'[data-kt-select-option]',
			) as NodeListOf<HTMLElement>;

			expect(optionsBefore.length).toBeGreaterThan(0);

			const firstOptionBefore = optionsBefore[0];
			const dataValueBefore = firstOptionBefore.getAttribute('data-value');
			const dataTextBefore = firstOptionBefore.getAttribute('data-text');

			// Verify attributes exist before refresh
			expect(dataValueBefore).toBeTruthy();
			expect(dataValueBefore).not.toBe('');
			expect(dataTextBefore).toBeTruthy();
			expect(dataTextBefore).not.toBe('');

			// Manually trigger refreshAfterSearch (simulating what happens after search)
			const searchModule = (select as any)._searchModule;
			if (searchModule) {
				searchModule.refreshAfterSearch();
			}

			// Wait for refresh to complete
			await waitForAsync();
			await waitForAsync(); // Extra wait for requestAnimationFrame

			// Get rendered options after refreshAfterSearch
			const optionsAfter = dropdown?.querySelectorAll(
				'[data-kt-select-option]',
			) as NodeListOf<HTMLElement>;

			expect(optionsAfter.length).toBeGreaterThan(0);

			const firstOptionAfter = optionsAfter[0];
			const dataValueAfter = firstOptionAfter.getAttribute('data-value');
			const dataTextAfter = firstOptionAfter.getAttribute('data-text');

			// Verify attributes are preserved after refresh
			expect(dataValueAfter).toBe(dataValueBefore);
			expect(dataTextAfter).toBe(dataTextBefore);
			expect(dataValueAfter).not.toBe('');
			expect(dataTextAfter).not.toBe('');

			// Verify text content is still rendered
			const textContainer = firstOptionAfter.querySelector(
				'[data-kt-text-container="true"]',
			);
			expect(textContainer).toBeTruthy();
			expect(textContainer?.textContent?.trim()).toBeTruthy();
			expect(textContainer?.textContent?.trim()).not.toBe('');
		});

		it('should render options with correct text content in dropdown', async () => {
			const selectEl = createRemoteSelectElement();
			container.appendChild(selectEl);

			// Mock initial data fetch
			const initialData = [
				{ id: '1', title: 'Leanne Graham' },
				{ id: '2', title: 'Ervin Howell' },
				{ id: '3', title: 'Clementine Bauch' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => initialData,
			});

			// Create KTSelect instance with remote config
			const select = new KTSelect(selectEl, {
				remote: true,
				dataUrl: 'https://jsonplaceholder.typicode.com/users',
				searchParam: 'q',
				enableSearch: true,
				searchMinLength: 0,
				searchDebounce: 100, // Lower debounce for tests
				height: 250,
			});

			// Wait for initial remote data to load
			await waitFor(300);
			await waitForAsync();

			// Open dropdown
			select.openDropdown();
			await waitForAsync();

			// Get search input
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Mock search results
			const searchResults = [
				{ id: '3', title: 'Clementine Bauch' },
				{ id: '10', title: 'Clementina DuBuque' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => searchResults,
			});

			// Trigger search
			if (searchInput) {
				searchInput.value = 'clem';
				searchInput.dispatchEvent(new Event('input', { bubbles: true }));
			}

			// Wait for search to complete
			await waitFor(300); // Wait for debounce
			await waitForAsync();
			await waitForAsync(); // Extra wait for requestAnimationFrame

			// Get rendered options from dropdown
			const dropdown = select.getDropdownElement();
			const options = dropdown?.querySelectorAll(
				'[data-kt-select-option]',
			) as NodeListOf<HTMLElement>;

			expect(options.length).toBe(2);

			// Check first option
			const firstOption = options[0];
			const firstTextContainer = firstOption.querySelector(
				'[data-kt-text-container="true"]',
			);
			expect(firstTextContainer).toBeTruthy();
			expect(firstTextContainer?.textContent?.trim()).toBe(
				'Clementine Bauch',
			);

			// Check second option
			const secondOption = options[1];
			const secondTextContainer = secondOption.querySelector(
				'[data-kt-text-container="true"]',
			);
			expect(secondTextContainer).toBeTruthy();
			expect(secondTextContainer?.textContent?.trim()).toBe(
				'Clementina DuBuque',
			);

			// Verify options are not empty
			expect(firstOption.textContent?.trim()).not.toBe('');
			expect(secondOption.textContent?.trim()).not.toBe('');
		});

		it('should handle custom field mapping (dataValueField and dataFieldText)', async () => {
			const selectEl = createRemoteSelectElement();
			container.appendChild(selectEl);

			// Mock initial data fetch with custom field names
			const initialData = [
				{ userId: '1', name: 'Leanne Graham' },
				{ userId: '2', name: 'Ervin Howell' },
				{ userId: '3', name: 'Clementine Bauch' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => initialData,
			});

			// Mock search results with custom field names
			const searchResults = [
				{ userId: '3', name: 'Clementine Bauch' },
				{ userId: '10', name: 'Clementina DuBuque' },
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => searchResults,
			});

			// Create KTSelect instance with custom field mapping
			const select = new KTSelect(selectEl, {
				remote: true,
				dataUrl: 'https://jsonplaceholder.typicode.com/users',
				searchParam: 'q',
				enableSearch: true,
				searchMinLength: 0,
				searchDebounce: 100, // Lower debounce for tests
				dataValueField: 'userId',
				dataFieldText: 'name',
				height: 250,
			});

			// Wait for initial remote data to load
			await waitFor(300);
			await waitForAsync();

			// Open dropdown
			select.openDropdown();
			await waitForAsync();

			// Get search input
			const searchInput = select.getSearchInput();
			expect(searchInput).toBeTruthy();

			// Trigger search
			if (searchInput) {
				searchInput.value = 'clem';
				searchInput.dispatchEvent(new Event('input', { bubbles: true }));
			}

			// Wait for search to complete
			await waitFor(300); // Wait for debounce
			await waitForAsync();
			await waitForAsync(); // Extra wait for requestAnimationFrame

			// Get rendered options from dropdown
			const dropdown = select.getDropdownElement();
			const options = dropdown?.querySelectorAll(
				'[data-kt-select-option]',
			) as NodeListOf<HTMLElement>;

			expect(options.length).toBe(2);

			// Check first option has correct attributes from custom fields
			const firstOption = options[0];
			const dataValue = firstOption.getAttribute('data-value');
			const dataText = firstOption.getAttribute('data-text');

			expect(dataValue).toBe('3');
			expect(dataText).toBe('Clementine Bauch');

			// Verify text content is rendered
			const textContainer = firstOption.querySelector(
				'[data-kt-text-container="true"]',
			);
			expect(textContainer?.textContent?.trim()).toBe('Clementine Bauch');
		});
	});
});

