# History

`History` is Synapse's abstraction over a stack of navigation states; `Router` delegates all state bookkeeping to it, and `App` exposes it as the `history` property. `BrowserHistory` is the implementation that syncs with the real browser address bar and `window.history`.

## `History`

An in-memory stack, used by default (an `App`/`Router` created without an explicit `history` gets a plain `new History()`).

```ts
import { History } from '@chialab/synapse';

const history = new History();
history.start(); // resets internal state and marks it active
```

Key members:

- `start()` / `stop()` — activate/deactivate the instance; `active` reflects the current state. `start()` calls `reset()`, clearing all entries.
- `pushState(state)` / `replaceState(state)` — record a `State` (`{ url, path, title, data, request, response }`, see [Request & Response](./request-response)) as a new entry or in place of the current one; both emit a `'pushstate'`/`'replacestate'` event with `{ state, previous }` and return the stored `HistoryState`.
- `go(shift)` / `back()` / `forward()` — move the internal index by `shift` (or ±1) and emit `'popstate'` with `{ state, previous }`; out-of-range shifts are ignored.
- `state` — the current `State`, `states` — the full list, `index` — the current position, `length` — the number of entries.
- `compareStates(state1, state2)` — returns `NavigationDirection.back` if `state2` sits before `state1` in the stack, `NavigationDirection.forward` otherwise. This is what `App#onPopState` uses to compute `navigationDirection`.

`History` extends the internal `Emitter`, so you can also do `history.on('pushstate' | 'replacestate' | 'popstate', listener)` directly.

## `BrowserHistory`

Syncs the same API with `window.history` and the browser's `popstate` event, so back/forward buttons and the address bar work as expected.

```ts
import { render } from '@chialab/dna';
import { BrowserHistory } from '@chialab/synapse';

const app = render(<DemoApp base="/" history={new BrowserHistory()} />, document.body);
app.start();
```

- Only one active `BrowserHistory` is allowed at a time; calling `start()` on a second instance while another is active throws `You cannot initialize more than one "BrowserHistory".`.
- `pushState`/`replaceState` call through to `History` and then to `window.history.pushState`/`replaceState`, serializing the `HistoryState` (via `JSON.parse(JSON.stringify(...))`) so it's safe to store natively.
- `go(shift)` delegates to `window.history.go()` and resolves once the corresponding native `popstate` fires.
- Native `popstate` events are translated back into Synapse's `'popstate'` event: if the event carries a recognizable `HistoryState` from this session, the internal index is updated (or the stack is reset, if the state belongs to a different `History` instance — e.g. after a full reload); otherwise (e.g. a hash-only navigation typed by hand) it's re-resolved from `window.location.href`.
- `listen()` / `unlisten()` are deprecated aliases for `start()` / `stop()`.

In a `demo-app` element, this is set declaratively, as in the [`demo/navigation`](https://github.com/chialab/synapse/tree/main/demo/navigation) example:

```ts
import { html, render } from '@chialab/dna';
import { BrowserHistory } from '@chialab/synapse';

const app = render(html`<demo-app base=${`${location.pathname}#!/`} history=${new BrowserHistory()} />`, document.body);
app.start();
```

## Navigation direction

`compareStates()` returns one of the two `'back'` / `'forward'` string values (internally a `NavigationDirection` enum). `App` exposes the result as its `navigationDirection` state property, reflected in the `:navigation` attribute of the app element — useful for CSS-driven transition direction (see [Page & Transition](./components)).
