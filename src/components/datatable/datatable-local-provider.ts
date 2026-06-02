/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTUtils from '../../helpers/utils';
import {
	KTDataTableAttributeInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
} from './types';
import {
	KTDataTableDataProvider,
	KTDataTableLocalProviderElements,
	KTDataTableProviderResult,
	KTDataTableStateStore,
} from './datatable-contracts';
import { resolveColumns } from './datatable-column-utils';
import { stripHtml } from './datatable-utils';

type FilterMatcher = (cellValue: unknown, filterValue: unknown) => boolean;

const FILTER_MATCHERS: Record<string, FilterMatcher> = {
	text: (cellValue, filterValue) => {
		if (!filterValue) return true;
		return stripHtml(cellValue)
			.toLowerCase()
			.includes(String(filterValue).toLowerCase());
	},
	numeric: (cellValue, filterValue) => {
		const num = parseFloat(
			String(cellValue ?? '').replace(/[^0-9.-]/g, ''),
		);
		return !Number.isNaN(num) && num === filterValue;
	},
	dateRange: (cellValue, filterValue) => {
		const range = filterValue as { from?: string; to?: string };
		if (!range?.from && !range?.to) return true;
		const cellDate = new Date(String(cellValue ?? ''));
		if (Number.isNaN(cellDate.getTime())) return false;
		if (range.from && cellDate < new Date(range.from)) return false;
		if (range.to && cellDate > new Date(range.to)) return false;
		return true;
	},
};

interface KTDataTableLocalProviderOptions {
	config: KTDataTableConfigInterface;
	elements: () => KTDataTableLocalProviderElements;
	getLogicalColumnCount: () => number;
	storeOriginalClasses: () => void;
	stateStore: KTDataTableStateStore;
}

export class KTDataTableLocalDataProvider<
	T extends KTDataTableDataInterface,
> implements KTDataTableDataProvider<T> {
	constructor(private readonly options: KTDataTableLocalProviderOptions) {}

	public async fetch(): Promise<KTDataTableProviderResult<T>> {
		return this.fetchSync();
	}

	public fetchSync(): KTDataTableProviderResult<T> {
		const state = this.options.stateStore.getState();
		let { originalData } = state;
		const skipDomInvalidation = Boolean(
			this.options.config.lockedLayout || this.options.config.layoutPlugin,
		);

		if (
			!this.options.elements().tableElement ||
			originalData === undefined ||
			(!skipDomInvalidation &&
				(this.tableConfigInvalidate() ||
					this.localTableHeaderInvalidate() ||
					this.localTableContentInvalidate()))
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
			const searchCallback = this.options.config.search?.callback;
			if (searchCallback) {
				filteredData = data = searchCallback.call(
					this,
					data,
					searchTerm,
				) as T[];
			}
		}

		// Apply column filters
		const { filters } = this.options.stateStore.getState();
		if (filters && filters.length > 0) {
			filteredData = data = data.filter((item: T) => {
				return filters.every((filter) => {
					const cellValue = item[filter.column as keyof T];
					const matcher = FILTER_MATCHERS[filter.type];
					return matcher ? matcher(cellValue, filter.value) : true;
				});
			}) as T[];
		}

		const sortCallback = this.options.config.sort?.callback;
		if (
			sortField !== undefined &&
			sortOrder !== undefined &&
			sortOrder !== '' &&
			typeof sortCallback === 'function'
		) {
			data = sortCallback.call(
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
			const domRowCount =
				tbodyElement.querySelectorAll<HTMLTableRowElement>('tr').length;
			const storedRowCount =
				this.options.stateStore.getState().originalData?.length ?? 0;
			// Programmatic dataset with an empty tbody must not re-import from the DOM.
			if (domRowCount === 0 && storedRowCount > 0) {
				return false;
			}
			return true;
		}

		return false;
	}

	private tableConfigInvalidate(): boolean {
		const { _state, ...restConfig } = this.options.config;
		const checksum: string = KTUtils.checksum(JSON.stringify(restConfig));
		const previousChecksum = _state?._configChecksum ?? '';

		if (previousChecksum !== checksum) {
			this.options.stateStore.patchState({ _configChecksum: checksum });
			// First load skips this check (originalData === undefined). On the first
			// pagination fetch, previousChecksum is still empty — record it but do
			// not re-extract from the paginated DOM (that would shrink originalData).
			return previousChecksum !== '';
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
		const { columnsByIndex } = resolveColumns(theadElement);

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
