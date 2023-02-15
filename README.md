<p align="center">
    <a href="https://www.chialab.io/p/synapse">
        <img alt="Synapse logo" width="144" height="144" src="https://raw.githack.com/chialab/synapse/main/logo.svg" />
    </a>
</p>

<p align="center">
    <strong>Synapse</strong> • Application framework built on the top of DNA Web Components.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/synapse"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/synapse"></a>
</p>

---

## Get the library

Usage via [unpkg.com](https://unpkg.com/), as UMD package:

```html
<script src="https://unpkg.com/@chialab/synapse" type="text/javascript"></script>
```

or as ES6 module:

```tsx
import { App, Router, ... } from 'https://unpkg.com/@chialab/synapse?module';
```

Install via NPM:

```sh
$ npm i @chialab/synapse
$ yarn add @chialab/synapse
```

```tsx
import { App, Router, ... } from '@chialab/synapse';
```

## Create an application

```tsx
import { html, customElement, render } from '@chialab/dna';
import { App } from '@chialab/synapse';

@customElement('demo-app')
class DemoApp extends App {
    routes = [
        {
            pattern: '/',
            render(req, res) {
                return <main>
                    <h1>Home</h1>
                </main>;
            },
        },
        {
            handler(req, res) {
                res.data = new Error('not found');
            },
            render(req, res) {
                return <main>
                    <details>
                        <summary>${res.data.message}</summary>
                        <pre>${res.data.stack}</pre>
                    </details>
                </main>;
            },
        },
    ];

    render() {
        return <>
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
        </>;
    }
}

const app = render(<DemoApp
    base="/"
/>, document.getElementById('app'));

app.start('/');
```

---

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/synapse/branch/main/graph/badge.svg)](https://codecov.io/gh/chialab/synapse)

### Build the project

Install the dependencies and run the `build` script:
```
$ yarn install
$ yarn build
```

This will generate the UMD and ESM bundles in the `dist` folder, as well as the declaration file.

### Test the project

Run the `test` script:

```
$ yarn test
```

---

## License

Synapse is released under the [MIT](https://github.com/chialab/synapse/blob/master/LICENSE) license.
