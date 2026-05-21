/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableCleanup,
	KTDataTablePaginationRenderer,
	KTDataTablePaginationRendererInput,
} from './datatable-contracts';

export class KTDataTableDomPaginationRenderer implements KTDataTablePaginationRenderer {
	public render(
		input: KTDataTablePaginationRendererInput,
	): KTDataTableCleanup | void {
		if (input.sizeElement) {
			this.removeChildElements(input.sizeElement);
			this.createPageSizeControls(input);
		}

		if (input.paginationElement) {
			this.removeChildElements(input.paginationElement);
			this.createPaginationControls(input);
		}

		return () => {
			if (input.sizeElement) {
				input.sizeElement.onchange = null;
				this.removeChildElements(input.sizeElement);
			}
			if (input.paginationElement) {
				this.removeChildElements(input.paginationElement);
			}
		};
	}

	private removeChildElements(container?: HTMLElement | null): void {
		if (!container) {
			return;
		}

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	private createPageSizeControls(
		input: KTDataTablePaginationRendererInput,
	): void {
		if (!input.sizeElement) {
			return;
		}

		const pageSizes = input.config.pageSizes ?? [5, 10, 20, 30, 50];
		const options = pageSizes.map((size: number) => {
			const option = document.createElement('option') as HTMLOptionElement;
			option.value = String(size);
			option.text = String(size);
			option.selected = input.state.pageSize === size;
			return option;
		});

		input.sizeElement.append(...options);

		input.sizeElement.onchange = (event: Event) => {
			input.reloadPageSize(
				Number((event.target as HTMLSelectElement).value),
				1,
			);
		};
	}

	private createPaginationControls(
		input: KTDataTablePaginationRendererInput,
	): HTMLElement | null {
		if (!input.paginationElement || input.dataLength === 0) {
			return null;
		}

		this.setPaginationInfoText(input);
		this.createPaginationButtons(input.paginationElement, input);

		return input.paginationElement;
	}

	private setPaginationInfoText(
		input: KTDataTablePaginationRendererInput,
	): void {
		if (!input.infoElement) {
			return;
		}

		const infoTemplate = input.config.info ?? '{start}-{end} of {total}';
		input.infoElement.textContent = infoTemplate
			.replace(
				'{start}',
				(input.state.page - 1) * input.state.pageSize + 1 + '',
			)
			.replace(
				'{end}',
				Math.min(
					input.state.page * input.state.pageSize,
					input.state.totalItems,
				) + '',
			)
			.replace('{total}', input.state.totalItems + '');
	}

	private createPaginationButtons(
		paginationContainer: HTMLElement,
		input: KTDataTablePaginationRendererInput,
	): void {
		const pagination = input.config.pagination;
		if (!pagination) {
			return;
		}

		const { page: currentPage, totalPages } = input.state;
		const { previous, next, number, more } = pagination;
		const pageMoreLimit = input.config.pageMoreLimit ?? 3;

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
				pageMoreLimit,
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
