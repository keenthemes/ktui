/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
import { KTOffsetType, KTViewPortType } from '../types';
declare const KTDom: {
    isRTL(): boolean;
    isElement(element: HTMLElement): boolean;
    getElement(element: HTMLElement | string): HTMLElement;
    remove(element: HTMLElement): void;
    hasClass(element: HTMLElement, className: string): boolean;
    addClass(element: HTMLElement, className: string): void;
    removeClass(element: HTMLElement, className: string): void;
    getCssProp(element: HTMLElement, prop: string): string;
    setCssProp(element: HTMLElement, prop: string, value: string): void;
    offset(element: HTMLElement): KTOffsetType;
    getIndex(element: HTMLElement): number;
    parents(element: HTMLElement, selector: string): Array<HTMLElement>;
    siblings(element: HTMLElement): Element[];
    children(element: HTMLElement, selector: string): Array<HTMLElement>;
    child(element: HTMLElement, selector: string): HTMLElement;
    isVisible(element: HTMLElement): boolean;
    isDisabled(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement): boolean;
    transitionEnd(element: HTMLElement, callback: CallableFunction): void;
    animationEnd(element: HTMLElement, callback: CallableFunction): void;
    getCSSTransitionDuration(element: HTMLElement): number;
    getCSSAnimationDuration(element: HTMLElement): number;
    reflow(element: HTMLElement): void;
    insertAfter(element: HTMLElement, referenceNode: HTMLElement): void;
    getHighestZindex(element: HTMLElement): number;
    isParentOrElementHidden(element: HTMLElement): boolean;
    getViewPort(): KTViewPortType;
    getScrollTop(): number;
    isInViewport(element: HTMLElement): boolean;
    isPartiallyInViewport(element: HTMLElement): boolean;
    isVisibleInParent(child: HTMLElement, parent: HTMLElement): boolean;
    getRelativeTopPosition(child: HTMLElement, parent: HTMLElement): number;
    getDataAttributes(element: HTMLElement, prefix: string): object;
    ready(callback: CallableFunction): void;
};
export default KTDom;
//# sourceMappingURL=dom.d.ts.map