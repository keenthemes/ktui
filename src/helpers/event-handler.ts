import { KTCallableType } from '../types';
import KTUtils from './utils';

export interface KTDelegatedEventHandlersInterface {
  [key: string]: KTCallableType;
}

const KTDelegatedEventHandlers: KTDelegatedEventHandlersInterface = {};

const KTEventHandler = {
  on: function(element: HTMLElement, selector: string, eventName: string, handler: KTCallableType): string {
    if ( element === null ) {
      return null;
    }

    const eventId = KTUtils.geUID('event');

    KTDelegatedEventHandlers[eventId] = (event: Event & {target: HTMLElement}) => {
      const targets = element.querySelectorAll(selector);
      let target = event.target;

      while (target && target !== element) {
        for (let i = 0, j = targets.length; i < j; i++ ) {
          if (target === targets[i] ) {
            handler.call(this, event, target);
          }
        }

        target = target.parentNode as HTMLElement;
      }
    };

    element.addEventListener(eventName, KTDelegatedEventHandlers[eventId]);

    return eventId;
  },

  off(element: HTMLElement, eventName: string, eventId: string) {
    if (!element || KTDelegatedEventHandlers[eventId] === null) {
      return;
    }

    element.removeEventListener(eventName, KTDelegatedEventHandlers[eventId]);

    delete KTDelegatedEventHandlers[eventId];
  }
};

export default KTEventHandler;
