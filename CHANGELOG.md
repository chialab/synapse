# [2.4.0](https://github.com/chialab/synapse/compare/v2.3.11...v2.4.0) (2021-09-29)


### Bug Fixes

* add try catch to node fetch import ([495e51d](https://github.com/chialab/synapse/commit/495e51d86aac0d11bbbb175061cb5b1ae0f99d96))
* correctly escape regexes ([a0c35d2](https://github.com/chialab/synapse/commit/a0c35d2036c5da80cc161028179a88dfd703f80d))
* correctly handle hash ([dcc9ede](https://github.com/chialab/synapse/commit/dcc9eded809d5360c2cf960ea8961fed42c42fe7))
* correctly set previous page ([35bab48](https://github.com/chialab/synapse/commit/35bab485fff072840891cf8d8d59f77449995073))
* force navigation when not using a history object ([fcd7cc7](https://github.com/chialab/synapse/commit/fcd7cc7531bce30d2ea0be9528149f726c6e2ac7))
* handle errored requests as resolved ([2818ae8](https://github.com/chialab/synapse/commit/2818ae8c0b7a304123a2150e0191b64088a23403))
* handle hash ([85b439a](https://github.com/chialab/synapse/commit/85b439a25d5a2c007ba538a5b76a2e5ff5ac8f09))
* handle missing view ([4178d67](https://github.com/chialab/synapse/commit/4178d67959cffc328843d125aee51beaa383edfc))
* history minification ([7664b14](https://github.com/chialab/synapse/commit/7664b1489a4bffaca5d94148cfdc0fa0bef897f4))
* home regex ([c0e6a76](https://github.com/chialab/synapse/commit/c0e6a76210fbf70c6a08bf32ef7801a3b6f45b0b))
* initial route should include search params ([6b42dbe](https://github.com/chialab/synapse/commit/6b42dbe682b416794736b1a44cfb538e0b650e47))
* loadStyleSheet typings ([a2a4be2](https://github.com/chialab/synapse/commit/a2a4be2491976df8884cafcc35108b608dacff39))
* make request uri and Url instance ([0030ae7](https://github.com/chialab/synapse/commit/0030ae73186f4d5dffcf57949be3902475322e07))
* redirect ([4abd42f](https://github.com/chialab/synapse/commit/4abd42f5425a63a128ddcc4d84f70cf136cc5dd3))
* render app ([a48674c](https://github.com/chialab/synapse/commit/a48674c66ecd3ce0bbbe36e37e2bc32f68e567d4))
* start url ([55f1df8](https://github.com/chialab/synapse/commit/55f1df88c71258fc92951c33ccee22847d8cd336))


### Features

* add `meta` field to Response, use title and meta from child response if present ([50eabb5](https://github.com/chialab/synapse/commit/50eabb52effdd666bfb615a81aefb0aeb563c5bf))
* add loadStyleSheet method ([50870c6](https://github.com/chialab/synapse/commit/50870c65c89f42a314deb2fdd1c3c99ffff59aec))
* add request to th app instance ([3d97b28](https://github.com/chialab/synapse/commit/3d97b28daf747b65cdea31c6dfdf8a7b909eaef7))
* add resolve method to router ([84c092e](https://github.com/chialab/synapse/commit/84c092e7dd104849a133d300034de0f73eeab27c))
* error handling ([c7a7429](https://github.com/chialab/synapse/commit/c7a742938643acc5dac99f80968b84de38c5a724))
* handle history ([b24a329](https://github.com/chialab/synapse/commit/b24a3292a1ed9a279049b83a5cd956e1aa64101c))
* imporved support for ssr ([3b34d70](https://github.com/chialab/synapse/commit/3b34d7057a1e43dad7da2a24619d7bb47701d7cc))
* improve subrouting ([b3011c2](https://github.com/chialab/synapse/commit/b3011c254e0b909c11e8f4ab9c6d24234b6a7cb1))
* introduce DocumentMetaMiddleware ([387867f](https://github.com/chialab/synapse/commit/387867f689f2290a861f5d0f1e7c705d10494eb5))
* pass router instance to routes and middlewares methods ([468786b](https://github.com/chialab/synapse/commit/468786b56cb990828590f0c55feae4ae58aefc7b))
* routes and middlewares properties ([66b753f](https://github.com/chialab/synapse/commit/66b753f2fa7d97a0e2290a5f3db2f0f4fbfc1ff5))
