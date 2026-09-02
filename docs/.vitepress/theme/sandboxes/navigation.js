/// <reference types="vite/client" />

const sources = await import.meta.glob('./**/*.{js,ts,jsx,tsx,css,html}', {
    eager: true,
    import: 'default',
    query: '?raw',
    base: '../../../../demo/navigation',
});

export const files = {
    'tsconfig.json': {
        code: JSON.stringify({
            compilerOptions: {
                moduleResolution: 'bundler',
            },
        }),
        hidden: true,
    },
    ...Object.entries(sources).reduce((acc, [path, code]) => {
        acc[path.replace('./', '')] = { code };
        return acc;
    }, {}),
};

export const customSetup = {
    entry: 'index.tsx',
    dependencies: {
        '@chialab/dna': '^4.0.0',
        '@chialab/synapse': '^4.0.0',
    },
};
