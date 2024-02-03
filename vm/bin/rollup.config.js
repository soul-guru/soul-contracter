import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'bundle.ts',
	output: {
		// dir: 'output',
		file: "sys.js",
		// format: 'iife',
	},

	plugins: [ typescript(), nodeResolve(), commonjs()]
};