export interface KTAccordionConfigInterface {
	hiddenClass: string;
	activeClass: string
	expandAll: boolean;
}

export interface KTAccordionInterface {		
	show(accordionElement: HTMLElement): void;
	hide(accordionElement: HTMLElement): void;
	toggle(accordionElement: HTMLElement): void;
}