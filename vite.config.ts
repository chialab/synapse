import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'demo',
    base: '/synapse/demo/',
    build: {
        outDir: '../public/demo',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@chialab/synapse': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
    },
});
