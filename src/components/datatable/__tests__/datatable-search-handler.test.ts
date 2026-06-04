import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSearchHandler } from '../datatable-search-handler';

describe('createSearchHandler', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	function createSearchInput(tableId: string): HTMLInputElement {
		const input = document.createElement('input');
		input.setAttribute('data-kt-datatable-search', `#${tableId}`);
		document.body.appendChild(input);
		return input;
	}

	it('should return an object with attach and detach methods', () => {
		const handler = createSearchHandler();
		expect(handler).toHaveProperty('attach');
		expect(handler).toHaveProperty('detach');
		expect(typeof handler.attach).toBe('function');
		expect(typeof handler.detach).toBe('function');
	});

	it('should call onSearch when keyup event fires after delay', () => {
		vi.useFakeTimers();
		const input = createSearchInput('test-table');
		const onSearch = vi.fn();
		const handler = createSearchHandler();

		handler.attach('test-table', undefined, 300, onSearch);

		input.value = 'test';
		input.dispatchEvent(new Event('keyup'));

		expect(onSearch).not.toHaveBeenCalled();
		vi.advanceTimersByTime(300);
		expect(onSearch).toHaveBeenCalledWith('test');

		handler.detach('test-table');
		vi.useRealTimers();
	});

	it('should not call onSearch after detach', () => {
		vi.useFakeTimers();
		const input = createSearchInput('test-table');
		const onSearch = vi.fn();
		const handler = createSearchHandler();

		handler.attach('test-table', undefined, 300, onSearch);
		handler.detach('test-table');

		input.value = 'test';
		input.dispatchEvent(new Event('keyup'));

		vi.advanceTimersByTime(300);
		expect(onSearch).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('should debounce rapid keyup events', () => {
		vi.useFakeTimers();
		const input = createSearchInput('test-table');
		const onSearch = vi.fn();
		const handler = createSearchHandler();

		handler.attach('test-table', undefined, 300, onSearch);

		// Fire multiple keyup events rapidly
		for (const val of ['t', 'te', 'tes', 'test']) {
			input.value = val;
			input.dispatchEvent(new Event('keyup'));
			vi.advanceTimersByTime(100);
		}

		// Wait for the final debounce
		vi.advanceTimersByTime(300);

		// Should only be called once with the last value
		expect(onSearch).toHaveBeenCalledTimes(1);
		expect(onSearch).toHaveBeenCalledWith('test');

		handler.detach('test-table');
		vi.useRealTimers();
	});

	it('should restore search value from currentSearch', () => {
		const input = createSearchInput('test-table');
		const handler = createSearchHandler();

		handler.attach('test-table', 'previous search', 300, vi.fn());
		expect(input.value).toBe('previous search');

		handler.detach('test-table');
	});

	it('should handle missing search element gracefully', () => {
		const handler = createSearchHandler();
		expect(() =>
			handler.attach('nonexistent', undefined, 300, vi.fn()),
		).not.toThrow();
		expect(() => handler.detach('nonexistent')).not.toThrow();
	});

	it('should replace existing debounced listener on re-attach', () => {
		vi.useFakeTimers();
		const input = createSearchInput('test-table');
		const onSearch1 = vi.fn();
		const onSearch2 = vi.fn();
		const handler = createSearchHandler();

		handler.attach('test-table', undefined, 300, onSearch1);
		handler.attach('test-table', undefined, 300, onSearch2);

		input.value = 'test';
		input.dispatchEvent(new Event('keyup'));
		vi.advanceTimersByTime(300);

		// Only the second callback should be called
		expect(onSearch1).not.toHaveBeenCalled();
		expect(onSearch2).toHaveBeenCalledWith('test');

		handler.detach('test-table');
		vi.useRealTimers();
	});
});
