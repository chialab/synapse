import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    base: 'synapse',
    build: {
        outDir: 'public',
    },
    resolve: {
        alias: {
            '@chialab/synapse': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
    },
});
