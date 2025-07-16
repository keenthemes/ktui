import { KTDatepicker, initDatepickers } from './datepicker';

// Attach static init method to KTDatepicker
(KTDatepicker as any).init = initDatepickers;

export { KTDatepicker };
export * from './dropdown';
export * from './templates';
export * from './template-utils';
export * from './types';