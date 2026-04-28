import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KTContextMenu } from '../context-menu';

const mockDestroy = vi.fn();
const mockForceUpdate = vi.fn();

vi.mock('@popperjs/core', () => ({
	createPopper: vi.fn(() => ({
		destroy: mockDestroy,
		forceUpdate: mockForceUpdate,
	})),
}));

function waitForTransitions() {
	return new Promise<void>((resolve) => {
		setTimeout(() => resolve(), 5);
	});
}

function createFixture() {
	document.body.innerHTML = `
		<div id="root" data-kt-context-menu="true">
			<div id="trigger" data-kt-context-menu-trigger="true">target</div>
			<div id="menu" data-kt-context-menu-menu="true" class="kt-context-menu hidden">
				<button id="dismiss" data-kt-context-menu-dismiss="true">dismiss</button>
			</div>
		</div>
	`;

	return {
		root: document.getElementById('root') as HTMLElement,
		trigger: document.getElementById('trigger') as HTMLElement,
		menu: document.getElementById('menu') as HTMLElement,
		dismiss: document.getElementById('dismiss') as HTMLElement,
	};
}

describe('KTContextMenu', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		mockDestroy.mockClear();
		mockForceUpdate.mockClear();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('creates and retrieves an instance', () => {
		const { root } = createFixture();
		const instance = new KTContextMenu(root);
		expect(instance.getElement()).toBe(root);
		expect(KTContextMenu.getInstance(root)).toBe(instance);
	});

	it('opens from showAtEvent and prevents native menu by default', () => {
		const { root } = createFixture();
		const instance = new KTContextMenu(root);
		const event = new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			clientX: 100,
			clientY: 120,
		});
		const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
		instance.showAtEvent(event);

		expect(instance.isOpen()).toBe(true);
		expect(preventDefaultSpy).toHaveBeenCalled();
	});

	it('hide closes an open menu', async () => {
		const { root } = createFixture();
		const instance = new KTContextMenu(root);

		instance.showAt(60, 60);
		expect(instance.isOpen()).toBe(true);
		(instance as unknown as { _shownAt: number })._shownAt = Date.now() - 300;
		(instance as unknown as { _isOpen: boolean })._isOpen = true;

		instance.hide();
		await waitForTransitions();
		expect(instance.isOpen()).toBe(false);
	});

	it('toggleAtEvent toggles menu state', async () => {
		const { root } = createFixture();
		const instance = new KTContextMenu(root);

		const openEvent = new MouseEvent('contextmenu', {
			bubbles: true,
			cancelable: true,
			clientX: 30,
			clientY: 30,
		});
		instance.toggleAtEvent(openEvent);
		expect(instance.isOpen()).toBe(true);
		(instance as unknown as { _shownAt: number })._shownAt = Date.now() - 300;
		(instance as unknown as { _isOpen: boolean })._isOpen = true;

		instance.toggleAtEvent(openEvent);
		await waitForTransitions();
		expect(instance.isOpen()).toBe(false);
	});

	it('reinit rebuilds instances for existing roots', () => {
		const { root } = createFixture();
		new KTContextMenu(root);
		const first = KTContextMenu.getInstance(root);
		expect(first).not.toBeNull();

		KTContextMenu.reinit();
		const second = KTContextMenu.getInstance(root);
		expect(second).not.toBeNull();
		expect(second).not.toBe(first);
	});
});
