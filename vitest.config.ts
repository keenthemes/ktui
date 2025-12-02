/**
 * Vitest configuration for KTUI component library
 *
 * - Test files should be named `*.test.ts` and placed next to the source files (colocated).
 * - Uses jsdom for DOM environment simulation.
 * - See README for more details on running tests.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});