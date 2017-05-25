import { internal } from '../helpers/internal.js';
import { Model } from '../model.js';

export class DBModel extends Model {
    constructor(data = {}, ...args) {
        let dbInfo = {};
        if (data) {
            dbInfo = {
                id: data._id,
                rev: data._rev,
            };
            delete data._id;
            delete data._rev;
        }
        super(data, ...args);
        this.setDatabaseInfo(dbInfo);
    }

    setFromResponse(data = {}) {
        if (data) {
            if (data._id) {
                this.setDatabaseInfo({
                    id: data._id,
                    rev: data._rev,
                });
                delete data._id;
                delete data._rev;
            }
            if (data._deleted) {
                internal(this).deleted = true;
                delete data._deleted;
            }
            this.set(data, { validate: false });
            this.resetChanges();
        }
        return Promise.resolve(this);
    }

    isDeleted() {
        return !!internal(this).deleted;
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
        if (this.getDatabaseId()) {
            data._id = this.getDatabaseId();
            data._rev = this.getDatabaseRev();
        }
        return data;
    }
}
