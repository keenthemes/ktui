/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTImageInputInterface, KTImageInputConfigInterface } from './types';
declare global {
    interface Window {
        KT_IMAGE_INPUT_INITIALIZED: boolean;
        KTImageInput: typeof KTImageInput;
    }
}
export declare class KTImageInput extends KTComponent implements KTImageInputInterface {
    protected _name: string;
    protected _defaultConfig: KTImageInputConfigInterface;
    protected _inputElement: HTMLInputElement;
    protected _hiddenElement: HTMLInputElement;
    protected _removeElement: HTMLElement;
    protected _previewElement: HTMLElement;
    protected _previewUrl: string;
    protected _lastMode: string;
    protected _selectedFile: File | null;
    constructor(element: HTMLElement, config?: KTImageInputConfigInterface);
    protected _handlers(): void;
    protected _change(): void;
    protected _remove(): void;
    protected _update(): void;
    protected _getPreviewUrl(): string;
    protected _setPreviewUrl(url: string): void;
    isEmpty(): boolean;
    isChanged(): boolean;
    remove(): void;
    update(): void;
    setPreviewUrl(url: string): void;
    getPreviewUrl(): string;
    getSelectedFile(): File | null;
    static getInstance(element: HTMLElement): KTImageInput;
    static getOrCreateInstance(element: HTMLElement, config?: KTImageInputConfigInterface): KTImageInput;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=image-input.d.ts.map