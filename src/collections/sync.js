import { DBCollection } from './db.js';
import { AjaxCollection } from './ajax.js';

export class SyncCollection extends DBCollection {
    fetch(model, options) {
        return AjaxCollection.prototype.fetch.call(this, model, options)
            .then((newModel) => {
                if (this.database) {
                    return this.save(newModel, options);
                }
                return Promise.resolve(newModel);
            })
            .catch(() =>
                super.fetch(model, options)
            );
    }

    post(model, options) {
        return AjaxCollection.prototype.post.call(this, model, options)
            .then((newModel) => {
                if (this.database) {
                    this.save(newModel, options);
                }
                return Promise.resolve(newModel);
            });
    }

    save(...args) {
        return super.post(...args);
    }

    findById(id) {
        return AjaxCollection.prototype.findById.call(this, id)
            .catch(() =>
                super.findById(id)
            );
    }

    findAll(options) {
        return AjaxCollection.prototype.findAll.call(this, options)
            .catch(() =>
                super.findAll(options)
            );
    }
}
