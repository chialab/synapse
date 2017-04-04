import { DBCollection } from './db.js';
import { AjaxCollection } from './ajax.js';

export class SyncCollection extends DBCollection {
    execFetch(options) {
        return AjaxCollection.prototype.execFetch.call(this, options)
            .then(() =>
                this.save()
            )
            .catch(() =>
                super.execFetch(options)
            );
    }

    post(model, options) {
        return AjaxCollection.prototype.post.call(this, model, options).then(
            () => this.save()
        );
    }

    save(...args) {
        return super.post(...args);
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
