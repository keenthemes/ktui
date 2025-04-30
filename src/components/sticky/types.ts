export interface KTStickyConfigInterface {
	target: string,
	name: string,
	class: string,
	zindex: string,
	top: string,
	start: string,
	end: string,
	width: string | number | object,
	offset: number,
	reverse: boolean,
	release: string,
	activate: string
}

export interface KTStickyInterface {		
	update(): void;
}