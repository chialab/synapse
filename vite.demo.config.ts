import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'demo',
    base: '/synapse/demo/',
    plugins: [tailwindcss()],
    build: {
        outDir: '../public/demo',
        emptyOutDir: true,
    },
});
