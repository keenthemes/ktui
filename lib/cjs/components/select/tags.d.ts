/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTSelect } from './select';
/**
 * KTSelectTags - Handles tags-specific functionality for KTSelect
 */
export declare class KTSelectTags {
    private _select;
    private _config;
    private _valueDisplayElement;
    private _eventManager;
    /**
     * Constructor: Initializes the tags component
     */
    constructor(select: KTSelect);
    /**
     * Update selected tags display
     * Renders selected options as tags in the display element
     */
    updateTagsDisplay(selectedOptions: string[]): void;
    /**
     * Remove a tag and its selection
     */
    private _removeTag;
    /**
     * Clean up resources used by this module
     */
    destroy(): void;
}
//# sourceMappingURL=tags.d.ts.map