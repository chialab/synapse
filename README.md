# Synapse

Application framework built on the top of DNA Web Components.

[![NPM](https://img.shields.io/npm/v/@chialab/synapse.svg)](https://www.npmjs.com/package/@chialab/synapse)

## Features

Synapse brings **declarative routing** and **request/response semantics** on top of [DNA](https://github.com/chialab/dna) Web Components, so an `App` can drive navigation like a small client-side framework.

### Web Components first

`App` extends DNA's `Component`, so routing is just another Web Component in your page — no separate root or portal needed.

### Request/Response pipeline

Routes and middlewares work like a server-side framework: `Request` and `Response` objects flow through a `before`/`after` pipeline, with priorities and pattern matching.

### Declarative route patterns

Routes match Express-style patterns — static segments, `:name` params, `:name*` wildcards and a catch-all `*` — resolved by a `Router` you can also use standalone.

### Pluggable history

Swap between the in-memory `History` and `BrowserHistory` implementations to control how navigation is tracked and persisted.

### Hooks for function components

Use the `useApp` and `useRouter` hooks to access the parent application and router instance from a function component, without threading props down manually.

## Get the library

Install via NPM:

```
npm i @chialab/synapse
```

```
yarn add @chialab/synapse
```

```
pnpm add @chialab/synapse
```

## Create an application

```tsx
import { customElement, render } from '@chialab/dna';
import { App } from '@chialab/synapse';

@customElement('demo-app')
class DemoApp extends App {
    static routes = [
        {
            pattern: '/',
            render: () => (
                <main>
                    <h1>Home</h1>
                </main>
            ),
        },
        {
            pattern: '*',
            render: () => (
                <main>
                    <h1>Not found</h1>
                </main>
            ),
        },
    ];

    render() {
        return (
            <>
                <header>
                    <h1>Synapse</h1>
                </header>
                <nav>
                    <a href={this.router.resolve('/')}>Home</a>
                </nav>
                {super.render()}
            </>
        );
    }
}

const app = render(<DemoApp base="/" />, document.getElementById('app'));

app.start('/');
```

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3AMain)

### Build

Install the dependencies and run the `build` script:

```
pnpm install
```

```
pnpm build
```

This will generate the ESM bundle in the `dist` folder, as well as the declaration files.

### Test

Run the `test` script:

```
pnpm test
```

---

## License

**Synapse** is released under the [MIT](https://github.com/chialab/synapse/blob/main/LICENSE) license.
