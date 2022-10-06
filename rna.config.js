/**
 * @type {import('@chialab/rna-config-loader').ProjectConfig}
 */
const config = {
    entrypoints: [
        {
            input: 'src/index.ts',
            output: 'dist/esm/synapse.js',
            format: 'esm',
            platform: 'browser',
        },
        {
            input: 'src/index.ts',
            output: 'dist/node/synapse.js',
            format: 'esm',
            platform: 'node',
        },
        {
            input: 'src/index.ts',
            output: 'dist/cjs/synapse.cjs',
            format: 'cjs',
            platform: 'node',
        },
    ],
    minify: true,
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxModule: '@chialab/dna',
};

export default config;
