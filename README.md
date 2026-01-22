# Synapse

Application framework built on the top of DNA Web Components.

[![NPM](https://img.shields.io/npm/v/@chialab/synapse.svg)](https://www.npmjs.com/package/@chialab/synapse)

## Get the library

Install via NPM or Yarn:

```
npm i @chialab/synapse
```

```
yarn add @chialab/synapse
```

## Create an application

```tsx
import { customElement, html, render } from '@chialab/dna';
import { App } from '@chialab/synapse';

@customElement('demo-app')
class DemoApp extends App {
    routes = [
        {
            pattern: '/',
            render(req, res) {
                return (
                    <main>
                        <h1>Home</h1>
                    </main>
                );
            },
        },
        {
            handler(req, res) {
                res.data = new Error('not found');
            },
            render(req, res) {
                return (
                    <main>
                        <details>
                            <summary>${res.data.message}</summary>
                            <pre>${res.data.stack}</pre>
                        </details>
                    </main>
                );
            },
        },
    ];

    render() {
        return (
            <>
                <header>
                    <h1>Synapse 3.0</h1>
                </header>
                <nav>
                    <ul>
                        <li>
                            <a href={router.resolve('/')}>Home</a>
                        </li>
                    </ul>
                </nav>
                {super.render()}
            </>
        );
    }
}

const app = render(<DemoApp base="/" />, document.getElementById('app'));

app.start('/');
```

---

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/synapse/branch/main/graph/badge.svg)](https://codecov.io/gh/chialab/synapse)

### Build

Install the dependencies

```
yarn
```

and run the `build` script:

```
yarn build
```

This will generate the ESM and CJS bundles in the `dist` folder and declaration files in the `types` folder.

---

## License

Synapse is released under the [MIT](https://github.com/chialab/synapse/blob/main/LICENSE) license.
