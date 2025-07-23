import { KTDatepicker, initDatepickers } from './datepicker';

// Attach static init method to KTDatepicker
(KTDatepicker as any).init = initDatepickers;

export { KTDatepicker };
export * from './templates/templates';
export * from './config/types';