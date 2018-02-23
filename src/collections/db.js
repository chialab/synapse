import { Database } from '../helpers/db.js';
import { internal } from '../helpers/internal.js';
import { DBModel } from '../models/db.js';
import { FetchCollection } from './fetch.js';

const DBS = {};

export class DBCollection extends FetchCollection {
    static get Model() {
        return DBModel;
    }

    static get databaseName() {
        return undefined;
    }

    static get databaseOptions() {
        return undefined;
    }

    initialize(...args) {
        return super.initialize(...args).then(() => {
            if (this.database) {
                this.database.on('change', (res) => {
                    if (res.deleted) {
                        this.model(res.doc)
                            .then((entry) => {
                                this.trigger('remote', entry);
                            });
                    } else {
                        this.database.findById(res.id)
                            .then((entry) => this.model(entry))
                            .then((entry) => {
                                this.trigger('remote', entry);
                            });
                    }
                });
            }
            return Promise.resolve();
        });
    }

    get queries() {
        return {};
    }

    get database() {
        const Ctr = this.constructor;
        if (!internal(Ctr).db) {
            const name = Ctr.databaseName;
            if (name) {
                if (!DBS[name]) {
                    DBS[name] = new Database(Ctr.databaseName, Ctr.databaseOptions);
                }
                internal(Ctr).db = DBS[name];
            }
        }
        return internal(Ctr).db;
    }

    model(data, ...args) {
        let id = data && data._id;
        let rev = data && data._rev;
        return super.model(data, ...args).then((model) => {
            if (id && rev) {
                model.setDatabaseInfo({
                    id,
                    rev,
                });
            }
            return model;
        });
    }

    findById(id) {
        return super.findById(id)
            .catch(() => {
                if (this.database) {
                    return this.database.findById(id)
                        .then((entry) =>
                            this.model(entry)
                        );
                }
                return Promise.reject();
            });
    }

    find(query, data, options) {
        if (!Array.isArray(data)) {
            options = data;
            data = [];
        }
        if (this.database) {
            if (typeof query === 'string') {
                query = {
                    map: this.queries[query].call(this, ...data),
                };
            }
            return this.database.query(query, options)
                .then((data) =>
                    Promise.all(
                        data.map((entry) =>
                            this.model(entry)
                        )
                    )
                );
        }
        return Promise.reject();
    }

    findAll() {
        if (this.database) {
            return this.database.findAll()
                .then((data) =>
                    this.setFromResponse(data)
                        .then((models) => {
                            this.reset();
                            this.add(...models);
                        })
                );
        }
        return Promise.reject();
    }

    execFetch(model) {
        const Model = this.constructor.Model;
        return this.database.findById(model.getDatabaseId() || model[Model.key]);
    }

    post(model) {
        if (this.database) {
            let Ctr = this.constructor;
            const Model = Ctr.Model;
            let data = model.toDBData();
            let savePromise;
            if (model.getDatabaseId()) {
                savePromise = this.database.put(data);
            } else {
                if (Model.key && data[Model.key]) {
                    data._id = data[Model.key];
                    savePromise = this.database.put(data);
                } else {
                    savePromise = this.database.post(data);
                }
            }
            return savePromise.then((res) => {
                model.resetChanges();
                model.setDatabaseInfo({
                    id: res.id,
                    rev: res.rev,
                });
                return Promise.resolve(model);
            });
        }
        return Promise.reject();
    }

    delete(model) {
        if (this.database) {
            if (model.getDatabaseId()) {
                return this.database.delete({
                    _id: model.getDatabaseId(),
                    _rev: model.getDatabaseRev(),
                });
            }
            return Promise.reject();
        }
        return Promise.reject();
    }

    sync(data = {}) {
        if (this.database) {
            return this.database.sync(data);
        }
        return Promise.reject();
    }

    push(data = {}) {
        if (this.database) {
            return this.database.push(data);
        }
        return Promise.reject();
    }

    pull(data = {}) {
        if (this.database) {
            return this.database.pull(data);
        }
        return Promise.reject();
    }

    destroy() {
        if (this.database) {
            return this.database.destroy()
                .then(() => {
                    delete internal(this).db;
                    return Promise.resolve();
                });
        }
        return Promise.reject();
    }

    compact() {
        if (this.database) {
            return this.database.compact();
        }
        return Promise.reject();
    }

    empty() {
        if (this.database) {
            return this.database.empty();
        }
        return Promise.reject();
    }
}
