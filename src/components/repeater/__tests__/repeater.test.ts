/**
 * Tests for KTRepeater component
 */

import { describe, it, expect, afterEach } from 'vitest';
import { KTRepeater } from '../repeater';

function createFixture(options?: {
	withInitialChild?: boolean;
	limit?: number;
	hiddenTemplate?: boolean;
	withDeleteInTarget?: boolean;
}) {
	document.body.innerHTML = '';
	const container = document.createElement('div');
	container.id = 'repeater-test-container';

	const wrapper = document.createElement('div');
	wrapper.id = 'repeater-wrapper';
	wrapper.className = 'space-y-3';
	container.appendChild(wrapper);

	const target = document.createElement('div');
	target.id = 'repeater-target';
	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Enter Name';
	target.appendChild(input);
	if (options?.withDeleteInTarget) {
		const removeBtn = document.createElement('span');
		removeBtn.setAttribute('data-kt-repeater-delete', '');
		removeBtn.className = 'remove-btn';
		target.appendChild(removeBtn);
	}

	if (options?.hiddenTemplate) {
		const hidden = document.createElement('div');
		hidden.id = 'repeater-template-container';
		hidden.className = 'hidden';
		hidden.style.display = 'none';
		hidden.appendChild(target);
		container.appendChild(hidden);
	} else if (options?.withInitialChild !== false) {
		wrapper.appendChild(target);
	}

	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.setAttribute('data-kt-repeater', '');
	trigger.setAttribute('data-kt-repeater-target', '#repeater-target');
	trigger.setAttribute('data-kt-repeater-wrapper', '#repeater-wrapper');
	if (options?.limit != null) {
		trigger.setAttribute('data-kt-repeater-limit', String(options.limit));
	}
	trigger.textContent = 'Add';
	container.appendChild(trigger);

	document.body.appendChild(container);
	return { container, wrapper, target, trigger };
}

describe('KTRepeater', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('initialization', () => {
		it('initializes on trigger element with data-kt-repeater and valid target/wrapper', () => {
			const { trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			expect(instance).toBeInstanceOf(KTRepeater);
			expect(instance.getElement()).toBe(trigger);
			instance.dispose();
		});

		it('reads target, wrapper, limit from data attributes', () => {
			const { trigger } = createFixture({ limit: 5 });
			const instance = new KTRepeater(trigger);
			expect(instance.getOption('target')).toBe('#repeater-target');
			expect(instance.getOption('wrapper')).toBe('#repeater-wrapper');
			expect(Number(instance.getOption('limit'))).toBe(5);
			instance.dispose();
		});

		it('does not double-initialize when constructor called twice on same trigger', () => {
			const { trigger, wrapper } = createFixture();
			new KTRepeater(trigger);
			new KTRepeater(trigger);
			expect(KTRepeater.getInstance(trigger)).not.toBeNull();
			KTRepeater.getInstance(trigger)!.add();
			expect(wrapper.children.length).toBe(2);
			KTRepeater.getInstance(trigger)!.dispose();
		});

		it('accepts config object when wrapper has no id (config overrides)', () => {
			const { trigger, wrapper } = createFixture();
			wrapper.id = 'custom-wrapper';
			trigger.removeAttribute('data-kt-repeater-wrapper');
			const instance = new KTRepeater(trigger, {
				target: '#repeater-target',
				wrapper: '#custom-wrapper',
				limit: 0,
			});
			expect(instance).toBeInstanceOf(KTRepeater);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			instance.dispose();
		});
	});

	describe('add behavior', () => {
		it('clones target into wrapper when trigger is clicked', () => {
			const { wrapper, trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			expect(wrapper.children.length).toBe(1);
			trigger.click();
			expect(wrapper.children.length).toBe(2);
			trigger.click();
			expect(wrapper.children.length).toBe(3);
			instance.dispose();
		});

		it('add() method has the same effect as clicking the trigger', () => {
			const { wrapper, trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			expect(wrapper.children.length).toBe(1);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			instance.add();
			expect(wrapper.children.length).toBe(3);
			instance.dispose();
		});

		it('fires add event with cloned element in payload', () => {
			const { trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			const addedElements: HTMLElement[] = [];
			instance.on('add', (payload: { element: HTMLElement }) => {
				addedElements.push(payload.element);
			});
			instance.add();
			instance.add();
			expect(addedElements.length).toBe(2);
			expect(addedElements[0]).toBeInstanceOf(HTMLElement);
			expect(addedElements[0].querySelector('input')).not.toBeNull();
			instance.dispose();
		});

		it('dispatches DOM add event with detail.payload.element', () => {
			const { trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			const events: CustomEvent[] = [];
			trigger.addEventListener('add', ((e: Event) =>
				events.push(e as CustomEvent)) as EventListener);
			instance.add();
			expect(events.length).toBe(1);
			expect(events[0].detail?.payload?.element).toBeInstanceOf(HTMLElement);
			instance.dispose();
		});
	});

	describe('limit', () => {
		it('does not add more clones when at limit', () => {
			const { trigger } = createFixture({ limit: 2 });
			const instance = new KTRepeater(trigger);
			expect(wrapper.children.length).toBe(1);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			trigger.click();
			expect(wrapper.children.length).toBe(2);
			instance.dispose();
		});

		it('disables trigger when at limit', () => {
			const { trigger } = createFixture({ limit: 2 });
			const instance = new KTRepeater(trigger);
			expect(trigger.hasAttribute('disabled')).toBe(false);
			instance.add();
			expect(trigger.hasAttribute('disabled')).toBe(true);
			instance.dispose();
		});

		it('re-enables trigger when a clone is removed (delete) and count drops below limit', () => {
			const { wrapper, trigger } = createFixture({
				limit: 2,
				withDeleteInTarget: true,
			});
			const instance = new KTRepeater(trigger);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			expect(trigger.hasAttribute('disabled')).toBe(true);
			const secondClone = wrapper.children[1];
			const deleteBtn = secondClone.querySelector('[data-kt-repeater-delete]');
			expect(deleteBtn).not.toBeNull();
			(deleteBtn as HTMLElement).click();
			expect(wrapper.children.length).toBe(1);
			expect(trigger.hasAttribute('disabled')).toBe(false);
			instance.dispose();
		});

		it('allows unlimited clones when limit is 0 or omitted', () => {
			const { trigger } = createFixture();
			trigger.removeAttribute('data-kt-repeater-limit');
			const instance = new KTRepeater(trigger);
			for (let i = 0; i < 5; i++) instance.add();
			expect(wrapper.children.length).toBe(6);
			instance.dispose();
		});
	});

	describe('delete', () => {
		it('removes clone when clicking element with data-kt-repeater-delete', () => {
			const { wrapper, trigger } = createFixture({ withDeleteInTarget: true });
			const instance = new KTRepeater(trigger);
			instance.add();
			expect(wrapper.children.length).toBe(2);
			const firstClone = wrapper.children[1];
			const deleteBtn = firstClone.querySelector(
				'[data-kt-repeater-delete]',
			) as HTMLElement;
			deleteBtn.click();
			expect(wrapper.children.length).toBe(1);
			instance.dispose();
		});

		it('does not remove the last row (keeps at least one for template)', () => {
			const { wrapper, trigger } = createFixture({ withDeleteInTarget: true });
			const instance = new KTRepeater(trigger);
			expect(wrapper.children.length).toBe(1);
			const onlyRow = wrapper.children[0];
			const deleteBtn = onlyRow.querySelector(
				'[data-kt-repeater-delete]',
			) as HTMLElement;
			deleteBtn.click();
			expect(wrapper.children.length).toBe(1);
			instance.dispose();
		});
	});

	describe('predefined (hidden) template', () => {
		it('clones from hidden template and appends to wrapper', () => {
			const { wrapper, trigger } = createFixture({
				hiddenTemplate: true,
				withInitialChild: false,
			});
			expect(wrapper.children.length).toBe(0);
			const instance = new KTRepeater(trigger);
			instance.add();
			expect(wrapper.children.length).toBe(1);
			expect(
				wrapper.querySelector('input[placeholder="Enter Name"]'),
			).not.toBeNull();
			instance.dispose();
		});
	});

	describe('getInstance and static methods', () => {
		it('getInstance returns null for element without data-kt-repeater', () => {
			const { trigger } = createFixture();
			trigger.removeAttribute('data-kt-repeater');
			expect(KTRepeater.getInstance(trigger)).toBeNull();
		});

		it('getInstance returns instance for initialized trigger', () => {
			const { trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			expect(KTRepeater.getInstance(trigger)).toBe(instance);
			instance.dispose();
		});

		it('getOrCreateInstance returns existing instance or creates new one', () => {
			const { trigger } = createFixture();
			const a = KTRepeater.getOrCreateInstance(trigger);
			const b = KTRepeater.getOrCreateInstance(trigger);
			expect(a).toBe(b);
			a.dispose();
		});

		it('createInstances initializes all data-kt-repeater elements', () => {
			const { container, trigger } = createFixture();
			const trigger2 = document.createElement('button');
			trigger2.setAttribute('data-kt-repeater', '');
			trigger2.setAttribute('data-kt-repeater-target', '#repeater-target');
			trigger2.setAttribute('data-kt-repeater-wrapper', '#repeater-wrapper');
			container.appendChild(trigger2);
			KTRepeater.createInstances();
			expect(KTRepeater.getInstance(trigger)).not.toBeNull();
			expect(KTRepeater.getInstance(trigger2)).not.toBeNull();
			KTRepeater.getInstance(trigger)!.dispose();
			KTRepeater.getInstance(trigger2)!.dispose();
		});

		it('init calls createInstances', () => {
			const { trigger } = createFixture();
			KTRepeater.init();
			expect(KTRepeater.getInstance(trigger)).not.toBeNull();
			KTRepeater.getInstance(trigger)!.dispose();
		});
	});

	describe('dispose', () => {
		it('removes listeners and allows re-initialization', () => {
			const { wrapper, trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			instance.dispose();
			const instance2 = new KTRepeater(trigger);
			instance2.add();
			expect(wrapper.children.length).toBe(2);
			instance2.dispose();
		});

		it('dispose is idempotent', () => {
			const { trigger } = createFixture();
			const instance = new KTRepeater(trigger);
			instance.dispose();
			expect(() => instance.dispose()).not.toThrow();
		});
	});
});
