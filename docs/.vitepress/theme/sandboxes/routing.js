import appCode from '../../../../demo/navigation/App.js?raw';
import linkCode from '../../../../demo/navigation/Elements/Link.js?raw';
import dashboardCode from '../../../../demo/navigation/Pages/Dashboard.js?raw';
import notFoundCode from '../../../../demo/navigation/Pages/NotFound.js?raw';
import projectsCode from '../../../../demo/navigation/Pages/Projects.js?raw';
import teamCode from '../../../../demo/navigation/Pages/Team.js?raw';

export const files = {
    '/App.js': {
        code: appCode,
        active: true,
    },
    '/Elements/Link.js': {
        code: linkCode,
    },
    '/Pages/Dashboard.js': {
        code: dashboardCode,
    },
    '/Pages/Team.js': {
        code: teamCode,
    },
    '/Pages/Projects.js': {
        code: projectsCode,
    },
    '/Pages/NotFound.js': {
        code: notFoundCode,
    },
    '/index.js': {
        code: `import { html, render } from '@chialab/dna';
import './App.js';

const app = render(html\`<demo-app />\`, document.body);

app.start('/');
`,
        readOnly: true,
    },
    '/tsconfig.json': {
        code: JSON.stringify({
            compilerOptions: {
                moduleResolution: 'bundler',
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
        <title>Synapse routing demo</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body></body>
    <script type="module" src="/index.js"></script>
</html>`,
        hidden: true,
    },
};

export const customSetup = {
    entry: '/index.js',
    dependencies: {
        '@chialab/dna': '^4.0.0',
        '@chialab/synapse': '^4.0.0',
    },
};
