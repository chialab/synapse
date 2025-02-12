# [2.5.0](https://github.com/chialab/synapse/compare/v2.4.0...v2.5.0) (2022-05-24)

## 3.0.6

### Patch Changes

- bf03892: Preserve hash when computing path from url

## 3.0.5

### Patch Changes

- 154b576: Add `types` import in package.json

## 3.0.4

### Patch Changes

- 84a5e97: Preserve final base hash in resolved urls.

## 3.0.3

### Patch Changes

- 85d6986: Fix `pathFromUrl` method with trailing hash.

## 3.0.2

### Patch Changes

- b96eb8e: Do not navigate on default prevented form submission.

## 3.0.1

### Patch Changes

- 30b235d: Fixed redirected responses.

## 3.0.0

### Minor Changes

- ab41ce4: Abort concurrent requests.

### Patch Changes

- b937592: Fix path from url trailing slash
- 910799a: Fix initial router origin
- 05ef79a: Update node fetch
- 986175c: Increment version
- 9c35391: Route patterns matching
- 6f0d2f7: Add `stop` method to App.
- a8aece1: Handle hash changes
- 283d297: Fix hash navigation
- 3753c5b: Update to DNA 3.20
- b73d5d5: Ensure transition pages are keyed
- 2fb765f: Fixed navigation with hash bang
- 9a142d2: Introduce the `Path` object for routing.

## 3.0.0-rc.10

### Minor Changes

- ab41ce4: Abort concurrent requests.

## 3.0.0-rc.9

### Patch Changes

- 283d297: Fix hash navigation

## 3.0.0-rc.8

### Patch Changes

- b937592: Fix path from url trailing slash

## 3.0.0-rc.7

### Patch Changes

- Fixed navigation with hash bang

## 3.0.0-rc.6

### Patch Changes

- Handle hash changes

## 3.0.0-rc.5

### Patch Changes

- 3753c5b: Update to DNA 3.20

## 3.0.0-rc.2

### Patch Changes

- 910799a: Fix initial router origin

## 3.0.0-rc.1

### Patch Changes

- 9c35391: Route patterns matching

## 3.0.0-beta.3

### Patch Changes

- Increment version

## 3.0.0-beta.2

### Patch Changes

- 05ef79a: Update node fetch
- b73d5d5: Ensure transition pages are keyed

### Bug Fixes

- handle void return in route handlers ([6a9a8ed](https://github.com/chialab/synapse/commit/6a9a8eddb57ec5ae0b970871e9e20dd5c041a29a))
- linting errors ([e078e3d](https://github.com/chialab/synapse/commit/e078e3dd9199ea134ca06561d188d1d034ce472a))
- pop state listener context ([8b735c8](https://github.com/chialab/synapse/commit/8b735c811b5ecc0d87e8b89705699f9ff2775c71))
- protected current page ([e081b10](https://github.com/chialab/synapse/commit/e081b1080de44e38b7678fe8415a49003e2e7e38))
- render return type ([c3c5f02](https://github.com/chialab/synapse/commit/c3c5f02e210ee82531221f8a977773dbb75c9bd9))
- typings ([57af9a2](https://github.com/chialab/synapse/commit/57af9a245753c677358bbb4d20736844f1d7e763))
- use protected hooks ([44c6153](https://github.com/chialab/synapse/commit/44c61537a5ba055cb9c834001f84637810ba5839))

### Features

- add `isNode` and `isBrowser` methods ([58d197c](https://github.com/chialab/synapse/commit/58d197c8484555e37ab4717afa6965dc355498b5))
- add `onRequest` and `onResponse` hooks ([6792bc8](https://github.com/chialab/synapse/commit/6792bc89f30fd0c333bee94a6c26f348b74647d0))
- add loadScript method ([4fe9148](https://github.com/chialab/synapse/commit/4fe91482a4de41591459b13d421eb816627abe66))
- export types ([2d65145](https://github.com/chialab/synapse/commit/2d65145514ff7539b445c5de1a739a67e423a303))

### Reverts

- Revert "release: 2.4.0" ([bf0b67a](https://github.com/chialab/synapse/commit/bf0b67a1e7940afcfef6f31237c71ebeeb0574ee))
