---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: Synapse
titleTemplate: Application framework built on the top of DNA Web Components.

hero:
    text: 'Application framework built on the top of DNA Web Components.'
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
      details: The App component extends DNA's Component, so routing is just another Web Component in your page.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2 28 9v14l-12 7-12-7V9zm0 4.3L8 11v10l8 4.7 8-4.7V11z"/><circle cx="16" cy="16" r="4" fill="currentColor"/></svg>
    - title: Request/Response pipeline
      details: Routes and middlewares work like a server-side framework, with Request and Response objects flowing through a before/after pipeline.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M4 10h20l-4-4 1.4-1.4L28 11l-6.6 6.4L20 16l4-4H4z"/><path fill="currentColor" d="M28 22H8l4 4-1.4 1.4L4 21l6.6-6.4L12 16l-4 4h20z"/></svg>
    - title: Declarative route patterns
      details: Routes match Express-style patterns —static segments, :name params, :name* wildcards and a catch-all *— resolved by a Router you can also use standalone.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M15 2h2v6h-2z"/><path fill="currentColor" d="M16 6 4 10v2l12 4 12-4v-2zm0 2.1L23.3 11 16 13.4 8.7 11z"/><path fill="currentColor" d="M15 12h2v18h-2z"/></svg>
    - title: Pluggable history
      details: Swap between the History and BrowserHistory implementations to control how navigation is tracked and persisted.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10z"/><path fill="currentColor" d="M17 8h-2v9h8v-2h-6z"/></svg>
    - title: Hooks for function components
      details: Use the useApp and useRouter hooks to access the parent application and router instance without threading props down manually.
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M13 4h6v10a3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M11 4v10a5 5 0 0 0 10 0V4"/><path fill="currentColor" d="M14 20h4v8h-4z"/></svg>
---
