import { Database } from '../helpers/db.js';
import { internal } from '../helpers/internal.js';
import { Model } from '../model.js';
import { DBModel } from './db.js';

const DBS = {};

export class DBTableModel extends Model {
    static get Entry() {
        return DBModel;
    }

    static get databaseName() {
        return '';
    }

    static get databaseOptions() {
        return undefined;
    }

    static get databaseKey() {
        return 'id';
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

    constructor(...args) {
        super(...args);
        this.database.on('change', (res) => {
            this.findById(res.id)
                .then((entry) => {
                    this.trigger('change', entry);
                });
        });
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

    find(query, data, options) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        if (typeof query === 'string') {
            query = {
                map: this.queries[query].call(this, ...data),
            };
        }
        return this.database.query(query, options)
            .then((data) =>
                Promise.all(
                    data.map((entry) => {
                        let res = entry.key;
                        res[Ctr.databaseKey] = entry.id;
                        return this.initClass(Entry, res).then((model) =>
                            this.fetch(model)
                                .then(() =>
                                    Promise.resolve(model)
                                )
                        );
                    })
                )
            );
    }

    findAll() {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return this.database.findAll()
            .then((data) =>
                Promise.all(
                    data.map((entry) => {
                        let res = entry.doc;
                        res[Ctr.databaseKey] = entry.id;
                        return this.initClass(Entry, res).then((model) =>
                            this.fetch(model)
                                .then(() =>
                                    Promise.resolve(model)
                                )
                        );
                    })
                )
            );
    }

    findById(id) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return this.database.findById(id)
            .then((entry) =>
                this.initClass(Entry, entry).then((model) =>
                    this.fetch(model)
                        .then(() =>
                            Promise.resolve(model)
                        )
                )
            );
    }

    findOrCreate(id) {
        const Ctr = this.constructor;
        const Entry = Ctr.Entry;
        return this.findById(id)
            .catch(() =>
                this.initClass(Entry, {
                    [Ctr.databaseKey]: id,
                })
            );
    }

    fetch(model) {
        let Ctr = this.constructor;
        return model.beforeFetch()
            .then(() =>
                this.database.findById(model.getDatabaseId() || model[Ctr.databaseKey])
                    .then((data) => {
                        model.setResponse(data);
                        return model.afterFetch(data).then(() => {
                            model.set(data, true);
                            model.setDatabaseTable(this);
                            model.setDatabaseInfo({
                                id: data._id,
                                rev: data._rev,
                            });
                            model.resetChanges();
                            return Promise.resolve(data);
                        });
                    })
            );
    }

    save(model, syncOptions) {
        let Ctr = this.constructor;
        let savePromise;
        if (model.getDatabaseId()) {
            savePromise = this.put(model.toDBData());
        } else {
            let data = model.toJSON();
            if (Ctr.databaseKey && data[Ctr.databaseKey]) {
                data._id = data[Ctr.databaseKey];
                savePromise = this.put(data);
            } else {
                savePromise = this.post(data);
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

    post(data = {}) {
        return this.database.post(data);
    }

    put(data = {}) {
        return this.database.put(data);
    }

    pull(data = {}) {
        return this.database.pull(data);
    }
}
