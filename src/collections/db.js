import { Database } from '../helpers/db.js';
import { internal } from '../helpers/internal.js';
import { Collection } from '../collection.js';
import { DBModel } from '../models/db.js';

const DBS = {};

export class DBCollection extends Collection {
    static get Entry() {
        return DBModel;
    }

    static get databaseName() {
        return '';
    }

    static get databaseOptions() {
        return undefined;
    }

    entry(data) {
        const Entry = this.constructor.Entry;
        if (data.doc && data.id && data.rev) {
            let res = data.doc;
            res[Entry.key] = data.id;
            res._id = data.id;
            res._rev = data.rev;
            data = res;
        }
        return this.initClass(
            Entry
        ).then((model) =>
            model.setFromResponse(data)
                .then(() => Promise.resolve(data))
            );
    }

    initialize(...args) {
        return super.initialize(...args).then(() => {
            this.database.on('change', (res) => {
                this.findById(res.id)
                    .then((entry) => {
                        this.trigger('change', entry);
                    });
            });
            return Promise.resolve();
        });
    }

    get queries() {
        return {};
    }

    get database() {
        const Ctr = this.constructor;
        const name = Ctr.databaseName;
        if (!internal(Ctr).db) {
            if (!DBS[name]) {
                DBS[name] = new Database(Ctr.databaseName, Ctr.databaseOptions);
            }
            internal(Ctr).db = DBS[name];
        }
        return internal(Ctr).db;
    }

    findById(id) {
        return this.database.findById(id)
            .then((entry) =>
                this.entry(entry).then((model) =>
                    this.fetch(model)
                        .then(() =>
                            Promise.resolve(model)
                        )
                )
            );
    }

    find(query, data, options) {
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

    findAll() {
        return this.database.findAll()
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

    fetch(model) {
        let Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return model.beforeFetch()
            .then(() =>
                this.database.findById(model.getDatabaseId() || model[Entry.key])
                    .then((data) => {
                        model.setResponse(data);
                        return model.afterFetch(data).then(() => {
                            model.setDatabaseTable(this)
                            return model.setFromResponse(data);
                        }).then(() =>
                            Promise.resolve(data)
                        );
                    })
            );
    }

    post(model, syncOptions) {
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
            return Promise.resolve(model);
        }).then((model) => {
            if (syncOptions) {
                return this.put(syncOptions);
            }
            return Promise.resolve(model);
        }).then((model) => {
            model.resetChanges();
            return Promise.resolve(model);
        });
    }

    sync(data = {}) {
        return this.database.sync(data);
    }

    push(data = {}) {
        return this.database.push(data);
    }

    pull(data = {}) {
        return this.database.pull(data);
    }

    destroy() {
        return this.database.destroy()
            .then(() => {
                delete internal(this).db;
                return Promise.resolve();
            });
    }

    empty() {
        return this.database.empty();
    }
}
