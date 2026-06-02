/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTDataTableSpinner {
	show(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
			loading?: { template: string; content: string };
		},
		tableElement: HTMLTableElement,
	): void;
	hide(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
		},
	): void;
	remove(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
		},
	): void;
}

export function createSpinner(): KTDataTableSpinner {
	function findSpinner(
		root: HTMLElement | null,
		spinnerSel: string | undefined,
	): HTMLElement | null {
		return root && spinnerSel
			? root.querySelector<HTMLElement>(spinnerSel)
			: null;
	}

	function createSpinnerElement(
		tableElement: HTMLTableElement,
		loading: { template: string; content: string },
	): HTMLElement | null {
		const template = document.createElement('template');
		template.innerHTML = loading.template
			.trim()
			.replace('{content}', loading.content);
		const first = template.content.firstChild;
		if (!first || !(first instanceof HTMLElement)) return null;
		const spinner = first;
		spinner.setAttribute('data-kt-datatable-spinner', 'true');
		tableElement.appendChild(spinner);
		return spinner;
	}

	function show(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
			loading?: { template: string; content: string };
		},
		tableElement: HTMLTableElement,
	): void {
		const spinnerSel = config.attributes?.spinner;
		const fromDom = findSpinner(root, spinnerSel);
		const spinner =
			fromDom ??
			(config.loading
				? createSpinnerElement(tableElement, config.loading)
				: null);
		if (spinner) spinner.style.display = 'block';
		root?.classList.add(config.loadingClass ?? 'loading');
	}

	function hide(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
		},
	): void {
		const spinner = findSpinner(root, config.attributes?.spinner);
		if (spinner) spinner.style.display = 'none';
		root?.classList.remove(config.loadingClass ?? 'loading');
	}

	function remove(
		root: HTMLElement | null,
		config: {
			attributes?: { spinner?: string };
			loadingClass?: string;
		},
	): void {
		const spinner = findSpinner(root, config.attributes?.spinner);
		if (spinner?.parentNode) spinner.parentNode.removeChild(spinner);
		root?.classList.remove(config.loadingClass ?? 'loading');
	}

	return { show, hide, remove };
}
