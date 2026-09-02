import { fileURLToPath } from 'node:url';
import UnpluginIsolatedDecl from 'unplugin-isolated-decl/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [UnpluginIsolatedDecl()],
    resolve: {
        alias: {
            '@chialab/synapse': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
    },
    build: {
        target: 'es2020',
        lib: {
            entry: {
                synapse: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
            },
            formats: ['es'],
        },
        rolldownOptions: {
            external: (source) => /^@chialab\/dna(\/|$)/.test(source),
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
