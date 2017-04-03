import { internal } from '../helpers/internal.js';
import { FetchModel } from './fetch.js';

export class DBModel extends FetchModel {
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
        this.setDatabaseInfo({
            id: data._id,
            rev: data._rev,
        });
        return super.setFromResponse(data);
    }

    beforeFetch() {
        return Promise.resolve();
    }

    afterFetch(data) {
        return Promise.resolve(data);
    }

    fetch(...args) {
        return this.getDatabaseTable().fetch(this, ...args);
    }

    setDatabaseTable(table) {
        internal(this).table = table;
    }

    setDatabaseInfo(info) {
        internal(this).dbId = info.id;
        internal(this).dbRev = info.rev;
    }

    getDatabaseTable() {
        return internal(this).table;
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
