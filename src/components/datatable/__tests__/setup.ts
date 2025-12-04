/**
 * Vitest setup file for datatable tests
 * Provides DOM environment setup and utilities
 */

import { beforeEach, afterEach, vi } from 'vitest';

// Mock KTComponents to prevent auto-initialization errors
vi.mock('../../../index', () => ({
	default: {
		init: vi.fn(),
	},
	KTComponents: {
		init: vi.fn(),
	},
}));

// Setup DOM environment before each test
beforeEach(() => {
	// Clear localStorage
	localStorage.clear();

	// Reset document body
	document.body.innerHTML = '';

	// Clear any global state
	// Add any other global setup here
});

// Cleanup after each test
afterEach(() => {
	// Clear localStorage
	localStorage.clear();

	// Reset document body
	document.body.innerHTML = '';

	// Clear any intervals/timeouts
	// This helps prevent test interference
});

// Mock window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {}, // deprecated
		removeListener: () => {}, // deprecated
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => true,
	}),
});

// Export utilities that tests can use
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createMockElement = (tag: string, attributes: Record<string, string> = {}) => {
	const el = document.createElement(tag);
	Object.entries(attributes).forEach(([key, value]) => {
		el.setAttribute(key, value);
	});
	return el;
};

