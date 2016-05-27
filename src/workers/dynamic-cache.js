(global => {
    'use strict';

    const toolbox = global.toolbox;

    class DynamicCache {
        constructor() {
            this.cacheName = toolbox.options.cache.name;
        }

        listen() {
            global.addEventListener('message', (event) => {
                switch (event.data.command) {
                case 'add_to_cache': {
                    this.add(event.data.url);
                    break;
                }
                case 'remove_from_cache': {
                    this.remove(event.data.url);
                    break;
                }
                default: {
                    break;
                }
                }
            });
        }

        has(url) {
            return caches.open(this.cacheName).then((cache) =>
                cache.keys().then((keys) => {
                    let key;
                    keys.some((cacheValue) => {
                        if (cacheValue.url === url) {
                            key = cacheValue;
                            return true;
                        }
                        return false;
                    });
                    if (key) {
                        return cache.match(key);
                    }
                    return Promise.reject();
                })
            );
        }

        add(url) {
            return this.has(url)
                .catch(() => {
                    toolbox.cache(url).then(() => {
                        // eslint-disable-next-line
                        console.debug('cached', url);
                    });
                    return Promise.resolve();
                });
        }

        remove(url) {
            return this.has(url)
                .then(() => {
                    toolbox.uncache(url).then(() => {
                        // eslint-disable-next-line
                        console.debug('uncached', url);
                    });
                    return Promise.resolve();
                });
        }
    }

    // export
    global.DynamicCache = DynamicCache;
})(self);
