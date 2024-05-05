import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import multiEntry from "rollup-plugin-multi-entry";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import json from '@rollup/plugin-json';

export default {
	input: ['src/main.ts'],
	output: {
		// dir: 'build',
		file: "bin.js",
		format: 'cjs',
		name: 'MyModule'
		// format: 'iife',
	},

	// treeshake: false,
	external: [/\.css$/],
	plugins: [ 
		// nodePolyfills(),
		json(),
		nodeResolve({ 
			preferBuiltins: false,
			browser: true
		}),
		typescript({ compilerOptions: {
			"module": "ESNext",
			// "rootDir": "./"
		}}), 
		commonjs(),
		// multiEntry()
	] 
};