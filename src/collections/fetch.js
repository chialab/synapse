import { Collection } from '../collection.js';

export class FetchCollection extends Collection {
    model(data, Model) {
        return super.model(null, Model)
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
                    .then((data) => {
                        model.resetChanges();
                        return model.setFromResponse(data)
                    })
            );
    }

    setFromResponse(res) {
        let promises = [];
        if (Array.isArray(res)) {
            promises = res.map((data) => this.model(data));
        }
        return Promise.all(promises);
    }

    execPost(options = {}) {
        return fetch(options.endpoint, options)
            .then((response) => response.json());
    }

    beforePost(options) {
        options.method = options.method || 'POST';
        return Promise.resolve(options);
    }

    afterPost(data) {
        return Promise.resolve(data);
    }

    post(model, options = {}) {
        options.body = options.body || model.toJSON();
        return this.beforePost(options)
            .then(() =>
                this.execPost(options)
                    .then((res) =>
                        this.afterPost(res)
                    )
                    .then((data) => {
                        model.resetChanges();
                        return model.setFromResponse(data)
                    })
            );
    }
}
