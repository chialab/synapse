export class CacheHelper {
    constructor(serviceWorkerUrl, serviceWorkerOptions = {}) {
        // Register service worker if supported.
        if ('serviceWorker' in navigator) {
            this.opening = true;
            this.ready = new Promise((resolve, reject) => {
                navigator.serviceWorker.register(serviceWorkerUrl, serviceWorkerOptions)
                    .then((registration) => {
                        let worker = registration.installing ||
                            registration.waiting ||
                            registration.active;

                        delete this.opening;
                        this.worker = worker;
                        resolve();
                        // eslint-disable-next-line
                        console.debug('Service Worker registered.', registration);
                    })
                    .catch((error) => {
                        delete this.opening;
                        reject();
                        // eslint-disable-next-line
                        console.debug('Service Worker failed to register.', error);
                    });
            });
        } else {
            this.ready = Promise.reject();
        }
    }

    add(url) {
        return this.ready.then(() => {
            this.worker.postMessage({
                command: 'add_to_cache',
                url,
            });
            return Promise.resolve();
        });
    }

    remove(url) {
        return this.ready.then(() => {
            this.worker.postMessage({
                command: 'remove_from_cache',
                url,
            });
            return Promise.resolve();
        });
    }
}
