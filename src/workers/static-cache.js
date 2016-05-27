(global => {
    'use strict';

    const toolbox = global.toolbox;

    class StaticCache {
        constructor(baseUrl) {
            this.cacheName = toolbox.options.cache.name;
            this.baseUrl = baseUrl;
            toolbox.cache(baseUrl);
        }

        listen() {
            global.addEventListener('fetch', (event) => {
                if (event.request.method === 'GET') {
                    event.respondWith(
                        this.fetchBootstrap(event)
                    );
                }
            });
        }

        indexFallback(event, cache) {
            return cache.keys().then((keys) => {
                let key;
                keys.some((cacheValue) => {
                    if (cacheValue.url === this.baseUrl) {
                        key = cacheValue;
                        return true;
                    }
                    return false;
                });
                return cache.match(key).then((indexResponse) => {
                    if (indexResponse && indexResponse.ok) {
                        return Promise.resolve(indexResponse);
                    }
                    return Promise.reject();
                });
            });
        }

        cacheFallback(event) {
            return caches.open(this.cacheName).then((cache) =>
                cache.match(event.request)
                    .then((cacheResponse) => {
                        if (cacheResponse) {
                            return Promise.resolve(cacheResponse);
                        }
                        return this.indexFallback(event, cache);
                    })
                    .catch(() => this.indexFallback(event, cache))
            );
        }

        fetchBootstrap(event) {
            return Promise.resolve(
                fetch(event.request)
                    .then((response) => {
                        if (response && response.ok) {
                            return Promise.resolve(response);
                        }
                        return this.cacheFallback(event);
                    })
                    .catch(() => this.cacheFallback(event))
            );
        }
    }

    // export
    global.StaticCache = StaticCache;
})(self);
