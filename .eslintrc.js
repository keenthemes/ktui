module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		project: ['./tsconfig.json', './tsconfig.lib.json', './tsconfig.esm.json'],
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier',
	],
	rules: {
		// TypeScript specific rules
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-non-null-assertion': 'warn',
		'@typescript-eslint/prefer-const': 'error',
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
	env: {
		browser: true,
		es2020: true,
		node: true,
	},
	ignorePatterns: [
		'node_modules/',
		'dist/',
		'lib/',
		'*.min.js',
		'webpack.config.js',
	],
};
