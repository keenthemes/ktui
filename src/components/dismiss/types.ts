export declare type KTDismissModeType = 'remove' | 'hide';

export interface KTDismissConfigInterface {
	hiddenClass: string;
	target: string;
	interrupt: boolean;
	mode?: KTDismissModeType;
}

export interface KTDismissInterface {	
	dismiss(): void;	
}