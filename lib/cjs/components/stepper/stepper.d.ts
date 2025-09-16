/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import KTComponent from '../component';
import { KTStepperInterface, KTStepperConfigInterface } from './types';
declare global {
    interface Window {
        KT_STEPPER_INITIALIZED: boolean;
        KTStepper: typeof KTStepper;
    }
}
export declare class KTStepper extends KTComponent implements KTStepperInterface {
    protected _name: string;
    protected _defaultConfig: KTStepperConfigInterface;
    protected _config: KTStepperConfigInterface;
    protected _activeStep: number;
    protected _nextElement: HTMLElement | null;
    protected _backElement: HTMLElement | null;
    constructor(element: HTMLElement, config?: KTStepperConfigInterface | null);
    protected _handlers(): void;
    protected _update(): void;
    protected _getItemElements(): Array<HTMLElement>;
    protected _go(step: number): Promise<void>;
    protected _goTo(itemElement: HTMLElement): void;
    protected _getStep(itemElement: HTMLElement): number;
    protected _getItemElement(step: number): HTMLElement;
    protected _getTotalSteps(): number;
    protected _goNext(): void;
    protected _goBack(): void;
    protected _goLast(): void;
    protected _goFirst(): void;
    protected _isLast(): boolean;
    protected _isFirst(): boolean;
    isLast(): boolean;
    isFirst(): boolean;
    go(step: number): void;
    goTo(itemElement: HTMLElement): void;
    goFirst(): void;
    goLast(): void;
    goNext(): void;
    goBack(): void;
    update(): void;
    getStep(itemElement: HTMLElement): number;
    getItemElement(step: number): HTMLElement;
    getTotalSteps(): number;
    getItemElements(): Array<HTMLElement>;
    static getInstance(element: HTMLElement): KTStepper;
    static getOrCreateInstance(element: HTMLElement, config?: KTStepperConfigInterface): KTStepper | null;
    static createInstances(): void;
    static init(): void;
}
//# sourceMappingURL=stepper.d.ts.map