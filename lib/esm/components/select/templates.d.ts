/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelectConfigInterface, KTSelectOption } from './config';
/**
 * Default HTML string templates for KTSelect. All UI structure is defined here.
 * Users can override any template by providing a matching key in the config.templates object.
 */
export declare const coreTemplateStrings: {
    dropdown: string;
    options: string;
    error: string;
    wrapper: string;
    combobox: string;
    placeholder: string;
    display: string;
    option: string;
    search: string;
    searchEmpty: string;
    loading: string;
    tag: string;
    loadMore: string;
    selectAll: string;
    tagRemoveButton: string;
};
/**
 * Template interface for KTSelect component
 * Each method returns an HTML string or HTMLElement
 */
export interface KTSelectTemplateInterface {
    /**
     * Renders the dropdown content container
     */
    dropdown: (config: KTSelectConfigInterface & {
        zindex?: number;
        content?: string;
    }) => HTMLElement;
    /**
     * Renders the options container
     */
    options: (config: KTSelectConfigInterface & {
        options?: string;
    }) => HTMLElement;
    /**
     * Renders the load more button for pagination
     */
    loadMore: (config: KTSelectConfigInterface) => HTMLElement;
    /**
     * Renders an error message in the dropdown
     */
    error: (config: KTSelectConfigInterface & {
        errorMessage: string;
    }) => HTMLElement;
    wrapper: (config: KTSelectConfigInterface) => HTMLElement;
    display: (config: KTSelectConfigInterface) => HTMLElement;
    option: (option: KTSelectOption | HTMLOptionElement, config: KTSelectConfigInterface) => HTMLElement;
    search: (config: KTSelectConfigInterface) => HTMLElement;
    searchEmpty: (config: KTSelectConfigInterface) => HTMLElement;
    loading: (config: KTSelectConfigInterface, loadingMessage: string) => HTMLElement;
    tag: (option: HTMLOptionElement, config: KTSelectConfigInterface) => HTMLElement;
    placeholder: (config: KTSelectConfigInterface) => HTMLElement;
    selectAll: (config: KTSelectConfigInterface) => HTMLElement;
}
/**
 * Register or update user template overrides.
 * @param templates Partial template object to merge with defaults.
 */
export declare function setTemplateStrings(templates: Partial<typeof coreTemplateStrings>): void;
/**
 * Get the complete template set, merging defaults, user overrides, and config templates.
 * @param config Optional config object with a "templates" property.
 */
export declare function getTemplateStrings(config?: KTSelectConfigInterface): typeof coreTemplateStrings;
/**
 * Default templates for KTSelect component
 */
export declare const defaultTemplates: KTSelectTemplateInterface;
//# sourceMappingURL=templates.d.ts.map