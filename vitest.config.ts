import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@chialab/synapse': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
    },
    test: {
        coverage: {
            all: false,
            include: ['src'],
            reporter: [['clover'], ['html']],
        },
    },
});
