import { DBCollection } from './db.js';
import { AjaxCollection } from './ajax.js';

export class SyncCollection extends DBCollection {
    execFetch(...args) {
        return AjaxCollection.prototype.execFetch.call(this, ...args).then(
            () => this.sync(),
            () => super.execFetch(...args)
        );
    }

    post(...args) {
        return super.post(...args).then(
            () => this.sync()
        );
    }

    findById(...args) {
        return AjaxCollection.prototype.findById.call(this, ...args).then(
            () => this.sync(),
            () => super.findById(...args)
        );
    }

    findAll(...args) {
        return AjaxCollection.prototype.findAll.call(this, ...args)
            .catch(
                (err) => console.error(err) || super.findAll(...args)
            );
    }
}
