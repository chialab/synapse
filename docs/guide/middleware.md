# Middleware

A `Middleware` runs code before and/or after route resolution, for every request whose path matches its pattern. Like `Route`, it extends `Pattern` (see [Route patterns](./router#route-patterns)), so it has a `pattern` and a `priority`.

## Defining a middleware

```ts
import { Middleware } from '@chialab/synapse';

const logger = new Middleware({
    pattern: '*',
    priority: 100,
    before: (request, response, params, router) => {
        console.log('navigating to', request.path.href);
    },
    after: (request, response, params, router) => {
        console.log('rendered', response.title);
    },
});
```

- `before` (`MiddlewareBeforeHandler`) runs before any route is matched.
- `after` (`MiddlewareAfterHandler`) runs after a route has produced a response.
- Both receive `(request, response, params, router)`, where `params` are the values extracted by matching the middleware's own `pattern` against the current path (independent of any route's params).
- Either hook can return a new `Response` (or mutate and return the given one) to replace what continues through the pipeline; returning nothing keeps the current response. Calling `response.redirect(path)` from a hook short-circuits the rest of the pipeline in favor of a `replace()` to `path`.

## Connecting a middleware

Directly on a `Router`:

```ts
router.middleware(logger);
// or inline:
router.middleware('*', undefined, (request, response) => {
    /* before */
});
```

Or declared statically on an `App`:

```ts
class DemoApp extends App {
    static middlewares = [logger, new DocumentMetaMiddleware()];
}
```

Connected middlewares are sorted by descending `priority` (default `20`) and, for each request, `Router#handle` runs every matching middleware's `before` hook (highest priority first), then the matched route, then every matching middleware's `after` hook.

## `DocumentMetaMiddleware`

A built-in middleware that keeps `document.title` and `<meta>` tags in sync with the current `Response`'s `title` and `meta`:

```ts
import { DocumentMetaMiddleware } from '@chialab/synapse';

class DemoApp extends App {
    static middlewares = [new DocumentMetaMiddleware()];
}
```

Its constructor is `(doc = document, titleBuilder?, metaBuilder?)`:

- `titleBuilder: (title: string | undefined, response: Response) => string` — defaults to `(title) => title || ''`; use it to add a suffix, e.g. `(title) => title ? `${title} · My App` : 'My App'`.
- `metaBuilder: (meta: Meta | undefined, response: Response) => Meta` — defaults to `(meta) => meta || {}`; use it to inject metadata shared across pages.

On its `hookAfter`, it calls the builders with `response.title`/`response.meta` and writes the result to the document: existing `<meta name="...">` tags are updated in place, new ones are appended to `<head>`, and tags that are no longer present in the new `Meta` object are removed.

```ts
new DocumentMetaMiddleware(document, (title) => (title ? `${title} · Demo` : 'Demo'), (meta) => ({
    ...meta,
    'og:site_name': 'Demo',
}));
```

Set `response.setTitle(...)` and `response.setMeta(...)` from your route handlers (see [Request & Response](./request-response)) — `DocumentMetaMiddleware` only reads and applies them.
