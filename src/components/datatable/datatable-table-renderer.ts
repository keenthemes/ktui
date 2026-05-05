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

		if (input.originalTbodyClass) {
			tbodyElement.className = input.originalTbodyClass;
		}

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
		cell.innerHTML = message;
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

		const allThs: NodeListOf<HTMLTableCellElement> = input.theadElement
			? input.theadElement.querySelectorAll('th')
			: ([] as unknown as NodeListOf<HTMLTableCellElement>);

		const ths: HTMLTableCellElement[] = Array.from(allThs).filter((th) =>
			th.hasAttribute('data-kt-datatable-column'),
		);
		const columnsToRender: HTMLTableCellElement[] =
			ths.length > 0 && ths.length !== allThs.length ? Array.from(allThs) : ths;
		const logicalColumnCount =
			columnsToRender.length > 0
				? columnsToRender.length
				: input.getLogicalColumnCount();

		input.data.forEach((item: T, rowIndex: number) => {
			const row = document.createElement('tr');

			if (input.originalTrClasses && input.originalTrClasses[rowIndex]) {
				row.className = input.originalTrClasses[rowIndex];
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
			this.applyDataRowAttributes(td, dataRowAttributes, colIndex);

			row.appendChild(td);
		}
	}

	private renderConfiguredColumns(
		input: KTDataTableTableRendererInput<T>,
		row: HTMLTableRowElement,
		item: T,
		rowIndex: number,
	): void {
		Object.keys(input.config.columns).forEach(
			(key: keyof T, colIndex: number) => {
				const td = document.createElement('td');
				const columnDef = input.config.columns[key as string];

				this.applyOriginalTdClass(input, td, rowIndex, colIndex);

				if (typeof columnDef.render === 'function') {
					const result = columnDef.render.call(
						input.context,
						item[key],
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
					td.textContent = item[key] as string;
				}

				if (typeof columnDef.createdCell === 'function') {
					columnDef.createdCell.call(input.context, td, item[key], item, row);
				}

				row.appendChild(td);
			},
		);
	}

	private applyOriginalTdClass(
		input: KTDataTableTableRendererInput<T>,
		td: HTMLTableCellElement,
		rowIndex: number,
		colIndex: number,
	): void {
		if (
			input.originalTdClasses &&
			input.originalTdClasses[rowIndex] &&
			input.originalTdClasses[rowIndex][colIndex]
		) {
			td.className = input.originalTdClasses[rowIndex][colIndex];
		}
	}

	private applyDataRowAttributes(
		td: HTMLTableCellElement,
		dataRowAttributes: KTDataTableAttributeInterface,
		colIndex: number,
	): void {
		if (dataRowAttributes && dataRowAttributes[colIndex]) {
			for (const attr in dataRowAttributes[colIndex]) {
				td.setAttribute(attr, dataRowAttributes[colIndex][attr]);
			}
		}
	}
}
