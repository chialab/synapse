export const files = {
    '/App.tsx': {
        code: `import { customElement } from '@chialab/dna';
import { App } from '@chialab/synapse';

@customElement('demo-app')
export class DemoApp extends App {
    static routes = [
        {
            pattern: '/',
            render: () => (
                <main>
                    <h1>Home</h1>
                    <p>Welcome! Try the About link above.</p>
                </main>
            ),
        },
        {
            pattern: '/about',
            render: () => (
                <main>
                    <h1>About</h1>
                    <p>This page is rendered by a Synapse Route.</p>
                </main>
            ),
        },
    ];

    render() {
        return (
            <>
                <nav>
                    <a href={this.router.resolve('/')}>Home</a>
                    {' · '}
                    <a href={this.router.resolve('/about')}>About</a>
                </nav>
                {super.render()}
            </>
        );
    }
}
`,
        active: true,
    },
    '/index.ts': {
        code: `import { DemoApp } from './App';

const app = new DemoApp();
document.getElementById('app')?.append(app);
app.start('/');
`,
        readOnly: true,
    },
    '/styles.css': {
        code: `
html {
    color-scheme: light dark;
    background: transparent;
    color: #3c3c43;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

body {
    margin: 0;
    padding: 2em;
}

h1 {
    margin: 0 0 0.5em;
    font-size: 1.75em;
}

nav {
    margin-bottom: 1em;
}

nav a {
    color: inherit;
}

@media (prefers-color-scheme: dark) {
    html {
        color: #dfdfd6;
        background-color: #202127;
    }
}`,
        hidden: true,
    },
    '/tsconfig.json': {
        code: JSON.stringify({
            compilerOptions: {
                moduleResolution: 'bundler',
                experimentalDecorators: true,
                useDefineForClassFields: false,
                jsx: 'react-jsx',
                jsxImportSource: '@chialab/dna',
            },
        }),
        hidden: true,
    },
    '/index.html': {
        code: `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Synapse sandbox</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/index.ts"></script>
    </body>
</html>`,
        hidden: true,
    },
};

export const customSetup = {
    entry: '/index.ts',
    dependencies: {
        '@chialab/dna': '^4.0.0',
        '@chialab/synapse': '^4.0.0',
    },
};
