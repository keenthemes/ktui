import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('KTUI entrypoints', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.resetModules();
	});

	it('component-level import does not initialize unrelated components', async () => {
		const { KTModal } = await import('../components/modal');
		const modalInitSpy = vi.spyOn(KTModal, 'init');
		const coreModule = await import('../index');
		const componentsInitSpy = vi.spyOn(coreModule.KTComponents, 'init');

		await import('../components/toggle-password');

		expect(modalInitSpy).not.toHaveBeenCalled();
		expect(componentsInitSpy).not.toHaveBeenCalled();
	});

	it('core entrypoint import is side-effect-free', async () => {
		const domModule = await import('../helpers/dom');
		const readySpy = vi.spyOn(domModule.default, 'ready');

		const coreModule = await import('../index');
		const initSpy = vi.spyOn(coreModule.KTComponents, 'init');

		expect(readySpy).not.toHaveBeenCalled();
		expect(initSpy).not.toHaveBeenCalled();
	});

	it('init-all entrypoint initializes components explicitly', async () => {
		const domModule = await import('../helpers/dom');
		const readySpy = vi
			.spyOn(domModule.default, 'ready')
			.mockImplementation((callback) => {
				callback();
			});

		const coreModule = await import('../index');
		const initSpy = vi.spyOn(coreModule.KTComponents, 'init');

		const initAllModule = await import('../init-all');

		expect(readySpy).toHaveBeenCalledTimes(1);
		expect(initSpy).toHaveBeenCalledTimes(1);

		initAllModule.initAllComponents();
		expect(readySpy).toHaveBeenCalledTimes(2);
		expect(initSpy).toHaveBeenCalledTimes(2);
	});

	it('legacy root entrypoint preserves auto-init behavior', async () => {
		const domModule = await import('../helpers/dom');
		const readySpy = vi
			.spyOn(domModule.default, 'ready')
			.mockImplementation((callback) => {
				callback();
			});

		const coreModule = await import('../index');
		const initSpy = vi.spyOn(coreModule.KTComponents, 'init');

		const legacyModule = await import('../legacy');

		expect(initSpy).toHaveBeenCalled();
		expect(readySpy).toHaveBeenCalled();
		expect(legacyModule.default).toBe(coreModule.default);
		expect(legacyModule.KTComponents).toBe(coreModule.KTComponents);
	});
});
