/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableAttributeInterface,
	KTDataTableColumnFilterInterface,
	KTDataTableConfigInterface,
	KTDataTableDataInterface,
	KTDataTableInterface,
	KTDataTableSortOrderInterface,
	KTDataTableStateInterface,
} from './types';

export type KTDataTableEmit = (eventName: string, eventData?: object) => void;
export type KTDataTableCleanup = () => void;

export interface KTDataTableEventAdapter {
	emit(eventName: string, eventData?: object): void;
}

export interface KTDataTableStateStore {
	getState(): KTDataTableStateInterface;
	replaceState(state: KTDataTableStateInterface): void;
	patchState(state: Partial<KTDataTableStateInterface>): void;
	setPage(page: number): void;
	setPageSize(pageSize: number, page?: number): void;
	setSort(
		field: keyof KTDataTableDataInterface | number,
		order: KTDataTableSortOrderInterface,
	): void;
	setSearch(search: string | object): void;
	setFilter(filter: KTDataTableColumnFilterInterface): void;
	setOriginalData(
		originalData: KTDataTableDataInterface[],
		originalDataAttributes: KTDataTableAttributeInterface[],
	): void;
}

export interface KTDataTableProviderResult<T extends KTDataTableDataInterface> {
	data: T[];
	totalItems: number;
	response?: unknown;
	skipped?: boolean;
}

export interface KTDataTableDataProvider<T extends KTDataTableDataInterface> {
	fetch(): Promise<KTDataTableProviderResult<T>>;
	dispose?(): void;
}

export interface KTDataTableLocalProviderElements {
	tableElement: HTMLTableElement;
	tbodyElement: HTMLTableSectionElement;
	theadElement: HTMLTableSectionElement;
}

export interface KTDataTableTableRendererInput<
	T extends KTDataTableDataInterface,
> {
	config: KTDataTableConfigInterface;
	context: KTDataTableInterface;
	data: T[];
	getLogicalColumnCount: () => number;
	getState: () => KTDataTableStateInterface;
	originalTbodyClass: string;
	originalTrClasses: string[];
	originalTdClasses: string[][];
	tableElement: HTMLTableElement;
	theadElement: HTMLTableSectionElement;
}

export interface KTDataTableTableRenderer<T extends KTDataTableDataInterface> {
	render(input: KTDataTableTableRendererInput<T>): HTMLTableSectionElement;
	notice(
		tableElement: HTMLTableElement,
		getLogicalColumnCount: () => number,
		message?: string,
	): void;
}

export interface KTDataTablePaginationRendererInput {
	config: KTDataTableConfigInterface;
	dataLength: number;
	infoElement: HTMLElement;
	paginateData: (page: number) => void;
	paginationElement: HTMLElement;
	reloadPageSize: (pageSize: number, page?: number) => void;
	sizeElement: HTMLSelectElement;
	state: KTDataTableStateInterface;
}

export interface KTDataTablePaginationRenderer {
	render(input: KTDataTablePaginationRendererInput): KTDataTableCleanup | void;
}
