/*
 * template-manager.test.ts - Unit tests for template manager (KTDatepicker)
 * Uses Vitest for type-safe testing of template merging logic.
 */

import { describe, it, expect } from 'vitest';
import { getMergedTemplates } from '../template-manager';

describe('getMergedTemplates', () => {
  it('merges default, config, and user templates with correct precedence', () => {
    const config = { b: 'BB', c: 'C' };
    const user = { c: 'CC', d: 'D' };
    const result = getMergedTemplates(config, user);
    expect(result).toMatchObject({ b: 'BB', c: 'CC', d: 'D' });
  });
  it('returns user templates taking highest precedence', () => {
    const config = { foo: 'bar' };
    const user = { foo: 'baz' };
    expect(getMergedTemplates(config, user).foo).toBe('baz');
  });
});