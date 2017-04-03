import { Collection } from '../collection.js';
import { AjaxModel } from '../models/ajax.js';

export class AjaxCollection extends Collection {
    static get Entry() {
        return AjaxModel;
    }

    buildEndpoint(model) {
        return `${this.endpoint}/${model.id}`;
    }

    setEntryData(model, data) {
        model.set(data, true);
    }

    execFetch(model, options = {}) {
        return fetch(this.buildEndpoint(model, options), options)
            .then((response) => response.json());
    }

    findAll(options = {}) {
        return this.fetch(options.endpoint || this.endpoint)
            .then((res) => {
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
            });
    }

    fetch(data) {
        let Ctr = this.constructor;
        const Entry = Ctr.Entry;
        let modelPromise = Promise.resolve(data);
        if (!(data instanceof Entry)) {
            modelPromise = this.entry(data);
        }
        return modelPromise.then((model) =>
            model.beforeFetch()
                .then(() =>
                    this.execFetch(model)
                        .then((res) => {
                            model.setResponse(res);
                            return model.afterFetch(res).then((data) => {
                                model.set(data, true);
                                model.resetChanges();
                                return Promise.resolve(data);
                            });
                        })
                )
        );
    }

    findById(id) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return super.findById(id)
            .catch(() =>
                this.entry({ [Entry.key]: id })
                    .then((model) => 
                        this.fetch(model)
                    )
            );
    }

    post(model, options = {}) {
        options.method = 'POST';
        options.body = model.toJSON();
        return fetch(this.buildEndpoint(model, options), options)
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    model.set(data, true);
                }
                model.resetChanges();
                return Promise.resolve(data);
            });
    }
}
