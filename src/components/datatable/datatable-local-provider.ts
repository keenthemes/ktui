/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTUtils from '../../helpers/utils';
import {
	KTDataTableAttributeInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
	KTDataTableStateInterface,
} from './types';
import {
	KTDataTableDataProvider,
	KTDataTableLocalProviderElements,
	KTDataTableProviderResult,
	KTDataTableStateStore,
} from './datatable-contracts';

interface KTDataTableLocalProviderOptions<T extends KTDataTableDataInterface> {
	config: KTDataTableConfigInterface;
	elements: () => KTDataTableLocalProviderElements;
	getLogicalColumnCount: () => number;
	storeOriginalClasses: () => void;
	stateStore: KTDataTableStateStore;
}

export class KTDataTableLocalDataProvider<
	T extends KTDataTableDataInterface,
> implements KTDataTableDataProvider<T> {
	constructor(private readonly options: KTDataTableLocalProviderOptions<T>) {}

	public async fetch(): Promise<KTDataTableProviderResult<T>> {
		return this.fetchSync();
	}

	public fetchSync(): KTDataTableProviderResult<T> {
		const state = this.options.stateStore.getState();
		let { originalData } = state;

		if (
			!this.options.elements().tableElement ||
			originalData === undefined ||
			this.tableConfigInvalidate() ||
			this.localTableHeaderInvalidate() ||
			this.localTableContentInvalidate()
		) {
			const { originalData, originalDataAttributes } =
				this.localExtractTableContent();

			this.options.stateStore.setOriginalData(
				originalData,
				originalDataAttributes,
			);
		}

		originalData = this.options.stateStore.getState().originalData;
		let data = [...originalData] as T[];
		let filteredData = data;

		const { sortField, sortOrder, page, pageSize, search } =
			this.options.stateStore.getState();

		if (search) {
			const searchTerm = typeof search === 'string' ? search : '';
			filteredData = data = this.options.config.search.callback.call(
				this,
				data,
				searchTerm,
			) as T[];
		}

		if (
			sortField !== undefined &&
			sortOrder !== undefined &&
			sortOrder !== '' &&
			typeof this.options.config.sort.callback === 'function'
		) {
			data = this.options.config.sort.callback.call(
				this,
				data,
				sortField as string,
				sortOrder,
			) as T[];
		}

		if (data?.length > 0) {
			const startIndex = (page - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			data = data.slice(startIndex, endIndex) as T[];
		}

		return {
			data,
			totalItems: filteredData.length,
		};
	}

	private localTableContentInvalidate(): boolean {
		const { tbodyElement } = this.options.elements();
		const checksum: string = KTUtils.checksum(
			JSON.stringify(tbodyElement.innerHTML),
		);

		if (this.options.stateStore.getState()._contentChecksum !== checksum) {
			this.options.stateStore.patchState({ _contentChecksum: checksum });
			return true;
		}

		return false;
	}

	private tableConfigInvalidate(): boolean {
		const { _state, ...restConfig } = this.options.config;
		const checksum: string = KTUtils.checksum(JSON.stringify(restConfig));

		if (_state._configChecksum !== checksum) {
			this.options.stateStore.patchState({ _configChecksum: checksum });
			return true;
		}

		return false;
	}

	private localExtractTableContent(): {
		originalData: T[];
		originalDataAttributes: KTDataTableAttributeInterface[];
	} {
		const originalData: T[] = [];
		const originalDataAttributes: KTDataTableAttributeInterface[] = [];
		const { tbodyElement, theadElement } = this.options.elements();

		this.options.storeOriginalClasses();

		const rows = tbodyElement.querySelectorAll<HTMLTableRowElement>('tr');
		const allThs: NodeListOf<HTMLTableCellElement> = theadElement
			? theadElement.querySelectorAll('th')
			: ([] as unknown as NodeListOf<HTMLTableCellElement>);

		const ths: HTMLTableCellElement[] = Array.from(allThs).filter((th) =>
			th.hasAttribute('data-kt-datatable-column'),
		);
		const columnsByIndex: HTMLTableCellElement[] =
			ths.length > 0 && ths.length !== allThs.length ? Array.from(allThs) : ths;

		rows.forEach((row: HTMLTableRowElement) => {
			const dataRow: T = {} as T;
			const dataRowAttribute: KTDataTableAttributeInterface =
				{} as KTDataTableAttributeInterface;

			row.querySelectorAll<HTMLTableCellElement>('td').forEach((td, index) => {
				const colName = columnsByIndex[index]?.getAttribute(
					'data-kt-datatable-column',
				);
				if (colName) {
					dataRow[colName as keyof T] = td.innerHTML?.trim() as T[keyof T];
				} else {
					dataRow[index as keyof T] = td.innerHTML?.trim() as T[keyof T];
				}
			});

			if (Object.keys(dataRow).length > 0) {
				originalData.push(dataRow);
				originalDataAttributes.push(dataRowAttribute);
			}
		});

		return { originalData, originalDataAttributes };
	}

	private localTableHeaderInvalidate(): boolean {
		const { originalData } = this.options.stateStore.getState();
		const { theadElement } = this.options.elements();

		const totalColumns = originalData.length
			? Object.keys(originalData[0]).length
			: 0;

		const allThs: NodeListOf<HTMLTableCellElement> = theadElement
			? theadElement.querySelectorAll('th')
			: ([] as unknown as NodeListOf<HTMLTableCellElement>);
		const thsWithColumn = Array.from(allThs).filter((th) =>
			th.hasAttribute('data-kt-datatable-column'),
		);
		const currentTableHeaders =
			thsWithColumn.length > 0
				? thsWithColumn.length !== allThs.length
					? allThs.length
					: thsWithColumn.length
				: this.options.getLogicalColumnCount();

		return currentTableHeaders !== totalColumns;
	}
}
