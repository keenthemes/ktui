export interface KTScrollableConfigInterface {
	save: boolean,
	dependencies: string,
	wrappers: string,
  offset: string,
}

export interface KTScrollableInterface {	
	update(): void;	
	getHeight(): string;
}