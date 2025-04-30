const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
	const baseConfig = {
		mode: env.production ? 'production' : 'development',
		watch: env.production ? false : true,
		entry: {
			ktui: './src/index.ts',
			// '../index': './src/index.ts',

			// 'ktui.data': './src/helpers/data.ts',
			// 'ktui.dom': './src/helpers/dom.ts',
			// 'ktui.event-handler': './src/helpers/event-handler.ts',
			// 'ktui.utils': './src/helpers/utils.ts',

			// 'ktui.accordion': './src/components/accordion/index.ts',
			// 'ktui.collapse': './src/components/collapse/index.ts',
			// 'ktui.datatable': './src/components/datatable/index.ts',
			// 'ktui.dismiss': './src/components/dismiss/index.ts',
			// 'ktui.drawer': './src/components/drawer/index.ts',
			// 'ktui.dropdown': './src/components/dropdown/index.ts',
			// 'ktui.image-input': './src/components/image-input/index.ts',
			// 'ktui.menu': './src/components/menu/index.ts',
			// 'ktui.modal': './src/components/modal/index.ts',
			// 'ktui.reparent': './src/components/reparent/index.ts',
			// 'ktui.scrollable': './src/components/scrollable/index.ts',
			// 'ktui.scrollspy': './src/components/scrollspy/index.ts',
			// 'ktui.scrollto': './src/components/scrollto/index.ts',
			// 'ktui.stepper': './src/components/stepper/index.ts',
			// 'ktui.sticky': './src/components/sticky/index.ts',
			// 'ktui.tabs': './src/components/tabs/index.ts',
			// 'ktui.theme': './src/components/theme/index.ts',
			// 'ktui.toggle': './src/components/toggle/index.ts',
			// 'ktui.toggle-password': './src/components/toggle-password/index.ts',
			// 'ktui.tooltip': './src/components/tooltip/index.ts',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					enforce: 'pre',
					use: ['source-map-loader'],
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				},
				{
					test: /\.ts$/,
					use: [{ loader: 'ts-loader' }],
				},
			],
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js', '.jsx'],
		},
		plugins: [],
		target: ['web', 'es5'],
		optimization: {
			minimize: env.production,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						format: {
							comments: false,
						},
					},
					extractComments: false,
				}),
			],
		},
	};

	const normalConfig = {
		...baseConfig,
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].js',
			library: { type: 'umd' },
		},
		devtool: false, // Disable sourcemaps for normal JS files
		optimization: {
			...baseConfig.optimization,
			minimize: false, // Disable minimization for normal JS files
		},
		plugins: [...baseConfig.plugins, new CleanWebpackPlugin()],
	};

	const minifiedConfig = {
		...baseConfig,
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].min.js',
			sourceMapFilename: '[name].min.js.map',
			library: { type: 'umd' },
		},
		devtool: 'source-map', // Enable sourcemaps for minified JS files
		optimization: {
			...baseConfig.optimization,
			minimize: true, // Enable minimization for minified JS files
		},
	};

	return [normalConfig, minifiedConfig];
};
