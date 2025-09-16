/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTSelectConfigInterface } from './config';
export declare class KTSelectOption extends KTComponent {
    protected readonly _name: string;
    protected readonly _dataOptionPrefix: string;
    protected readonly _config: KTSelectConfigInterface;
    private _globalConfig;
    constructor(element: HTMLElement, config?: KTSelectConfigInterface);
    get id(): string;
    get title(): string;
    getHTMLOptionElement(): HTMLOptionElement;
    /**
     * Gathers all necessary data for rendering this option,
     * including standard HTML attributes and custom data-kt-* attributes.
     */
    getOptionDataForTemplate(): Record<string, any>;
    render(): HTMLElement;
}
//# sourceMappingURL=option.d.ts.map