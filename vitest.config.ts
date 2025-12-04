import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/components/datatable/__tests__/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/**/__tests__/**',
				'dist/',
				'lib/',
				'**/*.d.ts',
			],
		},
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['node_modules', 'dist', 'lib'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});

