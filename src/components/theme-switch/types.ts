export declare type KTThemeSwitchModeType = 'light' | 'dark' | 'system';

export interface KTThemeSwitchConfigInterface {
	mode: KTThemeSwitchModeType;
}

export interface KTThemeSwitchInterface {
	setMode(mode: KTThemeSwitchModeType): void;
	getMode(): KTThemeSwitchModeType;
}
