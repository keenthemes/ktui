const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');

module.exports = [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				project: ['./tsconfig.json', './tsconfig.lib.json', './tsconfig.esm.json'],
				tsconfigRootDir: __dirname,
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				HTMLElement: 'readonly',
				HTMLInputElement: 'readonly',
				HTMLButtonElement: 'readonly',
				HTMLSelectElement: 'readonly',
				HTMLTableElement: 'readonly',
				HTMLTableSectionElement: 'readonly',
				HTMLOptionElement: 'readonly',
				CustomEvent: 'readonly',
				Event: 'readonly',
				KeyboardEvent: 'readonly',
				MouseEvent: 'readonly',
				Map: 'readonly',
				Set: 'readonly',
				Promise: 'readonly',
				Date: 'readonly',
				Math: 'readonly',
				JSON: 'readonly',
				Error: 'readonly',
				TypeError: 'readonly',
				RangeError: 'readonly',
				ReferenceError: 'readonly',
				SyntaxError: 'readonly',
				URIError: 'readonly',
				EvalError: 'readonly',
				parseInt: 'readonly',
				parseFloat: 'readonly',
				isNaN: 'readonly',
				isFinite: 'readonly',
				decodeURI: 'readonly',
				decodeURIComponent: 'readonly',
				encodeURI: 'readonly',
				encodeURIComponent: 'readonly',
				escape: 'readonly',
				unescape: 'readonly',
				Object: 'readonly',
				Array: 'readonly',
				Boolean: 'readonly',
				Number: 'readonly',
				String: 'readonly',
				RegExp: 'readonly',
				Function: 'readonly',
				Symbol: 'readonly',
				BigInt: 'readonly',
				WeakMap: 'readonly',
				WeakSet: 'readonly',
				Proxy: 'readonly',
				Reflect: 'readonly',
				Intl: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			prettier: prettier,
		},
		rules: {
			// TypeScript specific rules
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-inferrable-types': 'off',

			// General rules
			'no-console': 'off', // Allow console for library debugging
			'no-debugger': 'error',
			'no-unused-vars': 'off', // Handled by TypeScript version
			'prefer-const': 'error',
			'no-var': 'error',

			// Prettier integration
			'prettier/prettier': 'error',
		},
	},
	{
		ignores: [
			'node_modules/',
			'dist/',
			'lib/',
			'*.min.js',
			'webpack.config.js',
			'eslint.config.js',
		],
	},
];
