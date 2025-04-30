/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import KTData from '../../helpers/data';
import KTDom from '../../helpers/dom';
import KTUtils from '../../helpers/utils';
import KTComponent from '../component';
import { KTReparentInterface, KTReparentConfigInterface } from './types';

declare global {
	interface Window {
		KT_REPARENT_INITIALIZED: boolean;
		KTReparent: typeof KTReparent;
	}
}

export class KTReparent extends KTComponent implements KTReparentInterface {
	protected override _name: string = 'reparent';
	protected override _defaultConfig: KTReparentConfigInterface = {
		mode: '',
		target: '',
	};

	constructor(
		element: HTMLElement,
		config: KTReparentConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);
		this._update();
	}

	protected _update(): void {
		if (!this._element) return;
		const target = this._getOption('target') as string;
		const targetEl = KTDom.getElement(target);
		const mode = this._getOption('mode');

		if (targetEl && this._element.parentNode !== targetEl) {
			if (mode === 'prepend') {
				targetEl.prepend(this._element);
			} else if (mode === 'append') {
				targetEl.append(this._element);
			}
		}
	}

	public update(): void {
		this._update();
	}

	public static handleResize(): void {
		window.addEventListener('resize', () => {
			let timer;

			KTUtils.throttle(
				timer,
				() => {
					document
						.querySelectorAll('[data-kt-reparent-initialized]')
						.forEach((element) => {
							const reparent = KTReparent.getInstance(element as HTMLElement);
							console.log('reparent update');
							reparent?.update();
						});
				},
				200,
			);
		});
	}

	public static getInstance(element: HTMLElement): KTReparent {
		return KTData.get(element, 'reparent') as KTReparent;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTReparentConfigInterface,
	): KTReparent {
		return this.getInstance(element) || new KTReparent(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-reparent]');

		elements.forEach((element) => {
			new KTReparent(element as HTMLElement);
		});
	}

	public static init(): void {
		KTReparent.createInstances();

		if (window.KT_REPARENT_INITIALIZED !== true) {
			KTReparent.handleResize();
			window.KT_REPARENT_INITIALIZED = true;
		}
	}
}

if (typeof window !== 'undefined') {
	window.KTReparent = KTReparent;
}
