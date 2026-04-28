/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableConfigInterface,
	KTDataTableLayoutPluginContextInterface,
	KTDataTableLayoutPluginInterface,
} from './types';

type Edge = 'left' | 'right';

const LOCKED_CELL_CLASS = 'kt-datatable-locked-cell';
const LOCKED_HEADER_CLASS = 'kt-datatable-locked-header';
const LOCKED_TOP_ROW_CLASS = 'kt-datatable-locked-top-row';
const LOCKED_BOTTOM_ROW_CLASS = 'kt-datatable-locked-bottom-row';
const LOCKED_LEFT_CLASS = 'kt-datatable-locked-left';
const LOCKED_RIGHT_CLASS = 'kt-datatable-locked-right';

const HEADER_Z_INDEX = 40;
const ROW_Z_INDEX = 30;
const COLUMN_Z_INDEX = 35;
const INTERSECTION_Z_INDEX = 45;

const toPositiveInteger = (value: number | undefined): number => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.floor(value));
};

const hasLockedLayoutConfig = (config: KTDataTableConfigInterface): boolean => {
	const lockedLayout = config.lockedLayout;
	if (!lockedLayout) {
		return false;
	}

	return (
		lockedLayout.stickyHeader === true ||
		toPositiveInteger(lockedLayout.stickyRows?.top) > 0 ||
		toPositiveInteger(lockedLayout.stickyRows?.bottom) > 0 ||
		(lockedLayout.stickyColumns?.left?.length || 0) > 0 ||
		(lockedLayout.stickyColumns?.right?.length || 0) > 0
	);
};

const getScrollContainer = (rootElement: HTMLElement): HTMLElement => {
	return (
		rootElement.closest<HTMLElement>('.kt-table-wrapper') ||
		rootElement.querySelector<HTMLElement>('.kt-table-wrapper') ||
		rootElement
	);
};

const clearStickyStyles = (
	tableElement: HTMLTableElement,
	scrollContainer: HTMLElement,
): void => {
	tableElement.classList.remove('kt-datatable-locked-layout');
	scrollContainer.classList.remove('kt-datatable-locked-layout-host');
	tableElement.style.borderCollapse = '';
	tableElement.style.borderSpacing = '';

	const stickyElements = tableElement.querySelectorAll<HTMLElement>(
		`.${LOCKED_CELL_CLASS}`,
	);

	stickyElements.forEach((element) => {
		element.classList.remove(
			LOCKED_CELL_CLASS,
			LOCKED_HEADER_CLASS,
			LOCKED_TOP_ROW_CLASS,
			LOCKED_BOTTOM_ROW_CLASS,
			LOCKED_LEFT_CLASS,
			LOCKED_RIGHT_CLASS,
		);
		element.style.position = '';
		element.style.top = '';
		element.style.bottom = '';
		element.style.left = '';
		element.style.right = '';
		element.style.zIndex = '';
		element.style.backgroundColor = '';
	});
};

const getDirection = (tableElement: HTMLTableElement): 'ltr' | 'rtl' => {
	const scopedDir = tableElement
		.closest<HTMLElement>('[dir]')
		?.getAttribute('dir');
	const globalDir =
		typeof document !== 'undefined'
			? document.documentElement.getAttribute('dir')
			: null;
	return scopedDir === 'rtl' || globalDir === 'rtl' ? 'rtl' : 'ltr';
};

const resolveEdgeProperty = (edge: Edge, direction: 'ltr' | 'rtl'): Edge => {
	if (direction === 'rtl') {
		return edge === 'left' ? 'right' : 'left';
	}

	return edge;
};

const setStickyEdge = (
	element: HTMLElement,
	edge: Edge,
	offset: number,
	direction: 'ltr' | 'rtl',
): void => {
	const resolvedEdge = resolveEdgeProperty(edge, direction);
	if (resolvedEdge === 'left') {
		element.style.left = `${offset}px`;
		element.style.right = '';
	} else {
		element.style.right = `${offset}px`;
		element.style.left = '';
	}
};

const ensureStickyCell = (
	element: HTMLElement,
	className: string,
	zIndex: number,
): void => {
	element.classList.add(LOCKED_CELL_CLASS, className);
	element.style.position = 'sticky';
	element.style.zIndex = String(zIndex);
};

const markIntersectionZIndex = (element: HTMLElement): void => {
	const isRowLocked =
		element.classList.contains(LOCKED_HEADER_CLASS) ||
		element.classList.contains(LOCKED_TOP_ROW_CLASS) ||
		element.classList.contains(LOCKED_BOTTOM_ROW_CLASS);
	const isColumnLocked =
		element.classList.contains(LOCKED_LEFT_CLASS) ||
		element.classList.contains(LOCKED_RIGHT_CLASS);

	if (isRowLocked && isColumnLocked) {
		element.style.zIndex = String(INTERSECTION_Z_INDEX);
	}
};

const applyStickyHeader = (
	theadElement: HTMLTableSectionElement,
	enabled: boolean,
): number => {
	if (!enabled) {
		return 0;
	}

	let cumulativeTop = 0;
	Array.from(theadElement.rows).forEach((row) => {
		const rowTop = cumulativeTop;
		Array.from(row.cells).forEach((cell) => {
			const headerCell = cell as HTMLTableCellElement;
			ensureStickyCell(headerCell, LOCKED_HEADER_CLASS, HEADER_Z_INDEX);
			headerCell.style.top = `${rowTop}px`;
		});
		cumulativeTop += row.getBoundingClientRect().height;
	});

	return cumulativeTop;
};

const applyStickyRows = (
	tbodyElement: HTMLTableSectionElement,
	headerHeight: number,
	topCount: number,
	bottomCount: number,
): void => {
	const rows = Array.from(tbodyElement.rows);

	let topOffset = headerHeight;
	rows.slice(0, topCount).forEach((row) => {
		const rowTop = topOffset;
		Array.from(row.cells).forEach((cell) => {
			const td = cell as HTMLTableCellElement;
			ensureStickyCell(td, LOCKED_TOP_ROW_CLASS, ROW_Z_INDEX);
			td.style.top = `${rowTop}px`;
		});
		topOffset += row.getBoundingClientRect().height;
	});

	let bottomOffset = 0;
	rows
		.slice(Math.max(0, rows.length - bottomCount))
		.reverse()
		.forEach((row) => {
			const rowBottom = bottomOffset;
			Array.from(row.cells).forEach((cell) => {
				const td = cell as HTMLTableCellElement;
				ensureStickyCell(td, LOCKED_BOTTOM_ROW_CLASS, ROW_Z_INDEX);
				td.style.bottom = `${rowBottom}px`;
			});
			bottomOffset += row.getBoundingClientRect().height;
		});
};

const getColumnIndexMap = (
	theadElement: HTMLTableSectionElement,
	config: KTDataTableConfigInterface,
): Map<string, number> => {
	const map = new Map<string, number>();
	const typedHeaders = Array.from(
		theadElement.querySelectorAll<HTMLTableCellElement>(
			'th[data-kt-datatable-column]',
		),
	);

	if (typedHeaders.length > 0) {
		typedHeaders.forEach((th, index) => {
			const column = th.getAttribute('data-kt-datatable-column');
			if (column) {
				map.set(column, index);
			}
		});
		return map;
	}

	if (config.columns) {
		Object.keys(config.columns).forEach((key, index) => {
			map.set(key, index);
		});
	}

	return map;
};

const getColumnCells = (
	tableElement: HTMLTableElement,
	columnIndex: number,
): HTMLTableCellElement[] => {
	const cells: HTMLTableCellElement[] = [];
	tableElement.querySelectorAll('tr').forEach((row) => {
		const cell = row.children.item(columnIndex);
		if (cell instanceof HTMLTableCellElement) {
			cells.push(cell);
		}
	});
	return cells;
};

const applyStickyColumns = (
	tableElement: HTMLTableElement,
	theadElement: HTMLTableSectionElement,
	config: KTDataTableConfigInterface,
): void => {
	const lockedColumns = config.lockedLayout?.stickyColumns;
	if (!lockedColumns) {
		return;
	}

	const direction = getDirection(tableElement);
	const columnMap = getColumnIndexMap(theadElement, config);

	let leftOffset = 0;
	(lockedColumns.left || []).forEach((key) => {
		const index = columnMap.get(key);
		if (typeof index !== 'number') {
			return;
		}

		const cells = getColumnCells(tableElement, index);
		if (cells.length === 0) {
			return;
		}

		const width = cells[0].getBoundingClientRect().width;
		cells.forEach((cell) => {
			ensureStickyCell(cell, LOCKED_LEFT_CLASS, COLUMN_Z_INDEX);
			setStickyEdge(cell, 'left', leftOffset, direction);
		});
		leftOffset += width;
	});

	let rightOffset = 0;
	[...(lockedColumns.right || [])].reverse().forEach((key) => {
		const index = columnMap.get(key);
		if (typeof index !== 'number') {
			return;
		}

		const cells = getColumnCells(tableElement, index);
		if (cells.length === 0) {
			return;
		}

		const width = cells[0].getBoundingClientRect().width;
		cells.forEach((cell) => {
			ensureStickyCell(cell, LOCKED_RIGHT_CLASS, COLUMN_Z_INDEX);
			setStickyEdge(cell, 'right', rightOffset, direction);
		});
		rightOffset += width;
	});

	tableElement
		.querySelectorAll<HTMLElement>(`.${LOCKED_CELL_CLASS}`)
		.forEach(markIntersectionZIndex);
};

export const createStickyLayoutPlugin =
	(): KTDataTableLayoutPluginInterface => {
		let resizeHandler: (() => void) | null = null;
		let scrollContainerTarget: HTMLElement | null = null;
		let isApplying = false;

		const applyLayout = (
			ctx: KTDataTableLayoutPluginContextInterface,
		): void => {
			if (isApplying || !hasLockedLayoutConfig(ctx.config)) {
				return;
			}

			isApplying = true;
			try {
				const scrollContainer = getScrollContainer(ctx.rootElement);
				clearStickyStyles(ctx.tableElement, scrollContainer);
				ctx.tableElement.classList.add('kt-datatable-locked-layout');
				scrollContainer.classList.add('kt-datatable-locked-layout-host');
				ctx.tableElement.style.borderCollapse = 'separate';
				ctx.tableElement.style.borderSpacing = '0';

				const lockedLayout = ctx.config.lockedLayout || {};
				const headerHeight = applyStickyHeader(
					ctx.theadElement,
					lockedLayout.stickyHeader === true,
				);

				applyStickyRows(
					ctx.tbodyElement,
					headerHeight,
					toPositiveInteger(lockedLayout.stickyRows?.top),
					toPositiveInteger(lockedLayout.stickyRows?.bottom),
				);

				applyStickyColumns(
					ctx.tableElement,
					ctx.theadElement,
					ctx.config,
				);
			} finally {
				isApplying = false;
			}
		};

		const detachResizeListener = (): void => {
			if (!resizeHandler) {
				return;
			}

			window.removeEventListener('resize', resizeHandler);
			if (scrollContainerTarget) {
				scrollContainerTarget.removeEventListener('scroll', resizeHandler);
			}

			resizeHandler = null;
			scrollContainerTarget = null;
		};

		return {
			beforeDraw: (ctx) => {
				const scrollContainer = getScrollContainer(ctx.rootElement);
				clearStickyStyles(ctx.tableElement, scrollContainer);
			},
			afterDraw: (ctx) => {
				detachResizeListener();
				applyLayout(ctx);

				const scrollContainer = getScrollContainer(ctx.rootElement);
				resizeHandler = () => applyLayout(ctx);
				window.addEventListener('resize', resizeHandler);
				scrollContainerTarget = scrollContainer;
				scrollContainer.addEventListener('scroll', resizeHandler);
			},
			dispose: (ctx) => {
				detachResizeListener();
				const scrollContainer = getScrollContainer(ctx.rootElement);
				clearStickyStyles(ctx.tableElement, scrollContainer);
			},
		};
	};
