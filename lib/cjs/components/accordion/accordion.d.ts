/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTAccordionInterface, KTAccordionConfigInterface } from './types';
declare global {
    interface Window {
        KT_ACCORDION_INITIALIZED: boolean;
        KTAccordion: typeof KTAccordion;
    }
}
export declare class KTAccordion extends KTComponent implements KTAccordionInterface {
    protected _name: string;
    protected _defaultConfig: KTAccordionConfigInterface;
    protected _config: KTAccordionConfigInterface;
    protected _accordionElements: NodeListOf<HTMLElement>;
    constructor(element: HTMLElement, config?: KTAccordionConfigInterface);
    protected _handlers(): void;
    protected _toggle(accordionElement: HTMLElement): void;
    protected _show(accordionElement: HTMLElement): void;
    protected _hide(accordionElement: HTMLElement): void;
    protected _hideSiblings(accordionElement: HTMLElement): void;
    show(accordionElement: HTMLElement): void;
    hide(accordionElement: HTMLElement): void;
    toggle(accordionElement: HTMLElement): void;
    static getInstance(element: HTMLElement): KTAccordion;
    static getOrCreateInstance(element: HTMLElement, config?: KTAccordionConfigInterface): KTAccordion;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=accordion.d.ts.map