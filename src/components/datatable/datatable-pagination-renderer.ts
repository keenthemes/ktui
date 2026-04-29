/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableCleanup,
	KTDataTablePaginationRenderer,
	KTDataTablePaginationRendererInput,
} from './datatable-contracts';

export class KTDataTableDomPaginationRenderer
	implements KTDataTablePaginationRenderer
{
	public render(
		input: KTDataTablePaginationRendererInput,
	): KTDataTableCleanup | void {
		this.removeChildElements(input.sizeElement);
		this.createPageSizeControls(input);

		this.removeChildElements(input.paginationElement);
		this.createPaginationControls(input);

		return () => {
			if (input.sizeElement) {
				input.sizeElement.onchange = null;
			}
			this.removeChildElements(input.paginationElement);
		};
	}

	private removeChildElements(container: HTMLElement): void {
		if (!container) {
			return;
		}

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	private createPageSizeControls(
		input: KTDataTablePaginationRendererInput,
	): HTMLSelectElement {
		if (!input.sizeElement) {
			return input.sizeElement;
		}

		setTimeout(() => {
			const options = input.config.pageSizes.map((size: number) => {
				const option = document.createElement('option') as HTMLOptionElement;
				option.value = String(size);
				option.text = String(size);
				option.selected = input.state.pageSize === size;
				return option;
			});

			input.sizeElement.append(...options);
		}, 100);

		input.sizeElement.onchange = (event: Event) => {
			input.reloadPageSize(
				Number((event.target as HTMLSelectElement).value),
				1,
			);
		};

		return input.sizeElement;
	}

	private createPaginationControls(
		input: KTDataTablePaginationRendererInput,
	): HTMLElement {
		if (!input.infoElement || !input.paginationElement || input.dataLength === 0) {
			return null;
		}

		this.setPaginationInfoText(input);
		this.createPaginationButtons(input.paginationElement, input);

		return input.paginationElement;
	}

	private setPaginationInfoText(input: KTDataTablePaginationRendererInput): void {
		input.infoElement.textContent = input.config.info
			.replace(
				'{start}',
				(input.state.page - 1) * input.state.pageSize + 1 + '',
			)
			.replace(
				'{end}',
				Math.min(input.state.page * input.state.pageSize, input.state.totalItems) +
					'',
			)
			.replace('{total}', input.state.totalItems + '');
	}

	private createPaginationButtons(
		paginationContainer: HTMLElement,
		input: KTDataTablePaginationRendererInput,
	): void {
		const { page: currentPage, totalPages } = input.state;
		const { previous, next, number, more } = input.config.pagination;

		const createButton = (
			text: string,
			className: string,
			disabled: boolean,
			handleClick: () => void,
		): HTMLButtonElement => {
			const button = document.createElement('button') as HTMLButtonElement;
			button.className = className;
			button.innerHTML = text;
			button.disabled = disabled;
			button.onclick = handleClick;
			return button;
		};

		paginationContainer.appendChild(
			createButton(
				previous.text,
				`${previous.class}${currentPage === 1 ? ' disabled' : ''}`,
				currentPage === 1,
				() => input.paginateData(currentPage - 1),
			),
		);

		if (input.config.pageMore) {
			const range = this.calculatePageRange(
				currentPage,
				totalPages,
				input.config.pageMoreLimit,
			);

			if (range.start > 1) {
				paginationContainer.appendChild(
					createButton(more.text, more.class, false, () =>
						input.paginateData(Math.max(1, range.start - 1)),
					),
				);
			}

			for (let i = range.start; i <= range.end; i++) {
				paginationContainer.appendChild(
					createButton(
						number.text.replace('{page}', i.toString()),
						`${number.class}${currentPage === i ? ' active disabled' : ''}`,
						currentPage === i,
						() => input.paginateData(i),
					),
				);
			}

			if (range.end < totalPages) {
				paginationContainer.appendChild(
					createButton(more.text, more.class, false, () =>
						input.paginateData(Math.min(totalPages, range.end + 1)),
					),
				);
			}
		} else {
			for (let i = 1; i <= totalPages; i++) {
				paginationContainer.appendChild(
					createButton(
						number.text.replace('{page}', i.toString()),
						`${number.class}${currentPage === i ? ' active disabled' : ''}`,
						currentPage === i,
						() => input.paginateData(i),
					),
				);
			}
		}

		paginationContainer.appendChild(
			createButton(
				next.text,
				`${next.class}${currentPage === totalPages ? ' disabled' : ''}`,
				currentPage === totalPages,
				() => input.paginateData(currentPage + 1),
			),
		);
	}

	private calculatePageRange(
		currentPage: number,
		totalPages: number,
		maxButtons: number,
	): { start: number; end: number } {
		let startPage: number, endPage: number;
		const halfMaxButtons = Math.floor(maxButtons / 2);

		if (totalPages <= maxButtons) {
			startPage = 1;
			endPage = totalPages;
		} else {
			startPage = Math.max(currentPage - halfMaxButtons, 1);
			endPage = Math.min(startPage + maxButtons - 1, totalPages);
			if (endPage - startPage < maxButtons - 1) {
				startPage = Math.max(endPage - maxButtons + 1, 1);
			}
		}

		return { start: startPage, end: endPage };
	}
}
