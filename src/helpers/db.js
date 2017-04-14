import PouchDB from '../vendors/pouchdb.js';
import { CallbackManager } from 'chialab-callback-manager/src/callback-manager.js';
import { internal } from './internal.js';
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

let SUPPORTED = null;

export class Database extends CallbackManager {
    static supported() {
        if (typeof SUPPORTED === 'boolean') {
            return SUPPORTED ? Promise.resolve() : Promise.reject();
        } else if (SUPPORTED instanceof Promise) {
            return SUPPORTED;
        }
        try {
            let db = new PouchDB('browser_test', { skip_setup: true });
            SUPPORTED = db.info()
                .then(() => {
                    SUPPORTED = true;
                    return Promise.resolve();
                }).catch(() => {
                    SUPPORTED = false;
                    return Promise.reject();
                });
            return SUPPORTED;
        } catch(ex) {
            SUPPORTED = false;
            return Promise.reject();
        }
    }

    get queries() {
        return {};
    }

    constructor(name, options = {}) {
        super();
        try {
            this.syncOptions = options.sync || {};
            delete options.sync;
            internal(this).db = new PouchDB(name, options);
            internal(this).db.changes({
                live: true,
                include_docs: true,
            }).on('change', (res) => {
                if (res.id && !res.id.match(/^_design/)) {
                    this.trigger('change', res);
                }
            });
        } catch (ex) {
            this.databaseError = new DBOpeningErrorException(ex);
        }
    }

    info() {
        return internal(this).db.info();
    }

    destroy() {
        return internal(this).db.destroy();
    }

    compact() {
        return internal(this).db.compact();
    }

    empty() {
        let db = internal(this).db;
        return db.allDocs()
            .then((response) => {
                if (response && response.rows) {
                    return Promise.all(
                        response.rows
                            .filter((row) =>
                                !row.id.match(/^_design/)
                            )
                            .map((row) =>
                                db.remove(row.id, row.value.rev)
                            )
                    );
                }
                return Promise.resolve();
            });
    }

    query(query, options) {
        return internal(this).db.query(query, options).then((res) =>
            Promise.resolve(
                (res.rows || []).map((entry) => entry.key)
            )
        );
    }

    sync(options = {}) {
        let opt = prepareOptions(this.syncOptions, options);
        if (opt.url) {
            return internal(this).db.sync(
                opt.url,
                opt
            ).catch((err) => Promise.reject(
                new DBSyncFailedException(internal(this).db, err))
            );
        }
        return new DBSyncFailedException(internal(this).db, 'Missing database remote url.');
    }

    put(data) {
        return internal(this).db.put(data);
    }

    post(data) {
        return internal(this).db.post(data);
    }

    delete(data) {
        return internal(this).db.remove(data);
    }

    push(options = {}) {
        let opt = prepareOptions(this.syncOptions, options);
        if (opt.url) {
            return internal(this).db.replicate(
                opt.url,
                opt
            ).catch((err) =>
                Promise.reject(
                    new DBSyncFailedException(internal(this).db, err)
                )
            );
        }
        return new DBSyncFailedException(internal(this).db, 'Missing database remote url.');
    }

    pull(options = {}) {
        let opt = prepareOptions(this.syncOptions, options);
        if (opt.url) {
            let remote = new Database(opt.url);
            return remote.replicate(
                internal(this).db,
                opt
            ).catch((err) => {
                Promise.reject(
                    new DBSyncFailedException(internal(this).db, err)
                );
            });
        }
        return new DBSyncFailedException(internal(this).db, 'Missing database remote url.');
    }

    find(query, ...args) {
        if (typeof query === 'string') {
            query = this.queries && this.queries[query];
        }
        return internal(this).db.query({
            map: query.call(this, ...args),
        }).then((res) => {
            if (res && res.rows) {
                return Promise.resolve(res.rows);
            }
            return Promise.resolve([]);
        });
    }

    findAll() {
        return internal(this).db
            .allDocs({
                include_docs: true,
            })
            .then((data) => {
                if (data && data.rows) {
                    return Promise.all(
                        data.rows
                            .filter((entry) => !entry.id.match(/^_design/))
                    );
                }
                return Promise.resolve([]);
            });
    }

    findById(id) {
        return internal(this).db.get(id);
    }
}
