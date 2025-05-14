/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import { KTSelectConfigInterface, KTSelectOption } from './config';
import { renderTemplateString } from './utils';

/**
 * Default HTML string templates for KTSelect. All UI structure is defined here.
 * Users can override any template by providing a matching key in the config.templates object.
 */
export const coreTemplateStrings = {
	dropdown: `<div data-kt-select-dropdown class="kt-select-dropdown hidden {{class}}" style="z-index: {{zindex}};">{{content}}</div>`,
	options: `<ul role="listbox" aria-label="{{label}}" class="kt-select-options-container {{class}}" data-kt-select-options-container="true">{{content}}</ul>`,
	error: `<li class="kt-select-error" role="alert">{{content}}</li>`,
	highlight: `<span class="kt-select-highlight highlighted {{class}}">{{text}}</span>`,
	wrapper: `<div data-kt-select-wrapper="true" class="kt-select-main {{class}}"></div>`,
	combobox: `
		<div class="kt-select-combobox {{class}}">
			<input class="kt-input kt-select-combobox-input" data-kt-select-search="true" data-kt-select-display="true" data-kt-select-value="true" type="text" placeholder="{{placeholder}}" role="searchbox" aria-label="{{label}}" {{disabled}} />
			<button type="button" data-kt-select-clear-button="true" class="kt-select-combobox-clear-btn" aria-label="Clear selection">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	`,
	display: `
		<div data-kt-select-display="true" class="kt-select-display {{class}}" tabindex="{{tabindex}}" role="button" data-selected="0" aria-haspopup="listbox" aria-expanded="false" aria-label="{{label}}" {{disabled}}>
			<div data-kt-select-value="true" class="kt-select-label">{{content}}</div>
		</div>
	`,
	placeholder: `<div class="kt-select-placeholder {{class}}">{{content}}</div>`,
	option: `<li data-kt-select-option="true" data-value="{{value}}" data-text="{{text}}" class="kt-select-option {{class}}" role="option" {{selected}} {{disabled}}>{{content}}</li>`,
	search: `<div class="kt-select-search {{class}}"><input type="text" data-kt-select-search="true" placeholder="{{searchPlaceholder}}" class="kt-input kt-select-search-input" role="searchbox" aria-label="{{searchPlaceholder}}"/></div>`,
	empty: `<li class="kt-select-no-result {{class}}" role="status">{{content}}</li>`,
	loading: `<li class="kt-select-loading {{class}}" role="status" aria-live="polite">{{content}}</li>`,
	tag: `<div data-kt-select-tag="true" class="kt-select-tag {{class}}">{{content}}</div>`,
	loadMore: `<li class="kt-select-load-more {{class}}" data-kt-select-load-more="true">{{content}}</li>`,
};

/**
 * Template interface for KTSelect component
 * Each method returns an HTML string or HTMLElement
 */
export interface KTSelectTemplateInterface {
	/**
	 * Renders the dropdown content container
	 */
	dropdown: (
		config: KTSelectConfigInterface & { zindex?: number; content?: string },
	) => HTMLElement;
	/**
	 * Renders the options container
	 */
	options: (
		config: KTSelectConfigInterface & { options?: string },
	) => HTMLElement;
	/**
	 * Renders the load more button for pagination
	 */
	loadMore: (config: KTSelectConfigInterface) => HTMLElement;
	/**
	 * Renders an error message in the dropdown
	 */
	error: (config: KTSelectConfigInterface & { errorMessage: string }) => string;

	highlight: (config: KTSelectConfigInterface, text: string) => HTMLElement;

	// Main components
	wrapper: (config: KTSelectConfigInterface) => HTMLElement;
	display: (config: KTSelectConfigInterface, selectedOptions: string[]) => HTMLElement;

	// Option rendering
	option: (
		option: KTSelectOption | HTMLOptionElement,
		config: KTSelectConfigInterface,
	) => HTMLElement;

	// Search and empty states
	search: (config: KTSelectConfigInterface) => HTMLElement;
	empty: (config: KTSelectConfigInterface) => HTMLElement;
	loading: (
		config: KTSelectConfigInterface,
		loadingMessage: string,
	) => HTMLElement;

	// Multi-select
	tag: (option: KTSelectOption, config: KTSelectConfigInterface) => HTMLElement;
	selectedDisplay: (
		selectedOptions: KTSelectOption[],
		config: KTSelectConfigInterface,
	) => string;

	placeholder: (config: KTSelectConfigInterface) => HTMLElement;
}

/**
 * Default templates for KTSelect component
 */
function stringToElement(html: string): HTMLElement {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstElementChild as HTMLElement;
}

/**
 * User-supplied template overrides. Use setTemplateStrings() to add or update.
 */
let userTemplateStrings: Partial<typeof coreTemplateStrings> = {};

/**
 * Register or update user template overrides.
 * @param templates Partial template object to merge with defaults.
 */
export function setTemplateStrings(
	templates: Partial<typeof coreTemplateStrings>,
): void {
	userTemplateStrings = { ...userTemplateStrings, ...templates };
}

/**
 * Get the complete template set, merging defaults, user overrides, and config templates.
 * @param config Optional config object with a "templates" property.
 */
export function getTemplateStrings(
	config?: KTSelectConfigInterface,
): typeof coreTemplateStrings {
	const templates =
		config && typeof config === 'object' && 'templates' in config
			? (config as any).templates
			: undefined;

	if (templates) {
		return { ...coreTemplateStrings, ...userTemplateStrings, ...templates };
	}

	return { ...coreTemplateStrings, ...userTemplateStrings };
}

/**
 * Default templates for KTSelect component
 */
export const defaultTemplates: KTSelectTemplateInterface = {
	/**
	 * Renders a highlighted text
	 */
	highlight: (config: KTSelectConfigInterface, text: string) => {
		const template = getTemplateStrings(config).highlight;
		const html = template.replace('{{text}}', text).replace('{{class}}', config.highlightClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the dropdown content
	 */
	dropdown: (
		config: KTSelectConfigInterface & { zindex?: number; content?: string },
	) => {
		let template = getTemplateStrings(config).dropdown;
		let content = config.content || '';
		if (config.dropdownTemplate) {
			content = renderTemplateString(config.dropdownTemplate, {
				zindex: config.zindex ? String(config.zindex) : '',
				content: config.content || '',
				class: config.dropdownClass || '',
			});
		}
		const html = template
			.replace('{{zindex}}', config.zindex ? String(config.zindex) : '')
			.replace('{{content}}', content)
			.replace('{{class}}', config.dropdownClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the options container for the dropdown
	 */
	options: (config: KTSelectConfigInterface & { options?: string }) => {
		const template = getTemplateStrings(config).options;
		const html = template
			.replace('{{label}}', config.label || 'Options')
			.replace('{{height}}', config.height ? String(config.height) : '250')
			.replace('{{options}}', config.options || '')
			.replace('{{class}}', config.optionsClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the load more button for pagination
	 */
	loadMore: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config).loadMore.replace(
			'{{loadMoreText}}',
			config.loadMoreText || 'Load more...',
		);
		return stringToElement(html);
	},
	/**
	 * Renders an error message in the dropdown
	 */
	error: (
		config: KTSelectConfigInterface & { errorMessage: string },
	): string => {
		const template = getTemplateStrings(config).error;
		return template
			.replace('{{errorMessage}}', config.errorMessage || 'An error occurred')
			.replace('{{class}}', config.errorClass || '');
	},
	/**
	 * Renders the main container for the select component
	 */
	wrapper: (config: KTSelectConfigInterface): HTMLElement => {
		const html = getTemplateStrings(config).wrapper
			.replace('{{class}}', config.wrapperClass || '');
		const element = stringToElement(html);
		element.setAttribute('data-kt-select-combobox', config.combobox ? 'true' : 'false');
		element.setAttribute('data-kt-select-tags', config.tags ? 'true' : 'false');
		return element;
	},

	/**
	 * Renders the display element (trigger) for the select
	 */
	display: (config: KTSelectConfigInterface, selectedOptions: string[]): HTMLElement => {
		if (config.combobox) {
			let html = getTemplateStrings(config)
				.combobox.replace(/{{placeholder}}/g, config.placeholder || 'Select...')
				.replace(
					/{{label}}/g,
					config.label || config.placeholder || 'Select...',
				)
				.replace('{{disabled}}', config.disabled ? 'disabled' : '')
				.replace('{{class}}', config.displayClass || '');
			return stringToElement(html);
		}

		let content = config.label || config.placeholder || 'Select...';
		if (config.displayTemplate) {
			content = renderTemplateString(config.displayTemplate, {
				selectedCount: selectedOptions.length || 0,
				selectedTexts: selectedOptions.map((option) => option).join(', ') || '',
			});
		}

		let html = getTemplateStrings(config).display
			.replace('{{tabindex}}', config.disabled ? '-1' : '0')
			.replace('{{label}}', config.label || config.placeholder || 'Select...')
			.replace('{{disabled}}', config.disabled ? 'aria-disabled="true"' : '')
			.replace('{{placeholder}}', config.placeholder || 'Select...')
			.replace('{{class}}', config.displayClass || '')
			.replace('{{content}}', content);
		return stringToElement(html);
	},

	/**
	 * Renders a single option
	 */
	option: (
		option: KTSelectOption | HTMLOptionElement,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		const isHtmlOption = option instanceof HTMLOptionElement;

		const value = isHtmlOption ? option.value : (option as KTSelectOption).id;
		const text = isHtmlOption ? option.text : (option as KTSelectOption).title;
		const disabled = isHtmlOption
			? option.disabled
			: (option as any).disabled === true;
		const selected = isHtmlOption
			? option.selected
			: !!(option as KTSelectOption).selected;

		let content = text;
		if (config.optionTemplate) {
			// Use the user template to render the content, but only for {{content}}
			content = renderTemplateString(config.optionTemplate, {
				value,
				text,
				class: config.optionClass || '',
				selected: selected ? 'aria-selected="true"' : 'aria-selected="false"',
				disabled: disabled ? 'aria-disabled="true"' : '',
				content: text,
			});
		}

		const html = getTemplateStrings(config).option
			.replace('{{value}}', value)
			.replace('{{text}}', text)
			.replace('{{selected}}', selected ? 'aria-selected="true"' : 'aria-selected="false"')
			.replace('{{disabled}}', disabled ? 'aria-disabled="true"' : '')
			.replace('{{content}}', content)
			.replace('{{class}}', config.optionClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the search input
	 */
	search: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config)
			.search.replace(
				'{{searchPlaceholder}}',
				config.searchPlaceholder || 'Search...',
			)
			.replace('{{class}}', config.searchClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the no results message
	 */
	empty: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config)
			.empty.replace(
				'{{searchNotFoundText}}',
				config.searchNotFoundText || 'No results found',
			)
			.replace('{{class}}', config.emptyClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the loading state
	 */
	loading: (
		config: KTSelectConfigInterface,
		loadingMessage: string,
	): HTMLElement => {
		let html = getTemplateStrings(config)
			.loading.replace(
				'{{loadingMessage}}',
				loadingMessage || 'Loading options...',
			)
			.replace('{{class}}', config.loadingClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders a tag for multi-select
	 */
	tag: (
		option: KTSelectOption,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		const escapeHTML = (str: string) => {
			return str.replace(/[&<>"']/g, (match) => {
				const escapeMap: Record<string, string> = {
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
				};
				return escapeMap[match];
			});
		};

		const safeTitle = escapeHTML(option.title);
		let template = getTemplateStrings(config).tag;
		let content = option.title;
		if (config.tagTemplate) {
			content = renderTemplateString(config.tagTemplate, {
				title: option.title,
				id: option.id,
				safeTitle,
				class: config.tagClass || '',
				content: option.title,
				text: option.title,
			});
		}
		const html = template
			.replace('{{title}}', option.title)
			.replace('{{id}}', option.id)
			.replace('{{safeTitle}}', safeTitle)
			.replace('{{content}}', content)
			.replace('{{class}}', config.tagClass || '');
		return stringToElement(html);
	},

	/**
	 * Formats the display of selected values
	 */
	selectedDisplay: (
		selectedOptions: KTSelectOption[],
		config: KTSelectConfigInterface,
	): string => {
		if (!selectedOptions || selectedOptions.length === 0) {
			return config.placeholder || 'Select...';
		}

		if (config.multiple) {
			if (
				config.renderSelected &&
				typeof config.renderSelected === 'function'
			) {
				return config.renderSelected(selectedOptions);
			}

			if (config.showSelectedCount) {
				const count = selectedOptions.length;
				return `${count} ${count === 1 ? 'item' : 'items'} selected`;
			}

			return selectedOptions.map((option) => option.title).join(', ');
		} else {
			return selectedOptions[0].title;
		}
	},

	/**
	 * Renders the placeholder for the select
	 */
	placeholder: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config).placeholder.replace('{{class}}', config.placeholderClass || '');
		let content = config.placeholder || 'Select...';
		if (config.placeholderTemplate) {
			content = renderTemplateString(config.placeholderTemplate, {
				placeholder: config.placeholder || 'Select...',
				class: config.placeholderClass || '',
			});
		}
		html = html.replace('{{content}}', content);
		return stringToElement(html);
	},
};
