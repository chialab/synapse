<script setup>
import DemoFrame from '../.vitepress/theme/components/DemoFrame.vue';
</script>

# Demo

A small single-page application built with Synapse, showing routing between pages, active-link highlighting and per-route document titles.

<DemoFrame />

## What it shows

The demo defines a `demo-app` element with three routes (`Dashboard`, `Team`, `Projects`) and a catch-all `NotFound` route, plus a `DocumentMetaMiddleware` that keeps the document title in sync with the current page. The `Dashboard` route also persists data across navigations using the response's `getData`/`setData` helpers.

Source: [`demo/`](https://github.com/chialab/synapse/tree/main/demo) in the repository.
