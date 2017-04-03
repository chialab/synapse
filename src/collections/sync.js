import { DBCollection } from './db.js';
import { AjaxCollection } from './ajax.js';

export class SyncCollection extends DBCollection {
    execFetch(options) {
        return AjaxCollection.prototype.execFetch.call(this, options).catch(
            () => super.execFetch(options)
        );
    }

    post(model, options) {
        return super.post(model, options).then(
            () => this.sync()
        );
    }

    findById(id) {
        return AjaxCollection.prototype.findById.call(this, id).catch(
            () => super.findById(id)
        );
    }

    findAll(options) {
        return AjaxCollection.prototype.findAll.call(this, options)
            .catch(
                () => super.findAll(options)
            );
    }
}
