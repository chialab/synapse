import PouchDB from 'pouchdb/dist/pouchdb.js';
import { internal } from '../helpers/internal.js';
import { FetchModel } from './fetch.js';
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
            Ctr.database.get(this.getDatabaseId()).then((data) => {
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
        let Ctr = this.constructor;
        if (!Ctr.database) {
            return Promise.reject(Ctr.databaseError);
        }
        return Promise.resolve().then(() => {
            let savePromise;
            if (this.getDatabaseId()) {
                savePromise = Ctr.database.put(this.toDBData());
            } else {
                savePromise = Ctr.database.post(this.toJSON());
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
                return this.push(syncOptions);
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
