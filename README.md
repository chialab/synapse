# Synapse

Application framework built on the top of DNA Web Components.

[![NPM](https://img.shields.io/npm/v/@chialab/synapse.svg)](https://www.npmjs.com/package/@chialab/synapse)

📖 [Documentation](https://chialab.github.io/synapse/) — 🚀 [Live demo](https://chialab.github.io/synapse/guide/demo)

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

## Hooks

Use the `useApp` and `useRouter` hooks to access the parent application and router instances from a function component rendered inside an `App`:

```tsx
import type { FunctionComponent } from '@chialab/dna';
import { useApp, useRouter } from '@chialab/synapse';

const NavBar: FunctionComponent = () => {
    const app = useApp();
    const router = useRouter();

    return (
        <nav>
            <a href={router?.resolve('/')}>Home</a>
            <button onclick={() => app?.navigate('/')}>Go home</button>
        </nav>
    );
};
```

Both hooks return `null` when the component is not rendered inside an `App` instance.

---

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/synapse/branch/main/graph/badge.svg)](https://codecov.io/gh/chialab/synapse)

### Build

Install the dependencies

```
pnpm install
```

and run the `build` script:

```
pnpm build
```

### Test

Run the `test` script to execute the unit tests:

```
pnpm test
```

### Demo

The `demo` folder contains a small routing example app used to try out the library. Run it locally with:

```
yarn dev
```

### Documentation

The documentation site lives in the `docs` folder and is built with [VitePress](https://vitepress.dev). Run it locally with:

```
yarn docs:dev
```

---

## License

Synapse is released under the [MIT](https://github.com/chialab/synapse/blob/main/LICENSE) license.
