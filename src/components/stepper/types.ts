export interface KTStepperConfigInterface {
	hiddenClass: string,
	activeStep: number
}

export interface KTStepperInterface {		
	go(step: number): void;
}