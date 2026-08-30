import { defineConfig } from 'vite';

export default defineConfig({
    root: 'demo',
    base: '/synapse/demo/',
    build: {
        outDir: '../public/demo',
        emptyOutDir: true,
    },
});
