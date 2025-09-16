/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
declare global {
    interface Window {
        KTGlobalComponentsConfig: object;
    }
}
import { KTOptionType } from '../types';
export default class KTComponent {
    protected _dataOptionPrefix: string;
    protected _name: string;
    protected _defaultConfig: object;
    protected _config: object;
    protected _events: Map<string, Map<string, CallableFunction>>;
    protected _uid: string | null;
    protected _element: HTMLElement | null;
    protected _init(element: HTMLElement | null): void;
    protected _fireEvent(eventType: string, payload?: object | null): Promise<void>;
    protected _dispatchEvent(eventType: string, payload?: object | null): void;
    protected _getOption(name: string): KTOptionType;
    protected _getGlobalConfig(): object;
    protected _buildConfig(config?: object): void;
    dispose(): void;
    on(eventType: string, callback: CallableFunction): string;
    off(eventType: string, eventId: string): void;
    getOption(name: string): KTOptionType;
    getElement(): HTMLElement | null;
}
//# sourceMappingURL=component.d.ts.map