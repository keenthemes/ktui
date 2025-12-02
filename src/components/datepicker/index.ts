import { KTDatepicker, initDatepickers } from './datepicker';

// Attach static init method to KTDatepicker
(KTDatepicker as any).init = initDatepickers;

export { KTDatepicker };
export * from './ui/templates/templates';
export * from './config/types';