# Hooks

`useApp` and `useRouter` give a function component access to the parent `App` element and its `Router` without having to thread props down manually. They only work for components rendered *inside* an `App` instance — otherwise they return `null`.

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

## `useApp()`

Returns the closest ancestor `App` instance, or `null` if the component isn't rendered inside one. Use it when you need the application itself — for example to call `navigate()`/`replace()`, or to read `app.request`/`app.response` directly.

## `useRouter()`

Returns the `Router` bound to the closest ancestor `App`, or `null`. This is what you'll reach for most often from a function component, since most navigation needs (`router.resolve()`, `router.current`, `router.navigate()`) only require the router, not the whole `App`.

## How it works

Both hooks read the render context with DNA's `useRenderContext()` and resolve it to the nearest `App` by walking up the DOM tree (the same lookup `getApp`/`getRouter` use — see [`Elements/Link.js`](https://github.com/chialab/synapse/blob/main/demo/navigation/Elements/Link.js) in the demo for a pre-hooks example using `getRouter` directly), memoized with `useMemo` so the lookup only re-runs when the render context changes.

If you're writing a class-based `Route` or `Middleware` instead of a function component, use the `Request`/`Response`/`Router` objects passed to your handlers directly — see [Routing](./router) and [Request & Response](./request-response).
