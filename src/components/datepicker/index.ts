import { KTDatepicker, initDatepickers } from './datepicker';

// Attach static init method to KTDatepicker
(KTDatepicker as any).init = initDatepickers;

export { KTDatepicker };
export * from './templates';
export * from './types';