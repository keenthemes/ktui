import { describe, it, expect } from 'vitest';
import { stripHtml } from '../datatable-utils';

describe('stripHtml', () => {
    it('strips simple HTML tags', () => {
        expect(stripHtml('<b>hello</b>')).toBe('hello');
    });

    it('strips nested HTML tags', () => {
        expect(stripHtml('<div><span>text</span></div>')).toBe('text');
    });

    it('strips &nbsp; entities', () => {
        expect(stripHtml('no&nbsp;spaces')).toBe('nospaces');
    });

    it('strips self-closing tags', () => {
        expect(stripHtml('<img src="x"><p>text</p>')).toBe('text');
    });

    it('handles plain string without HTML', () => {
        expect(stripHtml('just text')).toBe('just text');
    });

    it('handles empty string', () => {
        expect(stripHtml('')).toBe('');
    });

    it('converts number to string', () => {
        expect(stripHtml(123)).toBe('123');
    });

    it('converts boolean to string', () => {
        expect(stripHtml(true)).toBe('true');
    });

    it('converts null to string', () => {
        expect(stripHtml(null)).toBe('null');
    });

    it('converts undefined to string', () => {
        expect(stripHtml(undefined)).toBe('undefined');
    });

    it('strips multiple tags in one string', () => {
        expect(stripHtml('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
    });

    it('handles malformed HTML', () => {
        expect(stripHtml('<div>unclosed')).toBe('unclosed');
    });
});
