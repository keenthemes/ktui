import { describe, it, expect, beforeEach } from 'vitest';
import { createSpinner } from '../datatable-spinner';

describe('createSpinner', () => {
	let root: HTMLDivElement;
	let table: HTMLTableElement;

	beforeEach(() => {
		document.body.innerHTML = '';
		root = document.createElement('div');
		table = document.createElement('table');
		root.appendChild(table);
		document.body.appendChild(root);
	});

	it('should return an object with show, hide, and remove methods', () => {
		const spinner = createSpinner();
		expect(spinner).toHaveProperty('show');
		expect(spinner).toHaveProperty('hide');
		expect(spinner).toHaveProperty('remove');
	});

	it('should add loading class to root on show', () => {
		const spinner = createSpinner();
		spinner.show(root, { loadingClass: 'loading' }, table);
		expect(root.classList.contains('loading')).toBe(true);
	});

	it('should remove loading class from root on hide', () => {
		const spinner = createSpinner();
		spinner.show(root, { loadingClass: 'loading' }, table);
		spinner.hide(root, { loadingClass: 'loading' });
		expect(root.classList.contains('loading')).toBe(false);
	});

	it('should create spinner element from template on show', () => {
		const spinner = createSpinner();
		const config = {
			loading: {
				template: '<div class="spinner">{content}</div>',
				content: 'Loading...',
			},
		};
		spinner.show(root, config, table);

		const spinnerEl = table.querySelector('[data-kt-datatable-spinner]');
		expect(spinnerEl).not.toBeNull();
		expect(spinnerEl?.classList.contains('spinner')).toBe(true);
	});

	it('should show existing spinner from DOM', () => {
		const existingSpinner = document.createElement('div');
		existingSpinner.setAttribute('data-kt-datatable-spinner', 'true');
		existingSpinner.style.display = 'none';
		root.appendChild(existingSpinner);

		const spinner = createSpinner();
		spinner.show(
			root,
			{ attributes: { spinner: '[data-kt-datatable-spinner]' } },
			table,
		);
		expect(existingSpinner.style.display).toBe('block');
	});

	it('should hide spinner on hide', () => {
		const existingSpinner = document.createElement('div');
		existingSpinner.setAttribute('data-kt-datatable-spinner', 'true');
		existingSpinner.style.display = 'block';
		root.appendChild(existingSpinner);

		const spinner = createSpinner();
		spinner.hide(root, {
			attributes: { spinner: '[data-kt-datatable-spinner]' },
		});
		expect(existingSpinner.style.display).toBe('none');
	});

	it('should remove spinner element from DOM', () => {
		const spinnerEl = document.createElement('div');
		spinnerEl.setAttribute('data-kt-datatable-spinner', 'true');
		table.appendChild(spinnerEl);

		const spinner = createSpinner();
		spinner.remove(root, {
			attributes: { spinner: '[data-kt-datatable-spinner]' },
		});
		expect(table.querySelector('[data-kt-datatable-spinner]')).toBeNull();
	});

	it('should handle null root gracefully', () => {
		const spinner = createSpinner();
		expect(() => spinner.show(null, {}, table)).not.toThrow();
		expect(() => spinner.hide(null, {})).not.toThrow();
		expect(() => spinner.remove(null, {})).not.toThrow();
	});

	it('should handle missing spinner element gracefully', () => {
		const spinner = createSpinner();
		expect(() => spinner.hide(root, {})).not.toThrow();
		expect(() => spinner.remove(root, {})).not.toThrow();
	});
});
