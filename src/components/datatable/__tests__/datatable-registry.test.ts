import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDataTableRegistry } from '../datatable-registry';
import KTData from '../../../helpers/data';

vi.mock('../../../helpers/data', () => ({
	default: { remove: vi.fn() },
}));

function createMockInstance() {
	return {
		dispose: vi.fn(),
	};
}

describe('createDataTableRegistry', () => {
	let registry: ReturnType<typeof createDataTableRegistry>;

	beforeEach(() => {
		registry = createDataTableRegistry();
	});

	describe('register and get', () => {
		it('register() stores instance in Map, get() retrieves it', () => {
			const el = document.createElement('div');
			const instance = createMockInstance();
			registry.register(el, instance as any);
			expect(registry.get(el)).toBe(instance);
		});

		it('get() falls back to element.instance property when Map has no entry', () => {
			const el = document.createElement('div') as any;
			const instance = createMockInstance();
			el.instance = instance;
			expect(registry.get(el)).toBe(instance);
		});

		it('get() returns undefined for unregistered element', () => {
			const el = document.createElement('div');
			expect(registry.get(el)).toBeUndefined();
		});
	});

	describe('remove', () => {
		it('remove() deletes from Map and removes element.instance property', () => {
			const el = document.createElement('div') as any;
			const instance = createMockInstance();
			registry.register(el, instance as any);
			expect(el.instance).toBe(instance);

			registry.remove(el);

			expect(registry.get(el)).toBeUndefined();
			expect(el.instance).toBeUndefined();
		});

		it('remove() on non-existent element does not throw', () => {
			const el = document.createElement('div');
			expect(() => registry.remove(el)).not.toThrow();
		});
	});

	describe('clear', () => {
		it('clear() removes all entries from Map (get falls back to element.instance)', () => {
			const el1 = document.createElement('div');
			const el2 = document.createElement('div');
			const inst1 = createMockInstance();
			const inst2 = createMockInstance();
			registry.register(el1, inst1 as any);
			registry.register(el2, inst2 as any);

			registry.clear();

			// get() falls back to element.instance property set by register()
			// so we need to also delete that to verify Map was truly cleared
			delete (el1 as any).instance;
			delete (el2 as any).instance;
			expect(registry.get(el1)).toBeUndefined();
			expect(registry.get(el2)).toBeUndefined();
		});
	});

	describe('createAll', () => {
		it('createAll() finds [data-kt-datatable="true"] elements and creates instances', () => {
			const table1 = document.createElement('div');
			table1.setAttribute('data-kt-datatable', 'true');
			const table2 = document.createElement('div');
			table2.setAttribute('data-kt-datatable', 'true');
			document.body.appendChild(table1);
			document.body.appendChild(table2);

			const factory = vi.fn(() => createMockInstance());
			registry.createAll(factory);

			expect(factory).toHaveBeenCalledTimes(2);
			expect(registry.get(table1)).toBeDefined();
			expect(registry.get(table2)).toBeDefined();
		});

		it('createAll() skips elements with datatable-initialized class', () => {
			const table = document.createElement('div');
			table.setAttribute('data-kt-datatable', 'true');
			table.classList.add('datatable-initialized');
			document.body.appendChild(table);

			const factory = vi.fn(() => createMockInstance());
			registry.createAll(factory);

			// Note: The code checks hasAttribute('data-kt-datatable') AND !classList.contains('datatable-initialized')
			// But the condition is: if (element.hasAttribute('data-kt-datatable') && !element.classList.contains('datatable-initialized'))
			// Since the element DOES have the attribute AND does NOT have the class... wait, it DOES have the class.
			// So it should skip.
			// Actually re-reading the code: the forEach iterates ALL elements matching [data-kt-datatable="true"]
			// Then inside: if (element.hasAttribute('data-kt-datatable') && !element.classList.contains('datatable-initialized'))
			// The element has both the attribute and the class, so the condition is false => skip
			expect(factory).not.toHaveBeenCalled();
		});

		it('createAll() does nothing when document is undefined (guard)', () => {
			const originalDoc = globalThis.document;
			// @ts-ignore
			delete globalThis.document;
			const factory = vi.fn(() => createMockInstance());
			registry.createAll(factory);
			expect(factory).not.toHaveBeenCalled();
			globalThis.document = originalDoc;
		});
	});

	describe('reinit', () => {
		it('reinit() disposes existing instances, removes KTData, clears registry, then createAll', () => {
			const table = document.createElement('div');
			table.setAttribute('data-kt-datatable', 'true');
			document.body.appendChild(table);

			const instance = createMockInstance();
			registry.register(table, instance as any);

			const factory = vi.fn(() => createMockInstance());
			registry.reinit(factory);

			expect(instance.dispose).toHaveBeenCalled();
			expect(KTData.remove).toHaveBeenCalledWith(table, 'datatable');
			expect(factory).toHaveBeenCalled();
		});

		it('reinit() handles per-element dispose errors gracefully', () => {
			const table = document.createElement('div');
			table.setAttribute('data-kt-datatable', 'true');
			document.body.appendChild(table);

			const instance = {
				dispose: vi.fn(() => {
					throw new Error('dispose error');
				}),
			};
			registry.register(table, instance as any);

			const factory = vi.fn(() => createMockInstance());
			expect(() => registry.reinit(factory)).not.toThrow();
		});

		it('reinit() does nothing when document is undefined', () => {
			const originalDoc = globalThis.document;
			// @ts-ignore
			delete globalThis.document;
			const factory = vi.fn(() => createMockInstance());
			registry.reinit(factory);
			expect(factory).not.toHaveBeenCalled();
			globalThis.document = originalDoc;
		});
	});
});
