/**
 * @type {import('@chialab/rna-config-loader').ProjectConfig}
 */
const config = {
    entrypoints: [
        {
            input: 'src/index.ts',
            output: 'dist/esm/synapse.js',
            format: 'esm',
            minify: true,
            platform: 'browser',
        },
        {
            input: 'src/index.ts',
            output: 'dist/node/synapse.js',
            format: 'esm',
            minify: true,
            platform: 'node',
        },
        {
            input: 'src/index.ts',
            output: 'dist/cjs/synapse.cjs',
            format: 'cjs',
            minify: true,
            platform: 'node',
        },
    ],
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxModule: '@chialab/dna',
};

export default config;
