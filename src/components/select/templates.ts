/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: 1.0.0
 */
import { KTSelectConfigInterface, KTSelectOption } from './config';
import { SelectMode } from './types';

/**
 * Default HTML string templates for KTSelect. All UI structure is defined here.
 * Users can override any template by providing a matching key in the config.templates object.
 */
const defaultTemplateStrings = {
	dropdownContent: `<div data-kt-select-dropdown-content class="kt-select-dropdown hidden" style="z-index: {{zindex}};">{{content}}</div>`,
	optionsContainer: `<ul role="listbox" aria-label="{{label}}" data-kt-select-options-container style="max-height: {{height}}px; overflow-y: auto;">{{options}}</ul>`,
	emptyOption: `<option value="">{{placeholder}}</option>`,
	errorOption: `<option value="" disabled selected>{{errorMessage}}</option>`, // Template for error <option>

	loadMore: `<li class="py-2 px-4 text-center text-gray-600 cursor-pointer hover:bg-gray-100" data-kt-select-load-more>{{loadMoreText}}</li>`,
	dropdown: `<div data-kt-select-dropdown-content class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-md">
		{{search}}
		<ul role="listbox" aria-label="{{label}}" data-kt-select-options-container style="max-height: {{height}}px; overflow-y: auto;">
			{{options}}
		</ul>
	</div>`,
	error: `<li class="px-3 py-2 text-red-500" role="alert">{{errorMessage}}</li>`,

	highlight: `<span class="highlight">{{text}}</span>`,
	main: `<div data-kt-select-wrapper class="relative" data-kt-select-mode="{{mode}}"></div>`,
	displayCombobox: `<div class="relative flex items-center w-full">
		<input data-kt-select-search data-kt-select-display data-kt-select-value type="text" class="flex-1 w-full items-center justify-between px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" placeholder="{{placeholder}}" role="searchbox" aria-label="{{label}}" {{disabled}} />
		<button type="button" data-kt-select-clear-button class="absolute right-3 hidden text-gray-400 hover:text-gray-600" aria-label="Clear selection">
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
		</button>
	</div>`,

	icon: `<span class="option-icon mr-2"><img src="{{icon}}" class="rounded-full w-6 h-6" /></span>`,
	description: `<div class="option-description text-sm text-gray-500">{{description}}</div>`,

	display: `<div data-kt-select-display class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" tabindex="{{tabindex}}" role="button" aria-haspopup="listbox" aria-expanded="false" aria-label="{{label}}" {{disabled}}>
		<span data-kt-select-value>{{placeholder}}</span>
		<span data-kt-select-arrow class="ml-2">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</span>
	</div>`,
	option: `<li data-kt-select-option data-value="{{value}}" class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center{{selectedClass}}{{disabledClass}}" role="option" {{selected}} {{disabled}}>{{icon}}<div class="option-content"><div class="option-title" data-kt-option-title>{{text}}</div>{{description}}</div></li>`,

	optionGroup: `<li role="group" aria-label="{{label}}" class="py-1"><div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">{{label}}</div><ul>{{optionsHtml}}</ul></li>`,
	search: `<div class="px-3 py-2 border-b border-gray-200"><input type="text" data-kt-select-search placeholder="{{searchPlaceholder}}" class="w-full border-none focus:outline-none text-sm" role="searchbox" aria-label="{{searchPlaceholder}}"/></div>`,
	noResults: `<li class="px-3 py-2 text-gray-500" role="status">{{searchNotFoundText}}</li>`,
	loading: `<li class="px-3 py-2 text-gray-500 italic" role="status" aria-live="polite">{{loadingMessage}}</li>`,
	tag: `<div data-kt-select-tag class="inline-flex items-center bg-blue-50 border border-blue-100 rounded px-2 py-1 text-sm mr-1 mb-1"><span>{{title}}</span><span data-kt-select-remove-button data-value="{{id}}" class="ml-1 text-blue-400 hover:text-blue-600 cursor-pointer" role="button" aria-label="Remove {{safeTitle}}" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span></div>`,
};

/**
 * Template interface for KTSelect component
 * Each method returns an HTML string or HTMLElement
 */
export interface KTSelectTemplateInterface {
	/**
	 * Renders the dropdown content container
	 */
	dropdownContent: (
		config: KTSelectConfigInterface & { zindex?: number; content?: string },
	) => HTMLElement;
	/**
	 * Renders the options container
	 */
	optionsContainer: (
		config: KTSelectConfigInterface & { options?: string },
	) => HTMLElement;
	/**
	 * Renders an empty <option> for native select
	 */
	emptyOption: (
		config: KTSelectConfigInterface & { placeholder?: string },
	) => HTMLOptionElement;
	/**
	 * Renders an error <option> for the native select
	 */
	errorOption: (
		config: KTSelectConfigInterface & { errorMessage: string },
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
	main: (config: KTSelectConfigInterface) => HTMLElement;
	display: (config: KTSelectConfigInterface) => HTMLElement;
	dropdown: (
		config: KTSelectConfigInterface,
		optionsHtml: string,
	) => HTMLElement;

	// Icon rendering
	icon: (icon: string, config: KTSelectConfigInterface) => HTMLElement;
	description: (
		description: string,
		config: KTSelectConfigInterface,
	) => HTMLElement;

	// Option rendering
	option: (
		option: KTSelectOption | HTMLOptionElement,
		config: KTSelectConfigInterface,
	) => HTMLElement;
	optionGroup: (
		label: string,
		optionsHtml: string,
		config: KTSelectConfigInterface,
	) => HTMLElement;

	// Search and empty states
	search: (config: KTSelectConfigInterface) => HTMLElement;
	noResults: (config: KTSelectConfigInterface) => HTMLElement;
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
let userTemplateStrings: Partial<typeof defaultTemplateStrings> = {};

/**
 * Register or update user template overrides.
 * @param templates Partial template object to merge with defaults.
 */
export function setTemplateStrings(
	templates: Partial<typeof defaultTemplateStrings>,
): void {
	userTemplateStrings = { ...userTemplateStrings, ...templates };
}

/**
 * Get the complete template set, merging defaults, user overrides, and config templates.
 * @param config Optional config object with a "templates" property.
 */
export function getTemplateStrings(
	config?: KTSelectConfigInterface,
): typeof defaultTemplateStrings {
	const templates =
		config && typeof config === 'object' && 'templates' in config
			? (config as any).templates
			: undefined;
	if (templates) {
		return { ...defaultTemplateStrings, ...userTemplateStrings, ...templates };
	}
	return { ...defaultTemplateStrings, ...userTemplateStrings };
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
		const html = template.replace('{{text}}', text);
		return stringToElement(html);
	},

	/**
	 * Renders the dropdown content
	 */
	dropdownContent: (
		config: KTSelectConfigInterface & { zindex?: number; content?: string },
	) => {
		const template = getTemplateStrings(config).dropdownContent;
		const html = template
			.replace('{{zindex}}', config.zindex ? String(config.zindex) : '')
			.replace('{{content}}', config.content || '');
		return stringToElement(html);
	},

	/**
	 * Renders the options container for the dropdown
	 */
	optionsContainer: (
		config: KTSelectConfigInterface & { options?: string },
	) => {
		const template = getTemplateStrings(config).optionsContainer;
		const html = template
			.replace('{{label}}', config.label || 'Options')
			.replace('{{height}}', config.height ? String(config.height) : '250')
			.replace('{{options}}', config.options || '');
		return stringToElement(html);
	},

	/**
	 * Renders an empty option in the dropdown
	 */
	emptyOption: (config: KTSelectConfigInterface & { placeholder?: string }) => {
		const template = getTemplateStrings(config).emptyOption;
		const html = template.replace(
			'{{placeholder}}',
			config.placeholder || 'Select...',
		);
		return stringToElement(html) as HTMLOptionElement;
	},

	/**
	 * Renders an error option in the dropdown
	 */
	errorOption: (config: KTSelectConfigInterface & { errorMessage: string }) => {
		const template = getTemplateStrings(config).errorOption;
		const html = template.replace(
			'{{errorMessage}}',
			config.errorMessage || 'An error occurred',
		);
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
		return template.replace(
			'{{errorMessage}}',
			config.errorMessage || 'An error occurred',
		);
	},
	/**
	 * Renders the main container for the select component
	 */
	main: (config: KTSelectConfigInterface): HTMLElement => {
		const html = getTemplateStrings(config).main.replace(
			'{{mode}}',
			config.mode || '',
		);
		return stringToElement(html);
	},

	/**
	 * Renders the display element (trigger) for the select
	 */
	display: (config: KTSelectConfigInterface): HTMLElement => {
		const isCombobox = config.mode === SelectMode.COMBOBOX;
		if (isCombobox) {
			let html = getTemplateStrings(config)
				.displayCombobox.replace(
					/{{placeholder}}/g,
					config.placeholder || 'Select...',
				)
				.replace(
					/{{label}}/g,
					config.label || config.placeholder || 'Select...',
				)
				.replace('{{disabled}}', config.disabled ? 'disabled' : '');
			return stringToElement(html);
		}
		let html = getTemplateStrings(config)
			.display.replace('{{tabindex}}', config.disabled ? '-1' : '0')
			.replace('{{label}}', config.label || config.placeholder || 'Select...')
			.replace('{{disabled}}', config.disabled ? 'aria-disabled="true"' : '')
			.replace('{{placeholder}}', config.placeholder || 'Select...');
		return stringToElement(html);
	},

	/**
	 * Renders the dropdown content container
	 */
	dropdown: (
		config: KTSelectConfigInterface,
		optionsHtml: string,
	): HTMLElement => {
		const isCombobox = config.mode === SelectMode.COMBOBOX;
		const hasSearch = config.enableSearch && !isCombobox;
		const template = getTemplateStrings(config).dropdown;
		let searchHtml = '';
		if (hasSearch) {
			const searchElement = defaultTemplates.search(config);
			searchHtml = searchElement.outerHTML;
		}
		const html = template
			.replace('{{search}}', searchHtml)
			.replace('{{options}}', optionsHtml)
			.replace('{{label}}', config.label || 'Options')
			.replace('{{height}}', config.height ? String(config.height) : '250');
		return stringToElement(html);
	},

	/**
	 * Renders a single option
	 */
	option: (
		option: KTSelectOption | HTMLOptionElement,
		config: KTSelectConfigInterface & { templates: KTSelectTemplateInterface },
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

		// Prefer data-kt-select-option (JSON) if present
		let description: string | undefined;
		let icon: string | undefined;
		if (isHtmlOption) {
			const json = option.getAttribute('data-kt-select-option');
			if (json) {
				try {
					const optionData = JSON.parse(json);
					description = optionData?.description;
					icon = optionData?.icon;
				} catch (e) {
					// fallback to legacy attributes if JSON is invalid
					description =
						option.getAttribute('data-kt-select-option-description') ||
						undefined;
					icon = option.getAttribute('data-kt-select-option-icon') || undefined;
				}
			} else {
				description =
					option.getAttribute('data-kt-select-option-description') || undefined;
				icon = option.getAttribute('data-kt-select-option-icon') || undefined;
			}
		} else {
			description = (option as KTSelectOption).description;
			icon = (option as KTSelectOption).icon;
		}

		// Build option element with proper accessibility attributes
		const selectedClass = selected ? ' selected' : '';
		const disabledClass = disabled ? ' disabled' : '';
		let html = getTemplateStrings(config)
			.option.replace('{{value}}', value)
			.replace('{{selectedClass}}', selectedClass)
			.replace('{{disabledClass}}', disabledClass)
			.replace(
				'{{selected}}',
				selected ? 'aria-selected="true"' : 'aria-selected="false"',
			)
			.replace('{{disabled}}', disabled ? 'aria-disabled="true"' : '')
			.replace(
				/{{icon}}/g,
				icon ? defaultTemplates.icon(icon, config).outerHTML : '',
			)
			.replace('{{text}}', text)
			.replace(
				/{{description}}/g,
				description
					? defaultTemplates.description(description, config).outerHTML
					: '',
			);
		return stringToElement(html);
	},

	/**
	 * Renders an icon
	 */
	icon: (icon: string, config: KTSelectConfigInterface): HTMLElement => {
		const html = getTemplateStrings(config).icon.replace('{{icon}}', icon);
		return stringToElement(html);
	},

	/**
	 * Renders a description
	 */
	description: (
		description: string,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		const html = getTemplateStrings(config).description.replace(
			'{{description}}',
			description,
		);
		return stringToElement(html);
	},

	/**
	 * Renders an option group with header
	 */
	optionGroup: (
		label: string,
		optionsHtml: string,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		let html = getTemplateStrings(config)
			.optionGroup.replace(/{{label}}/g, label)
			.replace('{{optionsHtml}}', optionsHtml);
		return stringToElement(html);
	},

	/**
	 * Renders the search input
	 */
	search: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config).search.replace(
			'{{searchPlaceholder}}',
			config.searchPlaceholder || 'Search...',
		);
		return stringToElement(html);
	},

	/**
	 * Renders the no results message
	 */
	noResults: (config: KTSelectConfigInterface): HTMLElement => {
		let html = getTemplateStrings(config).noResults.replace(
			'{{searchNotFoundText}}',
			config.searchNotFoundText || 'No results found',
		);
		return stringToElement(html);
	},

	/**
	 * Renders the loading state
	 */
	loading: (
		config: KTSelectConfigInterface,
		loadingMessage: string,
	): HTMLElement => {
		let html = getTemplateStrings(config).loading.replace(
			'{{loadingMessage}}',
			loadingMessage || 'Loading options...',
		);
		return stringToElement(html);
	},

	/**
	 * Renders a tag for multi-select
	 */
	tag: (
		option: KTSelectOption,
		config: KTSelectConfigInterface,
	): HTMLElement => {
		// Escape HTML characters for aria-label to prevent HTML injection
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

		// Ensure we have plain text for the aria-label
		const safeTitle = escapeHTML(option.title);
		let html = getTemplateStrings(config)
			.tag.replace('{{title}}', option.title)
			.replace('{{id}}', option.id)
			.replace('{{safeTitle}}', safeTitle);
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
};
