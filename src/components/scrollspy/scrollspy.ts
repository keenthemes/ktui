/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTScrollspyInterface, KTScrollspyConfigInterface } from './types';

declare global {
	interface Window {
		KT_SCROLLSPY_INITIALIZED: boolean;
		KTScrollspy: typeof KTScrollspy;
	}
}

export class KTScrollspy extends KTComponent implements KTScrollspyInterface {
	protected override _name: string = 'scrollspy';
	protected override _defaultConfig: KTScrollspyConfigInterface = {
		target: 'body',
		offset: 0,
		smooth: true,
	};
	protected override _config: KTScrollspyConfigInterface = this._defaultConfig;
	protected _targetElement: HTMLElement | Document | null = null;
	protected _anchorElements: NodeListOf<HTMLElement> | null = null;

	constructor(element: HTMLElement, config?: KTScrollspyConfigInterface) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		if (!this._element) return;

		const targetElement =
			this._getTarget() === 'body'
				? document
				: KTDom.getElement(this._getTarget());
		if (!targetElement) return;

		this._targetElement = targetElement;

		this._anchorElements = this._element.querySelectorAll(
			'[data-kt-scrollspy-anchor]'
		);

		if (!this._anchorElements) return;

		this._handlers();
		this._update();
	}

	private _getTarget(): string {
		return (
			(this._element.getAttribute('data-kt-scrollspy-target') as string) ||
			(this._getOption('target') as string)
		);
	}

	protected _handlers(): void {
		if (!this._anchorElements) return;

		this._targetElement.addEventListener('scroll', () => {
			this._anchorElements.forEach((anchorElement) => {
				this._updateAnchor(anchorElement);
			});
		});

		KTEventHandler.on(
			this._element,
			'[data-kt-scrollspy-anchor]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.preventDefault();
				this._scrollTo(target);
			}
		);
	}

	protected _scrollTo(anchorElement: HTMLElement): void {
		if (!anchorElement) return;

		const sectionElement = KTDom.getElement(anchorElement.getAttribute('href'));
		if (!sectionElement) return;

		const targetElement =
			this._targetElement === document ? window : this._targetElement;
		if (!targetElement) return;

		let offset = parseInt(this._getOption('offset') as string);
		if (anchorElement.getAttribute('data-kt-scrollspy-anchor-offset')) {
			offset = parseInt(
				anchorElement.getAttribute('data-kt-scrollspy-anchor-offset') as string
			);
		}

		const scrollTop = sectionElement.offsetTop - offset;

		if ('scrollTo' in targetElement) {
			targetElement.scrollTo({
				top: scrollTop,
				left: 0,
				behavior: this._getOption('smooth') ? 'smooth' : 'instant',
			});
		}
	}

	protected _updateAnchor(anchorElement: HTMLElement): void {
		const sectionElement = KTDom.getElement(anchorElement.getAttribute('href'));
		if (!sectionElement) return;

		if (!KTDom.isVisible(anchorElement)) return;

		if (!this._anchorElements) return;

		const scrollPosition =
			this._targetElement === document
				? document.documentElement.scrollTop || document.body.scrollTop
				: (this._targetElement as HTMLElement).scrollTop;

		let offset = parseInt(this._getOption('offset') as string);
		if (anchorElement.getAttribute('data-kt-scrollspy-anchor-offset')) {
			offset = parseInt(
				anchorElement.getAttribute('data-kt-scrollspy-anchor-offset') as string
			);
		}

		const offsetTop = sectionElement.offsetTop;

		if (scrollPosition + offset >= offsetTop) {
			this._anchorElements.forEach((anchorElement) => {
				anchorElement.classList.remove('active');
			});

			const payload = { element: anchorElement };
			this._fireEvent('activate', payload);
			this._dispatchEvent('activate', payload);

			anchorElement.classList.add('active');

			const parentAnchorElements = KTDom.parents(
				anchorElement,
				'[data-kt-scrollspy-group]'
			);
			if (parentAnchorElements) {
				parentAnchorElements.forEach((parentAnchorElement) => {
					parentAnchorElement
						.querySelector('[data-kt-scrollspy-anchor]')
						?.classList.add('active');
				});
			}
		}
	}

	protected _update() {
		if (!this._anchorElements) return;

		this._anchorElements.forEach((anchorElement) => {
			this._updateAnchor(anchorElement);
		});
	}

	protected _isActive(anchorElement: HTMLElement): boolean {
		return anchorElement.classList.contains('active');
	}

	public updateAnchor(anchorElement: HTMLElement): void {
		this._updateAnchor(anchorElement);
	}

	public isActive(anchorElement: HTMLElement): boolean {
		return this._isActive(anchorElement);
	}

	public update(): void {
		this.update();
	}

	public scrollTo(anchorElement: HTMLElement): void {
		this._scrollTo(anchorElement);
	}

	public static getInstance(element: HTMLElement): KTScrollspy {
		if (!element) return null;

		if (KTData.has(element, 'scrollspy')) {
			return KTData.get(element, 'scrollspy') as KTScrollspy;
		}

		if (element.getAttribute('data-kt-scrollspy')) {
			return new KTScrollspy(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTScrollspyConfigInterface
	): KTScrollspy {
		return this.getInstance(element) || new KTScrollspy(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-scrollspy]');

		elements.forEach((element) => {
			new KTScrollspy(element as HTMLElement);
		});
	}

	public static init(): void {
		KTScrollspy.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTScrollspy = KTScrollspy;
}
