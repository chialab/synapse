# Request & Response

Every navigation creates a `Request` and, from it, a `Response`. Both flow through the router pipeline — middlewares, matched routes, and finally the `App`/`Page` component that renders the result.

## `Request`

A `Request` wraps the URL being navigated to.

```ts
class Request<T extends RequestParams = RequestParams> {
    readonly url: URL;
    readonly path: Path;
    readonly parent?: Request;
    readonly method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';
    readonly data?: FormData | File;
    params?: T;

    get resolving(): boolean;
    get resolved(): boolean;
    get childRequest(): Request | undefined;
    get response(): Response | undefined;
    get matcher(): Route | undefined;
    get error(): Error | undefined;
}
```

- `url` / `path` — the target as a `URL` and as a router-relative `Path` (see [Routing](./router)).
- `method` — lower-cased HTTP-style method, `'get'` unless a form submission specifies another one via `App#handleSubmit`.
- `data` — the `FormData`/`File` passed for non-GET navigations (`App.navigate(path, { method, data })`).
- `params` — the named/wildcard values extracted by the matched route's pattern, set by the router via `setParams()` once a route matches (e.g. `request.params.id` for a `/users/:id` route).
- `matcher` — the `Route` instance that matched, set via `setMatcher()`.
- `parent` / `childRequest` — populated when a route forwards to a nested `router` (see [Nested routers](./router#nested-routers)); `request.isSubRouteRequest(otherRequest)` tells whether `otherRequest` belongs to this request's matched sub-router.
- `resolving` / `resolved` — derived from whether `response` or `error` has been set yet.

A handler typically only reads `request.params`, `request.method` and `request.data`; the rest (`resolve`, `reject`, `setMatcher`, `setParams`, `child`) is used internally by the `Router`.

## `Response`

A `Response` is created for each request and passed along the pipeline; middlewares and route handlers mutate it (or return a new one) to describe what should be rendered.

```ts
class Response<T = any> {
    readonly request: Request;
    readonly parent?: Response;
    redirected?: string;
    data: T | null;
    view?: View;

    get title(): string | undefined;
    get meta(): Meta | undefined;
    get childResponse(): Response | null | undefined;

    setTitle(title: string | undefined): this;
    setMeta(meta: Meta | undefined): this;
    setView(template: View): this;
    setData(data: T): this;
    getData(defaultValue?: T | null): T | null;
    redirect(path: string, init?: RequestInit): this;
    child(child: Response | null): Response | null;
    render(): Template;
}
```

- `setTitle(title)` / `title` — the page title. If the response has a `childResponse` (nested router), its title takes precedence, and `setTitle` propagates down to the child too.
- `setMeta(meta)` / `meta` — a `Meta` object (`{ [name: string]: string }`) of metadata for the page, consumed by [`DocumentMetaMiddleware`](./middleware); propagates to `childResponse` the same way as `title`.
- `setView(template)` / `view` — a `View` function, `(request, response) => Template`, used to render the page. `render()` calls it with `(this.request, this)`; this is what the `Page` component invokes (see [Page & Transition](./components)).
- `setData(data)` / `getData(defaultValue?)` / `data` — arbitrary payload for the page, e.g. fetched content. A child `Response` inherits its parent's data at construction time.
- `redirect(path, init?)` — marks the response as redirected; the `Router` picks this up and issues a `replace(path, init)` instead of rendering this response.
- `child(response)` / `childResponse` — set by `Route#exec` when the matched route forwards to a nested `router`.

## The `View` and `Meta` types

```ts
type View = (request: Request, response: Response) => Template;
type Meta = { [key: string]: string };
```

A `View` is any function returning a DNA `Template` (JSX or `html` tagged template), typically set either via a route's `render` option or by calling `response.setView()` from within a handler or a `Route#exec` override:

```ts
router.connect({
    pattern: '/users/:id',
    handler: (request, response) => {
        response.setTitle(`User ${request.params.id}`);
        response.setMeta({ description: `Profile page for user ${request.params.id}` });
    },
    render: (request, response) => <UserProfile id={request.params.id} />,
});
```
