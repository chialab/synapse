import PouchDB from 'pouchdb';
import { Model } from '../model.js';

export class LocalModel extends Model {
    constructor() {
        super();
        let ModelCtr = this.constructor;
        if (!ModelCtr.db) {
            ModelCtr.initDB();
        }
        this.__db = ModelCtr.db;
    }

    get dbKey() {
        return this.id;
    }

    fetch() {
        return this.__db.get(this.dbKey).then((data) => {
            this.set(data);
            Promise.resolve(data);
        });
    }

    sync() {
        return this.__db.put(this.toJSON(), this.dbKey);
    }

    static get database() {
        return '';
    }

    static initDB() {
        if (this.database) {
            this.db = new PouchDB(this.database);
            return this.db;
        }
        throw new Error('Missing database name.');
    }
}
