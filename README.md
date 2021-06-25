<p align="center">
    <a href="https://www.chialab.io/p/synapse">
        <img alt="Synapse logo" width="144" height="144" src="https://raw.githack.com/chialab/synapse/main/logo.svg" />
    </a>
</p>

<p align="center">
    <strong>Synapse</strong> • Application framework built on the top of DNA Web Components.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/synapse"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/synapse.svg"></a>
</p>

---

## Get the library

Usage via [unpkg.com](https://unpkg.com/), as UMD package:

```html
<script src="https://unpkg.com/@chialab/synapse" type="text/javascript"></script>
```

or as ES6 module:

```js
import { App, Router, ... } from 'https://unpkg.com/@chialab/synapse?module';
```

Install via NPM:

```sh
$ npm i @chialab/synapse
$ yarn add @chialab/synapse
```

```ts
import { App, Router, ... } from '@chialab/synapse';
```

## Create an application

```ts
import { html, customElements, render } from '@chialab/dna';
import { App } from '@chialab/synapse';

const routes = [
    {
        pattern: '/',
        render(req, res) {
            return html`<div>
                <h1>Home</h1>
            </div>`;
        },
    },
    {
        handler(req, res) {
            res.data = new Error('not found');
        },
        render(req, res) {
            return html`<div>
                <details>
                    <summary>${res.data.message}</summary>
                    <pre>${res.data.stack}</pre>
                </details>
            </div>`;
    },
}];

class DemoApp extends App {
    render() {
        return html`
            <header>
                <h1>Synapse 3.0</h1>
            </header>
            <nav>
                <ul>
                    <li>
                        <a href="/">Home</a>
                    </li>
                </ul>
            </nav>
            <main>
                ${super.render()}
            </main>
        `;
    }
}

customElements.define('demo-app', DemoApp);

const app = render(document.getElementById('app'), html`<${DemoApp} routes=${routes} />`);
app.navigate('/');
```

---

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/synapse/branch/main/graph/badge.svg)](https://codecov.io/gh/chialab/synapse)

### Build the project

Install the dependencies and run the `build` script:
```
$ npm run install
$ npm run build
```

This will generate the UMD and ESM bundles in the `dist` folder, as well as the declaration file.

### Test the project

Run the `test` script:

```
$ npm run test
```

### Release

The `release` script uses [Semantic Release](https://github.com/semantic-release/semantic-release) to update package version, create a Github release and publish to the NPM registry.

An environment variable named `GH_TOKEN` with a [generated Github Access Token](https://github.com/settings/tokens/new?scopes=repo) needs to be defined in a local `.env` file.

```sh
$ echo 'export GH_TOKEN="abcxyz"' > .env
```

Now you are ready to run the `release` command:

```sh
$ npm run release
```

---

## License

Synapse is released under the [MIT](https://github.com/chialab/synapse/blob/master/LICENSE) license.
