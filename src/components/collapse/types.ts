export interface KTCollapseConfigInterface {
	hiddenClass: string;
	activeClass: string;
	target: string;
}

export interface KTCollapseInterface {	
	collapse(): void;	
	expand(): void;
	isOpen(): boolean;
}