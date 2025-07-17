// alert.basic.test.ts - Basic instantiation and type safety tests for KTAlert
import { describe, it, expect } from 'vitest';
import { KTAlert } from '../alert';

describe('KTAlert', () => {
  it('should instantiate without errors', () => {
    // Create a dummy element
    const el = document.createElement('div');
    // Instantiate KTAlert
    const alert = new KTAlert(document.createElement("div"));
    // Should be defined
    expect(alert).toBeDefined();
    // Should have correct name
    expect((alert as any)._name).toBe('alert');
  });
});