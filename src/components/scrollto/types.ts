export interface KTScrolltoConfigInterface {
	smooth: boolean,
	parent: string,
	target: string,
  offset: number
}

export interface KTScrolltoInterface {	
	scroll(): void;	
}