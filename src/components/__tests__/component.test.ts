import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KTComponent from '../component';
import KTData from '../../helpers/data';

class TestComponent extends KTComponent {
	protected _name = 'test';
	protected _defaultConfig = {};
	protected _config = {};

	constructor(element: HTMLElement | null) {
		super();
		this._init(element);
	}

	public testFireEvent(eventType: string, payload?: object | null) {
		return this._fireEvent(eventType, payload);
	}

	public testDispatchEvent(eventType: string, payload?: object | null) {
		this._dispatchEvent(eventType, payload);
	}

	public testGetOption(name: string) {
		return this._getOption(name);
	}

	public testBuildConfig(config: object = {}) {
		this._buildConfig(config);
	}

	public testMergeConfig(config: object) {
		this._mergeConfig(config);
	}

	public testGetGlobalConfig() {
		return this._getGlobalConfig();
	}

	public testShouldSkipInit(element: HTMLElement) {
		return this._shouldSkipInit(element);
	}
}

describe('KTComponent', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	describe('constructor / _init', () => {
		it('stores element and generates namespace', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			expect(comp.getElement()).toBe(el);
		});

		it('sets data-kt-test-initialized attribute on element', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			new TestComponent(el);
			expect(el.getAttribute('data-kt-test-initialized')).toBe('true');
		});

		it('stores instance in KTData', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			expect(KTData.get(el, 'test')).toBe(comp);
		});

		it('handles null element gracefully', () => {
			const comp = new TestComponent(null);
			expect(comp.getElement()).toBeNull();
		});
	});

	describe('dispose', () => {
		it('removes initialized attribute from element', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			comp.dispose();
			expect(el.hasAttribute('data-kt-test-initialized')).toBe(false);
		});

		it('removes instance from KTData', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			comp.dispose();
			expect(KTData.get(el, 'test')).toBeNull();
		});

		it('does nothing when element is null', () => {
			const comp = new TestComponent(null);
			expect(() => comp.dispose()).not.toThrow();
		});
	});

	describe('on / _fireEvent', () => {
		it('registers and fires event handler', async () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const handler = vi.fn();

			comp.on('myEvent', handler);
			await comp.testFireEvent('myEvent', { data: 123 });
			expect(handler).toHaveBeenCalledWith({ data: 123 });
		});

		it('returns unique eventId from on()', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);

			const id1 = comp.on('evt', () => {});
			const id2 = comp.on('evt', () => {});
			expect(id1).not.toBe(id2);
		});

		it('fires multiple handlers for the same event', async () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const h1 = vi.fn();
			const h2 = vi.fn();

			comp.on('evt', h1);
			comp.on('evt', h2);
			await comp.testFireEvent('evt');
			expect(h1).toHaveBeenCalled();
			expect(h2).toHaveBeenCalled();
		});

		it('does not throw when no handlers registered', async () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			await expect(comp.testFireEvent('nonexistent')).resolves.not.toThrow();
		});

		it('calls handlers with null when no payload', async () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const handler = vi.fn();

			comp.on('evt', handler);
			await comp.testFireEvent('evt');
			expect(handler).toHaveBeenCalledWith(null);
		});
	});

	describe('off', () => {
		it('removes a specific event handler', async () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const handler = vi.fn();

			const id = comp.on('evt', handler);
			comp.off('evt', id);
			await comp.testFireEvent('evt');
			expect(handler).not.toHaveBeenCalled();
		});

		it('does not throw when removing non-existent handler', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			expect(() => comp.off('evt', 'nonexistent-id')).not.toThrow();
		});
	});

	describe('_dispatchEvent', () => {
		it('dispatches CustomEvent on element', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const listener = vi.fn();
			el.addEventListener('kt.test.myEvent', listener);

			comp.testDispatchEvent('kt.test.myEvent', { foo: 'bar' });
			expect(listener).toHaveBeenCalled();
			const event = listener.mock.calls[0][0] as CustomEvent;
			expect(event.detail).toEqual({ payload: { foo: 'bar' } });
			expect(event.bubbles).toBe(true);
		});

		it('does not throw when element is null', () => {
			const comp = new TestComponent(null);
			expect(() =>
				comp.testDispatchEvent('kt.test.evt'),
			).not.toThrow();
		});

		it('dispatches with null payload when not provided', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			const listener = vi.fn();
			el.addEventListener('kt.test.evt', listener);

			comp.testDispatchEvent('kt.test.evt');
			expect(listener).toHaveBeenCalled();
			const event = listener.mock.calls[0][0] as CustomEvent;
			expect(event.detail).toEqual({ payload: null });
		});
	});

	describe('getElement', () => {
		it('returns element', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			expect(comp.getElement()).toBe(el);
		});

		it('returns null when not initialized', () => {
			const comp = new TestComponent(null);
			expect(comp.getElement()).toBeNull();
		});
	});

	describe('_shouldSkipInit', () => {
		it('returns false when element has no existing instance', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(document.createElement('span'));
			expect(comp.testShouldSkipInit(el)).toBe(false);
		});

		it('returns true when element has existing instance and is connected', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			new TestComponent(el); // first init
			const comp2 = new TestComponent(document.createElement('span'));
			expect(comp2.testShouldSkipInit(el)).toBe(true);
		});

		it('returns false when element has existing instance but is disconnected', () => {
			const el = document.createElement('div');
			// Don't append to document — element is disconnected
			const comp1 = new TestComponent(el);
			const comp2 = new TestComponent(document.createElement('span'));
			// The old instance should be disposed, so this returns false (allowing reinit)
			expect(comp2.testShouldSkipInit(el)).toBe(false);
		});
	});

	describe('_getOption', () => {
		it('returns config value', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._config = { myOption: 'value' };
			expect(comp.testGetOption('myOption')).toBe('value');
		});

		it('returns undefined for missing option', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._config = {};
			expect(comp.testGetOption('missing')).toBeUndefined();
		});
	});

	describe('_buildConfig', () => {
		it('merges default config, global config, data attributes, and passed config', () => {
			const el = document.createElement('div');
			el.setAttribute('data-kt-test-foo', 'bar');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._defaultConfig = { defaultOpt: 1 };

			window.KTGlobalComponentsConfig = {
				test: { globalOpt: 2 },
			};

			comp.testBuildConfig({ extraOpt: 3 });
			const config = (comp as any)._config;
			expect(config.defaultOpt).toBe(1);
			expect(config.globalOpt).toBe(2);
			expect(config.foo).toBe('bar');
			expect(config.extraOpt).toBe(3);

			delete (window as any).KTGlobalComponentsConfig;
		});

		it('does nothing when element is null', () => {
			const comp = new TestComponent(null);
			expect(() => comp.testBuildConfig()).not.toThrow();
		});
	});

	describe('_mergeConfig', () => {
		it('merges config into existing _config', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._config = { a: 1 };
			comp.testMergeConfig({ b: 2 });
			expect((comp as any)._config).toEqual({ a: 1, b: 2 });
		});

		it('does nothing for empty config', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._config = { a: 1 };
			comp.testMergeConfig({});
			expect((comp as any)._config).toEqual({ a: 1 });
		});

		it('does nothing for null config', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			(comp as any)._config = { a: 1 };
			comp.testMergeConfig(null as unknown as object);
			expect((comp as any)._config).toEqual({ a: 1 });
		});
	});

	describe('_getGlobalConfig', () => {
		it('returns global config for component name', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			window.KTGlobalComponentsConfig = {
				test: { global: true },
			};
			expect(comp.testGetGlobalConfig()).toEqual({ global: true });
			delete (window as any).KTGlobalComponentsConfig;
		});

		it('returns empty object when no global config', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const comp = new TestComponent(el);
			delete (window as any).KTGlobalComponentsConfig;
			expect(comp.testGetGlobalConfig()).toEqual({});
		});
	});
});
