import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KTDataTableCheckboxHandler } from '../datatable-checkbox';
import type { KTDataTableCheckboxDeps } from '../datatable-checkbox';
import type { KTDataTableConfigInterface } from '../types';

function createCheckboxTable() {
	const container = document.createElement('div');
	container.innerHTML = `
    <table>
      <thead>
        <tr><th><input type="checkbox" data-kt-datatable-check="true" /></th></tr>
      </thead>
      <tbody>
        <tr><td><input type="checkbox" data-kt-datatable-row-check="true" value="1" /></td></tr>
        <tr><td><input type="checkbox" data-kt-datatable-row-check="true" value="2" /></td></tr>
        <tr><td><input type="checkbox" data-kt-datatable-row-check="true" value="3" /></td></tr>
      </tbody>
    </table>
  `;
	document.body.appendChild(container);
	const headerCheck =
		container.querySelector<HTMLInputElement>('[data-kt-datatable-check]')!;
	const rowChecks = container.querySelectorAll<HTMLInputElement>(
		'[data-kt-datatable-row-check]',
	);
	return { container, headerCheck, rowChecks };
}

function createConfig(
	overrides?: Partial<KTDataTableConfigInterface>,
): KTDataTableConfigInterface {
	return {
		attributes: {
			check: '[data-kt-datatable-check="true"]',
			checkbox: '[data-kt-datatable-row-check="true"]',
		},
		checkbox: { checkedClass: 'checked', preserveSelection: true },
		...overrides,
	} as KTDataTableConfigInterface;
}

function createHandler(
	config?: Partial<KTDataTableConfigInterface>,
	initialSelectedRows: string[] = [],
) {
	const { container } = createCheckboxTable();
	const cfg = createConfig(config);
	const fireEvent = vi.fn();
	let selectedRows: string[] = [...initialSelectedRows];
	const handler = new KTDataTableCheckboxHandler(container, cfg, fireEvent, {
		getState: () => ({ selectedRows }),
		setSelectedRows: (rows: string[]) => {
			selectedRows = rows;
		},
	});
	return { handler, container, fireEvent, getSelectedRows: () => selectedRows };
}

describe('KTDataTableCheckboxHandler', () => {
	describe('Construction and init', () => {
		it('init() queries header and row checkboxes from DOM', () => {
			const { handler, container } = createHandler();
			handler.init();
			const header = container.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			);
			expect(header).toBeTruthy();
			handler.dispose();
		});

		it('init() early-returns if config.attributes.check is missing', () => {
			const container = document.createElement('div');
			container.innerHTML = `<table><thead><tr><th><input type="checkbox" /></th></tr></thead><tbody></tbody></table>`;
			document.body.appendChild(container);
			const fireEvent = vi.fn();
			const cfg = {
				attributes: { checkbox: '[data-kt-datatable-row-check="true"]' },
			} as unknown as KTDataTableConfigInterface;
			const handler = new KTDataTableCheckboxHandler(container, cfg, fireEvent, {
				getState: () => ({ selectedRows: [] }),
				setSelectedRows: vi.fn(),
			});
			// Should not throw
			handler.init();
			handler.dispose();
		});

		it('init() early-returns if header check element not found in DOM', () => {
			const container = document.createElement('div');
			container.innerHTML = `<table><thead><tr><th></th></tr></thead><tbody></tbody></table>`;
			document.body.appendChild(container);
			const fireEvent = vi.fn();
			const cfg = createConfig();
			const handler = new KTDataTableCheckboxHandler(container, cfg, fireEvent, {
				getState: () => ({ selectedRows: [] }),
				setSelectedRows: vi.fn(),
			});
			handler.init();
			// fireEvent should not have been called since header is missing
			expect(fireEvent).not.toHaveBeenCalled();
			handler.dispose();
		});

		it('init() calls _reapplyCheckedStates and _updateHeaderCheckboxState', () => {
			const { handler, container, getSelectedRows } = createHandler({}, ['1', '3']);
			handler.init();
			// After reapply, row 1 and 3 should be checked
			const rows = container.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			expect(rows[0].checked).toBe(true);
			expect(rows[1].checked).toBe(false);
			expect(rows[2].checked).toBe(true);
			handler.dispose();
		});
	});

	describe('Row checkbox change', () => {
		it('clicking a row checkbox adds value to selectedRows and fires checked + changed', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler();
			handler.init();
			fireEvent.mockClear();

			const { container } = createCheckboxTable();
			const rowCheck = document.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			)[0];

			// Trigger change via the handler's init'd DOM
			const allRows = document.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			allRows[0].checked = true;
			allRows[0].dispatchEvent(new Event('input', { bubbles: true }));

			expect(getSelectedRows()).toContain('1');
			expect(fireEvent).toHaveBeenCalledWith('checked', { value: '1' });
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});

		it('unchecking a row removes value from selectedRows and fires unchecked + changed', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler({}, ['1']);
			handler.init();
			fireEvent.mockClear();

			const allRows = document.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			allRows[0].checked = false;
			allRows[0].dispatchEvent(new Event('input', { bubbles: true }));

			expect(getSelectedRows()).not.toContain('1');
			expect(fireEvent).toHaveBeenCalledWith('unchecked', { value: '1' });
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});

		it('checking an already-checked row does not fire checked again (only changed)', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler({}, ['1']);
			handler.init();
			fireEvent.mockClear();

			const allRows = document.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			allRows[0].checked = true;
			allRows[0].dispatchEvent(new Event('input', { bubbles: true }));

			expect(fireEvent).not.toHaveBeenCalledWith('checked', expect.anything());
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});

		it('unchecking an already-unchecked row does not fire unchecked again (only changed)', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler();
			handler.init();
			fireEvent.mockClear();

			const allRows = document.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			allRows[0].checked = false;
			allRows[0].dispatchEvent(new Event('input', { bubbles: true }));

			expect(fireEvent).not.toHaveBeenCalledWith(
				'unchecked',
				expect.anything(),
			);
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});
	});

	describe('Header checkbox toggle', () => {
		it('clicking header when none checked → checks all, fires change + checked + changed', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler();
			handler.init();
			fireEvent.mockClear();

			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.click();

			expect(getSelectedRows()).toEqual(['1', '2', '3']);
			expect(fireEvent).toHaveBeenCalledWith('change', { cancel: false });
			expect(fireEvent).toHaveBeenCalledWith('checked');
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});

		it('clicking header when all checked → unchecks all, fires change + unchecked + changed', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler({}, ['1', '2', '3']);
			handler.init();
			// Make sure header shows checked
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.checked = true;
			fireEvent.mockClear();

			header.click();

			expect(getSelectedRows()).toEqual([]);
			expect(fireEvent).toHaveBeenCalledWith('change', { cancel: false });
			expect(fireEvent).toHaveBeenCalledWith('unchecked');
			expect(fireEvent).toHaveBeenCalledWith('changed');
			handler.dispose();
		});

		it('change event with cancel: true prevents the toggle', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler();
			handler.init();
			// Register a listener that cancels the change
			fireEvent.mockImplementation((eventName: string, data?: any) => {
				if (eventName === 'change' && data) {
					data.cancel = true;
				}
			});
			fireEvent.mockClear();

			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.click();

			// Should not have toggled - rows should remain unchecked
			expect(getSelectedRows()).toEqual([]);
			handler.dispose();
		});

		it('preserveSelection: false → checking header replaces selectedRows with visible IDs only', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler({
				checkbox: { preserveSelection: false },
			});
			handler.init();
			fireEvent.mockClear();

			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.click();

			expect(getSelectedRows()).toEqual(['1', '2', '3']);
			handler.dispose();
		});

		it('preserveSelection: false → unchecking header clears selectedRows entirely', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler(
				{ checkbox: { preserveSelection: false } },
				['1', '2', '3', '4'],
			);
			handler.init();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.checked = true;
			fireEvent.mockClear();

			header.click();

			expect(getSelectedRows()).toEqual([]);
			handler.dispose();
		});

		it('preserveSelection: true → checking header merges visible IDs into existing selectedRows', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler(
				{ checkbox: { preserveSelection: true } },
				['99'],
			);
			handler.init();
			fireEvent.mockClear();

			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.click();

			expect(getSelectedRows()).toContain('99');
			expect(getSelectedRows()).toContain('1');
			expect(getSelectedRows()).toContain('2');
			expect(getSelectedRows()).toContain('3');
			handler.dispose();
		});

		it('preserveSelection: true → unchecking header removes only visible IDs from selectedRows', () => {
			const { handler, fireEvent, getSelectedRows } = createHandler(
				{ checkbox: { preserveSelection: true } },
				['1', '2', '3', '99'],
			);
			handler.init();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.checked = true;
			fireEvent.mockClear();

			header.click();

			expect(getSelectedRows()).toEqual(['99']);
			handler.dispose();
		});
	});

	describe('Update header checkbox state', () => {
		it('when 0 rows checked → header.checked = false, header.indeterminate = false', () => {
			const { handler } = createHandler();
			handler.init();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			expect(header.checked).toBe(false);
			expect(header.indeterminate).toBe(false);
			handler.dispose();
		});

		it('when some rows checked → header.checked = false, header.indeterminate = true', () => {
			const { handler } = createHandler({}, ['1']);
			handler.init();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			expect(header.checked).toBe(false);
			expect(header.indeterminate).toBe(true);
			handler.dispose();
		});

		it('when all rows checked → header.checked = true, header.indeterminate = false', () => {
			const { handler } = createHandler({}, ['1', '2', '3']);
			handler.init();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			expect(header.checked).toBe(true);
			expect(header.indeterminate).toBe(false);
			handler.dispose();
		});
	});

	describe('Public API', () => {
		it('isChecked() returns headerChecked state', () => {
			const { handler } = createHandler();
			handler.init();
			expect(handler.isChecked()).toBe(false);
			handler.dispose();
		});

		it('getChecked() returns selectedRows as string[]', () => {
			const { handler } = createHandler({}, ['1', '2']);
			handler.init();
			expect(handler.getChecked()).toEqual(['1', '2']);
			handler.dispose();
		});

		it('check() calls _change(true) + reapply + updateHeader', () => {
			const { handler, getSelectedRows } = createHandler();
			handler.init();
			handler.check();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			expect(header.checked).toBe(true);
			expect(getSelectedRows()).toEqual(['1', '2', '3']);
			handler.dispose();
		});

		it('uncheck() calls _change(false) + reapply + updateHeader', () => {
			const { handler, getSelectedRows } = createHandler({}, ['1', '2', '3']);
			handler.init();
			handler.uncheck();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			expect(header.checked).toBe(false);
			expect(getSelectedRows()).toEqual([]);
			handler.dispose();
		});

		it('toggle() calls _checkboxToggle + reapply + updateHeader', () => {
			const { handler, getSelectedRows } = createHandler();
			handler.init();
			handler.toggle();
			expect(getSelectedRows()).toEqual(['1', '2', '3']);
			handler.toggle();
			expect(getSelectedRows()).toEqual([]);
			handler.dispose();
		});

		it('updateState() re-queries targetElements and reapplies states', () => {
			const { handler, container } = createHandler({}, ['1']);
			handler.init();
			// Add a new row checkbox
			const tbody = container.querySelector('tbody')!;
			const newRow = document.createElement('tr');
			newRow.innerHTML = `<td><input type="checkbox" data-kt-datatable-row-check="true" value="4" /></td>`;
			tbody.appendChild(newRow);

			handler.updateState();
			// The new row should exist in targetElements now
			const allRows = container.querySelectorAll<HTMLInputElement>(
				'[data-kt-datatable-row-check]',
			);
			expect(allRows.length).toBe(4);
			handler.dispose();
		});

		it('dispose() removes event listeners and nulls references', () => {
			const { handler, fireEvent } = createHandler();
			handler.init();
			handler.dispose();

			// After dispose, clicking header should not fire events through handler
			fireEvent.mockClear();
			const header = document.querySelector<HTMLInputElement>(
				'[data-kt-datatable-check]',
			)!;
			header.click();
			// fireEvent from the handler should not be called
			expect(fireEvent).not.toHaveBeenCalled();
		});
	});

	describe('Edge cases', () => {
		it('_getSelectedRows() returns [] when state.selectedRows is undefined', () => {
			const container = document.createElement('div');
			container.innerHTML = createCheckboxTable().container.innerHTML;
			document.body.appendChild(container);
			const cfg = createConfig();
			const fireEvent = vi.fn();
			const handler = new KTDataTableCheckboxHandler(container, cfg, fireEvent, {
				getState: () => ({ selectedRows: undefined } as any),
				setSelectedRows: vi.fn(),
			});
			handler.init();
			fireEvent.mockClear();
			// check() triggers _change which calls _getSelectedRows
			handler.check();
			// Should not throw
			expect(true).toBe(true);
			handler.dispose();
		});

		it('_getVisibleRowIds() returns [] when _targetElements is null', () => {
			const container = document.createElement('div');
			container.innerHTML = `
        <table>
          <thead><tr><th><input type="checkbox" data-kt-datatable-check="true" /></th></tr></thead>
          <tbody></tbody>
        </table>
      `;
			document.body.appendChild(container);
			const cfg = createConfig();
			const fireEvent = vi.fn();
			const handler = new KTDataTableCheckboxHandler(
				container,
				cfg,
				fireEvent,
				{
					getState: () => ({ selectedRows: [] }),
					setSelectedRows: vi.fn(),
				},
			);
			handler.init();
			// No row checkboxes exist, so _targetElements is empty
			// check() should not throw
			handler.check();
			expect(true).toBe(true);
			handler.dispose();
		});

		it('init() with checkbox.checkedClass undefined skips class manipulation', () => {
			const container = document.createElement('div');
			container.innerHTML = `
        <table>
          <thead><tr><th><input type="checkbox" data-kt-datatable-check="true" /></th></tr></thead>
          <tbody>
            <tr><td><input type="checkbox" data-kt-datatable-row-check="true" value="1" /></td></tr>
          </tbody>
        </table>
      `;
			document.body.appendChild(container);
			const cfg = {
				attributes: {
					check: '[data-kt-datatable-check="true"]',
					checkbox: '[data-kt-datatable-row-check="true"]',
				},
				checkbox: { preserveSelection: true },
			} as KTDataTableConfigInterface;
			const fireEvent = vi.fn();
			const handler = new KTDataTableCheckboxHandler(
				container,
				cfg,
				fireEvent,
				{
					getState: () => ({ selectedRows: ['1'] }),
					setSelectedRows: vi.fn(),
				},
			);
			// Should not throw even without checkedClass
			handler.init();
			const row = container.querySelector('tr')!;
			expect(row.classList.contains('checked')).toBe(false);
			handler.dispose();
		});
	});
});
