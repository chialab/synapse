import { Database } from '../helpers/db.js';
import { internal } from '../helpers/internal.js';
import { FetchModel } from './fetch.js';

export class DBModel extends FetchModel {
    static get databaseName() {
        return '';
    }

    static get databaseOptions() {
        return undefined;
    }

    static get databaseKey() {
        return 'id';
    }

    static get queries() {
        return {};
    }

    static get database() {
        if (internal(this).db) {
            return internal(this).db;
        }
        internal(this).db = new Database(this.databaseName, this.databaseOptions);
        return internal(this).db;
    }

    static destroy() {
        return this.database.destroy()
            .then(() => {
                delete internal(this).db;
                return Promise.resolve();
            });
    }

    static empty() {
        return this.database.empty();
    }

    static query(query, options) {
        query = this.queries && this.queries[query];
        return this.database.query(query, options).then((res) => {
            res.map((row) => {
                let model = new this();
                model.set(row.value, true);
                model.setDatabaseInfo({
                    id: row.value._id,
                    rev: row.value._rev,
                });
                return model;
            });
            return Promise.resolve(res);
        });
    }

    static sync(data = {}) {
        return this.database.sync(data);
    }

    static push(data = {}) {
        return this.database.push(data);
    }

    static post(data = {}) {
        return this.database.post(data);
    }

    static put(data = {}) {
        return this.database.put(data);
    }

    static pull(data = {}) {
        return this.database.pull(data);
    }

    static _id(id) {
        return id;
    }

    static find(query, ...args) {
        if (query) {
            return this.database.query(query, ...args).then((res) =>
                Promise.all(
                    res.rows.map((row) => {
                        let model = new this();
                        model.set({ id: row.id });
                        return model.fetch().then(() => Promise.resolve(model));
                    })
                )
            );
        }
        return this.database.findAll()
            .then((data) =>
                Promise.all(
                    data.map((entry) => {
                        let model = new this();
                        model.set('id', entry.id);
                        return model.fetch()
                            .then(() => Promise.resolve(model));
                    })
                )
            );
    }

    static getById(id) {
        id = this._id(id);
        let model = new this();
        model.set('id', id);
        return model.fetch()
            .then(() => Promise.resolve(model));
    }

    static getOrCreate(id) {
        return this.getById(id)
            .catch(() => {
                let m = new this();
                m.set('id', id);
                return Promise.resolve(m);
            });
    }

    get id() {
        return internal(this).id;
    }

    set id(id) {
        if (id) {
            id = this.constructor._id(id);
            if (internal(this).id && internal(this).id !== id) {
                throw 'Can not change a Model id. Create a new one instead.';
            }
            internal(this).id = id;
        } else {
            delete internal(this).id;
        }
    }

    beforeFetch() {
        return Promise.resolve();
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }

    fetch(...args) {
        let Ctr = this.constructor;
        return this.beforeFetch(...args).then(() =>
            Ctr.database.getById(this.getDatabaseId() || this[Ctr.databaseKey]).then((data) => {
                this.setResponse(data);
                return this.afterFetch(data).then(() => {
                    this.set(data, true);
                    this.setDatabaseInfo({
                        id: data._id,
                        rev: data._rev,
                    });
                    return Promise.resolve(data);
                });
            })
        );
    }

    setDatabaseInfo(info) {
        internal(this).dbId = info.id;
        internal(this).dbRev = info.rev;
    }

    getDatabaseId() {
        return internal(this).dbId;
    }

    getDatabaseRev() {
        return internal(this).dbRev;
    }

    save(syncOptions) {
        const Ctr = this.constructor;
        if (!Ctr.database) {
            return Promise.reject(Ctr.databaseError);
        }
        return Promise.resolve().then(() => {
            let savePromise;
            if (this.getDatabaseId()) {
                savePromise = this.put(this.toDBData());
            } else {
                let data = this.toJSON();
                if (Ctr.databaseKey && data[Ctr.databaseKey]) {
                    data._id = data[Ctr.databaseKey];
                    savePromise = this.put(data);
                } else {
                    savePromise = this.post(data);
                }
            }
            return savePromise.then((res) => {
                this.setDatabaseInfo({
                    id: res.id,
                    rev: res.rev,
                });
                return Promise.resolve(this);
            });
        }).then((model) => {
            if (syncOptions) {
                return this.put(syncOptions);
            }
            return Promise.resolve(model);
        }).then((model) => {
            this.resetChanges();
            return Promise.resolve(model);
        });
    }

    toDBData() {
        let data = this.toJSON();
        data._id = this.getDatabaseId();
        data._rev = this.getDatabaseRev();
        return data;
    }

    sync(data = {}) {
        let Ctr = this.constructor;
        return Ctr.sync(data);
    }

    pull(data = {}) {
        let Ctr = this.constructor;
        return Ctr.pull(data);
    }

    push(data = {}) {
        let Ctr = this.constructor;
        return Ctr.push(data);
    }

    put(data = {}) {
        let Ctr = this.constructor;
        return Ctr.put(data);
    }

    post(data = {}) {
        let Ctr = this.constructor;
        return Ctr.post(data);
    }
}
