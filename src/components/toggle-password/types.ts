export interface KTTogglePasswordConfigInterface {
	permanent?: boolean
}

export interface KTTogglePasswordInterface {		
	toggle(): void;
	isVisible(): boolean;
}