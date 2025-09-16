/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTDataTableConfigInterface } from './types';
export interface KTDataTableCheckboxAPI {
    init(): void;
    check(): void;
    uncheck(): void;
    toggle(): void;
    isChecked(): boolean;
    getChecked(): string[];
    updateState(): void;
}
export declare function createCheckboxHandler(element: HTMLElement, config: KTDataTableConfigInterface, fireEvent: (eventName: string, eventData?: any) => void): KTDataTableCheckboxAPI;
//# sourceMappingURL=datatable-checkbox.d.ts.map