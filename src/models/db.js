import { internal } from '../helpers/internal.js';
import { Model } from '../model.js';

export class DBModel extends Model {
    constructor(data = {}, ...args) {
        let dbInfo = {
            id: data._id,
            rev: data._rev,
        };
        delete data._id;
        delete data._rev;
        super(data, ...args);
        this.setDatabaseInfo(dbInfo);
    }

    setFromResponse(data = {}) {
        if (data._id) {
            this.setDatabaseInfo({
                id: data._id,
                rev: data._rev,
            });
        }
        this.set(data);
        this.resetChanges();
        return Promise.resolve(this);
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

    toDBData() {
        let data = this.toJSON();
        data._id = this.getDatabaseId();
        data._rev = this.getDatabaseRev();
        return data;
    }
}
