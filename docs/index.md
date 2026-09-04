---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: Synapse
titleTemplate: Client-side routing framework

hero:
    text: 'Client-side routing framework'
    tagline: 'Client-side routing, middlewares and page transitions on top of Web Components.'
    actions:
        - theme: brand
          text: Get started
          link: /guide/
        - theme: alt
          text: View on GitHub
          link: https://github.com/chialab/synapse

features:
    - title: Web Components first
      details: App extends DNA's Component, so routing is just another Web Component in your page.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="m31 16l-7 7l-1.41-1.41L28.17 16l-5.58-5.59L24 9l7 7zM1 16l7-7l1.41 1.41L3.83 16l5.58 5.59L8 23l-7-7zm11.42 9.484L17.64 6l1.932.517L14.352 26z"/></svg>
    - title: Request/Response pipeline
      details: Routes and middlewares connect through a before/after pipeline, with Request and Response objects flowing through each step.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M11.41 26.59L7.83 23H28v-2H7.83l3.58-3.59L10 16l-6 6l6 6l1.41-1.41zM28 10l-6-6l-1.41 1.41L24.17 9H4v2h20.17l-3.58 3.59L22 16l6-6z"/></svg>
    - title: Declarative route patterns
      details: Routes match Express-style patterns —static segments, :name params, :name* wildcards and a catch-all *— resolved by a Router you can also use standalone.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M6 3h4v2H6v8c0 1.2-.542 2.266-1.382 3C5.458 16.734 6 17.8 6 19v8h4v2H6c-1.103 0-2-.897-2-2v-8c0-1.102-.897-2-2-2v-2c1.103 0 2-.897 2-2V5c0-1.102.897-2 2-2m22 10V5c0-1.102-.897-2-2-2h-4v2h4v8c0 1.2.543 2.266 1.382 3A3.98 3.98 0 0 0 26 19v8h-4v2h4c1.103 0 2-.897 2-2v-8c0-1.102.897-2 2-2v-2c-1.103 0-2-.897-2-2"/></svg>
    - title: Pluggable history
      details: Swap between the History and BrowserHistory implementations to control how navigation is tracked and persisted.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10z"/><path fill="currentColor" d="M17 8h-2v9h8v-2h-6z"/></svg>
---
