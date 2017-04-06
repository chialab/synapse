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

    save(model, options) {
        return super.post(model, options);
    }

    findById(id) {
        let save = (newModel) => {
            if (this.database) {
                return this.save(newModel)
                    .then(() =>
                        Promise.resolve(newModel)
                    );
            }
            return Promise.resolve(newModel);
        };
        return super.findById(id)
            .then((model) =>
                AjaxCollection.prototype.fetch.call(this, model)
                    .then(save)
                    .catch(() =>
                        Promise.resolve(model)
                    )
            )
            .catch(() =>
                AjaxCollection.prototype.findById.call(this, id)
                    .then(save)
            );
    }

    findOrCreate(id) {
        return super.findById(id)
            .catch(() =>
                AjaxCollection.prototype.findOrCreate.call(this, id)
            );
    }

    findAll(options) {
        return AjaxCollection.prototype.findAll.call(this, options)
            .catch(() =>
                super.findAll(options)
            );
    }
}
