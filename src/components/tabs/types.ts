export interface KTTabsConfigInterface {
	hiddenClass: string
}

export interface KTTabsInterface {		
	show(tabElement: HTMLElement): void;
	isShown(tabElement: HTMLElement): boolean;
}