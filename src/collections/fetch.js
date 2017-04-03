import { Collection } from '../collection.js';

export class FetchCollection extends Collection {
    entry(data, Entry) {
        return super.entry(null, Entry)
            .then((model) =>
                model.setFromResponse(data)
            );
    }

    execFetch(options = {}) {
        return fetch(options.endpoint, options)
            .then((response) => response.json());
    }

    beforeFetch(options) {
        return Promise.resolve(options);
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }

    fetch(model, options = {}) {
        return this.beforeFetch(options)
            .then((options) =>
                this.execFetch(options)
                    .then((res) =>
                        this.afterFetch(res)
                    )
                    .then((data) =>
                        model.setFromResponse(data)
                    )
            );
    }

    setFromResponse(res) {
        let promise = Promise.resolve();
        if (Array.isArray(res)) {
            res.forEach((data) =>
                promise = promise.then(() =>
                    this.entry(data)
                        .then((model) => this.add(model))
                )
            );
        }
        return promise.then(() => Promise.resolve(this));
    }

    execPost(options = {}) {
        return fetch(options.endpoint, options)
            .then((response) => response.json());
    }

    beforePost(options) {
        options.method = 'POST';
        return Promise.resolve(options);
    }

    afterPost(data) {
        return Promise.resolve(data);
    }

    post(model, options = {}) {
        return this.beforePost(options)
            .then(() =>
                this.execPost(options)
                    .then((res) =>
                        this.afterPost(res)
                    )
                    .then((data) =>
                        model.setFromResponse(data)
                    )
            );
    }
}
