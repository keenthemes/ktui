/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableAttributeInterface,
	KTDataTableColumnFilterInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
	KTDataTableSortOrderInterface,
	KTDataTableStateInterface,
} from './types';
import { KTDataTableStateStore } from './datatable-contracts';

export class KTDataTableConfigStateStore implements KTDataTableStateStore {
	constructor(private readonly config: KTDataTableConfigInterface) {
		this.ensureState();
	}

	public getState(): KTDataTableStateInterface {
		this.ensureState();
		return {
			page: 1,
			sortField: null,
			sortOrder: '',
			pageSize: this.config.pageSize,
			filters: [],
			...this.config._state,
		} as KTDataTableStateInterface;
	}

	public replaceState(state: KTDataTableStateInterface): void {
		this.config._state = state;
		this.ensureState();
	}

	public patchState(state: Partial<KTDataTableStateInterface>): void {
		this.ensureState();
		this.config._state = {
			...this.config._state,
			...state,
		} as KTDataTableStateInterface;
	}

	public setPage(page: number): void {
		this.patchState({ page });
	}

	public setPageSize(pageSize: number, page: number = 1): void {
		this.patchState({ pageSize, page });
	}

	public setSort(
		field: keyof KTDataTableDataInterface | number,
		order: KTDataTableSortOrderInterface,
	): void {
		this.patchState({
			sortField: field,
			sortOrder: order,
		} as Partial<KTDataTableStateInterface>);
	}

	public setSearch(search: string | object): void {
		this.patchState({ search, page: 1 });
	}

	public setFilter(filter: KTDataTableColumnFilterInterface): void {
		const filters = [
			...(this.getState().filters || []).filter(
				(currentFilter) => currentFilter.column !== filter.column,
			),
			filter,
		];

		this.patchState({ filters, page: 1 });
	}

	public setOriginalData(
		originalData: KTDataTableDataInterface[],
		originalDataAttributes: KTDataTableAttributeInterface[],
	): void {
		this.patchState({
			originalData,
			originalDataAttributes,
		} as Partial<KTDataTableStateInterface>);
	}

	private ensureState(): void {
		if (!this.config._state) {
			this.config._state = {} as KTDataTableStateInterface;
		}
	}
}
