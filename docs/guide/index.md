# Get started

Synapse is an application framework built on top of [DNA](https://chialab.github.io/dna/) Web Components. It adds a client-side router, request/response objects, middlewares and page transitions to the `Component` base class, so that a DNA component tree can drive navigation instead of a separate framework.

## Install

Synapse is published to the NPM registry and can be installed using your favorite package manager.

::: code-group

```bash [npm]
npm i @chialab/synapse
```

```bash [yarn]
yarn add @chialab/synapse
```

:::

## Create an application

An application is a component that extends the `App` class. It declares its `routes` (and, optionally, `middlewares`) as static properties, renders its own shell in `render()`, and is started by calling `start()` with the initial path once it has been rendered to the DOM.

```tsx
import { customElement, render } from '@chialab/dna';
import { App } from '@chialab/synapse';

@customElement('demo-app')
class DemoApp extends App {
    static routes = [
        {
            pattern: '/',
            render: (request, response) => (
                <main>
                    <h1>Home</h1>
                </main>
            ),
        },
        {
            pattern: '*',
            render: (request, response) => (
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

`render()` from `@chialab/dna` mounts the `DemoApp` element and returns the instance; calling `start()` afterwards binds the router to the (default, in-memory) `History` and resolves the first `Response`, which `App.render()` hands to the built-in [`Page`](./components) component via `super.render()`.

Anchors and forms rendered inside the app are intercepted automatically: clicking a same-origin `<a href>` (with no `target` or `target="_self"`) calls `navigate()` instead of causing a full page load, so the `<a href={this.router.resolve('/')}>` link above just works once the app has started. See [The App component](./app) for the full API, [Routing](./router) for how routes and patterns are matched, and [Request & Response](./request-response) for what handlers receive and return.

::: tip

To drive the browser address bar and back/forward buttons instead of an in-memory history, set `history` to a `BrowserHistory` instance — see [History](./history).

:::
