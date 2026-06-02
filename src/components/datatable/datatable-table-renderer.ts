/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTOptionType } from '../../types';
import {
	KTDataTableDataInterface,
	KTDataTableAttributeInterface,
} from './types';
import {
	KTDataTableTableRenderer,
	KTDataTableTableRendererInput,
} from './datatable-contracts';
import { resolveColumns } from './datatable-column-utils';

export class KTDataTableDomTableRenderer<
	T extends KTDataTableDataInterface,
> implements KTDataTableTableRenderer<T> {
	public render(
		input: KTDataTableTableRendererInput<T>,
	): HTMLTableSectionElement {
		while (input.tableElement.tBodies.length) {
			input.tableElement.removeChild(input.tableElement.tBodies[0]);
		}

		const tbodyElement =
			input.tableElement.createTBody() as HTMLTableSectionElement;

		if (input.originalClasses.tbody) {
			tbodyElement.className = input.originalClasses.tbody;
		}

		this.applyTableLayout(input);

		this.renderContent(input, tbodyElement);

		return tbodyElement;
	}

	public notice(
		tableElement: HTMLTableElement,
		getLogicalColumnCount: () => number,
		message: string = '',
	): void {
		const row = tableElement.tBodies[0].insertRow();
		const cell = row.insertCell();
		const logicalCount = getLogicalColumnCount();
		cell.colSpan = logicalCount > 0 ? logicalCount : 1;
		cell.style.textAlign = 'center';
		cell.innerHTML = message;
	}

	private applyTableLayout(
		input: KTDataTableTableRendererInput<T>,
	): void {
		const tableLayout = input.config.tableLayout || 'auto';
		const tableElement = input.tableElement;

		tableElement.style.tableLayout = tableLayout;

		if (tableLayout === 'fixed') {
			if (!tableElement.style.width) {
				tableElement.style.width = '100%';
			}
			this.updateColgroup(input);
		} else {
			const existingColgroup = tableElement.querySelector('colgroup');
			if (existingColgroup) {
				tableElement.removeChild(existingColgroup);
			}
		}
	}

	private updateColgroup(
		input: KTDataTableTableRendererInput<T>,
	): void {
		const tableElement = input.tableElement;
		const existingColgroup = tableElement.querySelector('colgroup');
		if (existingColgroup) {
			tableElement.removeChild(existingColgroup);
		}

		const colgroup = document.createElement('colgroup');

		if (input.config.columns) {
			const columns = input.config.columns;
			for (const key of Object.keys(columns)) {
				const col = document.createElement('col');
				if (columns[key].width) {
					col.style.width = columns[key].width;
				}
				colgroup.appendChild(col);
			}
		} else {
			const { columnsByIndex } = resolveColumns(input.theadElement);
			for (const th of columnsByIndex) {
				const col = document.createElement('col');
				const width = th.getAttribute('data-kt-datatable-column-width');
				if (width) {
					col.style.width = width;
				}
				colgroup.appendChild(col);
			}
		}

		const thead = tableElement.querySelector('thead');
		if (thead) {
			tableElement.insertBefore(colgroup, thead);
		} else {
			tableElement.appendChild(colgroup);
		}
	}

	private renderContent(
		input: KTDataTableTableRendererInput<T>,
		tbodyElement: HTMLTableSectionElement,
	): HTMLTableSectionElement {
		const fragment = document.createDocumentFragment();

		tbodyElement.textContent = '';

		if (input.data.length === 0) {
			this.notice(
				input.tableElement,
				input.getLogicalColumnCount,
				input.config.infoEmpty || '',
			);
			return tbodyElement;
		}

		const { columnsByIndex: columnsToRender } = resolveColumns(input.theadElement);
		const logicalColumnCount =
			columnsToRender.length > 0
				? columnsToRender.length
				: input.getLogicalColumnCount();

		input.data.forEach((item: T, rowIndex: number) => {
			const row = document.createElement('tr');

			if (input.originalClasses.tr && input.originalClasses.tr[rowIndex]) {
				row.className = input.originalClasses.tr[rowIndex];
			}

			if (!input.config.columns) {
				this.renderImplicitColumns(input, row, item, rowIndex, {
					columnsToRender,
					logicalColumnCount,
				});
			} else {
				this.renderConfiguredColumns(input, row, item, rowIndex);
			}

			fragment.appendChild(row);
		});

		tbodyElement.appendChild(fragment);
		return tbodyElement;
	}

	private renderImplicitColumns(
		input: KTDataTableTableRendererInput<T>,
		row: HTMLTableRowElement,
		item: T,
		rowIndex: number,
		options: {
			columnsToRender: HTMLTableCellElement[];
			logicalColumnCount: number;
		},
	): void {
		const dataRowAttributes = input.getState().originalDataAttributes
			? input.getState().originalDataAttributes[rowIndex]
			: null;

		for (let colIndex = 0; colIndex < options.logicalColumnCount; colIndex++) {
			const th = options.columnsToRender[colIndex];
			const colName = th?.getAttribute('data-kt-datatable-column');
			const td = document.createElement('td');
			let value: KTOptionType | '';
			if (colName && Object.prototype.hasOwnProperty.call(item, colName)) {
				value = item[colName as keyof T];
			} else if (Object.prototype.hasOwnProperty.call(item, colIndex)) {
				value = item[colIndex as keyof T];
			} else {
				value = '';
			}
			td.innerHTML = value as string;

			this.applyOriginalTdClass(input, td, rowIndex, colIndex);
			this.applyDataRowAttributes(td, dataRowAttributes ?? null, colIndex);

			row.appendChild(td);
		}
	}

	private renderConfiguredColumns(
		input: KTDataTableTableRendererInput<T>,
		row: HTMLTableRowElement,
		item: T,
		rowIndex: number,
	): void {
		const columns = input.config.columns;
		if (!columns) {
			return;
		}

		Object.keys(columns).forEach((key, colIndex) => {
			const columnDef = columns[key];
			if (!columnDef) {
				return;
			}
			const colKey = key as keyof T;

			const td = document.createElement('td');

			this.applyOriginalTdClass(input, td, rowIndex, colIndex);

			if (typeof columnDef.render === 'function') {
				const result = columnDef.render.call(
					input.context,
					item[colKey],
					item,
					input.context,
				);
				if (
					result instanceof HTMLElement ||
					result instanceof DocumentFragment
				) {
					td.appendChild(result);
				} else if (typeof result === 'string') {
					td.innerHTML = result as string;
				}
			} else {
				const cellValue = item[colKey];
				if (cellValue === null || cellValue === undefined) {
					td.textContent = '';
				} else {
					// Match implicit column rendering: preserve HTML from DOM extraction.
					td.innerHTML = String(cellValue);
				}
			}

			if (typeof columnDef.createdCell === 'function') {
				columnDef.createdCell.call(input.context, td, item[colKey], item, row);
			}

			row.appendChild(td);
		});
	}

	private applyOriginalTdClass(
		input: KTDataTableTableRendererInput<T>,
		td: HTMLTableCellElement,
		rowIndex: number,
		colIndex: number,
	): void {
		if (
			input.originalClasses.td &&
			input.originalClasses.td[rowIndex] &&
			input.originalClasses.td[rowIndex][colIndex]
		) {
			td.className = input.originalClasses.td[rowIndex][colIndex];
		}
	}

	private applyDataRowAttributes(
		td: HTMLTableCellElement,
		dataRowAttributes: KTDataTableAttributeInterface | null,
		colIndex: number,
	): void {
		if (dataRowAttributes && dataRowAttributes[colIndex]) {
			for (const attr in dataRowAttributes[colIndex]) {
				td.setAttribute(attr, dataRowAttributes[colIndex][attr]);
			}
		}
	}
}
