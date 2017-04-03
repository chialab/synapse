import { DBCollection } from './db.js';
import { AjaxCollection } from './ajax.js';

export class SyncCollection extends DBCollection {
    fetch(...args) {
        return AjaxCollection.prototype.fetch.call(this, ...args).then(
            () => this.sync(),
            () => super.fetch.call(this, ...args)
        );
    }

    post(...args) {
        return AjaxCollection.prototype.post.call(this, ...args).then(
            () => this.sync(),
            () => super.post.call(this, ...args)
        );
    }

    findAll(...args) {
        return AjaxCollection.prototype.findAll.call(this, ...args).then(
            () => this.sync(),
            () => super.fetch.call(this, ...args)
        );
    }
}
