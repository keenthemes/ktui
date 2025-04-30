/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

declare global {
	interface Window {
		KTGlobalComponentsConfig: object;
	}
}

import KTData from '../helpers/data';
import KTDom from '../helpers/dom';
import KTUtils from '../helpers/utils';
import { KTOptionType } from '../types';

export default class KTComponent {
	protected _dataOptionPrefix: string = 'kt-';
	protected _name: string;
	protected _defaultConfig: object;
	protected _config: object;
	protected _events: Map<string, Map<string, CallableFunction>>;
	protected _uid: string | null = null;
	protected _element: HTMLElement | null = null;

	protected _init(element: HTMLElement | null) {
		element = KTDom.getElement(element);

		if (!element) {
			return;
		}

		this._element = element;
		this._events = new Map();
		this._uid = KTUtils.geUID(this._name);

		this._element.setAttribute(`data-kt-${this._name}-initialized`, 'true');

		KTData.set(this._element, this._name, this);
	}

	protected _fireEvent(eventType: string, payload: object = null): void {
		this._events.get(eventType)?.forEach((callable) => {
			callable(payload);
		});
	}

	protected _dispatchEvent(eventType: string, payload: object = null): void {
		const event = new CustomEvent(eventType, {
			detail: { payload },
			bubbles: true,
			cancelable: true,
			composed: false,
		});

		if (!this._element) return;
		this._element.dispatchEvent(event);
	}

	protected _getOption(name: string): KTOptionType {
		const value = this._config[name as keyof object];
		const reponsiveValue = KTDom.getCssProp(
			this._element,
			`--kt-${this._name}-${KTUtils.camelReverseCase(name)}`
		);

		return reponsiveValue || value;
	}

	protected _getGlobalConfig(): object {
		if (
			window.KTGlobalComponentsConfig &&
			(window.KTGlobalComponentsConfig as object)[this._name as keyof object]
		) {
			return (window.KTGlobalComponentsConfig as object)[
				this._name as keyof object
			] as object;
		} else {
			return {};
		}
	}

	protected _buildConfig(config: object = {}): void {
		if (!this._element) return;

		this._config = {
			...this._defaultConfig,
			...this._getGlobalConfig(),
			...KTDom.getDataAttributes(
				this._element,
				this._dataOptionPrefix + this._name
			),
			...config,
		};
	}

	public dispose(): void {
		if (!this._element) return;

		this._element.removeAttribute(`data-kt-${this._name}-initialized`);
		KTData.remove(this._element, this._name);
	}

	public on(eventType: string, callback: CallableFunction): string {
		const eventId = KTUtils.geUID();

		if (!this._events.get(eventType)) {
			this._events.set(eventType, new Map());
		}

		this._events.get(eventType).set(eventId, callback);

		return eventId;
	}

	public off(eventType: string, eventId: string): void {
		this._events.get(eventType)?.delete(eventId);
	}

	public getOption(name: string): KTOptionType {
		return this._getOption(name as keyof object);
	}

	public getElement(): HTMLElement {
		if (!this._element) return null;
		return this._element;
	}
}
