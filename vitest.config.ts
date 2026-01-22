import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@chialab/synapse': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        },
    },
    test: {
        coverage: {
            include: ['src'],
            reporter: [['clover'], ['html']],
            provider: 'istanbul',
        },
        browser: {
            enabled: true,
            headless: true,
            fileParallelism: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
    },
});
