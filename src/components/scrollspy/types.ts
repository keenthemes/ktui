export interface KTScrollspyConfigInterface {
	target: string,
	smooth: boolean,
	offset: number
}

export interface KTScrollspyInterface {	
	update(anchorElement: HTMLElement, event: Event): void;	
	scrollTo(anchorElement: HTMLElement): void;
}