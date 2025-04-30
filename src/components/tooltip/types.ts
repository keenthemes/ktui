export declare type KTTooltipTriggerType = 'hover' | 'click' | 'focus';

export interface KTTooltipConfigInterface {
	hiddenClass: string;
	target: string;
	trigger: string,
	container: string,
	placement: string,
	placementRtl: string,
	strategy: string,
	permanent: boolean,
	offset: string,
	offsetRtl: string,
	delayShow: number,
	delayHide: number,
	zindex: string,
}

export interface KTTooltipInterface {		
	show(): void;
	hide(): void;
	toggle(): void;
}