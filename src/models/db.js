import PouchDB from 'pouchdb/pouchdb';
import { Model } from '../model.js';
import { DBOpeningErrorException } from '../exceptions/db-opening-error.js';
import { DBSyncFailedException } from '../exceptions/db-sync-failed.js';

function prepareOptions(defaults = {}, options = {}) {
    let opt = {};
    if (typeof defaults === 'object') {
        for (let k in defaults) {
            if (defaults.hasOwnProperty(k)) {
                opt[k] = defaults[k];
            }
        }
    }
    if (typeof options === 'object') {
        for (let k in options) {
            if (options.hasOwnProperty(k)) {
                opt[k] = options[k];
            }
        }
    }
    return opt;
}

export class DBModel extends Model {
    static get databaseName() {
        return '';
    }

    static get databaseOptions() {
        return undefined;
    }

    static get databaseKey() {
        return 'id';
    }

    static get database() {
        if (this.__db) {
            return this.__db;
        }
        try {
            this.__db = new PouchDB(this.databaseName, this.databaseOptions);
            return this.__db;
        } catch (ex) {
            this.databaseError = new DBOpeningErrorException(ex);
        }
        return null;
    }

    static query(query, options) {
        if (!this.database) {
            return Promise.reject(this.databaseError);
        }
        return this.database.query(query, options).then((res) => {
            res = res.rows.map((row) => {
                let model = new this();
                model.set(row.key);
                return model;
            });
            return Promise.resolve(res);
        });
    }

    static sync(options = {}) {
        if (!this.database) {
            return Promise.reject(this.databaseError);
        }
        let opt = prepareOptions(this.databaseSyncOptions, options);
        if (opt.url) {
            return this.database.sync(
                opt.url,
                opt
            ).catch((err) => Promise.reject(
                new DBSyncFailedException(this.database, err))
            );
        }
        return new DBSyncFailedException(this.database, 'Missing database remote url.');
    }

    static push(options = {}) {
        if (!this.database) {
            return Promise.reject(this.databaseError);
        }
        let opt = prepareOptions(this.databaseSyncOptions, options);
        if (opt.url) {
            return this.database.replicate(
                opt.url,
                opt
            ).catch((err) => {
                Promise.reject(
                    new DBSyncFailedException(this.database, err)
                );
            });
        }
        return new DBSyncFailedException(this.database, 'Missing database remote url.');
    }

    static pull(options = {}) {
        if (!this.database) {
            return Promise.reject(this.databaseError);
        }
        let opt = prepareOptions(this.databaseSyncOptions, options);
        if (opt.url) {
            let remote = new PouchDB(opt.url);
            return remote.replicate(
                this.database,
                opt
            ).catch((err) => {
                Promise.reject(
                    new DBSyncFailedException(this.database, err)
                );
            });
        }
        return new DBSyncFailedException(this.database, 'Missing database remote url.');
    }

    get fetchOptions() {
        return {};
    }

    beforeFetch() {
        return Promise.resolve();
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }

    fetch(...args) {
        let Ctr = this.constructor;
        if (!Ctr.database) {
            return Promise.reject(Ctr.databaseError);
        }
        return this.beforeFetch(...args).then(() =>
            Ctr.database.get(this[Ctr.databaseKey]).then((data) =>
                this.afterFetch(data).then(() => {
                    this.set(data);
                    return Promise.resolve(data);
                })
            )
        );
    }

    setDatabaseId(val) {
        let Ctr = this.constructor;
        this.set(Ctr.databaseKey, val);
    }

    save(syncOptions) {
        let Ctr = this.constructor;
        if (!Ctr.database) {
            return Promise.reject(Ctr.databaseError);
        }
        return Promise.resolve().then(() => {
            if (this[Ctr.databaseKey]) {
                return Ctr.database.put(this.toJSON(), this[Ctr.databaseKey]);
            }
            return Ctr.database.post(this.toJSON()).then((res) => {
                this[Ctr.databaseKey] = res.id;
                return Promise.resolve();
            });
        }).then(() => {
            if (syncOptions) {
                return this.push(syncOptions);
            }
            return Promise.resolve();
        });
    }

    sync(options = {}) {
        let Ctr = this.constructor;
        return Ctr.sync(options);
    }

    pull(options = {}) {
        let Ctr = this.constructor;
        return Ctr.pull(options);
    }

    push(options = {}) {
        let Ctr = this.constructor;
        return Ctr.push(options);
    }
}
