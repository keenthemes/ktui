/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { coreTemplateStrings } from './templates';
export declare const DefaultConfig: KTSelectConfigInterface;
export interface KTSelectConfigInterface {
    loadMoreText?: string;
    debug?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    multiple?: boolean;
    maxSelections?: number | null;
    disabled?: boolean;
    isRequired?: boolean;
    enableSearch?: boolean;
    searchEmpty?: string;
    searchPlaceholder?: string;
    searchAutofocus?: boolean;
    searchMinLength?: number;
    searchMaxItems?: number;
    searchDebounce?: number;
    searchParam?: string;
    clearSearchOnClose?: boolean;
    selectAllText?: string;
    clearAllText?: string;
    enableSelectAll?: boolean;
    showSelectedCount?: boolean;
    renderSelected?: (selectedOptions: any[]) => string;
    label?: string;
    height: number;
    items?: KTSelectOption[];
    isLoading?: boolean;
    onFetch?: (query?: string) => Promise<KTSelectOption[]>;
    remote?: boolean;
    dataUrl?: string;
    apiDataProperty?: string;
    remoteErrorMessage?: string;
    dataValueField?: string;
    dataFieldText?: string;
    pagination?: boolean;
    paginationLimit?: number;
    paginationPageParam?: string;
    paginationLimitParam?: string;
    paginationTotalParam?: string;
    dropdownZindex?: number | null;
    dropdownContainer?: string | null;
    dropdownPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    dropdownFlip?: boolean;
    dropdownPreventOverflow?: boolean;
    dropdownStrategy?: 'fixed' | 'absolute';
    dropdownWidth?: string | null;
    dropdownClass?: string;
    displayClass?: string;
    optionsClass?: string;
    searchClass?: string;
    searchEmptyClass?: string;
    loadingClass?: string;
    tagClass?: string;
    loadMoreClass?: string;
    wrapperClass?: string;
    errorClass?: string;
    tags?: boolean;
    combobox?: boolean;
    maxSelection?: number;
    placeholderClass?: string;
    placeholderTemplate?: string;
    displaySeparator?: string;
    displayTemplate?: string;
    displayMaxSelected?: number;
    optionTemplate?: string;
    optionClass?: string;
    tagTemplate?: string;
    dropdownTemplate?: string;
    searchEmptyTemplate?: string;
    templates?: Partial<typeof coreTemplateStrings>;
    config?: KTSelectConfigInterface;
    optionsConfig?: Record<string, KTSelectConfigInterface>;
}
export interface KTSelectOption {
    id: string;
    title: string;
    selected?: boolean;
    disabled?: boolean;
}
export declare class KTSelectState {
    private _config;
    private _selectedOptions;
    constructor(config?: KTSelectConfigInterface);
    private _initDefaultConfig;
    setItems(items?: any[], query?: string): Promise<void>;
    private _fetchRemoteData;
    getItems(): KTSelectOption[];
    setItemsFromOptions(options: HTMLOptionElement[]): void;
    getConfig(): KTSelectConfigInterface;
    setSelectedOptions(value: string | string[]): void;
    toggleSelectedOptions(value: string): void;
    getSelectedOptions(): string[];
    isSelected(value: string): boolean;
    modifyConfig(config: Partial<KTSelectConfigInterface>): void;
}
//# sourceMappingURL=config.d.ts.map