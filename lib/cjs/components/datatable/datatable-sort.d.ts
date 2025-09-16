/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDataTableConfigInterface, KTDataTableSortOrderInterface, KTDataTableDataInterface } from './types';
export interface KTDataTableSortAPI<T = KTDataTableDataInterface> {
    initSort(): void;
    sortData(data: T[], sortField: keyof T | number, sortOrder: KTDataTableSortOrderInterface): T[];
    toggleSortOrder(currentField: keyof T | number, currentOrder: KTDataTableSortOrderInterface, newField: keyof T | number): KTDataTableSortOrderInterface;
    setSortIcon(sortField: keyof T, sortOrder: KTDataTableSortOrderInterface): void;
}
export declare function createSortHandler<T = KTDataTableDataInterface>(config: KTDataTableConfigInterface, theadElement: HTMLTableSectionElement, getState: () => {
    sortField: keyof T | number;
    sortOrder: KTDataTableSortOrderInterface;
}, setState: (field: keyof T | number, order: KTDataTableSortOrderInterface) => void, fireEvent: (eventName: string, eventData?: any) => void, dispatchEvent: (eventName: string, eventData?: any) => void, updateData: () => void): KTDataTableSortAPI<T>;
//# sourceMappingURL=datatable-sort.d.ts.map