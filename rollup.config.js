/* eslint-env node */

const path = require('path');
const env = process.env;

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

module.exports = {
    sourceMap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
    format: 'umd',
    moduleName: 'Synapse',
    entry: 'src/synapse.js',
    useStrict: false,
    globals: {
        '@dnajs/idom': 'DNA',
    },
    plugins: [
        nodeResolve(),
        commonjs({
            include: [
                'node_modules/mixwith/**',
                'node_modules/object-path/**',
            ],
        }),
        babel({
            include: [
                'node_modules/**/*.{js,jsx}',
                'src/**/*.{js,jsx}',
                'test/**/*.{js,jsx}',
            ],
            exclude: [
                'node_modules/mixwith/**',
                'node_modules/object-path/**',
            ],
        }),
        env.min === 'true' ? uglify({
            output: {
                comments: /@license/,
            },
        }) : {},
    ],
};
