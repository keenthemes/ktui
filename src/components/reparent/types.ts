export declare type KTOverlayModeType = 'drawer' | 'modal' | 'popover';

export interface KTReparentConfigInterface {
	mode: string,
	target: string
}

export interface KTReparentInterface {		
	update(): void;
}