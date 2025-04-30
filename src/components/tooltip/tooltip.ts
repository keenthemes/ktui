import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTComponent from '../component';
import { KTTooltipInterface, KTTooltipConfigInterface } from './types';
import {
	createPopper,
	PositioningStrategy,
	Instance,
	Placement,
} from '@popperjs/core';
import { KTTooltipTriggerType } from './types';

declare global {
	interface Window {
		KT_TOOLTIP_INITIALIZED: boolean;
		KTTooltip: typeof KTTooltip;
	}
}

export class KTTooltip extends KTComponent implements KTTooltipInterface {
	protected override _name: string = 'tooltip';
	protected override _defaultConfig: KTTooltipConfigInterface = {
		target: '',
		hiddenClass: 'hidden',
		trigger: 'hover',
		placement: 'top',
		placementRtl: 'top',
		container: '',
		strategy: 'fixed',
		offset: '0, 5px',
		offsetRtl: '0, 5px',
		delayShow: 0,
		delayHide: 0,
		permanent: false,
		zindex: '100',
	};
	protected override _config: KTTooltipConfigInterface = this._defaultConfig;
	protected _isOpen: boolean = false;
	protected _targetElement: HTMLElement;
	protected _popper!: Instance;
	protected _transitioning: boolean = false;
	protected _timeout!: ReturnType<typeof setTimeout>;

	constructor(
		element: HTMLElement,
		config: KTTooltipConfigInterface | null = null
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._targetElement = this._getTargetElement();
		if (!this._targetElement) {
			return;
		}

		this._handlers();
	}

	private _getTargetElement(): HTMLElement | null {
		return (
			KTDom.getElement(
				this._element.getAttribute('data-kt-tooltip') as string
			) ||
			this._element.querySelector('[data-kt-tooltip-content]') ||
			KTDom.getElement(this._getOption('target') as string)
		);
	}

	protected _handlers(): void {
		if (!this._element) return;

		if (this._getOption('trigger') === 'click') {
			this._element.addEventListener('click', () => this._toggle());
		}

		if (this._getOption('trigger') === 'focus') {
			this._element.addEventListener('focus', () => this._toggle());
			this._element.addEventListener('blur', () => this._hide());
		}

		if (this._getOption('trigger') === 'hover') {
			this._element.addEventListener('mouseenter', () => this._show());
			this._element.addEventListener('mouseleave', () => this._hide());
		}
	}

	protected _show(): void {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}

		if (this._isOpen) return;

		this._timeout = setTimeout(() => {
			const payload = { cancel: false };
			this._fireEvent('show', payload);
			this._dispatchEvent('show', payload);
			if (payload.cancel === true) {
				return;
			}

			if (!this._targetElement) {
				return;
			}
			if (!this._element) return;

			this._createPopper();
			this._handleContainer();
			this._setZindex();

			this._targetElement.classList.add('show');
			this._targetElement.classList.remove(
				this._getOption('hiddenClass') as string
			);
			this._targetElement.style.opacity = '0';
			KTDom.reflow(this._targetElement);
			this._targetElement.style.opacity = '1';
			this._transitioning = true;
			this._isOpen = true;

			KTDom.transitionEnd(this._targetElement, () => {
				this._targetElement.style.opacity = '';
				this._transitioning = false;
				this._fireEvent('shown');
				this._dispatchEvent('shown');
			});
		}, this._getOption('delayShow') as number);
	}

	protected _hide(): void {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}

		if (!this._isOpen) return;

		this._timeout = setTimeout(() => {
			const payload = { cancel: false };
			this._fireEvent('hide', payload);
			this._dispatchEvent('hide', payload);
			if (payload.cancel === true) {
				return;
			}

			if (!this._targetElement) {
				return;
			}

			this._targetElement.style.opacity = '1';
			KTDom.reflow(this._targetElement);
			this._targetElement.style.opacity = '0';
			this._transitioning = true;
			this._isOpen = false;

			KTDom.transitionEnd(this._targetElement, () => {
				this._popper.destroy();
				this._targetElement.classList.remove('show');
				this._targetElement.classList.add(
					this._getOption('hiddenClass') as string
				);
				this._targetElement.style.opacity = '';
				this._transitioning = false;
				this._fireEvent('hidden');
				this._dispatchEvent('hidden');
			});
		}, this._getOption('delayHide') as number);
	}

	protected _toggle(): void {
		const payload = { cancel: false };
		this._fireEvent('toggle', payload);
		this._dispatchEvent('toggle', payload);
		if (payload.cancel === true) {
			return;
		}

		if (this._isOpen) {
			this._hide();
		} else {
			this._show();
		}
	}

	protected _createPopper(): void {
		if (!this._element) return;

		const isRtl = KTDom.isRTL();

		// Placement
		let placement = this._getOption('placement') as Placement;
		if (isRtl && this._getOption('placementRtl')) {
			placement = this._getOption('placementRtl') as Placement;
		}

		// Offset
		let offsetValue = this._getOption('offset');
		if (isRtl && this._getOption('offsetRtl')) {
			offsetValue = this._getOption('offsetRtl') as Placement;
		}
		const offset = offsetValue
			? offsetValue
					.toString()
					.split(',')
					.map((value) => parseInt(value.trim(), 10))
			: [0, 0];

		if (!this._targetElement) {
			return;
		}

		this._popper = createPopper(this._element, this._targetElement, {
			placement: placement,
			strategy: this._getOption('strategy') as PositioningStrategy,
			modifiers: [
				{
					name: 'offset',
					options: {
						offset,
					},
				},
			],
		});
	}

	protected _handleContainer(): void {
		if (this._getOption('container')) {
			if (this._getOption('container') === 'body') {
				document.body.appendChild(this._targetElement);
			} else {
				document
					.querySelector(this._getOption('container') as string)
					?.appendChild(this._targetElement);
			}
		}
	}

	protected _setZindex(): void {
		let zindex: number = parseInt(this._getOption('zindex') as string);

		if (parseInt(KTDom.getCssProp(this._element, 'z-index')) > zindex) {
			zindex = parseInt(KTDom.getCssProp(this._element, 'z-index'));
		}

		if (KTDom.getHighestZindex(this._element) > zindex) {
			zindex = KTDom.getHighestZindex(this._element) + 1;
		}

		this._targetElement.style.zIndex = String(zindex);
	}

	public show(): void {
		this._show();
	}

	public hide(): void {
		this._hide();
	}

	public toggle(): void {
		this._toggle();
	}

	public getContentElement(): HTMLElement | null {
		return this._targetElement;
	}

	public isOpen(): boolean {
		return this._isOpen;
	}

	public getTriggerOption(): KTTooltipTriggerType {
		return this._getOption('trigger') as KTTooltipTriggerType;
	}

	public isPermanent(): boolean {
		return this._getOption('permanent') as boolean;
	}

	public static initHandlers(): void {
		document.addEventListener('click', (event: Event) => {
			document
				.querySelectorAll('[data-kt-tooltip-initialized]')
				.forEach((tooltipElement) => {
					const tooltip = KTTooltip.getInstance(tooltipElement as HTMLElement);

					if (
						tooltip &&
						tooltip.isOpen() &&
						tooltip.getTriggerOption() !== 'hover' &&
						!tooltip.isPermanent()
					) {
						const contentElement = tooltip.getContentElement();
						if (
							contentElement &&
							(contentElement === event.target ||
								contentElement.contains(event.target as HTMLElement))
						) {
							return;
						} else {
							tooltip.hide();
						}
					}
				});
		});
	}

	public static getInstance(element: HTMLElement): KTTooltip {
		if (!element) return null;

		if (KTData.has(element, 'tooltip')) {
			return KTData.get(element, 'tooltip') as KTTooltip;
		}

		if (element.getAttribute('data-kt-tooltip')) {
			return new KTTooltip(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTTooltipConfigInterface
	): KTTooltip {
		return this.getInstance(element) || new KTTooltip(element, config);
	}

	public static createInstances(): void {
		document.querySelectorAll('[data-kt-tooltip]').forEach((element) => {
			new KTTooltip(element as HTMLElement);
		});
	}

	public static init(): void {
		KTTooltip.createInstances();

		if (window.KT_TOOLTIP_INITIALIZED !== true) {
			KTTooltip.initHandlers();
			window.KT_TOOLTIP_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTTooltip = KTTooltip;
}
