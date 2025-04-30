/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTStepperInterface, KTStepperConfigInterface } from './types';

declare global {
	interface Window {
		KT_STEPPER_INITIALIZED: boolean;
		KTStepper: typeof KTStepper;
	}
}

export class KTStepper extends KTComponent implements KTStepperInterface {
	protected override _name: string = 'stepper';
	protected override _defaultConfig: KTStepperConfigInterface = {
		hiddenClass: 'hidden',
		activeStep: 1,
	};
	protected override _config: KTStepperConfigInterface = this._defaultConfig;
	protected _activeStep: number = 0;
	protected _nextElement: HTMLElement | null = null;
	protected _backElement: HTMLElement | null = null;

	constructor(
		element: HTMLElement,
		config: KTStepperConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;
		this._nextElement = this._element.querySelector('[data-kt-stepper-next]');
		this._backElement = this._element.querySelector('[data-kt-stepper-back]');

		this._activeStep = 1;
		if (this._getOption('activeStep') !== this._activeStep) {
			this._go(this._getOption('activeStep') as number);
		}

		this._update();
		this._handlers();
	}

	protected _handlers(): void {
		if (!this._nextElement) {
			console.error('data-kt-stepper-next not found');
			return;
		}

		if (this._nextElement) {
			this._nextElement.addEventListener('click', (event: Event) => {
				event.preventDefault();
				this._goNext();
			});
		}

		if (this._backElement) {
			this._backElement.addEventListener('click', (event: Event) => {
				event.preventDefault();
				this._goBack();
			});
		}
	}

	protected _update(): void {
		if (!this._element) return;
		let state = '';

		if (this._activeStep === this._getTotalSteps()) {
			state = 'last';
		} else if (this._activeStep === 1) {
			state = 'first';
		} else {
			state = 'between';
		}

		this._element.classList.remove('first');
		this._element.classList.remove('last');
		this._element.classList.remove('between');
		this._element.classList.add(state);

		this._getItemElements().forEach((element, index) => {
			const contentElement = KTDom.getElement(
				element.getAttribute('data-kt-stepper-item'),
			);
			if (!contentElement) return;

			element.classList.remove('active');
			element.classList.remove('completed');
			element.classList.remove('pending');

			const numberElement = element.querySelector('[data-kt-stepper-number]');
			if (numberElement) numberElement.innerHTML = String(index + 1);

			if (index + 1 == this._activeStep) {
				element.classList.add('active');
				contentElement.classList.remove(
					this._getOption('hiddenClass') as string,
				);
			} else {
				contentElement.classList.add(this._getOption('hiddenClass') as string);
				if (index + 1 < this._activeStep) {
					element.classList.add('completed');
				} else {
					element.classList.add('pending');
				}
			}
		});
	}

	protected _getItemElements(): Array<HTMLElement> {
		const elements: Array<HTMLElement> = [];

		this._element
			.querySelectorAll('[data-kt-stepper-item]')
			.forEach((element) => {
				if (KTDom.isVisible(element as HTMLElement)) {
					elements.push(element as HTMLElement);
				}
			});

		return elements;
	}

	protected _go(step: number): void {
		if (step === this._activeStep || step > this._getTotalSteps() || step < 0)
			return;

		const payload = { step: step, cancel: false };
		this._fireEvent('change', payload);
		this._dispatchEvent('change', payload);
		if (payload.cancel === true) {
			return;
		}

		this._activeStep = step;
		this._update();

		this._fireEvent('changed');
		this._dispatchEvent('changed');
	}

	protected _goTo(itemElement: HTMLElement): void {
		const step = this._getStep(itemElement);
		this._go(step);
	}

	protected _getStep(itemElement: HTMLElement): number {
		let step = -1;

		this._getItemElements().forEach((element, index) => {
			if (element === itemElement) {
				step = index + 1;
				return;
			}
		});

		return step;
	}

	protected _getItemElement(step: number) {
		return this._getItemElements()[step - 1];
	}

	protected _getTotalSteps(): number {
		return this._getItemElements().length;
	}

	protected _goNext(): void {
		let step;

		if (this._getTotalSteps() >= this._activeStep + 1) {
			step = this._activeStep + 1;
		} else {
			step = this._getTotalSteps();
		}

		this._go(step);
	}

	protected _goBack(): void {
		let step;

		if (this._activeStep - 1 > 1) {
			step = this._activeStep - 1;
		} else {
			step = 1;
		}

		this._go(step);
	}

	protected _goLast(): void {
		const step = this._getTotalSteps();
		this._go(step);
	}

	protected _goFirst(): void {
		const step = 1;
		this._go(step);
	}

	protected _isLast(): boolean {
		return this._getTotalSteps() === this._activeStep + 1;
	}

	protected _isFirst(): boolean {
		return this._activeStep === 1;
	}

	public isLast(): boolean {
		return this._isLast();
	}

	public isFirst(): boolean {
		return this._isFirst();
	}

	public go(step: number): void {
		this._go(step);
	}

	public goTo(itemElement: HTMLElement): void {
		this.goTo(itemElement);
	}

	public goFirst(): void {
		this._goFirst();
	}

	public goLast(): void {
		this._goLast();
	}

	public goNext(): void {
		this._goNext();
	}

	public goBack(): void {
		this._goBack();
	}

	public update(): void {
		this._update();
	}

	public getStep(itemElement: HTMLElement): number {
		return this._getStep(itemElement);
	}

	public getItemElement(step: number): HTMLElement {
		return this._getItemElement(step);
	}

	public getTotalSteps(): number {
		return this._getTotalSteps();
	}

	public getItemElements(): Array<HTMLElement> {
		return this._getItemElements();
	}

	public static getInstance(element: HTMLElement): KTStepper {
		if (!element) return null;

		if (KTData.has(element, 'stepper')) {
			return KTData.get(element, 'stepper') as KTStepper;
		}

		if (element.getAttribute('data-kt-stepper')) {
			return new KTStepper(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTStepperConfigInterface,
	): KTStepper | null {
		return this.getInstance(element) || new KTStepper(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-stepper]');

		elements.forEach((element) => {
			new KTStepper(element as HTMLElement);
		});
	}

	public static init(): void {
		KTStepper.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTStepper = KTStepper;
}
