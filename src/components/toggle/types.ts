export interface KTToggleConfigInterface {
	target?: string,
	activeClass?: string,
	class?: string,
	removeClass?: string,
	attribute?: string
}

export interface KTToggleInterface {		
	toggle(): void;
	update(): void;
	isActive(): boolean;
}