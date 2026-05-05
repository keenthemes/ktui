/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTThemeSwitchInterface, KTThemeSwitchConfigInterface } from './types';
import { KTThemeSwitchModeType } from './types';

declare global {
	interface Window {
		KT_STICKY_INITIALIZED: boolean;
		KTThemeSwitch: typeof KTThemeSwitch;
	}
}

export class KTThemeSwitch
	extends KTComponent
	implements KTThemeSwitchInterface
{
	protected override _name: string = 'theme-switch';
	protected override _defaultConfig: KTThemeSwitchConfigInterface = {
		mode: 'light',
	};
	protected _mode: KTThemeSwitchModeType | null = null;
	protected _currentMode: KTThemeSwitchModeType | null = null;
	protected _themeSwitchToggleEventId: string = '';
	protected _themeSwitchSetEventId: string = '';

	constructor(
		element: HTMLElement | HTMLHtmlElement,
		config: KTThemeSwitchConfigInterface | null = null,
	) {
		super();

		if (KTData.has(element as HTMLElement | HTMLHtmlElement, this._name))
			return;

		this._init(element);
		this._buildConfig(config);
		this._setMode(
			(localStorage.getItem('kt-theme') ||
				this._getOption('mode')) as KTThemeSwitchModeType,
		);
		this._handlers();
	}

	protected _handlers(): void {
		if (!this._element) return;

		this._themeSwitchToggleEventId = KTEventHandler.on(
			document.body,
			'[data-kt-theme-switch-toggle]',
			'click',
			() => {
				this._toggle();
			},
		);

		this._themeSwitchSetEventId = KTEventHandler.on(
			document.body,
			'[data-kt-theme-switch-set]',
			'click',
			(event: Event, target: HTMLElement) => {
				event.preventDefault();
				const mode = target.getAttribute(
					'data-kt-theme-switch-set',
				) as KTThemeSwitchModeType;
				this._setMode(mode);
			},
		);
	}

	protected _toggle() {
		const mode = this._currentMode === 'light' ? 'dark' : 'light';

		this._setMode(mode);
	}

	protected _setMode(mode: KTThemeSwitchModeType): void {
		if (!this._element) return;
		const payload = { cancel: false };
		this._fireEvent('change', payload);
		this._dispatchEvent('change', payload);
		if (payload.cancel === true) {
			return;
		}

		let currentMode: KTThemeSwitchModeType = mode;
		if (mode === 'system') {
			currentMode = this._getSystemMode();
		}

		this._mode = mode;
		this._currentMode = currentMode;
		this._bindMode();
		this._updateState();
		localStorage.setItem('kt-theme', this._mode);
		this._element.setAttribute('data-kt-theme-switch-mode', mode);

		this._fireEvent('changed', {});
		this._dispatchEvent('changed', {});
	}

	protected _getMode(): KTThemeSwitchModeType {
		return (
			(localStorage.getItem('kt-theme') as KTThemeSwitchModeType) || this._mode
		);
	}

	protected _getSystemMode(): KTThemeSwitchModeType {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	}

	protected _bindMode(): void {
		if (!this._currentMode || !this._element) {
			return;
		}

		this._element.classList.remove('dark');
		this._element.classList.remove('light');
		this._element.removeAttribute(this._getOption('attribute') as string);
		this._element.classList.add(this._currentMode);
	}

	protected _updateState() {
		const elements = document.querySelectorAll<HTMLInputElement>(
			'input[type="checkbox"][data-kt-theme-switch-state]',
		);
		elements.forEach((element) => {
			if (element.getAttribute('data-kt-theme-switch-state') === this._mode) {
				element.checked = true;
			}
		});
	}

	public getMode(): KTThemeSwitchModeType {
		return this._getMode();
	}

	public setMode(mode: KTThemeSwitchModeType) {
		this._setMode(mode);
	}

	public override dispose(): void {
		if (this._themeSwitchToggleEventId) {
			KTEventHandler.off(
				document.body,
				'click',
				this._themeSwitchToggleEventId,
			);
			this._themeSwitchToggleEventId = '';
		}
		if (this._themeSwitchSetEventId) {
			KTEventHandler.off(document.body, 'click', this._themeSwitchSetEventId);
			this._themeSwitchSetEventId = '';
		}
		super.dispose();
	}

	public static getInstance(): KTThemeSwitch {
		const root = document.documentElement;

		if (KTData.has(root, 'theme-switch')) {
			return KTData.get(root, 'theme-switch') as KTThemeSwitch;
		}

		if (root) {
			return new KTThemeSwitch(root);
		}

		return null;
	}

	public static createInstances(): void {
		const root = document.documentElement;
		if (root) new KTThemeSwitch(root);
	}

	public static init(): void {
		KTThemeSwitch.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTThemeSwitch = KTThemeSwitch;
}
