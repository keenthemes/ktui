/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTAccordionInterface, KTAccordionConfigInterface } from './types';

declare global {
	interface Window {
		KT_ACCORDION_INITIALIZED: boolean;
		KTAccordion: typeof KTAccordion;
	}
}

export class KTAccordion extends KTComponent implements KTAccordionInterface {
	protected override _name: string = 'accordion';
	protected override _defaultConfig: KTAccordionConfigInterface = {
		hiddenClass: 'hidden',
		activeClass: 'active',
		expandAll: false,
	};
	protected override _config: KTAccordionConfigInterface = this._defaultConfig;
	protected _accordionElements: NodeListOf<HTMLElement>;

	constructor(element: HTMLElement, config?: KTAccordionConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);
		this._handlers();
	}

	protected _handlers(): void {
		KTEventHandler.on(
			this._element,
			'[data-kt-accordion-toggle]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.preventDefault();
				const accordionElement = target.closest(
					'[data-kt-accordion-item]',
				) as HTMLElement;

				if (accordionElement) this._toggle(accordionElement);
			},
		);
	}

	protected _toggle(accordionElement: HTMLElement): void {
		const payload = { cancel: false };
		this._fireEvent('toggle', payload);
		this._dispatchEvent('toggle', payload);
		if (payload.cancel === true) {
			return;
		}

		if (accordionElement.classList.contains('active')) {
			this._hide(accordionElement);
		} else {
			this._show(accordionElement);
		}
	}

	protected _show(accordionElement: HTMLElement): void {
		if (
			accordionElement.hasAttribute('animating') ||
			accordionElement.classList.contains(
				this._getOption('activeClass') as string,
			)
		)
			return;

		const toggleElement = KTDom.child(
			accordionElement,
			'[data-kt-accordion-toggle]',
		);
		if (!toggleElement) return;

		const contentElement = KTDom.getElement(
			`#${toggleElement.getAttribute('aria-controls')}`,
		);
		if (!contentElement) return;

		const payload = { cancel: false };
		this._fireEvent('show', payload);
		this._dispatchEvent('show', payload);
		if (payload.cancel === true) {
			return;
		}

		if ((this._getOption('expandAll') as boolean) === false) {
			this._hideSiblings(accordionElement);
		}

		accordionElement.setAttribute('aria-expanded', 'true');
		accordionElement.classList.add(this._getOption('activeClass') as string);

		accordionElement.setAttribute('animating', 'true');
		contentElement.classList.remove(this._getOption('hiddenClass') as string);
		contentElement.style.height = `0px`;
		KTDom.reflow(contentElement);
		contentElement.style.height = `${contentElement.scrollHeight}px`;

		KTDom.transitionEnd(contentElement, () => {
			accordionElement.removeAttribute('animating');
			contentElement.style.height = '';

			this._fireEvent('shown');
			this._dispatchEvent('shown');
		});
	}

	protected _hide(accordionElement: HTMLElement): void {
		if (
			accordionElement.hasAttribute('animating') ||
			!accordionElement.classList.contains(
				this._getOption('activeClass') as string,
			)
		)
			return;

		const toggleElement = KTDom.child(
			accordionElement,
			'[data-kt-accordion-toggle]',
		);
		if (!toggleElement) return;

		const contentElement = KTDom.getElement(
			`#${toggleElement.getAttribute('aria-controls')}`,
		);
		if (!contentElement) return;

		const payload = { cancel: false };
		this._fireEvent('hide', payload);
		this._dispatchEvent('hide', payload);
		if (payload.cancel === true) {
			return;
		}

		accordionElement.setAttribute('aria-expanded', 'false');

		contentElement.style.height = `${contentElement.scrollHeight}px`;
		KTDom.reflow(contentElement);
		contentElement.style.height = '0px';
		accordionElement.setAttribute('animating', 'true');

		KTDom.transitionEnd(contentElement, () => {
			accordionElement.removeAttribute('animating');
			accordionElement.classList.remove(
				this._getOption('activeClass') as string,
			);
			contentElement.classList.add(this._getOption('hiddenClass') as string);

			this._fireEvent('hidden');
			this._dispatchEvent('hidden');
		});
	}

	protected _hideSiblings(accordionElement: HTMLElement): void {
		const siblings = KTDom.siblings(accordionElement);

		siblings?.forEach((sibling) => {
			this._hide(sibling as HTMLElement);
		});
	}

	public show(accordionElement: HTMLElement): void {
		this._show(accordionElement);
	}

	public hide(accordionElement: HTMLElement): void {
		this._hide(accordionElement);
	}

	public toggle(accordionElement: HTMLElement): void {
		this._toggle(accordionElement);
	}

	public static getInstance(element: HTMLElement): KTAccordion {
		if (!element) return null;

		if (KTData.has(element, 'accordion')) {
			return KTData.get(element, 'accordion') as KTAccordion;
		}

		if (element.getAttribute('data-kt-accordion-initialized') === 'true') {
			return new KTAccordion(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTAccordionConfigInterface,
	): KTAccordion {
		return this.getInstance(element) || new KTAccordion(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-accordion]');

		elements.forEach((element) => {
			new KTAccordion(element as HTMLElement);
		});
	}

	public static init(): void {
		KTAccordion.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTAccordion = KTAccordion;
}
