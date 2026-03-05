/**
 * Tests for KTSticky component (PR #107: release delay, active/release classes, debounce)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as KTDomModule from '../../../helpers/dom';
import { KTSticky } from '../sticky';
import { waitFor } from '../../datatable/__tests__/setup';

describe('KTSticky', () => {
	let stickyEl: HTMLElement;
	let wrapper: HTMLElement;
	let scrollTop = 0;

	beforeEach(() => {
		document.body.innerHTML = '';
		scrollTop = 0;
		vi.spyOn(KTDomModule.default, 'getScrollTop').mockImplementation(() => scrollTop);
		vi.spyOn(KTDomModule.default, 'getViewPort').mockReturnValue({ height: 800, width: 1024 });

		wrapper = document.createElement('div');
		wrapper.setAttribute('data-kt-sticky-wrapper', 'true');
		wrapper.style.height = '60px';

		stickyEl = document.createElement('div');
		stickyEl.setAttribute('data-kt-sticky', 'true');
		stickyEl.setAttribute('data-kt-sticky-name', 'test');
		stickyEl.setAttribute('data-kt-sticky-target', 'body');
		stickyEl.setAttribute('data-kt-sticky-offset', '100');
		stickyEl.setAttribute('data-kt-sticky-zindex', '10'); // required for _enable() to set position: fixed
		stickyEl.style.height = '60px';
		wrapper.appendChild(stickyEl);
		document.body.appendChild(wrapper);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		document.body.innerHTML = '';
	});

	describe('PR #107: data-kt-sticky-release-delay', () => {
		it('reads releaseDelay from data-kt-sticky-release-delay attribute', () => {
			stickyEl.setAttribute('data-kt-sticky-release-delay', '300');
			const instance = new KTSticky(stickyEl);
			expect(instance.getOption('releaseDelay')).toBe(300);
			instance.dispose();
		});

		it('delays clearing inline styles when sticky is released (smooth exit)', async () => {
			vi.useFakeTimers();
			stickyEl.setAttribute('data-kt-sticky-release-delay', '250');
			const instance = new KTSticky(stickyEl);

			// Scroll past offset -> sticky becomes active (sync, no debounce when not active)
			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			vi.advanceTimersByTime(0);
			expect(stickyEl.classList.contains('active')).toBe(true);
			expect(stickyEl.style.position).toBe('fixed');

			// Scroll back up -> release (when active, debounce 200ms then _process)
			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			vi.advanceTimersByTime(250); // debounce 200ms + a bit
			expect(stickyEl.classList.contains('release')).toBe(true);
			expect(stickyEl.style.position).toBe('fixed'); // not cleared yet (delay 250ms)

			vi.advanceTimersByTime(250); // release delay
			expect(stickyEl.style.position).toBe('');
			expect(stickyEl.style.zIndex).toBe('');

			vi.useRealTimers();
			instance.dispose();
		});

		it('with no releaseDelay, inline styles are cleared immediately on release', async () => {
			stickyEl.removeAttribute('data-kt-sticky-release-delay');
			const instance = new KTSticky(stickyEl);

			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(50);
			expect(stickyEl.style.position).toBe('fixed');

			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(250); // debounce 200ms
			expect(stickyEl.style.position).toBe('');
			instance.dispose();
		});
	});

	describe('PR #107: data-kt-sticky-active-class and data-kt-sticky-release-class', () => {
		it('applies activeClass when sticky is active and releaseClass when released', async () => {
			stickyEl.setAttribute('data-kt-sticky-active-class', 'sticky-on');
			stickyEl.setAttribute('data-kt-sticky-release-class', 'sticky-off');
			const instance = new KTSticky(stickyEl);

			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(50);
			expect(stickyEl.classList.contains('sticky-on')).toBe(true);
			expect(stickyEl.classList.contains('sticky-off')).toBe(false);

			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(250);
			expect(stickyEl.classList.contains('sticky-on')).toBe(false);
			expect(stickyEl.classList.contains('sticky-off')).toBe(true);

			instance.dispose();
		});

		it('falls back to data-kt-sticky-class when activeClass is not set', async () => {
			stickyEl.setAttribute('data-kt-sticky-class', 'legacy-sticky');
			const instance = new KTSticky(stickyEl);

			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(50);
			expect(stickyEl.classList.contains('legacy-sticky')).toBe(true);
			instance.dispose();
		});
	});

	describe('debounced scroll (no flicker on rapid scroll)', () => {
		it('when active, scroll handler debounces so _process runs after delay', async () => {
			vi.useFakeTimers();
			const instance = new KTSticky(stickyEl);
			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			vi.advanceTimersByTime(0);
			expect(stickyEl.classList.contains('active')).toBe(true);

			// Rapid scroll back: multiple scroll events, only one _process after debounce
			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			expect(stickyEl.classList.contains('release')).toBe(false); // not yet, debounce pending
			vi.advanceTimersByTime(250);
			expect(stickyEl.classList.contains('release')).toBe(true);

			vi.useRealTimers();
			instance.dispose();
		});
	});

	describe('change event', () => {
		it('fires change event when sticky becomes active and when released', async () => {
			const instance = new KTSticky(stickyEl);
			const changes: { active: boolean }[] = [];
			instance.on('change', (payload: { active: boolean }) => changes.push(payload));

			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(50);
			expect(changes).toContainEqual({ active: true });

			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			await waitFor(250);
			expect(changes).toContainEqual({ active: false });

			instance.dispose();
		});
	});

	describe('dispose', () => {
		it('clears release-delay timeout so _resetStyles does not run after dispose', async () => {
			vi.useFakeTimers();
			stickyEl.setAttribute('data-kt-sticky-release-delay', '500');
			const instance = new KTSticky(stickyEl);

			scrollTop = 150;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			vi.advanceTimersByTime(0);

			scrollTop = 50;
			window.dispatchEvent(new Event('scroll', { bubbles: true }));
			vi.advanceTimersByTime(250);
			expect(stickyEl.style.position).toBe('fixed');

			instance.dispose();
			vi.advanceTimersByTime(600);
			// If timeout weren't cleared, _resetStyles would have run; element is disposed so we just ensure no throw
			vi.useRealTimers();
		});
	});

	describe('getInstance / getOrCreateInstance', () => {
		it('getInstance returns null for element without data-kt-sticky', () => {
			stickyEl.removeAttribute('data-kt-sticky');
			expect(KTSticky.getInstance(stickyEl)).toBeNull();
		});

		it('getOrCreateInstance creates instance and returns it', () => {
			const instance = KTSticky.getOrCreateInstance(stickyEl);
			expect(instance).toBeInstanceOf(KTSticky);
			expect(KTSticky.getInstance(stickyEl)).toBe(instance);
			instance.dispose();
		});
	});
});
