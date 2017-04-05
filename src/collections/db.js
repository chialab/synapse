import { Database } from '../helpers/db.js';
import { internal } from '../helpers/internal.js';
import { DBModel } from '../models/db.js';
import { FetchCollection } from './fetch.js';

const DBS = {};

export class DBCollection extends FetchCollection {
    static get Entry() {
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
                    this.database.findById(res.id)
                        .then((entry) => this.entry(entry))
                        .then((entry) => {
                            this.trigger('change', entry);
                        });
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

    findById(id) {
        return super.findById(id)
            .catch(() => {
                if (this.database) {
                    return this.database.findById(id)
                        .then((entry) =>
                            this.entry(entry)
                        )
                }
                return Promise.reject();
            });
    }

    find(query, data, options) {
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
                            this.entry(entry).then((model) =>
                                this.fetch(model)
                                    .then(() =>
                                        Promise.resolve(model)
                                    )
                            )
                        )
                    )
                );
        }
        return Promise.reject();
    }

    findAll() {
        if (this.database) {
            return this.database.findAll()
                .then((data) => {
                    this.reset();
                    return this.setFromResponse(data);
                });
        }
        return Promise.reject();
    }

    execFetch(model) {
        const Entry = this.constructor.Entry;
        return this.database.findById(model.getDatabaseId() || model[Entry.key]);
    }

    post(model) {
        if (this.database) {
            let Ctr = this.constructor;
            const Entry = Ctr.Entry;
            let savePromise;
            if (model.getDatabaseId()) {
                savePromise = this.database.put(model.toDBData());
            } else {
                let data = model.toJSON();
                if (Entry.key && data[Entry.key]) {
                    data._id = data[Entry.key];
                    savePromise = this.database.put(data);
                } else {
                    savePromise = this.database.post(data);
                }
            }
            return savePromise.then((res) => {
                model.setDatabaseInfo({
                    id: res.id,
                    rev: res.rev,
                });
                model.resetChanges();
                return Promise.resolve(model);
            });
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

    empty() {
        if (this.database) {
            return this.database.empty();
        }
        return Promise.reject();
    }
}
