# Page & Transition

Two small DNA function components render the routing result: `Page`, used internally by `App#render()`, and `Transition`, an optional wrapper that animates between successive pages.

## `Page`

```ts
const Page: FunctionComponent<{ response?: Response }>;
```

`Page` simply calls `response?.render()`, i.e. it invokes the matched route's `view` (see [Request & Response](./request-response)) with the response's own `request`/`response`. This is exactly what `App.render()` does by default:

```ts
render() {
    if (!this.response) {
        return null;
    }
    return <Page response={this.response} />;
}
```

You rarely need to use `Page` directly — it's what `App` renders for you — but it's useful if you want to render a `Response` somewhere other than the app's own `render()`, e.g. inside a custom layout component that receives the response as a prop.

## `Transition`

```ts
const Transition: FunctionComponent<{
    router: Router;
    renderer?: FunctionComponent;
}>;
```

`Transition` keeps the *previous* response's page mounted alongside the new one until the previous page's CSS animation/transition finishes, so you can animate page changes with plain CSS instead of coordinating unmount timing yourself.

```tsx
import { Transition } from '@chialab/synapse';

class DemoApp extends App {
    render() {
        return <Transition router={this.router}>{super.render()}</Transition>;
    }
}
```

How it works:

- It reads the current response from `router.state?.response` (not from `App#response`), and keeps the previous response/children in its render context across renders.
- When the response changes, it checks the previous page's root element with `getComputedStyle()`: if there's no running CSS `animation` or `transition` (`animationDuration` / `transitionDuration` > 0), it swaps to the new response on the next animation frame.
- If there is one, it renders **both** the outgoing and incoming pages (each wrapped by `renderer`, default a pass-through) at once, and waits for all `animationend`/`transitionend`/`animationcancel` events (matching any `animationstart`/`transitionstart` it saw) on the root node before dropping the outgoing page.

This means the transition itself — sliding, fading, cross-fading — is authored entirely in CSS, keyed off whatever selector you use to target the outgoing/incoming page elements (e.g. via the `:navigation` attribute set by `App`, see [History](./history#navigation-direction)); `Transition` only decides *when* it's safe to remove the old page from the DOM.

Pass a custom `renderer` to control how each page (previous or current) is wrapped, e.g. to add a class based on whether it's entering or leaving:

```tsx
const AnimatedPage: FunctionComponent<{ response: Response }> = ({ response, children }) => (
    <div class="page">{children}</div>
);

<Transition router={this.router} renderer={AnimatedPage}>
    {super.render()}
</Transition>;
```
