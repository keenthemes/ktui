/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

export interface KTStepperConfigInterface {
	hiddenClass: string;
	activeStep: number;
}

export interface KTStepperInterface {
	go(step: number): void;
}
