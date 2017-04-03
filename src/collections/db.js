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
        return '';
    }

    static get databaseOptions() {
        return undefined;
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
        return super.findById(id)
            .catch(() =>
                this.database.findById(id)
                    .then((entry) =>
                        this.entry(entry)
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
                this.setFromResponse(data)
            );
    }

    execFetch(model) {
        const Entry = this.constructor.Entry;
        return this.database.findById(model.getDatabaseId() || model[Entry.key]);
    }

    post(model, options) {
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
            if (options) {
                return this.put(options);
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
