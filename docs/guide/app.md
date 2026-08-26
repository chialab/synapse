# The App component

`App` is a DNA `Component` subclass that owns a `Router` and a `History`, renders the current `Response` and wires up navigation for its whole subtree. Every Synapse application starts by extending it.

```ts
import { App } from '@chialab/synapse';

class DemoApp extends App {
    // ...
}
```

## Routes and middlewares

`routes` and `middlewares` are declared as **static** class properties. They are read once during `initialize()` and connected to the instance's `router`:

```ts
class DemoApp extends App {
    static routes = [
        { pattern: '/', render: (req, res) => <Home /> },
        { pattern: '/users/:id', handler: (req, res) => res.setTitle(`User ${req.params.id}`), render: (req, res) => <User /> },
    ];

    static middlewares = [new DocumentMetaMiddleware()];
}
```

Each static array element can be a plain rule object (`RouteRule` / `MiddlewareRule`) or a `Route` / `Middleware` instance — see [Routing](./router) and [Middleware](./middleware). The instance-level `routes` and `middlewares` properties expose the same lists reactively: reassigning them (before the router starts) disconnects the previous set and reconnects the new one.

## `history` and `router`

Both are reactive properties, resolved lazily in `initialize()` if not provided:

- `history` — a `History` instance (in-memory by default). Pass a `BrowserHistory` instance to sync with the real address bar (see [History](./history)).
- `router` — a `Router` instance, created automatically and bound to `history`, `origin` and `base`.

Neither can be reassigned once the router is `running` — doing so throws `Cannot change application router while running.`.

## `origin` and `base`

Two string properties forwarded to the router (`Router#setOrigin` / `Router#setBase`) whenever they change:

- `origin` — restricts navigation to a specific origin (defaults to `window.location.origin`).
- `base` — the base path every route is resolved against. A value starting with `#` is treated as a hash-based base and resolved against the current `location.pathname`/`search` (useful for static hosting, as in the [`demo/navigation`](https://github.com/chialab/synapse/tree/main/demo/navigation) example: `base=${`${location.pathname}#!/`}`).

## `request` and `response`

State properties holding the current `Request` and `Response` (see [Request & Response](./request-response)). `response` is what `render()` passes down:

```ts
render() {
    if (!this.response) {
        return null;
    }
    return <Page response={this.response} />;
}
```

Override `render()` and call `super.render()` to wrap the current page with a shared layout, as in the [Get started](./index) example.

## Starting and stopping

- `start(path?: string): Promise<Response | void>` — binds the router's `popstate` / `pushstate` / `replacestate` events and calls `router.start(path)`, which replaces the current state with `path` (or the current URL, for `BrowserHistory`, or `/` otherwise). Throws if called twice.
- `stop()` — detaches the listeners and calls `router.stop()`.
- `navigate(path, init?): Promise<Response | null>` — delegates to `router.navigate()`.
- `replace(path, init?): Promise<Response | null>` — delegates to `router.replace()`.

`autostart` is a property (boolean or string) that, when truthy, calls `start()` automatically from `connectedCallback()`; a string value is used as the initial path.

## Anchor and form interception

`App` listens for `click` on `a` and `submit` on `form` (via DNA's `@listen` decorator) anywhere in its subtree:

- `handleLink(event, node)` — for a same-origin anchor whose `target` is `_self` (or unset), it resolves the `href` to a router path with `router.pathFromUrl()`, prevents the default navigation and calls `navigate()`.
- `handleSubmit(event, node)` — same resolution for a form's `action`. `GET` forms are turned into a query string appended to `navigate()`; other methods are sent as `navigate(path, { method, data })` with a `FormData` built from the form.

Both no-op if the router hasn't started, and both can be overridden to customize or opt out of the interception for specific cases.

## Lifecycle hooks

- `onRequest(oldValue, newValue)` — called via `@observe('request')` whenever `this.request` changes.
- `onResponse(oldValue, newValue)` — called via `@observe('response')` whenever `this.response` changes.
- `onPopState({ state, previous })` — called for every router `popstate`/`pushstate`/`replacestate` event, after `this.request` is updated and before `this.response` is; the default implementation computes `navigationDirection` (`'back'` or `'forward'`) by comparing `state`/`previous` with `history.compareStates()`.

Override any of them in a subclass (calling `super` is not required, they're empty by default except `onPopState`) to react to navigation, e.g. to send analytics or scroll to top.
