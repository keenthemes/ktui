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
	options: `<ul role="listbox" aria-label="{{label}}" class="kt-select-options {{class}}" data-kt-select-options="true">{{content}}</ul>`,
	error: `<li class="kt-select-error" role="alert">{{content}}</li>`,
	highlight: `<span data-kt-select-highlight class="kt-select-highlight highlighted {{class}}">{{text}}</span>`,
	wrapper: `<div data-kt-select-wrapper class="kt-select-wrapper {{class}}"></div>`,
	combobox: `
		<div data-kt-select-combobox data-kt-select-display class="kt-select-combobox {{class}}">
			<div data-kt-select-combobox-values="true" class="kt-select-combobox-values"></div>
			<input class="kt-input kt-select-combobox-input" data-kt-select-search="true" type="text" placeholder="{{placeholder}}" role="searchbox" aria-label="{{label}}" {{disabled}} />
			<button type="button" data-kt-select-clear-button="true" class="kt-select-combobox-clear-btn" aria-label="Clear selection">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	`,
	display: `
		<div data-kt-select-display class="kt-select-display {{class}}" tabindex="{{tabindex}}" role="button" data-selected="0" aria-haspopup="listbox" aria-expanded="false" aria-label="{{label}}" {{disabled}}>
			<div data-kt-select-value="true" class="kt-select-label">{{content}}</div>
		</div>
	`,
	placeholder: `<div data-kt-select-placeholder class="kt-select-placeholder {{class}}">{{content}}</div>`,
	option: `<li data-kt-select-option data-value="{{value}}" data-text="{{text}}" class="kt-select-option {{class}}" role="option" {{selected}} {{disabled}}>{{content}}</li>`,
	search: `<div data-kt-select-search class="kt-select-search {{class}}"><input type="text" data-kt-select-search="true" placeholder="{{searchPlaceholder}}" class="kt-input kt-select-search-input" role="searchbox" aria-label="{{searchPlaceholder}}"/></div>`,
	empty: `<li data-kt-select-empty class="kt-select-no-result {{class}}" role="status">{{content}}</li>`,
	loading: `<li class="kt-select-loading {{class}}" role="status" aria-live="polite">{{content}}</li>`,
	tag: `<div data-kt-select-tag="true" class="kt-select-tag {{class}}">
			{{content}}
		</div>`,
	loadMore: `<li class="kt-select-load-more {{class}}" data-kt-select-load-more="true">{{content}}</li>`,
	tagRemoveButton: `<button type="button" data-kt-select-remove-button class="kt-select-tag-remove" aria-label="Remove tag" tabindex="0"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg></button>`,
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
	display: (config: KTSelectConfigInterface) => HTMLElement;

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
	tag: (option: HTMLOptionElement, config: KTSelectConfigInterface) => HTMLElement;

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
	display: (config: KTSelectConfigInterface): HTMLElement => {
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
		let optionData: Record<string, any>;

		if (isHtmlOption) {
			// If it's a plain HTMLOptionElement, construct data similarly to how KTSelectOption would
			// This branch might be less common if KTSelectOption instances are always used for rendering.
			const el = option as HTMLOptionElement;
			const textContent = el.textContent || '';
			optionData = {
				value: el.value,
				text: textContent,
				selected: el.selected,
				disabled: el.disabled, // This captures original disabled state
				content: textContent, // Default content to text
				// Attempt to get custom config for this specific option value if available
				...(config.optionsConfig?.[el.value] || {}),
			};
		} else {
			// If it's a KTSelectOption class instance (from './option')
			// which should have the getOptionDataForTemplate method.
			optionData = (option as import('./option').KTSelectOption).getOptionDataForTemplate();
		}

		let content = optionData.text; // Default content to option's text

		if (config.optionTemplate) {
			// Use the user-provided template string, rendering with the full optionData.
			// renderTemplateString will replace {{key}} with values from optionData.
			content = renderTemplateString(config.optionTemplate, optionData);
		} else {
			// If no custom template, the content might be just the text or based on other data.
			// For basic default rendering, {{content}} in coreTemplateStrings.option will use this.
			// If the optionData contains an explicit 'content' field from data-kt-select-option,
			// it would have been part of optionData and could be used here if desired.
			// For now, let's stick to `optionData.text` as the primary source for default `content`
			// if no `config.optionTemplate` is given. The `coreTemplateStrings.option` uses `{{content}}`.
			content = optionData.content || optionData.text; // Prefer explicit content, fallback to text
		}

		// Use the core option template string as the base structure.
		const baseTemplate = getTemplateStrings(config).option;

		const optionClasses = [config.optionClass || ''];
		if (optionData.disabled) {
			optionClasses.push('disabled');
		}

		// Populate the base template. The crucial part is that `{{content}}` here
		// will be replaced by the `content` generated above (either from custom template or default text).
		const html = renderTemplateString(baseTemplate, {
			...optionData, // Pass all data for {{value}}, {{text}}, {{selected}}, {{disabled}}, etc.
			class: optionClasses.join(' ').trim(), // Add general option class
			selected: optionData.selected ? 'aria-selected="true"' : 'aria-selected="false"',
			disabled: optionData.disabled ? 'aria-disabled="true"' : '', // This is the potentially custom-rendered content
			content: content,
		});

		const element = stringToElement(html);
		// Ensure data-text attribute is set to the original, clean text for searching/filtering
		element.setAttribute('data-text', optionData.text || '');
		return element;
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
		option: HTMLOptionElement,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		let template = getTemplateStrings(config).tag;
		let content = option.title;
		if (config.tagTemplate) {
			let tagTemplate = config.tagTemplate;

			const text = option.getAttribute('data-text');
			const value = option.getAttribute('data-value');

			// Replace all {{varname}} in option.innerHTML with values from _config
			Object.entries((config.optionsConfig as any)[value] || {}).forEach(([key, value]) => {
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					tagTemplate = tagTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
				}
			});

			content = renderTemplateString(tagTemplate, {
				title: option.title,
				id: option.id,
				class: config.tagClass || '',
				content: option.innerHTML,
				text: option.innerText,
			});
		}

		content += getTemplateStrings(config).tagRemoveButton;

		const html = template
			.replace('{{title}}', option.title)
			.replace('{{id}}', option.id)
			.replace('{{content}}', content)
			.replace('{{class}}', config.tagClass || '');
		return stringToElement(html);
	},

	/**
	 * Renders the placeholder for the select
	 */
	placeholder: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config)
			.placeholder.replace('{{class}}', config.placeholderClass || '');

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
