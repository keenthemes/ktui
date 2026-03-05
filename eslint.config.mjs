import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
	{ ignores: ['dist/**', 'lib/**', 'node_modules/**'] },
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		plugins: { prettier },
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'no-empty': ['warn', { allowEmptyCatch: true }],
			'no-case-declarations': 'warn',
		},
	},
];
