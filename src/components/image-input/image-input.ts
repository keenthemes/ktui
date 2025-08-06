/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import KTData from '../../helpers/data';
import KTEventHandler from '../../helpers/event-handler';
import KTComponent from '../component';
import { KTImageInputInterface, KTImageInputConfigInterface } from './types';

enum ImageInputMode {
	NEW = 'new',
	SAVED = 'saved',
	PLACEHOLDER = 'placeholder'
}

declare global {
	interface Window {
		KT_IMAGE_INPUT_INITIALIZED: boolean;
		KTImageInput: typeof KTImageInput;
	}
}

export class KTImageInput extends KTComponent implements KTImageInputInterface {
	protected override _name: string = 'image-input';
	protected override _defaultConfig: KTImageInputConfigInterface = {
		hiddenClass: 'hidden',
	};
	protected _inputElement: HTMLInputElement;
	protected _hiddenElement: HTMLInputElement;
	protected _removeElement: HTMLElement;
	protected _previewElement: HTMLElement;
	protected _previewUrl: string = '';
	protected _lastMode: ImageInputMode;

	constructor(
		element: HTMLElement,
		config: KTImageInputConfigInterface = null,
	) {
		super();

		if (KTData.has(element as HTMLElement, this._name)) return;

		this._init(element);
		this._buildConfig(config);

		this._inputElement = this._element.querySelector('input[type="file"]');
		this._hiddenElement = this._element.querySelector('input[type="hidden"]');
		this._removeElement = this._element.querySelector(
			'[data-kt-image-input-remove]',
		);
		this._previewElement = this._element.querySelector(
			'[data-kt-image-input-preview]',
		);

		this._update();
		this._handlers();
	}

	protected _handlers(): void {
		KTEventHandler.on(
			this._element,
			'[data-kt-image-input-placeholder]',
			'click',
			(event: Event) => {
				event.preventDefault();

				this._inputElement.click();
			},
		);

		this._inputElement.addEventListener('change', () => {
			this._change();
		});

		this._removeElement.addEventListener('click', () => {
			this._remove();
		});
	}

	protected _change(): void {
		const payload = { cancel: false };
		this._fireEvent('change', payload);
		this._dispatchEvent('change', payload);
		if (payload.cancel === true) {
			return;
		}

		const reader = new FileReader();

		reader.onload = () => {
			this._previewElement.style.backgroundImage = `url(${reader.result})`;
		};

		reader.readAsDataURL(this._inputElement.files[0]);
		// Removed: this._inputElement.value = ''; // This was preventing form submission
		this._hiddenElement.value = '';
		this._lastMode = ImageInputMode.NEW;

		this._element.classList.add('changed');
		this._removeElement.classList.remove('hidden');
		this._element.classList.remove('empty');

		this._fireEvent('changed');
		this._dispatchEvent('changed');
	}

	protected _remove(): void {
		const payload = { cancel: false };
		this._fireEvent('remove', payload);
		this._dispatchEvent('remove', payload);
		if (payload.cancel === true) {
			return;
		}

		this._element.classList.remove('empty');
		this._element.classList.remove('changed');

		this._handleStateTransition();

		this._fireEvent('remove');
		this._dispatchEvent('remove');
	}

	protected _handleStateTransition(): void {
		if (this._lastMode == ImageInputMode.NEW) {
			this._handleNewModeTransition();
		} else if (this._lastMode == ImageInputMode.SAVED) {
			this._handleSavedModeTransition();
		} else if (this._lastMode == ImageInputMode.PLACEHOLDER) {
			this._handlePlaceholderModeTransition();
		}
	}

	protected _handleNewModeTransition(): void {
		if (this._previewUrl == '')
			this._removeElement.classList.add(
				this._getOption('hiddenClass') as string,
			);

		if (this._previewUrl) {
			this._previewElement.style.backgroundImage = `url(${this._previewUrl})`;
		} else {
			this._previewElement.style.backgroundImage = 'none';
			this._element.classList.add('empty');
		}

		this._inputElement.value = '';
		this._hiddenElement.value = '';

		this._lastMode = ImageInputMode.SAVED;
	}

	protected _handleSavedModeTransition(): void {
		if (this._previewUrl == '')
			this._removeElement.classList.add(
				this._getOption('hiddenClass') as string,
			);

		this._previewElement.style.backgroundImage = 'none';
		this._element.classList.add('empty');

		this._hiddenElement.value = '1';
		this._inputElement.value = '';

		this._lastMode = ImageInputMode.PLACEHOLDER;
	}

	protected _handlePlaceholderModeTransition(): void {
		if (this._previewUrl == '')
			this._removeElement.classList.add(
				this._getOption('hiddenClass') as string,
			);

		if (this._previewUrl) {
			this._previewElement.style.backgroundImage = `url(${this._previewUrl})`;
		} else {
			this._element.classList.add('empty');
		}

		this._inputElement.value = '';
		this._hiddenElement.value = '';

		this._lastMode = ImageInputMode.SAVED;
	}

	protected _update() {
		if (this._previewElement.style.backgroundImage) {
			this._setPreviewUrl(this._previewElement.style.backgroundImage);
			this._removeElement.classList.remove(
				this._getOption('hiddenClass') as string,
			);
			this._lastMode = ImageInputMode.SAVED;
		} else {
			this._removeElement.classList.add(
				this._getOption('hiddenClass') as string,
			);
			this._element.classList.add('empty');
			this._lastMode = ImageInputMode.PLACEHOLDER;
		}
	}

	protected _getPreviewUrl(): string {
		return this._previewUrl;
	}

	protected _setPreviewUrl(url: string): void {
		this._previewUrl = url.replace(/(url\(|\)|")/g, '');
	}

	public isEmpty(): boolean {
		return this._inputElement.value.length === 0;
	}

	public isChanged(): boolean {
		return this._inputElement.value.length > 0;
	}

	public remove(): void {
		this._remove();
	}

	public update(): void {
		this._update();
	}

	public setPreviewUrl(url: string): void {
		this._setPreviewUrl(url);
	}

	public getPreviewUrl(): string {
		return this._getPreviewUrl();
	}

	public static getInstance(element: HTMLElement): KTImageInput {
		if (!element) return null;

		if (KTData.has(element, 'image-input')) {
			return KTData.get(element, 'image-input') as KTImageInput;
		}

		if (element.getAttribute('data-kt-image-input')) {
			return new KTImageInput(element);
		}

		return null;
	}

	public static getOrCreateInstance(
		element: HTMLElement,
		config?: KTImageInputConfigInterface,
	): KTImageInput {
		return this.getInstance(element) || new KTImageInput(element, config);
	}

	public static createInstances(): void {
		const elements = document.querySelectorAll('[data-kt-image-input]');

		elements.forEach((element) => {
			new KTImageInput(element as HTMLElement);
		});
	}

	public static init(): void {
		KTImageInput.createInstances();
	}
}

if (typeof window !== 'undefined') {
	window.KTImageInput = KTImageInput;
}
