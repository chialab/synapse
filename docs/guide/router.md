# Routing

The `Router` resolves a path to a `Response` by running it through connected middlewares and routes. An `App` creates and owns one automatically, but a `Router` can also be used standalone.

## Creating a router

```ts
import { Router } from '@chialab/synapse';

const router = new Router(
    {
        origin: 'https://example.com',
        base: '/app',
    },
    [
        /* routes */
    ],
    [
        /* middlewares */
    ]
);
```

`RouterOptions` accepts `history`, `origin`, `base` and `errorHandler`; they can also be set later with `setHistory()`, `setOrigin()`, `setBase()` and `setErrorHandler()` (all of which throw once the router is `running`).

## Connecting routes and middlewares

`connect()` accepts a `Route` instance, a plain `RouteRule` object, or a `(pattern, handler)` pair; it returns the connected `Route`:

```ts
router.connect('/users/:id', (request, response) => {
    response.setTitle(`User ${request.params.id}`);
});

router.connect({
    pattern: '/legacy',
    handler: (request, response) => response.redirect('/'),
});
```

`middleware()` works the same way for `Middleware` (see [Middleware](./middleware)). `disconnect(routeOrMiddleware)` removes a previously connected `Route` or `Middleware` and returns `false` if it wasn't connected. Routes and middlewares are kept sorted by descending `priority` (default `20`), so higher-priority rules are tried first.

## Starting, stopping, navigating

- `start(pathname?): Promise<Response>` — marks the router as `running`, starts its `history`, and replaces state with `pathname` (or the current URL for `BrowserHistory`, or `/`).
- `stop()` / `end()` (`end` is deprecated) — stops listening to `history` popstate events.
- `navigate(path, init?, data?, trigger?, force?)` — resolves `path` through the routes/middlewares pipeline and **pushes** a new history state. Skipped (returns `null`) if `path` already matches the current state, unless `force` is `true`.
- `replace(path, init?, data?, trigger?)` — same resolution, but **replaces** the current history state instead of pushing.
- `refresh(path?)` — shorthand for `replace(path || current || '/')`.
- `resolve(pathname, full?)` — turns a route-relative path into a URL you can put in an `href`, honoring `base`; pass `full: true` for an absolute URL string.
- `pathFromUrl(url)` — extracts the router-relative path from a full URL, or `null` if it doesn't match the router's `origin`/`base`. This is what `App` uses to decide whether a clicked anchor should be intercepted.
- `current` — the path of the current state (`router.state?.path`); `running` and `state` are also readable.

`router.on('popstate' | 'pushstate' | 'replacestate', listener)` (`Router` extends the internal `Emitter`) lets you subscribe to navigation events directly; `App` uses this internally to sync its `request`/`response` state.

## Route patterns

Routes (and middlewares) match against Express-style string patterns, compiled by `Pattern`/`Route`. `Route` extends `Pattern` and adds a `handler`, a `view` (from `render`) and an optional child `router`:

```ts
import { Route } from '@chialab/synapse';

new Route({ pattern: '/users', handler, render });          // static segment
new Route({ pattern: '/users/:id', handler, render });      // named param -> request.params.id
new Route({ pattern: '/files/:path*', handler, render });   // trailing wildcard param -> request.params.path
new Route({ pattern: '*', handler, render });                // catch-all, e.g. a 404 route
```

- A plain segment (`users`) must match literally.
- `:name` matches a single non-empty path segment, exposed as `request.params.name`.
- `:name*` matches the rest of the path (including slashes, possibly empty), exposed the same way.
- A bare `*` segment (or `*` as the whole pattern) matches anything, exposing the remainder as `request.params._` — this is what a route with a nested `router` uses to forward the unmatched tail (see below).
- `priority` (default `20`) breaks ties when multiple patterns match; higher runs first. Order among equal priorities is insertion order.

`pattern.matches(path)` returns either `false` or a `RequestParams` object; `Router` calls it internally to find the first matching route/middleware for the current path.

## Route handlers and rendering

A `RouteHandler` receives `(request, response, next, router)` and can:

- mutate and return `response` (or nothing, in which case the input `response` is used);
- return a new `Response`;
- return a path string, which is treated as a redirect (`response.redirect(path)`);
- call `next(request, response, router)` to continue to routes with lower priority (used for nested/fallthrough routing).

If the matched route has a `render` (exposed as `route.view`), it is set on the response after the handler runs (`response.setView(route.view)`), unless the handler already produced a redirect.

You can also subclass `Route` directly and override `exec()` instead of passing a `handler`/`render` pair — this is how the [`demo/navigation`](https://github.com/chialab/synapse/tree/main/demo/navigation) example structures its pages:

```ts
import { html } from '@chialab/dna';
import { Route } from '@chialab/synapse';

export class Dashboard extends Route {
    async exec(request, response) {
        response.setTitle('Dashboard');
    }

    view = (request, response) => html`<p>This is the dashboard page.</p>`;
}

// connected as: new Dashboard({ pattern: '/' })
```

## Nested routers

A `RouteRule` can carry a child `router`. When such a route matches, `Route#exec` forwards the unmatched remainder of the path (`request.params._`) to `router.navigate()` and attaches the resulting `Response` as `response.child(...)`, enabling sub-routing under a path prefix (typically declared with a trailing `*` segment, e.g. `/admin/*`).
