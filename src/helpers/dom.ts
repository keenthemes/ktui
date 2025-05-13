/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

/* eslint-disable max-len */
import KTUtils from './utils';
import { KTOffsetType, KTOptionType, KTViewPortType } from '../types';

const KTDom = {
	isRTL(): boolean {
		const htmlTag = document.documentElement; // Access the <html> tag

		// Check if the "dir" attribute is present and its value is "rtl"
		const dir = htmlTag.getAttribute('dir');

		return dir === 'rtl';
	},

	isElement(element: HTMLElement): boolean {
		if (element && element instanceof HTMLElement) {
			return true;
		} else {
			return false;
		}
	},

	getElement(element: HTMLElement | string): HTMLElement {
		if (this.isElement(element)) {
			return element as HTMLElement;
		}

		if (element && (element as string).length > 0) {
			return document.querySelector(KTUtils.parseSelector(element as string));
		}

		return null;
	},

	remove(element: HTMLElement): void {
		if (this.isElement(element) && element.parentNode) {
			element.parentNode.removeChild(element);
		}
	},

	hasClass(element: HTMLElement, className: string): boolean {
		// Split classNames string into an array of individual class names
		const classes = className.split(' ');

		// Loop through each class name
		for (const className of classes) {
			// Check if the element has the current class name
			if (!element.classList.contains(className)) {
				// Return false if any class is missing
				return false;
			}
		}

		// Return true if all classes are present
		return true;
	},

	addClass(element: HTMLElement, className: string): void {
		const classNames = className.split(' ');

		if (element.classList) {
			for (let i = 0; i < classNames.length; i++) {
				if (classNames[i] && classNames[i].length > 0) {
					element.classList.add(classNames[i].trim());
				}
			}
		} else if (!this.hasClass(element, className)) {
			for (let x = 0; x < classNames.length; x++) {
				element.className += ' ' + classNames[x].trim();
			}
		}
	},

	removeClass(element: HTMLElement, className: string): void {
		const classNames = className.split(' ');

		if (element.classList) {
			for (let i = 0; i < classNames.length; i++) {
				element.classList.remove(classNames[i].trim());
			}
		} else if (this.hasClass(element, className)) {
			for (let x = 0; x < classNames.length; x++) {
				element.className = element.className.replace(
					new RegExp('\\b' + classNames[x].trim() + '\\b', 'g'),
					'',
				);
			}
		}
	},

	getCssProp(element: HTMLElement, prop: string): string {
		return (
			element ? window.getComputedStyle(element).getPropertyValue(prop) : ''
		).replace(' ', '');
	},

	setCssProp(element: HTMLElement, prop: string, value: string) {
		if (element) {
			window.getComputedStyle(element).setProperty(prop, value);
		}
	},

	offset(element: HTMLElement): KTOffsetType {
		if (!element) return { top: 0, left: 0, right: 0, bottom: 0 };

		const rect = element.getBoundingClientRect();

		return {
			top: rect.top,
			left: rect.left,
			right: window.innerWidth - rect.right,
			bottom: window.innerHeight - rect.top,
		};
	},

	getIndex(element: HTMLElement): number {
		const children = Array.from(element.parentNode?.children || []);
		return children.indexOf(element);
	},

	parents(element: HTMLElement, selector: string): Array<HTMLElement> {
		const parents: Array<HTMLElement> = [];

		// Push each parent element to the array
		for (
			element && element !== document.documentElement;
			(element = element.parentElement as HTMLElement);

		) {
			if (selector) {
				if (element.matches(selector)) {
					parents.push(element as HTMLElement);
				}
				continue;
			}
			parents.push(element as HTMLElement);
		}

		// Return our parent array
		return parents;
	},

	siblings(element: HTMLElement) {
		const parent = element.parentNode;
		if (!parent) return [];
		return Array.from(parent.children).filter((child) => child !== element);
	},

	children(element: HTMLElement, selector: string): Array<HTMLElement> {
		if (!element || !element.childNodes) {
			return null;
		}

		const result: Array<HTMLElement> = [];
		const l = element.childNodes.length;
		let i = 0;

		for (i = 0; i < l; i++) {
			if (
				element.childNodes[i].nodeType == 1 &&
				(element.childNodes[i] as HTMLElement).matches(selector)
			) {
				result.push(element.childNodes[i] as HTMLElement);
			}
		}

		return result;
	},

	child(element: HTMLElement, selector: string): HTMLElement {
		const children = KTDom.children(element, selector);

		return children ? children[0] : null;
	},

	isVisible(element: HTMLElement): boolean {
		if (!this.isElement(element) || element.getClientRects().length === 0) {
			return false;
		}

		// eslint-disable-next-line max-len
		return (
			getComputedStyle(element).getPropertyValue('visibility') === 'visible'
		);
	},

	isDisabled(
		element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
	): boolean {
		if (!element || element.nodeType !== Node.ELEMENT_NODE) {
			return true;
		}

		if (element.classList.contains('disabled')) {
			return true;
		}

		if (typeof element.disabled !== 'undefined') {
			return element.disabled;
		}

		return (
			element.hasAttribute('disabled') &&
			element.getAttribute('disabled') !== 'false'
		);
	},

	transitionEnd(element: HTMLElement, callback: CallableFunction): void {
		const duration: number = this.getCSSTransitionDuration(element);

		setTimeout(() => {
			callback();
		}, duration);
	},

	animationEnd(element: HTMLElement, callback: CallableFunction): void {
		const duration: number = this.getCSSAnimationDuration(element);

		setTimeout(() => {
			callback();
		}, duration);
	},

	getCSSTransitionDuration(element: HTMLElement): number {
		return (
			parseFloat(window.getComputedStyle(element).transitionDuration) * 1000
		);
	},

	getCSSAnimationDuration(element: HTMLElement): number {
		return (
			parseFloat(window.getComputedStyle(element).animationDuration) * 1000
		);
	},

	reflow(element: HTMLElement): void {
		element.offsetHeight;
	},

	insertAfter(element: HTMLElement, referenceNode: HTMLElement) {
		const parentNode = referenceNode.parentNode;
		if (parentNode) {
			parentNode.insertBefore(element, referenceNode.nextSibling);
		}
	},

	getHighestZindex(element: HTMLElement): number {
		let position: string, value: number;

		while (element && element !== document.documentElement) {
			// Ignore z-index if position is set to a value where z-index is ignored by the browser
			// This makes behavior of this function consistent across browsers
			// WebKit always returns auto if the element is positioned
			position = element.style.position;

			if (
				position === 'absolute' ||
				position === 'relative' ||
				position === 'fixed'
			) {
				// IE returns 0 when zIndex is not specified
				// other browsers return a string
				// we ignore the case of nested elements with an explicit value of 0
				// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
				value = parseInt(element.style.zIndex);

				if (!isNaN(value) && value !== 0) {
					return value;
				}
			}

			element = element.parentNode as HTMLElement;
		}

		return 1;
	},

	isParentOrElementHidden(element: HTMLElement): boolean {
		if (!element) {
			return false;
		}

		const computedStyle = window.getComputedStyle(element);

		if (computedStyle.display === 'none') {
			return true;
		}

		return this.isParentOrElementHidden(element.parentElement);
	},

	getViewPort(): KTViewPortType {
		return {
			width: window.innerWidth,
			height: window.innerHeight,
		};
	},

	getScrollTop() {
		return (document.scrollingElement || document.documentElement).scrollTop;
	},

	isInViewport(element: HTMLElement): boolean {
		const rect = element.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	},

	isPartiallyInViewport(element: HTMLElement): boolean {
		const x = element.getBoundingClientRect().left;
		const y = element.getBoundingClientRect().top;
		const ww = Math.max(
			document.documentElement.clientWidth,
			window.innerWidth || 0,
		);
		const hw = Math.max(
			document.documentElement.clientHeight,
			window.innerHeight || 0,
		);
		const w = element.clientWidth;
		const h = element.clientHeight;

		return y < hw && y + h > 0 && x < ww && x + w > 0;
	},

	isVisibleInParent(child: HTMLElement, parent: HTMLElement): boolean {
		const childRect = child.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();

		// Check if the child element is visible
		if (
			child.offsetParent === null ||
			getComputedStyle(child).visibility === 'hidden' ||
			getComputedStyle(child).display === 'none'
		) {
			return false;
		}

		// Check if the child is within the vertical bounds of the parent
		const isVisibleVertically =
			childRect.top >= parentRect.top && childRect.bottom <= parentRect.bottom;

		// Check if the child is within the horizontal bounds of the parent
		const isVisibleHorizontally =
			childRect.left >= parentRect.left && childRect.right <= parentRect.right;

		return isVisibleVertically && isVisibleHorizontally;
	},

	getRelativeTopPosition(child: HTMLElement, parent: HTMLElement): number {
		const childRect = child.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();

		// Calculate the relative top position
		const relativeTop = childRect.top - parentRect.top;

		return relativeTop;
	},

	getDataAttributes(element: HTMLElement, prefix: string): object {
		if (!element) {
			return {};
		}

		prefix = KTUtils.camelCase(prefix);

		const attributes: { [key: string]: KTOptionType } = {};
		const keys = Object.keys(element.dataset).filter((key) =>
			key.startsWith(prefix),
		);

		for (const key of keys) {
			let normalizedKey = key.replace(prefix, '');
			normalizedKey = KTUtils.uncapitalize(normalizedKey);
			attributes[normalizedKey] = KTUtils.parseDataAttribute(
				element.dataset[key],
			);
		}

		return attributes;
	},

	getDataAttributesByJson(element: HTMLElement, prefix: string): object {
		if (!element) {
			return {};
		}

		const attributes: { [key: string]: KTOptionType } = {};
		const keys = Object.keys(element.dataset).filter((key) =>
			key.startsWith(prefix),
		);

		for (const key of keys) {
			let normalizedKey = key.replace(prefix, '');
			normalizedKey = KTUtils.uncapitalize(normalizedKey);
			attributes[normalizedKey] = JSON.parse(element.dataset[key]);
		}

		return attributes;
	},

	ready(callback: CallableFunction): void {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				callback();
			});
		} else {
			callback();
		}
	},
};

export default KTDom;
