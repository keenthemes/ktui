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

const isTransparentColor = (value: string): boolean => {
	const color = value.trim().toLowerCase();
	return (
		color === '' ||
		color === 'transparent' ||
		color === 'rgba(0, 0, 0, 0)' ||
		color === 'rgba(0,0,0,0)'
	);
};

const hasPartialAlpha = (value: string): boolean => {
	const color = value.trim().toLowerCase();
	const rgbaMatch = color.match(
		/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/,
	);
	if (!rgbaMatch) {
		const slashAlphaMatch = color.match(/\/\s*([0-9]*\.?[0-9]+)\s*\)$/);
		if (slashAlphaMatch) {
			const alpha = Number.parseFloat(slashAlphaMatch[1]);
			return Number.isFinite(alpha) && alpha > 0 && alpha < 1;
		}
		return false;
	}

	const alpha = Number.parseFloat(rgbaMatch[1]);
	return Number.isFinite(alpha) && alpha > 0 && alpha < 1;
};

const parseRgbLikeColor = (
	value: string,
): { r: number; g: number; b: number; a: number } | null => {
	const color = value.trim().toLowerCase();
	const rgbMatch = color.match(
		/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
	);
	if (rgbMatch) {
		return {
			r: Number.parseInt(rgbMatch[1], 10),
			g: Number.parseInt(rgbMatch[2], 10),
			b: Number.parseInt(rgbMatch[3], 10),
			a: 1,
		};
	}

	const rgbaMatch = color.match(
		/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/,
	);
	if (rgbaMatch) {
		return {
			r: Number.parseInt(rgbaMatch[1], 10),
			g: Number.parseInt(rgbaMatch[2], 10),
			b: Number.parseInt(rgbaMatch[3], 10),
			a: Number.parseFloat(rgbaMatch[4]),
		};
	}

	return null;
};

const clampColorChannel = (value: number): number => {
	return Math.min(255, Math.max(0, Math.round(value)));
};

const blendRgbaOverRgb = (
	foreground: { r: number; g: number; b: number; a: number },
	background: { r: number; g: number; b: number },
): { r: number; g: number; b: number } => {
	return {
		r: clampColorChannel(
			foreground.r * foreground.a + background.r * (1 - foreground.a),
		),
		g: clampColorChannel(
			foreground.g * foreground.a + background.g * (1 - foreground.a),
		),
		b: clampColorChannel(
			foreground.b * foreground.a + background.b * (1 - foreground.a),
		),
	};
};

const resolveStickyBackgroundColor = (element: HTMLElement): string => {
	let pendingPartialAlphaColor: {
		r: number;
		g: number;
		b: number;
		a: number;
	} | null = null;
	let current: HTMLElement | null = element;
	while (current) {
		const color = window.getComputedStyle(current).backgroundColor;
		if (isTransparentColor(color)) {
			current = current.parentElement;
			continue;
		}

		const parsedColor = parseRgbLikeColor(color);
		if (!parsedColor) {
			return color;
		}

		if (parsedColor.a >= 1) {
			if (!pendingPartialAlphaColor) {
				return color;
			}

			const blended = blendRgbaOverRgb(pendingPartialAlphaColor, {
				r: parsedColor.r,
				g: parsedColor.g,
				b: parsedColor.b,
			});
			return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
		}

		if (!pendingPartialAlphaColor && hasPartialAlpha(color)) {
			pendingPartialAlphaColor = parsedColor;
		}
		current = current.parentElement;
	}

	if (pendingPartialAlphaColor) {
		const blended = blendRgbaOverRgb(pendingPartialAlphaColor, {
			r: 255,
			g: 255,
			b: 255,
		});
		return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
	}

	return '#ffffff';
};

const resolveCellBackgroundColor = (
	element: HTMLElement,
	fallbackColor: string,
): string => {
	const resolved = resolveStickyBackgroundColor(element);
	return isTransparentColor(resolved) || hasPartialAlpha(resolved)
		? fallbackColor
		: resolved;
};

const resolveLockedBaseBackgroundColor = (
	rootElement: HTMLElement,
	tableElement: HTMLTableElement,
): string => {
	const rootStyle = window.getComputedStyle(rootElement);
	const tableStyle = window.getComputedStyle(tableElement);
	const cssVarColor =
		rootStyle.getPropertyValue('--color-card').trim() ||
		rootStyle.getPropertyValue('--color-background').trim() ||
		tableStyle.getPropertyValue('--color-card').trim() ||
		tableStyle.getPropertyValue('--color-background').trim();

	if (cssVarColor && cssVarColor.toLowerCase() !== 'transparent') {
		return cssVarColor;
	}

	return resolveStickyBackgroundColor(tableElement);
};

const ensureStickyCell = (
	element: HTMLElement,
	className: string,
	zIndex: number,
	backgroundColor?: string,
): void => {
	element.classList.add(LOCKED_CELL_CLASS, className);
	element.style.position = 'sticky';
	element.style.zIndex = String(zIndex);
	element.style.backgroundColor = backgroundColor || '';
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
	baseBackgroundColor: string,
): void => {
	const rows = Array.from(tbodyElement.rows);

	let topOffset = headerHeight;
	rows.slice(0, topCount).forEach((row) => {
		const rowTop = topOffset;
		Array.from(row.cells).forEach((cell) => {
			const td = cell as HTMLTableCellElement;
			ensureStickyCell(
				td,
				LOCKED_TOP_ROW_CLASS,
				ROW_Z_INDEX,
				resolveCellBackgroundColor(td, baseBackgroundColor),
			);
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
				ensureStickyCell(
					td,
					LOCKED_BOTTOM_ROW_CLASS,
					ROW_Z_INDEX,
					resolveCellBackgroundColor(td, baseBackgroundColor),
				);
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
	baseBackgroundColor: string,
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
			ensureStickyCell(
				cell,
				LOCKED_LEFT_CLASS,
				COLUMN_Z_INDEX,
				resolveCellBackgroundColor(cell, baseBackgroundColor),
			);
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
			ensureStickyCell(
				cell,
				LOCKED_RIGHT_CLASS,
				COLUMN_Z_INDEX,
				resolveCellBackgroundColor(cell, baseBackgroundColor),
			);
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
				const lockedBaseBackgroundColor = resolveLockedBaseBackgroundColor(
					ctx.rootElement,
					ctx.tableElement,
				);
				const headerHeight = applyStickyHeader(
					ctx.theadElement,
					lockedLayout.stickyHeader === true,
				);

				applyStickyRows(
					ctx.tbodyElement,
					headerHeight,
					toPositiveInteger(lockedLayout.stickyRows?.top),
					toPositiveInteger(lockedLayout.stickyRows?.bottom),
					lockedBaseBackgroundColor,
				);

				applyStickyColumns(
					ctx.tableElement,
					ctx.theadElement,
					ctx.config,
					lockedBaseBackgroundColor,
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
