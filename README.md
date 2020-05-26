<p align="center">
    <a href="https://www.chialab.io/p/synapse">
        <img alt="Synapse logo" width="144" height="144" src="https://raw.githack.com/chialab/synapse/3.0.0/logo.svg" />
    </a>
</p>

<p align="center">
    <strong>Synapse</strong> • Application framework built on the top of DNA Web Components.
</p>

<p align="center">
    <a href="https://www.chialab.io/p/synapse"><img alt="Documentation link" src="https://img.shields.io/badge/Docs-chialab.io-lightgrey.svg?style=flat-square"></a>
    <a href="https://github.com/chialab/synapse"><img alt="Source link" src="https://img.shields.io/badge/Source-GitHub-lightgrey.svg?style=flat-square"></a>
    <a href="https://www.chialab.it"><img alt="Authors link" src="https://img.shields.io/badge/Authors-Chialab-lightgrey.svg?style=flat-square"></a>
    <a href="https://www.npmjs.com/package/@chialab/synapse"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/synapse.svg?style=flat-square"></a>
    <a href="https://github.com/chialab/synapse/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@chialab/dna.svg?style=flat-square"></a>
</p>

---

## Get the library

Usage via [unpkg.com](https://unpkg.com/), as UMD package:
```html
<script src="https://unpkg.com/@chialab/synapse" type="text/javascript"></script>
```

or as ES6 module:

```js
import { App, Router, ... } from 'https://unpkg.com/@chialab/synapse?module';
```

Install via NPM:
```sh
$ npm i @chialab/synapse
```

```ts
import { App, Router, ... } from '@chialab/synapse';
```

## Create an application

TODO

---

## Development

[![Build status](https://github.com/chialab/synapse/workflows/Main/badge.svg)](https://github.com/chialab/synapse/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/synapse/branch/3.0.0/graph/badge.svg)](https://codecov.io/gh/chialab/synapse)


### Requirements

In order to build and test Synapse, the following requirements are needed:
* [NodeJS](https://nodejs.org/) (>= 10.0.0)
* [Yarn](https://yarnpkg.com)
* [RNA](https://github.com/chialab/rna-cli) (>= 3.0.0)

### Build the project

Install the dependencies and run the `build` script:
```
$ yarn install
$ yarn build
```

This will generate the UMD and ESM bundles in the `dist` folder, as well as the declaration file.

### Test the project

Run the `test` script:

```
$ yarn test
```

---

## License

Synapse is released under the [MIT](https://github.com/chialab/synapse/blob/master/LICENSE) license.
